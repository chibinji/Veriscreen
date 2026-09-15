import { create } from 'zustand';
import type { User, Role } from '../types';
import { authService } from '../services/authService';
import { TOKEN_KEY, USER_KEY } from '../constants';
import { queryClient } from '../queryClient';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSession: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (role: Role | Role[]) => boolean;
  initializeFromStorage: () => void;
}

function readSession(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as User) : null;
    if (!token || !user) return { user: null, token: null };
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

const initial = readSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: !!(initial.user && initial.token),
  isLoading: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user && !!get().token });
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  setToken: (token) => {
    set({ token, isAuthenticated: !!token && !!get().user });
    if (token) localStorage.setItem(TOKEN_KEY, token);
  },

  setSession: (user, token) => {
    queryClient.clear();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    queryClient.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role as Role);
    return user.role === role;
  },

  initializeFromStorage: () => {
    const session = readSession();
    if (session.user && session.token) {
      set({ user: session.user, token: session.token, isAuthenticated: true });
      return;
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
