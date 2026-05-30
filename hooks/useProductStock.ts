// hooks/useProductStock.ts
// Provides real-time stock data for a single product.
//
// Strategy (matches REALTIME_STOCK_BRIDGE.md §6):
//   1. On mount → call REST GET /api/products/:id/stock for an accurate snapshot.
//   2. Connect socket + emit `watch:product` to receive live `stock:update` events.
//   3. On unmount → emit `unwatch:product` and clean up the listener.
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { getSocket, StockUpdatePayload } from "@/lib/socket";

const API_BASE = "http://134.199.161.119:5000/api";

interface StockState {
  stock: number;
  isAvailable: boolean;
  /** true while the initial REST call is in-flight */
  isLoading: boolean;
}

interface SingleProductStockResponse {
  success: boolean;
  productId: string;
  stock: number;
  isAvailable: boolean;
  isActive: boolean;
}

/**
 * @param productId – pass `undefined` / empty string to skip (e.g. while the
 *                    parent component is still resolving the product).
 * @param initialStock – seed value from the already-fetched product so the UI
 *                       doesn't flicker before the REST snapshot arrives.
 */
export function useProductStock(
  productId: string | undefined,
  initialStock: number = 0
) {
  const [state, setState] = useState<StockState>({
    stock: initialStock,
    isAvailable: initialStock > 0,
    isLoading: !!productId,
  });

  // ── REST snapshot ────────────────────────────────────────────────────────
  const fetchSnapshot = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}/stock`);
      if (!res.ok) return;
      const data: SingleProductStockResponse = await res.json();
      if (data.success) {
        setState({
          stock: data.stock,
          isAvailable: data.isAvailable,
          isLoading: false,
        });
      }
    } catch {
      // Network failure — silently fall back to initial value
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ── Socket subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!productId || typeof window === "undefined") return;

    // Fetch REST snapshot first
    fetchSnapshot(productId);

    // Store for reconnect handler in socket singleton
    (window as any).__socketWatchingProductId = productId;

    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      return; // SSR guard
    }

    if (!socket.connected) socket.connect();
    socket.emit("watch:product", productId);

    const handleStockUpdate = (data: StockUpdatePayload) => {
      if (data.productId !== productId) return;

      setState((prev) => {
        // Show a toast only when availability *changes*
        if (prev.isAvailable && !data.isAvailable) {
          toast.error("⚠️ This product just went out of stock.");
        } else if (!prev.isAvailable && data.isAvailable) {
          toast.success("✅ Great news! This product is back in stock.");
        }
        return {
          stock: data.stock,
          isAvailable: data.isAvailable,
          isLoading: false,
        };
      });
    };

    socket.on("stock:update", handleStockUpdate);

    return () => {
      socket.emit("unwatch:product", productId);
      socket.off("stock:update", handleStockUpdate);
      (window as any).__socketWatchingProductId = undefined;
    };
  }, [productId, fetchSnapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync initialStock whenever the parent re-fetches the product (e.g. React
  // Query cache update) but only before the REST snapshot arrives.
  useEffect(() => {
    setState((prev) => {
      if (prev.isLoading) {
        return {
          stock: initialStock,
          isAvailable: initialStock > 0,
          isLoading: prev.isLoading,
        };
      }
      return prev;
    });
  }, [initialStock]);

  return state;
}
