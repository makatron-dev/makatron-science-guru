import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ZAxis,
} from "recharts";
import { api } from "../api.js";
import { SUBJECT_LABELS } from "../constants.js";
import ChemText from "../ChemText.jsx";import { useAuth } from "../AuthContext.jsx";

function formatTime(seconds) {
  if (!seconds || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// Rushed-question threshold: any question where the aggregate
// median time-to-answer is under this many seconds is treated as "rushed".
const RUSHED_THRESHOLD_SECONDS = 5;

/* ---------------- SPEED VS ACCURACY CHART ---------------- */

function SpeedAccuracyChart({ breakdown }) {
  // Build the scatter dataset from whatever time data the backend returns.
  // X = time on question (seconds), Y = 1 if correct, 0 if not.
  // A small jitter on Y keeps points from stacking perfectly on top of each other.
  const data = useMemo(() => {
    if (!Array.isArray(breakdown)) return [];
    const points = [];
    breakdown.forEach((b) => {
      const t = typeof b.time_to_answer_seconds === "number" ? b.time_to_answer_seconds : null;
      if (t === null) return;
      points.push({
        x: t,
        y: b.is_correct ? 1 : 0,
        // Slight vertical jitter for readability
        yJitter: b.is_correct ? 1 + (Math.random() - 0.5) * 0.25 : 0 + (Math.random() - 0.5) * 0.25,
        label: b.question_text?.slice(0, 60) || "Question",
      });
    });
    return points;
  }, [breakdown]);

  // Classify each quadrant
  const counts = useMemo(() => {
    let fastCorrect = 0, slowCorrect = 0, fastWrong = 0, slowWrong = 0;
    data.forEach((p) => {
      const fast = p.x < RUSHED_THRESHOLD_SECONDS;
      if (p.y === 1) fast ? fastCorrect++ : slowCorrect++;
      else fast ? fastWrong++ : slowWrong++;
    });
    return { fastCorrect, slowCorrect, fastWrong, slowWrong, total: data.length };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--mk-text-dim)" }}>
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>📊</div>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Speed vs Accuracy</div>
        <div style={{ fontSize: "0.9rem" }}>
          Timing data isn't available yet. Keep practising — analytics will build up over time.
        </div>
      </div>
    );
  }

  const maxX = Math.max(...data.map((d) => d.x), 60);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900 }}>📊 Speed vs Accuracy</div>
          <div className="text-dim" style={{ fontSize: "0.85rem", marginTop: 2 }}>
            Where your answers landed on each question.
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.75rem", color: "var(--mk-text-dim)", flexWrap: "wrap" }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--mk-success)", marginRight: 6 }} />Correct</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--mk-danger)", marginRight: 6 }} />Wrong</span>
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 24, bottom: 40, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--mk-border)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Time"
              domain={[0, maxX]}
              tickFormatter={(v) => `${Math.round(v)}s`}
              stroke="var(--mk-text-dim)"
              style={{ fontSize: "0.75rem" }}
              label={{
                value: "Time spent on question",
                position: "insideBottom",
                offset: -10,
                fill: "var(--mk-text-dim)",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[-0.4, 1.4]}
              ticks={[0, 1]}
              tickFormatter={(v) => (v === 1 ? "Correct" : "Wrong")}
              stroke="var(--mk-text-dim)"
              style={{ fontSize: "0.75rem" }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--mk-bg-elev)",
                border: "1px solid var(--mk-border-strong)",
                borderRadius: 8,
                color: "var(--mk-text)",
                fontSize: "0.8rem",
              }}
              formatter={(value, name, props) => {
                if (name === "Time") return [`${Math.round(value)}s`, "Time"];
                return [value === 1 ? "Correct" : "Wrong", "Result"];
              }}
              labelFormatter={() => ""}
            />
            <ReferenceLine
              x={RUSHED_THRESHOLD_SECONDS}
              stroke="var(--mk-warning)"
              strokeDasharray="4 4"
              label={{
                value: `Rushed <${RUSHED_THRESHOLD_SECONDS}s`,
                fill: "var(--mk-warning)",
                fontSize: 11,
                position: "top",
              }}
            />
            <Scatter
              data={data.filter((d) => d.y === 1)}
              dataKey="yJitter"
              fill="var(--mk-success)"
              shape="circle"
            />
            <Scatter
              data={data.filter((d) => d.y === 0)}
              dataKey="yJitter"
              fill="var(--mk-danger)"
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 16 }}>
        <QuadrantStat label="Fast & Right" value={counts.fastCorrect} color="var(--mk-success)" />
        <QuadrantStat label="Fast & Wrong" value={counts.fastWrong} color="var(--mk-danger)" />
        <QuadrantStat label="Thoughtful & Right" value={counts.slowCorrect} color="var(--mk-success)" />
        <QuadrantStat label="Thoughtful & Wrong" value={counts.slowWrong} color="var(--mk-danger)" />
      </div>
    </div>
  );
}

