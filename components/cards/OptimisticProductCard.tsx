// app/components/cards/OptimisticProductCard.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Loader2, Check, ShoppingBag, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useToggleWishlist } from "@/hooks/useWishlistMutations";
import { useWishlistQuery } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import VariantPickerModal from "@/components/cards/VariantPickerModal";
import { useSingleProduct } from "@/hooks/useSingleProduct";

// --- COLOR NAME MAP ---
const COLOR_NAME_TO_HEX: Record<string, string> = {
  red: '#EF4444', blue: '#3B82F6', green: '#22C55E', yellow: '#EAB308',
  orange: '#F97316', purple: '#A855F7', pink: '#EC4899', black: '#1C1917',
  white: '#E7E5E4', gray: '#78716C', grey: '#78716C', brown: '#92400E',
  beige: '#F5E6D0', navy: '#1E3A5F', teal: '#14B8A6', cyan: '#06B6D4',
  magenta: '#D946EF', maroon: '#7F1D1D', olive: '#65740F', coral: '#F87171',
  gold: '#F59E0B', silver: '#A1A1AA', cream: '#FFF8ED', mint: '#6EE7B7',
  lavender: '#C4B5FD', rose: '#FB7185', turquoise: '#2DD4BF', indigo: '#6366F1',
  violet: '#7C3AED', lime: '#A3E635', tan: '#D4B896', ivory: '#FFFFF0',
};
const getColorHex = (name: string): string | null =>
  COLOR_NAME_TO_HEX[name.toLowerCase().trim()] ?? null;

// --- INTERFACE DEFINITION (Fixes the TS Error) ---
export interface OptimisticProductCardProps {
  id: string;
  photo: string;
  name: string; 
  description: string;
  amount: number;
  displayPrice?: string;
  stock?: number;
  slug?: string;
  rating?: number;
  tags?: string[];
  featured?: boolean;
  artistName?: string;
  productType?: string;
}

