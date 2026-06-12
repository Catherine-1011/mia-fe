"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { getSocket, StockUpdatePayload } from "@/lib/socket";

const API_BASE = "https://backend.madeinarnhemland.com.au/api";

export interface StockEntry {
  stock: number;
  isAvailable: boolean;
  isActive: boolean;
}

export type StockMap = Record<string, StockEntry>;

interface BulkStockResponse {
  success: boolean;
  stock: Record<
    string,
    { productId: string; stock: number; isAvailable: boolean; isActive: boolean }
  >;
}

/**
 * @param productIds    – list of product IDs currently in the cart; pass an empty
 *                        array before the cart has loaded.
 * @param options.cartQuantities  – map of productId → current qty in cart so the
 *                        hook can detect when a live stock drop makes a cart qty
 *                        invalid (qty > newStock).
 * @param options.onOverstock     – called with (productId, newStock) whenever a
 *                        real-time stock update makes the cart qty exceed available
 *                        stock.  The caller should cap the qty to newStock.
 */
export function useCartStock(
  productIds: string[],
  options?: {
    cartQuantities?: Record<string, number>;
    onOverstock?: (productId: string, newStock: number) => void;
  }
) {
  const cartQuantitiesRef = useRef(options?.cartQuantities ?? {});
  const onOverstockRef    = useRef(options?.onOverstock);
  const snapshotDebounce  = useRef<NodeJS.Timeout | null>(null);

  // Keep refs up-to-date every render without re-running the socket effect
  useEffect(() => { cartQuantitiesRef.current = options?.cartQuantities ?? {}; });
  useEffect(() => { onOverstockRef.current = options?.onOverstock; });
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [isLoading, setIsLoading] = useState(false);

  // ── Bulk REST snapshot ───────────────────────────────────────────────────
  const fetchBulkSnapshot = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/bulk-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: ids }),
      });
      if (!res.ok) return;
      const data: BulkStockResponse = await res.json();
      if (data.success && data.stock) {
        const map: StockMap = {};
        for (const [id, entry] of Object.entries(data.stock)) {
          map[id] = {
            stock: entry.stock,
            isAvailable: entry.isAvailable,
            isActive: entry.isActive,
          };

          // Overstock check on initial snapshot
          const cartQty = cartQuantitiesRef.current[id];
          if (
            entry.isAvailable &&
            typeof cartQty === "number" &&
            cartQty > entry.stock &&
            entry.stock >= 0
          ) {
            setTimeout(() => {
              onOverstockRef.current?.(id, entry.stock);
            }, 0);
          }
        }
        setStockMap(map);
      }
    } catch {
      // Network failure — silently fall back; socket will still provide updates
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Socket subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!productIds.length || typeof window === "undefined") return;

    // Debounced bulk REST snapshot — avoids a flood of calls during rapid cart changes
    if (snapshotDebounce.current) clearTimeout(snapshotDebounce.current);
    snapshotDebounce.current = setTimeout(() => fetchBulkSnapshot(productIds), 350);

    // Store for reconnect handler in socket singleton
    (window as any).__socketCartProductIds = productIds;

    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      return; // SSR guard
    }

    if (!socket.connected) socket.connect();
    socket.emit("watch:cart", productIds);

    const handleStockUpdate = (data: StockUpdatePayload) => {
      if (!productIds.includes(data.productId)) return;

      setStockMap((prev) => {
        const prevEntry = prev[data.productId];
        // Notify user only when availability *changes*
        if (prevEntry?.isAvailable && !data.isAvailable) {
          toast.error(`⚠️ An item in your cart just went out of stock.`);
        } else if (prevEntry && !prevEntry.isAvailable && data.isAvailable) {
          toast.success(`✅ An item in your cart is back in stock.`);
        }

        // ── Overstock check ──────────────────────────────────────────────
        // If the new live stock is lower than what the user has in their cart,
        // fire the onOverstock callback so the caller can cap the qty.
        const cartQty = cartQuantitiesRef.current[data.productId];
        if (
          data.isAvailable &&
          typeof cartQty === "number" &&
          cartQty > data.stock &&
          data.stock >= 0
        ) {
          // Schedule outside of the setState callback to avoid nested state updates
          setTimeout(() => {
            onOverstockRef.current?.(data.productId, data.stock);
          }, 0);
        }

        return {
          ...prev,
          [data.productId]: {
            stock: data.stock,
            isAvailable: data.isAvailable,
            isActive: data.isAvailable, // treat same as isAvailable for display
          },
        };
      });
    };

    socket.on("stock:update", handleStockUpdate);

    return () => {
      socket.off("stock:update", handleStockUpdate);
      (window as any).__socketCartProductIds = undefined;
    };
  }, [productIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive checkout eligibility
  const canCheckout =
    productIds.length > 0 &&
    productIds.every((id) => stockMap[id]?.isAvailable !== false);

  return { stockMap, isLoading, canCheckout };
}
