import { create } from 'zustand';
import { api, getToken, setToken, setUnauthorizedHandler } from '../api/client';
import { clearModelsCache } from '../hooks/useModels';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  /** True while the persisted token is being validated on boot. */
  initializing: boolean;
  isAdmin: () => boolean;
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initializing: true,

  isAdmin: () => get().user?.role === 'admin',

  /** Restore the session from the persisted token, if any. */
  bootstrap: async () => {
    setUnauthorizedHandler(() => {
      clearModelsCache();
      set({ user: null });
    });
    if (!getToken()) {
      set({ user: null, initializing: false });
      return;
    }
    try {
      set({ user: await api.me(), initializing: false });
    } catch {
      setToken(null);
      set({ user: null, initializing: false });
    }
  },

  login: async (username, password) => {
    const result = await api.login(username, password);
    setToken(result.token);
    clearModelsCache();
    set({ user: result.user });
  },

  logout: () => {
    setToken(null);
    clearModelsCache();
    set({ user: null });
  },

  refresh: async () => {
    set({ user: await api.me() });
  },
}));
