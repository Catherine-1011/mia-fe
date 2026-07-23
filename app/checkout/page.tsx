"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { guestCartUtils } from "@/lib/guestCartUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import EmailCart from "@/components/checkout/emailCart";
import AddressCart from "@/components/checkout/addressCart";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import GuestCheckoutForm from "@/components/checkout/GuestCheckoutForm";
import { Loader2, Tag, X, ChevronDown } from "lucide-react";
import { AppliedSellerCoupon } from "@/lib/api";
import { useCartStock } from "@/hooks/useCartStock";
import { getCountries } from "react-phone-number-input/input";
import { devLogger } from "@/lib/logger";

type SellerPaymentStatus = "pending" | "active" | "processing" | "paid" | "failed";

interface SellerPayment {
  sellerId: string;
  stripeAccountId: string;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: SellerPaymentStatus;
  sellerName?: string;
  error?: string;
}

interface CheckoutPaymentResponse {
  sellerId?: string;
  stripeAccountId?: string;
  clientSecret?: string;
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  sellerName?: string;
  status?: SellerPaymentStatus;
  error?: string;
}

interface CheckoutIntentResponse extends CheckoutPaymentResponse {
  orderId?: string;
  displayId?: string;
  payments?: CheckoutPaymentResponse[];
}

type CartSellerSource = {
  sellerId?: string;
  sellerName?: string;
  sellerUserName?: string;
  seller?: { name?: string };
};

function normalizeCheckoutPayments(data: CheckoutIntentResponse): SellerPayment[] {
  const payments = Array.isArray(data?.payments) && data.payments.length > 0
    ? data.payments
    : data?.clientSecret && data?.paymentIntentId && data?.stripeAccountId
      ? [{
          sellerId: data.sellerId || "seller",
          stripeAccountId: data.stripeAccountId,
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
          amount: data.amount,
          currency: data.currency,
        }]
      : [];

  return payments.map((payment, index: number): SellerPayment => ({
    sellerId: String(payment.sellerId || `seller_${index + 1}`),
    stripeAccountId: String(payment.stripeAccountId || ""),
    clientSecret: String(payment.clientSecret || ""),
    paymentIntentId: String(payment.paymentIntentId || ""),
    amount: Number(payment.amount || data?.amount || 0),
    currency: String(payment.currency || data?.currency || "aud"),
    status: index === 0 ? "active" : "pending",
  })).filter((payment) =>
    Boolean(payment.stripeAccountId && payment.clientSecret && payment.paymentIntentId)
  );
}

// Module-level country name list (built once, reused)
const _rn = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;
const SUMMARY_COUNTRIES: string[] = (() => {
  const names = getCountries()
    .map(code => { try { return _rn?.of(code) ?? code; } catch { return code; } })
    .filter(Boolean) as string[];
  names.sort((a, b) => a.localeCompare(b));
  const auIdx = names.indexOf("Australia");
  if (auIdx !== -1) names.splice(auIdx, 1);
  return ["Australia", ...names];
})();

// stripePromise is created dynamically after the PaymentIntent is created so it
// can be scoped to the seller's connected account (Direct Charges) or to the
// platform account (multi-seller). It is NOT created at module level.

