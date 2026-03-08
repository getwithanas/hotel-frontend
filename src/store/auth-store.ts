import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: true,

  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  hasRole: (...roles) => {
    const user = get().user;
    return user ? roles.includes(user.role) : false;
  },
}));
