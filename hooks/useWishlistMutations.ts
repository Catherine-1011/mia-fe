// app/hooks/useWishlistMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback } from "react";
import { wishlistApi } from "@/lib/api";
import { wishlistQueryKeys } from "./useWishlist";

interface WishlistItem {
  id: string;
  productId?: string;
  variantId?: string | null;
  product?: { id: string };
}

interface ToggleWishlistParams {
  productId: string;
  isCurrentlyWishlisted: boolean;
  variantId?: string | null;
}

// Add to wishlist with debouncing and optimistic update
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ productId, isCurrentlyWishlisted, variantId }: ToggleWishlistParams) => {
      console.log("Toggling wishlist for productId:", productId, "variant:", variantId, "currently wishlisted:", isCurrentlyWishlisted);
      
      // Convert to number if the API expects numeric IDs
      const numericId = parseInt(productId, 10);
      const idToSend = isNaN(numericId) ? productId : numericId;
      console.log("Sending ID for toggle:", idToSend, typeof idToSend);
      
      // Use the new toggle API that intelligently handles both add and remove
      // Include variantId if provided for variable products
      const payload: any = { productId: idToSend };
      if (variantId) {
        payload.variantId = variantId;
      }
      
      return wishlistApi.toggleWishlist(payload);
    },
    // Optimistic update - immediately update UI
    onMutate: async ({ productId, isCurrentlyWishlisted, variantId }) => {
      // Cancel any outgoing refetches for both main wishlist and product check
      await queryClient.cancelQueries({ queryKey: wishlistQueryKeys.wishlist });
      await queryClient.cancelQueries({ queryKey: wishlistQueryKeys.wishlistCheck(productId) });

      // Snapshot the previous values
      const previousWishlistData = queryClient.getQueryData(wishlistQueryKeys.wishlist);
      const previousCheckData = queryClient.getQueryData(wishlistQueryKeys.wishlistCheck(productId));
      
      // Handle different response formats - ensure we work with an array
      const previousWishlist = Array.isArray(previousWishlistData)
        ? previousWishlistData
        : (previousWishlistData && typeof previousWishlistData === "object" && Array.isArray((previousWishlistData as any).wishlist))
          ? (previousWishlistData as any).wishlist
          : [];

      // Optimistically update both caches with toggle behavior
      let optimisticWishlist: WishlistItem[];
      const newWishlistState = !isCurrentlyWishlisted;
      
      if (isCurrentlyWishlisted) {
        // Remove from wishlist - match both productId and variantId
        optimisticWishlist = previousWishlist.filter((item: WishlistItem) => {
          const itemId = item.productId || item.product?.id || item.id;
          const productMatch = String(itemId) === String(productId);
          
          // For variable products, also check variant ID
          if (variantId) {
            return !(productMatch && String(item.variantId) === String(variantId));
          }
          
          // For simple products, just check product ID and ensure no variant
          return !(productMatch && !item.variantId);
        });
      } else {
        // Add to wishlist
        const newItem: WishlistItem = {
          id: variantId ? `${productId}-${variantId}` : productId,
          productId: productId,
          variantId: variantId || null,
        };
        optimisticWishlist = [...previousWishlist, newItem];
      }

      // Update both caches optimistically
      queryClient.setQueryData(wishlistQueryKeys.wishlist, optimisticWishlist);
      queryClient.setQueryData(wishlistQueryKeys.wishlistCheck(productId), { inWishlist: newWishlistState });

      // Return a context object with the snapshotted values
      return { 
        previousWishlist: previousWishlistData, 
        previousCheckData,
        newWishlistState,
        productId 
      };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      console.error("Wishlist toggle failed:", err);
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistQueryKeys.wishlist, context.previousWishlist);
      }
      if (context?.previousCheckData && context?.productId) {
        queryClient.setQueryData(wishlistQueryKeys.wishlistCheck(context.productId), context.previousCheckData);
      }
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (data, error, variables) => {
      const { productId } = variables;
      
      // Invalidate both the main wishlist and the specific product check
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.wishlist });
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.wishlistCheck(productId) });
    },
  });

  // Debounced version of mutate
  const debouncedMutate = useCallback((variables: ToggleWishlistParams) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      mutation.mutate(variables);
    }, 300); // 300ms debounce for wishlist
  }, [mutation]);

  return { ...mutation, debouncedMutate };
}