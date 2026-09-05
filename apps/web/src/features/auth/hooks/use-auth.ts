"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import type { LoginInput, LoginPinInput, RegisterInput, User } from "../types";

export const AUTH_QUERY_KEY = ["auth", "profile"] as const;

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await authApi.getMe();
        return res.user;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const redirectByRole = (user: User) => {
    if (user.role === "cashier" || user.role === "waitstaff") {
      router.push("/pos");
    } else {
      router.push("/");
    }
  };

  const loginEmailMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.loginEmail(data),
    onSuccess: (res) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, res.user);
      redirectByRole(res.user);
    },
  });

  const loginPinMutation = useMutation({
    mutationFn: (data: LoginPinInput) => authApi.loginPin(data),
    onSuccess: (res) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, res.user);
      redirectByRole(res.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (res) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, res.user);
      redirectByRole(res.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      router.push("/admin/login");
    },
  });

  return {
    user: query.data as User | null | undefined,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,

    // Email Login
    loginEmail: loginEmailMutation.mutate,
    loginEmailAsync: loginEmailMutation.mutateAsync,
    isLoggingInEmail: loginEmailMutation.isPending,
    loginEmailError: loginEmailMutation.error,

    // PIN Login
    loginPin: loginPinMutation.mutate,
    loginPinAsync: loginPinMutation.mutateAsync,
    isLoggingInPin: loginPinMutation.isPending,
    loginPinError: loginPinMutation.error,

    // Register
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    // Logout
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
