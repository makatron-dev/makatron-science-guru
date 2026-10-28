import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { SUBJECT_LABELS } from "../constants.js";

export default function HistoryPage() {
  const [tests, setTests] = useState(null);

  useEffect(() => {
    api.myTests().then(setTests).catch(() => setTests([]));
  }, []);

  return (
    <div className="container" style={{ padding: "32px 16px", width: "100%" }}>
      <h1 style={{ marginBottom: 8 }}>Test History</h1>
      <p className="text-dim" style={{ marginBottom: 24 }}>A complete record of all your practice and mock exams.</p>

      {!tests ? (
        <p>Loading...</p>
      ) : tests.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p className="text-dim">You haven't taken any tests yet.</p>
          <Link to="/dashboard"><button style={{ marginTop: 16 }}>Go to Dashboard</button></Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>Subject</th>
                  <th style={{ padding: "16px" }}>Mode</th>
                  <th style={{ padding: "16px" }}>Score</th>
                  <th style={{ padding: "16px" }}>Date</th>
                  <th style={{ padding: "16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{SUBJECT_LABELS[t.subject] || t.subject}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: t.mode === "mock" ? "rgba(0, 212, 255, 0.1)" : "var(--mk-bg-elev-2)", color: t.mode === "mock" ? "var(--mk-accent)" : "var(--mk-text-dim)" }}>
                        {t.mode === "mock" ? "MOCK" : "PRACTICE"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontWeight: 700, color: "var(--mk-success)" }}>{t.score}</td>
                    <td style={{ padding: "16px" }} className="text-dim">{t.submitted_at ? new Date(t.submitted_at).toLocaleDateString() : "-"}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <Link to={"/test/" + t.id + "/result"}>
                        <button className="secondary" style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem" }}>Review</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}