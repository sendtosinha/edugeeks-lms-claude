import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const auth = JSON.parse(localStorage.getItem('edugeeks-auth') || '{}');
      if (auth?.state?.token) {
        config.headers['Authorization'] = `Bearer ${auth.state.token}`;
      }
    } catch (_) {}
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
        localStorage.removeItem('edugeeks-auth');
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(path);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
