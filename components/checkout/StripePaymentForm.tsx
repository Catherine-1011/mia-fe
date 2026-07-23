"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

interface StripePaymentFormProps {
  clientSecret: string;
  stripeAccountId: string;
  paymentIntentId: string;
  sellerName?: string;
  amount?: number;
  currency?: string;
  onSuccess: () => void;
  onFailure: (msg: string) => void;
}

export default function StripePaymentForm({
  clientSecret,
  stripeAccountId,
  paymentIntentId,
  sellerName,
  amount = 0,
  currency = "aud",
  onSuccess,
  onFailure,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedAmount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: (currency || "aud").toUpperCase(),
  }).format(Number(amount || 0) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href.split("?")[0],
        },
        redirect: "if_required",
      });

      if (error) {
        const msg = error.message || "Payment failed. Please try again.";
        setErrorMessage(msg);
        onFailure(msg);
        return;
      }

      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error. Please try again.";
      setErrorMessage(msg);
      onFailure(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-[#973c00]/15 bg-white/60 p-5">
        <div className="mb-4 text-sm text-[#5A1E12]/70">
          <div className="font-semibold text-[#5A1E12]">{sellerName || "Seller payment"}</div>
          <div>{formattedAmount}</div>
        </div>
        <PaymentElement
          key={`${stripeAccountId}:${paymentIntentId}:${clientSecret}`}
          options={{
            layout: "tabs",
            fields: { billingDetails: { email: "auto" } },
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-2xl hover:bg-[#3b1a08] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#5A1E12]/15 active:scale-[.99] flex items-center justify-center gap-2 text-base"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
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
