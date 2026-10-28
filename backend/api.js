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
    const detail = data && data.detail ? data.detail : "HTTP " + res.status;
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

  adminStudents: () => request("/admin/students"),
  adminStudent: (id) => request("/admin/students/" + id),
  adminResetPassword: (userId, newPassword) => request("/admin/reset-password", { method: "POST", body: { user_id: userId, new_password: newPassword } }),
  adminToggleActive: (id) => request("/admin/students/" + id + "/toggle-active", { method: "POST" }),
  
  adminGetEmails: () => request('/admin/emails'),
  adminGetUnreadCount: () => request('/admin/emails/unread'),
  adminMarkEmailRead: (id) => request('/admin/emails/' + id + '/read', { method: 'PUT' }),
  adminReplyEmail: (id, message) => request('/admin/emails/' + id + '/reply', { method: 'POST', body: { message } }),

  adminGetExams: () => request('/admin/exams'),
  adminCreateExam: (data) => request('/admin/exams', { method: 'POST', body: data }),
  adminGetExamQuestions: (id) => request('/admin/exams/' + id + '/questions'),
  
  adminQuestions: (query) => request("/admin/questions", { query }),
  adminCreateQuestion: (p) => request("/admin/questions", { method: "POST", body: p }),
  adminUpdateQuestion: (id, p) => request("/admin/questions/" + id, { method: "PUT", body: p }),
  adminDeleteQuestion: (id) => request("/admin/questions/" + id, { method: "DELETE" }),
  adminUploadCsv: async (file, defaults = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    const query = new URLSearchParams();
    if (defaults.education_level) query.append('default_level', defaults.education_level);
    if (defaults.subject) query.append('default_subject', defaults.subject);
    if (defaults.exam_target) query.append('default_target', defaults.exam_target);
    if (defaults.exam_id) query.append('default_exam_id', defaults.exam_id);
    
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

  adminConfigs: () => request("/admin/subject-configs"),
  adminUpsertConfig: (p) => request("/admin/subject-configs", { method: "PUT", body: p }),

  adminZoom: () => request("/admin/zoom-sessions"),
  adminCreateZoom: (p) => request("/admin/zoom-sessions", { method: "POST", body: p }),
  adminDeleteZoom: (id) => request("/admin/zoom-sessions/" + id, { method: "DELETE" }),

  publicZoom: () => request("/zoom-sessions", { auth: false }),

  leaderboardSubject: (subject, level) => request("/leaderboard/subject/" + subject, { query: { education_level: level }, auth: false }),
  leaderboardExam: (target) => request("/leaderboard/exam/" + target, { auth: false }),
  leaderboardHomepage: () => request("/leaderboard/homepage", { auth: false }),
  getMyRank: () => request('/leaderboard/my-rank'),

  startTest: (subject, mode) => request("/tests/start", { method: "POST", body: { subject, mode } }),
  getTest: (id) => request("/tests/" + id),
  submitTest: (id, payload) => request("/tests/" + id + "/submit", { method: "POST", body: payload }),
  testResult: (id) => request("/tests/" + id + "/result"),
  myTests: () => request("/tests-list/my"),
  mySubjects: () => request("/subjects/mine"),
  abandonTest: (id) => request("/tests/" + id + "/abandon", { method: "POST" }),
};