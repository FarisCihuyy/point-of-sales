import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import type { LoginInput, RegisterInput } from "../types";

export const AUTH_QUERY_KEY = ["auth", "profile"] as const;

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getProfile,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (res) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, res.user);
      router.push("/stores");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (res) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, res.user);
      router.push("/stores");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      router.push("/login");
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
