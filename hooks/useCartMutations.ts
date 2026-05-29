// app/hooks/useCartMutations.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";

// Fast optimistic mutations with loading states for better UX
export function useOptimisticAddToCart() {
  const { addToCart } = useCart();
  
  return useMutation({
    mutationFn: async (item: { id: string; name: string; price: number; image: string; slug?: string; cartId: string }) => {
      // Call the existing cart function which already handles optimistic updates
      await addToCart(item);
    },
    // Loading states are automatically handled by React Query's isPending
  });
}

export function useOptimisticUpdateCart() {
  const { updateQty } = useCart();
  
  return useMutation({
    mutationFn: async ({ productId, change }: { productId: string; change: number }) => {
      // Call the existing cart function which already handles optimistic updates
      await updateQty(productId, change);
    },
    // Loading states are automatically handled by React Query's isPending
  });
}

export function useOptimisticRemoveFromCart() {
  const { removeFromCart } = useCart();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      // Call the existing cart function
      await removeFromCart(productId);
    },
  });
}