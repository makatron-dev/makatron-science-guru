import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";
import { EDUCATION_LEVELS, SUBJECTS_BY_LEVEL, EXAM_TARGETS_BY_LEVEL, LEVEL_LABELS, SUBJECT_LABELS, EXAM_TARGET_LABELS } from "../constants.js";
import PowerLadderModal from "../components/PowerLadderModal.jsx";

// ---------- Local storage helpers (legacy fallback for streak) ----------
const STREAK_KEY = "mk-streak";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDay: null };
    const parsed = JSON.parse(raw);
    return { count: parsed.count || 0, lastDay: parsed.lastDay || null };
  } catch {
    return { count: 0, lastDay: null };
  }
}

function commitStreak() {
  const today = todayStr();
  const cur = loadStreak();
  if (cur.lastDay === today) return cur;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newCount = cur.lastDay === yesterday ? cur.count + 1 : 1;
  const next = { count: newCount, lastDay: today };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return next;
}

// ---------- TRIAL INFO ----------
function getTrialInfo(user) {
  if (!user) return { state: "none", daysLeft: 0 };
  if (user.is_premium) {
    const expiresAt = user.premium_expires_at ? new Date(user.premium_expires_at) : null;
    return { state: "premium", daysLeft: null, expiresAt, isLifetime: !expiresAt };
  }
  if (!user.trial_ends_at) return { state: "none", daysLeft: 0 };
  const ends = new Date(user.trial_ends_at);
  const now = new Date();
  const msLeft = ends.getTime() - now.getTime();
  if (msLeft <= 0) return { state: "expired", daysLeft: 0, endsAt: ends };
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return { state: "trial", daysLeft, endsAt: ends };
}

// ---------- XP & LEVEL SYSTEM ----------
const RANKS = [
  { level: 1, name: "Cadet", req: 0 }, { level: 2, name: "Scout", req: 500 }, { level: 3, name: "Ranger", req: 1200 },
  { level: 4, name: "Pilot", req: 2100 }, { level: 5, name: "Ensign", req: 3200 }, { level: 6, name: "Lieutenant", req: 4500 },
  { level: 7, name: "Captain", req: 6000 }, { level: 8, name: "Commander", req: 7700 }, { level: 9, name: "Major", req: 9600 },
  { level: 10, name: "Colonel", req: 11700 }, { level: 11, name: "Vanguard", req: 14000 }, { level: 12, name: "Centurion", req: 16500 },
  { level: 13, name: "Starfleet", req: 19200 }, { level: 14, name: "Sentinel", req: 22100 }, { level: 15, name: "Overlord", req: 25200 },
  { level: 16, name: "Archon", req: 28500 }, { level: 17, name: "Sovereign", req: 32000 }, { level: 18, name: "Ascendant", req: 35700 },
  { level: 19, name: "Transcendent", req: 39600 }, { level: 20, name: "Lord Makaverse", req: 43700 }
];

function getLevelInfo(totalXp) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (totalXp >= RANKS[i].req) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
    } else { break; }
  }
  const xpInLevel = totalXp - currentRank.req;
  const xpNeeded = nextRank ? (nextRank.req - currentRank.req) : 1;
  const percent = nextRank ? (xpInLevel / xpNeeded) * 100 : 100;
  return { level: currentRank.level, name: currentRank.name, xpInLevel, xpNeeded, percent, nextRank };
}

// ---------- AVATAR MAP ----------
const AVATAR_MAP = {
  "avatar_hacker": "👨‍💻", "avatar_robot": "🤖", "avatar_alien": "👽", "avatar_ninja": "🥷", "avatar_samurai": "⚔️",
  "avatar_pilot": "🚀", "avatar_astronaut": "👨‍🚀", "avatar_doctor": "👨‍⚕️", "avatar_scientist": "👨‍🔬", "avatar_wizard": "🧙‍♂️",
  "avatar_vampire": "🧛", "avatar_werewolf": "🐺", "avatar_gorilla": "🦍", "avatar_dragon": "🐉", "avatar_tiger": "🐯",
  "avatar_lion": "🦁", "avatar_eagle": "🦅", "avatar_phoenix": "🔥", "avatar_ghost": "👻", "avatar_king": "👑",
};

// ---------- SESSION TRACKER (display-only; AuthContext owns the save) ----------
function SessionTracker({ serverTotalSeconds }) {
  const { sessionSeconds } = useAuth();

  const totalSeconds = (serverTotalSeconds || 0) + (sessionSeconds || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return (
    <div className="card mk-pomodoro" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="row-between">
        <div>
          <div className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>📚 Total Study Time</div>
          <div style={{ fontSize: "0.85rem", color: "var(--mk-text-dim)", marginTop: 4 }}>Accumulates across all your visits</div>
        </div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--mk-success)", padding: "4px 10px", borderRadius: 20, background: "rgba(34, 217, 154, 0.1)" }}>🟢 Live</div>
      </div>
      <div className="mk-pomodoro-display">
        <div className="mk-countdown-digit" style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--mk-text)" }}>
          {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div className="mk-pomodoro-bar">
          <div className="mk-pomodoro-fill" style={{ width: "100%", background: "var(--mk-success)", animation: "pulse 2s infinite" }} />
        </div>
      </div>
      <div className="text-dim" style={{ fontSize: "0.8rem", textAlign: "center", fontStyle: "italic" }}>Your time is automatically saved when you leave or log out.</div>
    </div>
  );
}

