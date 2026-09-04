import { apiClient } from "@/lib/api-client";
import type { Store, CreateStoreInput, UpdateStoreInput } from "../types";

export const storesApi = {
  getAll: () => apiClient.get<Store[]>("/stores"),
  getById: (id: string) => apiClient.get<Store>(`/stores/${id}`),
  create: (data: CreateStoreInput) =>
    apiClient.post<Store>("/stores", data),
  update: (id: string, data: UpdateStoreInput) =>
    apiClient.put<Store>(`/stores/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<void>(`/stores/${id}`),
};
