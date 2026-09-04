import { apiClient } from "@/lib/api-client";
import type { Product, CreateProductInput, ProductWithDetails } from "../types";

export const productsApi = {
  getAll: async (params?: {
    categoryId?: string;
    search?: string;
  }): Promise<ProductWithDetails[]> => {
    return apiClient.get<ProductWithDetails[]>("/products", { params });
  },

  getById: async (id: string): Promise<ProductWithDetails> => {
    return apiClient.get<ProductWithDetails>(`/products/${id}`);
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    return apiClient.post<Product>("/products", data);
  },

  update: async (
    id: string,
    data: Partial<CreateProductInput>
  ): Promise<Product> => {
    return apiClient.put<Product>(`/products/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/products/${id}`);
  },
};
