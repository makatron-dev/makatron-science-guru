import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

function getTrialInfo(user) {
  if (!user) return { state: "none" };
  if (user.is_premium) {
    const expiresAt = user.premium_expires_at ? new Date(user.premium_expires_at) : null;
    return { state: "premium", expiresAt, isLifetime: !expiresAt };
  }
  if (!user.trial_ends_at) return { state: "none" };
  const ends = new Date(user.trial_ends_at);
  const msLeft = ends.getTime() - Date.now();
  if (msLeft <= 0) return { state: "expired", endsAt: ends };
  return { state: "trial", daysLeft: Math.ceil(msLeft / 86400000), endsAt: ends };
}

export default function UpgradePage() {
  const { user, refreshUser } = useAuth();
  const [paystackReady, setPaystackReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => setPaystackReady(true);
    script.onerror = () => setPaystackReady(false);
    document.body.appendChild(script);
  }, []);

  if (!user) return null;

  const trial = getTrialInfo(user);

  async function handleUpgrade() {
    setBusy(true);
    setError("");
    try {
      const res = await api.initPayment("monthly");

      if (!res || !res.ok) {
        throw new Error("Payment initialization failed.");
      }

      if (!PAYSTACK_PUBLIC_KEY || !paystackReady || !window.PaystackPop) {
        if (res.authorization_url) {
          window.location.href = res.authorization_url;
          return;
        }
        throw new Error("Paystack is not configured. Please contact support.");
      }

      if (!user.email) {
        throw new Error("Please add an email to your profile before upgrading.");
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: 500000,
        ref: res.reference,
        metadata: {
          user_id: user.id,
          plan_type: "monthly",
          display_name: user.display_name,
        },
        onSuccess: async function (response) {
          try {
            await api.verifyPayment(res.reference);
          } catch (err) {
            console.error("Verify failed, waiting for webhook", err);
          }
          setSuccess(true);
          if (refreshUser) {
            setTimeout(() => { refreshUser().catch(() => {}); }, 1500);
          }
        },
        onCancel: function () {
          setBusy(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      setError(err.message || "Payment could not be started.");
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="container" style={{ padding: "60px 16px", maxWidth: 700, margin: "0 auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "60px 24px", borderTop: "4px solid var(--mk-success)" }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 12, color: "var(--mk-text)" }}>Payment Received</h1>
          <p className="text-dim" style={{ fontSize: "1.05rem", marginBottom: 32, lineHeight: 1.6 }}>
            Thank you for upgrading! Your premium access is active. Enjoy the full MAKAVERSE experience.
          </p>
          <Link to="/dashboard">
            <button style={{ padding: "14px 32px", fontSize: "1rem", fontWeight: 800 }}>Go to Dashboard →</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 1100, margin: "0 auto" }}>
      
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>⭐</div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: 16, color: "var(--mk-text)", letterSpacing: "-0.02em" }}>
          Unlock MAKAVERSE Premium
        </h1>
        <p className="text-dim" style={{ fontSize: "1.1rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Everything you need to dominate your exams, in one place. No limits. No distractions. Just results.
        </p>
      </div>

      {trial.state === "premium" && (
        <div style={{ background: "rgba(34, 217, 154, 0.1)", border: "1px solid var(--mk-success)", padding: 20, borderRadius: 12, marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontWeight: 800, color: "var(--mk-success)", fontSize: "1.1rem", marginBottom: 4 }}>⭐ You are already Premium</div>
          <div className="text-dim" style={{ fontSize: "0.95rem" }}>
            {trial.expiresAt ? `Active until ${trial.expiresAt.toLocaleDateString()}.` : "Enjoy full access."}
          </div>
        </div>
      )}

      {trial.state === "trial" && (
        <div style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid var(--mk-warning)", padding: 20, borderRadius: 12, marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontWeight: 800, color: "var(--mk-warning)", fontSize: "1.1rem", marginBottom: 4 }}>
            🎁 {trial.daysLeft} day{trial.daysLeft === 1 ? "" : "s"} left in your free trial
          </div>
          <div className="text-dim" style={{ fontSize: "0.95rem" }}>Lock in Premium before it ends to keep uninterrupted access.</div>
        </div>
      )}

      {trial.state === "expired" && (
        <div style={{ background: "rgba(255, 107, 107, 0.1)", border: "1px solid var(--mk-danger)", padding: 20, borderRadius: 12, marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontWeight: 800, color: "var(--mk-danger)", fontSize: "1.1rem", marginBottom: 4 }}>🔒 Your trial has ended</div>
          <div className="text-dim" style={{ fontSize: "0.95rem" }}>Upgrade now to unlock AI Tutor, Library, Vault, and Mock Exams.</div>
        </div>
      )}

      {!PAYSTACK_PUBLIC_KEY && (
        <div style={{ background: "rgba(251, 191, 36, 0.08)", border: "1px dashed var(--mk-warning)", padding: 16, borderRadius: 8, marginBottom: 32 }}>
          <div style={{ fontWeight: 700, color: "var(--mk-warning)", fontSize: "0.9rem", marginBottom: 4 }}>⚠️ Payments not yet configured</div>
          <div className="text-dim" style={{ fontSize: "0.85rem" }}>
            Add <code>VITE_PAYSTACK_PUBLIC_KEY</code> to <code>frontend/.env</code> to enable checkout.
          </div>
        </div>
      )}

      <div className="form-grid-2" style={{ gap: 24, marginBottom: 48 }}>
        
        {/* FREE PLAN */}
        <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", letterSpacing: "1px", marginBottom: 8 }}>Free</div>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 4 }}>₦0</div>
          <div className="text-dim" style={{ fontSize: "0.9rem", marginBottom: 24 }}>forever</div>
          
          <div style={{ flex: 1 }}>
            {[
              { ok: true, label: "Unlimited practice tests" },
              { ok: true, label: "Leaderboard & streaks" },
              { ok: true, label: "Bookmarks & history" },
              { ok: false, label: "AI Tutor explanations" },
              { ok: false, label: "Study Library (PDFs)" },
              { ok: false, label: "Mock exams (one attempt each)" },
              { ok: false, label: "The Vault (avatars, titles, power-ups)" },
              { ok: false, label: "Championship arena access" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, opacity: f.ok ? 1 : 0.5 }}>
                <span style={{ fontSize: "1rem", color: f.ok ? "var(--mk-success)" : "var(--mk-text-faint)" }}>{f.ok ? "✓" : "✕"}</span>
                <span style={{ fontSize: "0.9rem", color: f.ok ? "var(--mk-text)" : "var(--mk-text-dim)" }}>{f.label}</span>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 24, padding: "12px", background: "var(--mk-bg-elev-2)", borderRadius: 8, textAlign: "center", fontSize: "0.85rem", fontWeight: 700, color: "var(--mk-text-faint)" }}>
            Current Plan
          </div>
        </div>

        {/* PREMIUM PLAN */}
        <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(0, 212, 255, 0.05))", border: "2px solid var(--mk-brand-secondary)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, fontSize: "8rem", opacity: 0.06, transform: "rotate(15deg)", pointerEvents: "none" }}>⭐</div>
          
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-brand-secondary)", letterSpacing: "1px" }}>Premium</div>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "4px 10px", borderRadius: 12, background: "var(--mk-brand-secondary)", color: "white" }}>BEST VALUE</span>
            </div>

            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-text)", marginBottom: 4 }}>
              ₦5,000
            </div>
            <div className="text-dim" style={{ fontSize: "0.9rem", marginBottom: 24 }}>
              per month, billed monthly
            </div>

            <div style={{ flex: 1 }}>
              {[
                "Everything in Free",
                "AI Tutor — step-by-step explanations",
                "Full Study Library access",
                "Mock exams (one attempt each)",
                "The Vault — avatars, titles, power-ups",
                "Championship arena access",
                "Coin & XP earning unlocked",
                "Priority customer support",
              ].map((label, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: "1rem", color: "var(--mk-brand-secondary)" }}>✓</span>
                  <span style={{ fontSize: "0.9rem", color: "var(--mk-text)" }}>{label}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ padding: 12, background: "rgba(255, 107, 107, 0.1)", border: "1px solid var(--mk-danger)", borderRadius: 8, marginBottom: 12 }}>
                <p style={{ margin: 0, color: "var(--mk-danger)", fontSize: "0.85rem", fontWeight: 600 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleUpgrade}
              disabled={busy || trial.state === "premium"}
              style={{ width: "100%", padding: "14px", fontSize: "1rem", fontWeight: 800, background: "var(--mk-brand-secondary)", color: "white", marginTop: 16 }}
            >
              {busy ? "Opening checkout..." : trial.state === "premium" ? "Already Premium" : "Upgrade to Premium →"}
            </button>
            
            <p className="text-faint" style={{ fontSize: "0.75rem", textAlign: "center", marginTop: 12, margin: 0 }}>
              Secure payment via Paystack. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 20, color: "var(--mk-text)" }}>Common Questions</h3>
        <div className="form-grid-2" style={{ gap: 24 }}>
          {[
            { q: "Can I cancel anytime?", a: "Yes. Monthly subscriptions can be cancelled at any time." },
            { q: "How does the trial work?", a: "New students get 7 days of full Premium access for free. No card required to start." },
            { q: "Is my payment secure?", a: "Yes. All payments are processed by Paystack, a PCI-DSS compliant payment processor trusted across Africa." },
            { q: "What if I already paid?", a: "Webhook confirmation is usually instant. If your account is not upgraded within 5 minutes, contact support." },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--mk-text)", marginBottom: 6 }}>{item.q}</div>
              <div className="text-dim" style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}