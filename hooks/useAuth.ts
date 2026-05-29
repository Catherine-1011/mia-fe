// app/hooks/useAuth.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, User } from "@/lib/api";

// Query keys for caching
export const authQueryKeys = {
  user: ["auth", "user"] as const,
};

export function useUser() {
  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: authApi.getProfile,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("alpa_token"), // Only fetch if token exists and we're on client
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized
      if (error?.message?.includes("401") || error?.message?.includes("unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      // Remove local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("alpa_token");
        // Redirect to home
        window.location.href = "/";
      }
    },
    onError: () => {
      // Even if API fails, clear local data
      queryClient.clear();
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("alpa_token");
        window.location.href = "/";
      }
    },
  });
}