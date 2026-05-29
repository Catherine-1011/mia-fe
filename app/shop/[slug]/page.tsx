"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Share2,
  Check,
  Loader2,
  ArrowLeft,
  Package,
  Tag,
  User,
  Store,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Copy,
  MessageCircle,
  Mail,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useToggleWishlist } from "@/hooks/useWishlistMutations";
import { useWishlistCheck } from "@/hooks/useWishlist";
import { useSingleProduct, ProductVariant } from "@/hooks/useSingleProduct";
import { useProductStock } from "@/hooks/useProductStock";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "react-toastify";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  featuredImage?: string;
  galleryImages?: string[];
  stock: number;
  category?: string;
  brand?: string;
  sellerName?: string;
  artistName?: string;
  rating?: number;
  reviews?: number;
  discount?: number | boolean;
  tags?: string[];
  featured?: boolean;
  sellerId?: string;
  status?: string;
  weight?: string | number; // Added weight field
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  sellerUserName?: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

// ─── Avatar initials helper ────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ShopSlugPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get the slug from URL parameters
  const slugParam = params?.slug as string;

  // Get all products to find the ID matching this slug
  const { data: allProducts = [] } = useProducts();
  
  // Find product ID from slug
  const productId = useMemo(() => {
    if (!slugParam || !allProducts.length) return undefined;
    
    // Try to find product by matching slug in these priority orders:
    // 1. Direct slug match (if API provides slugs)
    // 2. Generated slug from title (title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    // 3. Fallback slug format (`product-${id}`)
    const product = allProducts.find(p => 
      p.slug === slugParam || 
      (p.title && p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slugParam) ||
      `product-${p.id}` === slugParam
    );
    
    return product?.id;
  }, [slugParam, allProducts]);

  const { data: product, isLoading: productLoading, error: queryError } = useSingleProduct(productId);
  const loading = productLoading;
  const error = queryError?.message || null;

  // Get all products loading state
  const { isLoading: allProductsLoading } = useProducts();

  // Real-time stock — REST snapshot on mount + live socket updates thereafter
  // Seed with totalStock for VARIABLE products (product.stock is 0 for those)
  const {
    stock: liveStock,
    isAvailable: liveIsAvailable,
  } = useProductStock(product?.id, product?.totalStock ?? product?.stock ?? 0);

  // UI state
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageFading, setImageFading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'write-review'>('description');
  const [tabMounted, setTabMounted] = useState(true);
  const [pageMounted, setPageMounted] = useState(false);

  // Ref for scrolling to the reviews/tabs section
  const tabsSectionRef = useRef<HTMLDivElement>(null);

  // Lightbox
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Share
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Variant selection (for VARIABLE products) - moved here to be available for wishlist check
  const isVariableProduct = product?.productType === 'VARIABLE' || product?.type === 'VARIABLE';
  // selectedAttributes holds the user's chosen value per attribute key, e.g. { color: "Blue", size: "M" }
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Auto-select first AVAILABLE variant (active + in stock); fall back to first if all unavailable
  useEffect(() => {
    if (product?.variants?.length && isVariableProduct) {
      const firstAvailable =
        product.variants.find(
          (v) => v.isActive !== false && (v.stock === undefined || v.stock > 0)
        ) ?? product.variants[0];
      if (firstAvailable?.attributes) {
        const defaults: Record<string, string> = {};
        Object.entries(firstAvailable.attributes).forEach(([k, v]) => { defaults[k] = v.value; });
        setSelectedAttributes(defaults);
      }
    }
  }, [product?.id]);

  // Derive unique attribute keys in order (color first if present)
  const attributeKeys = useMemo<string[]>(() => {
    if (!product?.variants?.length) return [];
    const keys = new Set<string>();
    product.variants.forEach(v => {
      if (v.attributes) Object.keys(v.attributes).forEach(k => keys.add(k));
    });
    // colour-like keys first
    const sorted = Array.from(keys).sort((a, b) => {
      const colorLike = (k: string) => /colou?r/i.test(k) ? 0 : 1;
      return colorLike(a) - colorLike(b);
    });
    return sorted;
  }, [product?.variants]);

  // Find the variant that exactly matches all selected attributes
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product?.variants?.length || !attributeKeys.length) return null;
    if (attributeKeys.some(k => !selectedAttributes[k])) return null; // not all chosen yet
    return product.variants.find(v =>
      attributeKeys.every(k => v.attributes?.[k]?.value === selectedAttributes[k])
    ) || null;
  }, [product?.variants, selectedAttributes, attributeKeys]);

  // Cart / wishlist
  const { addToCart, cartData, loading: cartLoading } = useSharedEnhancedCart();
  
  // For variable products, check wishlist status for the selected variant
  // Use useMemo to recalculate wishlist check params when selectedVariant changes
  const wishlistCheckParams = useMemo(() => ({
    productId: product?.id || "",
    variantId: isVariableProduct && selectedVariant ? selectedVariant.id : null
  }), [product?.id, isVariableProduct, selectedVariant?.id]);
  
  const { data: wishlistData } = useWishlistCheck(
    wishlistCheckParams.productId,
    wishlistCheckParams.variantId
  );
  const { token, user: authUser } = useAuth();
  const toggleWishlistMutation = useToggleWishlist();
  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Check if user is authenticated (either token or user object exists)
  const isAuthenticated = !!(token || authUser);

  // Build ordered image list
  const allImages = useMemo<string[]>(() => {
    if (!product) return [];
    const result: string[] = [];
    if (product.featuredImage && product.featuredImage.trim() !== "") result.push(product.featuredImage);
    if (Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach(img => { if (img && img.trim() !== "" && !result.includes(img)) result.push(img); });
    }
    if (result.length === 0 && Array.isArray(product.images)) {
      product.images.forEach(img => { if (img && img.trim() !== "" && !result.includes(img)) result.push(img); });
    }
    return result;
  }, [product]);

  // Page mount animation
  useEffect(() => { const t = setTimeout(() => setPageMounted(true), 30); return () => clearTimeout(t); }, []);

  // Fetch ratings — extracted so handleSubmitRating can also call it
  const fetchRatings = useCallback(async () => {
    if (!product?.id) return;
    try {
      setRatingsLoading(true);
      setRatingsError(null);
      const response = await apiClient.get<any>(`/ratings/products/${product.id}/ratings`);
      if (response && Array.isArray(response.ratings)) setRatings(response.ratings);
      else if (response?.data && Array.isArray(response.data.ratings)) setRatings(response.data.ratings);
      else setRatings([]);
    } catch (err) {
      setRatingsError(err instanceof Error ? err.message : "Failed to fetch ratings");
      setRatings([]);
    } finally { setRatingsLoading(false); }
  }, [product?.id]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  // Check if current user has already reviewed
  const hasReviewed = useMemo(() => {
    if (!isAuthenticated || !authUser?.id) return false;
    return ratings.some((r: any) => r.userId === authUser.id || r.user?.id === authUser.id);
  }, [ratings, isAuthenticated, authUser?.id]);

  // Check Wishlist Status with Optimistic Updates (like shop page)
  const isWishlisted = useMemo(() => {
    if (optimisticWishlist !== null) return optimisticWishlist;
    return wishlistData?.inWishlist || false;
  }, [wishlistData, optimisticWishlist]);

  // Get server-side wishlist status (for API calls - ignores optimistic state)
  const serverWishlistStatus = wishlistData?.inWishlist || false;

  // Modal scroll lock
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  // Scroll to the tabs section and switch tab
  const scrollToTab = useCallback((tab: 'description' | 'reviews' | 'write-review') => {
    tabsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTabMounted(false);
    setTimeout(() => { setActiveTab(tab); setTabMounted(true); }, 150);
  }, []);

  // Tab fade helper
  const switchTab = useCallback((tab: 'description' | 'reviews' | 'write-review') => {
    setTabMounted(false);
    setTimeout(() => { setActiveTab(tab); setTabMounted(true); }, 150);
  }, []);

  // Navigation helpers
  const handleBackToShop = () => {
    const search = searchParams.get('search');
    const filters = searchParams.get('filters');
    const tab = searchParams.get('tab');
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (filters) queryParams.set('filters', filters);
    if (tab) queryParams.set('tab', tab);
    
    const queryString = queryParams.toString();
    router.push(queryString ? `/shop?${queryString}` : '/shop');
  };

  // Check if item is in cart - only calculate when cart data is fully loaded
  const cartItem = !cartLoading && cartData?.cart ? cartData.cart.find(item => item.productId === product?.id) : null;
  const currentQtyInCart = cartItem?.quantity || 0;

  // Effective price/stock: use selected variant values if available
  const effectivePrice = selectedVariant?.price || product?.price || '0';

  // Format price for display — handles range strings like "28 - 30" from API
  const formatPrice = (price: string) => {
    if (price.includes('-')) {
      return price.split('-').map(p => `$${parseFloat(p.trim()).toFixed(2)}`).join(' - ');
    }
    const num = parseFloat(price);
    return isNaN(num) ? price : `$${num.toFixed(2)}`;
  };
  const effectiveStock = selectedVariant != null
    ? (selectedVariant.stock ?? 0)
    : liveStock;
  const effectiveIsAvailable = selectedVariant != null
    ? ((selectedVariant.isActive !== false) && (selectedVariant.stock ?? 0) > 0)
    : liveIsAvailable;

  // Use real-time liveStock so the button reflects instant server-side changes
  // Only calculate remaining stock when cart data is fully loaded to prevent incorrect initial values
  const remainingStock = !cartLoading ? Math.max(0, effectiveStock - currentQtyInCart) : effectiveStock;
  const isOutOfStock = !effectiveIsAvailable || remainingStock === 0;
  // For VARIABLE products, block add-to-cart until all attributes are chosen
  const needsVariantSelection = isVariableProduct && !selectedVariant && (product?.variants?.length ?? 0) > 0;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock || isAddingToCart || cartLoading) return;
    if (needsVariantSelection) {
      toast.info('Please select a variant before adding to cart.', { position: 'top-right', autoClose: 2500 });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, {
        title: product.title,
        price: effectivePrice,
        featuredImage: selectedVariant?.featuredImage || product.featuredImage,
        images: product.images || [],
        galleryImages: product.galleryImages || [],
        ...(selectedVariant ? { variantId: selectedVariant.id } : {}),
        ...(selectedVariant?.attributes ? { variantAttributes: selectedVariant.attributes } : {}),
      });

      setAddedToCart(true);
      
      // Dispatch event to open mini cart
      window.dispatchEvent(new CustomEvent("open-cart"));
      
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    // Debug: Log auth and wishlist state for troubleshooting
    console.log('Wishlist Toggle Debug:', { 
      token: !!token, 
      authUser: !!authUser, 
      isAuthenticated,
      isWishlisted,
      serverWishlistStatus,
      optimisticWishlist,
      productId: product?.id,
      wishlistData,
      component: 'ProductDetailPage'
    });

    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your Wishlist", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // For variable products, check if variant is selected
    if (isVariableProduct && needsVariantSelection) {
      toast.info("Please select a variant before adding to wishlist", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Heart animation and optimistic state (like shop page)
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    setOptimisticWishlist(!isWishlisted);
    
    // Call API to toggle wishlist using server state (not optimistic state)
    // Include variantId if it's a variable product with selected variant
    toggleWishlistMutation.debouncedMutate({
      productId: product?.id || "",
      isCurrentlyWishlisted: serverWishlistStatus, // Use actual server state
      variantId: isVariableProduct && selectedVariant ? selectedVariant.id : null,
    });

    // Show appropriate success toast based on current visual state (what user sees)
    if (isWishlisted) {
      toast.success("Removed from Wishlist!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.success("Added to Wishlist!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setLinkCopied(true);
      toast.success('Product link copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = productUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setLinkCopied(true);
      toast.success('Product link copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.title, url: productUrl });
      } catch { /* user cancelled */ }
    } else {
      setShowShareMenu((prev) => !prev);
    }
  };

  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      setRatingMessage("Please log in to write a review.");
      return;
    }

    if (!product || ratingScore === 0 || review.trim() === "") {
      setRatingMessage("Please provide both a rating and review");
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await apiClient.post(
        `/ratings/products/${product.id}/rate`,
        {
          rating: ratingScore,
          review: review,
        }
      );

      if (response) {
        setRatingMessage("Thank you! Your rating has been submitted successfully.");
        setRatingScore(0);
        setReview("");
        // Re-fetch ratings immediately so the new review appears without a page reload
        await fetchRatings();
        setTimeout(() => {
          setRatingMessage("");
          switchTab('reviews');
        }, 1500);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit rating";
      const isAuthError = msg.toLowerCase().includes("token") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("unauthenticated");
      setRatingMessage(isAuthError ? "Please log in to write a review." : msg);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Handle loading states and product not found
  if (allProductsLoading) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] pt-28 pb-32 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#973c00]" />
          <p className="text-[#973c00] font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!productId && slugParam && allProducts.length > 0) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] pt-28 pb-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 mx-auto mb-4 text-[#973c00]/50" />
          <h1 className="text-2xl font-serif font-bold text-[#3b1a08] mb-2">Product Not Found</h1>
          <p className="text-[#973c00]/70 mb-6">
            The product you're looking for doesn't exist or has been moved.
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 bg-[#973c00] hover:bg-[#5A1E12] text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] pt-28 pb-32 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#973c00]" />
          <p className="text-[#973c00] font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] pt-28 pb-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-serif font-bold text-[#3b1a08] mb-2">Error Loading Product</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 bg-[#973c00] hover:bg-[#5A1E12] text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] pt-28 pb-32 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#973c00]" />
          <p className="text-[#973c00] font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-[#973c00]/20 rounded w-56 animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-3xl bg-[#5A1E12]/10 animate-pulse border border-[#973c00]/10" />
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl bg-[#973c00]/15 animate-pulse border border-[#5A1E12]/10" />
                ))}
              </div>
            </div>
            <div className="space-y-5 pt-2">
              <div className="h-9 bg-[#5A1E12]/15 rounded-xl w-3/4 animate-pulse" />
              <div className="h-5 bg-[#973c00]/10 rounded-lg w-1/3 animate-pulse" />
              <div className="h-10 bg-[#973c00]/20 rounded-xl w-36 animate-pulse" />
              <div className="h-4 bg-[#5A1E12]/8 rounded w-full animate-pulse" />
              <div className="h-4 bg-[#5A1E12]/8 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-[#5A1E12]/8 rounded w-4/6 animate-pulse" />
              <div className="flex gap-3 pt-2">
                <div className="h-14 flex-1 rounded-2xl bg-[#973c00]/15 animate-pulse border border-[#5A1E12]/10" />
                <div className="h-14 w-14 rounded-2xl bg-[#5A1E12]/12 animate-pulse border border-[#973c00]/15" />
                <div className="h-14 w-14 rounded-2xl bg-[#5A1E12]/12 animate-pulse border border-[#973c00]/15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-[#973c00]/20 max-w-sm mx-4">
          <div className="w-16 h-16 bg-[#5A1E12]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#973c00]" />
          </div>
          <p className="text-xl font-bold text-[#3b1a08] mb-2">
            {error || "Product not found"}
          </p>
          <p className="text-[#973c00]/80 mb-6">Please check the URL and try again.</p>
          <button
            onClick={handleBackToShop}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A1E12] text-white rounded-xl font-semibold hover:bg-[#3b1a08] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Crossfade image switch
  const switchImage = (idx: number) => {
    if (idx === selectedImage) return;
    setImageFading(true);
    setTimeout(() => { setSelectedImage(idx); setImageFading(false); }, 180);
  };

  const currentImageSrc = allImages[selectedImage] || allImages[0];
  const sellerDisplayName = product.seller?.name || product.sellerName;
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length
      : product.rating || 0;
  const discountPercentage = typeof product?.discount === "number" ? product.discount : 0;

  return (
    <>
      {/* ── Main Page ───────────────────────────────────────────────── */}
      <div
        className={`min-h-screen bg-[#ebe3d5] pt-28 pb-32 transition-all duration-700 ease-out ${
          pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Breadcrumb ────────────────────────────────────────────── */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-500 delay-100 ${
              pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <nav className="flex items-center gap-1.5 text-sm">
              <Link href="/" className="text-[#973c00]/70 hover:text-[#5A1E12] font-medium transition-colors">Home</Link>
              <span className="text-[#973c00]/40">/</span>
              <Link href="/shop" className="text-[#973c00]/70 hover:text-[#5A1E12] font-medium transition-colors">Shop</Link>
              <span className="text-[#973c00]/40">/</span>
              <span className="font-semibold text-[#3b1a08] truncate max-w-48">{product.title}</span>
            </nav>
            <button
              onClick={handleBackToShop}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#5A1E12] hover:text-[#3b1a08] border border-[#973c00]/20 bg-white/60 hover:bg-white/90 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </button>
          </div>

          {/* ── Hero Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* LEFT – Image Gallery */}
            <div
              className={`space-y-4 transition-all duration-700 delay-150 ${
                pageMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              {/* Main image */}
              <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden bg-white shadow-xl shadow-[#3b1a08]/8 border border-[#973c00]/10 group">
                {currentImageSrc ? (
                  <Image
                    key={selectedImage}
                    src={currentImageSrc}
                    alt={product.title}
                    fill
                    className={`object-cover transition-all duration-500 group-hover:scale-[1.03] ${
                      imageFading ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
                    }`}
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdf4ef] gap-3">
                    <Package className="w-12 h-12 text-[#973c00]/30" />
                    <p className="text-[#973c00]/50 text-sm">No image available</p>
                  </div>
                )}

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <span className="inline-flex items-center gap-1 bg-[#5A1E12] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                      ✦ Featured
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="bg-[#973c00] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      -{discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Top-right actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={handleWishlist}
                    disabled={!token}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                      isWishlisted 
                        ? 'bg-[#5A1E12] text-white' 
                        : 'bg-white/90 backdrop-blur-sm text-[#973c00] hover:bg-[#5A1E12] hover:text-white'
                    }`}
                    title={
                      !token 
                        ? "Please log in to add to wishlist" 
                        : isWishlisted 
                          ? "Remove from wishlist" 
                          : "Add to wishlist"
                    }
                  >
                    <Heart 
                      className={`w-5 h-5 transition-all duration-200 ${
                        isWishlisted ? 'fill-current scale-110' : ''
                      } ${isHeartAnimating ? 'animate-pulse scale-125' : ''}`} 
                    />
                  </button>
                  {allImages.length > 1 && (
                    <button
                      onClick={() => { setModalImageIndex(selectedImage); setIsModalOpen(true); }}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-[#973c00] hover:bg-[#5A1E12] hover:text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                      title="View full screen"
                    >
                      <Maximize2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                {/* Image counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {selectedImage + 1} / {allImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail strip – all images */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => switchImage(idx)}
                      className={`relative shrink-0 w-18 h-18 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === idx
                          ? 'border-[#5A1E12] shadow-md shadow-[#5A1E12]/20 scale-105'
                          : 'border-[#973c00]/20 opacity-60 hover:opacity-100 hover:border-[#973c00]/50'
                      }`}
                    >
                      <Image src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" />
                      {selectedImage === idx && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-[#5A1E12]/30 rounded-2xl" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT – Product Details */}
            <div
              className={`flex flex-col gap-5 transition-all duration-700 delay-200 ${
                pageMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
            >
              {/* Category pill + Title */}
              <div className="space-y-2">
                {product.category && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#973c00] bg-[#973c00]/8 border border-[#973c00]/15 px-3 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    {product.category}
                  </span>
                )}
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#3b1a08] leading-tight">{product.title}</h1>
                {product.artistName && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#973c00]/60" />
                    <span className="text-sm text-[#973c00]/60">by</span>
                    <span className="text-sm font-semibold text-[#5A1E12]">{product.artistName}</span>
                  </div>
                )}
              </div>

              {/* Rating row */}
              <button
                onClick={() => scrollToTab('reviews')}
                className="flex items-center gap-2.5 group w-fit"
                title="See all reviews"
              >
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 transition-colors ${s <= Math.round(avgRating) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/20 fill-[#973c00]/10'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#5A1E12] group-hover:underline underline-offset-2">
                  {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}
                </span>
                <span className="text-sm text-[#973c00]/60 group-hover:text-[#5A1E12] transition-colors underline-offset-2 group-hover:underline">
                  ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
                </span>
              </button>

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-2xl lg:text-3xl font-extrabold text-[#3b1a08] leading-none tracking-tight">
                  {selectedVariant?.price
                    ? formatPrice(selectedVariant.price)
                    : product.displayPrice ||
                      (product.price && product.price !== '0'
                        ? formatPrice(product.price)
                        : null)}
                </span>
                {discountPercentage > 0 && product.price && product.price !== '0' && (
                  <>
                    <span className="text-base text-[#973c00]/40 line-through mb-0.5">
                      ${(parseFloat(product.price) / (1 - discountPercentage / 100)).toFixed(2)}
                    </span>
                    <span className="mb-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock badge */}
              <div className="flex gap-3 items-center">
                {effectiveIsAvailable && effectiveStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#5A1E12]/8 text-[#5A1E12] border border-[#5A1E12]/15 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    In Stock
                    {!isVariableProduct && (
                      <span className="font-normal text-[#5A1E12]/60">· {effectiveStock} left</span>
                    )}
                    {isVariableProduct && !selectedVariant && product.totalStock != null && (
                      <span className="font-normal text-[#5A1E12]/60">· {product.totalStock} total</span>
                    )}
                    {isVariableProduct && selectedVariant && (
                      <span className="font-normal text-[#5A1E12]/60">· {effectiveStock} left</span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-[#973c00]/8 text-[#973c00] border border-[#973c00]/15 text-sm font-semibold px-3 py-1.5 rounded-full">
                    {needsVariantSelection ? 'Select variant to check stock' : 'Out of Stock'}
                  </span>
                )}

                {/* Weight block */}
                {(product.weight !== undefined && product.weight !== null) && (
                  <span className="inline-flex items-center gap-1.5 bg-[#5A1E12]/8 text-[#5A1E12] border border-[#5A1E12]/15 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <Package className="w-3.5 h-3.5" />
                    {product.weight} kg
                  </span>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-medium text-[#973c00] bg-[#973c00]/6 border border-[#973c00]/12 px-3 py-1 rounded-full hover:bg-[#973c00]/10 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Seller */}
              {sellerDisplayName && (
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-3.5 h-3.5 text-[#973c00]/50 shrink-0" />
                  <span className="text-[#973c00]/50">Sold by</span>
                  <span className="font-semibold text-[#5A1E12]">{sellerDisplayName}</span>
                </div>
              )}

              {/* ── Variant Selector (VARIABLE products) ─────────────── */}
              {isVariableProduct && product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {attributeKeys.map((attrKey) => {
                    const uniqueValues = Array.from(
                      new Map(
                        product.variants!
                          .filter(v => v.attributes?.[attrKey])
                          .map(v => [v.attributes![attrKey].value, v.attributes![attrKey]])
                      ).values()
                    );

                    const isColorAttr = /colou?r/i.test(attrKey);
                    const selectedValue = selectedAttributes[attrKey];

                    const isValueAvailable = (val: string) => {
                      return product.variants!.some(v => {
                        if (v.attributes?.[attrKey]?.value !== val) return false;
                        if ((v.stock ?? 0) === 0 || v.isActive === false) return false;
                        return Object.entries(selectedAttributes).every(([k, sv]) =>
                          k === attrKey || !sv || v.attributes?.[k]?.value === sv
                        );
                      });
                    };

                    return (
                      <div key={attrKey}>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-bold text-[#3b1a08] uppercase tracking-wider">
                            {attrKey}
                          </p>
                          {selectedValue && (
                            <span className="text-sm text-[#5A1E12] font-semibold">
                              &mdash; {uniqueValues.find(v => v.value === selectedValue)?.displayValue || selectedValue}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {uniqueValues.map((attr) => {
                            const available = isValueAvailable(attr.value);
                            const isChosen = selectedValue === attr.value;

                            if (isColorAttr && attr.hexColor) {
                              return (
                                <button
                                  key={attr.value}
                                  title={attr.displayValue}
                                  disabled={!available}
                                  onClick={() =>
                                    setSelectedAttributes(prev => ({
                                      ...prev,
                                      [attrKey]: isChosen ? '' : attr.value,
                                    }))
                                  }
                                  className={`relative w-9 h-9 rounded-full border-2 transition-all duration-150 shadow-sm
                                    ${isChosen
                                      ? 'border-[#5A1E12] scale-110 shadow-md'
                                      : available
                                      ? 'border-transparent hover:border-[#973c00]/40 hover:scale-105'
                                      : 'border-transparent opacity-30 cursor-not-allowed'
                                    }`}
                                  style={{ backgroundColor: attr.hexColor }}
                                >
                                  {isChosen && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white drop-shadow" />
                                    </span>
                                  )}
                                  {!available && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <X className="w-3 h-3 text-white/70" />
                                    </span>
                                  )}
                                </button>
                              );
                            }

                            return (
                              <button
                                key={attr.value}
                                disabled={!available}
                                onClick={() =>
                                  setSelectedAttributes(prev => ({
                                    ...prev,
                                    [attrKey]: isChosen ? '' : attr.value,
                                  }))
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150
                                  ${isChosen
                                    ? 'bg-[#5A1E12] text-white border-[#5A1E12] shadow-md'
                                    : available
                                    ? 'bg-white text-[#3b1a08] border-[#973c00]/20 hover:border-[#5A1E12] hover:bg-[#fdf4ef]'
                                    : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                                  }`}
                              >
                                {attr.displayValue}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {needsVariantSelection && (
                    <p className="text-xs text-[#973c00] font-medium">
                      Please select all options to continue
                    </p>
                  )}
                </div>
              )}

              {/* ── Action Buttons ────────────────────────────────────── */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={(isOutOfStock && !needsVariantSelection) || isAddingToCart || cartLoading}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer ${
                    addedToCart
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : cartLoading
                      ? 'bg-[#5A1E12]/40 text-white cursor-wait'
                      : needsVariantSelection
                      ? 'bg-[#5A1E12]/60 text-white cursor-pointer'
                      : isOutOfStock
                      ? 'bg-[#973c00]/10 text-[#973c00]/40 cursor-not-allowed'
                      : 'bg-[#5A1E12] text-white hover:bg-[#3b1a08] active:scale-[.98] shadow-lg shadow-[#5A1E12]/25 hover:shadow-xl hover:shadow-[#5A1E12]/30'
                  }`}
                >
                  {cartLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Loading Cart...</>
                  ) : isAddingToCart ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Adding…</>
                  ) : addedToCart ? (
                    <><Check className="w-5 h-5" />Added to Cart!</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" />{needsVariantSelection ? 'Select a Variant' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</>
                  )}
                </button>

                <button
                  onClick={handleWishlist}
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer ${
                    isWishlisted
                      ? 'bg-[#5A1E12] border-[#5A1E12] text-white shadow-lg shadow-[#5A1E12]/20'
                      : 'bg-white/60 border-[#973c00]/20 text-[#973c00] hover:border-[#5A1E12] hover:text-[#5A1E12] hover:bg-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 transition-all duration-200 ${
                    isWishlisted 
                      ? 'fill-white text-white scale-110' 
                      : 'text-[#973c00]'
                  } ${isHeartAnimating ? 'scale-125' : ''}`} />
                </button>

                {/* Share button + dropdown */}
                <div className="relative">
                  <button
                    onClick={handleNativeShare}
                    className="w-14 h-14 rounded-2xl border-2 border-[#973c00]/20 bg-white/60 text-[#973c00] hover:border-[#5A1E12] hover:text-[#5A1E12] hover:bg-white flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
                    title="Share this product"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>

                  {showShareMenu && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />

                      {/* Dropdown */}
                      <div className="absolute right-0 bottom-16 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-[#973c00]/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Share this product</p>
                        </div>

                        <div className="p-1">
                          {/* Copy link */}
                          <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-[#EAD7B7]/40 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            {linkCopied ? (
                              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-[#5A1E12]/10 rounded-lg flex items-center justify-center shrink-0">
                                <Copy className="w-4 h-4 text-[#5A1E12]" />
                              </div>
                            )}
                            <span className={`font-medium ${linkCopied ? 'text-emerald-600' : 'text-gray-700'}`}>
                              {linkCopied ? 'Link copied!' : 'Copy link'}
                            </span>
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent((product?.title ?? '') + ' ' + productUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-green-50 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </div>
                            <span className="font-medium text-gray-700">WhatsApp</span>
                          </a>

                          {/* Facebook */}
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </div>
                            <span className="font-medium text-gray-700">Facebook</span>
                          </a>

                          {/* X / Twitter */}
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product?.title ?? '')}&url=${encodeURIComponent(productUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </div>
                            <span className="font-medium text-gray-700">X (Twitter)</span>
                          </a>

                          {/* LinkedIn */}
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </div>
                            <span className="font-medium text-gray-700">LinkedIn</span>
                          </a>

                          {/* Pinterest */}
                          <a
                            href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(product?.featuredImage || product?.images?.[0] || '')}&description=${encodeURIComponent(product?.title || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-red-50 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#E60023"><path d="M12 0C5.374 0 0 5.372 0 12s5.374 12 12 12 12-5.372 12-12S18.626 0 12 0zm-.5 18.994c-1.425-.142-2.02-.802-3.136-1.467-.615 3.213-1.367 6.295-3.589 7.911-.687-4.87.998-8.527 1.777-12.4-1.328-2.235.16-6.739 2.975-5.631 3.467 1.367-3.005 8.336 1.342 9.206 4.545.91 6.401-7.857 3.588-10.707-4.063-4.115-11.829-.095-10.876 5.798.233 1.441 1.731 1.88.598 3.866-2.613-.58-3.395-2.64-3.294-5.387.166-4.498 4.037-7.646 7.91-8.08 4.891-.549 9.479 1.794 10.106 6.414.705 5.208-2.215 10.843-7.4 10.477z"/></svg>
                            </div>
                            <span className="font-medium text-gray-700">Pinterest</span>
                          </a>

                          {/* Telegram */}
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product?.title || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-1.69 6.403-2.389 8.504-.295 1.06-.873 1.415-1.434 1.415-.611 0-1.003-.454-1.003-1.004 0-.473.335-1.113.668-1.801l1.135-2.337c.334-.688.668-1.376.668-2.063 0-.688-.334-1.376-.668-2.063l-1.135-2.337c-.333-.688-.668-1.328-.668-1.801 0-.55.392-1.004 1.003-1.004.561 0 1.139.355 1.434 1.415.699 2.101 2.22 6.646 2.389 8.504z"/></svg>
                            </div>
                            <span className="font-medium text-gray-700">Telegram</span>
                          </a>

                          {/* Email */}
                          <a
                            href={`mailto:?subject=${encodeURIComponent(`Check out: ${product?.title || ''}`)}&body=${encodeURIComponent(`I found this amazing product: ${product?.title || ''} \n\n${productUrl}`)}`}
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                          >
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-medium text-gray-700">Email</span>
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#973c00]/10" />
            </div>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          <div
            ref={tabsSectionRef}
            className={`mt-16 transition-all duration-700 delay-300 ${
              pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Tab Bar */}
            <div className="flex gap-0.5 border-b-2 border-[#973c00]/10 mb-8">
              {([
                { key: 'description', label: 'Description' },
                { key: 'reviews', label: `Reviews${ratings.length > 0 ? ` (${ratings.length})` : ''}` },
                { key: 'write-review', label: 'Write a Review' },
              ] as { key: 'description' | 'reviews' | 'write-review'; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={`relative px-5 py-3 text-sm font-semibold transition-all duration-200 rounded-t-xl ${
                    activeTab === key
                      ? 'text-[#5A1E12] bg-white/40'
                      : 'text-[#973c00]/50 hover:text-[#5A1E12] hover:bg-white/20'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#5A1E12] rounded-full transition-all duration-300 ${
                      activeTab === key ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Tab Content – fades in/out */}
            <div
              className={`transition-all duration-200 ${
                tabMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >

              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="max-w-3xl">
                  <p className="text-[#3b1a08]/80 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
                  <div className="mt-8 bg-white/50 rounded-2xl border border-[#973c00]/8 overflow-hidden">
                    {[
                      product.category && { label: 'Category', value: product.category },
                      product.brand && { label: 'Brand', value: product.brand },
                      product.artistName && { label: 'Artist', value: product.artistName },
                      sellerDisplayName && { label: 'Sold by', value: sellerDisplayName },
                    ].filter(Boolean).map((row: any, i, arr) => (
                      <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[#973c00]/8' : ''}`}>
                        <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">{row.label}</span>
                        <span className="text-sm font-semibold text-[#3b1a08]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {ratingsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : ratingsError ? (
                    <p className="text-[#973c00] text-sm">{ratingsError}</p>
                  ) : ratings.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 rounded-full bg-[#973c00]/8 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-7 h-7 text-[#973c00]/30" />
                      </div>
                      <p className="text-[#3b1a08] font-semibold mb-1">No reviews yet</p>
                      <p className="text-sm text-[#973c00]/60 mb-6">Be the first to share your experience</p>
                      <button
                        onClick={() => switchTab('write-review')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A1E12] text-white text-sm font-semibold rounded-xl hover:bg-[#3b1a08] transition-colors shadow-md shadow-[#5A1E12]/20"
                      >
                        Write a Review
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Summary */}
                      <div className="flex items-center gap-6 mb-10 p-6 bg-white/50 rounded-2xl border border-[#973c00]/8">
                        <div className="text-center">
                          <p className="text-6xl font-black text-[#3b1a08] leading-none">{avgRating.toFixed(1)}</p>
                          <p className="text-xs text-[#973c00]/50 mt-1">out of 5</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-1 mb-2">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/15 fill-[#973c00]/8'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-[#973c00]/60">{ratings.length} review{ratings.length !== 1 ? 's' : ''}</p>
                        </div>
                        {!hasReviewed ? (
                          <button
                            onClick={() => switchTab('write-review')}
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border-2 border-[#5A1E12]/20 text-[#5A1E12] text-sm font-semibold rounded-xl hover:bg-[#5A1E12]/5 transition-all duration-200"
                          >
                            Write a Review
                          </button>
                        ) : (
                          <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#5A1E12]/5 text-[#5A1E12] text-sm font-semibold rounded-xl border border-[#5A1E12]/10">
                            <Check className="w-4 h-4" />
                            <span>Reviewed</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ratings.map((r, idx) => {
                          const name = r.user?.name || r.userName || 'Anonymous';
                          const initials = getInitials(name);
                          return (
                            <div
                              key={idx}
                              className="group p-5 bg-white/60 hover:bg-white/90 rounded-2xl border border-[#973c00]/8 hover:border-[#973c00]/20 shadow-sm hover:shadow-md transition-all duration-250"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-full bg-[#5A1E12] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                                    {initials || '?'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-[#3b1a08] leading-tight">{name}</p>
                                    {r.createdAt && (
                                      <p className="text-[11px] text-[#973c00]/40">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-0.5 shrink-0">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= (r.rating || 0) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/15 fill-[#973c00]/8'}`} />
                                  ))}
                                </div>
                              </div>
                              {(r.comment || r.review) && (
                                <p className="text-sm text-[#3b1a08]/70 leading-relaxed line-clamp-4">{r.comment || r.review}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Write a Review Tab */}
              {activeTab === 'write-review' && (
                <div className="max-w-lg">
                  {!isAuthenticated ? (
                    <div className="text-center py-12 bg-white/50 rounded-2xl border border-[#973c00]/10">
                      <User className="w-12 h-12 text-[#973c00]/30 mx-auto mb-4" />
                      <p className="text-[#3b1a08] font-semibold mb-2">Please log in to write a review</p>
                      <p className="text-sm text-[#973c00]/60 mb-6">You must be logged in to share your experience with this product.</p>
                      <button
                        onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5A1E12] text-white text-sm font-semibold rounded-xl hover:bg-[#3b1a08] transition-colors shadow-md shadow-[#5A1E12]/20"
                      >
                        Log In
                      </button>
                    </div>
                  ) : hasReviewed ? (
                    <div className="text-center py-12 bg-white/50 rounded-2xl border border-[#973c00]/10">
                      <Star className="w-12 h-12 text-[#973c00]/30 mx-auto mb-4" />
                      <p className="text-[#3b1a08] font-semibold mb-2">You've already reviewed this product</p>
                      <p className="text-sm text-[#973c00]/60 mb-6">Thank you for sharing your experience with us!</p>
                      <button
                        onClick={() => switchTab('reviews')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-[#973c00]/20 text-[#5A1E12] text-sm font-semibold rounded-xl hover:bg-[#5A1E12]/5 transition-colors"
                      >
                        View All Reviews
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Star picker */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#3b1a08] mb-3">Your Rating</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRatingScore(star)}
                              className="transition-transform duration-150 hover:scale-110 active:scale-95"
                            >
                              <Star className={`w-10 h-10 transition-all duration-150 ${
                                star <= ratingScore
                                  ? 'fill-[#973c00] text-[#973c00] drop-shadow-sm'
                                  : 'text-[#973c00]/20 fill-[#973c00]/6 hover:fill-[#973c00]/20 hover:text-[#973c00]/40'
                              }`} />
                            </button>
                          ))}
                        </div>
                        {ratingScore > 0 && (
                          <p className="text-xs text-[#973c00] mt-2 font-semibold">
                            {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][ratingScore - 1]} · {ratingScore}/5
                          </p>
                        )}
                      </div>

                      {/* Review textarea */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#3b1a08] mb-2">Your Review</label>
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your experience with this product…"
                          maxLength={500}
                          rows={5}
                          className="w-full px-4 py-3.5 border border-[#973c00]/15 bg-white/70 rounded-2xl text-[#3b1a08] placeholder-[#973c00]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/20 focus:border-[#5A1E12]/30 resize-none transition-all duration-200 hover:bg-white/90"
                        />
                        <p className="text-[11px] text-[#973c00]/40 mt-1.5 text-right">{review.length}/500</p>
                      </div>

                      {ratingMessage && (
                        <div className={`text-sm px-4 py-3 rounded-xl mb-5 border flex items-center gap-2 ${
                          ratingMessage.includes('successfully')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-[#973c00]/5 text-[#973c00] border-[#973c00]/15'
                        }`}>
                          {ratingMessage.includes('successfully') && <Check className="w-4 h-4 shrink-0" />}
                          {ratingMessage}
                        </div>
                      )}

                      <button
                        onClick={handleSubmitRating}
                        disabled={isSubmittingRating || ratingScore === 0 || review.trim() === ''}
                        className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-2xl hover:bg-[#3b1a08] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#5A1E12]/20 hover:shadow-xl hover:shadow-[#5A1E12]/25 active:scale-[.99]"
                      >
                        {isSubmittingRating ? (
                          <span className="inline-flex items-center gap-2 justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting…
                          </span>
                        ) : 'Submit Review'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Image Lightbox Modal — rendered outside main div to avoid stacking-context trap ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-9999 bg-black/96 backdrop-blur-md animate-in fade-in duration-200 flex flex-col"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-110 z-10000"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image area — fills all space above the thumbnail strip */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Prev button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setModalImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1); }}
                className="absolute left-4 z-10000 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Main image */}
            <div
              className="relative w-full h-full max-w-4xl mx-auto px-20"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[modalImageIndex]}
                alt={product.title}
                fill
                className="object-contain"
                quality={100}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 896px"
              />
            </div>

            {/* Next button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setModalImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0); }}
                className="absolute right-4 z-10000 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          {/* Thumbnail strip — pinned to bottom */}
          {allImages.length > 1 && (
            <div
              className="shrink-0 flex justify-center pb-4 pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2.5 px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-2xl overflow-x-auto max-w-[90vw]">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setModalImageIndex(idx)}
                    className={`relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      modalImageIndex === idx
                        ? 'border-[#973c00] scale-110 shadow-lg shadow-[#973c00]/30'
                        : 'border-white/10 opacity-40 hover:opacity-90'
                    }`}
                  >
                    <Image src={img} alt="thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}