import { useEffect, useState } from "react";
import { api } from "../api.js";
import { SUBJECT_LABELS, LEVEL_LABELS, EXAM_TARGET_LABELS } from "../constants.js";

export default function LibraryPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [filterSubject, setFilterSubject] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterTarget, setFilterTarget] = useState("");

  // Active PDF being viewed
  const [activePdf, setActivePdf] = useState(null);

  useEffect(() => {
    api.getStudyMaterials()
      .then(setMaterials)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="container" style={{ padding: "40px 16px", maxWidth: 800, margin: "0 auto" }}>
        <div className="card" style={{ textAlign: "center", padding: 40, borderTop: "4px solid var(--mk-danger)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🔒</div>
          <h2 style={{ color: "var(--mk-danger)", marginBottom: 12 }}>Premium Required</h2>
          <p className="text-dim" style={{ margin: "0 0 20px" }}>{error}</p>
          <button onClick={() => window.location.href = "/dashboard"}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const filtered = materials.filter(m => {
    if (filterSubject && m.subject !== filterSubject) return false;
    if (filterLevel && m.education_level !== filterLevel) return false;
    if (filterTarget && m.exam_target !== filterTarget) return false;
    return true;
  });

  const uniqueSubjects = [...new Set(materials.map(m => m.subject))];
  const uniqueLevels = [...new Set(materials.map(m => m.education_level))];
  const uniqueTargets = [...new Set(materials.map(m => m.exam_target).filter(Boolean))];

  async function handleReport(materialId, materialTitle) {
    const reason = window.prompt(`Report an issue with "${materialTitle}"\n\nPlease describe the problem (e.g. broken link, wrong file, unreadable):`);
    if (!reason) return;
    try {
      // Note: We're using the generic question report endpoint here since it just logs to the admin inbox
      // In a full production system, you'd create a separate /library/report endpoint
      await api.reportQuestion(materialId, "library_issue", reason);
      alert("✅ Thank you! Your report has been sent to the admin.");
    } catch (err) {
      alert("Failed to send report: " + err.message);
    }
  }

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 1000, margin: "0 auto" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "var(--mk-text)" }}>📚 Study Library</h1>
        <p className="text-dim" style={{ margin: "8px 0 0 0" }}>Deep dive into curated materials, textbooks, and past questions.</p>
      </div>

      {/* FILTERS */}
      <div className="card" style={{ padding: 20, marginBottom: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Subject</label>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={{ height: 40 }}>
            <option value="">All Subjects</option>
            {uniqueSubjects.map(s => <option key={s} value={s}>{SUBJECT_LABELS[s] || s}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Class Level</label>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} style={{ height: 40 }}>
            <option value="">All Levels</option>
            {uniqueLevels.map(l => <option key={l} value={l}>{LEVEL_LABELS[l] || l}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Exam Target</label>
          <select value={filterTarget} onChange={(e) => setFilterTarget(e.target.value)} style={{ height: 40 }}>
            <option value="">All Targets</option>
            {uniqueTargets.map(t => <option key={t} value={t}>{EXAM_TARGET_LABELS[t] || t}</option>)}
          </select>
        </div>
      </div>

      {/* LIBRARY GRID */}
      {loading ? (
        <div className="exam-grid">
          <div className="mk-skeleton mk-skeleton-card" style={{ height: 200 }} />
          <div className="mk-skeleton mk-skeleton-card" style={{ height: 200 }} />
          <div className="mk-skeleton mk-skeleton-card" style={{ height: 200 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, borderStyle: "dashed" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <h3 style={{ margin: 0, color: "var(--mk-text)" }}>No materials found</h3>
          <p className="text-dim" style={{ margin: "8px 0 0 0" }}>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {filtered.map((item) => (
            <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", borderTop: "4px solid var(--mk-brand-secondary)", padding: 24 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-brand-secondary)", marginBottom: 8 }}>
                {SUBJECT_LABELS[item.subject] || item.subject}
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 12px", color: "var(--mk-text)", flex: 1 }}>{item.title}</h3>
              <p className="text-dim" style={{ fontSize: "0.9rem", margin: "0 0 20px", lineHeight: 1.5 }}>{item.description}</p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: "0.75rem", background: "var(--mk-bg-elev-2)", padding: "4px 8px", borderRadius: 4, fontWeight: 700, color: "var(--mk-text-dim)" }}>
                  {LEVEL_LABELS[item.education_level] || item.education_level}
                </span>
                {item.exam_target && (
                  <span style={{ fontSize: "0.75rem", background: "rgba(0, 212, 255, 0.1)", padding: "4px 8px", borderRadius: 4, fontWeight: 700, color: "var(--mk-accent)" }}>
                    {EXAM_TARGET_LABELS[item.exam_target] || item.exam_target}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setActivePdf(item)} style={{ flex: 1 }}>
                  Read Book →
                </button>
                <button 
                  onClick={() => handleReport(item.id, item.title)} 
                  className="secondary" 
                  style={{ padding: "0 12px", borderColor: "var(--mk-border-strong)", color: "var(--mk-text-faint)" }}
                  title="Report broken link or bad file"
                >
                  🚩
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL-SCREEN PDF MODAL */}
      {activePdf && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.95)", display: "flex", flexDirection: "column" }}>
          
          {/* MODAL HEADER */}
          <div style={{ background: "var(--mk-bg-elev)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--mk-border)" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-brand-secondary)" }}>
                {SUBJECT_LABELS[activePdf.subject] || activePdf.subject}
              </div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--mk-text)" }}>{activePdf.title}</h2>
            </div>
            <button onClick={() => setActivePdf(null)} style={{ background: "var(--mk-danger)", color: "#fff", padding: "8px 16px", fontWeight: 700 }}>
              ✕ Close
            </button>
          </div>

          {/* PDF IFRAME */}
          <div style={{ flex: 1, background: "#2a2a2a" }}>
            <iframe
              src={`https://drive.google.com/file/d/${activePdf.drive_file_id}/preview`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              allow="autoplay"
              title={activePdf.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}