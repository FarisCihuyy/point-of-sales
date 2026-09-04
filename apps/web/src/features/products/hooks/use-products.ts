import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../api";
import type { CreateProductInput } from "../types";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

export function useProducts(params?: { categoryId?: string; search?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, params],
    queryFn: () => productsApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductInput>;
    }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    createProduct: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
