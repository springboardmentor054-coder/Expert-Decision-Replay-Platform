import axios from 'axios';

const TOKEN_KEY = 'edrp_token';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new Event('edrp:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function extractErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (full_name, email, password, role) =>
    api.post('/auth/register', { full_name, email, password, role }),
  googleLogin: (accessToken) => api.post('/auth/google', { access_token: accessToken }),
  appleLogin: (idToken, fullName) => api.post('/auth/apple', { id_token: idToken, full_name: fullName }),
};

export const categoryAPI = {
  list: () => api.get('/categories/'),
};

export const userAPI = {
  list: () => api.get('/users/'),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  changePassword: (id, currentPassword, newPassword) =>
    api.put(`/users/${id}/password`, { current_password: currentPassword, new_password: newPassword }),
  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeAvatar: (id) => api.delete(`/users/${id}/avatar`),
  remove: (id) => api.delete(`/users/${id}`),
};

export const roleAPI = {
  list: () => api.get('/roles/'),
  create: (name, description) => api.post('/roles/', { name, description }),
  remove: (id) => api.delete(`/roles/${id}`),
};

export const decisionAPI = {
  list: () => api.get('/decisions/'),
  get: (id) => api.get(`/decisions/${id}`),
  create: (data) => api.post('/decisions/', data),
  update: (id, data) => api.put(`/decisions/${id}`, data),
  remove: (id) => api.delete(`/decisions/${id}`),
  approvals: (decisionId) => api.get(`/decisions/${decisionId}/approvals`),
};

export const alternativeAPI = {
  listAll: () => api.get('/alternatives/'),
  listForDecision: (decisionId) => api.get(`/decisions/${decisionId}/alternatives`),
  get: (id) => api.get(`/alternatives/${id}`),
  create: (data) => api.post('/alternatives/', data),
  update: (id, data) => api.put(`/alternatives/${id}`, data),
  remove: (id) => api.delete(`/alternatives/${id}`),
};

export const documentAPI = {
  listAll: () => api.get('/documents/'),
  listForDecision: (decisionId) => api.get(`/decisions/${decisionId}/documents`),
  get: (id) => api.get(`/documents/${id}`),
  upload: (decisionId, file) => {
    const formData = new FormData();
    formData.append('decision_id', decisionId);
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  remove: (id) => api.delete(`/documents/${id}`),
  downloadUrl: (id) => `${API_BASE_URL}/documents/${id}/download`,
};

export const commentAPI = {
  listAll: () => api.get('/comments/'),
  listForDecision: (decisionId) => api.get(`/decisions/${decisionId}/comments`),
  create: (decisionId, comment) => api.post('/comments/', { decision_id: decisionId, comment }),
  update: (id, comment) => api.put(`/comments/${id}`, { comment }),
  remove: (id) => api.delete(`/comments/${id}`),
};

export const meetingNoteAPI = {
  listForDecision: (decisionId) => api.get(`/decisions/${decisionId}/meeting-notes`),
  create: (data) => api.post('/meeting-notes/', data),
  update: (id, data) => api.put(`/meeting-notes/${id}`, data),
  remove: (id) => api.delete(`/meeting-notes/${id}`),
};

export const decisionVersionAPI = {
  listAll: () => api.get('/decision-versions/'),
  listForDecision: (decisionId) => api.get(`/decisions/${decisionId}/versions`),
  create: (decisionId, changeSummary) =>
    api.post(`/decisions/${decisionId}/versions`, { change_summary: changeSummary || null }),
};

export const notificationAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const accessLogAPI = {
  list: () => api.get('/access-logs/'),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
  charts: () => api.get('/dashboard/charts'),
  analytics: () => api.get('/dashboard/analytics'),
};

export const reportAPI = {
  decisions: (filters = {}) => api.get('/reports/decisions', { params: filters }),
  approvals: () => api.get('/reports/approvals'),
  teams: () => api.get('/reports/teams'),
  audit: () => api.get('/reports/audit'),
};

export const auditLogAPI = {
  list: (filters = {}) => api.get('/audit-logs', { params: filters }),
  get: (id) => api.get(`/audit-logs/${id}`),
  listForUser: (userId) => api.get(`/users/${userId}/audit-logs`),
  listForDecision: (decisionId) => api.get(`/decisions/${decisionId}/audit-logs`),
};

export const approvalAPI = {
  list: () => api.get('/approvals/'),
  get: (id) => api.get(`/approvals/${id}`),
  create: (decisionId, approvalLevel) =>
    api.post('/approvals/', { decision_id: decisionId, approval_level: approvalLevel }),
  update: (id, data) => api.put(`/approvals/${id}`, data),
  remove: (id) => api.delete(`/approvals/${id}`),
  approve: (id, remarks) => api.put(`/approvals/${id}/approve`, { remarks: remarks || null }),
  reject: (id, remarks) => api.put(`/approvals/${id}/reject`, { remarks: remarks || null }),
};
