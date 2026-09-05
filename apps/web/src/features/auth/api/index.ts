import { apiClient } from "@/lib/api-client";
import type { AuthResponse, LoginInput, LoginPinInput, RegisterInput, User } from "../types";

export const authApi = {
  loginEmail: async (credentials: LoginInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  loginPin: async (data: LoginPinInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/login-pin", data);
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/register", data);
  },

  getMe: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>("/auth/me");
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>("/auth/logout");
  },
};
