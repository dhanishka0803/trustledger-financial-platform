import axios from 'axios';
import { MockAPIService } from '../services/mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trustledger-financial-platform.onrender.com';
const IS_VERCEL = false; // Always use real API now

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mockAPI = MockAPIService.getInstance();

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (username: string, password: string) => {
    if (IS_VERCEL) {
      const result = await mockAPI.login(username, password);
      return { data: result };
    }
    return api.post('/auth/login', { username, password });
  },

  register: (data: { username: string; email: string; password: string; full_name?: string; phone?: string }) =>
    api.post('/auth/register', data),

  getMe: () => api.get('/auth/me'),

  updateSettings: (settings: Record<string, any>) =>
    api.put('/auth/settings', settings),

  freezeAccount: () => api.post('/auth/freeze-account'),
  unfreezeAccount: () => api.post('/auth/unfreeze-account'),
};

// Transaction APIs
export const transactionAPI = {
  getAll: async (params?: { skip?: number; limit?: number; category?: string }) => {
    if (IS_VERCEL) {
      const result = await mockAPI.getTransactions();
      return { data: result };
    }
    return api.get('/transactions/', { params });
  },

  create: (data: { merchant: string; amount: number; category?: string; description?: string; location?: string }) =>
    api.post('/transactions/', data),

  getStats: (days?: number) =>
    api.get('/transactions/stats', { params: { days: days || 30 } }),

  getCategories: () => api.get('/transactions/categories'),

  getById: (transactionId: string) =>
    api.get(`/transactions/${transactionId}`),

  delete: (transactionId: string) =>
    api.delete(`/transactions/${transactionId}`),
};

// Fraud APIs
export const fraudAPI = {
  analyze: (data: { transaction_id?: string; merchant?: string; amount?: number; location?: string }) =>
    api.post('/fraud/analyze', data),

  getAlerts: () => api.get('/fraud/alerts'),

  getCases: () => api.get('/fraud/cases'),

  reportFraud: (transactionId: string) =>
    api.post('/fraud/report', { transaction_id: transactionId }),

  getStats: () => api.get('/fraud/stats'),
};

// Market APIs
export const marketAPI = {
  getLive: async () => {
    if (IS_VERCEL) {
      const result = await mockAPI.getMarketData();
      return { data: result };
    }
    return api.get('/market/live');
  },
  getRisk: () => api.get('/market/risk'),
  getVolatility: () => api.get('/market/volatility'),
  getAnalysis: () => api.get('/market/analysis'),
  getAlerts: () => api.get('/market/alerts'),
  getTrend: (days?: number) => api.get('/market/trend', { params: { days: days || 30 } }),
};

// AI APIs
export const aiAPI = {
  chat: async (message: string, context?: string) => {
    if (IS_VERCEL) {
      const result = await mockAPI.askAI(message);
      return { data: result };
    }
    return api.post('/ai/chat', { message, context: context || '' });
  },

  queryDocuments: (query: string, documentType?: string) =>
    api.post('/ai/document-query', { query, document_type: documentType }),

  getInsights: () => api.get('/ai/insights'),

  generateReport: () => api.get('/ai/reports/generate'),

  getNotifications: () => api.get('/ai/notifications'),

  markNotificationRead: (id: number) =>
    api.put(`/ai/notifications/${id}/read`),
};

// Compliance APIs
export const complianceAPI = {
  runCheck: () => api.get('/compliance/check'),
  getHistory: () => api.get('/compliance/history'),
  getScore: () => api.get('/compliance/score'),
  getDocuments: () => api.get('/compliance/documents'),
  getRegulations: () => api.get('/compliance/regulations'),
  uploadDocument: (file: File, documentType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) formData.append('document_type', documentType);
    return api.post('/compliance/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getFraudCases: (status?: string) =>
    api.get('/admin/fraud-cases', { params: status ? { status } : {} }),
  updateFraudCaseStatus: (caseId: number, status: string, notes?: string) =>
    api.put(`/admin/fraud-cases/${caseId}/status`, null, { params: { status, notes } }),
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (userId: number, isActive: boolean) =>
    api.put(`/admin/users/${userId}/status`, null, { params: { is_active: isActive } }),
  getLogs: (level?: string) =>
    api.get('/admin/logs', { params: level ? { level } : {} }),
  getAnalytics: (days?: number) =>
    api.get('/admin/analytics', { params: { days: days || 30 } }),
  broadcastAlert: (title: string, message: string, severity?: string) =>
    api.post('/admin/alerts/broadcast', null, { params: { title, message, severity: severity || 'info' } }),
};

export default api;
