import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import Logo from "../components/Logo.jsx";

export default function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const user = await login(username.trim(), password);
      
      if (user.is_admin) {
        logout();
        setErr("Admin accounts must use the Admin Portal URL.");
      } else {
        navigate("/dashboard");
      }
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", background: "var(--mk-bg)", overflow: "hidden" }}>
      
      {/* ========================================================= */}
      {/* LEFT SIDE - SCROLLABLE MARKETING PANEL (Hidden on Mobile) */}
      {/* ========================================================= */}
      <div 
        className="desktop-nav" 
        style={{ 
          flex: 1.2, 
          background: "linear-gradient(135deg, var(--mk-bg-elev), var(--mk-bg-elev-2))", 
          borderRight: "1px solid var(--mk-border-strong)", 
          display: "flex", 
          flexDirection: "column",
          overflowY: "auto",
          position: "relative",
          scrollbarWidth: "thin"
        }}
      >
        {/* Background Texture & Glow */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "50%", height: "100%", backgroundImage: "radial-gradient(circle, var(--mk-border) 1px, transparent 1.5px)", backgroundSize: "32px 32px", opacity: 0.4, pointerEvents: "none", zIndex: 0 }}></div>
        <div style={{ position: "fixed", top: "10%", left: "10%", width: "600px", height: "600px", background: "radial-gradient(circle, var(--mk-glow-accent-soft) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}></div>

        <div style={{ position: "relative", zIndex: 10, padding: "60px 80px 120px", display: "flex", flexDirection: "column", gap: "64px" }}>
          
          {/* Hero Section */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "var(--mk-radius-pill)", background: "rgba(0, 212, 255, 0.1)", border: "1px solid rgba(0, 212, 255, 0.3)", color: "var(--mk-accent)", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mk-accent)", boxShadow: "0 0 10px var(--mk-accent)" }}></span>
              The Gold Standard
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "24px" }}>
              Step into the <br/>
              <span className="mk-gradient-text">MAKAVERSE</span>
            </h1>
            <p className="text-dim" style={{ fontSize: "1.15rem", lineHeight: 1.6, maxWidth: "90%" }}>
              The ultimate CBT preparation platform for JAMB, WAEC, and IGCSE. Stop guessing, start mastering, and join thousands of students climbing to the top.
            </p>
          </div>

          {/* Feature Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[
              { icon: "⏱️", title: "Timed Mocks", desc: "Simulate real exam pressure." },
              { icon: "⚡", title: "Instant Solutions", desc: "Deep explanations for every Q." },
              { icon: "📊", title: "Track Progress", desc: "Identify and fix weak topics." },
              { icon: "🏆", title: "Global Rank", desc: "Compete on the leaderboard." }
            ].map((feat, i) => (
              <div key={i} className="mk-glass" style={{ padding: "24px", border: "1px solid var(--mk-glass-border)" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>{feat.icon}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "4px" }}>{feat.title}</h3>
                <p className="text-dim" style={{ fontSize: "0.85rem", margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Voices of Legends Preview */}
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-text-faint)", marginBottom: "24px" }}>Voices of Legends</h2>
            <div className="stack" style={{ gap: "16px" }}>
              {[
                { quote: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
                { quote: "The important thing is not to stop questioning.", author: "Albert Einstein" }
              ].map((legend, i) => (
                <div key={i} style={{ background: "var(--mk-bg)", padding: "24px", borderRadius: "var(--mk-radius)", borderLeft: "4px solid var(--mk-brand-secondary)" }}>
                  <p style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--mk-text)", marginBottom: "12px" }}>"{legend.quote}"</p>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--mk-accent)" }}>— {legend.author}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Leaderboard Card */}
          <div className="mk-glass" style={{ padding: "32px", border: "1px solid var(--mk-glass-border)", boxShadow: "var(--mk-shadow-lg)", background: "linear-gradient(180deg, var(--mk-glass-bg-strong), var(--mk-glass-bg))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--mk-border-strong)" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-warning)" }}>🏆 Live Global Leaderboard</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "rgba(0, 229, 153, 0.15)", color: "var(--mk-success)", padding: "4px 12px", borderRadius: "var(--mk-radius-pill)" }}>Top 3</span>
            </div>
            
            <div className="stack" style={{ gap: "20px" }}>
              {[
                { rank: 1, name: "Adebayo O.", pts: 4850, color: "var(--mk-warning)" },
                { rank: 2, name: "Fatima S.", pts: 4720, color: "var(--mk-text-dim)" },
                { rank: 3, name: "Chinedu E.", pts: 4610, color: "var(--mk-brand-warm)" }
              ].map((user) => (
                <div key={user.rank} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 900, color: user.color }}>#{user.rank}</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{user.name}</div>
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--mk-success)" }}>{user.pts} pts</div>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div style={{ textAlign: "center", paddingBottom: "40px" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "16px" }}>Ready to top your class?</h3>
            <Link to="/register">
              <button style={{ padding: "16px 32px", fontSize: "1.05rem", fontWeight: 800, borderRadius: "var(--mk-radius)" }}>
                Create Your Free Account
              </button>
            </Link>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE - LOGIN FORM (Fixed/Sticky)                    */}
      {/* ========================================================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          
          <div style={{ marginBottom: "32px", textAlign: "center", display: "flex", justifyContent: "center" }}>
            <Logo size="md" vertical={true} />
          </div>

          <div className="card" style={{ padding: "40px 32px", background: "var(--mk-glass-bg)", backdropFilter: "blur(var(--mk-glass-blur))", border: "1px solid var(--mk-glass-border)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Welcome Back</h1>
              <p className="text-dim" style={{ marginTop: 8, fontSize: "0.95rem" }}>Log in to continue your preparation.</p>
            </div>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label>Username</label>
                <input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="MSG-XXXXXX" 
                  style={{ height: 48 }} 
                />
              </div>
              
              <div>
                <label>Password</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••••••"
                    style={{ height: 48, paddingRight: "48px" }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--mk-text-faint)", display: "flex", padding: 0 }}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {err && (
                <div style={{ background: "rgba(255, 107, 107, 0.1)", borderLeft: "3px solid var(--mk-danger)", padding: "10px 14px", borderRadius: 4 }}>
                  <p style={{ color: "var(--mk-danger)", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>{err}</p>
                </div>
              )}

              <button type="submit" disabled={busy} style={{ height: 48, fontSize: "1rem", fontWeight: 700, marginTop: 8 }}>
                {busy ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24, borderTop: "1px solid var(--mk-border)", paddingTop: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--mk-text-dim)", fontWeight: 600 }}>Forgot your password?</Link>
              <p className="text-dim" style={{ margin: "12px 0 0", fontSize: "0.9rem" }}>New here? <Link to="/register" style={{ fontWeight: 700, color: "var(--mk-accent)" }}>Create an account</Link></p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}