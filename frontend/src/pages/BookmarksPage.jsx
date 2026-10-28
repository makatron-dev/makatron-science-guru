import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { SUBJECT_LABELS } from "../constants.js";
import ChemText from "../ChemText.jsx";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyBookmarks()
      .then((data) => setBookmarks(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 16px", maxWidth: 900 }}>
        <div className="mk-skeleton" style={{ height: 40, width: "30%", marginBottom: 24 }} />
        <div className="mk-skeleton" style={{ height: 200, width: "100%", marginBottom: 16 }} />
        <div className="mk-skeleton" style={{ height: 200, width: "100%" }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: 900, margin: "0 auto" }}>
      
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 8 }}>Saved Questions</h1>
        <p className="text-dim" style={{ fontSize: "1.05rem" }}>
          Review the questions you bookmarked during your exams. Use these to master your weak topics.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, borderStyle: "dashed", background: "var(--mk-bg-elev-2)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔖</div>
          <h2 style={{ margin: 0, fontSize: "1.3rem" }}>No saved questions yet</h2>
          <p className="text-dim" style={{ marginTop: 8, marginBottom: 24 }}>Click the "Save" button on any question during an exam to see it here.</p>
          <Link to="/dashboard?tab=exams"><button>Start an Exam</button></Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {bookmarks.map((b, i) => (
            <div key={b.question_id} className="card" style={{ padding: "32px", borderLeft: "4px solid var(--mk-warning)" }}>
              
              <div className="row-between" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--mk-warning)", background: "rgba(251, 191, 36, 0.1)", padding: "4px 10px", borderRadius: "var(--mk-radius-pill)" }}>
                    {SUBJECT_LABELS[b.subject] || b.subject}
                  </span>
                  {b.topic && <span className="text-faint" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{b.topic}</span>}
                </div>
                <span className="text-faint" style={{ fontSize: "0.8rem" }}>
                  Saved {new Date(b.bookmarked_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{ fontSize: "1.15rem", fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>
                <ChemText text={b.question_text} />
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["A", "B", "C", "D"].map((letter) => {
                  const isCorrect = b.correct_option === letter;
                  return (
                    <div 
                      key={letter} 
                      style={{ 
                        display: "flex", gap: 16, padding: "16px 20px", borderRadius: "var(--mk-radius)", 
                        border: isCorrect ? "2px solid var(--mk-success)" : "1px solid var(--mk-border)", 
                        background: isCorrect ? "rgba(0, 229, 153, 0.08)" : "var(--mk-bg)",
                        alignItems: "flex-start" 
                      }}
                    >
                      <span style={{ fontWeight: 900, minWidth: 24, color: isCorrect ? "var(--mk-success)" : "var(--mk-text-dim)" }}>{letter}.</span>
                      <span style={{ flex: 1, color: isCorrect ? "var(--mk-success)" : "var(--mk-text)", fontWeight: 500, fontSize: "1.05rem" }}>
                        <ChemText text={b.options[letter]} />
                      </span>
                      {isCorrect && <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-success)", background: "rgba(0, 229, 153, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>Correct Answer</span>}
                    </div>
                  );
                })}
              </div>

              {b.explanation && (
                <div style={{ marginTop: 20, padding: 20, background: "var(--mk-bg-elev-2)", borderRadius: "var(--mk-radius)", border: "1px solid var(--mk-border)" }}>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, fontWeight: 800, color: "var(--mk-accent)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>💡</span> Explanation
                  </div>
                  <div style={{ fontSize: "1rem", color: "var(--mk-text)", lineHeight: 1.6 }}>
                    <ChemText text={b.explanation} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}