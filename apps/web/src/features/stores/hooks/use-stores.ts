import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storesApi } from "../api";
import type { CreateStoreInput, UpdateStoreInput } from "../types";

export const STORES_QUERY_KEY = ["stores"] as const;

export function useStores() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: STORES_QUERY_KEY,
    queryFn: storesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateStoreInput) => storesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreInput }) =>
      storesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });

  return {
    stores: query.data || [],
    isLoading: query.isLoading,
    createStore: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateStore: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteStore: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
