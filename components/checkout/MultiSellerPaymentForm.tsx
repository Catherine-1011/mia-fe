"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { devLogger } from "@/lib/logger";

export interface SellerBreakdownLine {
  sellerId: string;
  stripeAccountId?: string | null;
  grossAmountCents: number;
  sellerName?: string;
  paymentFlow?: string;
  paymentAccountType?: string;
}

interface SellerChargeResult {
  sellerId: string;
  stripeAccountId?: string | null;
  paymentIntentId?: string;
  status: string; // "succeeded" | "requires_action" | "failed" | ...
  clientSecret?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

interface FinalizeResponse {
  success?: boolean;
  message?: string;
  error?: string;
  paymentStatus?: string;
  payments?: SellerChargeResult[];
}

interface MultiSellerPaymentFormProps {
  orderId: string;
  // Exactly one identity must be provided: an authenticated user's JWT, or a
  // guest's email (ownership is verified server-side against the order —
  // same trust model /guest/confirm already uses elsewhere in this app).
  authToken?: string;
  guestEmail?: string;
  sellerBreakdown: SellerBreakdownLine[];
  totalAmountCents: number;
  currency?: string;
  onSuccess: () => void;
  onFailure: (msg: string) => void;
}

const API_BASE = "https://backend.madeinarnhemland.com.au/api";

// One card, collected once on the platform account, then confirmed as a
// separate Direct Charge PaymentIntent per seller by the backend
// (/api/payments/multi-seller/finalize or its guest counterpart). See
// Stripe's documented pattern at docs.stripe.com/connect/direct-charges-multiple-accounts.
export default function MultiSellerPaymentForm({
  orderId,
  authToken,
  guestEmail,
  sellerBreakdown,
  totalAmountCents,
  currency = "aud",
  onSuccess,
  onFailure,
}: MultiSellerPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<SellerChargeResult[] | null>(null);

  const normalizePaymentStatus = (status?: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "paid") return "succeeded";
    if (normalized === "failed") return "failed";
    return normalized;
  };

  const isSucceededStatus = (status?: string) => normalizePaymentStatus(status) === "succeeded";
  const isProcessingStatus = (status?: string) => ["processing", "requires_capture"].includes(normalizePaymentStatus(status));
  const isActionRequiredStatus = (status?: string) => normalizePaymentStatus(status) === "requires_action";
  const isFailedStatus = (status?: string) =>
    ["failed", "requires_payment_method", "canceled", "cancelled"].includes(normalizePaymentStatus(status));

  const sanitizePayments = (payments: SellerChargeResult[] = []): SellerChargeResult[] =>
    payments.map((payment) => ({
      ...payment,
      status: normalizePaymentStatus(payment.status),
      clientSecret: payment.status === "requires_action" ? payment.clientSecret : undefined,
    }));

