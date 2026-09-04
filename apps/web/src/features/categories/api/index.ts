import { apiClient } from "@/lib/api-client";
import type { Category, CreateCategoryInput } from "../types";

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>("/categories");
  },

  getById: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  create: async (data: CreateCategoryInput): Promise<Category> => {
    return apiClient.post<Category>("/categories", data);
  },

  update: async (
    id: string,
    data: Partial<CreateCategoryInput>
  ): Promise<Category> => {
    return apiClient.put<Category>(`/categories/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/categories/${id}`);
  },
};
