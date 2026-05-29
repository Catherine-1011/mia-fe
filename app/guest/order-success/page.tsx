"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Copy, Check, Package, Loader2, AlertCircle, Mail, Truck, PartyPopper } from "lucide-react";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(""); // internal CUID for payment API calls
  const [displayId, setDisplayId] = useState(""); // customer-facing short ID
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "idle">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const id = sessionStorage.getItem("guestOrderId") || "";
    const dispId = sessionStorage.getItem("guestOrderDisplayId") || "";
    const em = sessionStorage.getItem("guestOrderEmail") || "";
    setOrderId(id);
    setDisplayId(dispId || id);
    setEmail(em);

    // Disable back button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // Handle 3DS redirect: Stripe appends ?payment_intent=pi_xxx to the return_url
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (paymentIntent && id && em) {
      if (redirectStatus === "succeeded") {
        // Confirm with backend
        confirmPayment(id, em);
      } else if (redirectStatus === "failed") {
        setStatus("failed");
        setStatusMessage("Payment failed. Please go back and try again.");
      } else {
        // Poll for status
        pollStatus(id, em, 0);
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmPayment = async (oId: string, oEmail: string) => {
    setStatus("loading");
    try {
      const paymentIntentId = searchParams.get("payment_intent") || "";
      const res = await fetch("https://alpa-be.onrender.com/api/payments/guest/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, customerEmail: oEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setOrderId(data.orderId || oId);
        if (data.displayId) setDisplayId(data.displayId);
        // Clear guest cart if not already cleared
        if (typeof window !== "undefined") {
          localStorage.removeItem("guest_cart_items");
        }
      } else {
        setStatus("failed");
        setStatusMessage(data.message || "Payment confirmation failed.");
      }
    } catch {
      setStatus("failed");
      setStatusMessage("Failed to confirm payment. Please contact support.");
    }
  };

  const pollStatus = async (oId: string, oEmail: string, attempt: number) => {
    if (attempt > 5) {
      setStatus("failed");
      setStatusMessage("Payment is taking longer than expected. Please check your email or contact support.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(
        `https://alpa-be.onrender.com/api/payments/guest/status?orderId=${encodeURIComponent(oId)}&customerEmail=${encodeURIComponent(oEmail)}`
      );
      const data = await res.json();
      const paymentStatus = data.order?.paymentStatus;
      if (paymentStatus === "PAID") {
        setStatus("success");
        if (typeof window !== "undefined") {
          localStorage.removeItem("guest_cart_items");
        }
      } else if (paymentStatus === "FAILED") {
        setStatus("failed");
        setStatusMessage("Payment failed. Please try again.");
      } else {
        // Still PENDING — poll again after 2s
        setTimeout(() => pollStatus(oId, oEmail, attempt + 1), 2000);
      }
    } catch {
      setTimeout(() => pollStatus(oId, oEmail, attempt + 1), 2000);
    }
  };

  const handleCopy = () => {
    if (orderId || displayId) {
      navigator.clipboard.writeText(displayId || orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#ead7b7] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-10 flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-[#5A1E12] animate-spin" />
          <p className="text-[#5A1E12] font-medium">Confirming your payment…</p>
        </div>
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className="min-h-screen bg-[#ead7b7] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-10 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#5A1E12]">Payment Issue</h1>
          <p className="text-[#5A1E12]/70 text-sm">{statusMessage}</p>
          <Link
            href="/checkout"
            className="px-6 py-3 bg-[#5A1E12] text-white rounded-xl font-semibold hover:bg-[#441208] transition"
          >
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#ead7b7] flex flex-col items-center justify-center px-4 py-16">
      {/* Back to Home Button at Top Left */}
      <button
        onClick={handleBackToHome}
        className="absolute top-5 left-5 xs:top-8 xs:left-8 z-50 inline-flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm font-semibold text-[#5A1E12] bg-white/70 hover:bg-white border border-[#5A1E12]/20 hover:border-[#5A1E12]/50 px-3 xs:px-4 py-2 rounded-lg xs:rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </button>

      {/* Logo */}
      <a href="/" className="mb-8">
        <Image src="/images/navbarLogo.png" width={70} height={70} alt="Logo" priority />
      </a>

      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full flex flex-col items-center text-center overflow-hidden">
        {/* Celebratory header band */}
        <div className="w-full bg-[#5A1E12] px-10 py-8 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Thank You!</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Your order has been placed successfully 
            <br />
            
          </p>
        </div>

        <div className="w-full px-10 py-8 flex flex-col gap-6">
          {/* Order ID */}
          {(displayId || orderId) && (
            <div className="w-full bg-[#5A1E12]/5 rounded-xl p-4">
              <p className="text-xs text-[#5A1E12]/50 mb-1 uppercase tracking-wide font-medium">
                Your Order #
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-[#5A1E12] break-all">
                  {displayId || orderId}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-[#5A1E12]/10 transition-colors text-[#5A1E12]"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Email confirmation */}
          {email && (
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 text-left">
              <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 leading-relaxed">
                A confirmation email with your order details has been sent to{" "}
                <span className="font-semibold">{email}</span>.
              </p>
            </div>
          )}

          {/* What happens next */}
          <div className="w-full text-left">
            <p className="text-xs text-[#5A1E12]/50 uppercase tracking-wide font-medium mb-3">
              What happens next
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#5A1E12]/10 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-[#5A1E12]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#5A1E12]">Order Processed</p>
                  <p className="text-xs text-[#5A1E12]/60">We&apos;re packing your items with care</p>
                </div>
              </div>
              <div className="ml-4 w-px h-4 bg-[#5A1E12]/15" />
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#5A1E12]/10 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-[#5A1E12]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#5A1E12]">Order Shipped</p>
                  <p className="text-xs text-[#5A1E12]/60">Your order will be on its way soon</p>
                </div>
              </div>
              <div className="ml-4 w-px h-4 bg-[#5A1E12]/15" />
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#5A1E12]/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-[#5A1E12]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#5A1E12]">Delivered</p>
                  <p className="text-xs text-[#5A1E12]/60">Your package safely arrives to you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3 pt-2">
            {(displayId || orderId) && (
              <Link
                href={`/guest/track-order?orderId=${encodeURIComponent(displayId || orderId)}&email=${encodeURIComponent(email)}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#5A1E12] text-white font-semibold rounded-xl hover:bg-[#441208] transition-all shadow-md"
              >
                <Package className="w-4 h-4" />
                Track Your Order
              </Link>
            )}
            <a
              href="/shop"
              className="w-full py-3 border border-[#5A1E12]/25 text-[#5A1E12] font-medium rounded-xl hover:bg-[#5A1E12]/5 transition-all text-center block"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GuestOrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#ead7b7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A1E12]" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
