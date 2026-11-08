import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";
import { ALL_EXAM_TARGETS, EXAM_TARGET_LABELS, SUBJECT_LABELS } from "../constants.js";
import ThemeToggle from "../ThemeToggle.jsx";
import Logo from "../components/Logo.jsx";

// ---------- Countdown Hook ----------
function useCountdown(targetDate) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!targetDate) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: diff === 0 };
}

const LEGENDS = [
  { quote: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", field: "Inventor & Scientist", icon: "💡" },
  { quote: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie", field: "Physicist & Chemist", icon: "⚛️" },
  { quote: "If I have seen further it is by standing on the shoulders of Giants.", author: "Isaac Newton", field: "Mathematician & Physicist", icon: "🍎" },
  { quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", author: "Albert Einstein", field: "Theoretical Physicist", icon: "🌌" }
];

const AVATAR_MAP = {
  "avatar_hacker": "👨‍💻", "avatar_robot": "🤖", "avatar_alien": "👽", "avatar_ninja": "🥷", "avatar_samurai": "⚔️",
  "avatar_pilot": "🚀", "avatar_astronaut": "👨‍🚀", "avatar_doctor": "👨‍⚕️", "avatar_scientist": "👨‍🔬", "avatar_wizard": "🧙‍♂️",
  "avatar_vampire": "🧛", "avatar_werewolf": "🐺", "avatar_gorilla": "🦍", "avatar_dragon": "🐉", "avatar_tiger": "🐯",
  "avatar_lion": "🦁", "avatar_eagle": "🦅", "avatar_phoenix": "🔥", "avatar_ghost": "👻", "avatar_king": "👑",
};

// ---------- Real Brand SVG Icons ----------
const SocialIcons = {
  Instagram: ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  TikTok: ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  Facebook: ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={color}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
    </svg>
  ),
  Telegram: ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={color}>
      <path d="M22 3 2 10.5l6.75 2.5L18 7l-7.5 8.25.25 5.25 3-3.75 5.75 4L22 3z" />
    </svg>
  ),
  Threads: ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.5 0 9-3.5 9-10S17.5 2 12 2 3 5.5 3 12s3.5 10 9 10z" opacity="0.15" />
      <path d="M8.5 14c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5-1.5-5.5-3.5-5.5S8.5 10 8.5 12c0 3 1.5 5 3.5 5s3.5-2 3.5-4" />
    </svg>
  ),
  WhatsApp: ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  ),
  Gmail: ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={color}>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  ),
};

const HoverCard = ({ children, className, style, onClick }) => (
  <div 
    className={`card ${className || ""}`} 
    onClick={onClick}
    style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", cursor: onClick ? "pointer" : "default", ...style }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
      e.currentTarget.style.borderColor = "var(--mk-accent)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.borderColor = style?.borderColor || "var(--mk-border)";
    }}
  >
    {children}
  </div>
);

