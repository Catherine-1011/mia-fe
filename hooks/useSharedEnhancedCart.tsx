"use client";

import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { useEnhancedCart } from './useEnhancedCart';
import { guestCartUtils } from '@/lib/guestCartUtils';

type SharedCartContextType = ReturnType<typeof useEnhancedCart> & {
  subscribeToUpdates: (callback: () => void) => () => void;
  triggerUpdate: () => void;
  addToCart: (productId: string, productData: { 
    title: string, 
    price: string, 
    featuredImage?: string,
    images?: string[],
    galleryImages?: string[],
    variantId?: string,
    variantAttributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>;
  }) => Promise<void>;
  clearCart: () => void;
};

const EnhancedCartContext = createContext<SharedCartContextType | null>(null);

export function EnhancedCartProvider({ children }: { children: React.ReactNode }) {
  const cartData = useEnhancedCart();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Create refs to store update functions so we can trigger updates across components
  const updateCallbacks = useRef<Set<() => void>>(new Set());
  // Per-product debounce timers for quantity updates
  const qtyDebounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Function to trigger updates across all subscribed components
  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
    updateCallbacks.current.forEach(callback => {
      try {
        callback();
      } catch (err) {
        console.error('Error triggering cart update:', err);
      }
    });
  }, []);

  // Enhanced add to cart function that notifies all components
  const enhancedAddToCart = useCallback(async (productId: string, productData: { 
    title: string, 
    price: string, 
    featuredImage?: string,
    images?: string[],
    galleryImages?: string[],
    variantId?: string,
    variantAttributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>;
  }) => {
    // 1. OPTIMISTIC UPDATE FIRST
    try {
      // Construct a temporary product object for optimistic update
      // We assume stock is decent for display purposes
      cartData.optimisticAddItem({
        id: productId,
        title: productData.title,
        price: productData.price,
        featuredImage: productData.featuredImage,
        images: productData.images || [],
        galleryImages: productData.galleryImages || [],
        stock: 99, 
        category: ''
      }, 1, productData.variantId, productData.variantAttributes);
    } catch (e) {
      console.error("Optimistic add failed", e);
    }

    try {
      const token = localStorage.getItem("alpa_token");
      
      // Guest mode: store in localStorage
      if (!token) {
        guestCartUtils.addItemToGuestCart(productId, {
          id: productId,
          title: productData.title,
          price: productData.price,
          featuredImage: productData.featuredImage,
          images: productData.images || [],
          galleryImages: productData.galleryImages || [],
          stock: 100,
          category: '',
        }, 1, productData.variantId, productData.variantAttributes);
        
        // Small delay to ensure localStorage is updated before triggering refresh
        setTimeout(() => {
          triggerUpdate();
        }, 100);
        return;
      }

      // Authenticated mode: API call
      const response = await fetch("http://134.199.161.119:5000/api/cart/add", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
          ...(productData.variantId && { variantId: productData.variantId }),
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      // Re-fetch so shippingCalculations reflects the new seller/item.
      await cartData.fetchCartData(true);
      triggerUpdate();
      
    } catch (error) {
      console.error('Enhanced add to cart error:', error);
      // Revert optimistic update by force-fetching server state
      cartData.fetchCartData(true);
      throw error;
    }
  }, [triggerUpdate, cartData]);

  // Enhanced update function with debounce — optimistic update fires instantly,
  // the API call is debounced 400 ms so rapid +/- clicks only send one request.
  const enhancedUpdateQuantity = useCallback(async (productId: string, newQuantity: number, variantId?: string) => {
    // 1. OPTIMISTIC UPDATE IMMEDIATELY (instant UI)
    if (newQuantity > 0) {
      cartData.optimisticUpdateItem(productId, newQuantity, variantId);
    } else {
      cartData.optimisticRemoveItem(productId, variantId);
    }

    // 2. Debounce the actual API call per product (400 ms)
    const debounceKey = variantId ? `${productId}:${variantId}` : productId;
    if (qtyDebounceTimers.current[debounceKey]) {
      clearTimeout(qtyDebounceTimers.current[debounceKey]);
    }

    return new Promise<void>((resolve) => {
      qtyDebounceTimers.current[debounceKey] = setTimeout(async () => {
        delete qtyDebounceTimers.current[debounceKey];
        try {
          await cartData.updateQuantity(productId, newQuantity, variantId);
          // Optimistic update already reflects the change — no full refetch needed
          triggerUpdate();
        } catch (error) {
          console.error('Enhanced update quantity error:', error);
          // API failed — re-fetch server state to revert optimistic update
          cartData.fetchCartData(true);
        }
        resolve();
      }, 400);
    });
  }, [cartData, triggerUpdate]);

  // Enhanced remove function that notifies all components
  const enhancedRemoveItem = useCallback(async (productId: string, variantId?: string) => {
    // 1. OPTIMISTIC UPDATE FIRST
    cartData.optimisticRemoveItem(productId, variantId);

    try {
      const result = await cartData.removeItem(productId, variantId);
      // Re-fetch so shippingCalculations reflects the new cart total
      await cartData.fetchCartData(true);
      triggerUpdate();
      return result;
    } catch (error) {
      console.error('Enhanced remove item error:', error);
      // API failed — re-fetch server state to revert optimistic update
      cartData.fetchCartData(true);
      throw error;
    }
  }, [cartData, triggerUpdate]);

  // Enhanced fetch function that notifies all components
  const enhancedFetchCartData = useCallback(async (isRefresh?: boolean) => {
    try {
      const result = await cartData.fetchCartData(isRefresh);
      
      setTimeout(() => {
        triggerUpdate();
      }, 100);
      
      return result;
    } catch (error) {
      console.error('Enhanced fetch cart data error:', error);
      throw error;
    }
  }, [cartData.fetchCartData, triggerUpdate]);

  // Function to subscribe to cart updates
  const subscribeToUpdates = useCallback((callback: () => void) => {
    updateCallbacks.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      updateCallbacks.current.delete(callback);
    };
  }, []);

  // Enhanced clear cart function that triggers updates
  const enhancedClearCart = useCallback(() => {
    cartData.clearCart();
    triggerUpdate();
  }, [cartData.clearCart, triggerUpdate]);

  const contextValue: SharedCartContextType = {
    ...cartData,
    updateQuantity: enhancedUpdateQuantity,
    removeItem: enhancedRemoveItem,
    fetchCartData: enhancedFetchCartData,
    clearCart: enhancedClearCart,
    subscribeToUpdates,
    triggerUpdate,
    addToCart: enhancedAddToCart,
  };

  return (
    <EnhancedCartContext.Provider value={contextValue}>
      {children}
    </EnhancedCartContext.Provider>
  );
}

export function useSharedEnhancedCart() {
  const context = useContext(EnhancedCartContext);
  if (!context) {
    throw new Error('useSharedEnhancedCart must be used within an EnhancedCartProvider');
  }
  return context;
}