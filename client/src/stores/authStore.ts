import { create } from 'zustand';
import { getMe } from '@/api/auth';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveAuthSession,
  type AuthSession,
  type AuthUser,
} from '@/lib/auth';
import { refreshAccessToken } from '@/lib/tokenRefresh';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,

  setSession: (session) => {
    saveAuthSession(session);
    set({
      user: session.user,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  clearSession: () => {
    clearAuthSession();
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });
  },

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });

    const refreshToken = getRefreshToken();

    if (refreshToken) {
      const session = await refreshAccessToken();
      if (session) {
        set({
          user: session.user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }
      clearAuthSession();
    }

    const accessToken = getAccessToken();
    const storedUser = getStoredUser();

    if (accessToken && storedUser) {
      try {
        const user = await getMe();
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
        return;
      } catch {
        clearAuthSession();
      }
    }

    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });
  },

  refreshUser: async () => {
    if (!get().isAuthenticated) return;
    try {
      const user = await getMe();
      localStorage.setItem('everafter_user', JSON.stringify(user));
      set({ user });
    } catch {
      // Keep existing user on transient failures.
    }
  },
}));
