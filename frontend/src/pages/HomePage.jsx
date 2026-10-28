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

// ---------- Voices of Legends Data ----------
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
      
      {/* 1. HOMEPAGE NAVBAR */}
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

      {/* 2. HERO SECTION */}
      <section style={{ position: "relative", padding: "140px 16px 100px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)", filter: "blur(40px)", zIndex: 0 }}></div>
        <div style={{ position: "absolute", bottom: "-20%", right: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)", filter: "blur(50px)", zIndex: 0 }}></div>

        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 24px", borderRadius: "var(--mk-radius-pill)", background: "var(--mk-glass-bg)", border: "1px solid var(--mk-glass-border)", color: "var(--mk-accent)", fontSize: "0.9rem", fontWeight: 800, marginBottom: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--mk-accent)", boxShadow: "0 0 10px var(--mk-accent)" }}></span>
            The Gold Standard for Science Excellence
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 900, color: "var(--mk-text)", lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "24px" }}>
            Master Your Exams.<br />
            <span className="mk-gradient-text" style={{ background: "linear-gradient(135deg, var(--mk-accent) 0%, var(--mk-brand-secondary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Claim Your Glory.</span>
          </h1>
          <p className="text-dim" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)", maxWidth: "800px", margin: "0 auto 56px", lineHeight: 1.6 }}>
            Welcome to the MAKAVERSE. We built the ultimate CBT training ground, wrapped it in a gamified arena, and added an AI tutor. From JAMB to WAEC, we don't just prepare you to pass—we prepare you to dominate. Compete, climb the ranks, and win the ultimate MAKAVERSE Award.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <Link to="/register">
              <button style={{ padding: "20px 48px", fontSize: "1.15rem", fontWeight: 900, borderRadius: "var(--mk-radius-pill)", boxShadow: "0 8px 32px rgba(0, 212, 255, 0.4)", animation: "pulse-glow 2s infinite" }}>
                Start Practicing Free
              </button>
            </Link>
            <Link to="/login"><button className="secondary" style={{ padding: "20px 48px", fontSize: "1.15rem", fontWeight: 700, borderRadius: "var(--mk-radius-pill)", background: "var(--mk-glass-bg)", backdropFilter: "blur(10px)" }}>I Have a Username</button></Link>
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

               {/* 🔭 MAKAVERSE SCIENCE OLYMPIAD (UI ONLY) */}
      <section style={{ padding: "120px 16px", background: "var(--mk-bg-elev)", borderTop: "1px solid var(--mk-border)", position: "relative", overflow: "hidden" }}>
        
        {/* Background Aesthetics */}
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 60%)", filter: "blur(80px)", zIndex: 0 }}></div>
        <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)", filter: "blur(50px)", zIndex: 0 }}></div>
        
        <div className="container" style={{ position: "relative", zIndex: 10, maxWidth: 1100 }}>
          <div className="mk-glass" style={{ padding: "64px 48px", borderRadius: "var(--mk-radius-lg)", border: "1px solid rgba(168, 85, 247, 0.4)", background: "linear-gradient(135deg, rgba(10, 22, 34, 0.95), rgba(168, 85, 247, 0.08))", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
            
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "60px" }}>
              
              {/* Left Side: The Trophy Graphic & Subject Chips */}
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

              {/* Right Side: The Copy & Details */}
              <div style={{ flex: "2 1 450px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ display: "inline-block", background: "var(--mk-brand-secondary)", color: "#fff", fontWeight: 900, fontSize: "0.75rem", padding: "6px 16px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Flagship Academic Event
                  </div>
                  <span style={{ color: "var(--mk-warning)", fontWeight: 800, fontSize: "0.85rem" }}>🌟 Grand Champion Title</span>
                </div>

                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, color: "var(--mk-text)", marginBottom: 20, lineHeight: 1.05 }}>
                  The MAKAVERSE <br/>
                  <span style={{ color: "var(--mk-brand-secondary)", textShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}>Science Olympiad</span>
                </h2>
                
                <p className="text-dim" style={{ fontSize: "1.15rem", lineHeight: 1.7, marginBottom: 32, maxWidth: 600 }}>
                  Beyond the weekly CBT championships lies the ultimate battleground for the nation's brightest minds. The Science Olympiad is an elite, high-stakes examination designed to separate the good from the great. 
                  <br/><br/>
                  Compete against top-tier students in grueling, advanced-level assessments. Only the sharpest minds will survive to claim the title of <strong style={{ color: "var(--mk-text)" }}>Olympiad Grand Champion</strong>.
                </p>

                {/* Prize Pool Box */}
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 40, padding: 24, background: "rgba(0,0,0,0.2)", borderRadius: "var(--mk-radius-md)", border: "1px solid var(--mk-border)" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 4 }}>Grand Prize</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--mk-warning)" }}>🏆 The Golden Trophy</div>
                  </div>
                  <div style={{ width: 1, background: "var(--mk-border)" }}></div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 4 }}>Recognition</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--mk-accent)" }}>Permanent Olympiad Hall of Fame</div>
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
                  <span className="text-faint" style={{ fontSize: "0.95rem", fontWeight: 600 }}>The next Olympiad is being prepared. Keep practicing.</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHAMPIONSHIP COUNTDOWN */}
      {!champLoading && champ && (
        <section style={{ padding: "0 16px 40px", position: "relative", zIndex: 10 }}>
          <div className="container" style={{ maxWidth: 1000 }}>
            <Link to="/arena" style={{ textDecoration: "none" }}>
              <div className="mk-glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, padding: "40px", background: "linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(168, 85, 247, 0.08))", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "var(--mk-radius-lg)", boxShadow: "0 8px 32px rgba(251, 191, 36, 0.1)", transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-warning)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>🏆</span> {champ.status === "live" ? "LIVE NOW" : "STARTING SOON"}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 8 }}>{champ.title}</div>
                  <div className="text-dim" style={{ fontSize: "1.05rem", fontWeight: 500 }}>Compete against the best. One attempt. Real stakes.</div>
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

      {/* 🏆 THE MAKAVERSE AWARD */}
      <section style={{ padding: "40px 16px 80px" }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(0, 0, 0, 0.5))", border: "1px solid var(--mk-warning)", borderRadius: "var(--mk-radius-lg)", padding: "48px 32px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "40px", boxShadow: "0 12px 48px rgba(251, 191, 36, 0.15)" }}>
            <div style={{ flex: "1 1 300px", textAlign: "center" }}>
              <div style={{ fontSize: "6rem", filter: "drop-shadow(0 0 32px rgba(251, 191, 36, 0.6))", lineHeight: 1 }}>🏆</div>
            </div>
            <div style={{ flex: "2 1 400px" }}>
              <div style={{ display: "inline-block", background: "var(--mk-warning)", color: "#000", fontWeight: 900, fontSize: "0.8rem", padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>The Ultimate Prize</div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 16, lineHeight: 1.1 }}>The MAKAVERSE Award</h2>
              <p className="text-dim" style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 24 }}>
                This isn't just a certificate. It is the highest honor a science student can achieve on this platform. The **#1 Ranked Student** in any concluded Championship Exam is awarded the MAKAVERSE Award—a permanent badge of excellence, recognized by schools and universities.
              </p>
              <Link to="/arena">
                <button style={{ background: "var(--mk-warning)", color: "#000", fontWeight: 900, padding: "12px 32px", boxShadow: "0 4px 16px rgba(251, 191, 36, 0.4)" }}>Compete for the Award</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 ADVERTISEMENT / FEATURED SECTION */}
      <section style={{ padding: "20px 16px 80px" }}>
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
              <p className="text-dim" style={{ fontSize: "1rem", marginBottom: "32px", lineHeight: 1.5 }}>Are you a school principal? Partner with MAKAVERSE to give your students an edge.</p>
              <a href="mailto:makaverseedtech@mail.com" style={{ width: "100%" }}><button style={{ padding: "16px 32px", fontWeight: 800, width: "100%", fontSize: "1rem", background: "var(--mk-warning)", color: "#000", boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)" }}>Contact Us for B2B</button></a>
            </HoverCard>
          </div>
        </div>
      </section>

      {/* 🚀 NEW: HOW IT WORKS (THE BLUEPRINT) */}
      <section style={{ padding: "100px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>Your Journey to Greatness</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>Three steps to transform from a regular student to a MAKAVERSE legend.</p>
          </div>
          <div className="form-grid-3">
            {[
              { step: "01", title: "Create Your Profile", desc: "Register for free. Choose your level, your target exam (JAMB/WAEC), and your starting avatar.", icon: "👤" },
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

      {/* 🏫 NEW: SCHOOL RIVALRY BANNER */}
      <section style={{ padding: "80px 16px", background: "var(--mk-bg)" }}>
        <div className="container">
          <div style={{ background: "linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", border: "1px solid var(--mk-accent)", borderRadius: "var(--mk-radius-lg)", padding: "48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, left: -20, fontSize: "10rem", opacity: 0.05 }}>🏫</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "16px", position: "relative", zIndex: 1 }}>Is Your School the Smartest in Nigeria?</h2>
            <p className="text-dim" style={{ fontSize: "1.1rem", maxWidth: "700px", margin: "0 auto 32px", position: "relative", zIndex: 1, lineHeight: 1.6 }}>
              Every test you take contributes points to your school's national ranking. Rally your classmates, dominate the state leaderboards, and bring the trophy home.
            </p>
            <Link to="/leaderboard"><button style={{ padding: "14px 40px", fontWeight: 800, position: "relative", zIndex: 1 }}>Check School Standings</button></Link>
          </div>
        </div>
      </section>

      {/* 4. TRUST BAR */}
      <section style={{ borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)", background: "var(--mk-bg-elev-2)", padding: "32px 0", overflow: "hidden" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "var(--mk-text-faint)" }}>Trusted by students from:</span>
          <div style={{ display: "flex", gap: "40px", opacity: 0.6, flexWrap: "wrap", justifyContent: "center" }}>
            {["LAGOS MODEL", "FGC WARRI", "BEST BRAIN COLLEGE ONITSHA", "DLHS", "KING'S COLLEGE"].map((school, i) => (
              <span key={i} style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--mk-text)", letterSpacing: "-0.02em" }}>{school}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ECOSYSTEM */}
      <section style={{ padding: "120px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>The MAKAVERSE Ecosystem</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>The complete operating system for science students. Everything you need to dominate your exams.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
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

      {/* 7. VOICES OF LEGENDS */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>Voices of Legends</h2>
            <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>Stand on the shoulders of giants. Let the greatest scientific minds inspire your journey.</p>
          </div>
          <div className="form-grid-2" style={{ gap: "24px" }}>
            {LEGENDS.map((legend, i) => (
              <HoverCard key={i} style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "20px", borderLeft: "4px solid var(--mk-brand-secondary)", background: "var(--mk-bg)" }}>
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

      {/* 8. LIVE LEADERBOARDS */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg)", borderTop: "1px solid var(--mk-border)" }}>
        <div className="container">
          <div className="row-between" style={{ marginBottom: "56px", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px" }}>Championship Leaderboards</h2>
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

          {/* SCHOOL + STATE PREVIEW GRID */}
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

          {/* HALL OF FAME */}
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
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--mk-bg-elev-2)", padding: 16, borderRadius: "var(--mk-radius-md)", border: "1px solid var(--mk-border)" }}>
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

      {/* 9. CERTIFICATE VERIFICATION */}
      <section style={{ padding: "120px 0", background: "var(--mk-bg-elev-2)", borderTop: "1px solid var(--mk-border)" }}>
        <div className="container" style={{ maxWidth: 700, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: 16 }}>Verify a Certificate</h2>
          <p className="text-dim" style={{ fontSize: "1.05rem", marginBottom: 40, lineHeight: 1.6 }}>
            Schools, parents, and employers can verify the authenticity of any MAKAVERSE certificate. 
            Enter the Certificate ID below (e.g. <code>MK-MOCK-00123</code>).
          </p>
          
          <form onSubmit={handleVerifyCert} className="row" style={{ gap: 12, maxWidth: 500, margin: "0 auto 32px" }}>
            <input required value={certId} onChange={(e) => setCertId(e.target.value)} placeholder="Enter Certificate ID" style={{ flex: 1, height: 56, fontSize: "1.05rem", textAlign: "center", textTransform: "uppercase", borderRadius: "var(--mk-radius-md)" }} />
            <button type="submit" disabled={certLoading} style={{ height: 56, padding: "0 32px", fontWeight: 800, fontSize: "1.05rem" }}>
              {certLoading ? "Checking..." : "Verify"}
            </button>
          </form>

          {certError && (
            <div style={{ background: "rgba(255, 107, 107, 0.1)", border: "1px solid var(--mk-danger)", padding: 24, borderRadius: "var(--mk-radius-md)", textAlign: "left" }}>
              <div style={{ fontWeight: 900, color: "var(--mk-danger)", marginBottom: 8, fontSize: "1.1rem" }}>❌ Invalid Certificate</div>
              <div style={{ color: "var(--mk-text)", fontSize: "1rem" }}>{certError}</div>
            </div>
          )}

          {certResult && (
            <div style={{ background: "rgba(34, 217, 154, 0.1)", border: "1px solid var(--mk-success)", padding: 32, borderRadius: "var(--mk-radius-md)", textAlign: "left" }}>
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

      {/* 📱 NEW: COMMUNITY & SOCIALS */}
      <section style={{ padding: "100px 0", background: "var(--mk-bg)", borderTop: "1px solid var(--mk-border)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px" }}>Join the MAKAVERSE Community</h2>
          <p className="text-dim" style={{ fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto 56px", lineHeight: 1.6 }}>
            Learning doesn't stop when you close the app. Follow us for daily science quizzes, exam tips, and exclusive giveaways.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
            {[
              { name: "Instagram", icon: "📸", url: "https://instagram.com/makaverseedtech", color: "#E1306C" },
              { name: "TikTok", icon: "🎵", url: "https://tiktok.com/@makaverseedtech", color: "#00f2fe" },
              { name: "Facebook", icon: "📘", url: "https://facebook.com/makaverseedtech", color: "#1877F2" },
              { name: "Telegram", icon: "✈️", url: "https://t.me/makaverseedtech", color: "#0088cc" },
              { name: "Threads", icon: "🧵", url: "https://threads.net/@makaverseedtech", color: "#ffffff" }
            ].map((social, i) => (
              <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.borderColor = social.color; e.currentTarget.style.boxShadow = `0 12px 24px ${social.color}40`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--mk-border)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {social.icon}
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

      {/* 12. FINAL CTA */}
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

      {/* 13. CONTACT & SUPPORT */}
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
                    <div style={{ fontSize: "2.2rem" }}>💬</div>
                    <div><div style={{ fontWeight: 800, fontSize: "1.1rem" }}>WhatsApp Us Directly</div><div className="text-dim" style={{ fontSize: "1rem", marginTop: 4 }}>0915 373 6491</div></div>
                  </HoverCard>
                </a>
                <a href="mailto:makaverseedtech@mail.com" style={{ textDecoration: "none" }}>
                  <HoverCard style={{ padding: "24px", display: "flex", alignItems: "center", gap: 20, borderLeft: "4px solid var(--mk-accent)" }}>
                    <div style={{ fontSize: "2.2rem" }}>📧</div>
                    <div><div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Email Support</div><div className="text-dim" style={{ fontSize: "1rem", marginTop: 4 }}>makaverseedtech@mail.com</div></div>
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

      {/* 14. PARTNERS */}
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

      {/* 15. FOOTER */}
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

      {/* 16. THE DYNAMIC TICKER */}
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