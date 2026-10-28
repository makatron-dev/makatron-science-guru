import { useEffect, useState } from "react";
import { api } from "../api.js";
import {
  LEVEL_LABELS, SUBJECT_LABELS, EDUCATION_LEVELS, SUBJECTS_BY_LEVEL,
} from "../constants.js";

const AVATAR_MAP = {
  "avatar_hacker": "👨‍💻", "avatar_robot": "🤖", "avatar_alien": "👽", "avatar_ninja": "🥷", "avatar_samurai": "⚔️",
  "avatar_pilot": "🚀", "avatar_astronaut": "👨‍🚀", "avatar_doctor": "👨‍⚕️", "avatar_scientist": "👨‍🔬", "avatar_wizard": "🧙‍♂️",
  "avatar_vampire": "🧛", "avatar_werewolf": "🐺", "avatar_gorilla": "🦍", "avatar_dragon": "🐉", "avatar_tiger": "🐯",
  "avatar_lion": "🦁", "avatar_eagle": "🦅", "avatar_phoenix": "🔥", "avatar_ghost": "👻", "avatar_king": "👑",
};

export default function LeaderboardPage() {
  const [tab, setTab] = useState("live"); // "live" | "hall"
  
  // Live Leaderboard State
  const [liveMode, setLiveMode] = useState("student"); // "student" | "school" | "state"
  const [subject, setSubject] = useState("biology");
  const [level, setLevel] = useState("senior");
  const [stateName, setStateName] = useState("Lagos");
  
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Hall of Fame State
  const [hallData, setHallData] = useState(null);
  const [hallErr, setHallErr] = useState("");

  // COMPLETE NIGERIAN STATES LIST (36 States + FCT)
  const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", 
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", 
    "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", 
    "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", 
    "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  useEffect(() => {
    if (tab === "live") {
      setRows(null);
      setErr("");
      setLoading(true);
      
      if (liveMode === "student") {
        api.leaderboardSubject(subject, level)
          .then((d) => setRows(d.rows))
          .catch((e) => setErr(e.message))
          .finally(() => setLoading(false));
      } else if (liveMode === "school") {
        api.leaderboardSchools()
          .then((d) => setRows(d.rows))
          .catch((e) => setErr(e.message))
          .finally(() => setLoading(false));
      } else if (liveMode === "state") {
        api.leaderboardState(stateName)
          .then((d) => setRows(d.rows))
          .catch((e) => setErr(e.message))
          .finally(() => setLoading(false));
      }
    } else {
      setHallData(null);
      setHallErr("");
      api.getChampionshipLeaderboard()
        .then(setHallData)
        .catch((e) => setHallErr(e.message));
    }
  }, [tab, liveMode, subject, level, stateName]);

  const baseSubjects = SUBJECTS_BY_LEVEL[level] || [];
  const availableSubjects = [...baseSubjects, "mixed"];
  const getSubjectLabel = (subj) => subj === "mixed" ? "Mixed Subjects" : (SUBJECT_LABELS[subj] || subj);

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: 1000 }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: "2.8rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>Hall of Legends</h1>
        <p className="text-dim" style={{ marginTop: 12, fontSize: "1.15rem" }}>The best of the best. Prove your worth on the national stage.</p>
      </div>

      {/* MAIN TABS */}
      <div className="row" style={{ gap: 16, marginBottom: 40, justifyContent: "center" }}>
        <button className={tab === "live" ? "" : "secondary"} onClick={() => setTab("live")} style={{ padding: "14px 32px", fontSize: "1.05rem", borderRadius: "var(--mk-radius-pill)", fontWeight: 800 }}>
          🏆 Live Rankings
        </button>
        <button className={tab === "hall" ? "" : "secondary"} onClick={() => setTab("hall")} style={{ padding: "14px 32px", fontSize: "1.05rem", borderRadius: "var(--mk-radius-pill)", fontWeight: 800 }}>
          🏛️ Hall of Fame
        </button>
      </div>

      {/* =========================================
          TAB 1: LIVE RANKINGS
          ========================================= */}
      {tab === "live" && (
        <div>
          {/* Sub-Tabs */}
          <div className="row" style={{ gap: 12, marginBottom: 32, justifyContent: "center" }}>
            <button className={liveMode === "student" ? "" : "secondary"} onClick={() => setLiveMode("student")} style={{ padding: "10px 24px", fontSize: "0.95rem", borderRadius: "var(--mk-radius-pill)", fontWeight: 700 }}>👤 Top Students</button>
            <button className={liveMode === "school" ? "" : "secondary"} onClick={() => setLiveMode("school")} style={{ padding: "10px 24px", fontSize: "0.95rem", borderRadius: "var(--mk-radius-pill)", fontWeight: 700 }}>🏫 Top Schools</button>
            <button className={liveMode === "state" ? "" : "secondary"} onClick={() => setLiveMode("state")} style={{ padding: "10px 24px", fontSize: "0.95rem", borderRadius: "var(--mk-radius-pill)", fontWeight: 700 }}>🗺️ By State</button>
          </div>

          {/* Filters */}
          <div className="card" style={{ padding: 32, marginBottom: 40, background: "var(--mk-glass-bg)", border: "1px solid var(--mk-glass-border)", borderRadius: "var(--mk-radius-lg)" }}>
            {liveMode === "student" && (
              <div className="form-grid-2">
                <div>
                  <label>Class Level</label>
                  <select value={level} onChange={(e) => { const lvl = e.target.value; setLevel(lvl); setSubject(SUBJECTS_BY_LEVEL[lvl][0]); }} style={{ height: 48 }}>
                    {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                  </select>
                </div>
                <div>
                  <label>Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ height: 48 }}>
                    {availableSubjects.map((s) => <option key={s} value={s}>{getSubjectLabel(s)}</option>)}
                  </select>
                </div>
              </div>
            )}

            {liveMode === "school" && (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <p className="text-dim" style={{ margin: 0, fontSize: "1.05rem" }}>Ranking schools by total Championship points earned across all students.</p>
              </div>
            )}

            {liveMode === "state" && (
              <div style={{ maxWidth: 400, margin: "0 auto" }}>
                <label style={{ textAlign: "center" }}>Select State</label>
                <select value={stateName} onChange={(e) => setStateName(e.target.value)} style={{ height: 48 }}>
                  {NIGERIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Leaderboard List */}
          <div className="card" style={{ padding: 0, overflow: "hidden", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", borderRadius: "var(--mk-radius-lg)", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
            {err && <p style={{ color: "var(--mk-danger)", padding: 24, fontWeight: 600 }}>{err}</p>}
            {loading ? (
              <div style={{ padding: 24 }} className="stack">
                <div className="mk-skeleton" style={{ height: 70, borderRadius: 12 }} />
                <div className="mk-skeleton" style={{ height: 70, borderRadius: 12 }} />
                <div className="mk-skeleton" style={{ height: 70, borderRadius: 12 }} />
              </div>
            ) : rows && rows.length === 0 ? (
              <div style={{ padding: 80, textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: 24 }}>📉</div>
                <h3 className="text-dim" style={{ margin: 0, fontSize: "1.3rem" }}>No scores yet</h3>
                <p className="text-faint" style={{ marginTop: 12, fontSize: "1.05rem" }}>Take a test or enter the Arena to claim the #1 spot!</p>
              </div>
            ) : rows ? (
              <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {rows.slice(0, 15).map((r, i) => {
                  const isTop3 = i < 3;
                  return (
                    <li key={i} className="row-between" style={{ padding: isTop3 ? "28px 32px" : "20px 32px", borderBottom: i < Math.min(rows.length, 15) - 1 ? "1px solid var(--mk-border)" : "none", background: isTop3 ? "linear-gradient(90deg, rgba(251, 191, 36, 0.08) 0%, transparent 100%)" : "transparent", borderLeft: i === 0 ? "4px solid var(--mk-warning)" : i === 1 ? "4px solid #94a3b8" : i === 2 ? "4px solid #b45309" : "4px solid transparent" }}>
                      <div className="row" style={{ gap: 20 }}>
                        {/* Rank Icon */}
                        <div style={{ fontSize: isTop3 ? "2rem" : "1.2rem", minWidth: 40, textAlign: "center", fontWeight: 900, color: isTop3 ? "var(--mk-text)" : "var(--mk-text-faint)" }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </div>
                        
                        {/* Avatar / Icon */}
                        {liveMode === "student" ? (
                          <div style={{ width: isTop3 ? 52 : 44, height: isTop3 ? 52 : 44, borderRadius: "50%", background: "var(--mk-bg-elev-2)", border: isTop3 ? "2px solid var(--mk-warning)" : "1px solid var(--mk-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isTop3 ? "1.8rem" : "1.5rem" }}>
                            {AVATAR_MAP[r.avatar_id] || "👤"}
                          </div>
                        ) : (
                          <div style={{ width: isTop3 ? 52 : 44, height: isTop3 ? 52 : 44, borderRadius: "50%", background: "rgba(0, 212, 255, 0.1)", border: isTop3 ? "2px solid var(--mk-accent)" : "1px solid var(--mk-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isTop3 ? "1.8rem" : "1.5rem" }}>
                            {liveMode === "school" ? "🏫" : "🗺️"}
                          </div>
                        )}

                        {/* Name & Subtitle */}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: isTop3 ? "1.3rem" : "1.1rem", color: "var(--mk-text)" }}>
                            {liveMode === "student" ? r.display_name : r.name}
                          </div>
                          {liveMode === "student" && (
                            <div className="text-faint" style={{ fontSize: "0.9rem", marginTop: 4 }}>{r.school_name || "Independent Student"}</div>
                          )}
                          {liveMode === "school" && (
                            <div className="text-faint" style={{ fontSize: "0.9rem", marginTop: 4 }}>{r.student_count} active students</div>
                          )}
                          {liveMode === "state" && (
                            <div className="text-faint" style={{ fontSize: "0.9rem", marginTop: 4 }}>{stateName} State</div>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ color: isTop3 ? "var(--mk-warning)" : "var(--mk-success)", fontWeight: 900, fontSize: isTop3 ? "1.8rem" : "1.4rem" }}>{r.total_score || r.total_points}</div>
                        <div className="text-faint" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>points</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: HALL OF FAME
          ========================================= */}
      {tab === "hall" && (
        <div>
          {hallErr && <p style={{ color: "var(--mk-danger)", textAlign: "center", fontWeight: 600 }}>{hallErr}</p>}
          {!hallData ? (
            <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading Hall of Fame...</div>
          ) : hallData.length === 0 ? (
            <div className="card" style={{ padding: 80, textAlign: "center", borderStyle: "dashed", background: "transparent" }}>
              <div style={{ fontSize: "5rem", marginBottom: 24 }}>🏛️</div>
              <h2 className="text-dim" style={{ margin: 0, fontSize: "1.5rem" }}>No Championships Archived Yet</h2>
              <p className="text-faint" style={{ marginTop: 12, fontSize: "1.05rem" }}>Complete a championship event to see the first legends here.</p>
            </div>
          ) : (
            <div className="stack" style={{ gap: 32 }}>
              {hallData.map((championship, idx) => (
                <div key={idx} className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--mk-warning)", background: "linear-gradient(180deg, rgba(251, 191, 36, 0.08) 0%, var(--mk-bg-elev) 100%)", boxShadow: "0 12px 40px rgba(251, 191, 36, 0.1)" }}>
                  <div style={{ padding: "32px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, background: "rgba(0,0,0,0.2)" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--mk-warning)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "1.2rem" }}>🏆</span> MAKAVERSE AWARD WINNERS
                      </div>
                      <h2 style={{ margin: 0, color: "var(--mk-text)", fontSize: "1.8rem" }}>{championship.exam_title}</h2>
                    </div>
                    {championship.end_date && (
                      <div className="text-faint" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Concluded: {new Date(championship.end_date).toLocaleDateString()}</div>
                    )}
                  </div>
                  <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {championship.winners?.map((w, i) => (
                      <li key={i} className="row-between" style={{ padding: "28px 32px", borderBottom: i < championship.winners.length - 1 ? "1px solid var(--mk-border)" : "none" }}>
                        <div className="row" style={{ gap: 24 }}>
                          <div style={{ fontSize: "2.5rem", minWidth: 40 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
                          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--mk-bg-elev-2)", border: i === 0 ? "2px solid var(--mk-warning)" : "1px solid var(--mk-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                            {AVATAR_MAP[w.avatar_id] || "👑"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "var(--mk-text)" }}>{w.display_name}</div>
                            <div className="text-faint" style={{ fontSize: "0.95rem", marginTop: 4 }}>{w.school_name}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="mono" style={{ color: "var(--mk-warning)", fontWeight: 900, fontSize: "1.8rem" }}>{w.score}</div>
                          <div className="text-faint" style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700 }}>points</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}