import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

// ---------- Countdown Hook ----------
function useCountdown(targetDate) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: diff === 0 };
}

function CountdownDigit({ value, label, color = "var(--mk-text)" }) {
  return (
    <div style={{ background: "var(--mk-bg)", border: "1px solid var(--mk-border)", padding: "16px 8px", borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", color: color }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-text-faint)", marginTop: 8 }}>
        {label}
      </div>
    </div>
  );
}

export default function ArenaPage() {
  const [data, setData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArena() {
      try {
        const res = await api.getChampionshipCurrent();
        setData(res);
        
        // If the championship is live, fetch the final results immediately to show the preview
        // (Only if it's live, otherwise the user sees the countdown)
        if (res.status === "live" || res.status === "none") {
            // Try to fetch latest results if there is a past exam
            // The backend protects this, so if no past exam exists, it returns { active: false }
            const latestResults = await api.getChampionshipLeaderboard().catch(() => null);
            setResults(latestResults);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArena();
  }, []);

  const countdownTarget = data?.status === "live" ? data.end_date : (data?.status === "upcoming" ? data.start_date : null);
  const countdown = useCountdown(countdownTarget);

  if (loading) {
    return <div className="container" style={{ padding: 40, textAlign: "center" }}>Loading Arena...</div>;
  }

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 900 }}>
      
      {/* HERO */}
      <div style={{ position: "relative", padding: "40px 32px", marginBottom: 24, borderRadius: 16, overflow: "hidden", background: "linear-gradient(135deg, var(--mk-bg-elev), var(--mk-bg-elev-2))", border: "1px solid var(--mk-border)" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--mk-warning)", marginBottom: 12 }}>
            🏆 Championship Arena
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {data?.title || "The Arena Awaits"}
          </h1>
          <p className="text-dim" style={{ marginTop: 12, fontSize: "1rem", maxWidth: 600 }}>
            One attempt. Every point counts. Prove you're the best.
          </p>
        </div>
      </div>

      {/* DYNAMIC STATE CARD */}
      {data?.status === "live" && (
        <div className="card" style={{ marginBottom: 24, border: "2px solid var(--mk-warning)" }}>
          <div className="row-between" style={{ marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--mk-warning)" }}>🔥 ARENA IS LIVE</h2>
              <p className="text-dim" style={{ margin: "4px 0 0 0" }}>The clock is ticking. Don't miss your shot.</p>
            </div>
          </div>

          {data.attempted ? (
            <div style={{ padding: 24, borderRadius: 12, background: "var(--mk-bg-elev-2)", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <h3 style={{ margin: 0, color: "var(--mk-success)" }}>Attempt Recorded</h3>
              <p className="text-dim" style={{ margin: "8px 0 16px 0" }}>
                You have already taken this championship. Your score of <strong>{data.attempted_score}</strong> is locked in.
              </p>
              <p className="text-faint" style={{ fontSize: "0.85rem" }}>Final results will be published when the arena closes.</p>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 16px 0", fontWeight: 600 }}>Time remaining to submit your entry:</p>
              {countdown && !countdown.expired ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                  <CountdownDigit value={countdown.days} label="Days" color="var(--mk-warning)" />
                  <CountdownDigit value={countdown.hours} label="Hours" color="var(--mk-warning)" />
                  <CountdownDigit value={countdown.minutes} label="Mins" color="var(--mk-warning)" />
                  <CountdownDigit value={countdown.seconds} label="Secs" color="var(--mk-danger)" />
                </div>
              ) : (
                <p style={{ color: "var(--mk-danger)", fontWeight: "bold" }}>Arena closing...</p>
              )}

              <Link to={`/test/mixed/championship?exam_id=${data.exam_id}`} style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: 800, background: "var(--mk-warning)", color: "#000", boxShadow: "0 4px 20px rgba(251, 191, 36, 0.4)" }}>
                  ⚔️ Enter The Arena
                </button>
              </Link>
            </>
          )}
        </div>
      )}

      {data?.status === "upcoming" && (
        <div className="card" style={{ marginBottom: 24, border: "1px solid var(--mk-accent)" }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--mk-accent)" }}>⏳ Arena Opens Soon</h2>
            <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Get ready. The championship begins shortly.</p>
          </div>

          {countdown && !countdown.expired ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <CountdownDigit value={countdown.days} label="Days" color="var(--mk-accent)" />
              <CountdownDigit value={countdown.hours} label="Hours" color="var(--mk-accent)" />
              <CountdownDigit value={countdown.minutes} label="Mins" color="var(--mk-accent)" />
              <CountdownDigit value={countdown.seconds} label="Secs" color="var(--mk-accent)" />
            </div>
          ) : (
            <p style={{ color: "var(--mk-success)", fontWeight: "bold" }}>Starting now...</p>
          )}
        </div>
      )}

      {data?.status === "none" && (
        <div className="card" style={{ marginBottom: 24, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.5 }}>🏟️</div>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>The Arena is Silent</h2>
          <p className="text-dim" style={{ marginTop: 8 }}>There is no active or upcoming championship right now. Check back later.</p>
        </div>
      )}

      {/* CHAMPIONSHIP LEADERBOARD */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row-between" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>🏛️ Hall of Fame</h3>
          <span className="text-faint" style={{ fontSize: "0.8rem" }}>Past Champions</span>
        </div>
        
        {!results || !results.active ? (
          <div style={{ padding: 32, textAlign: "center", border: "1px dashed var(--mk-border)", borderRadius: 8 }}>
            <p className="text-dim" style={{ margin: 0 }}>No past championships have concluded yet.</p>
          </div>
        ) : (
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>{results.title}</h4>
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {results.winners.map((w) => (
                <li key={w.rank} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--mk-border)" }}>
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: w.rank === 1 ? "var(--mk-warning)" : w.rank === 2 ? "var(--mk-text-dim)" : "#cd7f32" }}>
                      #{w.rank}
                    </span>
                    <strong>{w.name}</strong>
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--mk-success)" }}>{w.score} pts</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}