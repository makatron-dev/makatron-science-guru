import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await api.resetPassword({ token, password });
      setMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setBusy(false);
  }

  return (
    <div className="container" style={{ padding: "64px 16px", maxWidth: 420 }}>
      <div className="card-elevated stack">
        <h1 style={{ margin: 0, textAlign: "center" }}>Create New Password</h1>
        
        <form onSubmit={submit} className="stack">
          <div>
            <label>New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {msg && <p style={{ color: msg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600 }}>{msg}</p>}
          <button type="submit" disabled={busy}>{busy ? "Resetting..." : "Reset Password"}</button>
        </form>
      </div>
    </div>
  );
}