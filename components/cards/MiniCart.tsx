// app/components/MiniCart.tsx
"use client";

import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Loader, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useCartStock } from "@/hooks/useCartStock";

export default function MiniCart({ onClose }: { onClose: () => void }) {
  const {
    cartData,
    loading,
    calculateTotals,
    updateQuantity,
    removeItem,
    fetchCartData,
    subscribeToUpdates,
  } = useSharedEnhancedCart();
  
  // Stable sorted cart items to prevent shuffling
  const cartItems = useMemo(() => {
    const items = cartData?.cart || [];
    // Sort by productId to maintain stable order regardless of API response order
    return [...items].sort((a, b) => a.productId.localeCompare(b.productId));
  }, [cartData?.cart]);

  const cartProductIds = useMemo(() => cartItems.map((i) => i.productId), [cartItems]);
  const cartQuantities = useMemo(
    () => Object.fromEntries(cartItems.map((i) => [i.productId, i.quantity])),
    [cartItems]
  );
  const { stockMap } = useCartStock(cartProductIds, {
    cartQuantities,
    onOverstock: (productId, newStock) => handleQuantityUpdate(productId, newStock),
  });
  
  const { subtotal } = calculateTotals;
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({});
  const [activeQtyEditor, setActiveQtyEditor] = useState<string | null>(null);
  const qtyEditTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const applyingQtyKeysRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  const [syncTrigger, setSyncTrigger] = useState(0);

  // Subscribe to cart updates for real-time sync
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      // Force a re-render when cart updates from other components
      setSyncTrigger(prev => prev + 1);
      console.log('MiniCart synced with cart updates from other components');
    });

    return unsubscribe;
  }, [subscribeToUpdates]);

  // Optimized quantity update with loading state
  const handleQuantityUpdate = async (productId: string, newQuantity: number, variantId?: string | null) => {
    const itemKey = variantId ? `${productId}:${variantId}` : productId;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    try {
      await updateQuantity(productId, newQuantity, variantId ?? undefined);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Optimized remove with loading state
  const handleRemoveItem = async (productId: string, variantId?: string | null) => {
    const itemKey = variantId ? `${productId}:${variantId}` : productId;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    try {
      await removeItem(productId, variantId ?? undefined);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const getItemStock = (productId: string, fallbackStock?: number | null) => {
    const liveStock = stockMap[productId]?.stock;
    return liveStock !== undefined ? liveStock : fallbackStock;
  };

  const clearQtyEditTimeout = (itemKey: string) => {
    const timeoutId = qtyEditTimeoutsRef.current[itemKey];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete qtyEditTimeoutsRef.current[itemKey];
    }
  };

  const startQtyEdit = (itemKey: string, currentQuantity: number) => {
    if (updatingItems.has(itemKey)) return;
    setActiveQtyEditor(itemKey);
    setEditingQuantities((prev) => ({ ...prev, [itemKey]: String(currentQuantity) }));
  };

  const applyQtyEdit = async (item: (typeof cartItems)[number], overrideValue?: string) => {
    const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
    if (applyingQtyKeysRef.current.has(itemKey)) return;
    applyingQtyKeysRef.current.add(itemKey);
    clearQtyEditTimeout(itemKey);
    try {
      const rawValue = (overrideValue ?? editingQuantities[itemKey] ?? String(item.quantity)).trim();
      const parsed = Number.parseInt(rawValue, 10);

      const stock = getItemStock(item.productId, item.product.stock);
      const boundedValue = Number.isFinite(parsed)
        ? Math.max(1, stock != null ? Math.min(parsed, stock) : parsed)
        : item.quantity;

      if (boundedValue !== item.quantity) {
        await handleQuantityUpdate(item.productId, boundedValue, item.variantId);
      }

      setActiveQtyEditor(null);
      setEditingQuantities((prev) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    } finally {
      applyingQtyKeysRef.current.delete(itemKey);
    }
  };

  const scheduleQtyEditApply = (item: (typeof cartItems)[number], value: string) => {
    const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
    clearQtyEditTimeout(itemKey);
    qtyEditTimeoutsRef.current[itemKey] = setTimeout(() => {
      void applyQtyEdit(item, value);
    }, 2000);
  };

  useEffect(() => {
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  useEffect(() => {
    return () => {
      Object.values(qtyEditTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      qtyEditTimeoutsRef.current = {};
    };
  }, []);

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="h-dvh max-h-dvh w-full bg-white flex flex-col shadow-2xl overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-linear-to-r from-[#440C03] to-[#6F433A] px-4 md:px-6 py-3 md:py-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 text-white">
            <div className="p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl backdrop-blur-sm">
              <ShoppingBag size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold">Shopping Cart</h2>
              <p className="text-white/80 text-xs md:text-sm mt-0.5">
                {loading ? (
                  <span className="flex items-center gap-1">
                    <Loader className="h-3 w-3 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 md:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition touch-target-44"
            aria-label="Close cart"
          >
            <X size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 md:px-6 py-3 md:py-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#440C03] mx-auto">
                <Loader className="h-12 w-12" />
              </div>
              <p className="mt-4 text-gray-600">Loading cart...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8 max-w-xs">
              Discover amazing products and start adding them to your cart
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 md:px-8 py-3 md:py-3.5 bg-linear-to-r from-[#440C03] to-[#6F433A] text-white rounded-lg md:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm md:text-base touch-target-44"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 pb-4 md:pb-0">
            {cartItems.map((item) => {
              const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
              const isUpdating = updatingItems.has(itemKey);
              const effectivePrice = item.effectivePrice ?? parseFloat(item.product.price || '0');
              const variantAttrs = item.variant?.attributes
                ? Object.entries(item.variant.attributes)
                : null;
              return (
                <div
                  key={itemKey}
                  className={`group relative bg-white p-2 md:p-4 rounded-lg md:rounded-2xl border border-gray-200 hover:border-[#A48068] hover:shadow-md transition-all duration-200 ${
                    isUpdating ? 'opacity-70' : ''
                  }`}
                >
                  {isUpdating && (
                    <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center z-10">
                      <Loader className="h-5 w-5 animate-spin text-[#440C03]" />
                    </div>
                  )}
                  
                  <div className="flex gap-2 md:gap-3 overflow-x-hidden w-full items-center">
                    {/* IMAGE */}
                    <div 
                      className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 cursor-pointer group-hover:scale-[1.02] transition-transform"
                      onClick={() => navigate(`/shop/${item.product.title ? item.product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `product-${item.productId}`}`)}
                    >
                      <Image
                        src={item.product.featuredImage || item.product.images?.[0] || "/images/placeholder.svg"}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 56px, 64px"
                      />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3
                        className="font-semibold text-sm md:text-base text-gray-800 line-clamp-2 cursor-pointer hover:text-[#440C03] transition-colors mb-1 wrap-break-words max-w-full truncate"
                        style={{ maxWidth: '120px', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                        onClick={() => navigate(`/shop/${item.product.title ? item.product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `product-${item.productId}`}`)}
                      >
                        {item.product.title}
                      </h3>

                      <p className="text-[10px] md:text-xs text-gray-500 mb-1 md:mb-2 wrap-break-words max-w-full truncate" style={{ maxWidth: '120px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        ${effectivePrice.toFixed(2)} each • Stock: {item.product.stock}
                      </p>
                      {variantAttrs && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {variantAttrs.map(([key, attr]) =>
                            attr.hexColor ? (
                              <span
                                key={key}
                                title={`${key}: ${attr.displayValue}`}
                                className="flex items-center gap-1 text-[10px] font-semibold text-[#5A1E12] bg-[#EAD7B7]/60 border border-[#5A1E12]/15 rounded-full px-1.5 py-0.5"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: attr.hexColor }}
                                />
                                {attr.displayValue}
                              </span>
                            ) : (
                              <span
                                key={key}
                                className="text-[10px] font-semibold text-[#5A1E12] bg-[#EAD7B7]/60 border border-[#5A1E12]/15 rounded-full px-1.5 py-0.5"
                              >
                                {attr.displayValue}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {/* QTY CONTROLS */}
                      <div className="flex items-center justify-between gap-1 md:gap-2">
                        <div className="flex items-center bg-gray-100 rounded-lg md:rounded-xl overflow-hidden border border-gray-200">
                          <button
                            onClick={() =>
                              item.quantity <= 1
                                ? handleRemoveItem(item.productId, item.variantId)
                                : handleQuantityUpdate(item.productId, item.quantity - 1, item.variantId)
                            }
                            disabled={isUpdating}
                            className="px-2.5 py-1.5 md:px-2 md:py-1 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition touch-target-44"
                            aria-label={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
                          >
                            {item.quantity <= 1 ? (
                              <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                            ) : (
                              <Minus size={12} className="md:w-3.5 md:h-3.5" />
                            )}
                          </button>

                          {activeQtyEditor === itemKey ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={editingQuantities[itemKey] ?? String(item.quantity)}
                              onChange={(e) => {
                                const onlyDigits = e.target.value.replace(/\D/g, "");
                                setEditingQuantities((prev) => ({ ...prev, [itemKey]: onlyDigits }));
                                scheduleQtyEditApply(item, onlyDigits);
                              }}
                              onBlur={(e) => {
                                clearQtyEditTimeout(itemKey);
                                void applyQtyEdit(item, e.currentTarget.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  clearQtyEditTimeout(itemKey);
                                  void applyQtyEdit(item, (e.currentTarget as HTMLInputElement).value);
                                }
                                if (e.key === "Escape") {
                                  clearQtyEditTimeout(itemKey);
                                  setActiveQtyEditor(null);
                                  setEditingQuantities((prev) => {
                                    const next = { ...prev };
                                    delete next[itemKey];
                                    return next;
                                  });
                                }
                              }}
                              autoFocus
                              className="px-1 py-1.5 md:py-1 text-xs font-semibold w-10 md:w-9 text-center bg-white outline-none"
                              aria-label="Edit quantity"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => startQtyEdit(itemKey, item.quantity)}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 md:px-2 md:py-1 text-xs font-semibold min-w-8 text-center bg-white hover:bg-gray-50 transition disabled:opacity-40"
                              aria-label="Edit quantity"
                            >
                              {item.quantity}
                            </button>
                          )}

                          <button
                            onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1, item.variantId)}
                            disabled={(
                              (() => {
                                const stock = getItemStock(item.productId, item.product.stock);
                                return stock != null ? item.quantity >= stock : false;
                              })()
                            ) || isUpdating}
                            className="px-2.5 py-1.5 md:px-2 md:py-1 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition touch-target-44"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} className="md:w-3.5 md:h-3.5" />
                          </button>
                        </div>

                        <div className="text-right ml-1 md:ml-2">
                          <p className="font-bold text-sm md:text-base text-[#440C03]">
                            ${(effectivePrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => handleRemoveItem(item.productId, item.variantId)}
                    disabled={isUpdating}
                    className="absolute top-2 right-2 md:top-3 md:right-3 p-2 md:p-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50 touch-target-44"
                    aria-label="Remove item"
                  >
                    <X size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {cartItems.length > 0 && (
        <div className="shrink-0 border-t bg-white px-3 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4 safe-area-inset-bottom">
          {/* Updating indicator */}
          {updatingItems.size > 0 && (
            <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
              <Loader className="h-3 w-3 animate-spin" />
              Updating cart...
            </div>
          )}

          {/* Subtotal */}
          <div className="flex justify-between items-center py-2 md:py-3 border-t border-b border-gray-200">
            <span className="text-sm md:text-lg font-medium text-gray-700">Subtotal</span>
            <span className="text-lg md:text-2xl font-bold text-[#440C03]">
              ${loading ? "-.--" : subtotal.toFixed(2)}
            </span>
          </div>
          
          {/* Currency note */}
          <div className="text-[10px] md:text-xs text-gray-500 text-center">
            All prices are in AUD (Australian Dollars)
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3 md:gap-3 pb-2 md:pb-0">
            <button
              onClick={() => navigate("/cart")}
              className="border-2 border-gray-300 py-3 md:py-3 rounded-lg md:rounded-xl hover:bg-gray-50 hover:border-[#A48068] transition font-medium text-sm md:text-sm touch-target-44 min-h-12"
            >
              View Cart
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="border-2 border-gray-300 py-3 md:py-3 rounded-lg md:rounded-xl hover:bg-gray-50 hover:border-[#A48068] transition font-medium text-sm md:text-sm touch-target-44 min-h-12"
            >
              Keep Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function subscribeToUpdates(arg0: () => void) {
  throw new Error("Function not implemented.");
}
