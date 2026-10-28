import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

export default function WalletPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getPaymentHistory()
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setPaymentsLoading(false));
  }, [user]);

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

      {/* BILLING HISTORY */}
      <div className="card" style={{ padding: 0, marginBottom: 32 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--mk-text)" }}>Billing History</h3>
            <p className="text-faint" style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>Last 3 payments</p>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--mk-text-faint)", textTransform: "uppercase", letterSpacing: "1px" }}>Paystack</span>
        </div>

        {paymentsLoading ? (
          <div style={{ padding: 32 }}>
            <div className="mk-skeleton" style={{ height: 20, width: "60%", marginBottom: 12 }} />
            <div className="mk-skeleton" style={{ height: 20, width: "40%" }} />
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8, opacity: 0.5 }}>🧾</div>
            <p className="text-dim" style={{ margin: 0, fontSize: "0.9rem" }}>No payments yet. Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "14px 24px" }}>Reference</th>
                  <th style={{ padding: "14px 24px" }}>Amount</th>
                  <th style={{ padding: "14px 24px" }}>Status</th>
                  <th style={{ padding: "14px 24px" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px 24px", fontFamily: "monospace", fontSize: "0.8rem", color: "var(--mk-text-dim)" }}>
                      {p.reference}
                    </td>
                    <td style={{ padding: "16px 24px", fontWeight: 700, color: "var(--mk-text)" }}>
                      ₦{Number(p.amount).toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        background: p.status === "success" ? "rgba(34, 217, 154, 0.1)" : p.status === "pending" ? "rgba(251, 191, 36, 0.1)" : "rgba(255, 107, 107, 0.1)",
                        color: p.status === "success" ? "var(--mk-success)" : p.status === "pending" ? "var(--mk-warning)" : "var(--mk-danger)",
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }} className="text-dim">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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