import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api";
import type { CreateUserInput, UpdateUserInput } from "../types";

export const USERS_QUERY_KEY = ["users"] as const;

export function useUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: usersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
