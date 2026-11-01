import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { Link } from "react-router-dom";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPaymentHistory().then(setHistory).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const isPremiumActive = user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date());
  const trialEnds = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const isTrialActive = !isPremiumActive && trialEnds && trialEnds > new Date();

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0 }}>My Subscription</h1>
        <p className="text-dim" style={{ marginTop: 8 }}>Manage your MAKAVERSE plan and billing history.</p>
      </div>

      {/* STATUS CARD */}
      <div className="card" style={{ padding: 32, background: isPremiumActive ? "linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent)" : "var(--mk-bg-elev)", border: `1px solid ${isPremiumActive ? "var(--mk-warning)" : "var(--mk-border)"}`, marginBottom: 32 }}>
        <div className="row-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: isPremiumActive ? "var(--mk-warning)" : "var(--mk-text-faint)", marginBottom: 8 }}>
              Current Plan
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: 0 }}>
              {isPremiumActive ? "Premium" : (isTrialActive ? "Free Trial" : "Free Plan")}
            </h2>
            {isTrialActive && (
              <p className="text-dim" style={{ marginTop: 8, marginBottom: 0 }}>Your trial ends on <strong>{trialEnds.toLocaleDateString()}</strong></p>
            )}
            {isPremiumActive && (
              <p className="text-dim" style={{ marginTop: 8, marginBottom: 0 }}>Renews on <strong>{new Date(user.premium_expires_at).toLocaleDateString()}</strong></p>
            )}
            {!isPremiumActive && !isTrialActive && (
              <p className="text-dim" style={{ marginTop: 8, marginBottom: 0 }}>Upgrade to unlock Mock Exams, AI Tutor, and Arena.</p>
            )}
          </div>
          {!isPremiumActive && (
            <Link to="/upgrade">
              <button style={{ padding: "14px 32px", fontWeight: 800 }}>Upgrade to Premium</button>
            </Link>
          )}
        </div>
      </div>

      {/* PAYMENT HISTORY */}
      <h3 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: 16 }}>Billing History</h3>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading history...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No payments yet.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>Reference</th>
                  <th style={{ padding: "16px" }}>Amount</th>
                  <th style={{ padding: "16px" }}>Date Paid</th>
                  <th style={{ padding: "16px" }}>Expires</th>
                </tr>
              </thead>
              <tbody>
                {history.map((t, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px", fontWeight: 600 }} className="mono">{t.reference}</td>
                    <td style={{ padding: "16px", fontWeight: 800 }}>₦{t.amount?.toLocaleString()}</td>
                    <td style={{ padding: "16px" }} className="text-dim">{t.paid_at ? new Date(t.paid_at).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "16px" }} className="text-dim">{t.expires_at ? new Date(t.expires_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}