"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { X, ShoppingBag, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSingleProduct } from "@/hooks/useSingleProduct";

interface VariantPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string;
  mode?: 'cart' | 'wishlist'; // New prop to determine mode
  onAddToCart: (
    variantId: string,
    variantPrice: string,
    variantAttributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>
  ) => Promise<void>;
}

export default function VariantPickerModal({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  mode = 'cart', // Default to cart mode
  onAddToCart,
}: VariantPickerModalProps) {
  const { data: product, isLoading } = useSingleProduct(isOpen ? productId : undefined);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Auto-select first AVAILABLE variant (active + in stock); fall back to first if all unavailable
  useEffect(() => {
    if (product?.variants?.length) {
      const firstAvailable =
        product.variants.find(
          (v) => v.isActive !== false && (v.stock === undefined || v.stock > 0)
        ) ?? product.variants[0];
      if (firstAvailable?.attributes) {
        const defaults: Record<string, string> = {};
        Object.entries(firstAvailable.attributes).forEach(([k, v]) => { defaults[k] = v.value; });
        setSelectedAttrs(defaults);
      }
    } else if (isOpen) {
      setSelectedAttrs({});
    }
    setAdded(false);
  }, [product?.id, isOpen]);

  // Extract all unique attribute keys from active variants
  const attributeKeys = useMemo(() => {
    if (!product?.variants?.length) return [];
    const keys = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [product]);

  // For each attribute key, collect unique option values
  const attributeOptions = useMemo(() => {
    if (!product?.variants?.length) return {} as Record<string, { value: string; displayValue: string; hexColor?: string | null }[]>;
    const options: Record<string, { value: string; displayValue: string; hexColor?: string | null }[]> = {};
    attributeKeys.forEach((key) => {
      const seen = new Set<string>();
      const values: { value: string; displayValue: string; hexColor?: string | null }[] = [];
      product.variants!.forEach((v) => {
        const attr = v.attributes?.[key];
        if (attr && !seen.has(attr.value)) {
          seen.add(attr.value);
          values.push({ value: attr.value, displayValue: attr.displayValue, hexColor: attr.hexColor });
        }
      });
      options[key] = values;
    });
    return options;
  }, [product, attributeKeys]);

  // Find the matching variant for the current selections
  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length || Object.keys(selectedAttrs).length !== attributeKeys.length || attributeKeys.length === 0) return null;
    return (
      product.variants.find((v) => {
        if (!v.attributes) return false;
        return attributeKeys.every((key) => v.attributes![key]?.value === selectedAttrs[key]);
      }) || null
    );
  }, [product, selectedAttrs, attributeKeys]);

  // Check if a value for a given attribute key is available given other current selections
  const isValueAvailable = (key: string, val: string): boolean => {
    if (!product?.variants?.length) return false;
    return product.variants.some((v) => {
      if (v.attributes?.[key]?.value !== val) return false;
      if ((v.stock ?? 0) === 0 || v.isActive === false) return false;
      return Object.entries(selectedAttrs).every(([k, sv]) =>
        k === key || !sv || v.attributes?.[k]?.value === sv
      );
    });
  };

  const allSelected = attributeKeys.length > 0 && Object.keys(selectedAttrs).length === attributeKeys.length;

  const handleAttrSelect = (key: string, value: string) => {
    setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
    setAdded(false);
  };

  const isVariantUnavailable = selectedVariant != null &&
    (selectedVariant.isActive === false || (selectedVariant.stock !== undefined && selectedVariant.stock <= 0));

  const handleAdd = () => {
    if (!selectedVariant || isAdding || added) return;
    if (selectedVariant.isActive === false) return;
    if (selectedVariant.stock !== undefined && selectedVariant.stock <= 0) return;

    // 1. Fire the cart call immediately — no await, same optimistic pattern as product card
    onAddToCart(selectedVariant.id, selectedVariant.price || "0", selectedVariant.attributes).catch((e) => {
      console.error("Failed to add variant to cart:", e);
    });

    // 2. Transition UI to success after short delay regardless of API response
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => {
        onClose();
        setAdded(false);
        setSelectedAttrs({});
      }, 700);
    }, 500);
  };

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(price));

  const displayPrice = selectedVariant?.price
    ? formatPrice(selectedVariant.price)
    : product?.displayPrice || (product?.price ? formatPrice(product.price) : null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-100">

              {/* Header */}
              <div className="relative bg-[#5A1E12] px-5 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-base tracking-wide">Select Options</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Product Summary */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-stone-100 bg-[#EAD7B7]/25">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-50">
                  <Image
                    src={productImage || "/images/placeholder.png"}
                    alt={productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-stone-800 text-sm leading-tight line-clamp-2">{productName}</h4>
                  {displayPrice && (
                    <p className="text-[#973c00] font-bold text-xl mt-1">{displayPrice}</p>
                  )}
                  {selectedVariant && selectedVariant.stock !== undefined && (
                    <p
                      className={`text-xs mt-0.5 font-medium ${
                        selectedVariant.stock <= 0
                          ? "text-red-500"
                          : selectedVariant.stock < 5
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedVariant.stock <= 0
                        ? "Out of stock"
                        : selectedVariant.stock < 5
                        ? `Only ${selectedVariant.stock} left`
                        : "In stock"}
                    </p>
                  )}
                </div>
              </div>

              {/* Attribute Selectors */}
              <div className="px-5 py-4 space-y-5 max-h-72 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-[#5A1E12]" size={24} />
                  </div>
                ) : attributeKeys.length === 0 ? (
                  <p className="text-stone-500 text-sm text-center py-4">No variant options available.</p>
                ) : (
                  attributeKeys.map((key) => (
                    <div key={key}>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                        {key}
                        {selectedAttrs[key] && (
                          <span className="text-[#973c00] normal-case font-semibold tracking-normal text-xs">
                            — {attributeOptions[key]?.find((o) => o.value === selectedAttrs[key])?.displayValue}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {attributeOptions[key]?.map((option) => {
                          const isSelected = selectedAttrs[key] === option.value;
                          const available = isValueAvailable(key, option.value);

                          // Color swatch when hexColor is provided
                          if (option.hexColor) {
                            return (
                              <button
                                key={option.value}
                                onClick={() => available && handleAttrSelect(key, option.value)}
                                disabled={!available}
                                title={option.displayValue + (!available ? ' — Out of stock' : '')}
                                className={`relative w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                                  isSelected
                                    ? "border-[#5A1E12] scale-110 shadow-md ring-2 ring-[#5A1E12]/20"
                                    : available
                                    ? "border-stone-200 hover:border-[#5A1E12]/50 hover:scale-105"
                                    : "border-transparent opacity-30 cursor-not-allowed"
                                }`}
                                style={{ backgroundColor: option.hexColor }}
                              >
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <Check size={14} className="text-white drop-shadow" />
                                  </span>
                                )}
                                {!available && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <X size={12} className="text-white/70" />
                                  </span>
                                )}
                              </button>
                            );
                          }

                          // Chip for all other attribute types (size, etc.)
                          return (
                            <button
                              key={option.value}
                              onClick={() => available && handleAttrSelect(key, option.value)}
                              disabled={!available}
                              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                                isSelected
                                  ? "bg-[#5A1E12] text-white border-[#5A1E12] shadow-sm"
                                  : available
                                  ? "bg-white text-stone-700 border-stone-200 hover:border-[#5A1E12]/50 hover:bg-[#EAD7B7]/40"
                                  : "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed line-through"
                              }`}
                            >
                              {option.displayValue}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-4 border-t border-stone-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!allSelected || isAdding || added || isVariantUnavailable}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                    !allSelected
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                      : added
                      ? "bg-[#f8efe9] text-[#973c00] border border-[#973c00]/30"
                      : isVariantUnavailable
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-[#973c00] text-white hover:bg-[#7a3100] shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isAdding ? (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                      </motion.span>
                    ) : added ? (
                      <motion.span key="added" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                        <Check size={15} strokeWidth={3} />
                        Added
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                        <ShoppingBag size={15} />
                        {mode === 'wishlist' ? 'Add to Wishlist' : 'Add to Cart'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
