import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import Logo from "../components/Logo.jsx";

export default function AdminLoginPage() {
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
      
      // FIX: Reject Student accounts on the Admin Login Page
      if (user.is_admin) {
        navigate("/admin");
      } else {
        logout(); // Instantly clear the token so they aren't logged in
        setErr("Access denied. This portal is for administrators only.");
      }
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--mk-bg)", padding: 20, position: "relative", overflow: "hidden" }}>
      
      {/* Vault Background Glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: "800px", height: "800px", background: "radial-gradient(circle, var(--mk-glow-accent-soft) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }}></div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 440 }}>
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Logo size="lg" linkTo={null} />
        </div>

        <div className="card-elevated" style={{ padding: "48px 40px", background: "var(--mk-glass-bg-strong)", backdropFilter: "blur(var(--mk-glass-blur))", border: "1px solid var(--mk-border-strong)" }}>
          
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 16px", background: "rgba(255, 107, 107, 0.1)", border: "1px solid rgba(255, 107, 107, 0.3)", borderRadius: "var(--mk-radius-pill)", color: "var(--mk-danger)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Restricted Access
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: "0 0 8px", color: "var(--mk-text)", letterSpacing: "-0.02em" }}>Admin Command Center</h1>
            <p className="text-dim" style={{ fontSize: "0.95rem", margin: 0 }}>Please authenticate to proceed.</p>
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label>Admin Username</label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="e.g. MSG-ADMIN1"
                autoComplete="off"
                style={{ height: 52, background: "var(--mk-bg)", border: "1px solid var(--mk-border-strong)" }}
              />
            </div>
            
            <div>
              <label>Master Password</label>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••••••"
                  style={{ height: 52, paddingRight: "52px", background: "var(--mk-bg)", border: "1px solid var(--mk-border-strong)" }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--mk-text-faint)", display: "flex", alignItems: "center", padding: 0 }}
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
              <div style={{ padding: "12px 16px", background: "rgba(255, 107, 107, 0.1)", borderLeft: "3px solid var(--mk-danger)", borderRadius: 4 }}>
                <p style={{ color: "var(--mk-danger)", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>{err}</p>
              </div>
            )}

            <button type="submit" disabled={busy} style={{ height: 52, fontSize: "1rem", fontWeight: 800, marginTop: 8 }}>
              {busy ? "Authenticating..." : "Access Command Center"}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--mk-border)", textAlign: "center" }}>
            <p className="text-faint" style={{ fontSize: "0.75rem", margin: "0 0 16px", fontWeight: 600 }}>
              Protected by MAKAVERSE Security.<br/>Unauthorized access is strictly prohibited.
            </p>
            <Link to="/login" style={{ fontSize: "0.85rem", color: "var(--mk-text-dim)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span>←</span> Back to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}