import React, { useState, useEffect } from "react";

type Page = "landing" | "login" | "signup" | "dashboard" | "results";

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface Course {
  skill: string;
  name: string;
  platform: string;
  duration: string;
  link: string;
}

interface AnalysisResult {
  role: string;
  readinessScore: number;
  missingSkills: string[];
  recommendations: Course[];
}

const REQUIRED_SKILLS = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Git",
  "API Integration",
  "Responsive Design"
];

const SKILLS_LIST = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Git",
  "API Integration",
  "Responsive Design"
];

const COURSE_MAP: Record<string, Course> = {
  React: {
    skill: "React",
    name: "React Basics",
    platform: "Coursera",
    duration: "6 hours",
    link: "https://www.coursera.org/learn/react-basics"
  },
  Git: {
    skill: "Git",
    name: "Git & GitHub",
    platform: "Coursera",
    duration: "4 hours",
    link: "https://www.coursera.org/learn/introduction-git-github"
  },
  "API Integration": {
    skill: "API Integration",
    name: "REST API Development",
    platform: "Coursera",
    duration: "5 hours",
    link: "https://www.coursera.org/learn/rest-api"
  }
};

export default function App() {

  const [page, setPage] = useState<Page>("landing");
  const [user, setUser] = useState<UserData | null>(null);

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [analysisForm, setAnalysisForm] = useState({
    role: "Frontend Developer",
    portfolioLink: "",
    selectedSkills: [] as string[]
  });

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cc_user");
    if (saved) {
      setUser(JSON.parse(saved));
      setPage("dashboard");
    }
  }, []);

  const handleAuth = (type: "login" | "signup") => {

    if (type === "signup") {
      const newUser = {
        id: Date.now(),
        name: authForm.name,
        email: authForm.email,
        password: authForm.password
      };

      localStorage.setItem("cc_user", JSON.stringify(newUser));
      setUser(newUser);
      setPage("dashboard");
      return;
    }

    const stored = localStorage.getItem("cc_user");

    if (!stored) {
      setError("No account found. Please sign up first.");
      return;
    }

    const existing = JSON.parse(stored);

    if (
      existing.email === authForm.email &&
      existing.password === authForm.password
    ) {
      setUser(existing);
      setPage("dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  const toggleSkill = (skill: string) => {
    setAnalysisForm(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const handleAnalyze = async () => {

    if (!user) return;

    setLoading(true);

    try {

      let detectedSkills = [...analysisForm.selectedSkills];

      const match = analysisForm.portfolioLink.match(
        /github\.com\/([^\/]+)\/([^\/]+)/
      );

      if (match) {

        const owner = match[1];
        const repo = match[2];

        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/languages`
        );

        const languages = await res.json();

        const map: any = {
          JavaScript: "JavaScript",
          HTML: "HTML",
          CSS: "CSS",
          TypeScript: "JavaScript"
        };

        const repoSkills = Object.keys(languages)
          .map(lang => map[lang])
          .filter(Boolean);

        detectedSkills = [...new Set([...detectedSkills, ...repoSkills])];
      }

      const score = Math.round(
        (detectedSkills.length / REQUIRED_SKILLS.length) * 100
      );

      const missingSkills = REQUIRED_SKILLS.filter(
        s => !detectedSkills.includes(s)
      );

      const recommendations = missingSkills
        .map(skill => COURSE_MAP[skill])
        .filter(Boolean);

      setResult({
        role: analysisForm.role,
        readinessScore: score,
        missingSkills,
        recommendations
      });

      setPage("results");

    } catch (err) {
      setError("Analysis failed.");
    }

    setLoading(false);
  };

  if (page === "landing") {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h1>Career Compass</h1>
        <p>Analyze your readiness for your dream job</p>

        <button onClick={() => setPage("login")}>Login</button>
        <button onClick={() => setPage("signup")}>Signup</button>
      </div>
    );
  }

  if (page === "login" || page === "signup") {
    return (
      <div style={{ maxWidth: 400, margin: "auto" }}>
        <h2>{page === "login" ? "Login" : "Signup"}</h2>

        {page === "signup" && (
          <input
            placeholder="Name"
            value={authForm.name}
            onChange={e =>
              setAuthForm({ ...authForm, name: e.target.value })
            }
          />
        )}

        <input
          placeholder="Email"
          value={authForm.email}
          onChange={e =>
            setAuthForm({ ...authForm, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={e =>
            setAuthForm({ ...authForm, password: e.target.value })
          }
        />

        <button onClick={() => handleAuth(page)}>
          {page === "login" ? "Login" : "Create Account"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  if (page === "dashboard") {
    return (
      <div style={{ padding: 40 }}>
        <h2>Dashboard</h2>

        <input
          placeholder="GitHub repo link"
          value={analysisForm.portfolioLink}
          onChange={e =>
            setAnalysisForm({
              ...analysisForm,
              portfolioLink: e.target.value
            })
          }
        />

        <h3>Select Skills</h3>

        {SKILLS_LIST.map(skill => (
          <button key={skill} onClick={() => toggleSkill(skill)}>
            {skill}
          </button>
        ))}

        <br />

        <button onClick={handleAnalyze}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    );
  }

  if (page === "results" && result) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Role: {result.role}</h2>

        <h1>{result.readinessScore}% Ready</h1>

        <h3>Missing Skills</h3>
        <ul>
          {result.missingSkills.map(skill => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>

        <h3>Recommended Courses</h3>

        {result.recommendations.map(course => (
          <div key={course.name}>
            <b>{course.name}</b>
            <p>{course.platform}</p>
            <a href={course.link} target="_blank">
              Open Course
            </a>
          </div>
        ))}

        <button onClick={() => setPage("dashboard")}>
          Back
        </button>
      </div>
    );
  }

  return null;
}