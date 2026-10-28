import { useState, useEffect } from "react";
import { api } from "../api.js";

export default function SupportPage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);

  function loadHistory() {
    api.getMySupportMessages().then(setHistory).catch(() => {});
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await api.sendSupport(message);
      setStatus("Your message has been sent directly to the admin. We will reply shortly.");
      setMessage("");
      loadHistory(); // Instantly refresh the list below
    } catch (err) {
      setStatus("Error: " + err.message);
    }
    setBusy(false);
  }

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: 800 }}>
      
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 8 }}>Contact Support</h1>
        <p className="text-dim" style={{ fontSize: "1.05rem" }}>
          Having an issue with the platform? Send a direct message to the admin. You can track your tickets below.
        </p>
      </div>
      
      <div className="card stack" style={{ marginTop: 24, padding: 32, borderTop: "4px solid var(--mk-accent)" }}>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--mk-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "block" }}>
            Your Message
          </label>
          <textarea 
            rows="6" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Describe your issue here. The more detail, the better." 
            style={{ width: "100%", resize: "vertical", fontSize: "1rem", lineHeight: 1.6 }}
          />
        </div>
        
        <div className="row-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            {status && (
              <p style={{ color: status.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>
                {status}
              </p>
            )}
          </div>
          <button onClick={submit} disabled={busy || !message} style={{ padding: "12px 32px", fontSize: "1rem", fontWeight: 700 }}>
            {busy ? "Sending..." : "Send Message to Admin"}
          </button>
        </div>
      </div>

      {/* TICKET HISTORY */}
      <div style={{ marginTop: 48 }}>
        <div className="row-between" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>My Support Tickets</h2>
          <span className="text-faint" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{history.length} total</span>
        </div>

        {history.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, borderStyle: "dashed", background: "var(--mk-bg-elev-2)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📭</div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>No support tickets yet</h3>
            <p className="text-dim" style={{ margin: "8px 0 0 0" }}>When you send a message, it will appear here.</p>
          </div>
        ) : (
          <div className="stack" style={{ gap: 16 }}>
            {history.map((ticket) => (
              <div key={ticket.id} className="card" style={{ padding: "24px", borderLeft: "4px solid var(--mk-accent)", background: "var(--mk-bg-elev)" }}>
                <div className="row-between" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--mk-text)" }}>{ticket.subject}</div>
                  <div className="text-faint" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {new Date(ticket.sent_at).toLocaleString()}
                  </div>
                </div>
                
                {/* STUDENT'S MESSAGE */}
                <div style={{ fontSize: "0.95rem", color: "var(--mk-text-dim)", margin: 0, background: "var(--mk-bg-elev-2)", padding: 16, borderRadius: "var(--mk-radius)", border: "1px solid var(--mk-border)" }}>
                  "{ticket.body}"
                </div>

                {/* ADMIN'S REPLY (IF IT EXISTS) */}
                {ticket.reply ? (
                  <div style={{ marginTop: 16, padding: 16, background: "rgba(0, 229, 153, 0.08)", borderLeft: "4px solid var(--mk-success)", borderRadius: "var(--mk-radius)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: "1rem" }}>🛡️</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--mk-success)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Reply</span>
                      {ticket.replied_at && (
                        <span className="text-faint" style={{ fontSize: "0.75rem", marginLeft: "auto" }}>
                          {new Date(ticket.replied_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--mk-text)", lineHeight: 1.6 }}>
                      {ticket.reply}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--mk-border)", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mk-warning)", boxShadow: "0 0 8px var(--mk-warning)" }}></div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--mk-text-faint)" }}>
                      Awaiting reply. Admin replies will be sent to your registered email.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}