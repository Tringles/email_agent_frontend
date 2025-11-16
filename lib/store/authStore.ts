import { create } from 'zustand';
import { User } from '@/types';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const getInitialAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  isAuthenticated: getInitialAuth(),
  setUser: (user) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('setUser called:', user ? `User ID: ${user.id}` : 'null user');
    }
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false;
    const isAuth = !!user && hasToken;
    set({ user, isAuthenticated: isAuth });
  },
  setToken: (token) => {
    apiClient.setToken(token);
    const currentUser = get().user;
    const hasUser = currentUser !== null;
    const isAuth = !!token && hasUser;
    set({ isAuthenticated: isAuth });
  },
  logout: () => {
    apiClient.setToken('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: () => {
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false;
    const user = getInitialUser();
    const isAuth = hasToken && !!user;
    set({ user, isAuthenticated: isAuth });
  },
}));

