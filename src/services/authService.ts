import apiClient from "./apiClient";
import { supabase } from "../lib/supabase";
import type { ApiResponse, AuthResponse, User } from "../types";

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export const authService = {
  async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/api/auth/signup", payload);
    if (!data.success || !data.data) throw new Error(data.message);
    return data.data;
  },

  async signIn(payload: SignInPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/api/auth/signin", payload);
    if (!data.success || !data.data) throw new Error(data.message);
    return data.data;
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/v1/callback` },
    });
    if (error) throw new Error(error.message);
  },

    async exchangeOAuthCode(accessToken: string, refreshToken: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/api/auth/oauth/callback", {
        accessToken,
        refreshToken,
    });
    if (!data.success || !data.data) throw new Error(data.message);
    return data.data;
    },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/api/auth/refresh", { refreshToken });
    if (!data.success || !data.data) throw new Error(data.message);
    return data.data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>("/api/auth/me");
    if (!data.success || !data.data) throw new Error(data.message);
    return data.data;
  },

  async signOut(): Promise<void> {
    await apiClient.post("/api/auth/signout");
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/api/auth/forgot-password", { email });
  },

  async resetPassword(newPassword: string): Promise<void> {
    await apiClient.post("/api/auth/reset-password", { newPassword });
  },
};