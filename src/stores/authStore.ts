import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthTokens } from "../types";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user: User, tokens: AuthTokens) =>
        set({ user, tokens, isAuthenticated: true }),

      setUser: (user: User) =>
        set({ user }),

      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    {
      name: "daloy-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AuthState) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);