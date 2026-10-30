import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { EDUCATION_LEVELS, SUBJECTS_BY_LEVEL, LEVEL_LABELS, SUBJECT_LABELS, ALL_SUBJECTS, EXAM_TARGETS_BY_LEVEL, EXAM_TARGET_LABELS } from "../constants.js";
import ChemText from "../ChemText.jsx";
import Logo from "../components/Logo.jsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [view, setView] = useState("dashboard"); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [stats, setStats] = useState({ exams: 0, students: 0, questions: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  const isSuper = !!user?.is_admin || user?.role === "super_admin";

  function refreshGlobalData() {
    api.adminGetExams().then(d => setStats(s => ({ ...s, exams: d.length }))).catch(() => {});
    api.adminStudents().then(d => setStats(s => ({ ...s, students: d.length }))).catch(() => {});
    api.adminQuestions({ limit: 1 }).then(d => setStats(s => ({ ...s, questions: d.total }))).catch(() => {});
    api.adminGetUnreadCount().then(d => setUnreadCount(d.unread)).catch(() => {});
  }

  useEffect(() => { refreshGlobalData(); }, [view]);

  useEffect(() => {
    const interval = setInterval(refreshGlobalData, 45000);
    return () => clearInterval(interval);
  }, []);

  if (!user || (!user.is_admin && user.role !== "school_admin" && user.role !== "super_admin")) {
    return <div className="container" style={{ padding: 40 }}>Access Denied</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", overflow: "hidden" }}>
      
      {/* MOBILE HEADER */}
      <div className="public-mobile-header" style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Logo size="sm" linkTo={null} />
        </div>
        
        <div className="row" style={{ gap: 12 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setView("inbox")}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--mk-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             {unreadCount > 0 && (
               <div style={{ position: "absolute", top: -6, right: -6, background: "var(--mk-danger)", color: "white", fontSize: "0.65rem", fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</div>
             )}
          </div>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: "none", color: "var(--mk-text)", fontSize: "1.5rem", cursor: "pointer", padding: 0 }}>☰</button>
        </div>
      </div>

      <div className="admin-layout" style={{ flex: 1, overflow: "hidden" }}>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />}

        <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ height: "100%", overflowY: "auto" }}>
          <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Logo size="sm" linkTo={null} />
              <div className="text-dim" style={{ fontSize: "0.65rem", marginTop: 8, letterSpacing: "1px" }}>ADMIN COMMAND CENTER</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="mobile-menu-btn" style={{ display: "block", padding: 4, border: "none", background: "transparent", color: "var(--mk-text)", fontSize: "1.2rem" }}>✕</button>
          </div>
          
          <div style={{ padding: "24px 0" }}>
            <div className="text-faint" style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0 24px", marginBottom: 12 }}>Main</div>
            <SidebarItem icon="📊" label="Dashboard" active={view === "dashboard"} onClick={() => { setView("dashboard"); setSidebarOpen(false); }} />
            <SidebarItem icon="📈" label="Analytics" active={view === "analytics"} onClick={() => { setView("analytics"); setSidebarOpen(false); }} />
            <SidebarItem icon="🎯" label="Difficulty Calibration" active={view === "difficulty"} onClick={() => { setView("difficulty"); setSidebarOpen(false); }} />
            
            <div className="text-faint" style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0 24px", marginTop: 24, marginBottom: 12 }}>Academics</div>
            <SidebarItem icon="📝" label="Exam Center" active={view === "exams"} onClick={() => { setView("exams"); setSidebarOpen(false); }} />
            <SidebarItem icon="📚" label="Question Bank" active={view === "bank"} onClick={() => { setView("bank"); setSidebarOpen(false); }} />
            <SidebarItem icon="📄" label="Passage Manager" active={view === "passages"} onClick={() => { setView("passages"); setSidebarOpen(false); }} />
            <SidebarItem icon="📖" label="Library Manager" active={view === "library"} onClick={() => { setView("library"); setSidebarOpen(false); }} />
            <SidebarItem icon="🗂️" label="Staging Area" active={view === "staging"} onClick={() => { setView("staging"); setSidebarOpen(false); }} />
            <SidebarItem icon="⚙️" label="Exam Rules & Config" active={view === "config"} onClick={() => { setView("config"); setSidebarOpen(false); }} />
            <SidebarItem icon="🎥" label="Live Classes" active={view === "zoom"} onClick={() => { setView("zoom"); setSidebarOpen(false); }} />
            <SidebarItem icon="📊" label="Exam Results" active={view === "results"} onClick={() => { setView("results"); setSidebarOpen(false); }} />
            
            <div className="text-faint" style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0 24px", marginTop: 24, marginBottom: 12 }}>Users</div>
            <SidebarItem icon="👥" label="Student Directory" active={view === "students"} onClick={() => { setView("students"); setSidebarOpen(false); }} />
            {isSuper && <SidebarItem icon="🏫" label="School Manager" active={view === "schools"} onClick={() => { setView("schools"); setSidebarOpen(false); }} />}
            {isSuper && <SidebarItem icon="💳" label="Premium Manager" active={view === "premium"} onClick={() => { setView("premium"); setSidebarOpen(false); }} />}
            {isSuper && <SidebarItem icon="🏆" label="Leaderboard Rules" active={view === "leaderboard"} onClick={() => { setView("leaderboard"); setSidebarOpen(false); }} />}
            
            <div className="text-faint" style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0 24px", marginTop: 24, marginBottom: 12 }}>System</div>
            
            <div onClick={() => { setView("inbox"); setSidebarOpen(false); }} className={`admin-sidebar-item ${view === "inbox" ? 'active' : ''}`} style={{ padding: "10px 24px", margin: "2px 0", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: view === "inbox" ? "var(--mk-bg-elev-2)" : "transparent", color: view === "inbox" ? "var(--mk-accent)" : "var(--mk-text-dim)", borderLeft: view === "inbox" ? "3px solid var(--mk-accent)" : "3px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: 12, fontSize: "1.1rem" }}>{unreadCount > 0 ? "✉️" : "📖"}</span>
                <span style={{ fontWeight: view === "inbox" ? 600 : 500, fontSize: "0.95rem" }}>System Inbox</span>
              </div>
              {unreadCount > 0 && (
                <span style={{ background: "var(--mk-danger)", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>{unreadCount}</span>
              )}
            </div>

            <SidebarItem icon="🚩" label="Reported Questions" active={view === "reports"} onClick={() => { setView("reports"); setSidebarOpen(false); }} />
            {isSuper && <SidebarItem icon="📢" label="Ticker Manager" active={view === "ticker"} onClick={() => { setView("ticker"); setSidebarOpen(false); }} />}
            {isSuper && <SidebarItem icon="⚙️" label="Settings" active={view === "settings"} onClick={() => { setView("settings"); setSidebarOpen(false); }} />}
            {isSuper && <SidebarItem icon="🎧" label="Support & Logs" active={view === "support"} onClick={() => { setView("support"); setSidebarOpen(false); }} />}
          </div>
          
          <div style={{ padding: "20px", borderTop: "1px solid var(--mk-border)" }}>
            <div style={{ marginBottom: 16 }}>
              <div className="text-dim" style={{ fontSize: "0.8rem" }}>Admin:</div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--mk-text)" }}>{user.display_name}</div>
              <div className="text-faint" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{user.role || (user.is_admin ? "admin" : "user")}</div>
            </div>
            <button className="secondary" onClick={logout} style={{ width: "100%", padding: "10px", borderColor: "var(--mk-danger)", color: "var(--mk-danger)" }}>Sign Out</button>
          </div>
        </div>

        <div className="admin-main" style={{ height: "100%", overflow: "hidden" }}>
          <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
              <div className="text-dim" style={{ fontWeight: 600, textTransform: "capitalize" }}>{view.replace("_", " ")}</div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
               <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setView("inbox")}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mk-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                 {unreadCount > 0 && <div style={{ position: "absolute", top: -6, right: -6, background: "var(--mk-danger)", color: "white", fontSize: "0.7rem", fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</div>}
               </div>
               <span className="text-faint" style={{ fontSize: "0.85rem" }}>Online</span>
               <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--mk-success)" }}></div>
            </div>
          </div>

          <div className="admin-content" style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
              {view === "dashboard" && <DashboardOverview stats={stats} onNavigate={setView} />}
              {view === "analytics" && <AnalyticsCenter />}
              {view === "difficulty" && <DifficultyCalibration />}
              {view === "exams" && <ExamCenter />}
              {view === "bank" && <QuestionBank />}
              {view === "results" && <ResultsCenter />}
              {view === "passages" && <PassageManager />}
              {view === "library" && <LibraryManager />}
              {view === "staging" && <StagingArea />}
              {view === "config" && <ConfigCenter />}
              {view === "zoom" && <ZoomManager />}
              {view === "students" && <StudentsCenter onRefresh={refreshGlobalData} />}
              {view === "schools" && isSuper && <SchoolManager />}
              {view === "premium" && isSuper && <PremiumManager />}
              {view === "leaderboard" && isSuper && <LeaderboardManager />}
              {view === "inbox" && <SystemInbox onMarkRead={refreshGlobalData} />}
              {view === "reports" && <ReportedQuestions />}
              {view === "ticker" && isSuper && <TickerManager />}
              {view === "settings" && isSuper && <SettingsCenter />}
              {view === "support" && isSuper && <SupportCenter />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`admin-sidebar-item ${active ? 'active' : ''}`} style={{ padding: "10px 24px", margin: "2px 0", display: "flex", alignItems: "center", cursor: "pointer", background: active ? "var(--mk-bg-elev-2)" : "transparent", color: active ? "var(--mk-accent)" : "var(--mk-text-dim)", borderLeft: active ? "3px solid var(--mk-accent)" : "3px solid transparent" }}>
      <span style={{ marginRight: 12, fontSize: "1.1rem" }}>{icon}</span>
      <span style={{ fontWeight: active ? 600 : 500, fontSize: "0.95rem" }}>{label}</span>
    </div>
  );
}

// ---------------- 1. DASHBOARD ----------------
function DashboardOverview({ stats, onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.adminLogs().then(setLogs).catch(() => {});
    api.adminAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  const weakest = Array.isArray(analytics?.weakest_topics) ? analytics.weakest_topics.slice(0, 5) : [];

  return (
    <div className="stack">
      <div className="row-between" style={{ flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Command Center</h1>
          <p className="text-dim">Welcome back. Here is the pulse of your platform.</p>
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="secondary" onClick={() => onNavigate("staging")}>Import Questions</button>
          <button onClick={() => onNavigate("exams")}>Create Exam</button>
        </div>
      </div>
      
      <div className="form-grid-3" style={{ marginTop: 24 }}>
        <StatCard title="Live Exams" value={stats.exams} icon="📝" color="var(--mk-accent)" onClick={() => onNavigate("exams")} />
        <StatCard title="Active Students" value={stats.students} icon="👥" color="var(--mk-success)" onClick={() => onNavigate("students")} />
        <StatCard title="Question Bank" value={stats.questions} icon="📚" color="var(--mk-warning)" onClick={() => onNavigate("bank")} />
      </div>

      <div className="form-grid-2" style={{ marginTop: 32 }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>System Logs</h3>
            <span className="text-faint" style={{ fontSize: "0.8rem" }}>Live</span>
          </div>
          <div className="stack" style={{ gap: 12 }}>
             {logs.length === 0 ? <p className="text-faint">No recent activity.</p> : logs.map((log, i) => (
               <div key={i} className="row-between" style={{ paddingBottom: 12, borderBottom: i < logs.length - 1 ? "1px solid var(--mk-border)" : "none" }}>
                  <div className="text-dim" style={{ fontSize: "0.9rem" }}>{log.msg}</div>
                  <div className="text-faint" style={{ fontSize: "0.8rem" }}>{new Date(log.time).toLocaleTimeString()}</div>
               </div>
             ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Platform Shortcuts</h3>
          <div className="form-grid-2" style={{ gap: 12 }}>
            <button className="secondary" style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => onNavigate("students")}><span style={{ fontSize: "1.5rem" }}>👥</span> Students</button>
            <button className="secondary" style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => onNavigate("exams")}><span style={{ fontSize: "1.5rem" }}>📝</span> Exams</button>
            <button className="secondary" style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => onNavigate("inbox")}><span style={{ fontSize: "1.5rem" }}>✉️</span> Inbox</button>
            <button className="secondary" style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => onNavigate("settings")}><span style={{ fontSize: "1.5rem" }}>⚙️</span> Settings</button>
          </div>
        </div>
      </div>

      {weakest.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="row-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Weakest Topics</h3>
            <span className="text-faint" style={{ fontSize: "0.8rem" }}>Platform-wide</span>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {weakest.map((t, i) => (
              <div key={i} className="row-between" style={{ paddingBottom: 12, borderBottom: i < weakest.length - 1 ? "1px solid var(--mk-border)" : "none" }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.topic || t.name || "Unknown"}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--mk-danger)", fontWeight: 700 }}>{typeof t.avg_score === "number" ? `${Math.round(t.avg_score)}%` : (typeof t.score === "number" ? `${Math.round(t.score)}%` : "—")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div className="card" style={{ cursor: "pointer", transition: "transform 0.2s", borderTop: `4px solid ${color}` }} onClick={onClick} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: "1.5rem" }}>{icon}</div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, textTransform: "uppercase" }}>{title}</div>
      </div>
      <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ---------------- 2. ANALYTICS ----------------
function AnalyticsCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => { 
    api.adminAnalytics()
      .then(setData)
      .catch((e) => setErr(e.message || "Failed to load analytics."))
      .finally(() => setLoading(false)); 
  }, []);

  if (loading) return <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />;
  if (err) return <div className="card" style={{ borderLeft: "4px solid var(--mk-danger)" }}>{err}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>Platform Analytics</h1>
      <p className="text-dim">Deep dive into student performance metrics.</p>
      <div className="form-grid-3" style={{ marginTop: 24 }}>
        <div className="card"><h3>Total Students</h3><div style={{ fontSize: "2rem", fontWeight: 800 }}>{data.total_students}</div></div>
        <div className="card"><h3>Total Tests Taken</h3><div style={{ fontSize: "2rem", fontWeight: 800 }}>{data.total_tests}</div></div>
        <div className="card"><h3>Avg. Score</h3><div style={{ fontSize: "2rem", fontWeight: 800 }}>{data.avg_score} pts</div></div>
      </div>
      
      <div className="card" style={{ marginTop: 24, padding: "24px" }}>
        <h3 style={{ marginBottom: 24 }}>Platform Activity (Last 7 Days)</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mk-border)" />
              <XAxis dataKey="date" stroke="var(--mk-text-dim)" />
              <YAxis stroke="var(--mk-text-dim)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--mk-bg-elev-2)", border: "1px solid var(--mk-border)", borderRadius: 8, color: "var(--mk-text)" }} itemStyle={{ color: "var(--mk-accent)" }} />
              <Line type="monotone" dataKey="tests" stroke="var(--mk-accent)" strokeWidth={3} dot={{ r: 4, fill: "var(--mk-accent)" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---------------- 2.5 DIFFICULTY CALIBRATION ----------------
function DifficultyCalibration() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    api.adminGetDifficultyAnalytics()
      .then(setData)
      .catch((e) => setErr(e.message || "Could not load difficulty analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />;
  if (err) return <div className="card" style={{ borderLeft: "4px solid var(--mk-danger)" }}>{err}</div>;
  if (!data) return null;

  const tooEasy = data.too_easy || [];
  const tooHard = data.too_hard || [];

  const renderList = (items, tone, emptyText) => {
    if (items.length === 0) {
      return <div className="text-dim" style={{ padding: 20, textAlign: "center" }}>{emptyText}</div>;
    }
    return (
      <div className="stack" style={{ gap: 10 }}>
        {items.map((q) => (
          <div
            key={q.id}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: "var(--mk-bg-elev-2)",
              border: "1px solid var(--mk-border)",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 900, color: tone, fontSize: "0.85rem", minWidth: 52 }}>
              {typeof q.time === "number" ? `${Math.round(q.time)}s` : "—"}
            </div>
            <div style={{ flex: 1, fontSize: "0.9rem", color: "var(--mk-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              #{q.id} — {q.text || "Question text unavailable"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Difficulty Calibration</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>
          Powered by aggregate time-to-answer analytics. Flag questions that are too easy (most students solve in under 5 seconds) or too hard (average over 3 minutes) for a quality pass.
        </p>
      </div>

      <div className="form-grid-2">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>⚡ Too Easy</h3>
            <span className="text-faint" style={{ fontSize: "0.8rem" }}>{tooEasy.length} questions</span>
          </div>
          {renderList(tooEasy, "var(--mk-warning)", "No suspiciously easy questions detected.")}
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>🧠 Too Hard</h3>
            <span className="text-faint" style={{ fontSize: "0.8rem" }}>{tooHard.length} questions</span>
          </div>
          {renderList(tooHard, "var(--mk-danger)", "No suspiciously hard questions detected.")}
        </div>
      </div>
    </div>
  );
}

// ---------------- 3. EXAM CENTER ----------------
function ExamCenter() {
  const [view, setView] = useState("list");
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeExamForQuestion, setActiveExamForQuestion] = useState(null);
  const [createType, setCreateType] = useState("mock");

  function loadExams() {
    api.adminGetExams().then(setExams).catch(() => {});
  }

  useEffect(() => {
    if (view === "list") loadExams();
  }, [view]);

  async function deleteExam(exam) {
    if (!window.confirm(`Delete "${exam.title}" permanently?\n\nAll questions attached to this exam will also be deleted. This cannot be undone.`)) return;
    try {
      await api.adminDeleteExam(exam.id);
      loadExams();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  if (view === "create") return <CreateExam initialType={createType} onBack={() => setView("list")} onCreated={() => setView("list")} />;
  if (view === "manage" && selectedExam) return <ExamBuilder exam={selectedExam} onBack={() => { setSelectedExam(null); setView("list"); }} onAddQuestion={() => { setActiveExamForQuestion(selectedExam); setView("add_question"); }} onUpdateExam={(updated) => { setSelectedExam(updated); loadExams(); }} />;
  if (view === "add_question" && activeExamForQuestion) return <AddQuestionPage exam={activeExamForQuestion} onBack={() => setView("manage")} onSaved={() => setView("manage")} />;

  const practiceExams = exams.filter(e => e.exam_type === "practice");
  const mockExams = exams.filter(e => e.exam_type === "mock");
  const champExams = exams.filter(e => e.exam_type === "championship");

  function openCreate(type) {
    setCreateType(type);
    setView("create");
  }

  const ExamList = ({ title, subtitle, type, list, icon }) => (
    <div style={{ marginBottom: 40 }}>
      <div className="row-between" style={{ marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span>{icon}</span> {title}
            <span style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 500 }}>({list.length})</span>
          </h2>
          <p className="text-dim" style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>{subtitle}</p>
        </div>
        <button onClick={() => openCreate(type)}>+ Create {title.split(" ")[0]} Exam</button>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32, borderStyle: "dashed" }}>
          <p className="text-faint" style={{ margin: 0 }}>No {title.toLowerCase()} yet.</p>
        </div>
      ) : (
        <div className="exam-grid">
          {list.map(ex => (
            <div key={ex.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{ex.title}</div>
                  <span style={{ fontSize: "0.7rem", background: ex.is_active ? "rgba(34, 217, 154, 0.1)" : "rgba(255, 107, 107, 0.1)", color: ex.is_active ? "var(--mk-success)" : "var(--mk-danger)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>{ex.is_active ? "ACTIVE" : "INACTIVE"}</span>
                </div>
                <div className="text-dim" style={{ fontSize: "0.85rem", marginBottom: 8 }}>{LEVEL_LABELS[ex.education_level]} • {SUBJECT_LABELS[ex.subject] || ex.subject}</div>
                {ex.exam_type === "championship" && (ex.start_date || ex.end_date) && (
                  <div className="text-faint" style={{ fontSize: "0.8rem", marginBottom: 12 }}>
                    🏆 {ex.start_date ? new Date(ex.start_date).toLocaleDateString() : "?"} → {ex.end_date ? new Date(ex.end_date).toLocaleDateString() : "?"}
                  </div>
                )}
              </div>
              <div className="row" style={{ gap: 8, marginTop: 16 }}>
                <button onClick={() => { setSelectedExam(ex); setView("manage"); }} className="secondary" style={{ flex: 1 }}>Manage</button>
                <button className="secondary" style={{ padding: "8px" }} onClick={() => api.adminToggleExam(ex.id).then(() => loadExams())} title="Toggle Active">🔄</button>
                <button
                  className="secondary"
                  style={{ padding: "8px", borderColor: "rgba(255, 107, 107, 0.4)", color: "var(--mk-danger)" }}
                  onClick={() => deleteExam(ex)}
                  title="Delete Exam"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Exam Center</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Manage all exam types: Practice, Mock, and Championship.</p>
      </div>

      <ExamList title="Practice Exams" subtitle="Unlimited retakes. Sharpen skills." type="practice" list={practiceExams} icon="🎯" />
      <ExamList title="Mock Exams" subtitle="One attempt per student. Real stakes." type="mock" list={mockExams} icon="📚" />
      <ExamList title="Championship Exams" subtitle="Timed arena events. Top 3 go to Hall of Fame." type="championship" list={champExams} icon="🏆" />
    </div>
  );
}

// ---------------- 4. QUESTION BANK ----------------
function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ education_level: "", subject: "" });

  function loadQuestions() {
    const q = {};
    if (filters.education_level) q.education_level = filters.education_level;
    if (filters.subject) q.subject = filters.subject;
    api.adminQuestions(q).then(d => setQuestions(d.items)).catch(() => {});
  }

  useEffect(loadQuestions, [filters]);

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <h1>Question Bank</h1>
          <p className="text-dim" style={{ margin: 0 }}>Manage all questions across the platform.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <select value={filters.education_level} onChange={e => setFilters({ ...filters, education_level: e.target.value, subject: "" })} style={{ width: 200 }}>
            <option value="">All Levels</option>
            {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
          </select>
          <select value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value })} style={{ width: 200 }}>
            <option value="">All Subjects</option>
            {(filters.education_level ? SUBJECTS_BY_LEVEL[filters.education_level] : ALL_SUBJECTS).map(s => <option key={s} value={s}>{SUBJECT_LABELS[s] || s}</option>)}
          </select>
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                <th style={{ padding: "16px" }}>Question</th>
                <th style={{ padding: "16px" }}>Level</th>
                <th style={{ padding: "16px" }}>Subject</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: 20, textAlign: "center" }} className="text-dim">No questions found.</td></tr>
              ) : questions.map(q => (
                <tr key={q.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                  <td style={{ padding: "16px", maxWidth: 400 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><ChemText text={q.question_text} /></div></td>
                  <td style={{ padding: "16px" }}>{LEVEL_LABELS[q.education_level]}</td>
                  <td style={{ padding: "16px" }}>{SUBJECT_LABELS[q.subject] || q.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------- 4.4 PASSAGE MANAGER ----------------
function PassageManager() {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    content: "",
    subject: "biology",
    education_level: "senior",
    exam_target: "jamb",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    setLoading(true);
    api.adminGetPassages()
      .then((d) => setPassages(d || []))
      .catch(() => setPassages([]))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    if (!form.content.trim()) return setMsg("Passage content is required.");
    setBusy(true); setMsg("");
    try {
      await api.adminCreatePassage(form);
      setForm({ title: "", content: "", subject: "biology", education_level: "senior", exam_target: "jamb" });
      setMsg("Passage created successfully.");
      load();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setBusy(false);
  }

  async function del(id) {
    if (!window.confirm("Delete this passage? Linked questions will lose their passage attachment.")) return;
    try {
      await api.adminDeletePassage(id);
      load();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Passage Manager</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>
          Comprehension passages for English and Literature. Attach one to any question in the Exam Builder.
        </p>
      </div>

      <div className="card stack" style={{ maxWidth: 900 }}>
        <h3>Add New Passage</h3>
        <form onSubmit={create} className="stack">
          <div>
            <label>Title (Optional)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. The Water Cycle" />
          </div>
          <div>
            <label>Content *</label>
            <textarea
              required
              rows="6"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Paste the full passage text here..."
            />
          </div>
          <div className="form-grid-3">
            <div>
              <label>Subject</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{SUBJECT_LABELS[s] || s}</option>)}
              </select>
            </div>
            <div>
              <label>Class Level</label>
              <select value={form.education_level} onChange={(e) => setForm({ ...form, education_level: e.target.value })}>
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label>Exam Target</label>
              <select value={form.exam_target} onChange={(e) => setForm({ ...form, exam_target: e.target.value })}>
                {EXAM_TARGETS_BY_LEVEL[form.education_level].map((t) => <option key={t} value={t}>{EXAM_TARGET_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={busy}>{busy ? "Creating..." : "Create Passage"}</button>
          {msg && <p style={{ color: msg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{msg}</p>}
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>All Passages</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>{passages.length} total</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading...</div>
        ) : passages.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No passages yet. Add one above.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>Title</th>
                  <th style={{ padding: "16px" }}>Subject</th>
                  <th style={{ padding: "16px" }}>Level</th>
                  <th style={{ padding: "16px" }}>Target</th>
                  <th style={{ padding: "16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {passages.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{p.title || `Passage #${p.id}`}</td>
                    <td style={{ padding: "16px" }}>{SUBJECT_LABELS[p.subject] || p.subject}</td>
                    <td style={{ padding: "16px" }}>{LEVEL_LABELS[p.education_level] || p.education_level}</td>
                    <td style={{ padding: "16px" }}>{p.exam_target ? (EXAM_TARGET_LABELS[p.exam_target] || p.exam_target) : "—"}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button
                        className="secondary"
                        onClick={() => del(p.id)}
                        style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem", borderColor: "rgba(255, 107, 107, 0.4)", color: "var(--mk-danger)" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- 4.5 LIBRARY MANAGER ----------------
function LibraryManager() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    subject: "biology",
    education_level: "senior",
    exam_target: "jamb",
    drive_file_id: "",
    description: "",
    is_active: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    setLoading(true);
    api.adminGetLibrary().then(setMaterials).catch(() => setMaterials([])).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.drive_file_id.trim()) return setMsg("Title and Drive File ID are required.");
    setBusy(true); setMsg("");
    try {
      await api.adminAddLibraryMaterial(form);
      setForm({ title: "", subject: "biology", education_level: "senior", exam_target: "jamb", drive_file_id: "", description: "", is_active: true });
      setMsg("Material added successfully.");
      load();
    } catch (err) { setMsg("Error: " + err.message); }
    setBusy(false);
  }

  async function del(id) {
    if (!window.confirm("Delete this material permanently?")) return;
    try {
      await api.adminDeleteLibraryMaterial(id);
      load();
    } catch (err) { alert("Delete failed: " + err.message); }
  }

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Library Manager</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Manage PDFs in the Study Library. Paste Google Drive File IDs.</p>
      </div>

      <div className="card stack" style={{ maxWidth: 800 }}>
        <h3>Add New Material</h3>
        <form onSubmit={create} className="stack">
          <div>
            <label>Title *</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. JAMB Physics Past Questions 2020-2024" />
          </div>
          <div className="form-grid-3">
            <div>
              <label>Subject</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                {ALL_SUBJECTS.map(s => <option key={s} value={s}>{SUBJECT_LABELS[s] || s}</option>)}
              </select>
            </div>
            <div>
              <label>Class Level</label>
              <select value={form.education_level} onChange={e => setForm({ ...form, education_level: e.target.value })}>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label>Exam Target</label>
              <select value={form.exam_target} onChange={e => setForm({ ...form, exam_target: e.target.value })}>
                {EXAM_TARGETS_BY_LEVEL[form.education_level].map(t => <option key={t} value={t}>{EXAM_TARGET_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label>Google Drive File ID *</label>
            <input required value={form.drive_file_id} onChange={e => setForm({ ...form, drive_file_id: e.target.value })} placeholder="e.g. 1AbCdEfGhIjKlMnOpQrStUvWxYz" />
            <p className="text-faint" style={{ fontSize: "0.8rem", marginTop: 4 }}>
              From a shared Drive link: <code>https://drive.google.com/file/d/<strong>FILE_ID</strong>/view</code>
            </p>
          </div>
          <div>
            <label>Description</label>
            <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short summary of what this PDF covers" />
          </div>
          <button type="submit" disabled={busy}>{busy ? "Adding..." : "Add Material"}</button>
          {msg && <p style={{ color: msg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{msg}</p>}
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>All Materials</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>{materials.length} total</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading...</div>
        ) : materials.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No materials yet. Add one above.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>Title</th>
                  <th style={{ padding: "16px" }}>Subject</th>
                  <th style={{ padding: "16px" }}>Level</th>
                  <th style={{ padding: "16px" }}>Target</th>
                  <th style={{ padding: "16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{m.title}</td>
                    <td style={{ padding: "16px" }}>{SUBJECT_LABELS[m.subject] || m.subject}</td>
                    <td style={{ padding: "16px" }}>{LEVEL_LABELS[m.education_level] || m.education_level}</td>
                    <td style={{ padding: "16px" }}>{m.exam_target ? (EXAM_TARGET_LABELS[m.exam_target] || m.exam_target) : "—"}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button
                        className="secondary"
                        onClick={() => del(m.id)}
                        style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem", borderColor: "rgba(255, 107, 107, 0.4)", color: "var(--mk-danger)" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- 5. CONFIG CENTER ----------------
function ConfigCenter() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    api.adminSettings()
      .then(setSettings)
      .catch((e) => setErr(e.message || "Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />;
  if (err) return <div className="card" style={{ borderLeft: "4px solid var(--mk-danger)" }}>{err}</div>;
  if (!settings) return null;

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Exam Rules & Config</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>
          Exam duration, pass mark, questions-to-serve, and randomization are controlled <strong>per exam</strong> inside the Exam Builder.
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>How to Configure Exam Rules</h3>
        <ol style={{ paddingLeft: 20, lineHeight: 1.8, color: "var(--mk-text)" }}>
          <li>Go to <strong>Exam Center</strong></li>
          <li>Open any exam and click <strong>Manage</strong></li>
          <li>Switch to the <strong>Exam Settings & Rules</strong> tab</li>
          <li>Adjust Duration, Pass %, Total Marks, Questions to Serve, Randomization, Access Code, and Dates</li>
        </ol>
        <p className="text-dim" style={{ margin: 0 }}>
          There is no global override — every exam has its own rules. This is by design: it lets practice, mock, and championship exams coexist without conflicting.
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Global Settings Snapshot</h3>
        <div className="stack" style={{ gap: 8 }}>
          <div className="row-between"><span className="text-dim">Platform Name</span><span style={{ fontWeight: 600 }}>{settings.platform_name || "—"}</span></div>
          <div className="row-between"><span className="text-dim">Support Email</span><span style={{ fontWeight: 600 }}>{settings.support_email || "—"}</span></div>
          <div className="row-between"><span className="text-dim">Registration</span><span style={{ fontWeight: 600 }}>{settings.registration_open ? "Open" : "Closed"}</span></div>
          <div className="row-between"><span className="text-dim">Maintenance Mode</span><span style={{ fontWeight: 600 }}>{settings.maintenance_mode ? "On" : "Off"}</span></div>
          <div className="row-between"><span className="text-dim">Profile Editing</span><span style={{ fontWeight: 600 }}>{settings.allow_profile_edits === false ? "Locked" : "Allowed"}</span></div>
        </div>
      </div>
    </div>
  );
}

// ---------------- 6. ZOOM MANAGER ----------------
function ZoomManager() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", subject: "", scheduled_at: "", zoom_url: "", description: "" });
  const [msg, setMsg] = useState("");

  function load() { api.adminZoom().then(setRows).catch((e) => setMsg(e.message)); }
  useEffect(load, []);

  async function create() {
    try {
      await api.adminCreateZoom(form);
      setForm({ title: "", subject: "", scheduled_at: "", zoom_url: "", description: "" });
      setMsg("Created");
      load();
    } catch (e) { setMsg(e.message); }
  }

  async function del(id) { await api.adminDeleteZoom(id); load(); }

  return (
    <div className="stack">
      <h1>Live Classes</h1>
      <p className="text-dim">Schedule and manage live science sessions via Zoom.</p>
      
      <div className="card stack" style={{ maxWidth: 600 }}>
        <h3>Create New Session</h3>
        <input placeholder="Title (e.g. JAMB Physics Masterclass)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Date & Time (2026-11-01T15:00:00+01:00)" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
        <input placeholder="Zoom Link (https://zoom.us/j/...)" value={form.zoom_url} onChange={(e) => setForm({ ...form, zoom_url: e.target.value })} />
        <button onClick={create}>Schedule Session</button>
        {msg && <p className="text-dim">{msg}</p>}
      </div>

      <div className="stack" style={{ marginTop: 32 }}>
        <h3>Upcoming Sessions</h3>
        {rows.length === 0 ? <p className="text-faint">No sessions scheduled.</p> : rows.map((z) => (
          <div key={z.id} className="card row-between">
            <div>
              <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{z.title}</div>
              <div className="text-faint" style={{ fontSize: "0.85rem", marginTop: 4 }}>{new Date(z.scheduled_at).toLocaleString()}</div>
            </div>
            <button className="danger" onClick={() => del(z.id)} style={{ padding: "8px 16px" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- 7. STUDENTS (BULK DELETE + FIXED SCHOOL) ----------------
function StudentsCenter({ onRefresh }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [busy, setBusy] = useState(false);

  function load() {
    api.adminStudents().then(setStudents).catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  if (selectedStudent) {
    const studentRow = students.find(s => s.id === selectedStudent);
    return <StudentProfile studentId={selectedStudent} studentRow={studentRow} onBack={() => { setSelectedStudent(null); load(); }} />;
  }

  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selectedIds.length === students.length) setSelectedIds([]);
    else setSelectedIds(students.map(s => s.id));
  }

  async function bulkDelete() {
    if (!window.confirm(`Are you absolutely sure you want to delete ${selectedIds.length} students? This will also delete all their test history. This cannot be undone.`)) return;
    setBusy(true);
    try {
      // FIXED: Changed from DELETE to POST to ensure the body is sent properly across all browsers.
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/admin/students/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ user_ids: selectedIds })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Bulk delete failed");
      }
      
      setSelectedIds([]);
      load();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Bulk delete failed: " + err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Student Directory</h1>
          <p className="text-dim" style={{ margin: "4px 0 0 0" }}>View and manage all registered students.</p>
        </div>
        {selectedIds.length > 0 && (
          <button onClick={bulkDelete} disabled={busy} style={{ background: "var(--mk-danger)", color: "white", padding: "10px 20px", fontWeight: 700 }}>
            {busy ? "Deleting..." : `🗑️ Delete ${selectedIds.length} Student${selectedIds.length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>
      
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                <th style={{ padding: "16px", width: 40 }}>
                  <input type="checkbox" checked={students.length > 0 && selectedIds.length === students.length} onChange={toggleSelectAll} style={{ width: "auto", height: "auto", minHeight: "unset", cursor: "pointer" }} />
                </th>
                <th style={{ padding: "16px" }}>Name</th>
                <th style={{ padding: "16px" }}>School</th>
                <th style={{ padding: "16px" }}>Level</th>
                <th style={{ padding: "16px" }}>Role</th>
                <th style={{ padding: "16px" }}>Tests</th>
                <th style={{ padding: "16px" }}></th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--mk-border)", background: selectedIds.includes(s.id) ? "rgba(255, 107, 107, 0.05)" : "transparent" }}>
                  <td style={{ padding: "16px" }}>
                    <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} style={{ width: "auto", height: "auto", minHeight: "unset", cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600 }}>{s.display_name}</td>
                  <td style={{ padding: "16px" }} className="text-dim">{s.school_name || "—"}</td>
                  <td style={{ padding: "16px" }}>{LEVEL_LABELS[s.education_level]}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", padding: "2px 8px", borderRadius: 8, background: "var(--mk-bg-elev-2)", color: s.role === "student" ? "var(--mk-text-dim)" : "var(--mk-accent)" }}>
                      {s.role || "student"}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }} className="mono">{s.total_tests}</td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button className="secondary" style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem" }} onClick={() => setSelectedStudent(s.id)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentProfile({ studentId, studentRow, onBack }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");

  // God Mode state
  const [godXp, setGodXp] = useState(0);
  const [godCoins, setGodCoins] = useState(0);
  const [godPremium, setGodPremium] = useState(false);
  const [godRole, setGodRole] = useState("student");
  const [godSchoolId, setGodSchoolId] = useState("");
  const [godBusy, setGodBusy] = useState(false);
  const [godMsg, setGodMsg] = useState("");

  const canGrantAdminRoles = !!user?.is_admin || user?.role === "super_admin";

  function load() { api.adminStudent(studentId).then(setData).catch(() => {}); }
  useEffect(load, [studentId]);

  useEffect(() => {
    if (studentRow) {
      setGodXp(studentRow.xp ?? 0);
      setGodCoins(studentRow.coins ?? 0);
      setGodPremium(!!studentRow.is_premium);
      setGodRole(studentRow.role || "student");
      setGodSchoolId(studentRow.school_id ?? "");
    }
  }, [studentRow]);

  async function resetPw() {
    if (!newPw || newPw.length < 6) return setMsg("Password must be at least 6 characters.");
    try {
      await api.adminResetPassword(studentId, newPw);
      setMsg("Password successfully reset.");
      setNewPw("");
    } catch (e) { setMsg("Error: " + e.message); }
  }

  async function toggleActive() {
    try {
      await api.adminToggleActive(studentId);
      load();
    } catch (e) { setMsg("Error: " + e.message); }
  }

  async function saveGodMode() {
    setGodBusy(true); setGodMsg("");
    try {
      await api.adminUpdateStudentStats(studentId, {
        xp: parseInt(godXp) || 0,
        coins: parseInt(godCoins) || 0,
        is_premium: !!godPremium,
        role: godRole,
        school_id: godSchoolId === "" ? null : parseInt(godSchoolId),
      });
      setGodMsg("Stats updated successfully.");
    } catch (e) { setGodMsg("Error: " + e.message); }
    setGodBusy(false);
  }

  function impersonate() {
    if (!data?.user) return;
    if (!window.confirm(`Impersonate ${data.user.display_name}?`)) return;
    try {
      const adminUser = localStorage.getItem("user");
      const adminToken = localStorage.getItem("token");
      if (adminUser) localStorage.setItem("admin_backup_user", adminUser);
      if (adminToken) localStorage.setItem("admin_backup_token", adminToken);
      localStorage.setItem("user", JSON.stringify({ ...data.user, impersonated: true }));
      navigate("/dashboard");
    } catch (e) {
      setMsg("Impersonation failed: " + e.message);
    }
  }

  if (!data) return <div>Loading profile...</div>;

  return (
    <div>
      <div style={{ cursor: "pointer", color: "var(--mk-accent)", marginBottom: 24, fontWeight: 600 }} onClick={onBack}>← Back to Students</div>
      
      <div className="card stack" style={{ marginBottom: 32 }}>
        <div className="row-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ margin: 0 }}>{data.user.display_name}</h1>
          <span style={{ padding: "6px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700, background: data.user.is_active ? "rgba(34, 217, 154, 0.1)" : "rgba(255, 107, 107, 0.1)", color: data.user.is_active ? "var(--mk-success)" : "var(--mk-danger)" }}>
            {data.user.is_active ? "ACTIVE" : "DISABLED"}
          </span>
        </div>
        <div className="text-dim">{data.user.school_name} • {LEVEL_LABELS[data.user.education_level]}</div>
        {data.user.email && <div className="text-faint" style={{ fontSize: "0.9rem" }}>📧 {data.user.email}</div>}
      </div>

      <div className="form-grid-2" style={{ marginBottom: 32 }}>
        <div className="card stack">
          <h3>Account Actions</h3>
          <div>
            <label>Reset Password</label>
            <div className="row">
              <input placeholder="New Password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={{ flex: 1 }} />
              <button onClick={resetPw}>Reset</button>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label>Impersonate</label>
            <button className="secondary" onClick={impersonate} style={{ width: "100%" }}>👁️ Log In As This Student</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <label>Account Status</label>
            <button className={data.user.is_active ? "danger" : ""} onClick={toggleActive} style={{ width: "100%" }}>
              {data.user.is_active ? "Disable Account" : "Enable Account"}
            </button>
          </div>
          {msg && <p className="text-dim" style={{ margin: 0 }}>{msg}</p>}
        </div>

        <div className="card stack">
          <h3>Student Info</h3>
          <div className="row-between"><span className="text-dim">Level:</span><span>{LEVEL_LABELS[data.user.education_level]}</span></div>
          <div className="row-between"><span className="text-dim">Target:</span><span>{data.user.exam_target}</span></div>
          <div className="row-between"><span className="text-dim">Total Tests:</span><span>{data.tests.length}</span></div>
        </div>
      </div>

      <div className="card stack" style={{ marginBottom: 32, borderTop: "4px solid var(--mk-brand-secondary)" }}>
        <h3 style={{ margin: 0, color: "var(--mk-brand-secondary)" }}>⚡ God Mode (Manual Override)</h3>
        <p className="text-dim" style={{ fontSize: "0.9rem", margin: 0 }}>Directly edit this student's economy, premium status, role, and school.</p>
        <div className="form-grid-4">
          <div>
            <label>XP</label>
            <input type="number" value={godXp} onChange={e => setGodXp(e.target.value)} />
          </div>
          <div>
            <label>Coins</label>
            <input type="number" value={godCoins} onChange={e => setGodCoins(e.target.value)} />
          </div>
          <div>
            <label>Premium Status</label>
            <select value={godPremium ? "1" : "0"} onChange={e => setGodPremium(e.target.value === "1")}>
              <option value="0">Free</option>
              <option value="1">Premium</option>
            </select>
          </div>
          <div>
            <label>Role</label>
            <select value={godRole} onChange={e => setGodRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              {canGrantAdminRoles && <option value="school_admin">School Admin</option>}
              {canGrantAdminRoles && <option value="super_admin">Super Admin</option>}
            </select>
          </div>
        </div>
        {canGrantAdminRoles && (
          <div>
            <label>School ID (optional)</label>
            <input
              type="number"
              value={godSchoolId}
              onChange={(e) => setGodSchoolId(e.target.value)}
              placeholder="Leave blank to unassign"
            />
          </div>
        )}
        <div className="row" style={{ gap: 12 }}>
          <button onClick={saveGodMode} disabled={godBusy}>{godBusy ? "Saving..." : "Apply Changes"}</button>
          {godMsg && <span style={{ color: godMsg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem" }}>{godMsg}</span>}
        </div>
      </div>

      <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Test History</h2>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                <th style={{ padding: "16px" }}>Subject</th>
                <th style={{ padding: "16px" }}>Mode</th>
                <th style={{ padding: "16px" }}>Score</th>
                <th style={{ padding: "16px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.tests.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: 20, textAlign: "center" }} className="text-dim">No tests taken yet.</td></tr>
              ) : data.tests.map(t => (
                <tr key={t.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                  <td style={{ padding: "16px", fontWeight: 600 }}>{SUBJECT_LABELS[t.subject] || t.subject}</td>
                  <td style={{ padding: "16px", textTransform: "capitalize" }}>{t.mode}</td>
                  <td style={{ padding: "16px", color: "var(--mk-success)", fontWeight: 700 }}>{t.score}</td>
                  <td style={{ padding: "16px" }} className="text-dim">{t.submitted_at ? new Date(t.submitted_at).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------- 7.5 SCHOOL MANAGER ----------------
function SchoolManager() {
  const [schools, setSchools] = useState([]);
  const [newName, setNewName] = useState("");
  const [newState, setNewState] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const fileInputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [uploading, setUploading] = useState(false);

  function load() {
    api.getSchools().then(setSchools).catch(() => {});
  }

  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true); setMsg("");
    try {
      await api.adminCreateSchool({ name: newName, state: newState });
      setNewName(""); setNewState("");
      setMsg("School added successfully!");
      load();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setBusy(false);
  }

  async function del(id) {
    if (!window.confirm("Delete this school? Students assigned to it will fall back to manual entry.")) return;
    try {
      await api.adminDeleteSchool(id);
      load();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  }

  function downloadTemplate() {
    const csvContent = "name,state\nKing's College,Lagos\nFGC Warri,Delta\nLagos Model College,Lagos\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "schools_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewError(""); setPendingFile(file);

    const isCsv = /\.csv$/i.test(file.name);
    if (!isCsv) { setPreviewRows([]); setPreviewOpen(true); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || "");
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) { setPreviewError("File is empty or missing a header row."); setPreviewRows([]); setPreviewOpen(true); return; }
        
        const parseLine = (line) => {
          const out = []; let cur = ""; let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = !inQuotes; }
            else if (ch === "," && !inQuotes) { out.push(cur); cur = ""; }
            else { cur += ch; }
          }
          out.push(cur);
          return out.map((v) => v.trim());
        };

        const header = parseLine(lines[0]).map((h) => h.toLowerCase());
        const rows = lines.slice(1, 11).map((line) => {
          const cells = parseLine(line); const obj = {};
          header.forEach((h, i) => { obj[h] = cells[i] || ""; });
          return obj;
        });
        setPreviewRows(rows); setPreviewOpen(true);
      } catch (err) { setPreviewError("Could not parse file: " + err.message); setPreviewOpen(true); }
    };
    reader.onerror = () => { setPreviewError("Failed to read file."); setPreviewOpen(true); };
    reader.readAsText(file);
    e.target.value = null;
  }

  async function confirmUpload() {
    if (!pendingFile) return;
    setUploading(true); setPreviewError("");
    try {
      await api.adminUploadSchools(pendingFile);
      setPreviewOpen(false); setPendingFile(null); setPreviewRows([]);
      load();
      alert("Schools imported successfully!");
    } catch (err) { setPreviewError(err.message); }
    setUploading(false);
  }

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>School Manager</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Manage the list of schools available in the registration dropdown.</p>
      </div>

      <div className="card stack" style={{ maxWidth: 800 }}>
        <h3>Add New School Manually</h3>
        <form onSubmit={create} className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="School Name (e.g. King's College)" 
            style={{ flex: 2, minWidth: 250 }} 
          />
          <input 
            value={newState} 
            onChange={(e) => setNewState(e.target.value)} 
            placeholder="State (Optional)" 
            style={{ flex: 1, minWidth: 150 }} 
          />
          <button type="submit" disabled={busy || !newName.trim()}>
            {busy ? "Adding..." : "Add School"}
          </button>
        </form>
        {msg && <p style={{ color: msg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{msg}</p>}
      </div>

      <div className="card stack" style={{ maxWidth: 800 }}>
        <div className="row-between">
          <h3>Bulk Upload Schools</h3>
          <button className="secondary" onClick={downloadTemplate} style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem" }}>
            📥 Download Template
          </button>
        </div>
        <p className="text-dim" style={{ fontSize: "0.9rem", margin: 0 }}>
          Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file with columns <code>name</code> and <code>state</code>. 
          Duplicate schools will be skipped automatically.
        </p>
        <div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "📤 Upload CSV / XLSX"}
          </button>
          <input type="file" accept=".csv, .xlsx" ref={fileInputRef} onChange={handleFileSelected} style={{ display: "none" }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Registered Schools</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>{schools.length} total</span>
        </div>
        
        {schools.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No schools added yet. Add one above or upload a CSV.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>School Name</th>
                  <th style={{ padding: "16px" }}>State</th>
                  <th style={{ padding: "16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: "16px" }} className="text-dim">{s.state || "—"}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button 
                        className="secondary" 
                        onClick={() => del(s.id)} 
                        style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem", borderColor: "rgba(255, 107, 107, 0.4)", color: "var(--mk-danger)" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setPreviewOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", borderRadius: 12, padding: 24, maxWidth: 800, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Preview School Import</h2>
              <button className="secondary" onClick={() => setPreviewOpen(false)} style={{ padding: "4px 10px" }}>✕</button>
            </div>
            <p className="text-dim" style={{ marginBottom: 16 }}>File: <strong>{pendingFile?.name}</strong> — showing first {previewRows.length} row(s).</p>
            
            {previewError && <div style={{ padding: 12, background: "rgba(255, 107, 107, 0.1)", borderLeft: "4px solid var(--mk-danger)", borderRadius: 6, marginBottom: 16 }}><p style={{ margin: 0, color: "var(--mk-danger)", fontWeight: 600 }}>{previewError}</p></div>}
            
            {previewRows.length > 0 ? (
              <div className="table-responsive" style={{ marginBottom: 20 }}>
                <table>
                  <thead><tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}><th style={{ padding: 12 }}>#</th><th style={{ padding: 12 }}>School Name</th><th style={{ padding: 12 }}>State</th></tr></thead>
                  <tbody>{previewRows.map((r, i) => (<tr key={i} style={{ borderTop: "1px solid var(--mk-border)" }}><td style={{ padding: 12 }} className="mono">{i + 1}</td><td style={{ padding: 12 }}>{r.name || "—"}</td><td style={{ padding: 12 }}>{r.state || "—"}</td></tr>))}</tbody>
                </table>
              </div>
            ) : !previewError ? (<p className="text-dim" style={{ marginBottom: 20 }}>Preview isn't available for .xlsx files. The file will still be imported on confirm.</p>) : null}
            
            <div className="row" style={{ gap: 12, justifyContent: "flex-end" }}>
              <button className="secondary" onClick={() => setPreviewOpen(false)} disabled={uploading}>Cancel</button>
              <button onClick={confirmUpload} disabled={uploading || !!previewError}>{uploading ? "Uploading..." : "Confirm & Import"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- 7.6 PREMIUM MANAGER ----------------
function PremiumManager() {
  const [payments, setPayments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grantForm, setGrantForm] = useState({ user_id: "", item_id: "" });
  const [grantMsg, setGrantMsg] = useState("");
  const [grantBusy, setGrantBusy] = useState(false);
  const [resolvingRef, setResolvingRef] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([
      api.adminGetPayments().catch(() => []),
      api.adminGetVaultPurchases().catch(() => [])
    ]).then(([p, v]) => {
      setPayments(p);
      setPurchases(v);
    }).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function grant(e) {
    e.preventDefault();
    if (!grantForm.user_id || !grantForm.item_id.trim()) return setGrantMsg("User ID and Item ID are required.");
    setGrantBusy(true); setGrantMsg("");
    try {
      await api.adminGrantVaultItem(parseInt(grantForm.user_id), grantForm.item_id.trim());
      setGrantMsg("Item granted successfully.");
      setGrantForm({ user_id: "", item_id: "" });
      load();
    } catch (err) { setGrantMsg("Error: " + err.message); }
    setGrantBusy(false);
  }

  async function resolvePayment(reference, action) {
    const verb = action === "success" ? "mark as SUCCESS (grant Premium)" : "mark as FAILED";
    if (!window.confirm(`Are you sure you want to ${verb} for reference ${reference}?`)) return;
    setResolvingRef(reference);
    try {
      await api.adminResolvePayment(reference, action);
      load();
    } catch (err) {
      alert("Resolve failed: " + err.message);
    }
    setResolvingRef(null);
  }

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Premium Manager</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>View payments, resolve stuck transactions, and manually grant items.</p>
      </div>

      <div className="card stack" style={{ maxWidth: 800 }}>
        <h3>Manually Grant Vault Item</h3>
        <p className="text-dim" style={{ fontSize: "0.9rem", margin: 0 }}>Enter the student's user ID and the vault item ID (e.g. <code>avatar_robot</code>, <code>title_genius</code>).</p>
        <form onSubmit={grant} className="form-grid-2">
          <div>
            <label>User ID</label>
            <input required type="number" value={grantForm.user_id} onChange={e => setGrantForm({ ...grantForm, user_id: e.target.value })} placeholder="e.g. 42" />
          </div>
          <div>
            <label>Item ID</label>
            <input required value={grantForm.item_id} onChange={e => setGrantForm({ ...grantForm, item_id: e.target.value })} placeholder="e.g. avatar_robot" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" disabled={grantBusy}>{grantBusy ? "Granting..." : "Grant Item"}</button>
            {grantMsg && <p style={{ color: grantMsg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem", margin: "8px 0 0" }}>{grantMsg}</p>}
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Recent Payments</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>{payments.length} total</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No payments yet.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>Student</th>
                  <th style={{ padding: "16px" }}>Plan</th>
                  <th style={{ padding: "16px" }}>Amount</th>
                  <th style={{ padding: "16px" }}>Status</th>
                  <th style={{ padding: "16px" }}>Date</th>
                  <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const isResolving = resolvingRef === p.reference;
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                      <td style={{ padding: "16px", fontWeight: 600 }}>{p.display_name}</td>
                      <td style={{ padding: "16px", textTransform: "capitalize" }}>{p.plan_type}</td>
                      <td style={{ padding: "16px" }}>₦{p.amount?.toLocaleString()}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700, background: p.status === "success" ? "rgba(34, 217, 154, 0.1)" : p.status === "pending" ? "rgba(251, 191, 36, 0.1)" : "rgba(255, 107, 107, 0.1)", color: p.status === "success" ? "var(--mk-success)" : p.status === "pending" ? "var(--mk-warning)" : "var(--mk-danger)" }}>
                          {p.status.toUpperCase()}
                        </span>
                        {typeof p.retry_count === "number" && p.retry_count > 0 && (
                          <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>
                            retries: {p.retry_count}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px" }} className="text-dim">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        {p.status !== "success" && (
                          <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                            <button
                              className="secondary"
                              onClick={() => resolvePayment(p.reference, "success")}
                              disabled={isResolving}
                              style={{ padding: "6px 10px", minHeight: 30, fontSize: "0.75rem", borderColor: "rgba(34, 217, 154, 0.4)", color: "var(--mk-success)" }}
                            >
                              {isResolving ? "…" : "✓ Mark Success"}
                            </button>
                            <button
                              className="secondary"
                              onClick={() => resolvePayment(p.reference, "failed")}
                              disabled={isResolving}
                              style={{ padding: "6px 10px", minHeight: 30, fontSize: "0.75rem", borderColor: "rgba(255, 107, 107, 0.4)", color: "var(--mk-danger)" }}
                            >
                              ✗ Mark Failed
                            </button>
                          </div>
                        )}
                        {p.status === "success" && <span className="text-faint" style={{ fontSize: "0.75rem" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Recent Vault Purchases</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>{purchases.length} total</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading...</div>
        ) : purchases.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No vault purchases yet.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>Student</th>
                  <th style={{ padding: "16px" }}>Item ID</th>
                  <th style={{ padding: "16px" }}>Type</th>
                  <th style={{ padding: "16px" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(v => (
                  <tr key={v.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{v.display_name}</td>
                    <td style={{ padding: "16px" }}><code>{v.item_id}</code></td>
                    <td style={{ padding: "16px", textTransform: "capitalize" }}>{v.item_type}</td>
                    <td style={{ padding: "16px" }} className="text-dim">{v.purchased_at ? new Date(v.purchased_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- 8. LEADERBOARD MANAGER ----------------
function LeaderboardManager() {
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.adminSettings().then((s) => {
      setSettings({
        ...s,
        leaderboard_min_questions: s.leaderboard_min_questions ?? 20,
        leaderboard_tiebreaker: s.leaderboard_tiebreaker ?? "time",
        leaderboard_show_championship: s.leaderboard_show_championship ?? true,
      });
    }).catch(() => {
      setSettings({ leaderboard_min_questions: 20, leaderboard_tiebreaker: "time", leaderboard_show_championship: true });
    });
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await api.adminUpdateSettings(settings);
      setMsg("Leaderboard rules saved.");
    } catch (e) {
      setMsg("Error: " + e.message);
    }
    setSaving(false);
  }

  if (!settings) return <div>Loading rules...</div>;

  return (
    <div>
      <h1>Leaderboard Rules</h1>
      <p className="text-dim">Configure how rankings are calculated and displayed.</p>
      
      <div className="card stack" style={{ marginTop: 24, maxWidth: 600 }}>
        <div>
          <label>Minimum Questions for Ranking</label>
          <input type="number" min="1" value={settings.leaderboard_min_questions} onChange={(e) => setSettings({ ...settings, leaderboard_min_questions: parseInt(e.target.value) || 0 })} />
          <p className="text-faint" style={{ fontSize: "0.8rem", marginTop: 4 }}>Students must answer at least this many questions to appear on the leaderboard.</p>
        </div>

        <div>
          <label>Tie-Breaker</label>
          <select value={settings.leaderboard_tiebreaker} onChange={(e) => setSettings({ ...settings, leaderboard_tiebreaker: e.target.value })}>
            <option value="time">Fastest Time (default)</option>
            <option value="accuracy">Highest Accuracy</option>
          </select>
          <p className="text-faint" style={{ fontSize: "0.8rem", marginTop: 4 }}>When two students have equal points, this determines who ranks higher.</p>
        </div>

        <div>
          <label>Show Championship on Leaderboard</label>
          <select value={settings.leaderboard_show_championship ? "1" : "0"} onChange={(e) => setSettings({ ...settings, leaderboard_show_championship: e.target.value === "1" })}>
            <option value="1">Visible</option>
            <option value="0">Hidden</option>
          </select>
          <p className="text-faint" style={{ fontSize: "0.8rem", marginTop: 4 }}>Hide championship ranks while the exam is live. Reveals automatically when it ends.</p>
        </div>

        <button onClick={save} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? "Saving..." : "Save Rules"}
        </button>
        {msg && <p className="text-dim" style={{ margin: 0 }}>{msg}</p>}
      </div>
    </div>
  );
}

// ---------------- 9. SYSTEM INBOX ----------------
function SystemInbox({ onMarkRead }) {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");

  function load() { api.adminGetEmails().then(setEmails).catch(() => {}); }
  useEffect(load, []);

  async function openEmail(email) {
    setSelected(email);
    setReplyMsg("");
    setReplyText("");
    if (!email.is_read) {
      await api.adminMarkEmailRead(email.id);
      load();
      if (onMarkRead) onMarkRead();
    }
  }

  async function sendReply() {
    if (!replyText.trim()) return;
    setReplying(true);
    setReplyMsg("");
    try {
      await api.adminReplyEmail(selected.id, replyText);
      setReplyMsg("Reply sent successfully!");
      setReplyText("");
    } catch (err) {
      setReplyMsg("Error: " + err.message);
    }
    setReplying(false);
  }

  if (selected) {
    return (
      <div>
        <div style={{ cursor: "pointer", color: "var(--mk-accent)", marginBottom: 24, fontWeight: 600 }} onClick={() => setSelected(null)}>← Back to Inbox</div>
        <div className="card">
          <div className="row-between" style={{ borderBottom: "1px solid var(--mk-border)", paddingBottom: 16, marginBottom: 16, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ margin: 0 }}>{selected.subject}</h2>
              <div className="text-dim" style={{ fontSize: "0.9rem", marginTop: 8 }}>To: {selected.recipient}</div>
            </div>
            <div className="text-faint">{new Date(selected.sent_at).toLocaleString()}</div>
          </div>
          
          <div dangerouslySetInnerHTML={{ __html: selected.body }} style={{ lineHeight: 1.6, color: "var(--mk-text)", background: "var(--mk-bg-elev-2)", padding: 20, borderRadius: 8, marginBottom: 24 }} />
          
          <div style={{ borderTop: "1px solid var(--mk-border)", paddingTop: 24 }}>
            <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Reply to Student</h3>
            <textarea rows="4" placeholder="Type your reply here..." value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ width: "100%", marginBottom: 12 }} />
            <div className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
              <button onClick={sendReply} disabled={replying || !replyText.trim()}>{replying ? "Sending..." : "Send Reply via Email"}</button>
              {replyMsg && <span style={{ color: replyMsg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem" }}>{replyMsg}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>System Inbox</h1>
      <p className="text-dim" style={{ marginBottom: 24 }}>A log of all automated emails sent by the platform.</p>
      <div className="card" style={{ padding: 0 }}>
        {emails.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No emails sent yet.</div>
        ) : emails.map(e => (
          <div key={e.id} onClick={() => openEmail(e)} style={{ padding: "20px", borderBottom: "1px solid var(--mk-border)", cursor: "pointer", transition: "background 0.2s", background: e.is_read ? "transparent" : "rgba(0, 212, 255, 0.03)" }}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: e.is_read ? 500 : 700, color: e.is_read ? "var(--mk-text-dim)" : "var(--mk-text)" }}>
                {!e.is_read && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--mk-accent)", marginRight: 8 }}></span>}
                {e.subject}
              </div>
              <div className="text-faint" style={{ fontSize: "0.85rem" }}>{new Date(e.sent_at).toLocaleTimeString()}</div>
            </div>
            <div className="text-dim" style={{ fontSize: "0.9rem" }}>To: {e.recipient}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- 9.5. REPORTED QUESTIONS ----------------
function ReportedQuestions() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.adminGetReports().then(setReports).catch(() => setReports([])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function resolve(id) {
    try {
      await api.adminResolveReport(id);
      load();
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Reported Questions</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Review typos, wrong answers, and missing images flagged by students.</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading...</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No pending reports. Good job!</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                  <th style={{ padding: "16px" }}>Question ID</th>
                  <th style={{ padding: "16px" }}>Reason</th>
                  <th style={{ padding: "16px" }}>Details</th>
                  <th style={{ padding: "16px" }}>Date</th>
                  <th style={{ padding: "16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--mk-border)" }}>
                    <td style={{ padding: "16px", fontWeight: 700 }}>#{r.question_id}</td>
                    <td style={{ padding: "16px", color: "var(--mk-danger)", fontWeight: 600 }}>{r.reason}</td>
                    <td style={{ padding: "16px" }} className="text-dim">{r.details || "—"}</td>
                    <td style={{ padding: "16px" }} className="text-dim">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button onClick={() => resolve(r.id)} className="secondary" style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem" }}>Mark Resolved</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- 9.6. STAGING AREA ----------------
function StagingArea() {
  const [staging, setStaging] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.adminGetStaging().then(setStaging).catch(() => setStaging([])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function approve(id) {
    try {
      await api.adminApproveStaging(id);
      load();
    } catch (err) { alert(err.message); }
  }

  async function reject(id) {
    if (!window.confirm("Reject this question? It will not be added to the bank.")) return;
    try {
      await api.adminRejectStaging(id);
      load();
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Staging Area</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Review uploaded questions before they go live.</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading...</div>
        ) : staging.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No pending questions in staging.</div>
        ) : staging.map(q => (
          <div key={q.id} style={{ padding: "24px", borderBottom: "1px solid var(--mk-border)" }}>
            <div className="row-between" style={{ marginBottom: 12 }}>
              <span className="text-faint" style={{ fontSize: "0.75rem", fontWeight: 800 }}>Batch: {q.upload_batch_id}</span>
              <span style={{ fontSize: "0.75rem", background: "var(--mk-bg-elev-2)", padding: "2px 8px", borderRadius: 4, color: "var(--mk-text-dim)" }}>{LEVEL_LABELS[q.education_level]} • {SUBJECT_LABELS[q.subject]}</span>
            </div>
            <p style={{ fontWeight: 600, marginBottom: 16 }}>{q.question_text}</p>
            <div className="form-grid-2" style={{ marginBottom: 16 }}>
              {["A", "B", "C", "D"].map(letter => (
                <div key={letter} style={{ fontSize: "0.9rem", padding: 8, borderRadius: 4, background: q.correct_option === letter ? "rgba(34, 217, 154, 0.1)" : "transparent", color: q.correct_option === letter ? "var(--mk-success)" : "var(--mk-text-dim)" }}>
                  <strong>{letter}.</strong> {q["option_" + letter.toLowerCase()]}
                </div>
              ))}
            </div>
            <div className="row" style={{ gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => reject(q.id)} className="danger" style={{ padding: "6px 16px", fontSize: "0.85rem" }}>Reject</button>
              <button onClick={() => approve(q.id)} style={{ background: "var(--mk-success)", color: "#000", padding: "6px 16px", fontSize: "0.85rem", fontWeight: 700 }}>Approve & Add to Bank</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- 9.7. TICKER MANAGER ----------------
function TickerManager() {
  const [headlines, setHeadlines] = useState([]);
  const [newHeadline, setNewHeadline] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api.adminGetTicker().then(setHeadlines).catch(() => {});
  }

  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    if (!newHeadline.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      await api.adminCreateTicker(newHeadline);
      setNewHeadline("");
      setMsg("Headline added successfully!");
      load();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setBusy(false);
  }

  async function toggle(id) {
    try {
      await api.adminToggleTicker(id);
      load();
    } catch (err) {
      alert("Failed to toggle: " + err.message);
    }
  }

  async function del(id) {
    if (!window.confirm("Delete this headline permanently?")) return;
    try {
      await api.adminDeleteTicker(id);
      load();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  }

  return (
    <div className="stack">
      <div>
        <h1 style={{ margin: 0 }}>Ticker Manager</h1>
        <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Manage the scrolling headlines on the homepage.</p>
      </div>

      <div className="card stack" style={{ maxWidth: 800 }}>
        <h3>Add New Headline</h3>
        <form onSubmit={create} className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <input 
            value={newHeadline} 
            onChange={(e) => setNewHeadline(e.target.value)} 
            placeholder="e.g. New JAMB mock exams are now live. Go to the Exam Center to practice!" 
            style={{ flex: 1, minWidth: 250 }} 
          />
          <button type="submit" disabled={busy || !newHeadline.trim()}>
            {busy ? "Adding..." : "Add Headline"}
          </button>
        </form>
        {msg && <p style={{ color: msg.includes("Error") ? "var(--mk-danger)" : "var(--mk-success)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{msg}</p>}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--mk-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>All Headlines</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--mk-text-faint)", fontWeight: 600 }}>{headlines.length} total</span>
        </div>
        
        {headlines.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="text-dim">No headlines created yet. Add one above to get started.</div>
        ) : (
          <div className="stack" style={{ gap: 0 }}>
            {headlines.map((h, i) => (
              <div key={h.id} className="row-between" style={{ padding: "16px 24px", borderBottom: i < headlines.length - 1 ? "1px solid var(--mk-border)" : "none", opacity: h.is_active ? 1 : 0.5, flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: "1rem", color: h.is_active ? "var(--mk-text)" : "var(--mk-text-faint)" }}>
                    {h.headline}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--mk-text-faint)", marginTop: 4 }}>
                    Added: {new Date(h.created_at).toLocaleString()} • {h.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button 
                    className="secondary" 
                    onClick={() => toggle(h.id)} 
                    style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem" }}
                  >
                    {h.is_active ? "Pause" : "Activate"}
                  </button>
                  <button 
                    className="secondary" 
                    onClick={() => del(h.id)} 
                    style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem", borderColor: "rgba(255, 107, 107, 0.4)", color: "var(--mk-danger)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- 10. SETTINGS ----------------
function SettingsCenter() {
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.adminSettings().then(setSettings).catch(() => setSettings({}));
  }, []);

  async function save() {
    try {
      await api.adminUpdateSettings(settings);
      setMsg("Settings saved successfully.");
    } catch (e) { setMsg("Error: " + e.message); }
  }

  if (!settings) return <div>Loading settings...</div>;

  return (
    <div>
      <h1>Global Settings</h1>
      <p className="text-dim">Manage your platform's core configuration.</p>
      {msg && <p className="text-dim">{msg}</p>}
      <div className="card stack" style={{ marginTop: 24, maxWidth: 600 }}>
        <div>
          <label>Platform Name</label>
          <input value={settings.platform_name || ""} onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })} />
        </div>
        <div>
          <label>Support Email</label>
          <input value={settings.support_email || ""} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} />
        </div>
        <div>
          <label>Global Announcement</label>
          <textarea rows="2" placeholder="Message shown to all students" value={settings.announcement || ""} onChange={(e) => setSettings({ ...settings, announcement: e.target.value })} />
        </div>
        <div className="row" style={{ gap: 24 }}>
          <div>
            <label>Registration</label>
            <select value={settings.registration_open ? "1" : "0"} onChange={(e) => setSettings({ ...settings, registration_open: e.target.value === "1" })}>
              <option value="1">Open</option>
              <option value="0">Closed</option>
            </select>
          </div>
          <div>
            <label>Maintenance Mode</label>
            <select value={settings.maintenance_mode ? "1" : "0"} onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.value === "1" })}>
              <option value="0">Off</option>
              <option value="1">On</option>
            </select>
          </div>
          <div>
            <label>Profile Editing</label>
            <select value={settings.allow_profile_edits === false ? "0" : "1"} onChange={(e) => setSettings({ ...settings, allow_profile_edits: e.target.value === "1" })}>
              <option value="1">Allowed</option>
              <option value="0">Locked (Students cannot edit)</option>
            </select>
          </div>
        </div>
        <button onClick={save} style={{ marginTop: 16 }}>Update Settings</button>
      </div>
    </div>
  );
}

// ---------------- 11. SUPPORT & LOGS ----------------
function SupportCenter() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.adminLogs().then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <div>
      <h1>Support & Logs</h1>
      <p className="text-dim">Get assistance and review system activity.</p>
      
      <div className="form-grid-2" style={{ marginTop: 24 }}>
        <div className="card stack">
          <h3>Contact Support</h3>
          <p className="text-dim" style={{ fontSize: "0.9rem" }}>Need help with a technical issue or have questions about the platform? Reach out to our team.</p>
          <div style={{ background: "var(--mk-bg-elev-2)", padding: 16, borderRadius: 8, fontFamily: "monospace" }}>
            support@makatron.com
          </div>
        </div>
        <div className="card stack">
          <h3>System Activity Logs</h3>
          <div className="stack" style={{ gap: 8, maxHeight: 300, overflowY: "auto" }}>
             {logs.length === 0 ? <p className="text-faint">No logs yet.</p> : logs.map((log, i) => (
               <div key={i} style={{ fontSize: "0.85rem", padding: 8, background: "var(--mk-bg-elev-2)", borderRadius: 4 }}>
                 <span style={{ color: "var(--mk-accent)" }}>[{new Date(log.time).toLocaleTimeString()}]</span> {log.msg}
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- 12. CREATE EXAM ----------------
function CreateExam({ initialType, onBack, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    exam_type: initialType || "mock",
    education_level: "senior",
    subject: "biology",
    exam_target: "jamb",
    duration_mins: 60,
    pass_percent: 40,
    total_marks: 100,
    add_to_bank: false,
    start_date: "",
    end_date: "",
    questions_to_serve: 0,
    randomize_questions: true,
  });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (form.exam_type === "championship") {
        if (form.start_date) payload.start_date = new Date(form.start_date).toISOString();
        if (form.end_date) payload.end_date = new Date(form.end_date).toISOString();
      } else {
        delete payload.start_date;
        delete payload.end_date;
      }
      await api.adminCreateExam(payload);
      onCreated();
    } catch (err) { alert(err.message); }
    setBusy(false);
  }

  const subjectOptions = [...SUBJECTS_BY_LEVEL[form.education_level]];
  if (form.exam_type === "mock" || form.exam_type === "championship") {
    subjectOptions.push("mixed");
  }

  return (
    <div>
      <div style={{ cursor: "pointer", color: "var(--mk-accent)", marginBottom: 24, fontWeight: 600 }} onClick={onBack}>← Back to Exams</div>
      <h2 style={{ marginBottom: 24 }}>Create New {form.exam_type === "championship" ? "Championship" : form.exam_type === "practice" ? "Practice" : "Mock"} Exam</h2>
      <form onSubmit={submit} className="card">
        <div style={{ marginBottom: 24 }}>
          <label>Exam Title</label>
          <input required placeholder="e.g. 1st Term Mid-Term Test" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>
        <div className="form-grid-2" style={{ marginBottom: 24 }}>
          <div>
            <label>Exam Type</label>
            <select value={form.exam_type} onChange={e => setForm({...form, exam_type: e.target.value})}>
              <option value="practice">Practice Exam</option>
              <option value="mock">Standard Mock</option>
              <option value="championship">Championship</option>
            </select>
          </div>
          <div>
            <label>Class</label>
            <select value={form.education_level} onChange={e => setForm({...form, education_level: e.target.value, subject: SUBJECTS_BY_LEVEL[e.target.value][0]})}>
              {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
            </select>
          </div>
        </div>

        {form.exam_type === "championship" && (
          <div className="form-grid-2" style={{ marginBottom: 24, padding: 16, background: "rgba(0, 212, 255, 0.05)", border: "1px solid var(--mk-accent)", borderRadius: 8 }}>
            <div>
              <label>Start Date & Time *</label>
              <input required type="datetime-local" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div>
              <label>End Date & Time *</label>
              <input required type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
            <div style={{ gridColumn: "1 / -1" }} className="text-faint">
              <small>🏆 Arena will unlock at Start and lock at End. Winners archive to the Hall of Fame.</small>
            </div>
          </div>
        )}

        <div className="form-grid-2" style={{ marginBottom: 24 }}>
          <div>
            <label>Subject</label>
            <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
              {subjectOptions.map(s => <option key={s} value={s}>{SUBJECT_LABELS[s] || s}</option>)}
            </select>
          </div>
          <div>
            <label>Exam Target</label>
            <select value={form.exam_target} onChange={e => setForm({...form, exam_target: e.target.value})}>
              {EXAM_TARGETS_BY_LEVEL[form.education_level].map(t => <option key={t} value={t}>{EXAM_TARGET_LABELS[t]}</option>)}
            </select>
          </div>
        </div>

        <div className="form-grid-2" style={{ marginBottom: 24 }}>
          <div>
            <label>Questions to Serve (0 = serve all)</label>
            <input type="number" min="0" value={form.questions_to_serve} onChange={e => setForm({...form, questions_to_serve: parseInt(e.target.value) || 0})} />
          </div>
          <div>
            <label>Randomize Questions?</label>
            <select value={form.randomize_questions ? "1" : "0"} onChange={e => setForm({...form, randomize_questions: e.target.value === "1"})}>
              <option value="1">Yes (Shuffle every test)</option>
              <option value="0">No (Same order for all)</option>
            </select>
          </div>
        </div>

        <div className="form-grid-2" style={{ marginBottom: 24 }}>
          <div>
            <label>Add to Question Bank?</label>
            <select value={form.add_to_bank ? "1" : "0"} onChange={e => setForm({...form, add_to_bank: e.target.value === "1"})}>
              <option value="0">No (Only for this exam)</option>
              <option value="1">Yes (Save to General Bank)</option>
            </select>
          </div>
        </div>

        <div className="form-grid-3" style={{ marginBottom: 24 }}>
          <div><label>Duration (Mins)</label><input type="number" value={form.duration_mins} onChange={e => setForm({...form, duration_mins: parseInt(e.target.value)})} /></div>
          <div><label>Pass %</label><input type="number" value={form.pass_percent} onChange={e => setForm({...form, pass_percent: parseInt(e.target.value)})} /></div>
          <div><label>Total Marks</label><input type="number" value={form.total_marks} onChange={e => setForm({...form, total_marks: parseInt(e.target.value)})} /></div>
        </div>
        <button type="submit" disabled={busy}>{busy ? "Creating..." : "Create Exam"}</button>
      </form>
    </div>
  );
}

// ---------------- 13. EXAM BUILDER (MANAGE) ----------------
function ExamBuilder({ exam, onBack, onAddQuestion, onUpdateExam }) {
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [pendingFile, setPendingFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Question Editor modal state
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  const [settingsForm, setSettingsForm] = useState({
    title: exam.title || "",
    exam_type: exam.exam_type || "mock",
    education_level: exam.education_level || "senior",
    subject: exam.subject || "biology",
    exam_target: exam.exam_target || "jamb",
    duration_mins: exam.duration_mins || 60,
    pass_percent: exam.pass_percent || 40,
    total_marks: exam.total_marks || 100,
    questions_to_serve: exam.questions_to_serve || 0,
    randomize_questions: exam.randomize_questions !== false,
    access_code: exam.access_code || "",
    instructions: exam.instructions || "",
    start_date: exam.start_date ? exam.start_date.slice(0, 16) : "",
    end_date: exam.end_date ? exam.end_date.slice(0, 16) : "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  function loadQuestions() { api.adminGetExamQuestions(exam.id).then(setQuestions).catch(() => {}); }
  useEffect(() => { if (activeTab === "questions") loadQuestions(); }, [exam.id, activeTab]);

  function parseCsvLine(line) {
    const out = []; let cur = ""; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { out.push(cur); cur = ""; }
      else { cur += ch; }
    }
    out.push(cur);
    return out.map((v) => v.trim());
  }

  function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewError(""); setPendingFile(file);

    const isCsv = /\.csv$/i.test(file.name);
    if (!isCsv) { setPreviewRows([]); setPreviewOpen(true); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || "");
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) { setPreviewError("File is empty or missing a header row."); setPreviewRows([]); setPreviewOpen(true); return; }
        const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
        const rows = lines.slice(1, 11).map((line) => {
          const cells = parseCsvLine(line); const obj = {};
          header.forEach((h, i) => { obj[h] = cells[i] || ""; });
          return obj;
        });
        setPreviewRows(rows); setPreviewOpen(true);
      } catch (err) { setPreviewError("Could not parse file: " + err.message); setPreviewOpen(true); }
    };
    reader.onerror = () => { setPreviewError("Failed to read file."); setPreviewOpen(true); };
    reader.readAsText(file);
    e.target.value = null;
  }

  async function confirmUpload() {
    if (!pendingFile) return;
    setUploading(true); setUploadResult(null);
    try {
      const res = await api.adminUploadCsv(pendingFile, {
        education_level: exam.education_level,
        subject: exam.subject,
        exam_target: exam.exam_target,
        exam_id: exam.id,
        add_to_bank: exam.add_to_bank,
      });
      setUploadResult(res); loadQuestions(); setPreviewOpen(false); setPendingFile(null); setPreviewRows([]);
    } catch (err) { setPreviewError(err.message); }
    setUploading(false);
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload = { ...settingsForm };
      if (payload.start_date) payload.start_date = new Date(payload.start_date).toISOString();
      if (payload.end_date) payload.end_date = new Date(payload.end_date).toISOString();
      
      await api.adminUpdateExam(exam.id, payload);
      onUpdateExam({ ...exam, ...payload });
      alert("Settings updated successfully.");
    } catch (err) { alert(err.message); }
    setSavingSettings(false);
  }

  function openEditModal(q) {
    setEditingQuestion(q);
    setEditError("");
    setEditForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation || "",
      topic: q.topic || "",
      difficulty: q.difficulty || "medium",
      image_url: q.image_url || "",
      passage_id: q.passage_id || "",
    });
  }

  function closeEditModal() {
    setEditingQuestion(null);
    setEditForm(null);
    setEditError("");
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editingQuestion || !editForm) return;
    setEditBusy(true); setEditError("");
    try {
      await api.adminEditQuestion(editingQuestion.id, {
        ...editForm,
        passage_id: editForm.passage_id === "" ? null : parseInt(editForm.passage_id),
        exam_id: editingQuestion.exam_id,
        education_level: editingQuestion.education_level,
        subject: editingQuestion.subject,
        exam_target: editingQuestion.exam_target,
        is_active: editingQuestion.is_active,
      });
      closeEditModal();
      loadQuestions();
    } catch (err) { setEditError(err.message); }
    setEditBusy(false);
  }

  const settingsSubjectOptions = [...SUBJECTS_BY_LEVEL[settingsForm.education_level]];
  if (settingsForm.exam_type === "mock" || settingsForm.exam_type === "championship") {
    if (!settingsSubjectOptions.includes("mixed")) settingsSubjectOptions.push("mixed");
  }
  if (!settingsSubjectOptions.includes(settingsForm.subject)) {
    settingsSubjectOptions.unshift(settingsForm.subject);
  }

  return (
    <div>
      <div style={{ cursor: "pointer", color: "var(--mk-accent)", marginBottom: 24, fontWeight: 600 }} onClick={onBack}>← Back to Exams</div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ textTransform: "uppercase" }}>{exam.title}</h1>
          <div className="text-dim" style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{LEVEL_LABELS[exam.education_level]} • {SUBJECT_LABELS[exam.subject] || exam.subject} • {exam.exam_type.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--mk-border)", marginBottom: 24 }}>
        <div onClick={() => setActiveTab("questions")} style={{ padding: "12px 16px", cursor: "pointer", fontWeight: 600, color: activeTab === "questions" ? "var(--mk-accent)" : "var(--mk-text-dim)", borderBottom: activeTab === "questions" ? "2px solid var(--mk-accent)" : "2px solid transparent" }}>Questions Bank ({questions.length})</div>
        <div onClick={() => setActiveTab("settings")} style={{ padding: "12px 16px", cursor: "pointer", fontWeight: 600, color: activeTab === "settings" ? "var(--mk-accent)" : "var(--mk-text-dim)", borderBottom: activeTab === "settings" ? "2px solid var(--mk-accent)" : "2px solid transparent" }}>Exam Settings & Rules</div>
      </div>

      {activeTab === "questions" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="secondary">📥 {uploading ? "Importing..." : "Import CSV"}</button>
            <input type="file" accept=".csv, .xlsx" ref={fileInputRef} onChange={handleFileSelected} style={{ display: "none" }} />
            <button onClick={onAddQuestion}>+ Add Question</button>
          </div>

          {uploadResult && (
            <div style={{ marginBottom: 24, padding: 16, background: "rgba(34, 217, 154, 0.1)", borderLeft: "4px solid var(--mk-success)", borderRadius: 8 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Successfully imported {uploadResult.added} questions.</p>
            </div>
          )}

          {questions.map((q) => (
            <div key={q.id} className="card" style={{ marginBottom: 20 }}>
              <div className="row-between" style={{ marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
                <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0, flex: 1, minWidth: 200 }}><ChemText text={q.question_text} /></p>
                <button className="secondary" onClick={() => openEditModal(q)} style={{ padding: "6px 12px", minHeight: 32, fontSize: "0.8rem" }}>✏️ Edit</button>
              </div>
              <div className="form-grid-2">
                {["A", "B", "C", "D"].map(letter => {
                  const isCorrect = q.correct_option === letter;
                  return (
                    <div key={letter} style={{ padding: "16px", borderRadius: 8, border: isCorrect ? "2px solid var(--mk-success)" : "1px solid var(--mk-border)", background: isCorrect ? "rgba(34, 217, 154, 0.1)" : "var(--mk-bg-elev)" }}>
                      <span style={{ color: isCorrect ? "var(--mk-success)" : "var(--mk-text)" }}>{letter}. <ChemText text={q["option_" + letter.toLowerCase()]} /></span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="card">
          <form onSubmit={saveSettings} className="stack" style={{ maxWidth: 800 }}>
            <h3 style={{ marginBottom: 16 }}>Exam Configuration</h3>
            
            <div>
              <label>Exam Title</label>
              <input required value={settingsForm.title} onChange={e => setSettingsForm({ ...settingsForm, title: e.target.value })} />
            </div>

            <div className="form-grid-3">
              <div>
                <label>Class Level</label>
                <select value={settingsForm.education_level} onChange={e => setSettingsForm({ ...settingsForm, education_level: e.target.value, subject: SUBJECTS_BY_LEVEL[e.target.value][0] })}>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                </select>
              </div>
              <div>
                <label>Exam Type</label>
                <select value={settingsForm.exam_type} onChange={e => setSettingsForm({ ...settingsForm, exam_type: e.target.value })}>
                  <option value="practice">Practice</option>
                  <option value="mock">Mock</option>
                  <option value="championship">Championship</option>
                </select>
              </div>
              <div>
                <label>Subject</label>
                <select value={settingsForm.subject} onChange={e => setSettingsForm({ ...settingsForm, subject: e.target.value })}>
                  {settingsSubjectOptions.map(s => <option key={s} value={s}>{SUBJECT_LABELS[s] || s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label>Exam Target (e.g. JAMB, WAEC)</label>
                <select value={settingsForm.exam_target} onChange={e => setSettingsForm({ ...settingsForm, exam_target: e.target.value })}>
                  {EXAM_TARGETS_BY_LEVEL[settingsForm.education_level].map(t => (
                    <option key={t} value={t}>{EXAM_TARGET_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Duration (Mins)</label>
                <input type="number" value={settingsForm.duration_mins} onChange={e => setSettingsForm({ ...settingsForm, duration_mins: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="form-grid-3">
              <div>
                <label>Total Marks</label>
                <input type="number" value={settingsForm.total_marks} onChange={e => setSettingsForm({ ...settingsForm, total_marks: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label>Pass %</label>
                <input type="number" value={settingsForm.pass_percent} onChange={e => setSettingsForm({ ...settingsForm, pass_percent: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label>Questions to Serve</label>
                <input type="number" value={settingsForm.questions_to_serve} onChange={e => setSettingsForm({ ...settingsForm, questions_to_serve: parseInt(e.target.value) || 0 })} />
                <p className="text-faint" style={{ fontSize: "0.75rem", marginTop: 4 }}>0 = serve all</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label>Randomize Questions?</label>
                <select value={settingsForm.randomize_questions ? "1" : "0"} onChange={e => setSettingsForm({ ...settingsForm, randomize_questions: e.target.value === "1" })}>
                  <option value="1">Yes (Shuffle)</option>
                  <option value="0">No (Static Order)</option>
                </select>
              </div>
              <div>
                <label>Access Code (Optional)</label>
                <input placeholder="Leave empty for no code" value={settingsForm.access_code} onChange={e => setSettingsForm({ ...settingsForm, access_code: e.target.value })} />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label>Start Date (Optional)</label>
                <input type="datetime-local" value={settingsForm.start_date} onChange={e => setSettingsForm({ ...settingsForm, start_date: e.target.value })} />
              </div>
              <div>
                <label>End Date (Optional)</label>
                <input type="datetime-local" value={settingsForm.end_date} onChange={e => setSettingsForm({ ...settingsForm, end_date: e.target.value })} />
              </div>
            </div>

            <div>
              <label>Custom Instructions</label>
              <textarea rows="2" placeholder="Answer all questions" value={settingsForm.instructions} onChange={e => setSettingsForm({ ...settingsForm, instructions: e.target.value })} />
            </div>

            <button type="submit" disabled={savingSettings} style={{ marginTop: 16 }}>
              {savingSettings ? "Saving..." : "Update Exam Configuration"}
            </button>
          </form>
        </div>
      )}

      {editingQuestion && editForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={closeEditModal}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", borderRadius: 12, padding: 24, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Edit Question</h2>
              <button className="secondary" onClick={closeEditModal} style={{ padding: "4px 10px" }}>✕</button>
            </div>
            <form onSubmit={saveEdit} className="stack">
              <div>
                <label>Question Text</label>
                <textarea required rows="3" value={editForm.question_text} onChange={e => setEditForm({ ...editForm, question_text: e.target.value })} />
              </div>
              <div className="form-grid-2">
                <div><label>Option A</label><input required value={editForm.option_a} onChange={e => setEditForm({ ...editForm, option_a: e.target.value })} /></div>
                <div><label>Option B</label><input required value={editForm.option_b} onChange={e => setEditForm({ ...editForm, option_b: e.target.value })} /></div>
                <div><label>Option C</label><input required value={editForm.option_c} onChange={e => setEditForm({ ...editForm, option_c: e.target.value })} /></div>
                <div><label>Option D</label><input required value={editForm.option_d} onChange={e => setEditForm({ ...editForm, option_d: e.target.value })} /></div>
              </div>
              <div className="form-grid-3">
                <div>
                  <label>Correct Option</label>
                  <select value={editForm.correct_option} onChange={e => setEditForm({ ...editForm, correct_option: e.target.value })}>
                    <option>A</option><option>B</option><option>C</option><option>D</option>
                  </select>
                </div>
                <div><label>Topic</label><input value={editForm.topic} onChange={e => setEditForm({ ...editForm, topic: e.target.value })} /></div>
                <div>
                  <label>Difficulty</label>
                  <select value={editForm.difficulty} onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })}>
                    <option>easy</option><option>medium</option><option>hard</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div>
                  <label>Image URL (Optional)</label>
                  <input value={editForm.image_url} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <label>Passage ID (Optional)</label>
                  <input type="number" value={editForm.passage_id} onChange={e => setEditForm({ ...editForm, passage_id: e.target.value })} placeholder="e.g. 12" />
                </div>
              </div>
              <div>
                <label>Explanation</label>
                <textarea rows="2" value={editForm.explanation} onChange={e => setEditForm({ ...editForm, explanation: e.target.value })} />
              </div>
              {editError && <p style={{ color: "var(--mk-danger)", margin: 0, fontWeight: 600 }}>{editError}</p>}
              <div className="row" style={{ gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="secondary" onClick={closeEditModal} disabled={editBusy}>Cancel</button>
                <button type="submit" disabled={editBusy}>{editBusy ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setPreviewOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", borderRadius: 12, padding: 24, maxWidth: 900, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Preview Import</h2>
              <button className="secondary" onClick={() => setPreviewOpen(false)} style={{ padding: "4px 10px" }}>✕</button>
            </div>
            <p className="text-dim" style={{ marginBottom: 16 }}>File: <strong>{pendingFile?.name}</strong> — showing first {previewRows.length} row(s).</p>
            {previewError && <div style={{ padding: 12, background: "rgba(255, 107, 107, 0.1)", borderLeft: "4px solid var(--mk-danger)", borderRadius: 6, marginBottom: 16 }}><p style={{ margin: 0, color: "var(--mk-danger)", fontWeight: 600 }}>{previewError}</p></div>}
            {previewRows.length > 0 ? (
              <div className="table-responsive" style={{ marginBottom: 20 }}>
                <table>
                  <thead><tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}><th style={{ padding: 12 }}>#</th><th style={{ padding: 12 }}>Question</th><th style={{ padding: 12 }}>A</th><th style={{ padding: 12 }}>B</th><th style={{ padding: 12 }}>C</th><th style={{ padding: 12 }}>D</th><th style={{ padding: 12 }}>Answer</th></tr></thead>
                  <tbody>{previewRows.map((r, i) => (<tr key={i} style={{ borderTop: "1px solid var(--mk-border)" }}><td style={{ padding: 12 }} className="mono">{i + 1}</td><td style={{ padding: 12, maxWidth: 240 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.question_text || r.question || "—"}</div></td><td style={{ padding: 12 }}>{r.option_a || "—"}</td><td style={{ padding: 12 }}>{r.option_b || "—"}</td><td style={{ padding: 12 }}>{r.option_c || "—"}</td><td style={{ padding: 12 }}>{r.option_d || "—"}</td><td style={{ padding: 12, fontWeight: 700, color: "var(--mk-success)", textTransform: "uppercase" }}>{r.correct_option || r.correct_answer || "—"}</td></tr>))}</tbody>
                </table>
              </div>
            ) : !previewError ? (<p className="text-dim" style={{ marginBottom: 20 }}>Preview isn't available for this file type (.xlsx). The file will still be imported on confirm.</p>) : null}
            <div className="row" style={{ gap: 12, justifyContent: "flex-end" }}>
              <button className="secondary" onClick={() => setPreviewOpen(false)} disabled={uploading}>Cancel</button>
              <button onClick={confirmUpload} disabled={uploading || !!previewError && !pendingFile}>{uploading ? "Importing..." : "Confirm & Import"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- 14. ADD QUESTION PAGE ----------------
function AddQuestionPage({ exam, onBack, onSaved }) {
  const [form, setForm] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
    topic: "",
    difficulty: "medium",
    image_url: "",
    passage_id: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      // The backend exposes CSV upload as the sanctioned create path.
      // We build a single-row CSV in memory and send it through adminUploadCsv
      // so this form still works without needing a dedicated POST /admin/questions endpoint.
      const escape = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
      const header = "question_text,option_a,option_b,option_c,option_d,correct_option,explanation,topic,difficulty,image_url";
      const row = [
        form.question_text,
        form.option_a,
        form.option_b,
        form.option_c,
        form.option_d,
        form.correct_option,
        form.explanation,
        form.topic,
        form.difficulty,
        form.image_url,
      ].map(escape).join(",");
      const csv = `${header}\n${row}\n`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const file = new File([blob], `manual_question_${Date.now()}.csv`, { type: "text/csv" });

      const res = await api.adminUploadCsv(file, {
        education_level: exam.education_level,
        subject: exam.subject,
        exam_target: exam.exam_target,
        exam_id: exam.id,
        add_to_bank: exam.add_to_bank,
      });
      if (res && res.added === 0) {
        throw new Error((res.errors && res.errors[0]) || "Question was rejected by the server.");
      }
      onSaved();
    } catch (ex) {
      setErr(ex.message || "Failed to save question.");
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ cursor: "pointer", color: "var(--mk-accent)", marginBottom: 24, fontWeight: 600 }} onClick={onBack}>← Back to Exam</div>
      <h2 style={{ marginBottom: 32 }}>Add New Question</h2>
      <form onSubmit={save} className="card">
        <div style={{ marginBottom: 24 }}><label>Question Text</label><textarea required rows="3" value={form.question_text} onChange={e => setForm({...form, question_text: e.target.value})} /></div>
        <div className="form-grid-2" style={{ marginBottom: 24 }}>
          <div><label>Option A</label><input required value={form.option_a} onChange={e => setForm({...form, option_a: e.target.value})} /></div>
          <div><label>Option B</label><input required value={form.option_b} onChange={e => setForm({...form, option_b: e.target.value})} /></div>
          <div><label>Option C</label><input required value={form.option_c} onChange={e => setForm({...form, option_c: e.target.value})} /></div>
          <div><label>Option D</label><input required value={form.option_d} onChange={e => setForm({...form, option_d: e.target.value})} /></div>
        </div>
        <div className="form-grid-3" style={{ marginBottom: 24 }}>
          <div><label>Correct Option</label><select value={form.correct_option} onChange={e => setForm({...form, correct_option: e.target.value})}><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
          <div><label>Topic</label><input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} /></div>
          <div><label>Difficulty</label><select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}><option>easy</option><option>medium</option><option>hard</option></select></div>
        </div>
        <div className="form-grid-2" style={{ marginBottom: 24 }}>
          <div>
            <label>Image URL (Optional - for diagrams)</label>
            <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
          </div>
          <div>
            <label>Passage ID (Optional)</label>
            <input type="number" value={form.passage_id} onChange={e => setForm({...form, passage_id: e.target.value})} placeholder="e.g. 12" />
          </div>
        </div>
        <div style={{ marginBottom: 32 }}><label>Explanation</label><textarea rows="2" value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})} /></div>
        {err && <p style={{ color: "var(--mk-danger)", marginBottom: 12, fontWeight: 600 }}>{err}</p>}
        <button type="submit" disabled={busy}>{busy ? "Saving..." : "Save Question"}</button>
      </form>
    </div>
  );
}
// ---------------- 17. RESULTS CENTER ----------------
function ResultsCenter() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [mode, setMode] = useState("");
  const [level, setLevel] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [days, setDays] = useState("");

  function loadResults() {
    setLoading(true);
    const query = {};
    if (mode) query.mode = mode;
    if (level) query.education_level = level;
    if (stateFilter) query.state = stateFilter;
    if (days) query.days = days;

    api.adminGetResults(query)
      .then(setResults)
      .catch((err) => alert("Error loading results: " + err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadResults();
  }, [mode, level, stateFilter, days]);

  const formatTime = (seconds) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const exportExcel = () => {
    const dataToExport = results.map((r, i) => ({
      "S/N": i + 1,
      "Student Name": r.student_name,
      "School": r.school_name,
      "State": r.state,
      "Subject": SUBJECT_LABELS[r.subject] || r.subject,
      "Exam Type": r.mode.toUpperCase(),
      "Score": r.score,
      "Total Questions": r.total_questions,
      "Percentage (%)": r.percentage,
      "Time Spent": formatTime(r.time_taken_seconds),
      "Date Submitted": r.date ? new Date(r.date).toLocaleString() : "—"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam Results");
    XLSX.writeFile(wb, `MAKAVERSE_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

    const exportPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add Title and Date
    doc.setFontSize(16);
    doc.text("MAKAVERSE EXAMINATION RESULTS", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["#", "Student Name", "School", "Subject", "Exam", "Score", "Total", "Percent", "Time", "Date"];
    const tableRows = results.map((r, i) => [
      i + 1,
      r.student_name,
      r.school_name,
      SUBJECT_LABELS[r.subject] || r.subject,
      r.mode.toUpperCase(),
      r.score,
      r.total_questions,
      `${r.percentage}%`,
      formatTime(r.time_taken_seconds),
      r.date ? new Date(r.date).toLocaleDateString() : "—"
    ]);

    // Use the new explicit autoTable syntax
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 212, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 }
    });

    doc.save(`MAKAVERSE_Results_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Nigerian States for the dropdown
  const statesList = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

  return (
    <div className="stack">
      <div className="row-between" style={{ flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Exam Results Center</h1>
          <p className="text-dim" style={{ margin: "4px 0 0 0" }}>Track, filter, and export all student results.</p>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button onClick={exportExcel} className="secondary" style={{ borderColor: "var(--mk-success)", color: "var(--mk-success)" }}>
            📥 Export to Excel
          </button>
          <button onClick={exportPDF} style={{ background: "var(--mk-danger)", color: "white" }}>
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card" style={{ padding: 24, background: "var(--mk-bg-elev-2)" }}>
        <div className="form-grid-4">
          <div>
            <label>Exam Type</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="">All Exams</option>
              <option value="practice">Practice</option>
              <option value="mock">Mock</option>
              <option value="championship">Championship</option>
            </select>
          </div>
          <div>
            <label>Class Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All Levels</option>
              {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
            </select>
          </div>
          <div>
            <label>State</label>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
              <option value="">All States</option>
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Time Frame</label>
            <select value={days} onChange={(e) => setDays(e.target.value)}>
              <option value="">All Time</option>
              <option value="1">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--mk-text-faint)", fontSize: "0.75rem", textTransform: "uppercase", background: "var(--mk-bg-elev-2)" }}>
                <th style={{ padding: "16px" }}>Student</th>
                <th style={{ padding: "16px" }}>School / State</th>
                <th style={{ padding: "16px" }}>Exam</th>
                <th style={{ padding: "16px" }}>Score</th>
                <th style={{ padding: "16px" }}>Percentage</th>
                <th style={{ padding: "16px" }}>Time Spent</th>
                <th style={{ padding: "16px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: 40, textAlign: "center" }} className="text-dim">Loading results...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: 40, textAlign: "center" }} className="text-dim">No results match your filters.</td></tr>
              ) : results.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--mk-border)" }}>
                  <td style={{ padding: "16px", fontWeight: 700 }}>{r.student_name}</td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.9rem" }}>{r.school_name}</div>
                    <div className="text-faint" style={{ fontSize: "0.75rem" }}>{r.state}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{SUBJECT_LABELS[r.subject] || r.subject}</div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(0, 212, 255, 0.1)", color: "var(--mk-accent)" }}>{r.mode.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "16px", fontWeight: 800 }}>{r.score} / {r.total_questions}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontWeight: 900, color: r.percentage >= 50 ? "var(--mk-success)" : "var(--mk-danger)" }}>
                      {r.percentage}%
                    </span>
                  </td>
                  <td style={{ padding: "16px" }} className="mono">{formatTime(r.time_taken_seconds)}</td>
                  <td style={{ padding: "16px" }} className="text-dim">
                    {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}