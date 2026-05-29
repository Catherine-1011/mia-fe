"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { guestCartUtils, getShippingMethods } from '@/lib/guestCartUtils';

// Custom event types dispatched by AuthContext
declare global {
  interface WindowEventMap {
    'alpa-login': CustomEvent<{ token: string }>;
    'alpa-logout': CustomEvent<undefined>;
  }
}

export interface CartProduct {
  featuredImage?: string;
  id: string;
  title: string;
  price: string;
  images?: string[];
  galleryImages?: string[];
  image?: string; // Sometimes API returns single image field
  stock: number;
  category: string;
}

export interface CartVariant {
  id: string;
  price?: string;
  stock?: number;
  sku?: string;
  images?: string[];
  attributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>;
}

export interface CartItem {
  qty: any;
  id: any;
  productId: string;
  quantity: number;
  product: CartProduct;
  variantId?: string | null;
  variant?: CartVariant | null;
  effectivePrice?: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: string;
  estimatedDays: string;
}

export interface GST {
  id: string;
  name: string;
  percentage: string;
  description: string;
}

export interface CartCalculations {
  subtotal: string;
  shippingCost: string;
  gstPercentage: string;
  gstAmount: string;
  grandTotal: string;
  selectedShipping: ShippingOption | null;
  gstDetails: {
    id: string;
    name: string;
    percentage: string;
    description: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/** Pre-computed totals the backend returns per shipping method */
export interface ShippingCalculation {
  shippingMethodId: string;
  baseShippingCost: number;
  sellerCount: number;
  totalShippingCost: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
}

export interface EnhancedCartData {
  success: boolean;
  cart: CartItem[];
  availableShipping: ShippingOption[];
  gst: GST;
  calculations: CartCalculations;
  /** Keyed by shipping method id — backend pre-computes totals per option */
  shippingCalculations?: Record<string, ShippingCalculation>;
}

export function useEnhancedCart() {
  const [cartData, setCartData] = useState<EnhancedCartData | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track current selection for async operations like setInterval
  const selectedShippingRef = useRef<ShippingOption | null>(null);
  // Ref to access latest cartData inside async fetchCartData without stale closure
  const cartDataRef = useRef<EnhancedCartData | null>(null);

  const baseUrl = "https://alpa-be.onrender.com";

  // Keep cartDataRef in sync so fetchCartData can access latest variant attributes
  useEffect(() => {
    cartDataRef.current = cartData;
  }, [cartData]);

  // Sync ref with state whenever selectedShipping changes
  useEffect(() => {
    selectedShippingRef.current = selectedShipping;
  }, [selectedShipping]);

  const fetchCartData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const token = localStorage.getItem("alpa_token");
      const currentSelectedShipping = selectedShippingRef.current; // Use ref to get latest value

      // Guest mode: load cart from localStorage
      if (!token) {
        const guestItems = guestCartUtils.getGuestCart();
        const { subtotal } = guestCartUtils.calculateGuestCartTotals(guestItems);
        
        // Map guest items to CartItem format
        const cartItems: CartItem[] = guestItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          qty: item.quantity, // Legacy field
          id: item.productId, // Legacy field
          product: item.product,
          ...(item.variantId && { variantId: item.variantId }),
          ...(item.variant && { variant: item.variant }),
        }));
        
        // Fetch real shipping methods from backend
        const availableShipping = await getShippingMethods();

