import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Github, 
  Briefcase,
  ChevronRight,
  BookOpen,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'results';

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface AnalysisResult {
  role: string;
  suggested: boolean;
  readinessScore: number;
  missingSkills: string[];
  recommendations: Array<{
    skill: string;
    name: string;
    platform: string;
    duration: string;
    link: string;
  }>;
}

const SKILLS_LIST = [
  "HTML", "CSS", "JavaScript", "React", "Git", "API Integration", "Responsive Design"
];

const ROLES_LIST = [
  "Frontend Developer", "Software Engineer", "Data Analyst", "UI/UX Designer", "Not thought yet"
];

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [analysisForm, setAnalysisForm] = useState({
    role: 'Frontend Developer',
    portfolioLink: '',
    selectedSkills: [] as string[]
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('cc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPage('dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cc_user');
    setUser(null);
    setPage('landing');
  };

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.success) {
        const userData = type === 'signup' ? { id: data.userId, ...authForm } : data.user;
        setUser(userData);
        localStorage.setItem('cc_user', JSON.stringify(userData));
        setPage('dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const requiredSkills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Git",
  "API",
  "Responsive"
];

const userSkills = analysisForm.selectedSkills;

const score = Math.round((userSkills.length / requiredSkills.length) * 100);

const missing = requiredSkills.filter(
  skill => !userSkills.includes(skill)
);

const data = {
  success: true,
  score: score,
  missingSkills: missing,
  role: analysisForm.role,
  suggested: true,
  recommendations: []
};

setResult(data);
setPage('results');
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('landing')}>
            <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Career Compass
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage('login')}
                  className="px-4 py-2 text-sm font-medium hover:text-white transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => setPage('signup')}
                  className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {page === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Navigate Your <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Dream Career
                </span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Analyze your skills, identify gaps, and get personalized course recommendations to become job-ready in weeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setPage('signup')}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  Start Your Journey <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setPage('login')}
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  View Demo
                </button>
              </div>
              
              <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: LayoutDashboard, title: "Skill Analysis", desc: "Compare your current skills with industry requirements." },
                  { icon: Briefcase, title: "Role Matching", desc: "Find the perfect role based on your existing expertise." },
                  { icon: BookOpen, title: "Learning Paths", desc: "Get curated courses to bridge your knowledge gaps." }
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-emerald-500/50 transition-colors group">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {(page === 'login' || page === 'signup') && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto mt-12"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold mb-2 text-center">
                  {page === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-400 text-center mb-8">
                  {page === 'login' ? 'Enter your details to continue' : 'Join thousands of career-ready students'}
                </p>
                
                <div className="space-y-4">
                  {page === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                      <input 
                        type="text"
                        value={authForm.name}
                        onChange={e => setAuthForm({...authForm, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                    <input 
                      type="email"
                      value={authForm.email}
                      onChange={e => setAuthForm({...authForm, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                    <input 
                      type="password"
                      value={authForm.password}
                      onChange={e => setAuthForm({...authForm, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}

                  <button 
                    onClick={() => handleAuth(page as 'login' | 'signup')}
                    disabled={loading}
                    className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Processing...' : (page === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </div>
                
                <p className="mt-6 text-center text-slate-400 text-sm">
                  {page === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => setPage(page === 'login' ? 'signup' : 'login')}
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    {page === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {page === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Career Dashboard</h2>
                  <p className="text-slate-400">Analyze your readiness for your next role</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Portfolio Section */}
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Github className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold">Portfolio & Resume</h3>
                  </div>
                  <input 
                    type="url"
                    value={analysisForm.portfolioLink}
                    onChange={e => setAnalysisForm({...analysisForm, portfolioLink: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="GitHub link / Portfolio website / Drive resume link"
                  />
                </div>

                {/* Role Selection */}
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Briefcase className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold">Target Role</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ROLES_LIST.map(role => (
                      <button
                        key={role}
                        onClick={() => setAnalysisForm({...analysisForm, role})}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          analysisForm.role === role 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Selection */}
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Trophy className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold">Your Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {SKILLS_LIST.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                          analysisForm.selectedSkills.includes(skill)
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {analysisForm.selectedSkills.includes(skill) && <CheckCircle2 className="w-4 h-4" />}
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={loading || !analysisForm.portfolioLink}
                  className="w-full py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? 'Analyzing Portfolio...' : 'Analyze My Readiness'}
                </button>
              </div>
            </motion.div>
          )}

          {page === 'results' && result && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setPage('dashboard')}
                className="mb-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Score Card */}
                <div className="md:col-span-2 bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Analysis Result</h3>
                      <p className="text-slate-400">
                        {result.suggested ? 'Based on your skills, we suggest:' : 'Target Role:'} 
                        <span className="text-emerald-400 font-semibold ml-1">{result.role}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-emerald-400">{result.readinessScore}%</span>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Ready</p>
                    </div>
                  </div>

                  <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-12">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.readinessScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${
                        result.readinessScore > 70 ? 'from-emerald-500 to-cyan-500' : 
                        result.readinessScore > 40 ? 'from-yellow-500 to-orange-500' : 
                        'from-red-500 to-pink-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Missing Skills</h4>
                      <div className="flex flex-wrap gap-3">
                        {result.missingSkills.length > 0 ? result.missingSkills.map(skill => (
                          <span key={skill} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {skill}
                          </span>
                        )) : (
                          <span className="text-emerald-400 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> You have all the core skills!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
                    <h4 className="text-emerald-400 font-bold mb-2">Pro Tip</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Focus on <span className="text-white font-bold">{result.missingSkills[0] || 'advanced projects'}</span> next to increase your readiness score by 15%.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h4 className="text-slate-400 font-bold mb-2">Portfolio Feedback</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Your portfolio link is being scanned. Ensure your best work is highlighted at the top.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-8">Recommended Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.recommendations.map((course, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                          {course.skill}
                        </span>
                        <span className="text-xs text-slate-500">{course.duration}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-1 group-hover:text-emerald-400 transition-colors">{course.name}</h4>
                      <p className="text-sm text-slate-400 mb-6">{course.platform}</p>
                      <a 
                        href={course.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                      >
                        Enroll Now <ExternalLink className="w-4 h-4" />
                      </a>
                    </motion.div>
                  ))}
                  {result.recommendations.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                      <Trophy className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
                      <p className="text-slate-400">No recommendations needed. You're fully prepared!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-slate-400">Career Compass</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Contact Support</a>
          </div>
          <p className="text-sm text-slate-600">© 2026 Career Compass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
