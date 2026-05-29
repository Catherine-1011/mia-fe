"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { guestCartUtils } from "@/lib/guestCartUtils";

/* =======================
   TYPES
======================= */
export type CartItem = {
  cartId: string;
  id: string; // ✅ productId ONLY
  name: string;
  price: number;
  image: string;
  qty: number;
  stock?: number;
  slug?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => Promise<void>;
  updateQty: (productId: string, change: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  getItemQuantity: (productId: string) => number;
  isHydrated: boolean;
  fetchCartFromBackend: () => Promise<void>;
  /** Call this immediately after a successful login to reload the cart. */
  notifyLogin: (newToken: string) => Promise<void>;
};

/* =======================
   CONTEXT
======================= */
const CartContext = createContext<CartContextType | null>(null);
const baseUrl = "https://alpa-be.onrender.com";

/* =======================
   PROVIDER
======================= */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  /* ---------- FETCH CART FROM BACKEND ----------
   * Accepts an explicit token so it can be called before the `token`
   * state has had a chance to propagate (avoids stale-closure bugs).
   * ----------------------------------------------------------------- */
  const fetchCartFromBackend = async (overrideToken?: string) => {
    const t = overrideToken ?? token;
    if (!t) return;

    try {
      const res = await fetch(`${baseUrl}/api/cart/my-cart`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!res.ok) return;

      const data = await res.json();

      // 🔥 MAP BACKEND → FRONTEND SHAPE
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

      setCartItems(items);
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (err) {
      console.error("Fetch cart failed", err);
    }
  };

  /* ---------- INIT CART — runs ONCE on mount ----------
   * Reads localStorage immediately (guest or cached cart), then does a
   * single fetch if the user is already logged in. Never re-runs on
   * token state changes to avoid duplicate API calls.
   * ----------------------------------------------------------------- */
  useEffect(() => {
    // Hydrate from localStorage only — the EnhancedCartProvider is the
    // authoritative server-data fetcher. Making an independent API call here
    // duplicates the request on every page load (×2 with StrictMode).
    const storedToken = localStorage.getItem("alpa_token");
    if (storedToken) setToken(storedToken);

    const local = localStorage.getItem("cart");
    setCartItems(local ? JSON.parse(local) : []);
    setIsHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty: one hydration on load, then only on login

  /* ---------- SYNC LOCAL STORAGE ---------- */
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      // Persist the total count separately so the header can read it
      // immediately on next mount (survives logout + page reload).
      const count = cartItems.reduce((s, i) => s + i.qty, 0);
      localStorage.setItem("alpa_cart_count", String(count));
    }
  }, [cartItems, isHydrated]);

  // Debounce helpers for API sync
  const addToCartTimeout = useRef<NodeJS.Timeout | null>(null);
  const updateQtyTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // ADD TO CART: UI updates instantly, API sync is debounced
  const addToCart = async (item: Omit<CartItem, "qty">) => {
    setCartItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      return found
        ? prev.map((p) =>
            p.id === item.id ? { ...p, qty: p.qty + 1 } : p
          )
        : [...prev, { ...item, qty: 1, cartId: "" }];
    });

    if (token) {
      if (addToCartTimeout.current) clearTimeout(addToCartTimeout.current);
      addToCartTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(`${baseUrl}/api/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: item.id,
              quantity: 1,
            }),
          });
          if (!response.ok) {
            console.error("Failed to add item to cart:", response.statusText);
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      }, 2000); // 2 seconds debounce
    }
  };

  /* ---------- UPDATE QTY ---------- */
  const updateQty = async (productId: string, change: number) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    const newQty = item.qty + change;

    // UI update instantly
    setCartItems((prev) =>
      newQty <= 0
        ? prev.filter((i) => i.id !== productId)
        : prev.map((i) =>
            i.id === productId ? { ...i, qty: newQty } : i
          )
    );

    if (token) {
      // Debounce per product
      if (updateQtyTimeouts.current[productId]) {
        clearTimeout(updateQtyTimeouts.current[productId]);
      }
      updateQtyTimeouts.current[productId] = setTimeout(async () => {
        try {
          if (newQty <= 0) {
            const response = await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
              console.error("Failed to remove item from cart:", response.statusText);
            }
          } else {
            const response = await fetch(`${baseUrl}/api/cart/update`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productId,
                quantity: newQty,
              }),
            });
            if (!response.ok) {
              console.error("Failed to update cart:", response.statusText);
            }
          }
        } catch (error) {
          console.error("Error updating cart:", error);
        }
      }, 2000); // 2 seconds debounce
    }
  };

  /* ---------- REMOVE ---------- */
  const removeFromCart = async (productId: string) => {
    // Optimistic update first — remove locally regardless of auth state.
    setCartItems((prev) => prev.filter((i) => i.id !== productId));

    if (token) {
      try {
        const response = await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Failed to remove item from cart:", response.statusText);
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  /* ---------- CLEAR ---------- */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  /* ---------- NOTIFY LOGIN ----------
   * Called directly by login pages after a successful login.
   * The actual guest-cart ➜ server MERGE is handled exclusively by
   * useEnhancedCart.mergeGuestCartOnLogin (triggered via the alpa-login
   * custom event that AuthContext dispatches). We wait 2 s here so that
   * merge is guaranteed to finish before we read the server cart.
   * ------------------------------------------------------------------ */
  const notifyLogin = useCallback(async (newToken: string) => {
    // Persist the token so future operations (addToCart, updateQty …) work.
    setToken(newToken);

    // Give useEnhancedCart time to finish the guest-cart merge first.
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    // Fetch the (now merged) server cart into CartContext so the header
    // badge count is accurate. Use `newToken` directly because setToken is
    // async and the `token` closure still holds the old value at this point.
    try {
      const res = await fetch(`${baseUrl}/api/cart/my-cart`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });

      if (!res.ok) return;

      const data = await res.json();

      const items: CartItem[] = data.cart.map((item: any) => ({
        cartId: item.id || item.cartId || "",
        id: item.productId,
        name: item.product.title,
        price: Number(item.product.price),
        image: item.product.images?.[0] || "/images/placeholder.svg",
        qty: item.quantity,
        stock: item.product.stock,
        slug: item.product.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      }));

      localStorage.removeItem("cart");
      setCartItems(items);
    } catch (err) {
      console.error("notifyLogin cart fetch failed", err);
    }
  }, []);

  /* ---------- AUTH EVENT LISTENERS ----------
   * Only the alpa-logout event is handled here. The alpa-login event is
   * intentionally NOT handled in CartContext because login pages call
   * notifyLogin() directly — adding a second listener would cause a
   * double-merge race condition.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const onLogout = () => {
      // Clear cart items and localStorage — the user is signed out.
      guestCartUtils.clearGuestCart();
      setCartItems([]);
      setToken(null);
      localStorage.removeItem("cart");
    };

    window.addEventListener("alpa-logout", onLogout);
    return () => window.removeEventListener("alpa-logout", onLogout);
  }, []);

  /* ---------- HELPERS ---------- */
  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const itemCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const getItemQuantity = (productId: string) =>
    cartItems.find((i) => i.id === productId)?.qty || 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal,
        itemCount,
        getItemQuantity,
        isHydrated,
        fetchCartFromBackend,
        notifyLogin,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =======================
   HOOK
======================= */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