        // ── Build shippingCalculations for guest (only for selected method) ──
        const guestItemsPayload = cartItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          ...(i.variantId && { variantId: i.variantId }),
        }));
        
        const nonCodOptions = availableShipping.filter(
          s => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)
        );
        let shippingCalculations: Record<string, ShippingCalculation> = {};
        
        if (nonCodOptions.length > 0 && cartItems.length > 0) {
          try {
            await Promise.all(nonCodOptions.map(async (shipping) => {
              const res = await fetch('https://alpa-be.onrender.com/api/cart/calculate-guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: guestItemsPayload, shippingMethodId: shipping.id }),
              });
              if (res.ok) {
                const data = await res.json();
                const c = data.calculations || {};
                const sc = data.shippingCalculations?.[shipping.id] || {};
                shippingCalculations[shipping.id] = {
                  shippingMethodId: shipping.id,
                  baseShippingCost: Number(sc.baseShippingCost ?? c.shippingCost ?? parseFloat(shipping.cost || '0')),
                  sellerCount: Number(sc.sellerCount ?? c.sellerCount ?? 1),
                  totalShippingCost: Number(sc.totalShippingCost ?? c.totalShippingCost ?? c.shippingCost ?? parseFloat(shipping.cost || '0')),
                  subtotal: Number(sc.subtotal ?? c.subtotal ?? subtotal),
                  gstAmount: Number(sc.gstAmount ?? c.gstAmount ?? 0),
                  grandTotal: Number(sc.grandTotal ?? c.grandTotal ?? subtotal),
                };
              }
            }));
          } catch (e) {
            console.error("Guest shipping calc failed:", e);
          }
        }

        // Create guest cart data structure
        const guestCartData: EnhancedCartData = {
          success: true,
          cart: cartItems,
          availableShipping: availableShipping,
          shippingCalculations: Object.keys(shippingCalculations).length > 0 ? shippingCalculations : undefined,
          gst: {
            id: 'default_gst',
            name: 'GST',
            percentage: '10',
            description: 'Goods and Services Tax',
          },
          calculations: {
            subtotal: subtotal.toString(),
            shippingCost: '0',
            gstPercentage: '10',
            gstAmount: '0',
            grandTotal: subtotal.toString(),
            selectedShipping: null,
            gstDetails: {
              id: '1',
              name: 'GST',
              percentage: '10',
              description: 'Goods and Services Tax',
              isActive: true,
              isDefault: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
        
        setCartData(guestCartData);
        
        // Set default shipping (exclude COD)
        if (!currentSelectedShipping && guestCartData.availableShipping.length > 0) {
          const nonCodOptions = guestCartData.availableShipping.filter(
            s => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)
          );
          setSelectedShipping((nonCodOptions[0] ?? guestCartData.availableShipping[0]));
        }
        
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Authenticated mode: fetch from API
      const response = await fetch(`${baseUrl}/api/cart/my-cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Token expired / invalid — log out and redirect home
        if (response.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("alpa_token");
          window.location.href = "/";
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // ── Normalise variant attributes: the backend may return them under several
      // different key shapes. Unify everything to item.variant.attributes so the
      // rest of the UI only needs to look in one place. ──

      // Helper: convert array-format [{name, value, displayValue, hexColor}] → Record<name, ...>
      const normalizeAttrs = (raw: any): Record<string, { value: string; displayValue: string; hexColor?: string | null }> | null => {
        if (!raw) return null;
        if (Array.isArray(raw)) {
          if (raw.length === 0) return null;
          return raw.reduce((acc: Record<string, any>, attr: any, i: number) => {
            const key = attr.name || attr.attributeName || attr.type || attr.key || String(i);
            acc[key] = {
              value: attr.value ?? attr.displayValue ?? String(i),
              displayValue: attr.displayValue || attr.value || String(i),
              hexColor: attr.hexColor ?? null,
            };
            return acc;
          }, {});
        }
        return raw;
      };

      const normalizeItem = (item: any): CartItem => {
        if (!item.variantId) return item as CartItem;

        // Collect attributes from wherever the backend put them
        const attrs = normalizeAttrs(
          item.variant?.attributes ||          // standard shape
          item.selectedAttributes ||           // alternate key
          item.variantAttributes ||            // another alternate key
          item.variant?.selectedAttributes ||  // nested alternate
          null
        );

        if (attrs && Object.keys(attrs).length > 0) {
          return {
            ...item,
            variant: {
              ...(item.variant || { id: item.variantId }),
              attributes: attrs,
            },
          } as CartItem;
        }
        return item as CartItem;
      };

      const data: EnhancedCartData = {
        ...rawData,
        cart: (rawData.cart || []).map(normalizeItem),
        availableShipping: rawData.availableShipping && rawData.availableShipping.length > 0 ? rawData.availableShipping : (cartDataRef.current?.availableShipping || []),
        gst: rawData.gst || cartDataRef.current?.gst,
      };

      // ── Fallback merge: if server still returned no attributes, pull from
      // the previous in-memory state (set by the optimistic add). ──
      const prevCart = cartDataRef.current;
      if (prevCart) {
        data.cart = data.cart.map((item) => {
          if (!item.variantId) return item;
          if (item.variant?.attributes && Object.keys(item.variant.attributes).length > 0) return item;
          const prev = prevCart.cart.find(
            (p) => p.productId === item.productId && p.variantId === item.variantId
          );
          if (prev?.variant?.attributes) {
            return {
              ...item,
              variant: {
                ...(item.variant || { id: item.variantId }),
                attributes: prev.variant.attributes,
              },
            };
          }
          return item;
        });
      }

      setCartData(data);
      
      // Set shipping method priority:
      // 1. Currently selected in UI (ref)
      // 2. Saved in backend (data.calculations.selectedShipping)
      // 3. Default "General" shipping
      
      if (!currentSelectedShipping) {
        if (data.calculations?.selectedShipping) {
           setSelectedShipping(data.calculations.selectedShipping);
        } else if (data.availableShipping?.length > 0) {
           const nonCodOptions = data.availableShipping.filter(
             s => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)
           );
           const generalShipping = nonCodOptions.find(
             ship => ship.name.toLowerCase().includes('general')
           ) || nonCodOptions[0] || data.availableShipping[0];
           setSelectedShipping(generalShipping);
        }
      }

      // ── Re-calculate shipping for ALL available methods to reduce backend load and UI popping ──
      const nonCodOptions = (data.availableShipping || []).filter(
        s => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)
      );
      
      if (nonCodOptions.length > 0 && data.cart.length > 0) {
        const itemsPayload = data.cart.map((i: CartItem) => ({
          productId: i.productId,
          quantity: i.quantity,
          ...(i.variantId && { variantId: i.variantId }),
        }));
        
        try {
          const calcMap: Record<string, ShippingCalculation> = {};
          
          await Promise.all(nonCodOptions.map(async (shipping) => {
            const res = await fetch(`${baseUrl}/api/cart/calculate-guest`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: itemsPayload, shippingMethodId: shipping.id }),
            });
            if (res.ok) {
              const json = await res.json();
              const c = json.calculations || {};
              const sc = json.shippingCalculations?.[shipping.id] || {};
              
              calcMap[shipping.id] = {
                shippingMethodId: shipping.id,
                baseShippingCost: Number(sc.baseShippingCost ?? c.shippingCost ?? parseFloat(shipping.cost || '0')),
                sellerCount: Number(sc.sellerCount ?? c.sellerCount ?? 1),
                totalShippingCost: Number(sc.totalShippingCost ?? c.totalShippingCost ?? c.shippingCost ?? parseFloat(shipping.cost || '0')),
                subtotal: Number(sc.subtotal ?? c.subtotal ?? 0),
                gstAmount: Number(sc.gstAmount ?? c.gstAmount ?? 0),
                grandTotal: Number(sc.grandTotal ?? c.grandTotal ?? 0),
              };
            }
          }));
          
          setCartData((prev) => prev ? { ...prev, shippingCalculations: calcMap } : prev);
        } catch (e) {
          console.error("Failed to calculate shipping for methods:", e);
        }
      } else if (data.cart.length === 0) {
        setCartData((prev) => prev ? { ...prev, shippingCalculations: {} } : prev);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cart data");
      console.error("Error fetching cart data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Calculate real-time totals — prefer backend shippingCalculations when available
  const calculateTotals = () => {
    let currentShipping = selectedShipping;
    if (!currentShipping && cartData?.calculations?.selectedShipping) {
      currentShipping = cartData.calculations.selectedShipping;
    }

    if (!cartData) {
      return {
        subtotal: 0,
        shippingCost: 0,
        gstAmount: 0,
        grandTotal: 0,
        gstPercentage: 10,
      };
    }

    // ── Always compute local subtotal as a safe fallback ──
    const localSubtotal = cartData.cart.reduce(
      (sum, item) => sum + (item.effectivePrice ?? parseFloat(item.product.price || '0')) * item.quantity,
      0
    );

    // ── Use backend pre-computed values when shippingCalculations is present ──
    if (currentShipping && cartData.shippingCalculations) {
      const calc = cartData.shippingCalculations[currentShipping.id];
      if (calc) {
        // Always recompute subtotal from live cart items (handles optimistic qty updates).
        // Only trust the backend for shippingCost — it correctly multiplies by seller count.
        const subtotal = localSubtotal;
        const shippingCost = !isNaN(Number(calc.totalShippingCost)) ? Number(calc.totalShippingCost) : (currentShipping ? parseFloat(currentShipping.cost || '0') : 0);
        const gstPercentage = cartData.gst?.percentage ? parseFloat(cartData.gst.percentage) : 10;
        const grandTotal = subtotal + shippingCost;
        const gstAmount = subtotal / 11;

        return { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage };
      }
    }

    // ── Fallback: compute locally (guest mode / no shippingCalculations) ──
    const subtotal = localSubtotal;
    const shippingCost = subtotal > 0 ? (currentShipping ? parseFloat(currentShipping.cost || '0') : 0) : 0;
    const gstPercentage = cartData.gst?.percentage ? parseFloat(cartData.gst.percentage) : 10;
    const grandTotal = subtotal + shippingCost;
    const gstAmount = subtotal / 11;

    return {
      subtotal,
      shippingCost,
      gstAmount,
      grandTotal,
      gstPercentage,
    };
  };

  // Update quantity
  const updateQuantity = async (productId: string, newQuantity: number, variantId?: string) => {
    try {
      const token = localStorage.getItem("alpa_token");
      
      // Guest mode: update in localStorage
      if (!token) {
        guestCartUtils.updateGuestCartItem(productId, newQuantity, variantId);
        await fetchCartData(true);
        return;
      }

      // Authenticated mode: update via API
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        const response = await fetch(`${baseUrl}/api/cart/remove/${productId}${variantId ? `?variantId=${variantId}` : ''}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to remove item");
      } else {
        // Update quantity
        const response = await fetch(`${baseUrl}/api/cart/update`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity: newQuantity,
            ...(variantId && { variantId }),
          }),
        });

        if (!response.ok) throw new Error("Failed to update quantity");
      }
      // Optimistic update already applied — no re-fetch on success.
      // The caller (useSharedEnhancedCart) will revert via fetchCartData on error.
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err instanceof Error ? err.message : "Failed to update quantity");
      throw err; // propagate so caller can revert optimistic state
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string, variantId?: string) => {
    try {
      const token = localStorage.getItem("alpa_token");
      
      // Guest mode: remove from localStorage
      if (!token) {
        guestCartUtils.removeFromGuestCart(productId, variantId);
        await fetchCartData(true);
        return;
      }

      // Authenticated mode: remove via API
      const response = await fetch(`${baseUrl}/api/cart/remove/${productId}${variantId ? `?variantId=${variantId}` : ''}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to remove item");
      // Optimistic update already applied — no re-fetch on success.
    } catch (err) {
      console.error("Error removing item:", err);
      setError(err instanceof Error ? err.message : "Failed to remove item");
      throw err; // propagate so caller can revert optimistic state
    }
  };

  useEffect(() => {
    fetchCartData();
    // No polling interval — cart data is refreshed after every user action
    // (add, update, remove). Polling was causing redundant API calls.
  }, []);

  // ── GUEST CART MERGE ON LOGIN ─────────────────────────────────────────────
  // When the user logs in, merge any existing guest cart items into their
  // account on the backend, then reload the merged cart. Clears localStorage
  // guest_cart_items after a successful merge.
  const mergeGuestCartOnLogin = useCallback(async (token: string) => {
    const guestItems = guestCartUtils.getGuestCart();

    if (guestItems.length > 0) {
      // Fire all add-to-cart calls in parallel (best-effort; failures are silent)
      await Promise.allSettled(
        guestItems.map((item) =>
          fetch(`${baseUrl}/api/cart/add`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity,
            }),
          })
        )
      );

      // Clear guest cart — items are now on the server
      guestCartUtils.clearGuestCart();
    }

    // Reload the (now merged) server cart
    await fetchCartData(true);
  }, [fetchCartData]);

  // ── CLEAR CART ON LOGOUT ──────────────────────────────────────────────────
  // When the user logs out, clear local guest cart data and re-fetch so the
  // cart page shows an empty state immediately (no stale account items).
  const handleLogout = useCallback(async () => {
    guestCartUtils.clearGuestCart();
    // fetchCartData with no token returns empty guest cart automatically
    await fetchCartData(true);
  }, [fetchCartData]);

  // Listen for auth events dispatched by AuthContext (same-tab)
  useEffect(() => {
    const onLogin = (e: CustomEvent<{ token: string }>) => {
      if (e.detail?.token) mergeGuestCartOnLogin(e.detail.token);
    };
    const onLogout = () => handleLogout();

    window.addEventListener('alpa-login', onLogin);
    window.addEventListener('alpa-logout', onLogout);

    return () => {
      window.removeEventListener('alpa-login', onLogin);
      window.removeEventListener('alpa-logout', onLogout);
    };
  }, [mergeGuestCartOnLogin, handleLogout]);

  // Refetch when shipping changes to get updated calculations for the newly selected method
  useEffect(() => {
    if (selectedShipping && cartData && cartData.cart.length > 0) {
      // If we don't already have the calculation for this method, fetch it
      if (!cartData.shippingCalculations?.[selectedShipping.id]) {
        const fetchMissingShipping = async () => {
          setRefreshing(true);
          try {
            const itemsPayload = cartDataRef.current?.cart.map((i: CartItem) => ({
              productId: i.productId,
              quantity: i.quantity,
              ...(i.variantId && { variantId: i.variantId }),
            })) || [];
            
            const res = await fetch(`${baseUrl}/api/cart/calculate-guest`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: itemsPayload, shippingMethodId: selectedShipping.id }),
            });
            
            if (res.ok) {
              const data = await res.json();
              const c = data.calculations || {};
              const sc = data.shippingCalculations?.[selectedShipping.id] || {};
              
              setCartData((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  shippingCalculations: {
                    ...(prev.shippingCalculations || {}),
                    [selectedShipping.id]: {
                      shippingMethodId: selectedShipping.id,
                      baseShippingCost: Number(sc.baseShippingCost ?? c.shippingCost ?? 0),
                      sellerCount: Number(sc.sellerCount ?? c.sellerCount ?? 1),
                      totalShippingCost: Number(sc.totalShippingCost ?? c.totalShippingCost ?? c.shippingCost ?? 0),
                      subtotal: Number(sc.subtotal ?? c.subtotal ?? 0),
                      gstAmount: Number(sc.gstAmount ?? c.gstAmount ?? 0),
                      grandTotal: Number(sc.grandTotal ?? c.grandTotal ?? 0),
                    }
                  }
                };
              });
            }
          } catch (e) {
            console.error("Failed to fetch changed shipping calculation:", e);
          } finally {
            setRefreshing(false);
          }
        };
        fetchMissingShipping();
      }
    }
  }, [selectedShipping]);

  // OPTIMISTIC UPDATES
  const optimisticAddItem = (
    newItem: CartProduct,
    quantity: number,
    variantId?: string,
    variantAttributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>
  ) => {
    setCartData(prev => {
      if (!prev) return prev;
      
      const existingItemIndex = prev.cart.findIndex(item =>
        item.productId === newItem.id && (!variantId || item.variantId === variantId)
      );
      
      let newCart = [...prev.cart];
      if (existingItemIndex >= 0) {
        // Update existing
        const existing = newCart[existingItemIndex];
        const newQty = (existing.quantity || 0) + quantity;
        newCart[existingItemIndex] = {
          ...existing,
          quantity: newQty,
          qty: newQty
        };
      } else {
        // Add new
        newCart.push({
          id: newItem.id,
          productId: newItem.id,
          quantity: quantity,
          qty: quantity,
          product: newItem,
          ...(variantId && { variantId }),
          ...(variantId && variantAttributes && {
            variant: { id: variantId, attributes: variantAttributes },
          }),
        });
      }
      
      return {
        ...prev,
        cart: newCart
      };
    });
  };

  const optimisticUpdateItem = (productId: string, quantity: number, variantId?: string) => {
    setCartData(prev => {
      if (!prev) return prev;
      
      const newCart = prev.cart.map(item => {
        if (item.productId === productId && (!variantId || item.variantId === variantId)) {
          return {
            ...item,
            quantity: quantity,
            qty: quantity
          };
        }
        return item;
      });

      return {
        ...prev,
        cart: newCart
      };
    });
  };

  const optimisticRemoveItem = (productId: string, variantId?: string) => {
    setCartData(prev => {
      if (!prev) return prev;
      const newCart = prev.cart.filter(item =>
        !(item.productId === productId && (!variantId || item.variantId === variantId))
      );
      return {
        ...prev,
        cart: newCart
      };
    });
  };

  const clearCart = () => {
    setCartData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cart: []
      };
    });
  };

  return {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading,
    refreshing,
    error,
    fetchCartData,
    calculateTotals: calculateTotals(),
    updateQuantity,
    removeItem,
    clearCart,
    optimisticAddItem,
    optimisticUpdateItem,
    optimisticRemoveItem
  };
}