export default function OptimisticProductCard({
  id,
  photo,
  name,
  description,
  amount,
  displayPrice,
  stock = 50,
  slug,
  rating = 0,
  tags = [],
  featured = false,
  artistName,
  productType,
}: OptimisticProductCardProps) {
  const isVariableProduct = productType === 'VARIABLE';
  // --- HOOKS & LOGIC ---
  const { 
    cartData,
    addToCart,
    subscribeToUpdates
  } = useSharedEnhancedCart();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);
  const [optimisticAdded, setOptimisticAdded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showWishlistVariantModal, setShowWishlistVariantModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { token, user: authUser } = useAuth();
  const { data: wishlistData } = useWishlistQuery();
  const toggleWishlistMutation = useToggleWishlist();
  
  // Check if user is authenticated (either token or user object exists)
  const isAuthenticated = !!(token || authUser);

  // Always call the hook with id to maintain consistent hook order
  // React Query will handle caching efficiently, and we control data usage below
  const { data: variantProduct } = useSingleProduct(id);

  const variantColors = useMemo(() => {
    // Only show variant colors when hovered and it's a variable product
    if (!isHovered || !isVariableProduct || !variantProduct?.variants?.length) return [];
    const seen = new Set<string>();
    const colors: { label: string; hex: string }[] = [];
    variantProduct.variants.forEach((v) => {
      if (!v.attributes) return;
      Object.entries(v.attributes).forEach(([key, attr]) => {
        // Use hex from API if available
        if (attr.hexColor) {
          if (!seen.has(attr.hexColor)) {
            seen.add(attr.hexColor);
            colors.push({ label: attr.displayValue, hex: attr.hexColor });
          }
          return;
        }
        // No hex but attribute key or value maps to a known color name
        const isColorKey = key.toLowerCase().includes('color');
        const mappedHex = getColorHex(attr.displayValue);
        if ((isColorKey || mappedHex) && mappedHex) {
          if (!seen.has(mappedHex)) {
            seen.add(mappedHex);
            colors.push({ label: attr.displayValue, hex: mappedHex });
          }
        } else if (isColorKey && !mappedHex && !seen.has(attr.value)) {
          // Unknown color name — neutral fallback swatch
          seen.add(attr.value);
          colors.push({ label: attr.displayValue, hex: '#CBD5E1' });
        }
      });
    });
    return colors;
  }, [variantProduct, isHovered, isVariableProduct]);

  const variantSizes = useMemo(() => {
    // Only show variant sizes when hovered and it's a variable product
    if (!isHovered || !isVariableProduct || !variantProduct?.variants?.length) return [];
    const seen = new Set<string>();
    const sizes: string[] = [];
    variantProduct.variants.forEach((v) => {
      if (!v.attributes) return;
      Object.entries(v.attributes).forEach(([key, attr]) => {
        // Skip anything that is a color attribute
        if (attr.hexColor) return;
        if (key.toLowerCase().includes('color')) return;
        if (getColorHex(attr.displayValue)) return;
        if (!seen.has(attr.value)) {
          seen.add(attr.value);
          sizes.push(attr.displayValue);
        }
      });
    });
    return sizes;
  }, [variantProduct, isHovered, isVariableProduct]);

  // Subscribe to cart updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      setSyncTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, [subscribeToUpdates]);

  // Derived State
  const currentCartItem = useMemo(() => {
    return cartData?.cart.find(item => item.productId === id);
  }, [cartData, id, syncTrigger]);

  const qty = currentCartItem?.quantity || 0;
  const remainingStock = Math.max(0, (stock || 0) - qty);
  const isInCart = optimisticAdded || (qty > 0);

  // For variable products, check if at least one variant is active and has stock
  const hasAvailableVariants = useMemo(() => {
    if (!isVariableProduct) return true;
    if (!variantProduct?.variants?.length) return (stock ?? 0) > 0;
    return variantProduct.variants.some(
      (v) => v.isActive !== false && (v.stock ?? 0) > 0
    );
  }, [isVariableProduct, variantProduct?.variants, stock]);

  const isOutOfStock = (isVariableProduct ? !hasAvailableVariants : remainingStock === 0);

  // Check Wishlist Status
  const isWishlisted = useMemo(() => {
    if (optimisticWishlist !== null) return optimisticWishlist;
    if (!wishlistData) return false;
    
    const wishlistArray = Array.isArray(wishlistData) 
      ? wishlistData 
      : Array.isArray((wishlistData as any)?.wishlist) 
        ? (wishlistData as any).wishlist as any[] 
        : [];
    
    // For variable products, check if any variant is wishlisted
    // For simple products, check the product directly
    return wishlistArray.some((item: any) => {
      const itemProductId = item.productId || item.product?.id || item.id;
      return String(itemProductId) === String(id);
    });
  }, [wishlistData, id, optimisticWishlist, isVariableProduct]);

  // Get server-side wishlist status (for API calls - ignoring optimistic state)
  const serverWishlistStatus = useMemo(() => {
    if (!wishlistData) return false;
    
    const wishlistArray = Array.isArray(wishlistData) 
      ? wishlistData 
      : Array.isArray((wishlistData as any)?.wishlist) 
        ? (wishlistData as any).wishlist as any[] 
        : [];
    
    // For variable products, check if any variant is wishlisted
    // For simple products, check the product directly
    return wishlistArray.some((item: any) => {
      const itemProductId = item.productId || item.product?.id || item.id;
      return String(itemProductId) === String(id);
    });
  }, [wishlistData, id, isVariableProduct]); // Note: no optimisticWishlist dependency

  // Sync Optimistic State — reset in both directions:
  // qty > 0 means real cart confirmed, clear optimistic flag
  // qty === 0 means item was removed, revert CTA to "Add to Cart"
  useEffect(() => {
    if (qty === 0) {
      setOptimisticAdded(false);
    }
  }, [qty]);

  // Reset optimistic wishlist state when server state changes
  useEffect(() => {
    if (optimisticWishlist !== null && toggleWishlistMutation.isSuccess) {
      // Reset optimistic state after successful mutation
      setOptimisticWishlist(null);
    }
  }, [toggleWishlistMutation.isSuccess, optimisticWishlist]);

  // --- HANDLERS ---

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || isAddingToCart || (isInCart && !isVariableProduct)) return;

    // For variable products, show the variant picker modal instead
    if (isVariableProduct) {
      setShowVariantModal(true);
      return;
    }

    // 1. Start the loading animation
    setIsAddingToCart(true);

    // 2. Trigger the API call in the background (Fire & Forget)
    // We do NOT 'await' this for the UI. This prevents the "stuck" state.
    addToCart(id, {
      title: name,
      price: amount.toString(),
      images: [photo]
    }).catch((error) => {
      console.error('Failed to add to cart:', error);
      // If it fails, we revert the UI changes silently or show a toast
      setOptimisticAdded(false);
    });

    // 3. Force the UI to transition to "Success" after a smooth delay
    // This ensures the user NEVER gets stuck on loading, even if the server is slow.
    setTimeout(() => {
      setOptimisticAdded(true); // Show checkmark
      setIsAddingToCart(false); // Hide loader
    }, 600); // 600ms allows the user to see the spinner briefly (good feedback)
  };

  const handleVariantAddToCart = async (
    variantId: string,
    variantPrice: string,
    variantAttributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>
  ) => {
    // Fire-and-forget — same pattern as regular add, no blocking await
    addToCart(id, {
      title: name,
      price: variantPrice,
      images: [photo],
      variantId,
      variantAttributes,
    }).catch((error) => {
      console.error('Failed to add variant to cart:', error);
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    // Debug: Log auth and wishlist state for troubleshooting
    console.log('Wishlist Toggle Debug:', { 
      token: !!token, 
      authUser: !!authUser, 
      isAuthenticated,
      isWishlisted,
      serverWishlistStatus,
      optimisticWishlist,
      component: 'OptimisticProductCard'
    });

    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your Wishlist", {
        icon: () => <Info size={18} color="#EAD7B7" />,
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // For variable products, show variant picker for wishlist
    if (isVariableProduct && !isWishlisted) {
      setShowWishlistVariantModal(true);
      return;
    }

    // Toggle animation and optimistic state
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    const nowWishlisted = !isWishlisted;
    setOptimisticWishlist(nowWishlisted);

    if (nowWishlisted) {
      toast.success("Added to Wishlist", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.info("Removed from Wishlist", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    // Call the toggle mutation using server state (not optimistic state)
    // For simple products or removing from wishlist, no variantId needed
    toggleWishlistMutation.debouncedMutate({
      productId: id,
      isCurrentlyWishlisted: serverWishlistStatus, // Use actual server state
      variantId: null, // For simple products or removing, no variant needed
    });
  };

  // Handle adding specific variant to wishlist
  const handleAddVariantToWishlist = async (
    variantId: string,
    variantPrice: string,
    variantAttributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>
  ) => {
    console.log('Adding variant to wishlist:', { variantId, variantPrice, variantAttributes });

    // Close the modal first
    setShowWishlistVariantModal(false);

    // Set optimistic state
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    setOptimisticWishlist(true);

    // Show success toast
    toast.success("Added to Wishlist", {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Call the toggle mutation with variant info
    toggleWishlistMutation.debouncedMutate({
      productId: id,
      isCurrentlyWishlisted: false, // Always false since we're adding
      variantId: variantId,
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);

  const priceDisplay = (() => {
    const dp = displayPrice != null ? String(displayPrice) : '';
    if (dp && dp !== '0') {
      if (dp.includes('-')) {
        return dp.split('-').map(p => `$${parseFloat(p.trim()).toFixed(2)}`).join(' – ');
      }
      const n = parseFloat(dp);
      return isNaN(n) ? dp : formatPrice(n);
    }
    return formatPrice(amount);
  })();

  // --- RENDER HELPERS ---
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={`${
              i < Math.floor(rating) 
                ? "fill-[#973c00] text-[#973c00]" // Brown star
                : "text-stone-300 fill-stone-100" // Muted empty star
            }`}
          />
        ))}
      </div>
    );
  };

  // --- COMPONENT JSX ---
  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-[#973c00]/5 transition-all duration-300 relative flex flex-col h-full overflow-hidden ${isOutOfStock ? "opacity-60 grayscale" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* IMAGE SECTION */}
      <div className="relative aspect-6/4 bg-stone-50 overflow-hidden">
        
        {/* PLATFORM IDENTITY LOGO (New Badge) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
           {/* <div className="bg-white/80 backdrop-blur-md p-1 rounded-lg border border-stone-200 shadow-sm transition-transform group-hover:scale-110 duration-500">
             
           </div> */}
           <Image
               src="/images/navbarLogo.png"
               alt="Platform Logo"
               width={80}
               height={80}
               className="object-contain w-10"
             />
           
           {/* If you still want the 'Featured' text, we move it next to the logo or below it */}
           {featured && (
             <span className="bg-[#973c00] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
               Featured
             </span>
           )}
        </div>

        {/* Stock Warning - Kept on the right */}
        {!isOutOfStock && stock < 5 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#973c00] text-[10px] font-bold px-2 py-1 rounded-full z-10 border border-[#973c00]/20">
            Low Stock
          </div>
        )}

        <Link
          href={`/shop/${slug}`}
          className="w-full h-full block"
        >
          <Image
            src={photo || "/images/placeholder.png"}
            alt={name}
            fill
            className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-300" />
        </Link>

        {/* Variant color/size preview */}
        {isVariableProduct && (
          <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">
            {(variantColors.length > 0 || variantSizes.length > 0) && (
              <div className="bg-white/30 backdrop-blur-md px-3 py-2 flex items-center justify-center gap-1.5 flex-nowrap overflow-hidden border-t border-white/40">
                {/* Colors — max 4 swatches */}
                {variantColors.slice(0, 4).map((c) => (
                  <div
                    key={c.hex}
                    title={c.label}
                    className="w-4 h-4 rounded-full border-2 border-stone-300 shadow shadow-black/20 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {variantColors.length > 4 && (
                  <span className="text-[9px] font-bold text-stone-700 shrink-0">+{variantColors.length - 4}</span>
                )}
                {variantColors.length > 0 && variantSizes.length > 0 && (
                  <span className="text-stone-400 text-xs shrink-0 mx-0.5">|</span>
                )}
                {/* Sizes — max 4 pills */}
                {variantSizes.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-[9px] font-bold text-stone-700 bg-white/60 border border-stone-200 px-1.5 py-0.5 rounded leading-none shrink-0"
                  >
                    {s}
                  </span>
                ))}
                {variantSizes.length > 4 && (
                  <span className="text-[9px] font-bold text-stone-700 shrink-0">+{variantSizes.length - 4}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAILS SECTION */}
      <div className="flex flex-col grow p-4 bg-white">
        {/* Header: Artist & Rating */}
        <div className="flex justify-between items-start mb-2">
          {artistName && (
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {artistName}
            </span>
          )}
          <div className={artistName ? "ml-auto" : ""}>
            {renderStars(rating)}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-serif text-lg font-medium text-stone-800 mb-1 leading-tight group-hover:text-[#973c00] transition-colors">
          <Link href={`/shop/${slug}`}>
            {name}
          </Link>
        </h2>

        {/* Description */}
        <p className="text-xs text-stone-500 mb-3 line-clamp-2 font-light">
          {description}
        </p>

        {/* Tags - Brown Theme */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-[#fdf4ef] text-[#973c00] border border-[#973c00]/10 text-[10px] px-2 py-0.5 rounded-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Price & Actions */}
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Price</span>
            <span className="font-medium text-lg text-stone-900">
              {priceDisplay}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full transition-all duration-300 relative group/btn cursor-pointer ${
                isWishlisted 
                  ? "bg-[#fdf4ef] border border-[#973c00]/20" 
                  : "bg-white hover:bg-[#fdf4ef] border border-stone-200 hover:border-[#973c00]/20"
              }`}
            >
              <Heart
                size={18}
                className={`transition-all duration-300 ${
                  isWishlisted 
                    ? "fill-[#973c00] text-[#973c00]" 
                    : "text-stone-400 group-hover/btn:text-[#973c00]"
                } ${isHeartAnimating ? "scale-125" : ""}`}
              />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || isAddingToCart || (isInCart && !isVariableProduct)}
              className={`
                relative h-10 px-4 min-w-25 rounded-full flex items-center justify-center transition-all duration-300
                ${isOutOfStock 
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                  : (isInCart && !isVariableProduct)
                    ? "bg-[#f8efe9] text-[#973c00] border border-[#973c00]/30 cursor-default"
                    : "bg-[#973c00] text-white hover:bg-[#7a3100] shadow-md hover:shadow-lg shadow-[#973c00]/20 active:scale-95 cursor-pointer"
                }
              `}
            >
              <AnimatePresence mode="wait">
                {isAddingToCart ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                  </motion.div>
                ) : (isInCart && !isVariableProduct) ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={14} strokeWidth={3} />
                    <span className="text-xs font-bold uppercase tracking-wide">Added</span>
                  </motion.div>
                ) : isOutOfStock ? (
                  <span className="text-xs font-bold uppercase tracking-wide">Sold Out</span>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <ShoppingBag size={14} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {isVariableProduct ? "Add" : "Add"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Variant picker modal — only rendered for variable products */}
    {isVariableProduct && (
      <VariantPickerModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        productId={id}
        productName={name}
        productImage={photo}
        onAddToCart={handleVariantAddToCart}
      />
    )}

    {/* Wishlist variant picker modal — only rendered for variable products */}
    {isVariableProduct && (
      <VariantPickerModal
        isOpen={showWishlistVariantModal}
        onClose={() => setShowWishlistVariantModal(false)}
        productId={id}
        productName={name}
        productImage={photo}
        mode="wishlist"
        onAddToCart={handleAddVariantToWishlist}
      />
    )}
  </>
);
}