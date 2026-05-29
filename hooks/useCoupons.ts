// app/hooks/useCoupons.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { couponsApi } from "@/lib/api";

export const couponQueryKeys = {
  coupons: ["coupons"] as const,
};

export function useCoupons() {
  return useQuery({
    queryKey: couponQueryKeys.coupons,
    queryFn: couponsApi.getCoupons,
    enabled: typeof window !== "undefined", // Make public - fetch on client regardless of authentication
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized
      if (error?.message?.includes("401") || error?.message?.includes("unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}