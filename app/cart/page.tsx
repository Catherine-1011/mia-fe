"use client";

import { TruckElectric, Plus, Minus, Trash2, Loader, Loader2, ArrowRight, Tag, X, LogIn, User, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useProducts } from "@/hooks/useProducts";
import { useCartStock } from "@/hooks/useCartStock";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { sellerCouponsApi, AppliedSellerCoupon } from "@/lib/api";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

// ─── Per-product coupon state (keyed by productId) ────────────────────────
interface ProductCouponState {
  input: string;
  applied: AppliedSellerCoupon | null;
  error: string;
  loading: boolean;
  showPicker: boolean;
  availableCoupons: any[];
  availableLoading: boolean;
  eligibilityMap: Record<string, boolean | null>; // null=checking, true=eligible, false=not eligible
}

function makeFreshCouponState(): ProductCouponState {
  return { input: "", applied: null, error: "", loading: false, showPicker: false, availableCoupons: [], availableLoading: false, eligibilityMap: {} };
}

// â”€â”€â”€ Available-coupon label helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getCouponLabel(coupon: any): string {
  if (coupon.couponType === "bundle") {
    return `Buy ${coupon.bundleQty} for $${Number(coupon.bundlePrice).toFixed(2)}`;
  }
  if (coupon.discountType === "percentage") {
    const cap = coupon.maxDiscount ? ` (up to $${coupon.maxDiscount} off)` : "";
    return `${coupon.discountValue}% off${cap}`;
  }
  return `$${Number(coupon.discountValue).toFixed(2)} off`;
}

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // ── Click-to-edit qty (same pattern as MiniCart) ─────────────────────────
  const [activeQtyEditor, setActiveQtyEditor] = useState<string | null>(null);
  const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({});
  const qtyEditTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const applyingQtyKeysRef = useRef<Set<string>>(new Set());

  const clearQtyEditTimeout = (key: string) => {
    if (qtyEditTimeoutsRef.current[key]) {
      clearTimeout(qtyEditTimeoutsRef.current[key]);
      delete qtyEditTimeoutsRef.current[key];
    }
  };

  const applyQtyEdit = async (
    item: { productId: string; variantId?: string | null; quantity: number; product: { stock?: number | null } },
    overrideValue?: string
  ) => {
    const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
    if (applyingQtyKeysRef.current.has(itemKey)) return;
    applyingQtyKeysRef.current.add(itemKey);
    clearQtyEditTimeout(itemKey);
    try {
      const rawValue = (overrideValue ?? editingQuantities[itemKey] ?? String(item.quantity)).trim();
      const parsed = Number.parseInt(rawValue, 10);
      const liveStock = stockMap[item.productId]?.stock;
      const stock = liveStock !== undefined ? liveStock : item.product.stock;
      const bounded = Number.isFinite(parsed)
        ? Math.max(1, stock != null ? Math.min(parsed, stock) : parsed)
        : item.quantity;
      if (bounded !== item.quantity) await handleQuantityUpdate(item.productId, bounded, item.variantId);
      setActiveQtyEditor(null);
      setEditingQuantities(prev => { const n = { ...prev }; delete n[itemKey]; return n; });
    } finally {
      applyingQtyKeysRef.current.delete(itemKey);
    }
  };

  const scheduleQtyEditApply = (
    item: { productId: string; variantId?: string | null; quantity: number; product: { stock?: number | null } },
    value: string
  ) => {
    const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
    clearQtyEditTimeout(itemKey);
    qtyEditTimeoutsRef.current[itemKey] = setTimeout(() => { void applyQtyEdit(item, value); }, 2000);
  };

  useEffect(() => {
    return () => { Object.values(qtyEditTimeoutsRef.current).forEach(clearTimeout); };
  }, []);

  // ── International shipping ────────────────────────────────────────────────
  const [shippingCountry, setShippingCountry] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("alpa_shipping_country") ?? "";
    }
    return "";
  });
  const [countryList, setCountryList] = useState<string[]>([]);
  const [countryListLoading, setCountryListLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropRef = useRef<HTMLDivElement>(null);
  const [intlRate, setIntlRate] = useState<null | {
    zone: string; zoneName: string;
    cost: number;       // calculations.shippingCost — seller-multiplied total
    baseRate: number;  // internationalShipping.costPerSeller
    sellerCount: number;
    grandTotal: number; // calculations.grandTotal from backend
    gstAmount: number;
    estimatedDays: string; description: string;
  }>(null);
  const [intlRateLoading, setIntlRateLoading] = useState(false);
  const SHIPPING_API = "https://alpa-be.onrender.com";

  // Persist intlRate to localStorage so the checkout page can display it
  useEffect(() => {
    if (intlRate) {
      localStorage.setItem("alpa_intl_rate", JSON.stringify(intlRate));
    } else {
      localStorage.removeItem("alpa_intl_rate");
    }
  }, [intlRate]);

  const { data: allProducts = [] } = useProducts();
  const productCategoryMap = useMemo(() => {
    return Object.fromEntries(allProducts.map(p => [p.id, p.category]));
  }, [allProducts]);
  const sellerProductMap = useMemo(
    () => Object.fromEntries(allProducts.map(p => [p.id, { sellerId: p.sellerId, sellerName: p.sellerName ?? p.sellerUserName }])),
    [allProducts]
  );

  // Use enhanced cart hook for real-time data
  const {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading,
    refreshing,
    error,
    calculateTotals,
    updateQuantity,
    removeItem,
    fetchCartData,
  } = useSharedEnhancedCart();
  const cartItems = cartData?.cart ?? [];

  const canProceedToCheckout =
    cartItems.length > 0 &&
    !!shippingCountry &&
    (shippingCountry === "Australia" || (!intlRateLoading && !!intlRate));

  const checkoutBlockReason = !shippingCountry
    ? "Select a shipping destination to continue"
    : intlRateLoading
    ? "Fetching shipping price\u2026"
    : shippingCountry !== "Australia" && !intlRate
    ? `Shipping to ${shippingCountry} is currently unavailable`
    : null;

  const handleProceedToCheckout = () => {
    if (!canProceedToCheckout) return;
    if (user) {
      router.push("/checkout");
    } else {
      setShowCheckoutModal(true);
    }
  };

  // Always fetch fresh cart data when user navigates to this page
  useEffect(() => {
    fetchCartData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Per-product coupon state (keyed by productId) ───────────────────────
  const [productCoupons, setProductCoupons] = useState<Record<string, ProductCouponState>>({});

  const updateProductCoupon = useCallback((productId: string, patch: Partial<ProductCouponState>) => {
    setProductCoupons(prev => ({
      ...prev,
      [productId]: { ...(prev[productId] ?? makeFreshCouponState()), ...patch },
    }));
  }, []);

  // Restore persisted coupons on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartProductCoupons");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProductCoupons(prev => {
          const next = { ...prev };
          Object.entries(parsed).forEach(([pid, coupon]) => {
            next[pid] = { ...(next[pid] ?? makeFreshCouponState()), applied: coupon as AppliedSellerCoupon | null };
          });
          return next;
        });
      }
    } catch {}
  }, []);

  // Get calculated totals
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } = calculateTotals;
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [summaryRefreshing, setSummaryRefreshing] = useState(false);

  // Total discount — only count coupons whose key is an actual cart productId
  const totalDiscount = useMemo(() => {
    const cartPids = new Set(cartItems.map(i => i.productId));
    return Object.entries(productCoupons)
      .filter(([pid]) => cartPids.has(pid))
      .reduce((sum, [, s]) => sum + (s.applied?.savings ?? 0), 0);
  }, [productCoupons, cartItems]);

  // Clean up stale coupon entries (e.g. keyed by coupon code instead of productId)
  // that may have been written by the checkout pages
  useEffect(() => {
    if (cartItems.length === 0) return;
    const cartPids = new Set(cartItems.map(i => i.productId));
    setProductCoupons(prev => {
      const staleKeys = Object.keys(prev).filter(pid => !cartPids.has(pid));
      if (staleKeys.length === 0) return prev;
      const next = { ...prev };
      staleKeys.forEach(k => delete next[k]);
      const persisted: Record<string, any> = {};
      Object.entries(next).forEach(([pid, s]) => { if (s.applied) persisted[pid] = s.applied; });
      localStorage.setItem("cartProductCoupons", JSON.stringify(persisted));
      return next;
    });
  }, [cartItems]);

  // Build full world country list using Intl.DisplayNames (no API needed)
  useEffect(() => {
    const ISO_CODES = [
      "AF","AL","DZ","AD","AO","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB",
      "BY","BE","BZ","BJ","BT","BO","BA","BW","BR","BN","BG","BF","BI","CV","KH",
      "CM","CA","CF","TD","CL","CN","CO","KM","CG","CD","CR","HR","CU","CY","CZ",
      "DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FJ","FI","FR",
      "GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS",
      "IN","ID","IR","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KP","KR",
      "KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MG","MW","MY","MV",
      "ML","MT","MH","MR","MU","MX","FM","MD","MC","MN","ME","MA","MZ","MM","NA",
      "NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PY",
      "PE","PH","PL","PT","QA","RO","RU","RW","KN","LC","VC","WS","SM","ST","SA",
      "SN","RS","SC","SL","SG","SK","SI","SB","SO","ZA","SS","ES","LK","SD","SR",
      "SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TO","TT","TN","TR","TM","TV",
      "UG","UA","AE","GB","US","UY","UZ","VU","VE","VN","YE","ZM","ZW","PS","XK",
    ];
    try {
      const rn = new Intl.DisplayNames(["en"], { type: "region" });
      const names = ISO_CODES
        .map((code) => { try { return rn.of(code) ?? ""; } catch { return ""; } })
        .filter(Boolean) as string[];
      names.sort((a, b) => a.localeCompare(b));
      const auIdx = names.indexOf("Australia");
      if (auIdx !== -1) names.splice(auIdx, 1);
      setCountryList(["Australia", ...names]);
    } catch {
      // Fallback: fetch from zones API
      setCountryListLoading(true);
      fetch(`${SHIPPING_API}/api/shipping/international/zones`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const countries: string[] = [];
            data.data.forEach((zone: any) => zone.countries.forEach((c: string) => countries.push(c)));
            countries.sort();
            setCountryList(["Australia", ...countries]);
          }
        })
        .catch(() => {})
        .finally(() => setCountryListLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch international shipping rate when country changes
  useEffect(() => {
    if (!shippingCountry || shippingCountry === "Australia") {
      setIntlRate(null);
      return;
    }
    setIntlRateLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("alpa_token") : null;

    const parseResult = (data: any) => {
      const calc = data.calculations;
      const intl = data.internationalShipping;
      if (calc && intl) {
        setIntlRate({
          zone: intl.zone ?? "",
          zoneName: intl.zoneName ?? "",
          cost: Number(calc.shippingCost ?? calc.totalShippingCost ?? 0),
          baseRate: Number(intl.costPerSeller ?? intl.cost ?? 0),
          sellerCount: Number(intl.sellerCount ?? calc.sellerCount ?? 1),
          grandTotal: Number(calc.grandTotal ?? 0),
          gstAmount: Number(calc.gstAmount ?? 0),
          estimatedDays: intl.estimatedDays ?? "",
          description: intl.description ?? "",
        });
      } else {
        setIntlRate(null);
      }
    };

    if (token) {
      // Authenticated: cart endpoint returns seller-multiplied totals
      fetch(
        `${SHIPPING_API}/api/cart/my-cart?internationalCountry=${encodeURIComponent(shippingCountry)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((r) => r.json())
        .then(parseResult)
        .catch(() => setIntlRate(null))
        .finally(() => setIntlRateLoading(false));
    } else {
      // Guest: calculate-guest with items + internationalCountry
      const items = cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        ...(i.variantId && { variantId: i.variantId }),
      }));
      fetch(`${SHIPPING_API}/api/cart/calculate-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, internationalCountry: shippingCountry }),
      })
        .then((r) => r.json())
        .then(parseResult)
        .catch(() => setIntlRate(null))
        .finally(() => setIntlRateLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingCountry, cartItems.length]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryDropRef.current && !countryDropRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handle quantity update — invalidates applied coupon for that product
  const handleQuantityUpdate = async (productId: string, newQuantity: number, variantId?: string | null) => {
    const itemKey = variantId ? `${productId}:${variantId}` : productId;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));
    setSummaryRefreshing(true);
    if (productCoupons[productId]?.applied) handleRemoveCoupon(productId);
    try {
      await updateQuantity(productId, newQuantity, variantId ?? undefined);
      await fetchCartData(true);
    } finally {
      setSummaryRefreshing(false);
      setUpdatingItems((prev) => { const n = new Set(prev); n.delete(itemKey); return n; });
    }
  };

  // Handle remove item — clears applied coupon for that product
  const handleRemoveItem = async (productId: string, variantId?: string | null) => {
    const itemKey = variantId ? `${productId}:${variantId}` : productId;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));
    setSummaryRefreshing(true);
    if (productCoupons[productId]?.applied) handleRemoveCoupon(productId);
    try {
      await removeItem(productId, variantId ?? undefined);
    } finally {
      setSummaryRefreshing(false);
      setUpdatingItems((prev) => { const n = new Set(prev); n.delete(itemKey); return n; });
    }
  };
  // ── Group cart items by seller ──────────────────────────────────────────
  const sellerGroups = useMemo(() => {
    const groups = new Map<string, { sellerName: string; items: typeof cartItems }>();
    cartItems.forEach((item) => {
      const sellerId = (item.product as any)?.sellerId ?? sellerProductMap[item.productId]?.sellerId ?? "unknown";
      const sellerName = (item.product as any)?.sellerName ?? (item.product as any)?.sellerUserName ?? sellerProductMap[item.productId]?.sellerName ?? sellerId;
      if (!groups.has(sellerId)) groups.set(sellerId, { sellerName, items: [] });
      groups.get(sellerId)!.items.push(item);
    });
    return [...groups.entries()].map(([sellerId, v]) => ({ sellerId, ...v }));
  }, [cartItems]);

  // Real-time stock validation â€” bulk REST snapshot + live socket updates
  const cartProductIds = useMemo(
    () => cartItems.map((i) => i.productId),
    [cartItems]
  );
  const cartQuantities = useMemo(
    () => Object.fromEntries(cartItems.map((i) => [i.productId, i.quantity])),
    [cartItems]
  );
  const { stockMap, canCheckout: stockCanCheckout } = useCartStock(cartProductIds, {
    cartQuantities,
    onOverstock: (productId, newStock) => handleQuantityUpdate(productId, newStock),
  });

  // ── Per-product coupon handlers ──────────────────────────────────────────
  const handleApplyCoupon = async (productId: string, sellerId: string, codeOverride?: string) => {
    const state = productCoupons[productId] ?? makeFreshCouponState();
    const code = (codeOverride ?? state.input).trim();
    if (!code) {
      updateProductCoupon(productId, { error: "Please enter a coupon code." });
      return;
    }
    updateProductCoupon(productId, { error: "", loading: true, applied: null });

    // Send all variants of this product
    const productVariants = cartItems.filter(i => i.productId === productId).map(item => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
    }));

    try {
      const data = await sellerCouponsApi.applyCoupon(code, productVariants);
      if (!data.success) {
        updateProductCoupon(productId, { error: data.message || "Invalid coupon code.", loading: false });
        return;
      }
      if (!data.qualifyingItems || data.qualifyingItems.length === 0) {
        updateProductCoupon(productId, { error: "This product is not eligible for that coupon.", loading: false });
        return;
      }
      const applied: AppliedSellerCoupon = {
        code: data.coupon.code,
        couponType: data.coupon.couponType,
        eligibleSellerId: data.eligibleSellerId,
        savings: data.summary.totalSavingsExGST,
        total: data.summary.discountedInclTotal,
        nonQualifyingItems: data.nonQualifyingItems || [],
      };
      updateProductCoupon(productId, { applied, loading: false, error: "", showPicker: false });

      // Persist
      setProductCoupons(prev => {
        const persisted: Record<string, any> = {};
        Object.entries({ ...prev, [productId]: { ...(prev[productId] ?? makeFreshCouponState()), applied } })
          .forEach(([pid, s]) => { if (s.applied) persisted[pid] = s.applied; });
        localStorage.setItem("cartProductCoupons", JSON.stringify(persisted));
        return prev;
      });
    } catch (err: any) {
      updateProductCoupon(productId, { error: err?.message || "Failed to validate coupon. Please try again.", loading: false });
    }
  };

  const handleRemoveCoupon = (productId: string) => {
    updateProductCoupon(productId, { applied: null, input: "", error: "" });
    setProductCoupons(prev => {
      const persisted: Record<string, any> = {};
      Object.entries(prev).forEach(([pid, s]) => {
        if (pid !== productId && s.applied) persisted[pid] = s.applied;
      });
      localStorage.setItem("cartProductCoupons", JSON.stringify(persisted));
      return prev;
    });
  };

  const handleTogglePicker = async (productId: string, sellerId: string) => {
    const state = productCoupons[productId] ?? makeFreshCouponState();
    const nextOpen = !state.showPicker;
    updateProductCoupon(productId, { showPicker: nextOpen });

    const productVariants = cartItems.filter(i => i.productId === productId).map(item => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
    }));

    const runEligibilityChecks = (coupons: any[]) => {
      const initialMap: Record<string, boolean | null> = {};
      coupons.forEach((c: any) => { initialMap[c.code] = null; });
      setProductCoupons(prev => ({
        ...prev,
        [productId]: { ...(prev[productId] ?? makeFreshCouponState()), eligibilityMap: initialMap },
      }));
      coupons.forEach(async (c: any) => {
        try {
          const data = await sellerCouponsApi.applyCoupon(c.code, productVariants);
          const eligible = !!(data.success && data.qualifyingItems?.length > 0);
          setProductCoupons(prev => {
            const cur = prev[productId] ?? makeFreshCouponState();
            return { ...prev, [productId]: { ...cur, eligibilityMap: { ...(cur.eligibilityMap ?? {}), [c.code]: eligible } } };
          });
        } catch {
          setProductCoupons(prev => {
            const cur = prev[productId] ?? makeFreshCouponState();
            return { ...prev, [productId]: { ...cur, eligibilityMap: { ...(cur.eligibilityMap ?? {}), [c.code]: false } } };
          });
        }
      });
    };

    if (nextOpen && state.availableCoupons.length === 0) {
      updateProductCoupon(productId, { availableLoading: true });
      try {
        const resp = await sellerCouponsApi.getActiveCoupons(sellerId);
        const coupons = resp.coupons || [];
        updateProductCoupon(productId, { availableCoupons: coupons, availableLoading: false });
        if (coupons.length > 0) runEligibilityChecks(coupons);
      } catch {
        updateProductCoupon(productId, { availableLoading: false });
      }
    } else if (nextOpen && state.availableCoupons.length > 0 && Object.keys(state.eligibilityMap ?? {}).length === 0) {
      // Coupons already loaded but eligibility never checked — run now
      runEligibilityChecks(state.availableCoupons);
    }
  };

  const handlePickCoupon = (productId: string, sellerId: string, code: string) => {
    updateProductCoupon(productId, { input: code, showPicker: false, error: "" });
    handleApplyCoupon(productId, sellerId, code);
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex flex-col items-center justify-center text-[#4A3728]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="h-10 w-10 text-[#8B5E3C]" />
        </motion.div>
        <p className="mt-4 font-medium tracking-wide animate-pulse">Curating your cart...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <p className="text-lg text-red-800 mb-6 font-medium">Unable to load cart: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#4A3728] text-white rounded-xl hover:bg-[#2C1810] transition-colors shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-[#FAF7F2] min-h-screen font-sans text-[#4A3728]"
    >
      
      {/* --- HERO SECTION --- */}
      <VideoHeroSection className="h-[60vh]">

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          {/* <span className="mb-4 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-sm font-medium backdrop-blur-md">
            Review your items
          </span> */}
          <h1 className="text-4xl md:text-6xl font-bold mb-2 md:mb-6 tracking-tight">Your Cart Summary</h1>
          <p className="text-sm md:text-xl text-gray-200 max-w-2xl leading-relaxed">
            Review your selected items and proceed to checkout when you&apos;re ready.
          </p>
        </div>
      </VideoHeroSection>

      <div className="max-w-400 mx-auto px-4 md:px-8 py-12 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 items-start">
          
          {/* --- LEFT COLUMN: CART ITEMS GROUPED BY SELLER --- */}
          <div className="space-y-8">
            {cartItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#E6DCC8]"
              >
                <TruckElectric className="h-16 w-16 text-[#D6C0A9] mx-auto mb-4" />
                <p className="text-2xl font-serif text-[#4A3728] mb-2">Your cart is empty</p>
                <p className="text-[#8B5E3C]">Looks like you haven&apos;t made your choice yet.</p>
              </motion.div>
            ) : (
              sellerGroups.map(({ sellerId, sellerName, items: groupItems }) => {
                // Group variants of same product together
                type ProductGroup = { product: (typeof groupItems)[0]["product"]; productId: string; variants: typeof groupItems };
                const productMap = new Map<string, ProductGroup>();
                groupItems.forEach(item => {
                  if (!productMap.has(item.productId)) {
                    productMap.set(item.productId, { product: item.product, productId: item.productId, variants: [] });
                  }
                  productMap.get(item.productId)!.variants.push(item);
                });
                const productGroups = [...productMap.values()];

                const groupSubtotal = groupItems.reduce((sum, item) => {
                  const p = item.effectivePrice ?? parseFloat(item.product.price || "0");
                  return sum + p * item.quantity;
                }, 0);

                return (
                  <div key={sellerId} className="rounded-3xl border border-[#E6DCC8] overflow-hidden shadow-sm bg-white">
                    {/* Seller header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-[#F5F1EB] border-b border-[#E6DCC8]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#5A1E12]/10 flex items-center justify-center text-[#5A1E12] font-bold text-sm shrink-0">
                          {sellerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#4A3728]">{sellerName}</span>
                        <span className="text-xs text-[#8B5E3C] bg-[#E6DCC8] px-2 py-0.5 rounded-full">
                          {productGroups.length} {productGroups.length === 1 ? "product" : "products"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#4A3728]">${groupSubtotal.toFixed(2)}</span>
                    </div>

                    {/* Per-product blocks */}
                    <AnimatePresence>
                      {productGroups.map(({ productId, product, variants }, pIdx) => {
                        const couponState = productCoupons[productId] ?? makeFreshCouponState();

                        return (
                          <motion.div
                            key={productId}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ delay: pIdx * 0.04 }}
                            className="border-b border-[#F0EBE3] last:border-b-0"
                          >
                            {/* Combined product + variant rows */}
                            {variants.map((item) => {
                              const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
                              const isUpdating = updatingItems.has(itemKey);
                              const effectivePrice = item.effectivePrice ?? parseFloat(item.product.price || "0");
                              const variantAttrs = item.variant?.attributes
                                ? Object.entries(item.variant.attributes as Record<string, { value: string; displayValue: string; hexColor?: string | null }>)
                                : null;

                              return (
                                <div
                                  key={itemKey}
                                  className="relative px-3 sm:px-4 py-3 border-t border-[#F5F1EB] first:border-t-0 hover:bg-[#FAF7F2] transition-colors"
                                >
                                  {isUpdating && (
                                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                      <Loader className="h-4 w-4 animate-spin text-[#8B5E3C]" />
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 sm:gap-3">
                                    {/* Product image */}
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F5F1EB] shrink-0">
                                      <Image
                                        src={product.featuredImage || product.images?.[0] || "/images/placeholder.svg"}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>

                                    {/* Right content block */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-2">

                                      {/* Row 1: Title + Price (right-aligned) */}
                                      <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                          <h3 className="font-serif text-sm font-medium text-[#4A3728] leading-tight">{product.title}</h3>
                                          {(product.category || productCategoryMap[productId]) && (
                                            <p className="text-[11px] text-[#8B5E3C] leading-none mt-0.5">{product.category || productCategoryMap[productId]}</p>
                                          )}
                                          {variantAttrs && variantAttrs.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {variantAttrs.map(([key, attr]) =>
                                                attr.hexColor ? (
                                                  <span key={key} title={`${key}: ${attr.displayValue}`}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#5A1E12] bg-[#EAD7B7]/50 border border-[#5A1E12]/15 rounded-full px-2 py-0.5">
                                                    <span className="w-2 h-2 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: attr.hexColor }} />
                                                    {attr.displayValue}
                                                  </span>
                                                ) : (
                                                  <span key={key} className="inline-flex items-center text-xs font-medium text-[#5A1E12] bg-[#EAD7B7]/50 border border-[#5A1E12]/15 rounded-full px-2 py-0.5">
                                                    {attr.displayValue}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        {/* Price — top-right, paired with the product info */}
                                        <div className="text-right shrink-0">
                                          <p className="font-semibold text-sm text-[#4A3728]">${(effectivePrice * item.quantity).toFixed(2)}</p>
                                          <p className="text-[11px] text-[#8B5E3C]">${effectivePrice.toFixed(2)} each</p>
                                        </div>
                                      </div>

                                      {/* Row 2: Qty stepper + Remove */}
                                      <div className="flex items-center justify-between">
                                        {/* Qty stepper */}
                                        <div className="flex items-center bg-white rounded-xl border border-[#E6DCC8] p-0.5 shrink-0">
                                          <button
                                            onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1, item.variantId)}
                                            disabled={item.quantity <= 1 || isUpdating}
                                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#FAF7F2] text-[#4A3728] disabled:opacity-30 transition-colors"
                                          >
                                            <Minus size={11} />
                                          </button>
                                          {activeQtyEditor === itemKey ? (
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              value={editingQuantities[itemKey] ?? String(item.quantity)}
                                              onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, "");
                                                setEditingQuantities(prev => ({ ...prev, [itemKey]: v }));
                                                scheduleQtyEditApply(item, v);
                                              }}
                                              onBlur={(e) => { clearQtyEditTimeout(itemKey); void applyQtyEdit(item, e.currentTarget.value); }}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") { e.preventDefault(); clearQtyEditTimeout(itemKey); void applyQtyEdit(item, (e.currentTarget as HTMLInputElement).value); }
                                                if (e.key === "Escape") { clearQtyEditTimeout(itemKey); setActiveQtyEditor(null); setEditingQuantities(prev => { const n = { ...prev }; delete n[itemKey]; return n; }); }
                                              }}
                                              autoFocus
                                              className="w-7 text-center text-sm font-medium text-[#4A3728] bg-transparent outline-none"
                                              aria-label="Edit quantity"
                                            />
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => { if (!isUpdating) { setActiveQtyEditor(itemKey); setEditingQuantities(prev => ({ ...prev, [itemKey]: String(item.quantity) })); } }}
                                              disabled={isUpdating}
                                              className="w-7 text-center text-sm font-medium text-[#4A3728] hover:text-[#8B5E3C] transition-colors disabled:opacity-30"
                                              title="Click to edit quantity"
                                              aria-label="Edit quantity"
                                            >
                                              {item.quantity}
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1, item.variantId)}
                                            disabled={(() => {
                                              const liveStock = stockMap[item.productId]?.stock;
                                              const stock = liveStock !== undefined ? liveStock : item.product.stock;
                                              return stock != null ? item.quantity >= stock : false;
                                            })() || isUpdating}
                                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#FAF7F2] text-[#4A3728] disabled:opacity-30 transition-colors"
                                          >
                                            <Plus size={11} />
                                          </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                          onClick={() => handleRemoveItem(item.productId, item.variantId)}
                                          disabled={isUpdating}
                                          className="p-1.5 text-[#D6C0A9] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>

                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Per-product coupon section — dropdown only, no text input */}
                            <div className="px-4 py-2.5 bg-[#FDFCFA] border-t border-[#F0EBE3]">
                              {couponState.applied ? (
                                <div className="flex items-center gap-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-green-800">{couponState.applied.code}</p>
                                    <p className="text-xs text-green-600">-${couponState.applied.savings.toFixed(2)} saved</p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveCoupon(productId)}
                                    className="p-1 text-green-600 hover:text-red-500 rounded-lg transition-colors shrink-0"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <button
                                    onClick={() => handleTogglePicker(productId, sellerId)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-[#5A1E12] border border-[#5A1E12]/30 bg-white px-3 py-1.5 rounded-xl hover:bg-[#5A1E12] hover:text-white transition-colors"
                                  >
                                    {couponState.availableLoading ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Tag className="h-3 w-3" />
                                    )}
                                    Apply Coupon
                                    {couponState.showPicker ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </button>

                                  {couponState.error && (
                                    <p className="mt-1 text-xs text-red-500">{couponState.error}</p>
                                  )}

                                  <AnimatePresence>
                                    {couponState.showPicker && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-2 rounded-xl border border-[#E6DCC8] bg-white overflow-hidden">
                                          <div className="px-3 py-1.5 bg-[#F5F1EB] border-b border-[#E6DCC8]">
                                            <p className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wide">Available Coupons</p>
                                          </div>
                                          {couponState.availableLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                              <Loader2 className="h-4 w-4 animate-spin text-[#8B5E3C]" />
                                            </div>
                                          ) : couponState.availableCoupons.length === 0 ? (
                                            <p className="px-3 py-3 text-xs text-[#8B5E3C] text-center">No active coupons for this seller.</p>
                                          ) : (
                                            <ul className="divide-y divide-[#F0EBE3]">
                                              {[...couponState.availableCoupons]
                                                .sort((a, b) => {
                                                  const emap = couponState.eligibilityMap ?? {};
                                                  const score = (e: boolean | null | undefined) => e === true ? 0 : e === null ? 1 : 2;
                                                  return score(emap[a.code]) - score(emap[b.code]);
                                                })
                                                .map((c) => {
                                                  const eligibility = (couponState.eligibilityMap ?? {})[c.code];
                                                  const isChecking = eligibility === null;
                                                  const isIneligible = eligibility === false;
                                                  return (
                                                    <li key={c.id} className={`flex items-center gap-2 px-3 py-2 transition-colors ${isIneligible ? "bg-gray-50/80" : "hover:bg-[#FAF7F2]"}`}>
                                                      <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                          <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isIneligible ? "text-gray-400 bg-gray-100" : "text-[#5A1E12] bg-[#EAD7B7]/60"}`}>
                                                            {c.code}
                                                          </span>
                                                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isIneligible ? "text-gray-400 bg-gray-100" : "text-green-700 bg-green-50"}`}>
                                                            {getCouponLabel(c)}
                                                          </span>
                                                          {isChecking && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                                                          {eligibility === true && (
                                                            <span className="text-xs text-green-600 font-semibold">✓ Eligible</span>
                                                          )}
                                                          {isIneligible && (
                                                            <span className="text-xs text-red-400 font-medium">Not eligible</span>
                                                          )}
                                                        </div>
                                                        {c.expiresAt && (
                                                          <p className={`text-xs mt-0.5 ${isIneligible ? "text-gray-400" : "text-[#8B5E3C]"}`}>
                                                            Expires {new Date(c.expiresAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                                                          </p>
                                                        )}
                                                      </div>
                                                      <button
                                                        onClick={() => handlePickCoupon(productId, sellerId, c.code)}
                                                        disabled={couponState.loading || isIneligible || isChecking}
                                                        className={`shrink-0 text-xs font-semibold border px-2.5 py-1 rounded-lg transition-colors ${
                                                          isIneligible
                                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                                            : isChecking
                                                            ? "text-gray-400 border-gray-200 cursor-wait"
                                                            : "text-[#5A1E12] border-[#5A1E12]/30 hover:bg-[#5A1E12] hover:text-white disabled:opacity-50"
                                                        }`}
                                                      >
                                                        {couponState.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                                                      </button>
                                                    </li>
                                                  );
                                                })}
                                            </ul>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* --- RIGHT COLUMN: SUMMARY (Sticky) --- */}
          <div className="xl:sticky xl:top-22 h-fit">
            <div className="bg-[#EBE5D9] rounded-4xl p-8 shadow-lg border border-white/40 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative background grain */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

                {/* Refreshing overlay */}
                {(summaryRefreshing || refreshing) && (
                  <div className="absolute inset-0 z-50 rounded-4xl bg-[#EBE5D9]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader className="h-8 w-8 animate-spin text-[#8B5E3C]" />
                    <p className="text-sm font-medium text-[#6D5443]">Updating totals...</p>
                  </div>
                )}

                <div className="mb-8 relative z-10">
                    <h2 className="text-3xl font-serif text-[#2C1810]">Summary</h2>
                </div>

                {/* Shipping Country Selection */}
                <div className="space-y-2 mb-8 relative z-20" ref={countryDropRef}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#8B5E3C] mb-2">Shipping Destination</p>
                    <div className="relative">
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => { if (!countryListLoading) { setCountryOpen(o => !o); setCountrySearch(""); } }}
                        className={`w-full flex items-center justify-between bg-white/80 border rounded-xl px-4 py-3 text-sm outline-none transition-all cursor-pointer ${
                          countryOpen
                            ? "border-[#5A1E12] ring-2 ring-[#5A1E12]/10 bg-white"
                            : "border-[#d6b896] hover:border-[#a08050]"
                        } ${countryListLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <span className={shippingCountry ? "text-gray-900" : "text-gray-400"}>
                          {countryListLoading ? "Loading countries…" : shippingCountry || "Select destination country…"}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-[#a08050] transition-transform shrink-0 ${countryOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Dropdown panel */}
                      {countryOpen && (
                        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#d6b896] rounded-xl shadow-xl overflow-hidden">
                          {/* Search */}
                          <div className="p-2 border-b border-[#d6b896]/50">
                            <input
                              autoFocus
                              type="text"
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              onKeyDown={e => {
                                const filtered = countryList.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
                                if (e.key === "ArrowDown" || e.key === "ArrowUp") e.preventDefault();
                                else if (e.key === "Enter" && filtered.length > 0) {
                                  e.preventDefault();
                                  setShippingCountry(filtered[0]);
                                  localStorage.setItem("alpa_shipping_country", filtered[0]);
                                  setCountryOpen(false);
                                  setCountrySearch("");
                                } else if (e.key === "Escape") {
                                  setCountryOpen(false);
                                  setCountrySearch("");
                                }
                              }}
                              placeholder="Search country…"
                              className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                            />
                          </div>
                          {/* List */}
                          <ul className="max-h-52 overflow-y-auto">
                            {countryList
                              .filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
                              .map(c => (
                                <li
                                  key={c}
                                  onMouseDown={() => {
                                    setShippingCountry(c);
                                    localStorage.setItem("alpa_shipping_country", c);
                                    setCountryOpen(false);
                                    setCountrySearch("");
                                  }}
                                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                    c === shippingCountry
                                      ? "bg-[#5A1E12] text-white font-medium"
                                      : "text-gray-800 hover:bg-[#f5e6d3] hover:text-[#5A1E12]"
                                  }`}
                                >
                                  {c}
                                </li>
                              ))}
                            {countryList.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                              <li className="px-4 py-3 text-sm text-gray-400 text-center">No countries found</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {intlRateLoading && (
                      <div className="flex items-center gap-2 text-sm text-[#8B5E3C] px-1">
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                        <span>Fetching shipping price&hellip;</span>
                      </div>
                    )}

                    {!intlRateLoading && intlRate && (
                      <div className="p-3 bg-white/70 rounded-xl border border-[#E6DCC8]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm text-[#4A3728]">International Shipping</p>
                            <p className="text-xs text-[#8B5E3C] mt-0.5">{intlRate.description}</p>
                            <p className="text-xs text-[#8B5E3C]">{intlRate.estimatedDays}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className="font-bold text-[#4A3728] text-base">${intlRate.cost.toFixed(2)}</span>
                            {intlRate.sellerCount > 1 && (
                              <span className="text-[10px] text-amber-600 font-medium">{intlRate.sellerCount} × ${intlRate.baseRate.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {shippingCountry === "Australia" && (
                      <div className="space-y-2">
                        {cartData?.availableShipping.filter(s => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name) && !/international/i.test(s.name)).map((shipping) => {
                          const calc = cartData?.shippingCalculations?.[shipping.id];
                          const isCalculating = !cartData?.shippingCalculations;
                          const totalCost = Number(calc ? calc.totalShippingCost : parseFloat(shipping.cost || "0")) || 0;
                          const sellerCount = calc?.sellerCount ?? 1;
                          const baseCost = Number(calc?.baseShippingCost ?? parseFloat(shipping.cost || "0")) || 0;

                          return (
                            <label
                              key={shipping.id}
                              className={`group cursor-pointer block relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                selectedShipping?.id === shipping.id
                                  ? "border-[#4A3728] bg-white shadow-md"
                                  : "border-transparent bg-white/40 hover:bg-white/70"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedShipping?.id === shipping.id ? "border-[#4A3728]" : "border-[#D6C0A9]"
                                  }`}>
                                    {selectedShipping?.id === shipping.id && <div className="w-2.5 h-2.5 rounded-full bg-[#4A3728]" />}
                                  </div>
                                  <input
                                    type="radio"
                                    name="shipping"
                                    className="hidden"
                                    checked={selectedShipping?.id === shipping.id}
                                    onChange={() => setSelectedShipping(shipping)}
                                  />
                                  <div>
                                    <p className="font-bold text-[#4A3728] text-sm">{shipping.name}</p>
                                    <p className="text-xs text-[#8B5E3C]">{shipping.estimatedDays}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="font-bold text-[#4A3728]">
                                    {isCalculating
                                      ? <Loader2 className="h-4 w-4 animate-spin" />
                                      : `$${totalCost.toFixed(2)}`}
                                  </span>
                                  {sellerCount > 1 && calc && (
                                    <span className="text-[10px] text-amber-600 font-medium">{sellerCount} × ${baseCost.toFixed(2)}</span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                </div>

                <div className="space-y-4 border-t border-[#D6C0A9]/30 pt-6 relative z-10">
                    <div className="flex justify-between text-[#6D5443]">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#4A3728]">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6D5443]">
                        <span>Shipping</span>
                        <span className="font-medium text-[#4A3728]">
                          {!shippingCountry
                            ? <span className="text-xs text-[#8B5E3C] italic">Select country above</span>
                            : shippingCountry === "Australia"
                            ? selectedShipping
                              ? `$${shippingCost.toFixed(2)}`
                              : <span className="text-xs text-[#8B5E3C] italic">Select method above</span>
                            : intlRateLoading
                            ? <Loader2 className="h-3 w-3 animate-spin inline" />
                            : intlRate
                            ? `$${intlRate.cost.toFixed(2)}`
                            : "-"}
                        </span>
                    </div>
                    <div className="flex justify-between text-[#6D5443]">
                        <span>GST <span className="text-xs">(incl. {gstPercentage?.toFixed(1)}%)</span></span>
                        <span className="font-medium text-[#4A3728]">${gstAmount.toFixed(2)}</span>
                    </div>

                    {/* Per-product discount lines */}
                    {Object.entries(productCoupons).map(([pid, s]) =>
                      s.applied ? (
                        <div key={pid} className="flex justify-between text-green-700 bg-green-50/60 px-3 py-2 rounded-lg">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <Tag className="h-3.5 w-3.5 shrink-0" />
                            {s.applied.code}
                          </span>
                          <span className="font-bold text-sm">-${s.applied.savings.toFixed(2)}</span>
                        </div>
                      ) : null
                    )}

                    {/* Currency note */}
                    <div className="text-xs text-[#8B5E3C]/70 text-center pt-2 border-t border-[#D6C0A9]/20">
                        All prices are in AUD (Australian Dollars)
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-white/50 relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-lg font-bold text-[#4A3728]">Grand Total</span>
                        <div className="text-right">
                          {totalDiscount > 0 && (
                            <p className="text-xs text-green-600 font-medium mb-0.5">-${totalDiscount.toFixed(2)} saved</p>
                          )}
                          <span className="text-2xl font-serif font-bold text-[#2C1810]">
                            ${Math.max(0, (intlRate ? intlRate.grandTotal : grandTotal) - totalDiscount).toFixed(2)}
                          </span>
                          {intlRate && (
                            <p className="text-xs text-[#8B5E3C] mt-0.5">Incl. intl. shipping</p>
                          )}
                        </div>
                    </div>

                    <button
                        onClick={handleProceedToCheckout}
                        disabled={!canProceedToCheckout}
                        className="group w-full py-4 bg-[#5A1E12] text-[#FAF7F2] rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#4a180f] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-[#b09080] disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                    >
                        {intlRateLoading ? (
                          <><Loader2 className="h-5 w-5 animate-spin" />Fetching shipping price…</>
                        ) : (
                          <>Proceed to Checkout<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                    {checkoutBlockReason && (
                      <p className="text-xs text-center text-[#8B5E3C] mt-2">{checkoutBlockReason}</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

    {/* Guest Checkout Modal */}
    <AnimatePresence>
      {showCheckoutModal && (
        <motion.div
          key="checkout-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowCheckoutModal(false)}
        >
          <motion.div
            key="checkout-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF7F2] rounded-2xl shadow-2xl w-full max-w-md p-8"
          >
            {/* Close button */}
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-[#8B5E3C] hover:text-[#5A1E12] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#5A1E12]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-7 w-7 text-[#5A1E12]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2C1810] mb-2">How would you like to proceed?</h2>
              <p className="text-sm text-[#8B5E3C]">
                You&apos;re currently not logged in. Please choose an option below to continue.
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-3.5 bg-[#5A1E12] text-[#FAF7F2] rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#4a180f] hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => setShowCheckoutModal(false)}
              >
                <LogIn className="h-5 w-5" />
                Login to Your Account
              </Link>

              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  router.push("/checkout");
                }}
                className="w-full py-3.5 bg-white border-2 border-[#5A1E12] text-[#5A1E12] rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#5A1E12]/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <User className="h-5 w-5" />
                Continue as Guest
              </button>
            </div>

            <p className="text-center text-xs text-[#8B5E3C] mt-5">
              Logging in lets you track your orders and save your details for faster checkout.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </motion.main>
  );
}
// added