  const callFinalize = async (): Promise<FinalizeResponse> => {
    const isGuest = !authToken && !!guestEmail;
    const endpoint = isGuest
      ? `${API_BASE}/payments/multi-seller/guest/finalize`
      : `${API_BASE}/payments/multi-seller/finalize`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!isGuest) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(isGuest ? { orderId, customerEmail: guestEmail } : { orderId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || "Payment failed. Please try again.");
    }
    if (data.success === false) {
      throw new Error(data.message || data.error || "Payment failed. Please try again.");
    }
    return data;
  };

  const formattedTotal = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(totalAmountCents / 100);

  // Rare edge case: a cloned PaymentMethod can still require a 3DS step-up on
  // a specific connected account even though the card was already
  // authenticated once on the platform. Complete it with a Stripe.js instance
  // scoped to that account — no re-entry of card details required.
  const completeRequiresAction = async (result: SellerChargeResult) => {
    if (!result.clientSecret || !result.stripeAccountId || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return result;
    const scopedStripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
      stripeAccount: result.stripeAccountId,
    });
    if (!scopedStripe) return result;
    const { paymentIntent, error } = await scopedStripe.handleNextAction({
      clientSecret: result.clientSecret,
    });
    if (error) return { ...result, status: "failed", error: error.message };
    return { ...result, status: paymentIntent?.status || result.status };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error: setupError } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: window.location.href.split("?")[0] },
        redirect: "if_required",
      });

      if (setupError) {
        const msg = setupError.message || "Card setup failed. Please try again.";
        setErrorMessage(msg);
        onFailure(msg);
        return;
      }

      const data = await callFinalize();
      devLogger.log("[multi-seller checkout] finalize response", {
        success: data.success,
        paymentStatus: data.paymentStatus,
        paymentCount: data.payments?.length || 0,
      });
      let payments = sanitizePayments(data.payments || []);
      if (payments.length === 0) {
        throw new Error("Payment failed. No seller payment records were returned.");
      }

      const needsAction = payments.filter((p) => p.status === "requires_action");
      if (needsAction.length > 0) {
        const completed = await Promise.all(needsAction.map(completeRequiresAction));
        const byId = new Map(completed.map((c) => [c.sellerId, c]));
        payments = payments.map((p) => byId.get(p.sellerId) || p);
        setResults(payments);

        const postActionData = await callFinalize();
        devLogger.log("[multi-seller checkout] post-action finalize response", {
          success: postActionData.success,
          paymentStatus: postActionData.paymentStatus,
          paymentCount: postActionData.payments?.length || 0,
        });
        payments = sanitizePayments(postActionData.payments || []);
        if (payments.length === 0) {
          throw new Error("Payment failed. No seller payment records were returned.");
        }
      }

      setResults(payments);

      const failedSellers = payments.filter((p) => isFailedStatus(p.status)).length;
      if (failedSellers > 0) {
        onFailure(`${failedSellers} of ${payments.length} seller payment(s) could not be completed.`);
        return;
      }

      const actionRequired = payments.filter((p) => isActionRequiredStatus(p.status)).length;
      if (actionRequired > 0) {
        setErrorMessage(`${actionRequired} payment group(s) require additional card authentication.`);
        return;
      }

      const processing = payments.filter((p) => isProcessingStatus(p.status)).length;
      if (processing > 0) {
        setErrorMessage(`${processing} payment group(s) are still processing. Your order will update shortly.`);
        return;
      }

      if (payments.every((p) => isSucceededStatus(p.status))) {
        onSuccess();
        return;
      }

      setErrorMessage("Payment status is still being confirmed. Please wait a moment and try again.");
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
      <div className="rounded-2xl border border-[#973c00]/15 bg-white/60 p-5 space-y-3">
        <div className="text-sm text-[#5A1E12]/70 font-semibold mb-1">Arnhem Land Marketplace</div>
        {sellerBreakdown.map((line) => (
          <div key={line.sellerId} className="flex items-center justify-between text-sm">
            <span className="text-[#5A1E12]/80">{line.sellerName || "Seller"}</span>
            <span className="font-medium text-[#5A1E12]">
              {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(line.grossAmountCents / 100)}
            </span>
          </div>
        ))}
        <div className="border-t border-[#5A1E12]/10 pt-3 flex items-center justify-between font-bold text-[#5A1E12]">
          <span>Total</span>
          <span>{formattedTotal}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#973c00]/15 bg-white/60 p-5">
        <PaymentElement options={{ layout: "tabs", fields: { billingDetails: { email: "auto" } } }} />
      </div>

      {results && (
        <div className="space-y-2">
          {results.map((r) => {
            const line = sellerBreakdown.find((s) => s.sellerId === r.sellerId);
            return (
              <div
                key={r.sellerId}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                  r.status === "succeeded" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <span className="font-semibold">{line?.sellerName || "Seller"}</span>
                <span>{r.status === "succeeded" ? "Paid" : r.error || r.status}</span>
              </div>
            );
          })}
        </div>
      )}

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
            Pay {formattedTotal}
          </>
        )}
      </button>
    </form>
  );
}
