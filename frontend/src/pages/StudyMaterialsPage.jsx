export default function StudyMaterialsPage() {
  return (
    <div className="container" style={{ padding: "80px 16px", maxWidth: 600, textAlign: "center" }}>
      <div style={{ fontSize: "4rem", marginBottom: 24 }}>📚</div>
      <h1>Study Materials</h1>
      <p className="text-dim" style={{ fontSize: "1.1rem", marginBottom: 32 }}>
        We are currently curating high-quality textbooks, formula sheets, and past questions for your curriculum. This section will be available soon.
      </p>
      <div className="card" style={{ background: "var(--mk-bg-elev-2)" }}>
        <h3 style={{ marginTop: 0 }}>What to expect:</h3>
        <ul style={{ textAlign: "left", paddingLeft: 20, color: "var(--mk-text-dim)", lineHeight: 1.8 }}>
          <li>Downloadable PDF formula sheets for Physics and Chemistry.</li>
          <li>Comprehensive notes for Biology practicals.</li>
          <li>Video tutorials from top educators.</li>
        </ul>
      </div>
    </div>
  );
}