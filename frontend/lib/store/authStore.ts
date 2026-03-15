import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  grade?: string;
  avatar?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.accessToken });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch (_) {
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: 'edugeeks-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
