import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import Logo from "./components/Logo.jsx";
import BugReporter from "./components/BugReporter.jsx";

const sectionTitleStyle = { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--mk-text-faint)", padding: "0 24px", marginTop: 24, marginBottom: 12, letterSpacing: "1px" };

export default function PublicNav({ mobileOpen, closeMobile }) {
  const { user, logout, loading } = useAuth();
  const isAdmin = user && user.is_admin;
  const location = useLocation();
  
  const [allowEdits, setAllowEdits] = useState(true);
  const [showBugReporter, setShowBugReporter] = useState(false);

  useEffect(() => {
    api.getDashboardSummary()
      .then(res => {
        if (res && typeof res.allow_profile_edits === 'boolean') {
          setAllowEdits(res.allow_profile_edits);
        }
      })
      .catch(() => {});
  }, [user]);

  const isLinkActive = (path, exactQuery = null) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    if (path === "/dashboard") {
      if (exactQuery) return currentPath === "/dashboard" && currentSearch.includes(exactQuery);
      return currentPath === "/dashboard" && (!currentSearch || currentSearch === "");
    }
    
    return currentPath === path;
  };

  const getLinkStyle = (isActive) => ({
    display: "flex", alignItems: "center", padding: "12px 20px", margin: "2px 12px",
    borderRadius: "8px", color: isActive ? "var(--mk-accent)" : "var(--mk-text-dim)",
    background: isActive ? "var(--mk-bg-elev-2)" : "transparent",
    fontWeight: isActive ? 600 : 500, fontSize: "0.95rem", textDecoration: "none", transition: "all 0.2s"
  });

  return (
    <>
      <aside className={`public-sidebar ${mobileOpen ? "open" : ""}`}>
        
        <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--mk-border)" }}>
          <Logo size="sm" linkTo={user ? "/dashboard" : "/"} />
        </div>

        <div style={{ padding: "12px 0", flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "0 24px" }}>
              <div className="mk-skeleton" style={{ height: 20, width: "40%", marginBottom: 24, marginTop: 24 }} />
              <div className="mk-skeleton" style={{ height: 40, width: "100%", marginBottom: 8 }} />
              <div className="mk-skeleton" style={{ height: 40, width: "100%", marginBottom: 8 }} />
              <div className="mk-skeleton" style={{ height: 40, width: "100%", marginBottom: 8 }} />
            </div>
          ) : (
            <>
              {!user && (
                <>
                  <div style={sectionTitleStyle}>Menu</div>
                  <Link to="/" style={getLinkStyle(isLinkActive("/"))} onClick={closeMobile}>Home</Link>
                  <Link to="/leaderboard" style={getLinkStyle(isLinkActive("/leaderboard"))} onClick={closeMobile}>Leaderboard</Link>
                  <Link to="/zoom" style={getLinkStyle(isLinkActive("/zoom"))} onClick={closeMobile}>Zoom Classes</Link>
                  <div style={sectionTitleStyle}>Account</div>
                  <Link to="/login" style={getLinkStyle(isLinkActive("/login"))} onClick={closeMobile}>Login</Link>
                  <Link to="/register" style={getLinkStyle(isLinkActive("/register"))} onClick={closeMobile}>Register</Link>
                </>
              )}

              {user && (
                <>
                  <div style={sectionTitleStyle}>Main</div>
                  {isAdmin ? (
                    <Link to="/admin" style={getLinkStyle(isLinkActive("/admin"))} onClick={closeMobile}>Admin Portal</Link>
                  ) : (
                    <>
                      <Link to="/dashboard" style={getLinkStyle(isLinkActive("/dashboard"))} onClick={closeMobile}>My Dashboard</Link>
                      <Link to="/dashboard?tab=school" style={getLinkStyle(isLinkActive("/dashboard", "tab=school"))} onClick={closeMobile}>🏫 My School</Link>
                      <Link to="/dashboard?tab=exams" style={getLinkStyle(isLinkActive("/dashboard", "tab=exams"))} onClick={closeMobile}>📝 Start Exam</Link>
                      <Link to="/arena" style={getLinkStyle(isLinkActive("/arena"))} onClick={closeMobile}>🏆 Championship Arena</Link>
                    </>
                  )}
                  <Link to="/leaderboard" style={getLinkStyle(isLinkActive("/leaderboard"))} onClick={closeMobile}>Leaderboard</Link>
                  <Link to="/zoom" style={getLinkStyle(isLinkActive("/zoom"))} onClick={closeMobile}>Live Zoom Classes</Link>

                  {!isAdmin && (
                    <>
                      <div style={sectionTitleStyle}>🎮 Fun & Perks</div>
                      <Link to="/wallet" style={getLinkStyle(isLinkActive("/wallet"))} onClick={closeMobile}>💼 My Wallet</Link>
                      <Link to="/vault" style={getLinkStyle(isLinkActive("/vault"))} onClick={closeMobile}>🏪 The Vault</Link>
                      <Link to="/collection" style={getLinkStyle(isLinkActive("/collection"))} onClick={closeMobile}>🎒 My Collection</Link>

                      <div style={sectionTitleStyle}>Academics</div>
                      <Link to="/library" style={getLinkStyle(isLinkActive("/library"))} onClick={closeMobile}>📚 Study Library</Link>
                      <Link to="/history" style={getLinkStyle(isLinkActive("/history"))} onClick={closeMobile}>My Test History</Link>
                      <Link to="/bookmarks" style={getLinkStyle(isLinkActive("/bookmarks"))} onClick={closeMobile}>🔖 Saved Questions</Link>
                    </>
                  )}

                  <div style={sectionTitleStyle}>Account</div>
                  {!isAdmin && allowEdits && (
                    <Link to="/dashboard?tab=profile" style={getLinkStyle(isLinkActive("/dashboard", "tab=profile"))} onClick={closeMobile}>⚙️ Edit Profile</Link>
                  )}
                  {!isAdmin && <Link to="/support" style={getLinkStyle(isLinkActive("/support"))} onClick={closeMobile}>Contact Support</Link>}
                  
                  {/* BUG REPORTER BUTTON */}
                  {!isAdmin && (
                    <div 
                      onClick={() => { setShowBugReporter(true); if (closeMobile) closeMobile(); }} 
                      style={{ ...getLinkStyle(false), cursor: "pointer" }}
                    >
                      🐛 Report a Bug
                    </div>
                  )}

                  <div onClick={logout} style={{ ...getLinkStyle(false), cursor: "pointer", color: "var(--mk-danger)" }}>Logout</div>
                </>
              )}
            </>
          )}
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="text-dim" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mount the modal here */}
      <BugReporter isOpen={showBugReporter} onClose={() => setShowBugReporter(false)} />
    </>
  );
}