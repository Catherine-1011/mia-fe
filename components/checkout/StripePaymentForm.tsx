"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface StripePaymentFormProps {
  paymentIntentId: string;
  token: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string, displayId?: string) => void;
  onError: (msg: string) => void;
}

export default function StripePaymentForm({
  paymentIntentId,
  token,
  amount,
  currency,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
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
      // Step 1 – confirm the payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // required param but we handle redirect manually
          return_url: window.location.origin + "/order-confirmation",
        },
        redirect: "if_required",
      });

      if (stripeError) {
        const msg = stripeError.message || "Payment failed. Please try again.";
        setErrorMessage(msg);
        onError(msg);
        return;
      }

      // Step 2 – notify backend to confirm the order
      const res = await fetch(
        "https://alpa-be.onrender.com/api/payments/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentIntentId }),
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
        return;
      }

      const data = await res.json();
      onSuccess(data.orderId, data.displayId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error. Please try again.";
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase() || "AUD",
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

      {/* Test mode hint */}
      <p className="text-[11px] text-[#973c00]/50 text-center">
        Test mode · use card{" "}
        <span className="font-mono font-semibold tracking-wider">4242 4242 4242 4242</span>
        , any future date, any CVC
      </p>

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
    </form>
  );
}
