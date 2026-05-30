"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Package,
  Loader2,
  ArrowRight,
  Star,
  Send,
  ShoppingBag,
  Home,
  MessageSquare,
  Store,
  Truck,
  Box,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { guestCartUtils } from "@/lib/guestCartUtils";
import { SegregatedOrder, SellerOrder, OrderStatus as SellerOrderStatus, ORDER_STATUS_MAPPING } from "@/types/seller-orders";
import { detectMultiSellerOrder, logApiResponse } from "@/lib/orderUtils";

interface OrderStatus {
  orderId: string;
  displayId?: string;
  status: string;
  paymentStatus: string;
  isMultiSeller?: boolean;
  segregatedData?: SegregatedOrder;
}

// ─── Feedback Form ───────────────────────────────────────────────────────────
function FeedbackForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("http://134.199.161.119:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          rating: String(rating),
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center px-6 gap-5 py-12"
      >
        <div className="w-20 h-20 rounded-full bg-[#5A1E12]/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#5A1E12]" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#3b1a08] mb-1">Thank you!</h3>
          <p className="text-sm text-[#973c00]/70 leading-relaxed max-w-xs mx-auto">
            Your feedback means the world to us. We&apos;re constantly improving to give you a better experience.
          </p>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={20}
              className={s <= rating ? "fill-[#973c00] text-[#973c00]" : "fill-[#EAD7B7] text-[#EAD7B7]"}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5A1E12]/10 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-[#5A1E12]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#3b1a08] leading-tight">How was your experience?</h2>
          <p className="text-xs text-[#973c00]/60 mt-0.5">Your feedback helps us improve for everyone</p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
          Overall Rating <span className="text-[#973c00]">*</span>
        </label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label={`Rate ${s} out of 5`}
            >
              <Star
                size={32}
                className={`transition-colors duration-150 ${
                  s <= (hovered || rating)
                    ? "fill-[#973c00] text-[#973c00]"
                    : "fill-stone-200 text-stone-200"
                }`}
              />
            </button>
          ))}
          <AnimatePresence mode="wait">
            {(hovered || rating) > 0 && (
              <motion.span
                key={hovered || rating}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="ml-2 text-sm font-semibold text-[#5A1E12]"
              >
                {ratingLabels[hovered || rating]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
            Name <span className="text-[#973c00]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#973c00]/20 bg-white/70 text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
            Email <span className="text-[#973c00]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#973c00]/20 bg-white/70 text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
          Your Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience — what went well, what could be better…"
          rows={4}
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#973c00]/20 bg-white/70 text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#5A1E12] text-white text-sm font-bold hover:bg-[#3b1a08] active:scale-[0.98] transition-all shadow-md shadow-[#5A1E12]/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {submitting ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
// ─── Seller Order Card ───────────────────────────────────────────────────────
function SellerOrderCard({ sellerOrder, parentStatus }: { sellerOrder: SellerOrder, parentStatus: string }) {
  const statusColor = ORDER_STATUS_MAPPING[sellerOrder.status as keyof typeof ORDER_STATUS_MAPPING]?.color || "#10b981";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl border border-white/10 p-4 mb-3"
    >
      {/* Seller Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Store className="w-4 h-4 text-white/70" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{sellerOrder.seller.name}</p>
            <p className="text-xs text-white/50">Sub Order: #{sellerOrder.subOrderId.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        <div className="text-right">
          <div 
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
            {ORDER_STATUS_MAPPING[sellerOrder.status as keyof typeof ORDER_STATUS_MAPPING]?.label || sellerOrder.status}
          </div>
          <p className="text-xs text-white/40 mt-1">${parseFloat(sellerOrder.subTotal).toFixed(2)}</p>
        </div>
      </div>
      
      {/* Items Count */}
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Box className="w-3 h-3" />
        <span>{sellerOrder.items.length} {sellerOrder.items.length === 1 ? 'item' : 'items'}</span>
        {sellerOrder.trackingNumber && (
          <>
            <span>•</span>
            <Truck className="w-3 h-3" />
            <span>Tracking: {sellerOrder.trackingNumber}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const { clearCart } = useCart();
  const { clearCart: clearSharedCart, triggerUpdate } = useSharedEnhancedCart();
  const orderId = searchParams.get("orderId");
  const displayId = searchParams.get("displayId");
  const paymentMethodParam = searchParams.get("paymentMethod");
  const isCOD = paymentMethodParam === "cod";

  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear the cart here — after the confirmation page has mounted — so the
  // checkout order summary stays fully visible during the page transition.
  useEffect(() => {
    const flag = localStorage.getItem("alpa_clear_cart_on_arrival");
    if (!flag) return;
    localStorage.removeItem("alpa_clear_cart_on_arrival");
    if (flag === "guest") {
      guestCartUtils.clearGuestCart();
      triggerUpdate();
    } else {
      clearSharedCart();
      clearCart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Disable back button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!orderId) { return; }

    const checkStatus = async () => {
      try {
        const currentToken = token || localStorage.getItem("alpa_token");
        
        // Get basic order status
        const res = await fetch(
          `http://134.199.161.119:5000/api/payments/status/${orderId}`,
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );
        
        let basicOrderStatus: OrderStatus = {
          orderId,
          status: "Confirmed",
          paymentStatus: isCOD ? "Cash on Delivery" : "Paid",
          isMultiSeller: false,
          segregatedData: undefined,
        };
        
        if (res.ok) {
          const data = await res.json();
          logApiResponse('/api/payments/status', data, orderId);
          
          basicOrderStatus = {
            orderId,
            displayId: data.order?.displayId,
            status: data.status || data.order?.status || "Confirmed",
            paymentStatus: isCOD
              ? "Cash on Delivery"
              : data.paymentStatus || data.order?.paymentStatus || "Paid",
            isMultiSeller: data.isMultiSeller || false,
            segregatedData: undefined,
          };
        }
        
        // Always try to fetch segregated data for this order to check if it's multi-seller
        try {
          console.log('🔍 Checking for segregated order data...');
          const segregatedRes = await fetch(
            `http://134.199.161.119:5000/api/orders/segregated/${orderId}`,
            { headers: { Authorization: `Bearer ${currentToken}` } }
          );
          
          if (segregatedRes.ok) {
            const segregatedData = await segregatedRes.json();
            logApiResponse('/api/orders/segregated', segregatedData, orderId);
            
            if (segregatedData.success && segregatedData.order) {
              basicOrderStatus.isMultiSeller = true;
              basicOrderStatus.segregatedData = segregatedData.order;
              console.log('✅ Multi-seller order data loaded successfully');
            }
          } else if (segregatedRes.status === 404) {
            console.log('📦 Single-seller order confirmed (no segregated data)');
          } else {
            console.log('⚠️ Error fetching segregated data, status:', segregatedRes.status);
          }
        } catch (error) {
          console.log("❌ Error fetching segregated data:", error);
        }
        
        console.log('✅ Order confirmation data ready:', {
          orderId: basicOrderStatus.orderId,
          status: basicOrderStatus.status,
          paymentStatus: basicOrderStatus.paymentStatus,
          isMultiSeller: basicOrderStatus.isMultiSeller,
          hasSegregatedData: !!basicOrderStatus.segregatedData,
          sellerCount: basicOrderStatus.segregatedData?.sellerOrders?.length || 0
        });
        
        setOrderStatus(basicOrderStatus);
      } catch (error) {
        console.log("Error in checkStatus:", error);
        setOrderStatus({
          orderId,
          status: "Confirmed",
          paymentStatus: isCOD ? "Cash on Delivery" : "Paid",
          isMultiSeller: false,
          segregatedData: undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [orderId, token]);

  // No orderId → render nothing while the redirect fires (avoids spinner flash)
  if (!orderId) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAD7B7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#973c00] animate-spin" />
          <p className="text-[#5A1E12] font-medium">Confirming your order…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT: Order Success (35%) ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="lg:w-[35%] bg-[#5A1E12] text-white flex flex-col items-center justify-between px-10 py-12 gap-8 relative overflow-hidden"
      >

          {/* subtle decorative rings */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full border border-white/5" />
          <div className="absolute -top-6 -left-6 w-40 h-40 rounded-full border border-white/5" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full border border-white/5" />

          {/* Logo */}
          <Link href="/" className="z-10 self-start">
            <Image
              src="/images/navbarLogo.png"
              width={120}
              height={120}
              alt="Logo"
              className="w-16"
            />
          </Link>

          {/* Success centre */}
          <div className="flex flex-col items-center text-center gap-5 z-10 flex-1 justify-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
              className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/50 mb-1">Order Placed</p>
              <h1 className="text-3xl font-extrabold leading-tight mb-2">Order Confirmed!</h1>
              <p className="text-sm text-white/65 leading-relaxed max-w-55 mx-auto">
                Thank you for your purchase. Your payment was successful and your order is being processed.
              </p>
            </motion.div>

            {/* Order details */}
            {orderStatus && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full space-y-3"
              >
                {/* Main Order Info */}
                <div className="bg-white/5 rounded-2xl px-4 border border-white/10 divide-y divide-white/10">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Order ID</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {orderStatus.displayId || displayId || `#${orderStatus.orderId.slice(-8).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Status</span>
                    <span className="text-xs font-semibold text-[#EAD7B7]">{orderStatus.status}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Payment</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#EAD7B7]">
                      {isCOD
                        ? <Package className="w-3 h-3" />
                        : <CheckCircle className="w-3 h-3" />}
                      {orderStatus.paymentStatus}
                    </span>
                  </div>
                  {orderStatus.isMultiSeller && orderStatus.segregatedData && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total</span>
                      <span className="text-sm font-bold text-[#EAD7B7]">
                        ${parseFloat(orderStatus.segregatedData.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Multi-seller breakdown */}
                {orderStatus.isMultiSeller && orderStatus.segregatedData ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-white/60 mt-2">
                      <Store className="w-3 h-3" />
                      <span className="font-semibold">Multiple Sellers ({orderStatus.segregatedData.sellerOrders.length})</span>
                    </div>
                    {orderStatus.segregatedData.sellerOrders.map((sellerOrder, index) => (
                      <SellerOrderCard
                        key={sellerOrder.sellerId}
                        sellerOrder={sellerOrder} parentStatus={""}                      />
                    ))}
                  </div>
                ) : null}
              </motion.div>
            )}
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col gap-2.5 w-full z-10"
          >
            <Link
              href="/shop"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-[#5A1E12] text-sm font-bold hover:bg-[#EAD7B7] transition-all shadow-sm active:scale-[0.97]"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-all active:scale-[0.97]"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </motion.div>

          {/* Footer note */}
          <div className="flex items-center gap-1.5 text-white/30 text-[11px] z-10">
            <Package className="w-3 h-3" />
            A confirmation email will be sent shortly
          </div>
      </motion.div>

      {/* ── RIGHT: Feedback (65%) ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.45 }}
        className="lg:w-[65%] bg-[#fdf8f3] px-10 lg:px-16 py-12 flex flex-col justify-center"
      >
        {/* Decorative top strip */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-px flex-1 bg-[#973c00]/10" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#973c00]/40">Share your experience</span>
          <div className="h-px flex-1 bg-[#973c00]/10" />
        </div>

        <FeedbackForm
          defaultName={user?.name || ""}
          defaultEmail={user?.email || ""}
        />
      </motion.div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EAD7B7] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#973c00] animate-spin" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