// ---------- DAILY CHALLENGE COMPONENT ----------
function DailyChallengeWidget() {
  const { refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [gameState, setGameState] = useState("start");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [finalResult, setFinalResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof api.getDailyChallenge !== 'function') {
      setError("Backend endpoint not found. Please hard refresh (Ctrl+Shift+R).");
      setLoading(false);
      return;
    }
    api.getDailyChallenge().then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || submitting) return;
    if (timeLeft <= 0) { handleNextQuestion(true); return; }
    const timer = setTimeout(() => { setTimeLeft((t) => t - 1); }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, submitting]);

  function startGame() {
    setGameState("playing"); setTimeLeft(10); setCurrentIdx(0); setAnswers([]); setSelected(null);
  }

  function handleNextQuestion(forceTimeout = false) {
    const currentQ = data.questions[currentIdx];
    const finalSelected = forceTimeout ? null : selected;
    const newAnswers = [...answers, { question_id: currentQ.id, selected_option: finalSelected }];
    setAnswers(newAnswers); setSelected(null);
    if (currentIdx < data.questions.length - 1) {
      setCurrentIdx(currentIdx + 1); setTimeLeft(10);
    } else { finishGame(newAnswers); }
  }

  async function finishGame(finalAnswers) {
    setGameState("finished"); setSubmitting(true);
    try {
      const res = await api.submitDailyChallenge(finalAnswers);
      setFinalResult(res);
      if (refreshUser) refreshUser();
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  }

  if (loading) return <div className="mk-skeleton" style={{ height: 250, width: "100%", borderRadius: "var(--mk-radius-lg)", marginBottom: 32 }} />;
  if (error) return (
    <div className="card" style={{ marginBottom: 32, border: "2px solid var(--mk-danger)", background: "rgba(255, 77, 77, 0.1)" }}>
      <div style={{ fontWeight: 800, color: "var(--mk-danger)", marginBottom: 8 }}>Daily Challenge Error:</div>
      <div style={{ color: "var(--mk-text)" }}>{error}</div>
    </div>
  );
  if (!data) return null;

  const isCompleted = data.status === "completed";

  if (isCompleted) {
    return (
      <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1))", border: "1px solid var(--mk-brand-secondary)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: "6rem", opacity: 0.1, transform: "rotate(15deg)", pointerEvents: "none" }}>🎯</div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>{data.is_correct ? "🎉" : "💪"}</div>
          <div style={{ fontWeight: 800, fontSize: "1.2rem", color: data.is_correct ? "var(--mk-success)" : "var(--mk-text-dim)" }}>
            {data.is_correct ? "You passed today's challenge!" : "You missed the passing mark today."}
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--mk-text-dim)", marginTop: 8 }}>Come back tomorrow for 3 new questions.</div>
        </div>
      </div>
    );
  }

  if (gameState === "finished" && finalResult) {
    return (
      <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1))", border: "1px solid var(--mk-brand-secondary)" }}>
        <div className="row" style={{ gap: 8, alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: "1.2rem" }}>🔥</span>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "var(--mk-brand-secondary)" }}>Challenge Complete</h3>
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--mk-text)" }}>{finalResult.total_correct} / 3</div>
          <div style={{ fontSize: "1rem", color: "var(--mk-text-dim)" }}>Questions Correct</div>
          {finalResult.coins_earned > 0 && (
            <div style={{ marginTop: 12, fontSize: "1rem", fontWeight: 800, color: "var(--mk-warning)" }}>🪙 +{finalResult.coins_earned} Coins & +{finalResult.xp_earned} XP</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {finalResult.results.map((r, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 8, background: r.is_correct ? "rgba(34, 217, 154, 0.1)" : "rgba(255, 77, 77, 0.1)", border: `1px solid ${r.is_correct ? "var(--mk-success)" : "var(--mk-danger)"}` }}>
              <div style={{ fontWeight: 800, color: r.is_correct ? "var(--mk-success)" : "var(--mk-danger)", marginBottom: 4 }}>Question {i + 1}: {r.is_correct ? "Correct" : "Wrong"}</div>
              <div style={{ fontSize: "0.9rem", color: "var(--mk-text)" }}>{r.explanation || "No explanation provided."}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === "start") {
    return (
      <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1))", border: "1px solid var(--mk-brand-secondary)", textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔥</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "1.4rem", fontWeight: 900, color: "var(--mk-brand-secondary)" }}>Daily Challenge</h3>
        <p className="text-dim" style={{ fontSize: "0.95rem", maxWidth: 400, margin: "0 auto 24px" }}>
          You have <strong>10 seconds per question</strong> to answer 3 questions. If time runs out, it counts as a miss.
        </p>
        <button onClick={startGame} style={{ padding: "14px 40px", fontSize: "1rem", background: "var(--mk-brand-secondary)", color: "white", fontWeight: 800, borderRadius: "var(--mk-radius-pill)" }}>Start Challenge →</button>
      </div>
    );
  }

  const currentQ = data.questions[currentIdx];
  return (
    <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1))", border: "1px solid var(--mk-brand-secondary)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, fontSize: "6rem", opacity: 0.1, transform: "rotate(15deg)", pointerEvents: "none" }}>🎯</div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="row-between" style={{ marginBottom: 20 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "1.2rem" }}>🔥</span>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "var(--mk-brand-secondary)" }}>Daily Challenge</h3>
            <span style={{ fontSize: "0.7rem", background: "rgba(168, 85, 247, 0.2)", color: "var(--mk-brand-secondary)", padding: "4px 8px", borderRadius: 12, fontWeight: 800 }}>Question {currentIdx + 1} of 3</span>
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 900, color: timeLeft <= 3 ? "var(--mk-danger)" : "var(--mk-accent)", background: "var(--mk-bg-elev-2)", padding: "4px 12px", borderRadius: 20 }}>⏱ {timeLeft}s</div>
        </div>
        <p style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 20, lineHeight: 1.6 }}>{currentQ.question_text}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 20 }}>
          {currentQ.options.map((opt) => (
            <button key={opt.letter} onClick={() => setSelected(opt.letter)} className={selected === opt.letter ? "" : "secondary"} style={{ textAlign: "left", padding: "12px 16px", justifyContent: "flex-start", display: "flex", gap: 12 }}>
              <strong style={{ opacity: 0.7 }}>{opt.letter}.</strong> {opt.text}
            </button>
          ))}
        </div>
        <button onClick={() => handleNextQuestion(false)} disabled={submitting} style={{ width: "100%", padding: "14px" }}>
          {submitting ? "Submitting..." : currentIdx === 2 ? "Finish Challenge" : "Next Question →"}
        </button>
      </div>
    </div>
  );
}

// ---------- TRIAL BANNER ----------
function TrialBanner({ user }) {
  const trial = getTrialInfo(user);
  if (trial.state === "premium") {
    return (
      <div style={{ background: "rgba(34, 217, 154, 0.1)", border: "1px solid var(--mk-success)", padding: "16px", borderRadius: 8, marginBottom: 24 }}>
        <div className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.2rem" }}>⭐</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, color: "var(--mk-success)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Premium Active</div>
            <div style={{ fontWeight: 500, color: "var(--mk-text)" }}>{trial.isLifetime ? "You have lifetime access." : `Your premium subscription ends ${trial.expiresAt.toLocaleDateString()}.`}</div>
          </div>
          <Link to="/upgrade"><button className="secondary" style={{ padding: "8px 16px", minHeight: 36, fontSize: "0.85rem" }}>Manage Plan</button></Link>
        </div>
      </div>
    );
  }
  if (trial.state === "trial") {
    return (
      <div style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid var(--mk-warning)", padding: "16px", borderRadius: 8, marginBottom: 24 }}>
        <div className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.2rem" }}>🎁</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, color: "var(--mk-warning)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Premium Trial</div>
            <div style={{ fontWeight: 500, color: "var(--mk-text)" }}>{trial.daysLeft === 1 ? "Your trial ends tomorrow." : `${trial.daysLeft} days left in your free trial.`} Enjoy full access while it lasts.</div>
          </div>
          <Link to="/upgrade"><button style={{ padding: "8px 16px", minHeight: 36, fontSize: "0.85rem", background: "var(--mk-warning)", color: "#000", fontWeight: 800 }}>See Plans →</button></Link>
        </div>
      </div>
    );
  }
  if (trial.state === "expired") {
    return (
      <div style={{ background: "rgba(255, 107, 107, 0.1)", border: "1px solid var(--mk-danger)", padding: "16px", borderRadius: 8, marginBottom: 24 }}>
        <div className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.2rem" }}>🔒</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, color: "var(--mk-danger)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trial Ended</div>
            <div style={{ fontWeight: 500, color: "var(--mk-text)" }}>Upgrade to unlock the AI Tutor, Library, Vault, and Mock Exams.</div>
          </div>
          <Link to="/upgrade"><button style={{ padding: "8px 16px", minHeight: 36, fontSize: "0.85rem", background: "var(--mk-danger)", color: "white", fontWeight: 800 }}>Go Premium →</button></Link>
        </div>
      </div>
    );
  }
  return null;
}