export default function CheckOutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Start from Email step (optional)
  const [showGuestForm, setShowGuestForm] = useState(false);
  // Guest checkout required fields
  const [guestEmail, setGuestEmail] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingSuburb, setShippingSuburb] = useState("");
  const [shippingPostcode, setShippingPostcode] = useState("");
  const [shippingFullAddress, setShippingFullAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZipCode, setShippingZipCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // ── Coupon state ────────────────────────────────────────────────────────────
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedSellerCoupon[]>([]);

  // ── Stripe payment state ──────────────────────────────────────────────────
  const [sellerPayments, setSellerPayments] = useState<SellerPayment[]>([]);
  const [activePaymentIndex, setActivePaymentIndex] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [displayId, setDisplayId] = useState("");
  const [paymentProgress, setPaymentProgress] = useState("");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

  const { cartData, selectedShipping, calculateTotals, updateQuantity, triggerUpdate, clearCart: clearSharedCart } =
    useSharedEnhancedCart();
  const { token, loading, user } = useAuth();
  const { clearCart } = useCart();

  // Track the name entered in step 1 for personalised headings
  const [userName, setUserName] = useState("");

  // ── International shipping (read from cart's localStorage keys) ──────────
  const [internationalShippingEnabled, setInternationalShippingEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetch("https://backend.madeinarnhemland.com.au/api/shipping/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && typeof data?.data?.internationalShippingEnabled === "boolean") {
          setInternationalShippingEnabled(data.data.internationalShippingEnabled);
        }
      })
      .catch(() => {
        setInternationalShippingEnabled(true); // fail open
      });
  }, []);

  const [cartSelectedCountry, setCartSelectedCountry] = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("alpa_shipping_country") ?? "") : ""
  );
  // Country selector in order summary
  const [summaryCountryOpen, setSummaryCountryOpen] = useState(false);
  const [summaryCountrySearch, setSummaryCountrySearch] = useState("");
  const summaryCountryRef = useRef<HTMLDivElement>(null);
  const [cartIntlRate] = useState<{
    zone: string; zoneName: string; cost: number; baseRate: number;
    sellerCount: number; grandTotal: number; gstAmount: number;
    estimatedDays: string; description: string;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alpa_intl_rate");
      if (stored) try { return JSON.parse(stored); } catch {}
    }
    return null;
  });
  const isInternationalOrder = !!cartSelectedCountry && cartSelectedCountry !== "Australia";

  // Get cart items and totals from enhanced cart
  const cartItems = cartData?.cart || [];
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } =
    calculateTotals;
  const sellerNameById = useMemo(() => {
    const names = new Map<string, string>();
    for (const item of cartItems) {
      const itemWithSeller = item as { sellerId?: string; product?: CartSellerSource };
      const product = itemWithSeller.product || {};
      const sellerId = product.sellerId || itemWithSeller.sellerId;
      const sellerName = product.sellerName || product.sellerUserName || product.seller?.name;
      if (sellerId && sellerName && !names.has(sellerId)) names.set(sellerId, sellerName);
    }
    return names;
  }, [cartItems]);
  const activePayment = sellerPayments[activePaymentIndex] || null;
  const stripePromise = useMemo(() => {
    if (!activePayment?.stripeAccountId) return null;
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      devLogger.error(
        "[checkout] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set — PaymentElement cannot mount. " +
        "Add it to mia-fe/.env.local (and to CI/deploy secrets) with a pk_test_/pk_live_ value."
      );
      return null;
    }
    devLogger.log("[checkout] loadStripe for connected account", activePayment.stripeAccountId);
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
      stripeAccount: activePayment.stripeAccountId,
    });
  }, [activePayment?.stripeAccountId]);
  const paidPaymentCount = sellerPayments.filter((payment) => payment.status === "paid").length;
  const hasFailedPayments = sellerPayments.some((payment) => payment.status === "failed");

  // Real-time stock watching — same pattern as cart/page and MiniCart.
  // When another customer buys a product while the user is on this page,
  // the socket fires, quantities are auto-capped, subtotal drops, and then
  // the coupon auto-invalidation effect below fires automatically.
  const cartProductIds = useMemo(() => cartItems.map((i) => i.productId), [cartItems]);
  const cartQuantities = useMemo(
    () => Object.fromEntries(cartItems.map((i) => [i.productId, i.quantity])),
    [cartItems]
  );
  useCartStock(cartProductIds, {
    cartQuantities,
    onOverstock: (productId, newStock) => updateQuantity(productId, newStock),
  });

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (summaryCountryRef.current && !summaryCountryRef.current.contains(e.target as Node)) {
        setSummaryCountryOpen(false);
        setSummaryCountrySearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load checkout data from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem("checkoutStep");
    const savedGuestForm = localStorage.getItem("showGuestForm");
    const savedGuestData = localStorage.getItem("guestCheckoutData");
    const savedPaymentMethod = localStorage.getItem("paymentMethod");

    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
    if (savedGuestForm) {
      setShowGuestForm(JSON.parse(savedGuestForm));
    }
    if (savedGuestData) {
      try {
        const guestData = JSON.parse(savedGuestData);
        setGuestEmail(guestData.guestEmail || "");
        setGuestFirstName(guestData.guestFirstName || "");
        setGuestLastName(guestData.guestLastName || "");
        setGuestPhone(guestData.guestPhone || "");
        setShippingStreet(guestData.shippingStreet || "");
        setShippingCity(guestData.shippingCity || "");
        setShippingState(guestData.shippingState || "");
        setShippingZipCode(guestData.shippingZipCode || "");
      } catch (error) {
        devLogger.error("Failed to load guest data:", error);
      }
    }
    if (savedPaymentMethod) {
      setPaymentMethod(savedPaymentMethod);
    }
    // Restore coupons applied on the cart page
    try {
      const perProduct = localStorage.getItem("cartProductCoupons");
      if (perProduct) {
        const parsed: Record<string, AppliedSellerCoupon> = JSON.parse(perProduct);
        const coupons = Object.values(parsed).filter(Boolean) as AppliedSellerCoupon[];
        if (coupons.length > 0) setAppliedCoupons(coupons);
      }
    } catch {}
  }, []);

  // Save checkout data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("checkoutStep", step.toString());
  }, [step]);

  useEffect(() => {
    if (step === 2) { // Only read when on the address step
      const addressData = localStorage.getItem("addressCartData");
      if (addressData) {
        try {
          const parsed = JSON.parse(addressData);
          handleAddressChange({
            address: parsed.address || "",
            city: parsed.city || "",
            zip: parsed.zip || "",
            state: parsed.state || "",
            country: parsed.country || "",
            phoneNumber: parsed.phoneNumber || "",
          });
        } catch {}
      }
    }
  }, [step]);

  useEffect(() => {
    localStorage.setItem("showGuestForm", JSON.stringify(showGuestForm));
  }, [showGuestForm]);

  useEffect(() => {
    localStorage.setItem(
      "guestCheckoutData",
      JSON.stringify({
        guestEmail,
        guestFirstName,
        guestLastName,
        guestPhone,
        shippingStreet,
        shippingCity,
        shippingState,
        shippingZipCode,
      }),
    );
  }, [
    guestEmail,
    guestFirstName,
    guestLastName,
    guestPhone,
    shippingStreet,
    shippingCity,
    shippingState,
    shippingZipCode,
  ]);

  useEffect(() => {
    localStorage.setItem("paymentMethod", paymentMethod);
  }, [paymentMethod]);

  /* ---------------- PRICE LOGIC (from enhanced cart) ---------------- */
  const shipping = shippingCost;
  const tax = gstAmount;
  const total = grandTotal;
  // Discount is pre-computed by the backend at apply time
  const discountAmount = appliedCoupons.reduce((sum, c) => sum + (c.savings ?? 0), 0);
  const discountedTotal = Math.max(0, total - discountAmount);
  // For international orders use cartIntlRate cost instead of domestic shipping
  const displayShipping = isInternationalOrder && cartIntlRate ? cartIntlRate.cost : shippingCost;
  const displayTotal = isInternationalOrder && cartIntlRate
    ? Math.max(0, subtotal + cartIntlRate.cost - discountAmount)
    : discountedTotal;

  /* ---------------- STEP HANDLERS ---------------- */
  const handleNext = () => {
    setStep((s) => Math.min(3, s + 1));
  };
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleAddressChange = (data: {
    address: string;
    city: string;
    zip: string;
    state: string;
    country: string;
    phoneNumber: string;
  }) => {
    setShippingAddress(data.address);
    setShippingCity(data.city);
    setShippingZipCode(data.zip);
    setShippingState(data.state);
    setShippingCountry(data.country);
    setMobileNumber(data.phoneNumber);
  };

  // ── Stripe: create payment intent ────────────────────────────────────────
  const handleCreateIntent = async () => {
    const currentToken = token || localStorage.getItem("alpa_token");
    if (!currentToken) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }
    if (!selectedShipping) {
      toast.error("Please select a shipping method.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!isInternationalOrder && !selectedShipping) {
      toast.error("Please select a shipping method.");
      return;
    }
    setIsCreatingIntent(true);
    try {
      // Read address details saved by AddressCart into localStorage
      let addrLine  = shippingFullAddress || shippingStreet;
      let addrCity  = shippingCity;
      let addrState = shippingState;
      let addrZip   = shippingZipCode || shippingPostcode;
      let addrPhone = mobileNumber;
      try {
        const saved = localStorage.getItem("addressCartData");
        if (saved) {
          const d = JSON.parse(saved);
          addrLine  = addrLine  || d.address      || "";
          addrCity  = addrCity  || d.city         || "Sydney";
          addrState = addrState || d.state        || "NSW";
          addrZip   = addrZip   || d.zip          || "";
          addrPhone = addrPhone || d.phoneNumber  || "";
        }
      } catch {}

      const res = await fetch(
        "https://backend.madeinarnhemland.com.au/api/payments/create-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            shippingAddress: { addressLine: addrLine },
            shippingMethodId: selectedShipping.id,
            country: shippingCountry,
            city: addrCity || "Sydney",
            state: addrState || "NSW",
            zipCode: addrZip,
            mobileNumber: addrPhone,
          }),
        }
      );

      if (!res.ok) {
        let msg = "Failed to create payment. Please try again.";
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        toast.error(msg);
        return;
      }

      const data = await res.json() as CheckoutIntentResponse;
      devLogger.log("[checkout] create-intent response", data);
      const normalizedPayments = normalizeCheckoutPayments(data).map((payment) => ({
        ...payment,
        sellerName: sellerNameById.get(payment.sellerId) || payment.sellerName,
      }));
      devLogger.log("[checkout] normalized sellerPayments", normalizedPayments);
      if (normalizedPayments.length === 0) {
        toast.error("Payment setup failed. No seller payments were returned.");
        return;
      }
      setSellerPayments(normalizedPayments);
      setActivePaymentIndex(0);
      setOrderId(data.orderId || "");
      setDisplayId(data.displayId || "");
      setPaymentProgress(`0 of ${normalizedPayments.length} seller payments completed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (showGuestForm) {
      if (
        !guestEmail.trim() ||
        !guestFirstName.trim() ||
        !guestLastName.trim() ||
        !guestPhone.trim() ||
        !shippingStreet.trim() ||
        !shippingCity.trim() ||
        !shippingState.trim() ||
        !shippingZipCode.trim() ||
        !paymentMethod
      ) {
        toast.error("Please complete all required guest checkout fields");
        return;
      }
    } else {
      if (
        !shippingAddress.trim() ||
        !paymentMethod ||
        !shippingCity.trim() ||
        !shippingState.trim() ||
        !shippingZipCode.trim() ||
        !shippingCountry.trim() ||
        !mobileNumber.trim()
      ) {
        toast.error("Please complete all required fields");
        return;
      }
    }

    if (!isInternationalOrder && !selectedShipping) {
      toast.error("Please select a shipping method");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before placing an order");
      return;
    }

    setIsPlacingOrder(true);
    try {
      let response;

      const shippingMethodId = selectedShipping?.id;
      const gstId = cartData?.gst?.id;


      if (showGuestForm) {
        const guestCartItems = guestCartUtils.getGuestCart();

        const requestBody = {
          items: guestCartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName: `${guestFirstName} ${guestLastName}`,
          customerEmail: guestEmail,
          customerPhone: guestPhone,
          shippingAddress: {
            street: shippingStreet,
            city: shippingCity,
            state: shippingState,
            zipCode: shippingZipCode,
          },
          paymentMethod: paymentMethod === "card" ? "credit/debit card" : paymentMethod,
          shippingMethodId: shippingMethodId,
          ...(gstId && { gstId }),
          ...(appliedCoupons.length > 0 && { couponCode: appliedCoupons[0].code, couponCodes: appliedCoupons.map(c => c.code) }),
        };

        response = await fetch(
          "https://backend.madeinarnhemland.com.au/api/orders/guest/checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          },
        );
      } else {
        const currentToken = token || localStorage.getItem("alpa_token");

        if (!currentToken) {
          toast.error("Your session has expired. Please log in again.");
          return;
        }

        response = await fetch(
          "https://backend.madeinarnhemland.com.au/api/orders/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({
              shippingAddress: shippingAddress,
              city: shippingCity,
              state: shippingState,
              country: shippingCountry,
              zipCode: shippingZipCode,
              mobileNumber: mobileNumber,
              paymentMethod: paymentMethod === "card" ? "credit/debit card" : paymentMethod,
              shippingMethodId: shippingMethodId,
              ...(gstId && { gstId }),
              ...(appliedCoupons.length > 0 && { couponCode: appliedCoupons[0].code, couponCodes: appliedCoupons.map(c => c.code) }),
            }),
          },
        );
      }

      if (response.ok) {
        toast.dismiss();
        toast.success("Order placed successfully!, Redirecting...");

        const responseData = await response.json().catch(() => ({}));
        const orderId =
          responseData.orderId ||
          responseData.order?.id ||
          responseData.id ||
          "";
        const displayId = responseData.displayId || "";

        setAppliedCoupons([]);
        localStorage.removeItem("cartProductCoupons");
        localStorage.removeItem("alpa_cart_count");
        localStorage.removeItem("checkoutStep");
        localStorage.removeItem("showGuestForm");
        localStorage.removeItem("guestCheckoutData");
        localStorage.removeItem("promoCode");
        localStorage.removeItem("paymentMethod");
        localStorage.removeItem("addressCartData");
        localStorage.removeItem("addressPlaceId");
        localStorage.removeItem("addressValidated");
        localStorage.removeItem("alpa_shipping_country");
        localStorage.removeItem("alpa_intl_rate");

        // Flag the order-confirmation page to clear the cart once it mounts.
        // This avoids clearing the cart while the checkout page is still visible
        // (which would blank the order summary during the page transition).
        localStorage.setItem("alpa_clear_cart_on_arrival", showGuestForm ? "guest" : "user");

        setTimeout(() => {
          router.push(
            orderId
              ? `/order-confirmation?orderId=${orderId}${displayId ? `&displayId=${encodeURIComponent(displayId)}` : ""}&paymentMethod=${paymentMethod}`
              : "/"
          );
        }, 2500);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("alpa_token");
          localStorage.removeItem("user");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        let errorMessage = "Failed to place order";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      devLogger.error("Error placing order:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ── GUEST ROUTING: show guest checkout for unauthenticated users ──────────
  const acknowledgePayment = async (payment: SellerPayment) => {
    const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("alpa_token") : "") || "";
    if (!currentToken) return;
    try {
      await fetch("https://backend.madeinarnhemland.com.au/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ paymentIntentId: payment.paymentIntentId }),
      });
    } catch (err) {
      devLogger.warn("Payment acknowledgement failed; webhook remains authoritative.", err);
    }
  };

  const finishPaidCheckout = async (payments: SellerPayment[]) => {
    await Promise.all(payments.map((payment) => acknowledgePayment(payment)));
    localStorage.removeItem("cartProductCoupons");
    localStorage.removeItem("checkoutStep");
    localStorage.removeItem("alpa_cart_count");
    localStorage.removeItem("showGuestForm");
    localStorage.removeItem("guestCheckoutData");
    localStorage.removeItem("promoCode");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("addressCartData");
    localStorage.removeItem("addressPlaceId");
    localStorage.removeItem("addressValidated");
    localStorage.removeItem("alpa_shipping_country");
    localStorage.removeItem("alpa_intl_rate");
    localStorage.setItem("alpa_clear_cart_on_arrival", "user");
    const params = new URLSearchParams({ orderId });
    if (displayId) params.set("displayId", displayId);
    router.push(`/order-confirmation?${params.toString()}`);
  };

  const handleSellerPaymentSuccess = async () => {
    const nextPayments = sellerPayments.map((payment, index) => {
      if (index === activePaymentIndex) return { ...payment, status: "paid" as const, error: undefined };
      if (index === activePaymentIndex + 1) return { ...payment, status: "active" as const, error: undefined };
      return payment;
    });
    setSellerPayments(nextPayments);
    const paidCount = nextPayments.filter((payment) => payment.status === "paid").length;
    setPaymentProgress(`${paidCount} of ${nextPayments.length} seller payments completed.`);

    if (nextPayments.every((payment) => payment.status === "paid")) {
      await finishPaidCheckout(nextPayments);
      return;
    }
    setActivePaymentIndex((index) => Math.min(index + 1, nextPayments.length - 1));
  };

  const handleSellerPaymentFailure = (message: string) => {
    const nextPayments = sellerPayments.map((payment, index) =>
      index === activePaymentIndex
        ? { ...payment, status: "failed" as const, error: message }
        : payment
    );
    setSellerPayments(nextPayments);
    const paidCount = nextPayments.filter((payment) => payment.status === "paid").length;
    setPaymentProgress(`${paidCount} of ${nextPayments.length} seller payments completed. Please retry remaining payment.`);
  };

  const retrySellerPayment = (index: number) => {
    setSellerPayments((payments) => payments.map((payment, paymentIndex) => {
      if (paymentIndex === index) return { ...payment, status: "active" as const, error: undefined };
      if (payment.status === "active") return { ...payment, status: "pending" as const };
      return payment;
    }));
    setActivePaymentIndex(index);
  };

  const isLoggedIn = !loading && (!!token || !!user);
  const authChecked = !loading;

  if (authChecked && !isLoggedIn) {
    return (
      <section className="relative min-h-screen bg-[#ead7b7] flex flex-col">
        {/* Absolute logo top-left */}
        <Link
          href="/"
          className="absolute top-5 left-5 z-50 font-bold transition-transform hover:scale-105 active:scale-95"
        >
          <Image
            src="/images/navbarLogo.png"
            width={500}
            height={500}
            alt="Logo"
            className="w-10 md:w-16"
            priority
          />
        </Link>
        <GuestCheckoutForm />
      </section>
    );
  }

  return (
    <>
      <style jsx>{`
        .touch-target-44 {
          min-height: 44px;
          min-width: 44px;
        }
      `}</style>
      <section className="relative min-h-screen bg-[#ead7b7] flex flex-col">
      {/* Absolute logo top-left */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-50 font-bold transition-transform hover:scale-105 active:scale-95"
      >
        <Image
          src="/images/navbarLogo.png"
          width={500}
          height={500}
          alt="Logo"
          className="w-8 xs:w-10 md:w-16"
          priority
        />
      </Link>

      {/* Back to Cart button has been moved into the Order Summary header for proper alignment */}

      <div className="flex flex-col lg:flex-row flex-1">
          {/* ================= LEFT: STEPS ================= */}
          <div className="flex-1 px-3 xs:px-4 md:px-8 lg:px-12 pt-16 xs:pt-20 lg:pt-24 pb-6 xs:pb-8 overflow-x-hidden no-scrollbar">
            <div className="p-3 xs:p-6">

              {/* Guest Checkout Form */}
              {showGuestForm ? (
                <div className="space-y-4 xs:space-y-6">
                  <div className="flex justify-between items-center mb-4 xs:mb-6 border-b border-[#5A1E12]/10 pb-3 xs:pb-4">
                    <h3 className="text-xl xs:text-2xl font-bold text-[#5A1E12]">
                      Guest Checkout Details
                    </h3>
                    <button
                      className="text-sm font-medium text-[#5A1E12]/70 hover:text-[#5A1E12] transition-colors touch-target-44"
                      onClick={() => setShowGuestForm(false)}
                    >
                      ← Back to Login
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#5A1E12]">First Name *</label>
                      <input
                        type="text"
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#5A1E12]">Last Name *</label>
                      <input
                        type="text"
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#5A1E12]">Email *</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#5A1E12]">Phone *</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>

                  <div className="border-t border-[#5A1E12]/10 pt-4 xs:pt-6 mt-4 xs:mt-6">
                    <h4 className="text-base xs:text-lg font-semibold text-[#5A1E12] mb-3 xs:mb-4">Shipping Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6 mb-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">Street Address *</label>
                        <input
                          type="text"
                          value={shippingStreet}
                          onChange={(e) => setShippingStreet(e.target.value)}
                          className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                          placeholder="123 Main St"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">City *</label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                          placeholder="New York"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">State / Province *</label>
                        <input
                          type="text"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                          placeholder="NY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">Zip / Postal Code *</label>
                        <input
                          type="text"
                          value={shippingZipCode}
                          onChange={(e) => setShippingZipCode(e.target.value)}
                          className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border border-[#5A1E12]/20 rounded-lg xs:rounded-xl focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all text-sm xs:text-base touch-target-44"
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 xs:pt-6">
                    <button
                      className="w-full px-6 xs:px-8 py-3 xs:py-4 bg-[#5A1E12] text-white rounded-lg font-bold text-base xs:text-lg hover:bg-[#441208] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed touch-target-44"
                      onClick={() => {
                        if (
                          !guestFirstName.trim() ||
                          !guestLastName.trim() ||
                          !guestEmail.trim() ||
                          !guestPhone.trim() ||
                          !shippingStreet.trim() ||
                          !shippingCity.trim() ||
                          !shippingState.trim() ||
                          !shippingZipCode.trim()
                        ) {
                          toast.error("Please fill all guest checkout fields");
                          return;
                        }
                        setStep(3);
                      }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : (
                // Normal 3-step checkout form
                <div className="relative min-h-100">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* <h2 className="text-2xl font-bold mb-6 text-[#5A1E12]">Contact Information</h2> */}
                        <EmailCart onEmailChange={() => {}} onNameChange={setUserName} />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-bold mb-2 text-[#5A1E12]">
                          Hi {(userName || user?.name || "").split(" ")[0] || "there"},
                        </h2>
                        <p className="text-[#5A1E12]/70 mb-6 text-sm">Please provide your address details so we can deliver to you.</p>
                        {isInternationalOrder && internationalShippingEnabled && (
                          <div className="mb-6 p-4 rounded-xl border-2 border-[#5A1E12] bg-[#5A1E12]/5">
                            <p className="text-xs font-semibold text-[#5A1E12] uppercase tracking-wide mb-2">International Shipping</p>
                            {cartIntlRate ? (
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-sm text-[#3b1a08]">International Shipping &mdash; {cartSelectedCountry}</p>
                                  {cartIntlRate.estimatedDays && <p className="text-xs text-[#5A1E12]/60">{cartIntlRate.estimatedDays}</p>}
                                </div>
                                <span className="font-semibold text-sm text-[#5A1E12] shrink-0">${cartIntlRate.cost.toFixed(2)}</span>
                              </div>
                            ) : (
                              <p className="text-sm text-amber-700">⚠ No international rate found. Please return to cart and re-select your country.</p>
                            )}
                          </div>
                        )}
                        <div>
                        <AddressCart
                            key="address-cart-step2"
                            onAddressChange={handleAddressChange}
                            onValidationChange={setIsAddressValid}
                            preselectedCountry={cartSelectedCountry || "Australia"}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {activePayment ? (
                          // ── Stripe payment UI ──────────────────────────
                          <div>
                            <div className="mb-6">
                              <h2 className="text-2xl font-bold text-[#5A1E12]">Complete Payment</h2>
                              <p className="text-[#5A1E12]/60 text-sm mt-1">
                                {paymentProgress || `${paidPaymentCount} of ${sellerPayments.length} seller payments completed.`}
                              </p>
                              {hasFailedPayments && (
                                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                  {paidPaymentCount} of {sellerPayments.length} seller payments completed. Please retry remaining payment.
                                </p>
                              )}
                              {sellerPayments.length > 1 && (
                                <div className="mt-4 space-y-2">
                                  {sellerPayments.map((payment, index) => (
                                    <div key={payment.paymentIntentId} className="flex items-center justify-between rounded-xl border border-[#5A1E12]/10 bg-white/70 px-4 py-3 text-sm">
                                      <div>
                                        <p className="font-semibold text-[#5A1E12]">
                                          {payment.sellerName || `Seller ${index + 1}`}
                                        </p>
                                        {payment.error && <p className="text-xs text-red-600">{payment.error}</p>}
                                      </div>
                                      {payment.status === "failed" ? (
                                        <button
                                          type="button"
                                          onClick={() => retrySellerPayment(index)}
                                          className="rounded-lg bg-[#5A1E12] px-3 py-1.5 text-xs font-semibold text-white"
                                        >
                                          Retry
                                        </button>
                                      ) : (
                                        <span className="capitalize text-[#5A1E12]/70">{payment.status}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Elements
                              key={`${activePayment.stripeAccountId}:${activePayment.paymentIntentId}`}
                              stripe={stripePromise}
                              options={{
                                clientSecret: activePayment.clientSecret,
                                appearance: {
                                  theme: "stripe",
                                  variables: {
                                    colorPrimary: "#5A1E12",
                                    colorBackground: "#ffffff",
                                    colorText: "#3b1a08",
                                    borderRadius: "12px",
                                    fontFamily: "inherit",
                                  },
                                },
                              }}
                            >
                              <StripePaymentForm
                                clientSecret={activePayment.clientSecret}
                                stripeAccountId={activePayment.stripeAccountId}
                                paymentIntentId={activePayment.paymentIntentId}
                                sellerName={activePayment.sellerName || `Seller ${activePaymentIndex + 1}`}
                                amount={activePayment.amount}
                                currency={activePayment.currency}
                                onSuccess={handleSellerPaymentSuccess}
                                onFailure={(msg) => {
                                  handleSellerPaymentFailure(msg);
                                  toast.error(msg);
                                }}
                              />
                            </Elements>
                          </div>
                        ) : (
                          // ── Payment method selection ──────────────────────────
                          <div>
                            <div className="mb-8">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-full bg-[#5A1E12]/10 flex items-center justify-center shrink-0">
                                  <svg className="w-5 h-5 text-[#5A1E12]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div>
                                  <h2 className="text-xl xs:text-2xl font-bold text-[#5A1E12]">Payment Method</h2>
                                  <p className="text-[#5A1E12]/55 text-xs xs:text-sm">Choose how you&apos;d like to complete your purchase</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2.5 xs:space-y-3">
                              {/* Stripe / Credit Card */}
                              <label className={`flex items-center gap-3 xs:gap-4 p-3 xs:p-4 rounded-lg xs:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                paymentMethod === "stripe"
                                  ? "border-[#5A1E12] bg-[#5A1E12]/5 shadow-sm"
                                  : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40 hover:bg-[#5A1E12]/2"
                              }`}>
                                <input
                                  type="radio"
                                  name="paymentMethodSelect"
                                  value="stripe"
                                  checked={paymentMethod === "stripe"}
                                  onChange={() => setPaymentMethod("stripe")}
                                  className="accent-[#5A1E12] w-4 h-4 shrink-0"
                                />
                                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#635bff] to-[#4a44cc] flex items-center justify-center shrink-0 shadow-sm">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-[#3b1a08] text-sm">Credit / Debit Card</p>
                                  <p className="text-xs text-black mt-0.5">Visa, Mastercard, Amex &middot; Powered by Stripe</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded tracking-wide">VISA</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded tracking-wide">MC</span>
                                </div>
                              </label>
                            </div>

                            {/* Security assurance */}
                            <div className="mt-6 flex items-center gap-2 text-xs text-black">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>All transactions are encrypted and secured with 256-bit SSL</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* NAV BUTTONS */}
                  <div className="flex justify-between mt-6 xs:mt-8 pt-4 xs:pt-6 items-start gap-3">
                    <button
                      onClick={handleBack}
                      disabled={step === 1}
                      className={`px-4 xs:px-6 py-2.5 xs:py-3 rounded-lg font-medium transition-all duration-300 touch-target-44 ${
                        step === 1
                          ? "opacity-0 pointer-events-none"
                          : "text-[#5A1E12] border border-[#5A1E12] hover:bg-[#5A1E12] hover:text-white"
                      }`}
                    >
                      Back
                    </button>

                    {step < 3 ? (
                      <button
                        onClick={handleNext}
                        disabled={
                          cartItems.length === 0 ||
                          (step === 2 && !isAddressValid)
                        }
                        className="px-6 xs:px-8 py-2.5 xs:py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 touch-target-44"
                      >
                        Continue
                      </button>
                    ) : sellerPayments.length === 0 ? (
                      <button
                        onClick={handleCreateIntent}
                        disabled={isCreatingIntent || cartItems.length === 0 || !paymentMethod}
                        className="px-6 xs:px-8 py-2.5 xs:py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 touch-target-44"
                      >
                        {isCreatingIntent ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Creating Order&hellip;</>
                        ) : !paymentMethod ? (
                          "Select a Payment Method"
                        ) : (
                          "Proceed to Pay"
                        )}
                      </button>
                    ) : null /* Stripe form has its own submit button */}
                  </div>
                </div>
              )}

              {/* Guest Payment Step */}
              {showGuestForm && step === 3 && (
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-[#5A1E12] mb-4">Payment Method</h3>
                  <div className="space-y-3 mb-6">
                    {["Credit Card", "Debit Card"].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method
                            ? "border-[#5A1E12] bg-[#5A1E12]/5"
                            : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="guestPayment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="accent-[#5A1E12]"
                        />
                        <span className="text-sm font-medium text-[#3b1a08]">{method}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-[#5A1E12]/20 rounded-lg text-[#5A1E12] hover:bg-[#5A1E12]/5 transition text-sm font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || !paymentMethod}
                      className="px-8 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center gap-2"
                    >
                      {isPlacingOrder ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Placing Order…</>
                      ) : (
                        "Place Order"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: ORDER SUMMARY ================= */}
          <div className="w-full lg:w-96 xl:w-105 shrink-0 mt-6 lg:mt-0">
            <div className="bg-white lg:rounded-tl-xl shadow-sm lg:sticky lg:top-0 lg:h-screen flex flex-col">

              {/* ── Fixed header ── */}
              <div className="px-4 xs:px-6 pt-4 xs:pt-6 pb-3 xs:pb-4 border-b shrink-0 flex items-center justify-between gap-3">
                <h2 className="text-lg xs:text-xl font-bold">Order Summary</h2>
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-1.5 text-xs xs:text-sm font-semibold text-[#5A1E12] bg-white hover:bg-[#f5ece3] border border-[#5A1E12]/20 hover:border-[#5A1E12]/50 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Cart
                </Link>
              </div>

              {/* ── Scrollable cart items ── */}
              <div className="flex-1 overflow-y-auto px-4 xs:px-6 py-3 xs:py-4 no-scrollbar">
                <h3 className="font-medium mb-3 xs:mb-4 text-sm text-gray-500 uppercase tracking-wide">
                  Items ({cartItems.length})
                </h3>
                <div className="space-y-3 xs:space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-3 xs:gap-4">
                      <div className="relative w-14 h-14 xs:w-16 xs:h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={
                            item.product.featuredImage || 
                            item.product.images?.[0] || 
                            (item.product as { galleryImages?: string[]; image?: string }).galleryImages?.[0] || 
                            (item.product as { galleryImages?: string[]; image?: string }).image || 
                            "/images/placeholder.png"
                          }
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/placeholder.png";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm xs:text-base truncate">{item.product.title}</p>
                        {item.variant?.attributes && Object.keys(item.variant.attributes).length > 0 && (
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                            {Object.entries(item.variant.attributes).map(([key, attr]) => (
                              <span key={key} className="text-xs text-gray-500 flex items-center gap-1">
                                {attr.hexColor && (
                                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: attr.hexColor }} />
                                )}
                                <span className="capitalize">{key}:</span> {attr.displayValue}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs xs:text-sm text-gray-600">
                          Qty {item.quantity} × ${(item.effectivePrice ?? parseFloat(item.product.price || '0')).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-sm xs:text-base">
                        ${(item.quantity * (item.effectivePrice ?? parseFloat(item.product.price || '0'))).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                {cartItems.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-4 xs:mt-6">Your cart is empty</p>
                )}
              </div>

              {/* ── Fixed bottom: promo + totals ── */}
              <div className="px-4 xs:px-6 pb-4 xs:pb-6 pt-3 xs:pt-4 border-t shrink-0 space-y-3 xs:space-y-4">
                {/* COUPON */}
                {appliedCoupons.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Coupons Applied</label>
                    <div className="space-y-1.5">
                      {appliedCoupons.map((c) => (
                        <div key={c.code} className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-300 rounded-lg">
                          <Tag className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm font-medium text-green-700">{c.code} &mdash; -${c.savings.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Shipping
                    {isInternationalOrder && internationalShippingEnabled && <span className="block text-xs text-gray-400 font-normal">{cartSelectedCountry}</span>}
                  </span>
                  {isInternationalOrder && internationalShippingEnabled
                    ? cartIntlRate
                        ? <span>${cartIntlRate.cost.toFixed(2)}</span>
                        : <span className="text-amber-600 text-xs">TBD</span>
                    : <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                  }
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    GST (incl. {gstPercentage?.toFixed(1)}%)
                  </span>
                  <span>
                    ${(isInternationalOrder && internationalShippingEnabled && cartIntlRate ? cartIntlRate.gstAmount : gstAmount).toFixed(2)}
                  </span>
                </div>
                {appliedCoupons.map(c => (
                  <div key={c.code} className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Coupon {c.code}</span>
                    <span>-${c.savings.toFixed(2)}</span>
                  </div>
                ))}

                <hr />

                <div className="flex justify-between text-lg xs:text-xl font-bold">
                  <span>Total</span>
                  <span>${displayTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
      </div>
    </section>
    </>
  );
}
