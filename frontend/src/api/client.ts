import axios from 'axios';

const host = window.location.hostname;
const apiPort = (import.meta as any).env?.VITE_API_PORT || '8000';
const protocol = window.location.protocol;
const baseURL = (import.meta as any).env?.VITE_API_BASE || `${protocol}//${host}:${apiPort}`;

const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sx_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('sx_token');
      // optional: redirect to /login
    }
    return Promise.reject(err);
  }
);

export default api;
