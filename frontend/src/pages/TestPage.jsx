import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { SUBJECT_LABELS } from "../constants.js";
import Logo from "../components/Logo.jsx";
import QuestionRenderer from "../components/QuestionRenderer.jsx";

// Premium Loading Screen Component
function ExamLoader({ subject }) {
  const label = SUBJECT_LABELS[subject] || "Exam";
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--mk-bg)", position: "relative", overflow: "hidden", padding: 24 }}>
      <div style={{ position: "absolute", top: "20%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--mk-accent)", borderRightColor: "var(--mk-accent)", animation: "spin 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite", boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)" }} />
          <div style={{ position: "absolute", inset: 15, borderRadius: "50%", border: "2px solid transparent", borderBottomColor: "#a855f7", borderLeftColor: "#a855f7", animation: "spin-reverse 2s linear infinite", boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }} />
          <div style={{ position: "absolute", inset: 30, borderRadius: "50%", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border-strong)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 20px rgba(0, 212, 255, 0.1)" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--mk-accent)", boxShadow: "0 0 20px var(--mk-accent)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 12px", background: "linear-gradient(90deg, var(--mk-text), var(--mk-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Initializing {label} Exam
        </h1>
        <p className="text-dim" style={{ fontSize: "1.05rem", maxWidth: 400, margin: "0 0 32px", lineHeight: 1.6 }}>
          Calibrating questions, securing your session, and setting the clock. Please do not close this window.
        </p>
        <div style={{ width: 280, height: 6, background: "var(--mk-bg-elev-2)", borderRadius: 3, overflow: "hidden", border: "1px solid var(--mk-border)" }}>
          <div style={{ height: "100%", width: "40%", background: "linear-gradient(90deg, var(--mk-accent), #a855f7)", borderRadius: 3, animation: "progress-slide 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes spin-reverse { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        @keyframes progress-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
      `}</style>
    </div>
  );
}

const HEARTBEAT_INTERVAL_MS = 30_000;

export default function TestPage() {
  const { subject, mode } = useParams();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("exam_id");
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [bookmarks, setBookmarks] = useState({}); 
  
  // Hint state (per-question cached)
  const [hintText, setHintText] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [hintCache, setHintCache] = useState({}); // question_id -> hint text

  const submittedRef = useRef(false);
  const abandonedRef = useRef(false);
  const tabSwitchesRef = useRef(0);
  const answersRef = useRef({});
  const testRef = useRef(null);
  const submitFnRef = useRef(null);

  // Per-question time tracking: qid -> seconds spent
  const questionTimesRef = useRef({});
  const activeQuestionStartRef = useRef(null); // { qid, startedAt }

  // Fullscreen tracking
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullscreenRef = useRef(false);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { testRef.current = test; }, [test]);
  useEffect(() => { isFullscreenRef.current = isFullscreen; }, [isFullscreen]);

  const isNumeric = subject && /^\d+$/.test(subject);

  // ---- Time tracking helpers ----
  function finalizeCurrentQuestionTime() {
    const cur = activeQuestionStartRef.current;
    if (!cur) return;
    const elapsed = Math.max(0, Math.round((Date.now() - cur.startedAt) / 1000));
    if (elapsed > 0) {
      questionTimesRef.current[cur.qid] = (questionTimesRef.current[cur.qid] || 0) + elapsed;
    }
    activeQuestionStartRef.current = null;
  }

  function startQuestionTimer(qid) {
    finalizeCurrentQuestionTime();
    activeQuestionStartRef.current = { qid, startedAt: Date.now() };
  }

  // Restart per-question timer whenever the visible question changes.
  useEffect(() => {
    if (!test) return;
    const q = test.questions[idx];
    if (!q) return;
    startQuestionTimer(q.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, test]);

  // Finalize on unmount or submit.
  useEffect(() => {
    return () => finalizeCurrentQuestionTime();
  }, []);

  // ---- Fullscreen request on mount ----
  useEffect(() => {
    if (!test) return;
    const el = document.documentElement;
    const tryFs =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    if (tryFs) {
      try {
        tryFs.call(el).catch(() => {});
      } catch {
        /* ignored */
      }
    }
    const onFsChange = () => {
      const active =
        !!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.msFullscreenElement;
      setIsFullscreen(active);
    };
    onFsChange();
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, [test]);

  // ---- Heartbeat every 30s ----
  useEffect(() => {
    if (!test) return;
    let cancelled = false;
    const ping = async () => {
      if (cancelled || submittedRef.current) return;
      const t = testRef.current;
      if (!t) return;
      try {
        await api.heartbeatTest(t.test_id, isFullscreenRef.current);
      } catch {
        /* silent — backend enforces time/abandon */
      }
    };
    ping(); // immediate first ping
    const id = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [test]);

  // ---- Boot: redirect / tripwires / start test ----
  useEffect(() => {
    if (isNumeric) {
      setRedirecting(true);
      return;
    }

    const completedExamKey = `mk-completed-exam-${subject}-${examId || 'general'}`;
    if (sessionStorage.getItem(completedExamKey)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const activeTestStr = sessionStorage.getItem("mk_active_test");
    
    if (activeTestStr) {
      try {
        const parsed = JSON.parse(activeTestStr);
        if (parsed.testId) {
          api.abandonTest(parsed.testId).catch(() => {});
        }
      } catch (e) {}
      
      sessionStorage.removeItem("mk_active_test");
      alert("⚠️ You refreshed the page! Your active exam has been submitted/abandoned. Please do not refresh during an exam.");
      navigate("/dashboard");
      return;
    }

    // FIX: tracks whether this effect run has been cleaned up (user left the
    // page, or React re-ran the effect) so a late server response can never
    // re-create the "active test" flag after the user is gone.
    let cancelled = false;

    submittedRef.current = false;
    abandonedRef.current = false;
    tabSwitchesRef.current = 0;
    answersRef.current = {};
    questionTimesRef.current = {};
    activeQuestionStartRef.current = null;
    setTabSwitches(0);
    setErr("");
    setHintText("");
    setHintCache({});

    api.startTest(subject, mode || "practice", examId ? parseInt(examId) : null)
      .then((d) => {
        if (cancelled) {
          // The user already left this page: close the test that was just
          // created on the server and do NOT set the refresh flag.
          api.abandonTest(d.test_id).catch(() => {});
          return;
        }
        setTest(d);
        setSecondsLeft(d.duration_seconds);
        sessionStorage.setItem("mk_active_test", JSON.stringify({ testId: d.test_id }));
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message);
      });

    return () => {
      cancelled = true;
      const t = testRef.current;
      if (t && !submittedRef.current && !abandonedRef.current) {
        abandonedRef.current = true;
        api.abandonTest(t.test_id).catch(() => {});
      }
      // FIX: leaving the page normally (Back button, dashboard link, etc.)
      // must clear the flag. A real browser refresh never runs this cleanup,
      // so the refresh tripwire above still works.
      sessionStorage.removeItem("mk_active_test");
    };
  }, [subject, mode, examId, isNumeric, navigate]);

  // ---- beforeunload guard ----
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (testRef.current && !submittedRef.current) {
        e.preventDefault();
        e.returnValue = "If you leave, your exam will be submitted!";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ---- Countdown timer ----
  useEffect(() => {
    if (!test || submittedRef.current) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          submitFnRef.current && submitFnRef.current(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [test]);

  // ---- Submit ----
  async function doSubmit(auto) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    finalizeCurrentQuestionTime();

    sessionStorage.removeItem("mk_active_test");

    const t = testRef.current;
    if (!t) { setSubmitting(false); return; }
    try {
      const payload = {
        answers: Object.entries(answersRef.current).map(([qid, sel]) => ({
          question_id: parseInt(qid, 10),
          selected_option: sel,
          time_spent_seconds: questionTimesRef.current[qid] ?? null,
        })),
        tab_switches: tabSwitchesRef.current,
      };
      await api.submitTest(t.test_id, payload);
      
      const completedExamKey = `mk-completed-exam-${subject}-${examId || 'general'}`;
      sessionStorage.setItem(completedExamKey, "true");

      navigate("/test/" + t.test_id + "/result", { replace: true });
    } catch (e) {
      setErr(e.message);
      submittedRef.current = false;
      setSubmitting(false);
    }
  }
  useEffect(() => { submitFnRef.current = doSubmit; }, [doSubmit]);

  // ---- Tab switch detection ----
  useEffect(() => {
    function onVisibility() {
      if (document.hidden && !submittedRef.current) {
        tabSwitchesRef.current += 1;
        setTabSwitches(tabSwitchesRef.current);
        setShowTabWarning(true);
        if (tabSwitchesRef.current >= 3) {
          submitFnRef.current && submitFnRef.current(true);
        }
      }
    }
    function block(e) { e.preventDefault(); }
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("contextmenu", block);
    };
  }, []);

  function pick(letter) {
    const q = test.questions[idx];
    setAnswers((a) => ({ ...a, [q.id]: letter }));
  }

  async function toggleBookmark(questionId) {
    setBookmarks(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    try {
      const res = await api.toggleBookmark(questionId);
      setBookmarks(prev => ({ ...prev, [questionId]: res.bookmarked }));
    } catch (err) {
      setBookmarks(prev => ({ ...prev, [questionId]: !prev[questionId] }));
      alert("Failed to save bookmark: " + err.message);
    }
  }

  async function handleReport(questionId) {
    const reason = prompt("What is wrong with this question? (Type: typo, wrong_answer, or image_missing)");
    if (!reason) return;
    try {
      await api.reportQuestion(questionId, reason.toLowerCase(), "Reported from TestPage");
      alert("✅ Thank you! Your report has been sent to the admin.");
    } catch (err) {
      alert("Failed to send report: " + err.message);
    }
  }

  async function getHint() {
    const q = test.questions[idx];
    if (test.mode !== "practice") return; // Hints are PRACTICE ONLY

    // Use cached hint if we already fetched it for this question.
    if (hintCache[q.id]) {
      setHintText(hintCache[q.id]);
      return;
    }

    setHintLoading(true);
    try {
      // Send the CORRECT answer so the AI explains why it's correct.
      const correctText =
        q.options.find((o) => o.letter === q.correct_option)?.text ||
        q.correct_option ||
        "unknown";
      const res = await api.explainWithAI(q.question_text, correctText);
      const hint = res?.explanation || "";
      setHintCache((c) => ({ ...c, [q.id]: hint }));
      setHintText(hint);
    } catch (err) {
      alert(err.message || "Could not fetch hint. Please try again.");
    } finally {
      setHintLoading(false);
    }
  }

  // Reset hint display when navigating to another question.
  useEffect(() => {
    if (!test) return;
    const q = test.questions[idx];
    if (!q) return;
    setHintText(hintCache[q.id] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, test]);

  if (redirecting) {
    return (
      <div className="container" style={{ padding: "32px 16px", maxWidth: 600, marginTop: 40 }}>
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <h2 style={{ margin: 0 }}>Redirecting to Result...</h2>
          <p className="text-dim">If this takes too long, <a href={"/test/" + subject + "/result"} style={{ color: "var(--mk-accent)" }}>click here</a>.</p>
        </div>
      </div>
    );
  }

  if (err && !test) {
    return (
      <div className="container" style={{ padding: "32px 16px", maxWidth: 600, marginTop: 40 }}>
        <div className="card stack" style={{ borderTop: "4px solid var(--mk-danger)" }}>
          <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: 12 }}>⚠️</div>
          <h2 style={{ textAlign: "center", margin: 0, color: "var(--mk-danger)" }}>Unable to Start Exam</h2>
          <p className="text-dim" style={{ textAlign: "center", margin: "12px 0 24px" }}>{err}</p>
          <button onClick={() => navigate("/dashboard")}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!test) return <ExamLoader subject={subject} />;

  const q = test.questions[idx];
  const answeredCount = Object.keys(answers).length;
  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const danger = secondsLeft < 60;

  const Palette = () => (
    <div className="card" style={{ padding: 20 }}>
      <div className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <span>Question Palette</span>
        <span style={{ color: "var(--mk-accent)" }}>{answeredCount} / {test.question_count}</span>
      </div>
      <div className="mk-palette">
        {test.questions.map((qq, i) => {
          const answered = answers[qq.id];
          const active = i === idx;
          let bg = "var(--mk-bg-elev-2)";
          let color = "var(--mk-text-dim)";
          let border = "1px solid var(--mk-border)";
          
          if (answered) { bg = "var(--mk-success)"; color = "#052e16"; border = "1px solid var(--mk-success)"; }
          if (active) { bg = "var(--mk-accent)"; color = "var(--mk-accent-text)"; border = "2px solid white"; }
          
          return (
            <button
              key={qq.id}
              onClick={() => setIdx(i)}
              style={{ background: bg, color: color, border: border }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mk-test-root">
      
      {/* HEADER — Dark Glass */}
      <div className="mk-test-header">
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo size="sm" linkTo={null} />
            <div style={{ width: 1, height: 24, background: "var(--mk-border)" }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--mk-text)" }}>{SUBJECT_LABELS[test.subject] || test.subject}</div>
              <div className="text-dim" style={{ fontSize: "0.8rem" }}>
                {test.mode === "mock" ? "Mock Exam" : test.mode === "championship" ? "Championship" : "Practice"} • {answeredCount}/{test.question_count} answered
                {!isFullscreen && <span style={{ color: "var(--mk-warning)", marginLeft: 8 }}>• ⚠️ Fullscreen off</span>}
              </div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: danger ? "var(--mk-danger)" : "var(--mk-accent)", background: "var(--mk-bg-elev-2)", padding: "4px 12px", borderRadius: 8 }}>
            {mins}:{secs}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mk-test-main">
        <div className="mk-test-layout">

          {/* QUESTION COLUMN */}
          <div className="mk-test-question-col">
            {showTabWarning && (
              <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div className="card" style={{ maxWidth: 400, textAlign: "center", borderColor: "var(--mk-danger)", borderWidth: 2 }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
                  <h2 style={{ color: "var(--mk-danger)", marginBottom: 12 }}>Tab Switch Detected!</h2>
                  <p className="text-dim" style={{ marginBottom: 20 }}>
                    You switched tabs or minimized the window. This has been recorded.<br/><br/>
                    <strong>Warning {tabSwitches} of 3.</strong> Your test will automatically submit if you do this again.
                  </p>
                  <button onClick={() => setShowTabWarning(false)} style={{ width: "100%", background: "var(--mk-danger)", color: "white" }}>
                    Return to Test
                  </button>
                </div>
              </div>
            )}

            <div className="card mk-test-question-card" style={{ padding: "40px" }}>
              
              {/* TOP: Question label + bookmark + report */}
              <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span className="text-faint" style={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Question {idx + 1} of {test.question_count}
                </span>
                
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleReport(q.id)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--mk-border-strong)",
                      color: "var(--mk-text-faint)",
                      padding: "4px 12px",
                      borderRadius: "var(--mk-radius-pill)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s"
                    }}
                    title="Report an issue with this question"
                  >
                    🚩 Report
                  </button>

                  <button
                    onClick={() => toggleBookmark(q.id)}
                    style={{
                      background: bookmarks[q.id] ? "rgba(251, 191, 36, 0.15)" : "transparent",
                      border: `1px solid ${bookmarks[q.id] ? "var(--mk-warning)" : "var(--mk-border-strong)"}`,
                      color: bookmarks[q.id] ? "var(--mk-warning)" : "var(--mk-text-faint)",
                      padding: "4px 12px",
                      borderRadius: "var(--mk-radius-pill)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s"
                    }}
                    title="Save this question for later"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarks[q.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {bookmarks[q.id] ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              {/* MIDDLE: Question text & options (QuestionRenderer handles passage + image + Light Paper) */}
              <div className="mk-test-question-text" style={{ flex: 1, overflowY: "auto" }}>
                <QuestionRenderer 
                  question={q} 
                  selectedOption={answers[q.id]} 
                  onSelectOption={pick} 
                />

                {/* HINT SECTION — ONLY IN PRACTICE MODE */}
                {test.mode === "practice" && (
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    {!hintText ? (
                      <button 
                        onClick={getHint} 
                        disabled={hintLoading}
                        className="secondary" 
                        style={{ padding: "8px 16px", fontSize: "0.85rem", borderColor: "var(--mk-warning)", color: "var(--mk-warning)" }}
                      >
                        {hintLoading ? "Getting Hint..." : "💡 Get AI Hint"}
                      </button>
                    ) : (
                      <div style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid var(--mk-warning)", padding: 16, borderRadius: 8, textAlign: "left" }}>
                        <div style={{ fontWeight: 700, color: "var(--mk-warning)", marginBottom: 8, fontSize: "0.85rem" }}>💡 AI Hint:</div>
                        <div style={{ fontSize: "0.95rem", color: "var(--mk-text)", lineHeight: 1.6 }}>{hintText}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* NAV BUTTONS */}
            <div className="row-between" style={{ flexShrink: 0, marginTop: 16 }}>
              <button className="secondary" disabled={idx === 0} onClick={() => setIdx(idx - 1)} style={{ padding: "12px 24px" }}>← Prev</button>
              {idx < test.question_count - 1 ? (
                <button onClick={() => setIdx(idx + 1)} style={{ padding: "12px 24px" }}>Next →</button>
              ) : (
                <button disabled={submitting} onClick={() => doSubmit(false)} style={{ background: "var(--mk-success)", color: "#000", padding: "12px 24px" }}>
                  {submitting ? "Submitting..." : "Submit Exam"}
                </button>
              )}
            </div>

            <div className="mk-palette-mobile" style={{ marginTop: 16 }}>
              <Palette />
            </div>
          </div>

          {/* DESKTOP PALETTE */}
          <div className="mk-palette-desktop">
            <Palette />
          </div>

        </div>
      </div>

      {/* LAYOUT CSS */}
      <style>{`
        .mk-test-root {
          background: var(--mk-bg);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .mk-test-header {
          position: sticky;
          top: 0;
          z-index: 50;
          flex-shrink: 0;
          background: var(--mk-glass-bg-strong);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--mk-border);
          padding: 12px 16px;
        }

        .mk-test-main {
          flex: 1;
          padding: 16px;
        }

        .mk-test-layout {
          max-width: 1600px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .mk-test-question-col {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .mk-test-question-card {
          display: flex;
          flex-direction: column;
        }

        .mk-test-question-text {
          margin-bottom: 24px;
        }

        .mk-palette-desktop {
          display: none;
        }

        .mk-palette-mobile {
          display: block;
        }

        @media (min-width: 1024px) {
          .mk-test-root {
            height: 100vh;
            overflow: hidden;
          }
          .mk-test-main {
            flex: 1;
            overflow: hidden;
            padding: 24px;
          }
          .mk-test-layout {
            height: 100%;
            grid-template-columns: 60% 1fr;
            gap: 24px;
          }
          .mk-test-question-col {
            height: 100%;
            overflow: hidden;
          }
          .mk-test-question-card {
            height: 100%;
            overflow: hidden;
          }
          .mk-test-question-text {
            flex: 1 1 auto;
            overflow-y: auto;
            margin-bottom: 24px;
            padding-right: 8px;
          }
          .mk-palette-desktop {
            display: block;
            height: 100%;
            overflow-y: auto;
          }
          .mk-palette-mobile {
            display: none;
          }
          .mk-test-header {
            padding: 12px 24px;
          }
        }
      `}</style>
    </div>
  );
}