function QuadrantStat({ label, value, color }) {
  return (
    <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--mk-bg-elev-2)", border: "1px solid var(--mk-border)" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-dim)", letterSpacing: 0.5, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.3rem", fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

/* ---------------- SVG ORNAMENTS ---------------- */

function GoldDefs({ id }) {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4e5b1" />
          <stop offset="30%" stopColor="#e6c883" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="70%" stopColor="#f4e5b1" />
          <stop offset="100%" stopColor="#a8842c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CornerFlourish({ gradientId }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
      <g fill="none" stroke={`url(#${gradientId})`} strokeLinecap="round">
        <path d="M 4,58 Q 4,4 58,4" strokeWidth="1.8" />
        <path d="M 13,62 Q 13,13 62,13" strokeWidth="0.7" />
        <path d="M 4,72 Q 4,68 8,68 Q 12,68 12,72" strokeWidth="0.8" />
        <path d="M 72,4 Q 68,4 68,8 Q 68,12 72,12" strokeWidth="0.8" />
      </g>
      <path d="M 20,22 L 26,16 L 32,22 L 26,28 Z" fill={`url(#${gradientId})`} />
      <circle cx="26" cy="22" r="1.3" fill={`url(#${gradientId})`} />
      <path d="M 42,9 Q 47,4 52,9 Q 47,14 42,9 Z" fill={`url(#${gradientId})`} opacity="0.75" />
      <path d="M 9,42 Q 4,47 9,52 Q 14,47 9,42 Z" fill={`url(#${gradientId})`} opacity="0.75" />
      <circle cx="40" cy="40" r="1.5" fill={`url(#${gradientId})`} />
    </svg>
  );
}

function GoldDivider({ gradientId, width = "95mm" }) {
  return (
    <svg
      viewBox="0 0 200 20"
      style={{ width, height: "4.5mm", display: "block", margin: "0 auto" }}
      preserveAspectRatio="none"
    >
      <line x1="0" y1="10" x2="76" y2="10" stroke={`url(#${gradientId})`} strokeWidth="1.3" />
      <line x1="124" y1="10" x2="200" y2="10" stroke={`url(#${gradientId})`} strokeWidth="1.3" />
      <path d="M 84,10 L 90,5 L 96,10 L 90,15 Z" fill={`url(#${gradientId})`} />
      <path d="M 116,10 L 110,5 L 104,10 L 110,15 Z" fill={`url(#${gradientId})`} />
      <path d="M 100,4 L 104,10 L 100,16 L 96,10 Z" fill={`url(#${gradientId})`} />
    </svg>
  );
}

