import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: "60px 16px", maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 8 }}>Terms of Service & Privacy Policy</h1>
        <p className="text-dim">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="card stack" style={{ padding: 40, gap: 24, lineHeight: 1.7 }}>
        <section>
          <h3 style={{ color: "var(--mk-accent)", marginBottom: 8 }}>1. Account Creation & Security</h3>
          <p className="text-dim">
            When you create an account on MAKAVERSE, you agree to provide accurate information. You are responsible for maintaining the confidentiality of your username and password. You must notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h3 style={{ color: "var(--mk-accent)", marginBottom: 8 }}>2. Multiple Accounts (Strictly Prohibited)</h3>
          <p className="text-dim">
            Each student is permitted only <strong>one (1) free account</strong>. Creating multiple accounts to exploit the free trial, game the leaderboard, or manipulate the Vault economy is strictly prohibited. If we detect multiple accounts belonging to the same individual, we reserve the right to ban all associated accounts permanently.
          </p>
        </section>

        <section>
          <h3 style={{ color: "var(--mk-accent)", marginBottom: 8 }}>3. Free Trial & Premium Upgrades</h3>
          <p className="text-dim">
            New accounts are granted a 7-day free trial with limited access. After the trial ends, access to advanced features (Mocks, AI Tutor, Arena) requires a Premium upgrade. Premium payments are handled securely via Paystack. <strong>All payments are final and non-refundable</strong> unless required by law.
          </p>
        </section>

        <section>
          <h3 style={{ color: "var(--mk-accent)", marginBottom: 8 }}>4. Academic Integrity</h3>
          <p className="text-dim">
            MAKAVERSE is a preparation tool. Using our platform to cheat in real-life exams is strictly forbidden. Furthermore, attempting to hack, scrape, or reverse-engineer our question bank or AI systems will result in an immediate ban.
          </p>
        </section>

        <section>
          <h3 style={{ color: "var(--mk-accent)", marginBottom: 8 }}>5. Privacy & Data Collection</h3>
          <p className="text-dim">
            We collect data such as your name, school, exam target, and test performance to personalize your learning experience. We do not sell your personal data to third parties. Your performance data is visible to your school administrators and on public leaderboards (display name only).
          </p>
        </section>

        <section>
          <h3 style={{ color: "var(--mk-accent)", marginBottom: 8 }}>6. MAKAVERSE Awards & Championships</h3>
          <p className="text-dim">
            To win a Championship or the MAKAVERSE Award, you must compete fairly. Any student found using bots, sharing access codes, or exploiting bugs to win will forfeit their title and be removed from the Hall of Fame.
          </p>
        </section>

        <section style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--mk-border)" }}>
          <p className="text-dim" style={{ margin: 0 }}>
            By creating an account, you acknowledge that you have read, understood, and agreed to these terms. If you do not agree, please do not register on MAKAVERSE.
          </p>
        </section>
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link to="/register">
          <button style={{ padding: "12px 32px", fontWeight: 800 }}>← Back to Registration</button>
        </Link>
      </div>
    </div>
  );
}