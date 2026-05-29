// app/hooks/useCart.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { cartApi } from "@/lib/api";
import { CartItem } from "@/context/CartContext";

export const cartQueryKeys = {
  cart: ["cart"] as const,
  myCart: ["cart", "my-cart"] as const,
};

export function useCartQuery() {
  return useQuery({
    queryKey: cartQueryKeys.myCart,
    queryFn: async (): Promise<CartItem[]> => {
      const data = await cartApi.getMyCart();
      
      // Map backend format to frontend format
      const items: CartItem[] = data.cart.map((item: any) => ({
        cartId: item.id || item.cartId || "",
        id: item.productId,
        name: item.product.title,
        price: Number(item.product.price),
        image: item.product.images?.[0] || "/images/placeholder.png",
        qty: item.quantity,
        stock: item.product.stock,
        slug: item.product.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      }));

      return items;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("alpa_token"),
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter for cart data
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}