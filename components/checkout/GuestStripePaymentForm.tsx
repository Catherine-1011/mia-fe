"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { guestCartUtils } from "@/lib/guestCartUtils";

interface GuestStripePaymentFormProps {
  paymentIntentId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  orderId: string;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
}

export default function GuestStripePaymentForm({
  paymentIntentId,
  customerEmail,
  amount,
  currency,
  orderId,
  onSuccess,
  onError,
}: GuestStripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Persist guest data so it survives a redirect back to this page
      sessionStorage.setItem("guestEmail", customerEmail);
      sessionStorage.setItem("guestOrderId", orderId);

      // Step C1 – confirm the payment with Stripe
      // return_url points back to THIS page (no query params) so that after a
      // redirect-based method (Klarna, Zip, Link) Stripe lands here and the
      // redirect-detection useEffect in GuestCheckoutForm takes over.
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href.split("?")[0],
        },
        redirect: "if_required",
      });

      if (stripeError) {
        const msg = stripeError.message || "Payment failed. Please try again.";
        setErrorMessage(msg);
        onError(msg);
        setIsProcessing(false);
        return;
      }

      // Step C2 – confirm with backend
      const res = await fetch(
        "https://backend.madeinarnhemland.com.au/api/payments/guest/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId, customerEmail }),
        }
      );

      if (!res.ok) {
        let msg = "Order confirmation failed. Please contact support.";
        try {
          const data = await res.json();
          msg = data.message || data.error || msg;
        } catch {}
        setErrorMessage(msg);
        onError(msg);
        setIsProcessing(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        // Store order info for success page — cart is cleared by the parent after navigation
        sessionStorage.setItem("guestOrderId", data.orderId || orderId);
        sessionStorage.setItem("guestOrderEmail", customerEmail);
        if (data.displayId) sessionStorage.setItem("guestOrderDisplayId", data.displayId);
        onSuccess(data.orderId || orderId);
      } else {
        const msg = data.message || "Guest order not found for this payment";
        setErrorMessage(msg);
        onError(msg);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unexpected error. Please try again.";
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: (currency || "aud").toUpperCase(),
  }).format(amount / 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe PaymentElement */}
      <div className="rounded-2xl border border-[#973c00]/15 bg-white/60 p-5">
        <PaymentElement
          options={{
            layout: "tabs",
            fields: { billingDetails: { email: "auto" } },
          }}
        />
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-2xl hover:bg-[#3b1a08] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#5A1E12]/15 active:scale-[.99] flex items-center justify-center gap-2 text-base"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment…
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            Pay {formattedAmount}
          </>
        )}
      </button>

      <p className="text-xs text-center text-[#5A1E12]/50">
        Your payment is secured with 256-bit SSL encryption
      </p>
    </form>
  );
}