function OrnateSeal({ gradientId, isChampion, primary }) {
  const sealPathId = `sealPath-${isChampion ? "c" : "m"}`;
  return (
    <svg viewBox="0 0 200 240" style={{ width: "45mm", height: "54mm", display: "block", overflow: "visible" }}>
      <polygon points="75,150 58,238 90,222 90,150" fill={primary} />
      <polygon points="75,150 58,238 90,222 90,150" fill={`url(#${gradientId})`} opacity="0.35" />
      <polygon points="125,150 142,238 110,222 110,150" fill={primary} />
      <polygon points="125,150 142,238 110,222 110,150" fill={`url(#${gradientId})`} opacity="0.35" />

      <circle cx="100" cy="88" r="88" fill={`url(#${gradientId})`} />
      <circle cx="100" cy="88" r="80" fill={primary} />

      <defs>
        <path id={sealPathId} d="M 100,88 m -72,0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
      </defs>
      <text fill={`url(#${gradientId})`} fontSize="9" fontWeight="900" letterSpacing="2.2" fontFamily="Georgia, serif">
        <textPath href={`#${sealPathId}`} startOffset="0">
          ★ MAKAVERSE ★ OFFICIAL SEAL ★ VERIFIED ★
        </textPath>
      </text>

      <circle cx="100" cy="88" r="52" fill={`url(#${gradientId})`} />
      <circle cx="100" cy="88" r="47" fill={primary} />

      <text x="100" y="102" textAnchor="middle" fontSize="40" fontWeight="900" fill={`url(#${gradientId})`} fontFamily="Georgia, serif">
        {isChampion ? "★" : "M"}
      </text>
      <text x="100" y="122" textAnchor="middle" fontSize="6" fontWeight="900" fill="#f4e5b1" letterSpacing="2.5" fontFamily="sans-serif">
        {isChampion ? "CHAMPION" : "EST. 2024"}
      </text>
    </svg>
  );
}

/* ---------------- CERTIFICATE COMPONENT ---------------- */

