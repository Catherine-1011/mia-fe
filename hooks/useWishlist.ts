// app/hooks/useWishlist.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api";

export const wishlistQueryKeys = {
  wishlist: ["wishlist"] as const,
  wishlistCheck: (productId: string | number, variantId?: string | null) => 
    ["wishlist", "check", productId, variantId] as const,
};

export function useWishlistQuery() {
  // Always call useQuery - never conditionally
  // The queryFn will return empty array if no token
  return useQuery({
    queryKey: wishlistQueryKeys.wishlist,
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("alpa_token") : null;
      if (!token) {
        return []; // Return empty array if not authenticated
      }
      const data = await wishlistApi.getWishlist();
      // Ensure we always return an array - API should return any[] already
      return Array.isArray(data) ? data : Array.isArray((data as any)?.wishlist) ? (data as any).wishlist as any[] : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook to check if a product is in the wishlist using the fast API
import { useQuery as useCheckQuery } from "@tanstack/react-query";
export function useWishlistCheck(productId: string | number, variantId?: string | null) {
  return useCheckQuery({
    queryKey: wishlistQueryKeys.wishlistCheck(productId, variantId),
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("alpa_token") : null;
      if (!token || !productId) {
        return { inWishlist: false };
      }
      
      // For variant-specific checks, we need to check the full wishlist
      // since the API might not support variant-specific checks
      if (variantId) {
        const wishlistData = await wishlistApi.getWishlist();
        const wishlistArray = Array.isArray(wishlistData) ? wishlistData : 
                             Array.isArray((wishlistData as any)?.wishlist) ? (wishlistData as any).wishlist as any[] : [];
        
        const found = wishlistArray.some((item: any) => {
          const itemProductId = item.productId || item.product?.id || item.id;
          return String(itemProductId) === String(productId) && 
                 String(item.variantId) === String(variantId);
        });
        
        return { inWishlist: found };
      }
      
      // For simple products, use the fast check API
      return wishlistApi.checkWishlist(productId);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}