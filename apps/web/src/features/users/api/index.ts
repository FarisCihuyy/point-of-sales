import { apiClient } from "@/lib/api-client";
import type { User, CreateUserInput, UpdateUserInput } from "../types";

export const usersApi = {
  getAll: () => apiClient.get<User[]>("/users"),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (data: CreateUserInput) =>
    apiClient.post<User>("/users", data),
  update: (id: string, data: UpdateUserInput) =>
    apiClient.put<User>(`/users/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<void>(`/users/${id}`),
};