function Certificate({
  variant,
  user,
  school,
  certId,
  certDate,
  regNumber,
  studentUsername,
  score,
  pct,
  subjectLabel,
}) {
  const isChampion = variant === "champion";
  const gradientId = `goldGrad-${variant}`;

  const primary = isChampion ? "#4a1d6e" : "#0f2847";
  const textDark = "#1a2332";
  const textFaint = "#4a5568";

  return (
    <div className="mk-cert-print">
      <GoldDefs id={gradientId} />

      <div className="mk-cert-page">
        <div className="mk-cert-guilloche" />
        <div className="mk-cert-watermark" style={{ color: primary }}>
          {isChampion ? "CHAMPION" : "MAKAVERSE"}
        </div>
        <div className="mk-cert-frame-gold" />
        <div className="mk-cert-frame-mid" style={{ borderColor: `${primary}30` }} />
        <div className="mk-cert-frame-inner" style={{ borderColor: `${primary}20` }} />
        <div className="mk-cert-corner tl"><CornerFlourish gradientId={gradientId} /></div>
        <div className="mk-cert-corner tr"><CornerFlourish gradientId={gradientId} /></div>
        <div className="mk-cert-corner bl"><CornerFlourish gradientId={gradientId} /></div>
        <div className="mk-cert-corner br"><CornerFlourish gradientId={gradientId} /></div>

        <div className="mk-cert-content">
          <div className="mk-cert-header">
            <div className="mk-cert-brand">MAKAVERSE</div>
            <div style={{ fontSize: "10pt", fontWeight: "bold", letterSpacing: "0.45em", textTransform: "uppercase", color: primary, marginTop: "8px", fontFamily: "Georgia, serif" }}>
              {isChampion ? "Certificate of Championship" : "Certificate of Academic Excellence"}
            </div>
            <div style={{ marginTop: "10px" }}>
              <GoldDivider gradientId={gradientId} width="80mm" />
            </div>
          </div>

          <div className="mk-cert-recipient">
            <div style={{ fontSize: "12pt", fontStyle: "italic", color: textFaint, marginBottom: "10px", fontFamily: "Georgia, serif" }}>
              This certificate is proudly presented to
            </div>
            <div className="mk-cert-name">
              {user?.display_name || "Student Name"}
            </div>
            <div style={{ fontSize: "11pt", fontStyle: "italic", color: textFaint, marginTop: "10px", fontFamily: "Georgia, serif" }}>
              of
            </div>
            <div style={{ fontSize: "13pt", fontWeight: "bold", color: primary, marginTop: "4px", letterSpacing: "0.08em", fontFamily: "Georgia, serif", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {school}
            </div>
          </div>

          <div className="mk-cert-body">
            <div style={{ fontSize: "13.5pt", color: textDark, lineHeight: 1.6, fontFamily: "Georgia, serif" }}>
              {isChampion ? (
                <>
                  in recognition of outstanding performance and exceptional mastery demonstrated in the{" "}
                  <strong style={{ color: primary }}>MAKAVERSE CBT {subjectLabel} Arena</strong>.
                  <br /><br />
                  Securing a final score of{" "}
                  <strong style={{ color: "#a8842c", fontSize: "15pt", fontWeight: "bold" }}>{score} points</strong>{" "}
                  ({pct}%), this distinction reflects a remarkable commitment to academic excellence.
                </>
              ) : (
                <>
                  for successfully passing the official MAKAVERSE CBT{" "}
                  <strong style={{ color: primary }}>Mock Examination</strong> in{" "}
                  <strong style={{ color: primary }}>{subjectLabel}</strong>, achieving a final score of{" "}
                  <strong style={{ color: "#059669", fontSize: "15pt", fontWeight: "bold" }}>{score} points</strong>{" "}
                  ({pct}%). This achievement demonstrates a strong foundation in the subject.
                </>
              )}
            </div>
          </div>

          <div className="mk-cert-footer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 25mm" }}>
              <div style={{ textAlign: "center", width: "55mm" }}>
                <div style={{ fontSize: "14pt", fontWeight: "bold", color: textDark, borderBottom: "1px solid #94a3b8", paddingBottom: "6px", marginBottom: "8px", fontFamily: "Georgia, serif" }}>
                  {certDate}
                </div>
                <div style={{ fontSize: "8pt", textTransform: "uppercase", color: textFaint, letterSpacing: "0.15em", fontWeight: "bold", fontFamily: "sans-serif" }}>
                  Date Issued
                </div>
              </div>

              <div style={{ textAlign: "center", width: "65mm" }}>
                <div style={{ fontSize: "28pt", color: primary, fontFamily: "'Brush Script MT', 'Segoe Script', cursive", borderBottom: "1px solid #94a3b8", paddingBottom: "2px", marginBottom: "8px", transform: "rotate(-2deg)", lineHeight: 1.1 }}>
                  Dr. M. Oghenefega
                </div>
                <div style={{ fontSize: "8pt", textTransform: "uppercase", color: textFaint, letterSpacing: "0.15em", fontWeight: "bold", fontFamily: "sans-serif" }}>
                  Director of Academics
                </div>
              </div>

              <div style={{ width: "45mm", display: "flex", justifyContent: "center" }}>
                <OrnateSeal gradientId={gradientId} isChampion={isChampion} primary={primary} />
              </div>
            </div>
          </div>

          <div className="mk-cert-ids">
            <div style={{ marginBottom: "6px" }}>
              <GoldDivider gradientId={gradientId} width="50mm" />
            </div>
            <div style={{ fontSize: "8pt", fontWeight: "bold", color: textFaint, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
              Certificate ID: <span style={{ color: textDark }}>{certId}</span>
              <span style={{ margin: "0 8px", color: "#c9a961" }}>◆</span>
              Student ID: <span style={{ color: textDark }}>{studentUsername}</span>
              <span style={{ margin: "0 8px", color: "#c9a961" }}>◆</span>
              Reg No: <span style={{ color: textDark }}>{regNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function TestResultPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  const [err, setErr] = useState("");
  const [schoolName, setSchoolName] = useState("");
  
  // AI Tutor State
  const [aiExplanations, setAiExplanations] = useState({});
  const [aiLoading, setAiLoading] = useState({});

  useEffect(() => {
    api.testResult(parseInt(id, 10)).then(setR).catch((e) => setErr(e.message));

    api.getMySchool()
      .then((res) => {
        if (res && res.school_name) setSchoolName(res.school_name);
      })
      .catch(() => {});

    window.scrollTo(0, 0);
  }, [id]);

  async function handleAiExplain(qId, questionText, correctOption, optionsObj) {
    setAiLoading((prev) => ({ ...prev, [qId]: true }));
    const correctText = optionsObj[correctOption] || "Option " + correctOption;

    try {
      const res = await api.explainWithAI(questionText, correctText);
      setAiExplanations((prev) => ({ ...prev, [qId]: res.explanation }));
    } catch (e) {
      setAiExplanations((prev) => ({ ...prev, [qId]: "Error: " + (e.message || "Could not fetch AI explanation.") }));
    } finally {
      setAiLoading((prev) => ({ ...prev, [qId]: false }));
    }
  }

  async function handleReviewMistakes() {
    try {
      // Pass this test's id so "Review Mistakes" always reviews the test being viewed,
      // not the student's latest test.
      const res = await api.reviewMistakes(r?.test_id);
      // Store the FULL response so TestPage can hydrate the review test without
      // calling startTest again (which would create a duplicate test).
      sessionStorage.setItem("mk_review_pending", JSON.stringify(res));
      sessionStorage.setItem("mk_active_test", JSON.stringify({ testId: res.test_id }));
      navigate("/test/review/practice");
    } catch (err) {
      alert(err.message || "Could not start review.");
    }
  }

  if (err) {
    return (
      <div className="container" style={{ padding: "40px 16px", maxWidth: 600 }}>
        <div className="card" style={{ textAlign: "center", padding: 40, borderTop: "4px solid var(--mk-danger)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: "var(--mk-danger)", marginBottom: 12 }}>Error Loading Result</h2>
          <p style={{ color: "var(--mk-text)", margin: 0, marginBottom: 20 }}>{err}</p>
          <Link to="/dashboard"><button>Back to Dashboard</button></Link>
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="container" style={{ padding: "40px 16px", maxWidth: 800 }}>
        <div className="mk-skeleton" style={{ height: 300, width: "100%", marginBottom: 24 }} />
        <div className="mk-skeleton" style={{ height: 100, width: "100%", marginBottom: 16 }} />
        <div className="mk-skeleton" style={{ height: 100, width: "100%" }} />
      </div>
    );
  }

  const total = r.question_count;
  const pct = total > 0 ? Math.round((r.correct_count / total) * 100) : 0;
  const passed = pct >= 40;
  const hasMistakes = r.wrong_count > 0;

  const isCertificateEligible = (r.mode === "mock" || r.mode === "championship") && passed;
  const isChampionship = r.mode === "championship";

  const certId = `MK-${isChampionship ? "CHAMP" : "MOCK"}-${String(r.test_id).padStart(5, "0")}`;
  const certDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const regNumber = user?.id ? `REG-${String(user.id).padStart(6, "0")}` : "REG-UNKNOWN";
  const studentUsername = user?.username || "MSG-000000";
  const finalSchoolName = schoolName || user?.school_name || "MAKAVERSE Academy";
  const subjectLabel = SUBJECT_LABELS[r.subject] || r.subject;

  // Count rushed questions (per-question aggregate time-to-answer under threshold).
  const rushedQuestions = (r.breakdown || []).filter(
    (b) => typeof b.time_to_answer_seconds === "number" && b.time_to_answer_seconds < RUSHED_THRESHOLD_SECONDS
  );

  return (
    <>
      {/* ON-SCREEN RESULT VIEW */}
      <div className="mk-result-screen container" style={{ padding: "32px 16px", maxWidth: 900 }}>
        <div className="card" style={{ textAlign: "center", marginBottom: 40, padding: "48px 24px", position: "relative", overflow: "hidden", background: "linear-gradient(180deg, var(--mk-bg-elev) 0%, var(--mk-bg) 100%)", border: "1px solid var(--mk-border-strong)", boxShadow: "var(--mk-shadow-lg)" }}>
          <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 600, height: 400, background: `radial-gradient(circle, ${passed ? "var(--mk-glow-warm)" : "var(--mk-glow-accent)"} 0%, transparent 70%)`, pointerEvents: "none", opacity: 0.5 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 800, color: "var(--mk-text-dim)", marginBottom: 12 }}>
              {subjectLabel} • {isChampionship ? "Championship" : r.mode === "mock" ? "Mock Exam" : "Practice"}
            </div>

            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{passed ? "🎉" : "💪"}</div>

            <div style={{ fontSize: "6rem", fontWeight: 900, lineHeight: 1, marginBottom: 8, background: `linear-gradient(135deg, ${passed ? "var(--mk-success)" : "var(--mk-accent)"}, var(--mk-brand-secondary))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.2))" }}>
              {r.score}
            </div>
            <div className="text-dim" style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 32 }}>
              {r.correct_count} / {total} correct ({pct}%)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }} className="mk-dash-grid-4">
              <div style={{ padding: "16px", borderRadius: "var(--mk-radius)", background: "rgba(0, 229, 153, 0.1)", border: "1px solid rgba(0, 229, 153, 0.3)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-success)", marginBottom: 4 }}>Correct</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--mk-success)" }}>{r.correct_count}</div>
              </div>
              <div style={{ padding: "16px", borderRadius: "var(--mk-radius)", background: "rgba(255, 77, 77, 0.1)", border: "1px solid rgba(255, 77, 77, 0.3)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-danger)", marginBottom: 4 }}>Wrong</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--mk-danger)" }}>{r.wrong_count}</div>
              </div>
              <div style={{ padding: "16px", borderRadius: "var(--mk-radius)", background: "var(--mk-bg-elev-2)", border: "1px solid var(--mk-border-strong)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 4 }}>Skipped</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--mk-text-dim)" }}>{r.skipped_count}</div>
              </div>
              <div style={{ padding: "16px", borderRadius: "var(--mk-radius)", background: "var(--mk-bg-elev-2)", border: "1px solid var(--mk-border-strong)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 4 }}>Time</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--mk-text)", lineHeight: 1.2 }}>{formatTime(r.time_taken_seconds)}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/dashboard"><button>← Dashboard</button></Link>
              
              {hasMistakes && r.mode !== "practice" && (
                <button onClick={handleReviewMistakes} style={{ background: "linear-gradient(135deg, var(--mk-warning), #f59e0b)", color: "#000", fontWeight: 800 }}>
                  🎯 Review Mistakes
                </button>
              )}

              {r.mode === "practice" && (
                <Link to={"/test/" + r.subject + "/practice"}><button className="secondary">Retake Practice</button></Link>
              )}
              
              <Link to="/leaderboard"><button className="secondary">🏆 Leaderboard</button></Link>
              
              {isCertificateEligible && (
                <button onClick={() => window.print()} style={{ background: "var(--mk-warning)", color: "#000", fontWeight: 800 }}>
                  {isChampionship ? "🏆 Download Certificate" : "📜 Download Certificate"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RUSHED-QUESTIONS WARNING */}
        {rushedQuestions.length > 0 && (
          <div
            className="card"
            style={{
              padding: 20,
              marginBottom: 24,
              borderLeft: "4px solid var(--mk-warning)",
              background: "rgba(251, 191, 36, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: "1.4rem" }}>⚡</span>
              <span style={{ fontWeight: 900, color: "var(--mk-warning)", fontSize: "1rem" }}>
                Rushed Questions
              </span>
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--mk-text)", lineHeight: 1.6 }}>
              You sped through <strong>{rushedQuestions.length}</strong>{" "}
              {rushedQuestions.length === 1 ? "question" : "questions"} on average in under{" "}
              {RUSHED_THRESHOLD_SECONDS} seconds. In a real exam, this is often a sign of guessing.
              Look at the flagged questions below and make sure you actually understood them.
            </div>
          </div>
        )}

        {/* SPEED VS ACCURACY CHART */}
        <div style={{ marginBottom: 24 }}>
          <SpeedAccuracyChart breakdown={r.breakdown || []} />
        </div>

        {/* DETAILED REVIEW */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0 }}>Detailed Review</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {r.breakdown.map((b, i) => {
            const ok = b.is_correct;
            const skipped = b.selected_option === null;
            const isLoading = aiLoading[b.question_id];
            const aiText = aiExplanations[b.question_id];
            const isRushed =
              typeof b.time_to_answer_seconds === "number" &&
              b.time_to_answer_seconds < RUSHED_THRESHOLD_SECONDS;

            return (
              <div key={b.question_id} className="card" style={{ padding: "32px", borderLeft: `4px solid ${ok ? "var(--mk-success)" : skipped ? "var(--mk-text-faint)" : "var(--mk-danger)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--mk-text-dim)" }}>Question {i + 1}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {isRushed && (
                      <span
                        title={`Answered on average in ${Math.round(b.time_to_answer_seconds)}s`}
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "var(--mk-warning)",
                          background: "rgba(251, 191, 36, 0.12)",
                          border: "1px solid var(--mk-warning)",
                          padding: "3px 8px",
                          borderRadius: 999,
                        }}
                      >
                        ⚡ Rushed
                      </span>
                    )}
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: ok ? "var(--mk-success)" : skipped ? "var(--mk-text-faint)" : "var(--mk-danger)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {ok ? "✓ Correct" : skipped ? "— Skipped" : "✗ Wrong"}
                    </span>
                  </div>
                </div>

                {/* IMAGE SUPPORT */}
                {b.image_url && (
                  <div style={{ marginBottom: 20, textAlign: "center" }}>
                    <img src={b.image_url} alt="Question diagram" style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid var(--mk-border)" }} />
                  </div>
                )}

                <p style={{ margin: "0 0 24px", fontSize: "1.15rem", fontWeight: 600, lineHeight: 1.6 }}>
                  <ChemText text={b.question_text} />
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["A", "B", "C", "D"].map((letter) => {
                    const text = b.options[letter];
                    const isCorrect = b.correct_option === letter;
                    const isSel = b.selected_option === letter;
                    let bg = "var(--mk-bg)";
                    let border = "1px solid var(--mk-border)";
                    let color = "var(--mk-text)";

                    if (isCorrect) { bg = "rgba(0, 229, 153, 0.08)"; border = "2px solid var(--mk-success)"; color = "var(--mk-success)"; }
                    else if (isSel) { bg = "rgba(255, 77, 77, 0.08)"; border = "2px solid var(--mk-danger)"; color = "var(--mk-danger)"; }

                    return (
                      <div key={letter} style={{ display: "flex", gap: 16, padding: "16px 20px", borderRadius: "var(--mk-radius)", border: border, background: bg, alignItems: "flex-start", transition: "all 0.2s" }}>
                        <span style={{ fontWeight: 900, minWidth: 24, color: isCorrect ? "var(--mk-success)" : isSel ? "var(--mk-danger)" : "var(--mk-text-dim)" }}>{letter}.</span>
                        <span style={{ flex: 1, color: color, fontWeight: 500, fontSize: "1.05rem" }}>
                          <ChemText text={text} />
                        </span>
                        {isSel && <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: isCorrect ? "var(--mk-success)" : "var(--mk-danger)", whiteSpace: "nowrap", background: "rgba(0,0,0,0.1)", padding: "4px 8px", borderRadius: "4px" }}>Your Answer</span>}
                        {isCorrect && !isSel && <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-success)", whiteSpace: "nowrap", background: "rgba(0, 229, 153, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>Correct</span>}
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

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--mk-border-strong)" }}>
                  {!aiText && !isLoading && (
                    <button
                      onClick={() => handleAiExplain(b.question_id, b.question_text, b.correct_option, b.options)}
                      className="secondary"
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1))",
                        border: "1px solid var(--mk-brand-secondary)", color: "var(--mk-text)",
                        borderRadius: "var(--mk-radius-pill)", fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>✨</span>
                      Explain this with AI
                    </button>
                  )}

                  {isLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--mk-brand-secondary)", fontWeight: 600 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--mk-brand-secondary)", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                      MAKAVERSE AI is thinking...
                      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                  )}

                  {aiText && (
                    <div style={{ background: "rgba(168, 85, 247, 0.05)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "var(--mk-radius)", padding: 20 }}>
                      <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, fontWeight: 900, color: "var(--mk-brand-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>✨</span> AI Tutor Breakdown
                      </div>
                      <div style={{ fontSize: "1rem", color: "var(--mk-text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {aiText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isCertificateEligible && (
        <Certificate
          variant={isChampionship ? "champion" : "mock"}
          user={user}
          school={finalSchoolName}
          certId={certId}
          certDate={certDate}
          regNumber={regNumber}
          studentUsername={studentUsername}
          score={r.score}
          pct={pct}
          subjectLabel={subjectLabel}
        />
      )}

      <style>{`
        .mk-cert-print { display: none; }

        .mk-cert-page {
          width: 297mm;
          height: 210mm;
          background-color: #fdfaf2 !important;
          background-image:
            radial-gradient(ellipse at 20% 10%, rgba(201, 169, 97, 0.09) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 90%, rgba(201, 169, 97, 0.09) 0%, transparent 45%);
          color: #1a2332 !important;
          font-family: Georgia, 'Times New Roman', serif;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          margin: 0 auto;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .mk-cert-guilloche {
          position: absolute;
          inset: 11mm;
          opacity: 0.5;
          background:
            repeating-radial-gradient(
              circle at 50% 50%,
              transparent 0,
              transparent 7mm,
              rgba(168, 132, 44, 0.06) 7mm,
              rgba(168, 132, 44, 0.06) 7.15mm
            );
          pointer-events: none;
          z-index: 0;
        }

        .mk-cert-frame-gold {
          position: absolute;
          inset: 8mm;
          border: 3px solid transparent;
          background:
            linear-gradient(#fdfaf2, #fdfaf2) padding-box,
            linear-gradient(135deg, #f4e5b1 0%, #e6c883 20%, #d4af37 45%, #f4e5b1 60%, #a8842c 80%, #d4af37 100%) border-box;
          pointer-events: none;
          z-index: 1;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .mk-cert-frame-mid {
          position: absolute;
          inset: 10.5mm;
          border: 0.8px solid;
          pointer-events: none;
          z-index: 1;
        }
        .mk-cert-frame-inner {
          position: absolute;
          inset: 12mm;
          border: 0.4px solid;
          pointer-events: none;
          z-index: 1;
        }

        .mk-cert-corner {
          position: absolute;
          width: 22mm;
          height: 22mm;
          z-index: 2;
          pointer-events: none;
        }
        .mk-cert-corner.tl { top: 14mm; left: 14mm; }
        .mk-cert-corner.tr { top: 14mm; right: 14mm; transform: scaleX(-1); }
        .mk-cert-corner.bl { bottom: 14mm; left: 14mm; transform: scaleY(-1); }
        .mk-cert-corner.br { bottom: 14mm; right: 14mm; transform: scale(-1, -1); }

        .mk-cert-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 100pt;
          font-weight: 900;
          opacity: 0.035;
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
          font-family: Georgia, serif;
          letter-spacing: 0.1em;
        }

        .mk-cert-content {
          position: absolute;
          top: 16mm;
          bottom: 16mm;
          left: 16mm;
          right: 16mm;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          pointer-events: none;
        }

        .mk-cert-header { text-align: center; }
        .mk-cert-recipient { text-align: center; padding-top: 6mm; }
        .mk-cert-body { text-align: center; padding: 0 10mm; margin-top: 4mm; }
        .mk-cert-footer { width: 100%; margin-top: auto; padding-bottom: 2mm; }
        .mk-cert-ids { text-align: center; padding-top: 2mm; }

        .mk-cert-brand {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 42pt;
          font-weight: bold;
          letter-spacing: 0.14em;
          line-height: 1;
          color: #c9a961;
          text-shadow: 0 1px 1px rgba(168, 132, 44, 0.2);
        }

        .mk-cert-name {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 44pt;
          font-weight: bold;
          letter-spacing: -0.01em;
          line-height: 1.1;
          padding-bottom: 10px;
          border-bottom: 1.5px solid rgba(168, 132, 44, 0.35);
          display: inline-block;
          min-width: 170mm;
          max-width: 235mm;
          word-break: break-word;
        }

        @media print {
          @page { size: A4 landscape; margin: 0; }

          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .mk-result-screen { display: none !important; }
          .public-mobile-header,
          .public-sidebar,
          .public-overlay,
          header, nav, aside, footer { display: none !important; }

          .public-main,
          .public-layout {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            background: #ffffff !important;
          }

          .mk-cert-print {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .mk-cert-page,
          .mk-cert-page * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .mk-cert-page { page-break-after: avoid; break-after: avoid; }
        }
      `}</style>
    </>
  );
}