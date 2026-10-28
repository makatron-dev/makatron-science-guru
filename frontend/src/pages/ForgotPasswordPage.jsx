import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await api.forgotPassword(email);
      setMsg(res.message);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setBusy(false);
  }

  return (
    <div className="container" style={{ padding: "64px 16px", maxWidth: 420 }}>
      <div className="card-elevated stack">
        <h1 style={{ margin: 0, textAlign: "center" }}>Reset Password</h1>
        <p className="text-dim" style={{ textAlign: "center", marginBottom: 24 }}>
          Enter the email linked to your account and we will send you a reset link.
        </p>
        
        <form onSubmit={submit} className="stack">
          <div>
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {msg && <p style={{ color: "var(--mk-success)", fontWeight: 600 }}>{msg}</p>}
          <button type="submit" disabled={busy}>{busy ? "Sending..." : "Send Reset Link"}</button>
        </form>
        <Link to="/login" style={{ textAlign: "center", display: "block", marginTop: 16 }}>Back to Login</Link>
      </div>
    </div>
  );
}