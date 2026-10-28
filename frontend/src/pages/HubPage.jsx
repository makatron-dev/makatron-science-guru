import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HubPage() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--mk-bg)" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, background: "var(--mk-accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "var(--mk-accent-text)", fontSize: "1.2rem" }}>M</div>
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--mk-text)" }}>MAKATRON EDTECH</div>
          <div style={{ fontSize: "0.75rem", color: "var(--mk-accent)", fontWeight: 600 }}>Redefining the Future of Learning</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>Welcome to the Ecosystem</h1>
        <p className="text-dim" style={{ textAlign: "center", marginBottom: 40, maxWidth: 600 }}>Select a platform to begin your journey.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, width: "100%", maxWidth: 800 }}>
          {/* CARD 1: CBT */}
          <div 
            onClick={() => navigate("/cbt")}
            className="card" 
            style={{ cursor: "pointer", transition: "transform 0.2s", borderTop: "4px solid var(--mk-accent)", padding: "32px" }} 
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} 
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>📝</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>MAKAVERSE EDTECH</h2>
            <p className="text-dim" style={{ fontSize: "0.95rem", margin: 0 }}>Practice tests, mock exams, and the championship arena.</p>
          </div>

          {/* CARD 2: SCIENCE GURU */}
          <div 
            onClick={() => setShowComingSoon("Science Guru")}
            className="card" 
            style={{ cursor: "pointer", opacity: 0.7, padding: "32px" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔬</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Science Guru</h2>
            <p className="text-dim" style={{ fontSize: "0.95rem", margin: 0 }}>Science lessons and resources. <span style={{ color: "var(--mk-accent)", fontWeight: 700 }}>Coming Soon</span></p>
          </div>

          {/* CARD 3: MAKATRON AI */}
          <div 
            onClick={() => setShowComingSoon("Makatron AI")}
            className="card" 
            style={{ cursor: "pointer", opacity: 0.7, padding: "32px" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>🤖</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Makatron AI</h2>
            <p className="text-dim" style={{ fontSize: "0.95rem", margin: 0 }}>Intelligent tutoring powered by AI. <span style={{ color: "var(--mk-accent)", fontWeight: 700 }}>Coming Soon</span></p>
          </div>

          {/* CARD 4: MAKATRON LEARN */}
          <div 
            onClick={() => setShowComingSoon("Makatron Learn")}
            className="card" 
            style={{ cursor: "pointer", opacity: 0.7, padding: "32px" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>🎓</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Makatron Learn</h2>
            <p className="text-dim" style={{ fontSize: "0.95rem", margin: 0 }}>Courses and other subjects. <span style={{ color: "var(--mk-accent)", fontWeight: 700 }}>Coming Soon</span></p>
          </div>
        </div>
      </div>

      {/* COMING SOON MODAL */}
      {showComingSoon && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card-elevated stack" style={{ maxWidth: 400, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🚀</div>
            <h2 style={{ margin: 0 }}>{showComingSoon}</h2>
            <p className="text-dim">We are working hard to bring this to life. Stay tuned for the official launch.</p>
            <button onClick={() => setShowComingSoon(null)} style={{ marginTop: 16 }}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}