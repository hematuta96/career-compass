import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("career_compass.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    role TEXT,
    portfolio_link TEXT,
    skills TEXT,
    readiness_score INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const app = express();
app.use(express.json());

const ROLE_SKILLS: Record<string, string[]> = {
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Git", "API Integration", "Responsive Design"],
  "Software Engineer": ["JavaScript", "Git", "API Integration", "React"],
  "Data Analyst": ["JavaScript", "API Integration", "Git"],
  "UI/UX Designer": ["HTML", "CSS", "Responsive Design"],
};

const COURSES: Record<string, any> = {
  "HTML": { name: "HTML Mastery", platform: "Coursera", duration: "2 hours", link: "https://www.coursera.org/learn/html" },
  "CSS": { name: "CSS Layouts", platform: "Udemy", duration: "4 hours", link: "https://www.udemy.com/course/css-layouts/" },
  "JavaScript": { name: "Modern JS", platform: "FreeCodeCamp", duration: "10 hours", link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
  "React": { name: "React Basics", platform: "Coursera", duration: "6 hours", link: "https://www.coursera.org/learn/react-basics" },
  "Git": { name: "Git Version Control", platform: "LinkedIn Learning", duration: "3 hours", link: "https://www.linkedin.com/learning/git-essential-training" },
  "API Integration": { name: "Working with APIs", platform: "Pluralsight", duration: "5 hours", link: "https://www.pluralsight.com/courses/working-with-apis" },
  "Responsive Design": { name: "Mobile First Design", platform: "Google", duration: "4 hours", link: "https://grow.google/certificates/ux-design/" },
};

// Auth Endpoints
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  try {
    const info = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, password);
    res.json({ success: true, userId: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message.includes("UNIQUE") ? "Email already exists" : "Signup failed" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
  if (user) {
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/api/analyze", (req, res) => {
  const { userId, role, portfolioLink, skills } = req.body;
  
  let targetRole = role;
  let suggestedRole = null;

  // Career Suggestion Mode
  if (role === "Not thought yet") {
    // Simple logic: find role with most skill overlap
    let maxOverlap = -1;
    for (const [r, reqSkills] of Object.entries(ROLE_SKILLS)) {
      const overlap = skills.filter((s: string) => reqSkills.includes(s)).length;
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        suggestedRole = r;
      }
    }
    targetRole = suggestedRole || "Frontend Developer";
  }

  const requiredSkills = ROLE_SKILLS[targetRole] || [];
  const userSkills = skills.filter((s: string) => requiredSkills.includes(s));
  const missingSkills = requiredSkills.filter((s: string) => !skills.includes(s));
  
  const readinessScore = Math.round((userSkills.length / requiredSkills.length) * 100);

  const recommendations = missingSkills.map(skill => ({
    skill,
    ...COURSES[skill]
  }));

  // Store analysis
  db.prepare("INSERT INTO analysis (user_id, role, portfolio_link, skills, readiness_score) VALUES (?, ?, ?, ?, ?)")
    .run(userId, targetRole, portfolioLink, JSON.stringify(skills), readinessScore);

  res.json({
    success: true,
    role: targetRole,
    suggested: role === "Not thought yet",
    readinessScore,
    missingSkills,
    recommendations
  });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
