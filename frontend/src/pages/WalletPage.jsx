import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function WalletPage() {
  const { user } = useAuth();

  if (!user) return null;

  const isPremium = !!user.is_premium;

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 800, margin: "0 auto" }}>
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "var(--mk-text)" }}>💼 My Wallet</h1>
        <p className="text-dim" style={{ margin: "8px 0 0 0" }}>Manage your coins, check your rank, and view your assets.</p>
      </div>

      <div className="form-grid-2" style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: "32px", background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))", border: "1px solid var(--mk-warning)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-warning)", marginBottom: 8 }}>Coin Balance</div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--mk-text)" }}>🪙 {user.coins || 0}</div>
          <p className="text-dim" style={{ fontSize: "0.9rem", marginTop: 8 }}>Spend these in the Vault on avatars and power-ups.</p>
        </div>

        <div className="card" style={{ padding: "32px", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))", border: "1px solid var(--mk-brand-secondary)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-brand-secondary)", marginBottom: 8 }}>Total XP</div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--mk-text)" }}>⚡ {user.xp || 0}</div>
          <p className="text-dim" style={{ fontSize: "0.9rem", marginTop: 8 }}>Your lifetime XP. Never spent, only grows.</p>
        </div>
      </div>

      <div className="card" style={{ padding: "32px", marginBottom: 32 }}>
        <h3 style={{ margin: "0 0 20px 0", color: "var(--mk-text)" }}>Current Assets</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div className="row-between" style={{ padding: "16px", background: "var(--mk-bg-elev-2)", borderRadius: 8, border: "1px solid var(--mk-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--mk-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>👤</div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--mk-text)" }}>Active Avatar</div>
                <div className="text-dim" style={{ fontSize: "0.85rem" }}>{user.avatar_id === "default" ? "Default Avatar" : user.avatar_id}</div>
              </div>
            </div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--mk-text-faint)", background: "var(--mk-bg)", padding: "4px 8px", borderRadius: 4 }}>Standard</div>
          </div>

          <div className="row-between" style={{ padding: "16px", background: "var(--mk-bg-elev-2)", borderRadius: 8, border: "1px solid var(--mk-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--mk-brand-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>⚔️</div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--mk-text)" }}>Active Title</div>
                <div className="text-dim" style={{ fontSize: "0.85rem" }}>{user.active_title || "Scavenger"}</div>
              </div>
            </div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--mk-text-faint)", background: "var(--mk-bg)", padding: "4px 8px", borderRadius: 4 }}>Rank 1</div>
          </div>

          <div className="row-between" style={{ padding: "16px", background: "var(--mk-bg-elev-2)", borderRadius: 8, border: "1px solid var(--mk-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: isPremium ? "var(--mk-success)" : "var(--mk-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", border: isPremium ? "none" : "1px solid var(--mk-border)" }}>⭐</div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--mk-text)" }}>Subscription</div>
                <div className="text-dim" style={{ fontSize: "0.85rem" }}>
                  {isPremium
                    ? (user.premium_expires_at
                        ? `Premium until ${new Date(user.premium_expires_at).toLocaleDateString()}`
                        : "Premium active")
                    : "Free Plan"}
                </div>
              </div>
            </div>
            {isPremium ? (
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--mk-success)", background: "rgba(34, 217, 154, 0.1)", padding: "4px 10px", borderRadius: 4 }}>PREMIUM</div>
            ) : (
              <Link to="/upgrade">
                <button style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem", fontWeight: 700 }}>Upgrade</button>
              </Link>
            )}
          </div>

        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link to="/vault">
          <button style={{ padding: "14px 32px", fontSize: "1rem", background: "var(--mk-warning)", color: "#000", fontWeight: 800 }}>
            Go to Vault to Spend Coins →
          </button>
        </Link>
      </div>

    </div>
  );
}