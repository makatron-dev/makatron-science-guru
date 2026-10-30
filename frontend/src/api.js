const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "mk-token";

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function request(path, { method = "GET", body, auth = true, query } = {}) {
  let url = API_BASE + path;
  if (query) {
    const qs = new URLSearchParams(query).toString();
    if (qs) url += "?" + qs;
  }
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = "Bearer " + t;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  
  if (!res.ok) {
    let detail = data && data.detail ? data.detail : "HTTP " + res.status;
    
    if (Array.isArray(detail)) {
      detail = detail.map(e => e.msg).join(", ");
    }
    
    const err = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (p) => request("/auth/register", { method: "POST", body: p, auth: false }),
  login: (p) => request("/auth/login", { method: "POST", body: p, auth: false }),
  me: () => request("/auth/me"),
  updateMe: (p) => request("/auth/me", { method: "PATCH", body: p }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (data) => request("/auth/reset-password", { method: "POST", body: data, auth: false }),
  sendSupport: (message) => request("/support", { method: "POST", body: { message } }),
  getMySupportMessages: () => request("/support/my-messages"),

  // Active Sessions (device tracking)
  getSessions: () => request("/auth/sessions"),
  logoutOtherSessions: () => request("/auth/sessions/logout-others", { method: "POST" }),

  // Bug Reporter (floating 🐛)
  reportBug: (payload) => request("/bugs/report", { method: "POST", body: payload }),

  // Contact / Enquiry (public, no auth)
  submitEnquiry: (p) => request("/contact/enquiry", { method: "POST", body: p, auth: false }),

  // Schools (Public)
  getSchools: () => request("/schools", { auth: false }),

  // Student Dashboard & Arena
  getDashboardSummary: () => request('/dashboard/summary'),
  getActiveArena: () => request('/arena/active'),
  getChampionshipCurrent: () => request('/championship/current'),
  getPublicChampionship: () => request('/championship/public', { auth: false }),
  getChampionshipResults: (examId) => request('/championship/results/' + examId),
  getChampionshipLeaderboard: () => request('/leaderboard/championship'),
  getMyRank: () => request('/leaderboard/my-rank'),
  getActiveExams: () => request('/exams/active'),
  getMySchool: () => request('/my-school'),
  getReferralRewards: () => request('/dashboard/referral-rewards'),

  // DYNAMIC TICKER (Public)
  getTicker: () => request("/ticker", { auth: false }),

  // Admin Master Control
  adminGetResults: (query) => request("/admin/results", { query }),
  adminAnalytics: () => request("/admin/analytics"),
  adminGetDifficultyAnalytics: () => request("/admin/analytics/question-difficulty"),
  adminSettings: () => request("/admin/settings"),
  adminUpdateSettings: (p) => request("/admin/settings", { method: "PUT", body: p }),
  adminLogs: () => request("/admin/logs"),

  // Schools (Admin)
  adminCreateSchool: (p) => request("/admin/schools", { method: "POST", body: p }),
  adminDeleteSchool: (id) => request("/admin/schools/" + id, { method: "DELETE" }),
  adminUploadSchools: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getToken();
    const res = await fetch(API_BASE + '/admin/schools/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },

  // DYNAMIC TICKER (Admin)
  adminGetTicker: () => request("/admin/ticker"),
  adminCreateTicker: (headline) => request("/admin/ticker", { method: "POST", body: { headline } }),
  adminToggleTicker: (id) => request("/admin/ticker/" + id + "/toggle", { method: "PUT" }),
  adminDeleteTicker: (id) => request("/admin/ticker/" + id, { method: "DELETE" }),

  // Admin Exams
  adminGetExams: () => request('/admin/exams'),
  adminCreateExam: (data) => request('/admin/exams', { method: 'POST', body: data }),
  adminUpdateExam: (id, data) => request('/admin/exams/' + id, { method: 'PUT', body: data }),
  adminDeleteExam: (id) => request('/admin/exams/' + id, { method: 'DELETE' }),
  adminToggleExam: (id) => request('/admin/exams/' + id + '/toggle', { method: 'PUT' }),
  adminGetExamQuestions: (id) => request('/admin/exams/' + id + '/questions'),
  adminEditQuestion: (id, data) => request('/admin/questions/' + id, { method: 'PUT', body: data }),

  // Admin CSV Uploader
  adminUploadCsv: async (file, defaults = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    const query = new URLSearchParams();
    if (defaults.education_level) query.append('default_level', defaults.education_level);
    if (defaults.subject) query.append('default_subject', defaults.subject);
    if (defaults.exam_target) query.append('default_target', defaults.exam_target);
    if (defaults.exam_id) query.append('default_exam_id', defaults.exam_id);
    if (defaults.is_active !== undefined) query.append('default_is_active', defaults.is_active);
    if (defaults.add_to_bank !== undefined) query.append('add_to_bank', defaults.add_to_bank);
    
    const token = getToken();
    const res = await fetch(API_BASE + '/admin/questions/upload?' + query.toString(), {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },
  adminQuestions: (query) => request("/admin/questions", { query }),

  // Admin Passages (Comprehension)
  adminGetPassages: () => request("/admin/passages"),
  adminCreatePassage: (data) => request("/admin/passages", { method: "POST", body: data }),
  adminDeletePassage: (id) => request("/admin/passages/" + id, { method: "DELETE" }),

  // Admin Library
  adminGetLibrary: () => request("/admin/library"),
  adminAddLibraryMaterial: (data) => request("/admin/library", { method: "POST", body: data }),
  adminDeleteLibraryMaterial: (id) => request("/admin/library/" + id, { method: "DELETE" }),

  // Admin Vault & Premium
  adminGetVaultPurchases: () => request("/admin/vault/purchases"),
  adminGrantVaultItem: (userId, itemId) => request("/admin/vault/grant", { method: "POST", body: { user_id: userId, item_id: itemId } }),
  adminGetPayments: () => request("/admin/payments"),
  adminResolvePayment: (reference, action) => request("/admin/payments/" + reference + "/resolve", { method: "POST", body: { reference, action } }),

  // Admin Students
  adminStudents: () => request("/admin/students"),
  adminStudent: (id) => request("/admin/students/" + id),
  adminUpdateStudentStats: (id, data) => request("/admin/students/" + id + "/stats", { method: "PATCH", body: data }),
  adminUpdateUserRole: (userId, role, schoolId = null) => request("/admin/users/" + userId + "/role", { method: "POST", body: { user_id: userId, role, school_id: schoolId } }),
  
  // FIXED: Bypass the wrapper to send a direct POST request
  adminBulkDeleteStudents: async (userIds) => {
    const token = getToken();
    const res = await fetch(API_BASE + "/admin/students/bulk-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ user_ids: userIds })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Bulk delete failed");
    }
    return await res.json();
  },

  adminResetPassword: (userId, newPassword) => request("/admin/reset-password", { method: "POST", body: { user_id: userId, new_password: newPassword } }),
  adminToggleActive: (id) => request("/admin/students/" + id + "/toggle-active", { method: "POST" }),

  // Admin Inbox
  adminGetEmails: () => request('/admin/emails'),
  adminGetUnreadCount: () => request('/admin/emails/unread'),
  adminMarkEmailRead: (id) => request('/admin/emails/' + id + '/read', { method: 'PUT' }),
  adminReplyEmail: (id, message) => request('/admin/emails/' + id + '/reply', { method: 'POST', body: { message } }),

  // Admin Zoom
  adminZoom: () => request("/admin/zoom-sessions"),
  adminCreateZoom: (p) => request("/admin/zoom-sessions", { method: "POST", body: p }),
  adminDeleteZoom: (id) => request("/admin/zoom-sessions/" + id, { method: "DELETE" }),
  publicZoom: () => request("/zoom-sessions", { auth: false }),

  // Admin Staging & Reports
  adminGetReports: () => request("/admin/reports"),
  adminResolveReport: (id) => request("/admin/reports/" + id + "/resolve", { method: "POST" }),
  adminGetStaging: () => request("/admin/staging"),
  adminApproveStaging: (id) => request("/admin/staging/" + id + "/approve", { method: "POST" }),
  adminRejectStaging: (id) => request("/admin/staging/" + id + "/reject", { method: "POST" }),

  // Leaderboard
  leaderboardSubject: (subject, level) => request("/leaderboard/subject/" + subject, { query: { education_level: level }, auth: false }),
  leaderboardHomepage: () => request("/leaderboard/homepage", { auth: false }),
  leaderboardSchools: () => request("/leaderboard/schools", { auth: false }),
  leaderboardState: (state) => request("/leaderboard/state/" + state, { auth: false }),
  
  // NEW: Fetch the active championship exam for the leaderboard dropdown
  getActiveChampionships: () => request('/championship/current'),

  // Squads
  createSquad: (name) => request("/squads", { method: "POST", body: { name } }),
  joinSquad: (inviteCode) => request("/squads/join", { method: "POST", body: { invite_code: inviteCode } }),
  getMySquad: () => request("/squads/my"),
  leaveSquad: () => request("/squads/leave", { method: "POST" }),

  // Tests
  startTest: (subject, mode, examId = null, accessCode = null) => request("/tests/start", {
    method: "POST",
    body: { subject, mode, exam_id: examId, access_code: accessCode },
  }),
  submitTest: (id, payload) => request("/tests/" + id + "/submit", { method: "POST", body: payload }),
  testResult: (id) => request("/tests/" + id + "/result"),
  myTests: () => request("/tests-list/my"),
  mySubjects: () => request("/subjects/mine"),
  abandonTest: (id) => request("/tests/" + id + "/abandon", { method: "POST" }),
  reviewMistakes: (testId = null) => request("/tests/review-mistakes", {
    method: "POST",
    body: testId != null ? { test_id: testId } : {},
  }),
  heartbeatTest: (id, isFullscreen = true) => request("/tests/" + id + "/heartbeat", {
    method: "POST",
    body: { is_fullscreen: isFullscreen },
  }),

  // Bookmarks & Reports
  toggleBookmark: (questionId) => request("/bookmarks/" + questionId, { method: "POST" }),
  getMyBookmarks: () => request("/bookmarks"),
  reportQuestion: (questionId, reason, details) => request("/questions/" + questionId + "/report", { method: "POST", body: { reason, details } }),

  // AI Tutor
  explainWithAI: (questionText, correctAnswer) => request("/ai/explain", { 
    method: "POST", 
    body: { question_text: questionText, correct_answer: correctAnswer } 
  }),

  // DAILY CHALLENGE
  getDailyChallenge: () => request("/daily-challenge"),
  submitDailyChallenge: (answers) => request("/daily-challenge/submit", { method: "POST", body: { answers } }),

  // VAULT & INVENTORY
  getVaultItems: () => request("/vault/items"),
  getMyInventory: () => request("/vault/inventory"),
  buyVaultItem: (itemId) => request("/vault/buy", { method: "POST", body: { item_id: itemId } }),
  equipVaultItem: (itemId) => request("/vault/equip", { method: "POST", body: { item_id: itemId } }),

  // POWER LADDER
  getRanks: () => request("/ranks"),

  // STUDY TRACKER
  saveStudyTime: (seconds) => request("/study-time", { method: "POST", body: { seconds } }),

  // STUDY LIBRARY
  getStudyMaterials: () => request("/library"),

  // PAYMENTS
  initPayment: (planType) => request("/payments/initialize", { method: "POST", body: { plan_type: planType } }),
  verifyPayment: (reference) => request("/payments/verify", { method: "POST", body: { reference } }),
  getPaymentHistory: () => request("/payments/history"),

  // CERTIFICATE VERIFICATION (public)
  verifyCertificate: (certId) => request("/verify-certificate/" + encodeURIComponent(certId), { auth: false }),
};