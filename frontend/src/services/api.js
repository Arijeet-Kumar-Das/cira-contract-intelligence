import axios from 'axios';

// Centralized Axios instance pointing to the FastAPI backend
const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// ── Attach JWT to every request ──
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cira_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto-logout on 401 ──
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cira_token');
      localStorage.removeItem('cira_user');
      // Only redirect if we're not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

// ── Auth ──
export const registerUser = (email, password, organizationName) =>
  API.post('/auth/register', { email, password, organization_name: organizationName });

export const loginUser = (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  return API.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const getMe = () => API.get('/auth/me');

// ── Upload ──
export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

// ── Analysis ──
export const analyzeText = (text) => API.post('/analyze', { text });
export const analyzeClausesText = (text) => API.post('/analyze/clauses', { text });

// ── Contracts ──
export const getContracts = () => API.get('/contracts');
export const getContractById = (id) => API.get(`/contracts/${id}`);
export const getContractClauses = (id) => API.get(`/contracts/${id}/clauses`);

export default API;