// ---------- GO PREMIUM CARD ----------
function GoPremiumCard({ user }) {
  const trial = getTrialInfo(user);
  if (trial.state === "premium") return null;
  return (
    <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.08))", border: "1px solid var(--mk-brand-secondary)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, fontSize: "7rem", opacity: 0.08, transform: "rotate(15deg)", pointerEvents: "none" }}>⭐</div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="row" style={{ gap: 12, alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: "1.5rem" }}>⭐</span>
          <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "var(--mk-text)" }}>Unlock Premium</h3>
        </div>
        <p className="text-dim" style={{ margin: "0 0 20px", fontSize: "0.95rem" }}>Get unlimited access to everything that makes MAKAVERSE unstoppable:</p>
        <div className="form-grid-2" style={{ gap: 12, marginBottom: 20 }}>
          {[
            { icon: "🤖", label: "AI Tutor", desc: "Step-by-step explanations" },
            { icon: "📚", label: "Study Library", desc: "Full PDFs for every subject" },
            { icon: "🏪", label: "The Vault", desc: "Avatars, titles, power-ups" },
            { icon: "📝", label: "Mock Exams", desc: "One-shot real exam sims" },
          ].map((perk, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.2rem" }}>{perk.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: "var(--mk-text)", fontSize: "0.9rem" }}>{perk.label}</div>
                <div className="text-faint" style={{ fontSize: "0.8rem" }}>{perk.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/upgrade"><button style={{ padding: "12px 32px", fontSize: "1rem", fontWeight: 800, background: "var(--mk-brand-secondary)", color: "white", borderRadius: "var(--mk-radius-pill)" }}>View Plans & Upgrade →</button></Link>
      </div>
    </div>
  );
}

// ---------- REPORT CARD MODAL (PRINT-READY) ----------
function ReportCardModal({ isOpen, onClose, data }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", padding: 20 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", justifyContent: "flex-end", gap: 12, paddingBottom: 16 }}>
        <button onClick={onClose} className="secondary" style={{ background: "transparent", color: "white", borderColor: "white" }}>Close</button>
        <button onClick={() => window.print()} style={{ background: "var(--mk-success)", color: "#000", fontWeight: 800 }}>📥 Print / Save as PDF</button>
      </div>

      {/* The actual printable area */}
      <div style={{ flex: 1, overflowY: "auto", background: "#e5e7eb", borderRadius: 8, padding: 20 }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #print-section, #print-section * { visibility: visible; }
            #print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            @page { size: A4 portrait; margin: 0; }
          }
        `}</style>
        
        <div id="print-section" style={{ background: "white", color: "#1f2937", padding: "40px", maxWidth: 800, margin: "0 auto", borderRadius: 4, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontFamily: "'Inter', sans-serif" }}>
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f2847", paddingBottom: 20, marginBottom: 30 }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f2847", letterSpacing: 2 }}>MAKAVERSE EDTECH</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#6b7280", letterSpacing: 4, marginTop: 4 }}>OFFICIAL STUDENT REPORT CARD</div>
          </div>

          {/* Student Info */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Student Name</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827" }}>{data.user.display_name}</div>
              <div style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: 4 }}>@{data.user.username}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>School</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>{data.user.school_name || "—"}</div>
              <div style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: 4 }}>{LEVEL_LABELS[data.user.education_level]}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 30 }}>
            <div style={{ background: "#f3f4f6", padding: 20, borderRadius: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Global Rank</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#111827" }}>#{data.rank}</div>
            </div>
            <div style={{ background: "#f3f4f6", padding: 20, borderRadius: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Average Score</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#059669" }}>{data.avgScore}%</div>
            </div>
            <div style={{ background: "#f3f4f6", padding: 20, borderRadius: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Tests Taken</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#111827" }}>{data.totalTests}</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f2847", borderBottom: "1px solid #e5e7eb", paddingBottom: 8, marginBottom: 16 }}>Academic Performance</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontWeight: 600, color: "#4b5563" }}>Exam Target</span>
              <span style={{ fontWeight: 800 }}>{EXAM_TARGET_LABELS[data.user.exam_target] || data.user.exam_target}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontWeight: 600, color: "#4b5563" }}>Current Level</span>
              <span style={{ fontWeight: 800 }}>Level {data.levelInfo.level} ({data.levelInfo.name})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontWeight: 600, color: "#4b5563" }}>Total XP Earned</span>
              <span style={{ fontWeight: 800 }}>{data.user.xp} XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontWeight: 600, color: "#4b5563" }}>Weakest Subject</span>
              <span style={{ fontWeight: 800, color: "#dc2626" }}>{data.weakestSubject ? SUBJECT_LABELS[data.weakestSubject] : "None identified"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontWeight: 600, color: "#4b5563" }}>Total Study Time</span>
              <span style={{ fontWeight: 800 }}>{data.studyTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontWeight: 600, color: "#4b5563" }}>Current Streak</span>
              <span style={{ fontWeight: 800 }}>{data.streak} Day(s) 🔥</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "2px solid #0f2847", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Generated on:</div>
              <div style={{ fontWeight: 700 }}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: "1.5rem", color: "#0f2847", borderBottom: "1px solid #94a3b8", paddingBottom: 4, marginBottom: 4 }}>Makaverse Admin</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Authorized Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- ACTIVE SESSIONS PANEL ----------
function ActiveSessionsPanel() {
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getSessions()
      .then(setSessions)
      .catch((e) => setErr(e.message || "Could not load sessions."))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoutOthers() {
    if (!window.confirm("Log out of all other devices? You will stay signed in on this one.")) return;
    setBusy(true);
    try {
      await api.logoutOtherSessions();
      const fresh = await api.getSessions();
      setSessions(fresh);
    } catch (e) {
      alert(e.message || "Could not log out other devices.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="mk-skeleton" style={{ height: 200, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />;
  if (err) return <div className="card" style={{ borderLeft: "4px solid var(--mk-danger)" }}>{err}</div>;
  if (!sessions || sessions.length === 0) {
    return <div className="card" style={{ textAlign: "center", padding: 32, borderStyle: "dashed" }}>No sessions recorded yet.</div>;
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div>
        <h1 style={{ margin: 0 }}>🔐 Active Sessions</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Devices currently signed in to your account.</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                <th style={{ padding: "16px" }}>Device</th>
                <th style={{ padding: "16px" }}>IP</th>
                <th style={{ padding: "16px" }}>Last Active</th>
                <th style={{ padding: "16px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--mk-border)", background: s.is_current ? "rgba(0, 212, 255, 0.05)" : "transparent" }}>
                  <td style={{ padding: "16px", fontWeight: 600 }}>{s.device_name}</td>
                  <td style={{ padding: "16px", color: "var(--mk-text-dim)" }}>{s.ip_address || "—"}</td>
                  <td style={{ padding: "16px", color: "var(--mk-text-dim)" }}>{new Date(s.last_active).toLocaleString()}</td>
                  <td style={{ padding: "16px" }}>
                    {s.is_current ? (
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--mk-success)", background: "rgba(34, 217, 154, 0.12)", padding: "4px 8px", borderRadius: 6 }}>THIS DEVICE</span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--mk-text-faint)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <button
          onClick={handleLogoutOthers}
          disabled={busy}
          style={{ background: "var(--mk-danger)", color: "white", fontWeight: 800, padding: "12px 24px" }}
        >
          {busy ? "Signing out…" : "Log Out All Other Devices"}
        </button>
      </div>
    </div>
  );
}

// ---------- MAIN PAGE ----------
export default function DashboardPage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [editing, setEditing] = useState(activeTab === "profile");
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tests, setTests] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(() => loadStreak());
  const [activeExams, setActiveExams] = useState(null);
  
  const [mySchool, setMySchool] = useState(null);
  const [schoolLoading, setSchoolLoading] = useState(false);
  
  const [leaderboard, setLeaderboard] = useState(null);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbMode, setLbMode] = useState("global");
  const [lbState, setLbState] = useState(null);
  const [stateLbLoading, setStateLbLoading] = useState(false);
  const [stateLbRows, setStateLbRows] = useState([]);

  const [squadData, setSquadData] = useState(null);
  const [squadLoading, setSquadLoading] = useState(false);
  const [squadName, setSquadName] = useState("");
  const [squadCode, setSquadCode] = useState("");
  
  const [copied, setCopied] = useState(false);
  const [showLadder, setShowLadder] = useState(false);
  const [quick10Busy, setQuick10Busy] = useState(false);

  // Report Card Modal State
  const [showReportCard, setShowReportCard] = useState(false);

  // Referral toast
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setStreak(commitStreak());
    api.myTests().then(setTests).catch(() => setTests([]));
    api.getMyRank().then(setMyRank).catch(() => {});
    api.getDashboardSummary().then(setSummary).catch(() => {});
    api.getActiveExams().then(setActiveExams).catch(() => setActiveExams([]));

    api.getReferralRewards()
      .then((r) => {
        if (r && r.referred_count > 0) {
          setToast({
            text: `🎁 You've earned ${r.coins_earned} coins from ${r.referred_count} referral${r.referred_count === 1 ? "" : "s"}!`,
            tone: "success",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === "school") {
      setSchoolLoading(true);
      api.getMySchool().then(setMySchool).catch(() => {}).finally(() => setSchoolLoading(false));
    }
    if (activeTab === "leaderboard") {
      setLbLoading(true);
      api.leaderboardHomepage().then(d => {
         const target = user?.exam_target;
         if (d && d.boards && d.boards[target]) {
             setLeaderboard(d.boards[target]);
         } else {
             setLeaderboard([]);
         }
      }).catch(() => setLeaderboard([])).finally(() => setLbLoading(false));
    }
    if (activeTab === "squad") {
      setSquadLoading(true);
      api.getMySquad().then(setSquadData).catch(() => setSquadData({ in_squad: false })).finally(() => setSquadLoading(false));
    }
    if (activeTab === "sessions") {
      // handled by ActiveSessionsPanel
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab !== "leaderboard" || lbMode !== "state") return;
    if (!lbState) return;
    setStateLbLoading(true);
    api.leaderboardState(lbState)
      .then((res) => setStateLbRows(res.rows || []))
      .catch(() => setStateLbRows([]))
      .finally(() => setStateLbLoading(false));
  }, [activeTab, lbMode, lbState]);

  useEffect(() => {
    if (activeTab === "profile" && summary && summary.allow_profile_edits === false) {
      navigate("/dashboard?tab=dashboard", { replace: true });
      return;
    }
    if (activeTab === "profile" && !editing) startEdit();
    else if (activeTab !== "profile" && editing) setEditing(false);
  }, [activeTab, summary]);

  if (!user) return null;

  function switchTab(tab) { setSearchParams({ tab }); }

  function startEdit() {
    setForm({ display_name: user.display_name, school_name: user.school_name, education_level: user.education_level });
    setEditing(true); setErr("");
  }

  async function save() {
    setBusy(true); setErr("");
    try {
      await updateProfile(form);
      setEditing(false);
      switchTab("dashboard");
    } catch (ex) { setErr(ex.message || "Update failed"); } finally { setBusy(false); }
  }

  async function handleQuick10() {
    if (quick10Busy) return;
    const subjects = user.subjects || [];
    const subj = subjects[Math.floor(Math.random() * subjects.length)] || "biology";
    setQuick10Busy(true);
    try {
      navigate(`/test/${subj}/practice`);
    } catch (e) {
      alert(e.message || "Could not start Quick 10.");
    } finally {
      setQuick10Busy(false);
    }
  }

  async function handleCreateSquad(e) {
    e.preventDefault();
    if (!squadName.trim()) return;
    try {
      await api.createSquad(squadName);
      setSquadName("");
      const res = await api.getMySquad();
      setSquadData(res);
    } catch (err) { alert(err.message); }
  }

  async function handleJoinSquad(e) {
    e.preventDefault();
    if (!squadCode.trim()) return;
    try {
      await api.joinSquad(squadCode);
      setSquadCode("");
      const res = await api.getMySquad();
      setSquadData(res);
    } catch (err) { alert(err.message); }
  }

  async function handleLeaveSquad() {
    if (!window.confirm("Are you sure you want to leave this squad?")) return;
    try {
      await api.leaveSquad();
      setSquadData({ in_squad: false });
    } catch (err) { alert(err.message); }
  }

  const referralLink = `${window.location.origin}/register?ref=${user.username}`;
  function copyLink() { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 3000); }

  const totalTests = summary ? summary.total_tests : 0;
  const avgScore = summary ? summary.average_score : 0;
  const weakestSubject = summary ? summary.weakest_subject : null;
  const announcement = summary ? summary.announcement : null;
  const totalXp = user.xp || 0;
  const levelInfo = getLevelInfo(totalXp);
  const avatarIcon = AVATAR_MAP[user.avatar_id] || "👤";

  const dbStreak = summary?.current_streak ?? 0;
  const displayStreak = dbStreak > 0 ? dbStreak : streak.count;
  const displayLastLogin = summary?.last_login_date || streak.lastDay;

  let nextGoalMsg = "Take a championship exam to enter the leaderboard!";
  if (myRank && myRank.rank) {
    if (myRank.rank <= 3) nextGoalMsg = "You are in the Top 3! Defend your spot.";
    else if (myRank.rank <= 10) nextGoalMsg = "You're in the Top 10. Push for Top 3!";
    else nextGoalMsg = `You are ranked #${myRank.rank}. Keep practicing to climb higher!`;
  }

  const mockExams = (activeExams || []).filter((ex) => ex.exam_type === "mock");
  const practiceExams = (activeExams || []).filter((ex) => ex.exam_type === "practice");

  // Format study time for report card
  function formatStudyTime(seconds) {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const TabButton = ({ id, label, icon }) => {
    const isActive = activeTab === id;
    return (
      <button className={isActive ? "" : "secondary"} onClick={() => { if(id === "profile") startEdit(); switchTab(id); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "var(--mk-radius-pill)" }}>
        <span>{icon}</span> {label}
      </button>
    );
  };

  return (
    <div className="mk-dashboard-wrapper" style={{ padding: "24px 16px", margin: "0 auto" }}>
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed", top: 20, right: 20, zIndex: 10001, background: "var(--mk-bg-elev)",
            border: `1px solid ${toast.tone === "success" ? "var(--mk-success)" : "var(--mk-border-strong)"}`,
            color: "var(--mk-text)", padding: "12px 18px", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            maxWidth: 360, fontWeight: 600, fontSize: "0.9rem",
          }}
        >
          {toast.text}
        </div>
      )}

      {showReportCard && (
        <ReportCardModal 
          isOpen={showReportCard} 
          onClose={() => setShowReportCard(false)}
          data={{
            user, 
            rank: myRank?.rank || "—", 
            avgScore, 
            totalTests, 
            weakestSubject, 
            levelInfo,
            studyTime: formatStudyTime(summary?.total_study_time || 0),
            streak: displayStreak
          }}
        />
      )}

      {activeTab !== "profile" && (
        <div className="row" style={{ gap: 12, marginBottom: 24, borderBottom: "1px solid var(--mk-border)", paddingBottom: 12, flexWrap: "wrap" }}>
          <TabButton id="dashboard" label="Dashboard" icon="📊" />
          <TabButton id="exams" label="Start Exam" icon="📝" />
          <TabButton id="school" label="My School" icon="🏫" />
          <TabButton id="leaderboard" label="Leaderboard" icon="🏆" />
          <TabButton id="squad" label="My Squad" icon="👥" />
          <TabButton id="sessions" label="Sessions" icon="🔐" />
        </div>
      )}

      {activeTab === "dashboard" && (
        <>
          <TrialBanner user={user} />
          {announcement && (
            <div style={{ background: "rgba(0, 212, 255, 0.1)", border: "1px solid var(--mk-accent)", padding: "16px", borderRadius: 8, marginBottom: 24 }}>
              <div className="row" style={{ gap: 12 }}>
                <span style={{ fontSize: "1.2rem" }}>📢</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--mk-accent)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform Announcement</div>
                  <div style={{ fontWeight: 500, wordWrap: "break-word", color: "var(--mk-text)" }}>{announcement}</div>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", background: "linear-gradient(135deg, var(--mk-bg-elev), var(--mk-bg-elev-2))" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="row" style={{ gap: 12, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", wordWrap: "break-word", color: "var(--mk-text)" }}>Welcome back, {user.display_name.split(" ")[0]}!</h1>
                {displayStreak > 0 && <span className="mk-streak-badge" title={`Last active ${displayLastLogin}`}>🔥 {displayStreak}-day streak</span>}
              </div>
              <p style={{ margin: 0, fontSize: "1rem", color: "var(--mk-text-dim)", fontWeight: 500 }}>{user.school_name} • {LEVEL_LABELS[user.education_level]} • {EXAM_TARGET_LABELS[user.exam_target]}</p>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={handleQuick10} disabled={quick10Busy} style={{ padding: "8px 14px", fontSize: "0.85rem", fontWeight: 800, background: "var(--mk-accent)", color: "#000" }}>
                  {quick10Busy ? "Loading…" : "⚡ Quick 10"}
                </button>
                <button onClick={() => setShowReportCard(true)} className="secondary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
                  📄 Report Card
                </button>
              </div>
            </div>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0, 212, 255, 0.1)", border: "2px solid var(--mk-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", flexShrink: 0 }}>{avatarIcon}</div>
          </div>

          <div className="mk-dash-grid-4" style={{ marginBottom: 32 }}>
            <div className="card" style={{ borderTop: "4px solid var(--mk-accent)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Global Rank</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: 8, color: "var(--mk-text)" }}>{myRank && myRank.rank ? `#${myRank.rank}` : "Unranked"}</div>
              </div>
              <p className="text-dim" style={{ fontSize: "0.85rem", margin: "12px 0 0 0" }}>{nextGoalMsg}</p>
            </div>
            <div className="card" style={{ borderTop: "4px solid var(--mk-success)" }}>
              <div className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Average Score</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: 8, color: "var(--mk-text)" }}>{avgScore} pts</div>
              <p className="text-dim" style={{ fontSize: "0.85rem", margin: "12px 0 0 0" }}>Across {totalTests} test{totalTests !== 1 ? 's' : ''}</p>
            </div>
            <div className="card mk-xp-card" style={{ borderTop: "4px solid #a855f7", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="row-between">
                  <div className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Level {levelInfo.level}</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#a855f7" }}>{totalXp} XP Total</div>
                </div>
                <div style={{ marginTop: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--mk-text)", lineHeight: 1.1 }}>{levelInfo.name}</div>
                  {levelInfo.nextRank && <div style={{ fontSize: "0.8rem", color: "var(--mk-text-dim)", fontWeight: 600, marginTop: 4 }}>Next: {levelInfo.nextRank.name}</div>}
                </div>
                <div className="mk-xp-bar" style={{ marginTop: 12 }}><div className="mk-xp-fill" style={{ width: `${levelInfo.percent}%`, background: "#a855f7" }} /></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="row-between" style={{ fontSize: "0.75rem", color: "var(--mk-text-dim)", fontWeight: 600 }}><span>{levelInfo.xpInLevel} / {levelInfo.xpNeeded} XP</span></div>
                <button onClick={() => setShowLadder(true)} className="secondary" style={{ width: "100%", marginTop: 8, padding: "6px", fontSize: "0.8rem" }}>View Power Ladder</button>
              </div>
            </div>
            <div className="card" style={{ borderTop: "4px solid var(--mk-warning)" }}>
              <div className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Focus Area</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 8, color: "var(--mk-text)" }}>{weakestSubject ? SUBJECT_LABELS[weakestSubject] : "None yet"}</div>
              <p className="text-dim" style={{ fontSize: "0.85rem", margin: "12px 0 0 0" }}>{weakestSubject ? "Your lowest average. Try practicing this." : "Take tests to find your weak points."}</p>
            </div>
          </div>

          {weakestSubject && (
            <div className="mk-weak-topic-alert">
              <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.4rem" }}>⚠️</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--mk-warning)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Weakest Topic Alert</div>
                  <div style={{ fontWeight: 500, marginBottom: 12, wordWrap: "break-word", color: "var(--mk-text)" }}>Your average in <strong>{SUBJECT_LABELS[weakestSubject]}</strong> is below target. A quick practice session could lift your rank.</div>
                  <Link to={"/test/" + weakestSubject + "/practice"}><button style={{ padding: "8px 16px", minHeight: 36, fontSize: "0.85rem" }}>Practice {SUBJECT_LABELS[weakestSubject]} Now →</button></Link>
                </div>
              </div>
            </div>
          )}

          <DailyChallengeWidget />
          <GoPremiumCard user={user} />

          <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(34, 217, 154, 0.05), rgba(0, 212, 255, 0.05))", border: "1px solid var(--mk-success)" }}>
            <div className="row" style={{ gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: "2.5rem", background: "rgba(34, 217, 154, 0.1)", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>🎁</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 900, color: "var(--mk-text)" }}>Invite Friends, Earn XP</h3>
                <p className="text-dim" style={{ margin: 0, fontSize: "0.9rem" }}>Share your link. When they register, you both get a boost!</p>
              </div>
              <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 280 }}>
                <input readOnly value={referralLink} style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--mk-radius)", border: "1px solid var(--mk-border)", background: "var(--mk-bg)", color: "var(--mk-text-dim)", fontSize: "0.85rem" }} />
                <button onClick={copyLink} style={{ background: copied ? "var(--mk-success)" : "var(--mk-accent)", color: "#000", fontWeight: 800, padding: "0 20px", whiteSpace: "nowrap" }}>{copied ? "✓ Copied!" : "Copy Link"}</button>
              </div>
            </div>
          </div>

          <div className="mk-dash-grid-2" style={{ marginBottom: 32 }}>
            <SessionTracker serverTotalSeconds={summary?.total_study_time || 0} />
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>🔥 Daily Streak</div>
                <div style={{ fontSize: "3rem", fontWeight: 800, marginTop: 8, lineHeight: 1, color: "var(--mk-text)" }}>{displayStreak}</div>
                <p className="text-dim" style={{ fontSize: "0.85rem", margin: "12px 0 0 0" }}>
                  {displayStreak === 0 ? "Visit daily to start a streak!" : displayStreak === 1 ? "You started today. Come back tomorrow to keep it alive." : `You've shown up ${displayStreak} days in a row. Don't break the chain.`}
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--mk-border)", paddingTop: 16 }}>
                <div className="row-between" style={{ fontSize: "0.85rem" }}><span className="text-dim">Last visit</span><span style={{ fontWeight: 600, color: "var(--mk-text)" }}>{displayLastLogin || "—"}</span></div>
                <div className="row-between" style={{ fontSize: "0.85rem", marginTop: 8 }}><span className="text-dim">Milestone</span><span style={{ fontWeight: 600, color: "var(--mk-text)" }}>{displayStreak >= 30 ? "🏆 Legendary" : displayStreak >= 14 ? "🥇 Two weeks" : displayStreak >= 7 ? "🥈 One week" : displayStreak >= 3 ? "🥉 Three days" : "🌱 Getting started"}</span></div>
              </div>
            </div>
          </div>

          <div className="row-between" style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, color: "var(--mk-text)" }}>Recent Activity</h2>
            <Link to="/history" style={{ fontSize: "0.9rem", fontWeight: 600 }}>View Full History →</Link>
          </div>
          
          {!tests ? (
            <div className="stack"><div className="mk-skeleton" style={{ height: 60, width: "100%" }} /><div className="mk-skeleton" style={{ height: 60, width: "100%" }} /></div>
          ) : tests.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px", borderStyle: "dashed" }}><p className="text-dim" style={{ margin: 0 }}>You haven't taken any tests yet. Click "Start Exam" above to begin!</p></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
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
                    {tests.slice(0, 5).map((t) => (
                      <tr key={t.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                        <td style={{ padding: "16px", fontWeight: 600, color: "var(--mk-text)" }}>{SUBJECT_LABELS[t.subject] || t.subject}</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: t.mode === "mock" ? "rgba(0, 212, 255, 0.1)" : "var(--mk-bg-elev-2)", color: t.mode === "mock" ? "var(--mk-accent)" : "var(--mk-text-dim)" }}>
                            {t.mode === "championship" ? "CHAMPIONSHIP" : t.mode === "mock" ? "MOCK" : "PRACTICE"}
                          </span>
                        </td>
                        <td style={{ padding: "16px", fontWeight: 700, color: "var(--mk-success)" }}>{t.score}</td>
                        <td style={{ padding: "16px" }} className="text-dim">{t.submitted_at ? new Date(t.submitted_at).toLocaleDateString() : "-"}</td>
                        <td style={{ padding: "16px", textAlign: "right" }}><Link to={"/test/" + t.id + "/result"}><button className="secondary" style={{ padding: "8px 16px", fontSize: "0.85rem", minHeight: "36px" }}>Review</button></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "exams" && (
        <div>
          <div style={{ marginBottom: 48 }}>
            <div className="row" style={{ gap: 12, alignItems: "center", marginBottom: 16 }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "var(--mk-text)" }}>📚 Mock Exams</h1>
              <span style={{ fontSize: "0.7rem", background: "rgba(0, 212, 255, 0.15)", color: "var(--mk-accent)", padding: "4px 10px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>One attempt</span>
            </div>
            <p className="text-dim" style={{ margin: "0 0 24px 0", fontSize: "0.95rem" }}>Official mock exams created by your teachers. You can only take each mock once.</p>
            {!activeExams ? (
              <div className="exam-grid"><div className="mk-skeleton mk-skeleton-card" /><div className="mk-skeleton mk-skeleton-card" /></div>
            ) : mockExams.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 40, borderStyle: "dashed" }}><div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div><p className="text-dim" style={{ margin: 0 }}>No active mock exams right now. Check back later.</p></div>
            ) : (
              <div className="exam-grid">
                {mockExams.map((ex) => {
                  const closed = ex.is_closed === true || ex.completed === true;
                  return (
                    <div key={ex.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: `4px solid ${ex.completed ? "var(--mk-success)" : ex.is_closed ? "var(--mk-danger)" : "var(--mk-accent)"}`, opacity: closed ? 0.9 : 1 }}>
                      <div>
                        <div className="row-between" style={{ marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--mk-text)" }}>{ex.title}</div>
                          {ex.completed ? (
                            <span style={{ fontSize: "0.7rem", background: "rgba(34, 217, 154, 0.15)", color: "var(--mk-success)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>✅ COMPLETED</span>
                          ) : ex.is_closed ? (
                            <span style={{ fontSize: "0.7rem", background: "rgba(255, 77, 77, 0.15)", color: "var(--mk-danger)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>🔒 CLOSED</span>
                          ) : (
                            <span style={{ fontSize: "0.7rem", background: "rgba(0, 212, 255, 0.1)", color: "var(--mk-accent)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>MOCK</span>
                          )}
                        </div>
                        <div className="text-dim" style={{ fontSize: "0.85rem", marginBottom: 8 }}>{SUBJECT_LABELS[ex.subject] || ex.subject} • {ex.duration_mins} Mins</div>
                        <div className="text-faint" style={{ fontSize: "0.8rem", marginBottom: 16 }}>{ex.questions_to_serve > 0 ? `${ex.questions_to_serve} Questions` : "All Questions"}</div>
                        {ex.end_date && (
                          <div className="text-faint" style={{ fontSize: "0.75rem", marginBottom: 12 }}>
                            Window ends: {new Date(ex.end_date).toLocaleString()}
                          </div>
                        )}
                        {ex.completed && ex.completed_score !== null && <div style={{ fontSize: "0.9rem", color: "var(--mk-success)", fontWeight: 700, marginBottom: 8 }}>Your Score: {ex.completed_score}</div>}
                      </div>
                      {ex.completed ? (
                        <Link to={`/test/${ex.completed_test_id}/result`} style={{ width: "100%" }}><button className="secondary" style={{ width: "100%", borderColor: "var(--mk-success)", color: "var(--mk-success)" }}>View Result & Certificate</button></Link>
                      ) : ex.is_closed ? (
                        <button disabled style={{ width: "100%", opacity: 0.5, cursor: "not-allowed" }}>Closed</button>
                      ) : (
                        <Link to={`/test/${ex.subject}/mock?exam_id=${ex.id}`} style={{ width: "100%" }}><button style={{ width: "100%" }}>Start Mock Exam</button></Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <div className="row" style={{ gap: 12, alignItems: "center", marginBottom: 16 }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "var(--mk-text)" }}>🎯 Practice</h1>
              <span style={{ fontSize: "0.7rem", background: "rgba(34, 217, 154, 0.15)", color: "var(--mk-success)", padding: "4px 10px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unlimited</span>
            </div>
            <p className="text-dim" style={{ margin: "0 0 24px 0", fontSize: "0.95rem" }}>Sharpen your skills with unlimited practice sessions. No pressure, no limits.</p>
            {practiceExams.length > 0 && (
              <div className="exam-grid" style={{ marginBottom: 24 }}>
                {practiceExams.map((ex) => (
                  <div key={ex.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: "4px solid var(--mk-success)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8, color: "var(--mk-text)" }}>{ex.title}</div>
                      <div className="text-dim" style={{ fontSize: "0.85rem", marginBottom: 8 }}>{SUBJECT_LABELS[ex.subject] || ex.subject} • {ex.duration_mins} Mins</div>
                      <div className="text-faint" style={{ fontSize: "0.8rem", marginBottom: 16 }}>{ex.questions_to_serve > 0 ? `${ex.questions_to_serve} Questions` : "All Questions"}</div>
                    </div>
                    <Link to={`/test/${ex.subject}/practice?exam_id=${ex.id}`} style={{ width: "100%" }}><button className="secondary" style={{ width: "100%" }}>Start Practice</button></Link>
                  </div>
                ))}
              </div>
            )}
            <div className="exam-grid">
              {user.subjects.map((s) => (
                <div key={s} className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--mk-text)" }}>{SUBJECT_LABELS[s]}</div>
                  <Link to={"/test/" + s + "/practice"} style={{ width: "100%" }}><button className="secondary" style={{ width: "100%", display: "flex", justifyContent: "space-between" }}><span>Practice {SUBJECT_LABELS[s]}</span><span style={{ opacity: 0.7 }}>Unlimited</span></button></Link>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 48 }}>
            <Link to="/arena" style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: "32px", background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(168, 85, 247, 0.05))", border: "1px solid rgba(251, 191, 36, 0.3)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-warning)", marginBottom: 4 }}>🏆 The Big Stage</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--mk-text)" }}>Championship Arena</div>
                  <div className="text-dim" style={{ fontSize: "0.9rem", marginTop: 4 }}>Compete against the best. One attempt. Real stakes.</div>
                </div>
                <button style={{ background: "var(--mk-warning)", color: "#000", padding: "12px 24px", fontWeight: 700 }}>Enter Arena →</button>
              </div>
            </Link>
          </div>
        </div>
      )}

      {activeTab === "school" && (
        <div className="stack" style={{ gap: 32 }}>
          {schoolLoading ? (
            <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />
          ) : (
            <>
              <div className="card" style={{ padding: "40px", background: "linear-gradient(135deg, var(--mk-bg-elev), var(--mk-bg-elev-2))", border: "1px solid var(--mk-border-strong)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "300px", height: "300px", background: "radial-gradient(circle, var(--mk-glow-accent-soft) 0%, transparent 70%)", pointerEvents: "none" }}></div>
                <div style={{ position: "relative", zIndex: 10 }}>
                  <div className="row-between" style={{ flexWrap: "wrap", gap: 24 }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 800, color: "var(--mk-text-faint)", marginBottom: 12 }}>My School</div>
                      <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", color: "var(--mk-text)" }}>{mySchool?.school_name || user.school_name || "Not Assigned"}</h1>
                      <p className="text-dim" style={{ fontSize: "1.1rem", margin: "8px 0 0 0", fontWeight: 600 }}>📍 {mySchool?.school_state || "State not set"}</p>
                    </div>
                    <div style={{ textAlign: "center", background: "var(--mk-bg)", padding: "24px 32px", borderRadius: "var(--mk-radius-lg)", border: "1px solid var(--mk-border)", boxShadow: "var(--mk-shadow)" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 8 }}>Current Rank</div>
                      <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--mk-accent)", lineHeight: 1 }}>{mySchool?.school_rank ? `#${mySchool.school_rank}` : "—"}</div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--mk-text-dim)", marginTop: 8 }}>on the leaderboard</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="card" style={{ padding: "32px", borderTop: "4px solid var(--mk-success)" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 8 }}>School Total Points</div>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-success)" }}>{mySchool?.school_score || 0} pts</div>
                  <p className="text-dim" style={{ fontSize: "0.9rem", marginTop: 8 }}>Combined score from all Championship exams.</p>
                </div>
                <div className="card" style={{ padding: "32px", borderTop: "4px solid var(--mk-warning)" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "var(--mk-text-faint)", marginBottom: 8 }}>Active Students</div>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mk-warning)" }}>{mySchool?.active_students || 0}</div>
                  <p className="text-dim" style={{ fontSize: "0.9rem", marginTop: 8 }}>Students from your school competing.</p>
                </div>
              </div>

              <div className="card" style={{ padding: "40px", textAlign: "center", background: "linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(168, 85, 247, 0.05))", border: "1px solid var(--mk-accent)" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--mk-text)", marginBottom: 12 }}>Help your school climb to #1</h3>
                <p className="text-dim" style={{ fontSize: "1rem", maxWidth: 500, margin: "0 auto 24px" }}>Every Championship exam you take adds points to your school's total. Compete today and push your school up the rankings.</p>
                <Link to="/arena"><button style={{ padding: "14px 32px", fontSize: "1rem" }}>Enter Championship Arena →</button></Link>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="stack" style={{ gap: 32 }}>
          <div>
            <h1 style={{ margin: 0 }}>🏆 Leaderboard</h1>
            <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Top scorers from active Championship exams. Updates in real-time.</p>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className={lbMode === "global" ? "" : "secondary"}
              onClick={() => setLbMode("global")}
              style={{ padding: "8px 20px", borderRadius: "var(--mk-radius-pill)", fontWeight: 700 }}
            >
              🌍 Global
            </button>
            <button
              className={lbMode === "state" ? "" : "secondary"}
              onClick={() => setLbMode("state")}
              style={{ padding: "8px 20px", borderRadius: "var(--mk-radius-pill)", fontWeight: 700 }}
            >
              📍 By State
            </button>
            {lbMode === "state" && (
              <input
                type="text"
                placeholder="Enter state (e.g. Lagos)"
                value={lbState || ""}
                onChange={(e) => setLbState(e.target.value)}
                style={{ padding: "8px 16px", borderRadius: "var(--mk-radius-pill)", border: "1px solid var(--mk-border)", background: "var(--mk-bg-elev)", color: "var(--mk-text)", minWidth: 200 }}
              />
            )}
          </div>

          {lbMode === "global" && (
            lbLoading ? (
               <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "60px 20px", borderStyle: "dashed" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏆</div>
                <h3 style={{ margin: "0 0 8px", color: "var(--mk-text)" }}>No Championship Scores Yet</h3>
                <p className="text-dim" style={{ margin: "0 0 24px" }}>Be the first to take a Championship exam and claim the top spot!</p>
                <Link to="/arena"><button>Enter Arena →</button></Link>
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--mk-bg-elev-2)" }}>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", color: "var(--mk-accent)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>{EXAM_TARGET_LABELS[user?.exam_target] || "Global"} Standings</div>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                        <th style={{ padding: "16px", width: "60px" }}>Rank</th>
                        <th style={{ padding: "16px" }}>Student</th>
                        <th style={{ padding: "16px" }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((row, i) => (
                        <tr key={row.user_id} style={{ borderTop: "1px solid var(--mk-border)", background: row.user_id === user.id ? "rgba(0, 212, 255, 0.05)" : "transparent" }}>
                          <td style={{ padding: "16px", fontWeight: 900, fontSize: "1.1rem", color: i === 0 ? "var(--mk-warning)" : i === 1 ? "var(--mk-text)" : i === 2 ? "var(--mk-danger)" : "var(--mk-text-faint)" }}>
                            #{i + 1}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ fontSize: "1.8rem" }}>{AVATAR_MAP[row.avatar_id] || "👤"}</div>
                              <div>
                                <div style={{ fontWeight: 700, color: "var(--mk-text)" }}>{row.display_name} {row.user_id === user.id && "(You)"}</div>
                                <div className="text-faint" style={{ fontSize: "0.8rem" }}>{row.school_name || "No school"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px", fontWeight: 800, color: "var(--mk-success)", fontSize: "1.2rem" }}>{row.total_score} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {lbMode === "state" && (
            !lbState ? (
              <div className="card" style={{ textAlign: "center", padding: 40, borderStyle: "dashed" }}>
                <p className="text-dim" style={{ margin: 0 }}>Enter a state name above to see its schools' standings.</p>
              </div>
            ) : stateLbLoading ? (
              <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />
            ) : stateLbRows.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 40, borderStyle: "dashed" }}>
                <p className="text-dim" style={{ margin: 0 }}>No Championship results for schools in {lbState} yet.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", background: "var(--mk-bg-elev-2)" }}>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", color: "var(--mk-accent)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
                    📍 {lbState} — School Standings
                  </div>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                        <th style={{ padding: "16px", width: "60px" }}>Rank</th>
                        <th style={{ padding: "16px" }}>School</th>
                        <th style={{ padding: "16px" }}>Students</th>
                        <th style={{ padding: "16px" }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stateLbRows.map((row, i) => (
                        <tr key={i} style={{ borderTop: "1px solid var(--mk-border)" }}>
                          <td style={{ padding: "16px", fontWeight: 900, fontSize: "1.1rem", color: i === 0 ? "var(--mk-warning)" : "var(--mk-text-faint)" }}>#{i + 1}</td>
                          <td style={{ padding: "16px", fontWeight: 700 }}>{row.name}</td>
                          <td style={{ padding: "16px", color: "var(--mk-text-dim)" }}>{row.student_count}</td>
                          <td style={{ padding: "16px", fontWeight: 800, color: "var(--mk-success)" }}>{row.total_score} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {activeTab === "squad" && (
        <div className="stack" style={{ gap: 32 }}>
          <div>
            <h1 style={{ margin: 0 }}>👥 My Squad</h1>
            <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Study together. Compete together.</p>
          </div>

          {squadLoading ? (
             <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />
          ) : !squadData || !squadData.in_squad ? (
            <div className="form-grid-2">
              <div className="card stack">
                <h3 style={{ margin: 0 }}>Create a Squad</h3>
                <p className="text-dim" style={{ fontSize: "0.9rem" }}>Start a private group with up to 10 friends. You get a unique invite code to share.</p>
                <form onSubmit={handleCreateSquad} className="row" style={{ gap: 12 }}>
                  <input required value={squadName} onChange={(e) => setSquadName(e.target.value)} placeholder="Squad Name (e.g. Bio Ninjas)" style={{ flex: 1 }} />
                  <button type="submit">Create</button>
                </form>
              </div>
              <div className="card stack">
                <h3 style={{ margin: 0 }}>Join a Squad</h3>
                <p className="text-dim" style={{ fontSize: "0.9rem" }}>Have an invite code? Enter it below to join your friends.</p>
                <form onSubmit={handleJoinSquad} className="row" style={{ gap: 12 }}>
                  <input required value={squadCode} onChange={(e) => setSquadCode(e.target.value)} placeholder="Enter Invite Code" style={{ flex: 1 }} />
                  <button type="submit" className="secondary">Join</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="row-between" style={{ marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ margin: 0 }}>{squadData.squad.name}</h2>
                  <div className="text-dim">Invite Code: <strong style={{ color: "var(--mk-accent)" }}>{squadData.squad.invite_code}</strong></div>
                </div>
                <button onClick={handleLeaveSquad} className="secondary" style={{ borderColor: "var(--mk-danger)", color: "var(--mk-danger)" }}>Leave Squad</button>
              </div>

              <h3 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Squad Leaderboard</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                      <th style={{ padding: "16px", width: "60px" }}>Rank</th>
                      <th style={{ padding: "16px" }}>Member</th>
                      <th style={{ padding: "16px" }}>Championship Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {squadData.members.map((m, i) => (
                      <tr key={m.user_id} style={{ borderTop: "1px solid var(--mk-border)", background: m.user_id === user.id ? "rgba(0, 212, 255, 0.05)" : "transparent" }}>
                        <td style={{ padding: "16px", fontWeight: 900, fontSize: "1.1rem", color: i === 0 ? "var(--mk-warning)" : "var(--mk-text-faint)" }}>#{i + 1}</td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ fontSize: "1.8rem" }}>{AVATAR_MAP[m.avatar_id] || "👤"}</div>
                            <div style={{ fontWeight: 700 }}>{m.display_name} {m.user_id === user.id && "(You)"}</div>
                          </div>
                        </td>
                        <td style={{ padding: "16px", fontWeight: 800, color: "var(--mk-success)" }}>{m.total_score} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "sessions" && <ActiveSessionsPanel />}

      {activeTab === "profile" && editing && form && (
        <div className="card stack" style={{ maxWidth: 600 }}>
          <div className="row-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "var(--mk-text)" }}>Edit Profile</h3>
          </div>
          <div className="form-grid-2">
            <div><label>Full Name</label><input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
            <div><label>School</label><input value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} /></div>
          </div>
          <div>
            <label>Education Level</label>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {EDUCATION_LEVELS.map((lvl) => (
                <button type="button" key={lvl} className={form.education_level === lvl ? "" : "secondary"} onClick={() => setForm({ ...form, education_level: lvl })}>{LEVEL_LABELS[lvl]}</button>
              ))}
            </div>
          </div>
          {err && <p style={{ color: "var(--mk-danger)", margin: 0, fontWeight: 600 }}>{err}</p>}
          <div className="row" style={{ gap: 12, marginTop: 8 }}>
            <button onClick={save} disabled={busy} style={{ flex: 1 }}>{busy ? "Saving..." : "Save Changes"}</button>
            <button className="secondary" onClick={() => { setEditing(false); switchTab("dashboard"); }} style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {showLadder && <PowerLadderModal onClose={() => setShowLadder(false)} />}
    </div>
  );
}