export default function HomePage() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  
  const [champ, setChamp] = useState(null);
  const [champLoading, setChampLoading] = useState(true);
  const [ticker, setTicker] = useState([]);

  const [studentLb, setStudentLb] = useState(null);
  const [schoolLb, setSchoolLb] = useState(null);
  const [stateLb, setStateLb] = useState(null);
  const [stateLbName, setStateLbName] = useState(null);
  const [hallOfFame, setHallOfFame] = useState(null);

  const [enquiry, setEnquiry] = useState({ name: "", email: "", message: "" });
  const [enquiryStatus, setEnquiryStatus] = useState({ loading: false, success: false, error: "" });

  const [certId, setCertId] = useState("");
  const [certResult, setCertResult] = useState(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    api.getPublicChampionship().then((res) => {
      if (res.status === "live" || res.status === "upcoming") setChamp(res);
      else setChamp(null);
    }).catch(() => setChamp(null)).finally(() => setChampLoading(false));

    api.getTicker().then(setTicker).catch(() => {});
    api.leaderboardHomepage().then((d) => setStudentLb(d.boards)).catch(() => setStudentLb({}));
    api.leaderboardSchools().then((d) => setSchoolLb(d.rows)).catch(() => setSchoolLb([]));
    api.getChampionshipLeaderboard().then((d) => setHallOfFame(d.winners)).catch(() => setHallOfFame([]));

    let previewState = "Lagos";
    if (user) {
      api.getMySchool().then((res) => {
        const st = res?.school_state;
        if (st && st !== "—" && st.trim()) previewState = st.trim();
      }).catch(() => {}).finally(() => {
        setStateLbName(previewState);
        api.leaderboardState(previewState).then((d) => setStateLb(d.rows)).catch(() => setStateLb([]));
      });
    } else {
      setStateLbName(previewState);
      api.leaderboardState(previewState).then((d) => setStateLb(d.rows)).catch(() => setStateLb([]));
    }

    document.title = "MAKAVERSE EdTech — Master Your Science Exams";
    return () => { document.title = "MAKAVERSE EdTech"; };
  }, [user]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryStatus({ loading: true, success: false, error: "" });
    try {
      await api.submitEnquiry(enquiry);
      setEnquiryStatus({ loading: false, success: true, error: "" });
      setEnquiry({ name: "", email: "", message: "" });
    } catch (err) {
      setEnquiryStatus({ loading: false, success: false, error: err.message || "Failed to send message." });
    }
  };

  const handleVerifyCert = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setCertLoading(true); setCertError(""); setCertResult(null);
    try {
      const data = await api.verifyCertificate(certId.trim());
      setCertResult(data);
    } catch (err) {
      setCertError(err.message || "Certificate not found.");
    } finally {
      setCertLoading(false);
    }
  };

  const countdown = useCountdown(champ?.status === "live" ? champ.end_date : (champ?.status === "upcoming" ? champ.start_date : null));

  return (
    <div style={{ background: "var(--mk-bg)", minHeight: "100vh", display: "flex", flexDirection: "column", overflowX: "hidden", paddingBottom: "52px" }}>
      
      {/* NAVBAR */}
      <header style={{ borderBottom: "1px solid var(--mk-border)", background: "var(--mk-glass-bg)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(var(--mk-glass-blur))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "80px", padding: "0 40px", width: "100%", boxSizing: "border-box" }}>
          <Logo size="md" />
          <nav className="desktop-nav" style={{ gap: 28, alignItems: "center" }}>
            <Link to="/leaderboard" style={{ color: "var(--mk-text-dim)", fontWeight: 600, fontSize: "0.95rem" }}>Leaderboard</Link>
            <Link to="/arena" style={{ color: "var(--mk-text-dim)", fontWeight: 600, fontSize: "0.95rem" }}>Arena</Link>
            <Link to="/zoom" style={{ color: "var(--mk-text-dim)", fontWeight: 600, fontSize: "0.95rem" }}>Live Classes</Link>
            {user ? (
              <Link to={user.is_admin ? "/admin" : "/dashboard"}><button style={{ padding: "10px 24px" }}>Go to {user.is_admin ? "Admin" : "Dashboard"}</button></Link>
            ) : (
              <>
                <Link to="/login" style={{ color: "var(--mk-text)", fontWeight: 600, fontSize: "0.95rem" }}>Login</Link>
                <Link to="/register"><button style={{ padding: "10px 24px" }}>Get Started</button></Link>
              </>
            )}
            <ThemeToggle />
          </nav>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="mobile-nav-btn" style={{ background: "transparent", border: "none", color: "var(--mk-text)", fontSize: "1.5rem", cursor: "pointer" }}>☰</button>
        </div>
        {mobileMenu && (
          <div style={{ padding: "24px", background: "var(--mk-bg-elev)", borderBottom: "1px solid var(--mk-border)" }}>
            <div className="stack" style={{ gap: 20 }}>
              <Link to="/leaderboard" style={{ color: "var(--mk-text)", fontWeight: 600 }} onClick={() => setMobileMenu(false)}>Leaderboard</Link>
              <Link to="/arena" style={{ color: "var(--mk-text)", fontWeight: 600 }} onClick={() => setMobileMenu(false)}>Championship Arena</Link>
              <Link to="/zoom" style={{ color: "var(--mk-text)", fontWeight: 600 }} onClick={() => setMobileMenu(false)}>Live Zoom Classes</Link>
              <div style={{ borderTop: "1px solid var(--mk-border)", margin: "8px 0" }}></div>
              {user ? (
                <Link to={user.is_admin ? "/admin" : "/dashboard"} style={{ color: "var(--mk-text)", fontWeight: 600 }} onClick={() => setMobileMenu(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" style={{ color: "var(--mk-text)", fontWeight: 600 }} onClick={() => setMobileMenu(false)}>Login</Link>
                  <Link to="/register" style={{ color: "var(--mk-accent)", fontWeight: 800 }} onClick={() => setMobileMenu(false)}>Create Account</Link>
                </>
              )}
              <div style={{ marginTop: 8 }}><ThemeToggle /></div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ position: "relative", padding: "140px 16px 120px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)", filter: "blur(50px)", zIndex: 0 }}></div>
        <div style={{ position: "absolute", bottom: "-20%", right: "10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }}></div>

        <div className="container" style={{ position: "relative", zIndex: 10, maxWidth: 950 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 24px", borderRadius: "var(--mk-radius-pill)", background: "var(--mk-glass-bg)", border: "1px solid var(--mk-glass-border)", color: "var(--mk-accent)", fontSize: "0.85rem", fontWeight: 800, marginBottom: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--mk-accent)", boxShadow: "0 0 10px var(--mk-accent)" }}></span>
            The World's Most Advanced Science Training Ground
          </div>

          <h1 style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", fontWeight: 900, color: "var(--mk-text)", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "28px" }}>
            Don't Just Study.<br />
            <span className="mk-gradient-text" style={{ background: "linear-gradient(135deg, var(--mk-accent) 0%, var(--mk-brand-secondary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Dominate Your Exams.
            </span>
          </h1>

          <p className="text-dim" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)", maxWidth: "800px", margin: "0 auto 56px", lineHeight: 1.65 }}>
            Thousands of real past questions. An AI tutor that breaks down every step. Live global leaderboards. 
            MAKAVERSE is the operating system for ambitious science students who refuse to settle for average.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: 48 }}>
            <Link to="/register">
              <button style={{ padding: "20px 52px", fontSize: "1.15rem", fontWeight: 900, borderRadius: "var(--mk-radius-pill)", boxShadow: "0 12px 40px rgba(0, 212, 255, 0.4)", animation: "pulse-glow 2s infinite" }}>
                Start Training Free
              </button>
            </Link>
            <Link to="/login">
              <button className="secondary" style={{ padding: "20px 52px", fontSize: "1.15rem", fontWeight: 700, borderRadius: "var(--mk-radius-pill)", background: "var(--mk-glass-bg)", backdropFilter: "blur(10px)" }}>
                Enter the Arena
              </button>
            </Link>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", fontSize: "0.95rem", color: "var(--mk-text-dim)", fontWeight: 600 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--mk-success)" }}>✓</span> 1000+ Real Past Questions</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--mk-success)" }}>✓</span> AI Tutor on Every Question</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--mk-success)" }}>✓</span> Free Forever Plan</span>
          </div>
        </div>
        <style>{`
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(0, 212, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
          }
        `}</style>
      </section>

      {/* GLOBAL STATS BAR */}
      <section style={{ borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)", background: "var(--mk-bg-elev-2)", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", textAlign: "center" }}>
            {[
              { num: "10K+", label: "Active Students" },
              { num: "1,000+", label: "Real Exam Questions" },
              { num: "50+", label: "Partner Schools" },
              { num: "99%", label: "Satisfaction Rate" }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-accent)", lineHeight: 1, marginBottom: 8 }}>{stat.num}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--mk-text-faint)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 NEW: LIVE EXAM PREVIEW (Exam Settings Card) */}
      <section style={{ padding: "120px 16px", background: "var(--mk-bg)", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "64px", alignItems: "center" }}>
            
            {/* LEFT: Copy */}
            <div>
              <div style={{ display: "inline-block", background: "rgba(0, 212, 255, 0.1)", border: "1px solid var(--mk-accent)", color: "var(--mk-accent)", padding: "6px 16px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 24 }}>
                Real Exam Simulation
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "var(--mk-text)", lineHeight: 1.1, marginBottom: 24 }}>
                Experience the Real Thing.<br />
                <span style={{ color: "var(--mk-accent)" }}>Before It Counts.</span>
              </h2>
              <p className="text-dim" style={{ fontSize: "1.15rem", lineHeight: 1.7, marginBottom: 32 }}>
                Our CBT engine is built to mirror the exact format of JAMB, WAEC, and NECO. Full-screen lockdown, timed countdown, question palettes, and tab-switch detection. Walk into your real exam knowing exactly what to expect.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {[
                  { icon: "⏱️", text: "Accurate timing per subject" },
                  { icon: "🚫", text: "Anti-cheat: tab switch detection" },
                  { icon: "🎨", text: "Real exam UI (dark mode included)" },
                  { icon: "📊", text: "Instant breakdown & score analysis" }
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: "1.5rem", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--mk-bg-elev-2)", borderRadius: "var(--mk-radius)", border: "1px solid var(--mk-border)" }}>{item.icon}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--mk-text)" }}>{item.text}</div>
                  </div>
                ))}
              </div>
              <Link to="/register">
                <button style={{ padding: "16px 40px", fontSize: "1.05rem", fontWeight: 900, borderRadius: "var(--mk-radius-pill)" }}>Try a Mock Exam →</button>
              </Link>
            </div>

            {/* RIGHT: Mock Exam Card */}
            <div className="mk-glass" style={{ padding: 32, background: "linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(168, 85, 247, 0.08))", border: "1px solid var(--mk-border-strong)", borderRadius: "var(--mk-radius-lg)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--mk-border)" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "var(--mk-text-faint)", marginBottom: 4 }}>Mock Exam</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--mk-text)" }}>JAMB — Physics</div>
                </div>
                <div className="mono" style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--mk-danger)", background: "rgba(255, 107, 107, 0.1)", padding: "8px 16px", borderRadius: 8, border: "1px solid var(--mk-danger)" }}>39:52</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 12 }}>Question 12 of 40</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--mk-text)", lineHeight: 1.6, marginBottom: 20 }}>
                  A body of mass 5kg moves with a velocity of 10 m/s. Calculate its kinetic energy.
                </div>
                {["A. 100 J", "B. 250 J", "C. 500 J", "D. 1000 J"].map((opt, i) => (
                  <div key={i} style={{ padding: "12px 16px", marginBottom: 8, borderRadius: 8, background: i === 2 ? "rgba(34, 217, 154, 0.1)" : "var(--mk-bg)", border: i === 2 ? "2px solid var(--mk-success)" : "1px solid var(--mk-border)", fontSize: "0.95rem", fontWeight: 600, color: "var(--mk-text)" }}>
                    {opt}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid var(--mk-border)" }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, background: i < 11 ? "var(--mk-success)" : i === 11 ? "var(--mk-accent)" : "var(--mk-bg-elev-2)", color: i < 11 ? "#052e16" : i === 11 ? "var(--mk-accent-text)" : "var(--mk-text-faint)" }}>{i + 1}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 NEW: BILLIONS OF QUESTIONS STATS STRIP */}
      <section style={{ padding: "100px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: 16 }}>A Universe of Questions. One Platform.</h2>
          <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: 700, margin: "0 auto 64px", lineHeight: 1.6 }}>We're building the biggest question bank in the world. Here's what you get on day one.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
            {[
              { num: "1,000+", label: "Live Questions Today" },
              { num: "10,000+", label: "By End of Year" },
              { num: "50+", label: "Subjects Covered" },
              { num: "24/7", label: "AI Tutor Available" }
            ].map((stat, i) => (
              <div key={i} style={{ padding: "40px 24px", borderRadius: "var(--mk-radius-lg)", background: "var(--mk-bg)", border: "1px solid var(--mk-border)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "3rem", fontWeight: 900, background: "linear-gradient(135deg, var(--mk-accent), var(--mk-brand-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 12 }}>{stat.num}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--mk-text-dim)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCIENCE OLYMPIAD */}
      <section style={{ padding: "120px 16px", background: "var(--mk-bg)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 60%)", filter: "blur(80px)", zIndex: 0 }}></div>
        
        <div className="container" style={{ position: "relative", zIndex: 10, maxWidth: 1100 }}>
          <div className="mk-glass" style={{ padding: "64px 48px", borderRadius: "var(--mk-radius-lg)", border: "1px solid rgba(168, 85, 247, 0.4)", background: "linear-gradient(135deg, rgba(10, 22, 34, 0.95), rgba(168, 85, 247, 0.08))", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "60px" }}>
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "180px", height: "180px", background: "var(--mk-brand-secondary)", filter: "blur(60px)", opacity: 0.6 }}></div>
                  <div style={{ fontSize: "9rem", lineHeight: 1, filter: "drop-shadow(0 0 32px rgba(168, 85, 247, 0.9))", position: "relative", zIndex: 1 }}>🏛️</div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  {["⚛️ Physics", "🧪 Chemistry", "🧬 Biology"].map((subj, i) => (
                    <span key={i} style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid var(--mk-brand-secondary)", color: "var(--mk-brand-secondary)", padding: "8px 16px", borderRadius: "var(--mk-radius-pill)", fontSize: "0.85rem", fontWeight: 800 }}>
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ flex: "2 1 450px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                  <div style={{ display: "inline-block", background: "var(--mk-brand-secondary)", color: "#fff", fontWeight: 900, fontSize: "0.75rem", padding: "6px 16px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Flagship Academic Event
                  </div>
                  <span style={{ color: "var(--mk-warning)", fontWeight: 800, fontSize: "0.85rem" }}>🌟 Grand Champion Title</span>
                </div>

                <h2 style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 900, color: "var(--mk-text)", marginBottom: 20, lineHeight: 1.05 }}>
                  The MAKAVERSE <br/>
                  <span style={{ color: "var(--mk-brand-secondary)", textShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}>Science Olympiad</span>
                </h2>
                
                <p className="text-dim" style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: 32, maxWidth: 600 }}>
                  Beyond the weekly CBT championships lies the ultimate global battleground. Elite, high-stakes questions designed to separate the good from the great.
                  <br/><br/>
                  Only the sharpest minds survive to claim the title of <strong style={{ color: "var(--mk-text)" }}>Olympiad Grand Champion</strong>.
                </p>

                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 40, padding: 24, background: "rgba(0,0,0,0.2)", borderRadius: "var(--mk-radius)", border: "1px solid var(--mk-border)" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 4 }}>Grand Prize</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--mk-warning)" }}>🏆 The Golden Trophy</div>
                  </div>
                  <div style={{ width: 1, background: "var(--mk-border)" }}></div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 4 }}>Recognition</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--mk-accent)" }}>Global Hall of Fame</div>
                  </div>
                  <div style={{ width: 1, background: "var(--mk-border)" }}></div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 4 }}>Rewards</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--mk-success)" }}>Massive XP & Premium</div>
                  </div>
                </div>

                <div className="row" style={{ gap: 16, alignItems: "center" }}>
                  <button disabled style={{ background: "var(--mk-brand-secondary)", color: "#fff", padding: "18px 40px", fontSize: "1.05rem", fontWeight: 900, opacity: 0.9, cursor: "not-allowed", borderRadius: "var(--mk-radius-pill)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    Registration Closed
                  </button>
                  <span className="text-faint" style={{ fontSize: "0.95rem", fontWeight: 600 }}>The next Olympiad is being prepared. Keep training.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY MAKAVERSE */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: "16px" }}>Why Students Choose MAKAVERSE</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>We don't just give you questions. We give you an unfair advantage.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
            {[
              { icon: "🧠", title: "AI-Powered Explanations", desc: "Stuck on a question? Our AI Tutor breaks it down step-by-step, just like a private tutor — but available 24/7." },
              { icon: "⚡", title: "Real Exam Simulation", desc: "Our CBT engine mimics the real thing: timed sessions, full-screen mode, and the exact format you'll face on exam day." },
              { icon: "🏆", title: "Global Leaderboards", desc: "Compete against students worldwide. Climb the ranks, earn XP, and prove you're the best." },
              { icon: "📊", title: "Deep Analytics", desc: "See exactly where you're strong and where you're weak. Our speed vs. accuracy charts show you how to improve." },
              { icon: "🎓", title: "Verified Certificates", desc: "Pass a Mock or Championship exam and earn an official MAKAVERSE certificate — recognized by schools worldwide." },
              { icon: "💎", title: "Gamified Learning", desc: "Earn coins, unlock avatars, and level up. Learning has never been this addictive." }
            ].map((feature, i) => (
              <HoverCard key={i} style={{ padding: "40px", background: "var(--mk-bg)", border: "1px solid var(--mk-border)", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "3rem", marginBottom: "24px" }}>{feature.icon}</div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "12px", color: "var(--mk-text)" }}>{feature.title}</h3>
                <p className="text-dim" style={{ fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* CHAMPIONSHIP COUNTDOWN */}
      {!champLoading && champ && (
        <section style={{ padding: "80px 16px", position: "relative", zIndex: 10, background: "var(--mk-bg)" }}>
          <div className="container" style={{ maxWidth: 1000 }}>
            <Link to="/arena" style={{ textDecoration: "none" }}>
              <div className="mk-glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, padding: "40px", background: "linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(168, 85, 247, 0.08))", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "var(--mk-radius-lg)", boxShadow: "0 8px 32px rgba(251, 191, 36, 0.1)", transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-warning)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>🏆</span> {champ.status === "live" ? "LIVE NOW" : "STARTING SOON"}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 8 }}>{champ.title}</div>
                  <div className="text-dim" style={{ fontSize: "1.05rem", fontWeight: 500 }}>Compete against the world. One attempt. Real stakes.</div>
                </div>
                {countdown && !countdown.expired && (
                  <div style={{ display: "flex", gap: 12 }}>
                    {[{ label: "Days", val: countdown.days }, { label: "Hrs", val: countdown.hours }, { label: "Min", val: countdown.minutes }, { label: "Sec", val: countdown.seconds, color: "var(--mk-danger)" }].map((t, idx) => (
                      <div key={idx} style={{ textAlign: "center", minWidth: 70, background: "var(--mk-bg-elev)", padding: "16px 12px", borderRadius: 12, border: "1px solid var(--mk-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <div className="mono" style={{ fontSize: "2.2rem", fontWeight: 900, color: t.color || "var(--mk-warning)" }}>{t.val}</div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginTop: 8 }}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* THE MAKAVERSE AWARD */}
      <section style={{ padding: "80px 16px", background: "var(--mk-bg)" }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(0, 0, 0, 0.5))", border: "1px solid var(--mk-warning)", borderRadius: "var(--mk-radius-lg)", padding: "48px 32px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "40px", boxShadow: "0 12px 48px rgba(251, 191, 36, 0.15)" }}>
            <div style={{ flex: "1 1 300px", textAlign: "center" }}>
              <div style={{ fontSize: "6rem", filter: "drop-shadow(0 0 32px rgba(251, 191, 36, 0.6))", lineHeight: 1 }}>🏆</div>
            </div>
            <div style={{ flex: "2 1 400px" }}>
              <div style={{ display: "inline-block", background: "var(--mk-warning)", color: "#000", fontWeight: 900, fontSize: "0.8rem", padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>The Ultimate Prize</div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 16, lineHeight: 1.1 }}>The MAKAVERSE Award</h2>
              <p className="text-dim" style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 24 }}>
                This isn't just a certificate. It's the highest honor a science student can achieve on this platform. The <strong>#1 Ranked Student</strong> in any concluded Championship Exam is awarded the MAKAVERSE Award — a permanent badge of excellence, recognized globally.
              </p>
              <Link to="/arena">
                <button style={{ background: "var(--mk-warning)", color: "#000", fontWeight: 900, padding: "12px 32px", boxShadow: "0 4px 16px rgba(251, 191, 36, 0.4)" }}>Compete for the Award</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 NEW: PREMIUM SUBSCRIPTION COMPARISON CARD */}
      <section style={{ padding: "120px 16px", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: 16 }}>Choose Your Power Level</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>Start free. Upgrade when you're ready to unlock the full MAKAVERSE experience.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, alignItems: "stretch" }}>
            
            {/* FREE */}
            <div style={{ padding: 40, borderRadius: "var(--mk-radius-lg)", background: "var(--mk-bg)", border: "1px solid var(--mk-border)", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "var(--mk-text-faint)", marginBottom: 8 }}>Starter</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 8 }}>Free</div>
              <div className="text-dim" style={{ fontSize: "0.95rem", marginBottom: 32 }}>Forever. No card needed.</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {["Unlimited practice tests", "Full question bank access", "Basic score breakdown", "Leaderboard entry"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.95rem", color: "var(--mk-text-dim)" }}>
                    <span style={{ color: "var(--mk-success)", fontWeight: 900 }}>✓</span>{f}
                  </li>
                ))}
                {["AI Tutor explanations", "Mock exam certificates"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.95rem", color: "var(--mk-text-faint)", opacity: 0.5 }}>
                    <span style={{ color: "var(--mk-danger)", fontWeight: 900 }}>✗</span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/register"><button className="secondary" style={{ width: "100%", padding: "14px 0", fontWeight: 800 }}>Get Started Free</button></Link>
            </div>

            {/* PREMIUM */}
            <div style={{ padding: 40, borderRadius: "var(--mk-radius-lg)", background: "linear-gradient(180deg, rgba(0, 212, 255, 0.08), rgba(168, 85, 247, 0.08))", border: "2px solid var(--mk-accent)", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 24px 64px rgba(0, 212, 255, 0.15)", transform: "scale(1.03)" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "var(--mk-accent)", color: "var(--mk-accent-text)", padding: "6px 20px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" }}>🔥 Most Popular</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "var(--mk-accent)", marginBottom: 8 }}>Premium</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 4 }}>₦5,000<span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--mk-text-faint)" }}>/month</span></div>
              <div className="text-dim" style={{ fontSize: "0.95rem", marginBottom: 32 }}>Everything in Starter, plus:</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {["Everything in Starter", "Unlimited AI Tutor access", "Full Mock Exams with certificates", "Exclusive Championship entry", "Priority support", "Ad-free experience"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.95rem", color: "var(--mk-text)" }}>
                    <span style={{ color: "var(--mk-accent)", fontWeight: 900 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/upgrade"><button style={{ width: "100%", padding: "14px 0", fontWeight: 900, fontSize: "1rem", boxShadow: "0 8px 24px rgba(0, 212, 255, 0.4)" }}>Upgrade to Premium</button></Link>
            </div>

            {/* SCHOOL */}
            <div style={{ padding: 40, borderRadius: "var(--mk-radius-lg)", background: "var(--mk-bg)", border: "1px solid var(--mk-warning)", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "var(--mk-warning)", marginBottom: 8 }}>For Schools</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 8 }}>Custom</div>
              <div className="text-dim" style={{ fontSize: "0.95rem", marginBottom: 32 }}>Bulk seats. School leaderboard.</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {["Everything in Premium", "Bulk student accounts", "School-wide analytics dashboard", "Dedicated account manager", "Custom exam creation", "White-label certificates"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.95rem", color: "var(--mk-text-dim)" }}>
                    <span style={{ color: "var(--mk-warning)", fontWeight: 900 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="mailto:makaverseedtech@mail.com" style={{ width: "100%" }}><button style={{ width: "100%", padding: "14px 0", fontWeight: 800, background: "var(--mk-warning)", color: "#000" }}>Contact Sales</button></a>
            </div>

          </div>
        </div>
      </section>

      {/* AD SECTION */}
      <section style={{ padding: "40px 16px 80px", background: "var(--mk-bg)" }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            <HoverCard style={{ background: "linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(0, 0, 0, 0))", border: "1px solid rgba(0, 212, 255, 0.3)", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius: "var(--mk-radius-lg)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px", filter: "drop-shadow(0 0 16px rgba(0, 212, 255, 0.5))" }}>🚀</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: "12px" }}>Upgrade to Premium</h3>
              <p className="text-dim" style={{ fontSize: "1rem", marginBottom: "32px", lineHeight: 1.5 }}>Unlock AI Tutor, Mock Exams, and the Vault. Get unlimited access today.</p>
              <Link to="/upgrade" style={{ width: "100%" }}><button style={{ padding: "16px 32px", fontWeight: 800, width: "100%", fontSize: "1rem" }}>See Premium Plans</button></Link>
            </HoverCard>
            <HoverCard style={{ background: "linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(0, 0, 0, 0))", border: "1px solid rgba(251, 191, 36, 0.3)", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius: "var(--mk-radius-lg)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px", filter: "drop-shadow(0 0 16px rgba(251, 191, 36, 0.5))" }}>🎓</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: "12px" }}>Invite Your School</h3>
              <p className="text-dim" style={{ fontSize: "1rem", marginBottom: "32px", lineHeight: 1.5 }}>Are you a school principal? Partner with MAKAVERSE to give your students a global edge.</p>
              <a href="mailto:makaverseedtech@mail.com" style={{ width: "100%" }}><button style={{ padding: "16px 32px", fontWeight: 800, width: "100%", fontSize: "1rem", background: "var(--mk-warning)", color: "#000", boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)" }}>Contact Us for B2B</button></a>
            </HoverCard>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "100px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>Your Journey to Greatness</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>Three steps to transform from a regular student to a global legend.</p>
          </div>
          <div className="form-grid-3">
            {[
              { step: "01", title: "Create Your Profile", desc: "Register for free. Choose your level, your target exam, and your starting avatar.", icon: "👤" },
              { step: "02", title: "Train & Compete", desc: "Take realistic CBT mock exams. If you get stuck, ask the AI Tutor. Then enter the Arena to test your speed against others.", icon: "⚔️" },
              { step: "03", title: "Claim Your Glory", desc: "Climb the leaderboard, earn coins, win certificates, and secure your spot in the Hall of Fame.", icon: "👑" }
            ].map((s, i) => (
              <div key={i} className="card" style={{ background: "var(--mk-bg)", padding: "40px", position: "relative", borderTop: "4px solid var(--mk-accent)" }}>
                <div style={{ position: "absolute", top: 20, right: 20, fontSize: "4rem", fontWeight: 900, color: "var(--mk-border)", opacity: 0.3, lineHeight: 1 }}>{s.step}</div>
                <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 12, color: "var(--mk-text)" }}>{s.title}</h3>
                <p className="text-dim" style={{ fontSize: "1rem", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM — 6 CARDS */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>The MAKAVERSE Ecosystem</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>The complete operating system for ambitious science students. Everything you need to dominate.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
             <Link to={user ? "/dashboard" : "/register"} style={{ textDecoration: "none" }}>
               <HoverCard style={{ height: "100%", borderTop: "4px solid var(--mk-accent)", padding: "32px", display: "flex", flexDirection: "column", background: "var(--mk-glass-bg)" }}>
                 <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>📝</div>
                 <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "var(--mk-text)" }}>MAKAVERSE CBT</h3>
                 <p className="text-dim" style={{ fontSize: "1rem", margin: 0, flex: 1, lineHeight: 1.5 }}>Practice tests, mock exams, and the championship arena.</p>
                 <div style={{ color: "var(--mk-accent)", fontWeight: 800, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>Enter Dashboard <span>→</span></div>
               </HoverCard>
             </Link>
             <Link to={user ? "/library" : "/register"} style={{ textDecoration: "none" }}>
               <HoverCard style={{ height: "100%", borderTop: "4px solid var(--mk-brand-secondary)", padding: "32px", display: "flex", flexDirection: "column", background: "var(--mk-glass-bg)" }}>
                 <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>🔬</div>
                 <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "var(--mk-text)" }}>MAKAVERSE SCIENCE</h3>
                 <p className="text-dim" style={{ fontSize: "1rem", margin: 0, flex: 1, lineHeight: 1.5 }}>Deep dive into curated study materials and PDFs.</p>
                 <div style={{ color: "var(--mk-brand-secondary)", fontWeight: 800, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>Open Library <span>→</span></div>
               </HoverCard>
             </Link>
             <Link to={user ? "/dashboard" : "/register"} style={{ textDecoration: "none" }}>
               <HoverCard style={{ height: "100%", borderTop: "4px solid var(--mk-success)", padding: "32px", display: "flex", flexDirection: "column", background: "var(--mk-glass-bg)" }}>
                 <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>🤖</div>
                 <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "var(--mk-text)" }}>MAKAVERSE AI</h3>
                 <p className="text-dim" style={{ fontSize: "1rem", margin: 0, flex: 1, lineHeight: 1.5 }}>Instant step-by-step explanations for any question.</p>
                 <div style={{ color: "var(--mk-success)", fontWeight: 800, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>Ask the AI <span>→</span></div>
               </HoverCard>
             </Link>
             <Link to={user ? "/arena" : "/register"} style={{ textDecoration: "none" }}>
               <HoverCard style={{ height: "100%", borderTop: "4px solid var(--mk-warning)", padding: "32px", display: "flex", flexDirection: "column", background: "var(--mk-glass-bg)" }}>
                 <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>🏆</div>
                 <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "var(--mk-text)" }}>THE ARENA</h3>
                 <p className="text-dim" style={{ fontSize: "1rem", margin: 0, flex: 1, lineHeight: 1.5 }}>Compete in live championships and climb the Hall of Fame.</p>
                 <div style={{ color: "var(--mk-warning)", fontWeight: 800, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>Enter Arena <span>→</span></div>
               </HoverCard>
             </Link>
             
             <Link to={user ? "/zoom" : "/register"} style={{ textDecoration: "none" }}>
               <HoverCard style={{ height: "100%", borderTop: "4px solid #2D8CFF", padding: "32px", display: "flex", flexDirection: "column", background: "var(--mk-glass-bg)" }}>
                 <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>📹</div>
                 <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "var(--mk-text)" }}>LIVE ZOOM CLASSES</h3>
                 <p className="text-dim" style={{ fontSize: "1rem", margin: 0, flex: 1, lineHeight: 1.5 }}>Join live interactive sessions with expert tutors every week.</p>
                 <div style={{ color: "#2D8CFF", fontWeight: 800, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>Join a Class <span>→</span></div>
               </HoverCard>
             </Link>

             <Link to={user ? "/vault" : "/register"} style={{ textDecoration: "none" }}>
               <HoverCard style={{ height: "100%", borderTop: "4px solid #fbbf24", padding: "32px", display: "flex", flexDirection: "column", background: "var(--mk-glass-bg)" }}>
                 <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>🏪</div>
                 <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "var(--mk-text)" }}>THE VAULT</h3>
                 <p className="text-dim" style={{ fontSize: "1rem", margin: 0, flex: 1, lineHeight: 1.5 }}>Spend your hard-earned coins on avatars and power-ups.</p>
                 <div style={{ color: "#fbbf24", fontWeight: 800, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>Open Vault <span>→</span></div>
               </HoverCard>
             </Link>
          </div>
        </div>
      </section>

      {/* 🚀 NEW: SOCIAL PROOF / TESTIMONIALS */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: 16 }}>Students Are Winning</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>Real results from real students using MAKAVERSE to top their exams.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            {[
              { quote: "I went from scoring 180 in my mocks to 285 in the real JAMB. The AI Tutor is a game changer.", name: "Tunde A.", role: "JAMB 2024 — 285/400", avatar: "👨‍🎓" },
              { quote: "The speed vs accuracy charts showed me exactly where I was rushing. That alone added 40 points to my WAEC.", name: "Chiamaka O.", role: "WAEC 2024 — 8 A1s", avatar: "👩‍🎓" },
              { quote: "The arena is addictive. I competed every night and now I'm in the top 100 globally. Learning became fun.", name: "Ibrahim M.", role: "Top 100 Global", avatar: "🧑‍🎓" }
            ].map((t, i) => (
              <div key={i} style={{ padding: 40, borderRadius: "var(--mk-radius-lg)", background: "var(--mk-bg)", border: "1px solid var(--mk-border)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 20, color: "var(--mk-warning)" }}>★★★★★</div>
                <p style={{ fontSize: "1.05rem", fontStyle: "italic", color: "var(--mk-text)", lineHeight: 1.7, marginBottom: 24 }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 24, borderTop: "1px solid var(--mk-border)" }}>
                  <div style={{ fontSize: "2.2rem" }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--mk-text)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCHOOL RIVALRY BANNER */}
      <section style={{ padding: "80px 16px", background: "var(--mk-bg)" }}>
        <div className="container">
          <div style={{ background: "linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", border: "1px solid var(--mk-accent)", borderRadius: "var(--mk-radius-lg)", padding: "48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, left: -20, fontSize: "10rem", opacity: 0.05 }}>🏫</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "16px", position: "relative", zIndex: 1 }}>Is Your School the Smartest in the World?</h2>
            <p className="text-dim" style={{ fontSize: "1.1rem", maxWidth: "700px", margin: "0 auto 32px", position: "relative", zIndex: 1, lineHeight: 1.6 }}>
              Every test you take contributes points to your school's global ranking. Rally your classmates, dominate the leaderboards, and bring the trophy home.
            </p>
            <Link to="/leaderboard"><button style={{ padding: "14px 40px", fontWeight: 800, position: "relative", zIndex: 1 }}>Check School Standings</button></Link>
          </div>
        </div>
      </section>

      {/* VOICES OF LEGENDS */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg)", borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>Voices of Legends</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>Stand on the shoulders of giants. Let the greatest scientific minds inspire your journey.</p>
          </div>
          <div className="form-grid-2" style={{ gap: "24px" }}>
            {LEGENDS.map((legend, i) => (
              <HoverCard key={i} style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "20px", borderLeft: "4px solid var(--mk-brand-secondary)", background: "var(--mk-bg-elev-2)" }}>
                <div style={{ fontSize: "2.5rem" }}>{legend.icon}</div>
                <p style={{ fontSize: "1.2rem", fontStyle: "italic", fontWeight: 500, color: "var(--mk-text)", lineHeight: 1.6, margin: 0 }}>"{legend.quote}"</p>
                <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--mk-border)" }}>
                  <div style={{ fontWeight: 900, fontSize: "1.05rem", color: "var(--mk-accent)" }}>{legend.author}</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--mk-text-faint)", fontWeight: 600, marginTop: 4 }}>{legend.field}</div>
                </div>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARDS */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg)" }}>
        <div className="container">
          <div className="row-between" style={{ marginBottom: "56px", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px" }}>Global Leaderboards</h2>
              <p className="text-dim" style={{ fontSize: "1.15rem" }}>Top scores from active Championship exams.</p>
            </div>
            <Link to="/leaderboard" style={{ fontWeight: 800, color: "var(--mk-accent)", display: "flex", alignItems: "center", gap: 8, fontSize: "1.05rem" }}>
              View Full Leaderboard <span>→</span>
            </Link>
          </div>
          <div className="form-grid-3" style={{ marginBottom: 48 }}>
            {ALL_EXAM_TARGETS.slice(0, 3).map((target) => (
              <div key={target} className="card" style={{ padding: "32px", background: "var(--mk-glass-bg)", border: "1px solid var(--mk-border)" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 900, textTransform: "uppercase", color: "var(--mk-accent)", marginBottom: "24px", borderBottom: "1px solid var(--mk-border)", paddingBottom: "16px", letterSpacing: "0.05em" }}>
                  {EXAM_TARGET_LABELS[target]}
                </div>
                {!studentLb ? (
                  <div className="stack" style={{ gap: 16 }}>
                    <div className="mk-skeleton mk-skeleton-text" />
                    <div className="mk-skeleton mk-skeleton-text short" />
                    <div className="mk-skeleton mk-skeleton-text" />
                  </div>
                ) : studentLb[target] && studentLb[target].length > 0 ? (
                  <div className="stack" style={{ gap: "20px" }}>
                    {studentLb[target].map((row, i) => (
                      <div key={row.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ width: "24px", fontSize: "1.1rem", fontWeight: 900, color: i === 0 ? "var(--mk-accent)" : "var(--mk-text-faint)", textAlign: "center" }}>#{i + 1}</div>
                          <div style={{ fontSize: "1.6rem" }}>{AVATAR_MAP[row.avatar_id] || "👤"}</div>
                          <div>
                            <div style={{ fontSize: "1rem", fontWeight: 800 }}>{row.display_name}</div>
                            <div className="text-faint" style={{ fontSize: "0.8rem", marginTop: 2 }}>{row.school_name || "No school"}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "var(--mk-success)", background: "rgba(0, 229, 153, 0.1)", padding: "6px 12px", borderRadius: "var(--mk-radius-pill)", border: "1px solid rgba(0, 229, 153, 0.3)" }}>{row.total_score} pts</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-faint" style={{ fontSize: "1rem", textAlign: "center", padding: "40px 0" }}>No scores yet. Be the first!</div>
                )}
              </div>
            ))}
          </div>

          <div className="form-grid-2" style={{ gap: 40 }}>
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: 24 }}>School Standings</h3>
              <div className="card" style={{ padding: "32px" }}>
                {!schoolLb ? (
                  <div className="mk-skeleton" style={{ height: 100 }} />
                ) : schoolLb.length === 0 ? (
                  <p className="text-dim" style={{ textAlign: "center" }}>No school data yet.</p>
                ) : (
                  <div className="stack" style={{ gap: 16 }}>
                    {schoolLb.slice(0, 5).map((school, i) => (
                      <div key={i} className="row-between" style={{ paddingBottom: 16, borderBottom: i < 4 ? "1px solid var(--mk-border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ fontWeight: 900, fontSize: "1.1rem", color: i === 0 ? "var(--mk-warning)" : "var(--mk-text-faint)", width: 24 }}>#{i + 1}</div>
                          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{school.name}</div>
                        </div>
                        <div style={{ fontWeight: 900, color: "var(--mk-success)" }}>{school.total_score} pts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="row-between" style={{ marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0 }}>
                  {stateLbName ? `${stateLbName} State Preview` : "State Preview"}
                </h3>
                <Link to="/leaderboard" style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--mk-accent)" }}>Browse all states →</Link>
              </div>
              <div className="card" style={{ padding: "32px" }}>
                {!stateLb ? (
                  <div className="mk-skeleton" style={{ height: 100 }} />
                ) : stateLb.length === 0 ? (
                  <p className="text-dim" style={{ textAlign: "center" }}>No school data for this state yet.</p>
                ) : (
                  <div className="stack" style={{ gap: 16 }}>
                    {stateLb.slice(0, 5).map((school, i) => (
                      <div key={i} className="row-between" style={{ paddingBottom: 16, borderBottom: i < 4 ? "1px solid var(--mk-border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ fontWeight: 900, fontSize: "1.1rem", color: i === 0 ? "var(--mk-warning)" : "var(--mk-text-faint)", width: 24 }}>#{i + 1}</div>
                          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{school.name}</div>
                        </div>
                        <div style={{ fontWeight: 900, color: "var(--mk-success)" }}>{school.total_score} pts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 56 }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: 24 }}>🏆 Hall of Fame (Past Award Winners)</h3>
            <div className="card" style={{ padding: "32px" }}>
              {!hallOfFame ? (
                <div className="mk-skeleton" style={{ height: 100 }} />
              ) : hallOfFame.length === 0 ? (
                <p className="text-dim" style={{ textAlign: "center" }}>No concluded championships yet. Be the first to win the MAKAVERSE Award!</p>
              ) : (
                <div className="form-grid-3" style={{ gap: 16 }}>
                  {hallOfFame.slice(0, 6).map((winner, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--mk-bg-elev-2)", padding: 16, borderRadius: "var(--mk-radius)", border: "1px solid var(--mk-border)" }}>
                      <div style={{ fontSize: "2rem" }}>{AVATAR_MAP[winner.avatar_id] || "👑"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: "var(--mk-text)", fontSize: "1rem" }}>{winner.display_name}</div>
                        <div className="text-faint" style={{ fontSize: "0.8rem", marginTop: 2 }}>{winner.exam_title}</div>
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--mk-warning)" }}>{winner.score}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATE VERIFICATION */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)" }}>
        <div className="container" style={{ maxWidth: 700, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: 16 }}>Verify a Certificate</h2>
          <p className="text-dim" style={{ fontSize: "1.05rem", marginBottom: 40, lineHeight: 1.6 }}>
            Schools, parents, and employers can verify the authenticity of any MAKAVERSE certificate. 
            Enter the Certificate ID below (e.g. <code>MK-MOCK-00123</code>).
          </p>
          
          <form onSubmit={handleVerifyCert} className="row" style={{ gap: 12, maxWidth: 500, margin: "0 auto 32px" }}>
            <input required value={certId} onChange={(e) => setCertId(e.target.value)} placeholder="Enter Certificate ID" style={{ flex: 1, height: 56, fontSize: "1.05rem", textAlign: "center", textTransform: "uppercase", borderRadius: "var(--mk-radius)" }} />
            <button type="submit" disabled={certLoading} style={{ height: 56, padding: "0 32px", fontWeight: 800, fontSize: "1.05rem" }}>
              {certLoading ? "Checking..." : "Verify"}
            </button>
          </form>

          {certError && (
            <div style={{ background: "rgba(255, 107, 107, 0.1)", border: "1px solid var(--mk-danger)", padding: 24, borderRadius: "var(--mk-radius)", textAlign: "left" }}>
              <div style={{ fontWeight: 900, color: "var(--mk-danger)", marginBottom: 8, fontSize: "1.1rem" }}>❌ Invalid Certificate</div>
              <div style={{ color: "var(--mk-text)", fontSize: "1rem" }}>{certError}</div>
            </div>
          )}

          {certResult && (
            <div style={{ background: "rgba(34, 217, 154, 0.1)", border: "1px solid var(--mk-success)", padding: 32, borderRadius: "var(--mk-radius)", textAlign: "left" }}>
              <div style={{ fontWeight: 900, color: "var(--mk-success)", marginBottom: 24, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.5rem" }}>✅</span> Verified Authentic
              </div>
              <div className="form-grid-2" style={{ gap: 20 }}>
                <div><span className="text-dim" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Student</span> <strong style={{ color: "var(--mk-text)", fontSize: "1.05rem" }}>{certResult.student_name}</strong></div>
                <div><span className="text-dim" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>School</span> <strong style={{ color: "var(--mk-text)", fontSize: "1.05rem" }}>{certResult.school_name || "—"}</strong></div>
                <div><span className="text-dim" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Subject</span> <strong style={{ color: "var(--mk-text)", fontSize: "1.05rem" }}>{SUBJECT_LABELS[certResult.subject] || certResult.subject}</strong></div>
                <div><span className="text-dim" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Exam</span> <strong style={{ color: "var(--mk-text)", fontSize: "1.05rem", textTransform: "capitalize" }}>{certResult.mode}</strong></div>
                <div><span className="text-dim" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Score</span> <strong style={{ color: "var(--mk-success)", fontSize: "1.05rem" }}>{certResult.score} / {certResult.total_questions} ({certResult.percentage}%)</strong></div>
                <div><span className="text-dim" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Date Issued</span> <strong style={{ color: "var(--mk-text)", fontSize: "1.05rem" }}>{certResult.date ? new Date(certResult.date).toLocaleDateString() : "—"}</strong></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMMUNITY & SOCIALS */}
      <section style={{ padding: "100px 0", background: "var(--mk-bg)", borderTop: "1px solid var(--mk-border)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>Join the MAKAVERSE Community</h2>
          <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto 56px", lineHeight: 1.6 }}>
            Learning doesn't stop when you close the app. Follow us for daily science quizzes, exam tips, and exclusive giveaways.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            {[
              { name: "Instagram", Icon: SocialIcons.Instagram, url: "https://instagram.com/makaverseedtech", color: "#E1306C" },
              { name: "TikTok", Icon: SocialIcons.TikTok, url: "https://tiktok.com/@makaverseedtech", color: "#ffffff" },
              { name: "Facebook", Icon: SocialIcons.Facebook, url: "https://facebook.com/makaverseedtech", color: "#1877F2" },
              { name: "Telegram", Icon: SocialIcons.Telegram, url: "https://t.me/makaverseedtech", color: "#0088cc" },
              { name: "Threads", Icon: SocialIcons.Threads, url: "https://threads.net/@makaverseedtech", color: "#ffffff" }
            ].map((social, i) => (
              <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.borderColor = social.color; e.currentTarget.style.boxShadow = `0 12px 24px ${social.color}40`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--mk-border)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <social.Icon color={social.color} />
                </div>
                <div style={{ marginTop: 12, fontSize: "0.9rem", fontWeight: 700, color: "var(--mk-text-dim)" }}>{social.name}</div>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 32, fontSize: "1rem", fontWeight: 800, color: "var(--mk-accent)" }}>
            @makaverseedtech
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "160px 0", background: "linear-gradient(180deg, var(--mk-bg) 0%, var(--mk-bg-elev-2) 100%)", borderTop: "1px solid var(--mk-border)", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.04em" }}>Ready to Top Your Class?</h2>
          <p className="text-dim" style={{ fontSize: "1.3rem", maxWidth: "600px", margin: "0 auto 64px", lineHeight: 1.6 }}>Join thousands of students preparing for their exams the smart way.</p>
          <Link to="/register">
            <button style={{ padding: "24px 72px", fontSize: "clamp(1.15rem, 2.5vw, 1.35rem)", fontWeight: 900, borderRadius: "var(--mk-radius-pill)", boxShadow: "0 16px 48px rgba(0, 212, 255, 0.4)" }}>
              Create Your Free Account
            </button>
          </Link>
        </div>
      </section>

      {/* CONTACT & SUPPORT — Real WhatsApp/Gmail SVGs */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg)", borderTop: "1px solid var(--mk-border)" }}>
        <div className="container">
          <div className="form-grid-2" style={{ gap: 64 }}>
            <div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "24px" }}>We're Here to Help</h2>
              <p className="text-dim" style={{ fontSize: "1.15rem", marginBottom: "40px", lineHeight: 1.6 }}>
                Have a question, need support, or want to partner with us? Reach out to the MAKAVERSE team directly. You don't need an account to contact us.
              </p>

              <div className="stack" style={{ gap: 24 }}>
                <a href="https://wa.me/2349153736491" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <HoverCard style={{ padding: "24px", display: "flex", alignItems: "center", gap: 20, borderLeft: "4px solid #25D366" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(37, 211, 102, 0.15)", border: "1px solid #25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <SocialIcons.WhatsApp color="#25D366" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>WhatsApp Us Directly</div>
                      <div className="text-dim" style={{ fontSize: "1rem", marginTop: 4 }}>0915 373 6491</div>
                    </div>
                  </HoverCard>
                </a>
                <a href="mailto:makaverseedtech@mail.com" style={{ textDecoration: "none" }}>
                  <HoverCard style={{ padding: "24px", display: "flex", alignItems: "center", gap: 20, borderLeft: "4px solid #EA4335" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(234, 67, 53, 0.15)", border: "1px solid #EA4335", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <SocialIcons.Gmail color="#EA4335" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Email Support</div>
                      <div className="text-dim" style={{ fontSize: "1rem", marginTop: 4 }}>makaverseedtech@mail.com</div>
                    </div>
                  </HoverCard>
                </a>
              </div>
            </div>

            <div className="card" style={{ padding: "48px", background: "var(--mk-glass-bg)", border: "1px solid var(--mk-glass-border)" }}>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 32 }}>Send an Enquiry</h3>
              {enquiryStatus.success ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: "3.5rem", marginBottom: 24 }}>✅</div>
                  <h4 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--mk-success)", marginBottom: 12 }}>Message Sent!</h4>
                  <p className="text-dim" style={{ fontSize: "1.05rem" }}>We'll get back to you shortly.</p>
                  <button onClick={() => setEnquiryStatus({ loading: false, success: false, error: "" })} className="secondary" style={{ marginTop: 32, padding: "12px 32px" }}>Send another</button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="stack" style={{ gap: 20 }}>
                  <div><label style={{ fontWeight: 700 }}>Full Name</label><input required value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} placeholder="Your name" style={{ height: 52, marginTop: 8 }} /></div>
                  <div><label style={{ fontWeight: 700 }}>Email Address</label><input required type="email" value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} placeholder="you@example.com" style={{ height: 52, marginTop: 8 }} /></div>
                  <div><label style={{ fontWeight: 700 }}>Message</label><textarea required value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} placeholder="How can we help you?" style={{ minHeight: 140, paddingTop: 16, marginTop: 8 }} /></div>
                  {enquiryStatus.error && <p style={{ color: "var(--mk-danger)", margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{enquiryStatus.error}</p>}
                  <button type="submit" disabled={enquiryStatus.loading} style={{ height: 56, fontSize: "1.1rem", fontWeight: 900, marginTop: 8 }}>
                    {enquiryStatus.loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--mk-border)", background: "var(--mk-bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--mk-text-faint)" }}>Our Partners</h3>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "64px", flexWrap: "wrap", opacity: 0.4 }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--mk-text)", letterSpacing: "-0.02em" }}>MAKAVERSE PUBLISHER</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--mk-text)", letterSpacing: "-0.02em" }}>MAKAVERSE SCIENCE SERIES</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--mk-text)", letterSpacing: "-0.02em" }}>BEST BRAIN COLLEGE</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "64px 0", borderTop: "1px solid var(--mk-border)", background: "var(--mk-bg-elev)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "32px" }}>
          <div>
            <div style={{ marginBottom: "16px" }}><Logo size="sm" linkTo={null} /></div>
            <p className="text-faint" style={{ fontSize: "0.95rem", margin: 0 }}>© {new Date().getFullYear()} MAKAVERSE EdTech. Built for excellence.</p>
          </div>
          <div style={{ display: "flex", gap: "40px" }}>
            <Link to="/leaderboard" className="text-dim" style={{ fontSize: "1rem", fontWeight: 700 }}>Leaderboard</Link>
            <Link to="/arena" className="text-dim" style={{ fontSize: "1rem", fontWeight: 700 }}>Arena</Link>
            <Link to="/zoom" className="text-dim" style={{ fontSize: "1rem", fontWeight: 700 }}>Zoom Classes</Link>
          </div>
        </div>
      </footer>

      {/* DYNAMIC TICKER */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 52, background: "var(--mk-glass-bg-strong)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--mk-border)", display: "flex", alignItems: "center", overflow: "hidden", zIndex: 100 }}>
        <div style={{ background: "var(--mk-accent)", color: "var(--mk-accent-text)", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", fontWeight: 900, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap", zIndex: 2, boxShadow: "4px 0 12px rgba(0,0,0,0.1)" }}>HEADLINES</div>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "ticker-scroll 96s linear infinite", gap: 40 }}>
           {ticker.length > 0 ? ticker.map((t, i) => (
             <div key={i} style={{ padding: "0 40px", fontSize: "1rem", fontWeight: 600, color: "var(--mk-text)", display: "flex", alignItems: "center", gap: 16 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--mk-accent)" }}></span>{t.headline}</div>
           )) : <div style={{ padding: "0 40px", fontSize: "1rem", fontWeight: 500, color: "var(--mk-text)" }}>Loading facts...</div>}
        </div>
        <style>{`@keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }`}</style>
      </div>
    </div>
  );
}