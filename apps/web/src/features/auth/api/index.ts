import { apiClient } from "@/lib/api-client";
import type { AuthResponse, LoginInput, RegisterInput, User } from "../types";

export const authApi = {
  login: async (credentials: LoginInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/register", data);
  },

  getProfile: async (): Promise<User> => {
    return apiClient.get<User>("/auth/me");
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>("/auth/logout");
  },
};
