import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function PowerLadderModal({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRanks()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data) return null;

  const { user_xp, ranks } = data;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      
      <div 
        className="card" 
        style={{ 
          width: "100%", 
          maxWidth: 900, 
          maxHeight: "90vh", 
          overflowY: "auto", 
          padding: 32, 
          position: "relative",
          background: "linear-gradient(180deg, var(--mk-bg-elev) 0%, var(--mk-bg) 100%)",
          border: "1px solid var(--mk-border-strong)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          style={{ position: "absolute", top: 16, right: 16, background: "var(--mk-bg-elev-2)", border: "1px solid var(--mk-border)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--mk-text)", fontSize: "1.2rem" }}
        >
          ✕
        </button>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 800, color: "var(--mk-text-faint)", marginBottom: 8 }}>
            The Hierarchy
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "var(--mk-text)" }}>
            Power Ladder
          </h2>
          <p className="text-dim" style={{ margin: "8px 0 0 0" }}>
            You have <strong style={{ color: "#a855f7" }}>{user_xp.toLocaleString()} XP</strong>. Climb the ranks to become the ultimate Lord Makaverse.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ranks.map((rank, idx) => {
            const isUnlocked = user_xp >= rank.req;
            const isCurrent = user_xp >= rank.req && (idx === ranks.length - 1 || user_xp < ranks[idx + 1].req);
            
            return (
              <div 
                key={rank.level}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "16px 24px",
                  borderRadius: "var(--mk-radius-lg)",
                  background: isCurrent ? "rgba(168, 85, 247, 0.15)" : isUnlocked ? "var(--mk-bg-elev-2)" : "transparent",
                  border: isCurrent ? "2px solid #a855f7" : isUnlocked ? "1px solid var(--mk-border)" : "1px dashed var(--mk-border)",
                  opacity: isUnlocked ? 1 : 0.6,
                  transition: "all 0.2s",
                  boxShadow: isCurrent ? "0 0 20px rgba(168, 85, 247, 0.3)" : "none"
                }}
              >
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: isUnlocked ? "#a855f7" : "var(--mk-bg)",
                  border: isUnlocked ? "none" : "2px solid var(--mk-border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: isUnlocked ? "#fff" : "var(--mk-text-faint)",
                  flexShrink: 0
                }}>
                  {isUnlocked ? rank.level : "🔒"}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: isUnlocked ? "var(--mk-text)" : "var(--mk-text-dim)" }}>
                    {rank.name}
                    {isCurrent && <span style={{ marginLeft: 12, fontSize: "0.7rem", background: "#a855f7", color: "#fff", padding: "2px 8px", borderRadius: 10, verticalAlign: "middle" }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--mk-text-dim)", marginTop: 4 }}>
                    {rank.req === 0 ? "Starting Rank" : `${rank.req.toLocaleString()} XP required`}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {isUnlocked ? (
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#22d99a" }}>
                      Unlocked
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)" }}>
                      {(rank.req - user_xp).toLocaleString()} XP to go
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}