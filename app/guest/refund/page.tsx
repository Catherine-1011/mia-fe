"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFileSignature } from "react-icons/fa";
import {
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ReceiptText,
  CheckCircle2,
  Clock,
  CircleCheck,
  XCircle,
  AlertCircle,
  ArrowRight,
  ImagePlus,
  X,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL = "https://backend.madeinarnhemland.com.au";

const STATUS_STEPS = ["OPEN", "APPROVED", "COMPLETED", "REJECTED"] as const;

type RefundStatus = (typeof STATUS_STEPS)[number];

// ─── Types ───────────────────────────────────────────────────────────────────

interface RefundTicket {
  id: string;
  orderId: string;
  orderDisplayId?: string;
  requestType: "REFUND" | "PARTIAL_REFUND";
  reason: string;
  status: RefundStatus;
  adminMessage: string | null;
  createdAt: string;
  updatedAt: string;
  guestEmail?: string;
}

interface EligibleRefundItem {
  orderItemId?: string;
  productId: string;
  variantId?: string;
  title: string;
  displayTitle?: string;
  color?: string;
  size?: string;
  variant?: {
    id?: string;
    sku?: string;
    attributes?: Array<{
      name?: string;
      value?: string;
      displayValue?: string;
    }>;
    [key: string]: any;
  };
  image: string;
  quantity: number;
  price: string;
}

interface EligibleRefundOrder {
  id: string;
  displayId: string;
  sellerId: string;
  sellerName: string;
  status: string;
  deliveredAt: string;
  items: EligibleRefundItem[];
}

interface FetchedOrder {
  id: string;
  displayId?: string;
  customerName: string;
  customerEmail: string;
  isGuest: boolean;
  eligibleRefundOrders: EligibleRefundOrder[];
}

interface SelectedItem {
  orderItemId: string;
  productId: string;
  title: string;
  quantity: number;
  maxQuantity: number;
  reason: string;
  images: UploadedImage[];
}

interface UploadedImage {
  previewUrl: string;
  file: File;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusBadge(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case "OPEN":
      return { bg: "bg-blue-100", text: "text-blue-700", label: "Open" };
    case "APPROVED":
      return { bg: "bg-green-100", text: "text-green-700", label: "Approved" };
    case "COMPLETED":
      return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" };
    case "REJECTED":
      return { bg: "bg-red-100", text: "text-red-700", label: "Rejected" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500", label: status };
  }
}

function requestTypeLabel(type: string): string {
  return type === "REFUND" ? "Full Refund" : "Partial Refund";
}

function getVariantValue(item: EligibleRefundItem, attributeName: "size" | "color"): string | undefined {
  const directValue = item[attributeName];
  if (directValue) return directValue;

  const attrs = item.variant?.attributes;
  if (!Array.isArray(attrs)) return undefined;

  const match = attrs.find(
    (attr) => attr?.name?.toLowerCase() === attributeName.toLowerCase()
  );
  return match?.value || match?.displayValue;
}

// ─── Status Stepper ──────────────────────────────────────────────────────────

function StatusStepper({ status }: { status: string }) {
  // REJECTED is a terminal alternative state — show it separately, not in the linear flow
  if (status === "REJECTED") {
    return (
      <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">Request Rejected</p>
          <p className="text-xs text-red-500 mt-0.5">See admin message below for details.</p>
        </div>
      </div>
    );
  }

  const linearSteps = ["OPEN", "APPROVED", "COMPLETED"] as const;
  const icons = [
    <Clock key="OPEN" className="w-4 h-4" />,
    <CircleCheck key="APPROVED" className="w-4 h-4" />,
    <CheckCircle2 key="COMPLETED" className="w-4 h-4" />,
  ];
  const labels = ["Open", "Approved", "Completed"];
  const currentIndex = linearSteps.indexOf(status as (typeof linearSteps)[number]);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {linearSteps.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isFuture = i > currentIndex;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-[#5A1E12] text-white"
                      : isActive
                      ? "bg-[#5A1E12] text-[#ead7b7] ring-2 ring-[#5A1E12]/30 ring-offset-2"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : icons[i]}
                </div>
                <span
                  className={`mt-1 text-[10px] font-semibold whitespace-nowrap ${
                    isFuture ? "text-gray-400" : "text-[#5A1E12]"
                  }`}
                >
                  {labels[i]}
                </span>
              </div>
              {/* Connector */}
              {i < linearSteps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                    i < currentIndex ? "bg-[#5A1E12]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  ticket: RefundTicket;
  orderId: string;
  email: string;
}

function RequestCard({ ticket, orderId, email }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<RefundTicket | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const badge = statusBadge(ticket.status);

  const handleExpand = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (detail) return;
    setLoadingDetail(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/guest/refund-requests/${ticket.id}?orderId=${encodeURIComponent(orderId)}&customerEmail=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to load details."); return; }
      setDetail(data.request);
    } catch {
      toast.error("Failed to load details. Please try again.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const displayed = detail ?? ticket;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header — always visible */}
      <button
        onClick={handleExpand}
        className="w-full px-5 py-4 flex items-start justify-between gap-4 text-left hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#5A1E12]/60 truncate">#{ticket.id.slice(-10)}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {requestTypeLabel(ticket.requestType)}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{ticket.reason}</p>
          <p className="text-xs text-gray-400 mt-1.5">Submitted {formatDate(ticket.createdAt)}</p>
        </div>
        <div className="shrink-0 mt-1 text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#5A1E12]/40" />
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <StatusStepper status={displayed.status} />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Request ID</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{displayed.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Last Updated</p>
                  <p className="text-sm text-gray-700">{formatDate(displayed.updatedAt)}</p>
                </div>
              </div>

              {/* Admin Response */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Admin Response</p>
                <p className="text-sm text-gray-700">
                  {displayed.adminMessage ?? (
                    <span className="text-gray-400 italic">Awaiting review</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Submit Tab ───────────────────────────────────────────────────────────────

interface SubmitTabProps {
  onSuccess: (ticketId: string, submittedOrderId: string) => void;
}

function SubmitTab({ onSuccess }: SubmitTabProps) {
  // Step: "lookup" → verify order first, then "form" to fill details
  const [step, setStep] = useState<"lookup" | "form">("lookup");

  // Lookup fields
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLooking, setIsLooking] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<FetchedOrder | null>(null);

  // Item selection — keyed by orderItemId (fallback: productId)
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});

  // Per-product file input refs
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ ticketId: string; orderId: string } | null>(null);

  // ── Lookup order ──────────────────────────────────────────────────────────────
  const handleLookup = async () => {
    if (!orderId.trim()) { toast.error("Please enter your Order ID."); return; }
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    setIsLooking(true);
    try {
      const res = await fetch(`${BASE_URL}/api/orders/guest/track-for-refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), customerEmail: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Order not found. Please check your details."); return; }
      setFetchedOrder(data.order);
      // Start with no selected items so users only provide reasons for intended returns
      setSelectedItems({});
      setStep("form");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLooking(false);
    }
  };

  // ── Per-product image handlers ────────────────────────────────────────────────
  const handleProductFileChange = (pid: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const cur = selectedItems[pid];
    if (!cur) return;
    if (cur.images.length + files.length > 5) {
      toast.error("You can attach a maximum of 5 images per item.");
      return;
    }
    setSelectedItems((prev) => {
      const existing = prev[pid]?.images ?? [];
      // Deduplicate: skip files already present (guards against double-invocation in Strict Mode)
      const existingKeys = new Set(existing.map((img) => img.file.name + img.file.size + img.file.lastModified));
      const toAdd = files.filter((f) => !existingKeys.has(f.name + f.size + f.lastModified));
      if (!toAdd.length) return prev;
      const newImages: UploadedImage[] = toAdd.map((file) => ({
        previewUrl: URL.createObjectURL(file),
        file,
      }));
      return {
        ...prev,
        [pid]: { ...prev[pid], images: [...existing, ...newImages] },
      };
    });
  };

  const removeProductImage = (pid: string, idx: number) => {
    setSelectedItems((prev) => {
      const item = prev[pid];
      if (!item) return prev;
      const next = [...item.images];
      URL.revokeObjectURL(next[idx].previewUrl);
      next.splice(idx, 1);
      return { ...prev, [pid]: { ...item, images: next } };
    });
  };

  const resetForm = () => {
    Object.values(selectedItems).forEach((item) =>
      item.images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    );
    setStep("lookup");
    setOrderId("");
    setEmail("");
    setFetchedOrder(null);
    setSelectedItems({});
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Keep only items that are still visible/eligible for the currently fetched order.
    const eligibleKeys = new Set(
      (fetchedOrder?.eligibleRefundOrders ?? [])
        .flatMap((order) => order.items)
        .map((item) => item.orderItemId ?? item.productId)
    );

    const selectedEntries = Object.entries(selectedItems).filter(([key]) => eligibleKeys.has(key));
    if (selectedEntries.length !== Object.keys(selectedItems).length) {
      setSelectedItems(Object.fromEntries(selectedEntries));
    }

    const selected = selectedEntries.map(([, value]) => value);
    if (selected.length === 0) { toast.error("Please select at least one item to return."); return; }

    const missingReasonItems = selected.filter((s) => !s.reason.trim());
    if (missingReasonItems.length > 0) {
      const firstMissing = missingReasonItems[0].title;
      const moreCount = missingReasonItems.length - 1;
      toast.error(
        moreCount > 0
          ? `Please provide reasons for all selected items. Missing: "${firstMissing}" and ${moreCount} more.`
          : `Please provide a reason for "${firstMissing}".`
      );
      return;
    }

    // Auto-compute: full refund if every eligible item selected at max qty, else partial
    const totalEligible = (fetchedOrder?.eligibleRefundOrders ?? []).flatMap((o) => o.items).length;
    const allSelectedAtMax = selected.length === totalEligible && selected.every((s) => s.quantity === s.maxQuantity);
    const requestType: "refund" | "partial_refund" = allSelectedAtMax ? "refund" : "partial_refund";

    // Use values returned by the find-order API — never rely on raw user input
    const payloadOrderId = fetchedOrder?.displayId ?? orderId.trim();
    const payloadEmail = fetchedOrder?.customerEmail ?? email.trim();

    // Build per-item payload using orderItemId as required by the API
    const itemsPayload = selected.map(({ orderItemId, quantity, reason }) => ({ orderItemId, quantity, reason }));
    // Top-level reason required by API as a fallback
    const topLevelReason = selected[0]?.reason ?? "Refund request";

    const formData = new FormData();
    formData.append("orderId", payloadOrderId);
    formData.append("customerEmail", payloadEmail);
    formData.append("reason", topLevelReason);
    formData.append("items", JSON.stringify(itemsPayload));
    // Flatten all per-item images into "file" fields (API merges them into ticket attachments)
    selected.forEach(({ images }) =>
      images.forEach((img) => formData.append("file", img.file))
    );

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/orders/guest/refund-request`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to submit request."); return; }
      setSuccessInfo({ ticketId: data.request?.id ?? "", orderId: payloadOrderId });
      resetForm();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────────
  if (successInfo) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-1">Your request has been submitted.</p>
              <p className="text-sm text-green-700 mb-3">
                Ticket ID: <span className="font-mono font-semibold break-all">{successInfo.ticketId}</span>
              </p>
              <button
                onClick={() => { onSuccess(successInfo.ticketId, successInfo.orderId); setSuccessInfo(null); }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
              >
                Track It <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setSuccessInfo(null)}
          className="text-sm text-[#5A1E12]/60 hover:text-[#5A1E12] transition-colors"
        >
          + Submit another request
        </button>
      </div>
    );
  }

  // ── Step: Lookup ──────────────────────────────────────────────────────────────
  if (step === "lookup") {
    return (
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Order ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="e.g. N50867"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="The email used at checkout"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>

        <button
          onClick={handleLookup}
          disabled={isLooking}
          className="w-full py-3.5 bg-[#5A1E12] text-[#ead7b7] font-bold rounded-xl hover:bg-[#4a1810] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isLooking ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Looking up order…</>
          ) : (
            <><Search className="w-4 h-4" /> Find My Order</>
          )}
        </button>
      </div>
    );
  }

  // ── Step: Form (items + details) ──────────────────────────────────────────────
  const allEligibleItems = fetchedOrder?.eligibleRefundOrders?.flatMap((o) => o.items) ?? [];
  const hasNoEligibleItems = !!fetchedOrder && allEligibleItems.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Back to lookup */}
      <button
        type="button"
        onClick={() => setStep("lookup")}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors -mb-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Change order
      </button>

      {/* Order summary card */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
        <Package className="w-5 h-5 text-[#5A1E12] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Order #{fetchedOrder?.displayId ?? orderId}</p>
          <p className="text-xs text-gray-500 mt-0.5">{fetchedOrder?.customerName || "Guest User"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{allEligibleItems.length} eligible item(s)</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-green-100 text-green-700">
          Delivered
        </span>
      </div>

      {/* No eligible items notice */}
      {hasNoEligibleItems ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No eligible items found</p>
            <p className="text-xs text-amber-600 mt-0.5">
              No delivered items were found for this order that are eligible for a refund.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Item selection ── */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Select Items to Return
            </label>
            {allEligibleItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No items found for this order.</p>
            ) : (
              <div className="space-y-3">
                {(fetchedOrder?.eligibleRefundOrders ?? []).map((subOrder) => (
                  <div key={subOrder.id}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      {subOrder.sellerName}
                    </p>
                    <div className="space-y-2">
                      {subOrder.items.map((item) => {
                        const pid = item.orderItemId ?? item.productId;
                        const size = getVariantValue(item, "size");
                        const color = getVariantValue(item, "color");
                        const isChecked = !!selectedItems[pid];
                        return (
                          <div
                            key={pid}
                            className={`rounded-xl border transition-all ${
                              isChecked
                                ? "border-[#5A1E12]/30 bg-[#5A1E12]/5"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            {/* Clickable header row */}
                            <div
                              className="flex items-center gap-3 p-3 cursor-pointer select-none hover:bg-black/3 rounded-xl"
                              onClick={() => {
                                setSelectedItems((prev) => {
                                  const next = { ...prev };
                                  if (next[pid]) {
                                    next[pid].images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
                                    delete next[pid];
                                  } else {
                                    next[pid] = { orderItemId: item.orderItemId ?? pid, productId: pid, title: item.title, quantity: item.quantity, maxQuantity: item.quantity, reason: "", images: [] };
                                  }
                                  return next;
                                });
                              }}
                            >
                              {/* Custom checkbox */}
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isChecked ? "bg-[#5A1E12] border-[#5A1E12]" : "border-gray-300 bg-white"
                                }`}
                              >
                                {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>

                              {/* Product image */}
                              {item.image && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              {/* Name + price */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{item.displayTitle ?? item.title}</p>
                                {!item.displayTitle && (size || color) && (
                                  <p className="text-[11px] text-gray-500 truncate">
                                    {size ? `Size: ${size}` : ""}
                                    {size && color ? " | " : ""}
                                    {color ? `Color: ${color}` : ""}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">{item.quantity}× @ ₹{item.price}</p>
                              </div>

                              {/* Quantity stepper (only when checked) */}
                              {isChecked && (
                                <div
                                  className="flex items-center gap-1.5 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedItems((prev) => {
                                        const cur = prev[pid];
                                        if (!cur || cur.quantity <= 1) return prev;
                                        return { ...prev, [pid]: { ...cur, quantity: cur.quantity - 1 } };
                                      })
                                    }
                                    className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-300 flex items-center justify-center transition-colors"
                                  >
                                    −
                                  </button>
                                  <span className="w-5 text-center text-sm font-semibold text-gray-800">
                                    {selectedItems[pid].quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedItems((prev) => {
                                        const cur = prev[pid];
                                        if (!cur || cur.quantity >= cur.maxQuantity) return prev;
                                        return { ...prev, [pid]: { ...cur, quantity: cur.quantity + 1 } };
                                      })
                                    }
                                    className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-300 flex items-center justify-center transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Expanded: per-product reason + images */}
                            {isChecked && (
                              <div className="px-3 pb-3 pt-2 border-t border-[#5A1E12]/10 space-y-3">
                                {/* Reason */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Reason <span className="text-red-400">*</span>
                                  </label>
                                  <textarea
                                    value={selectedItems[pid].reason}
                                    onChange={(e) =>
                                      setSelectedItems((prev) => ({
                                        ...prev,
                                        [pid]: { ...prev[pid], reason: e.target.value },
                                      }))
                                    }
                                    rows={2}
                                    placeholder="Why are you returning this item?"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all resize-none"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>

                                {/* Evidence photos */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                    Photos <span className="font-normal text-gray-400">(optional, max 5)</span>
                                  </label>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={(el) => { fileInputsRef.current[pid] = el; }}
                                    onChange={(e) => handleProductFileChange(pid, e)}
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    {selectedItems[pid].images.map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0"
                                      >
                                        <Image src={img.previewUrl} alt="evidence" fill className="object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => removeProductImage(pid, idx)}
                                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                                        >
                                          <X className="w-2.5 h-2.5 text-white" />
                                        </button>
                                      </div>
                                    ))}
                                    {selectedItems[pid].images.length < 5 && (
                                      <button
                                        type="button"
                                        onClick={() => fileInputsRef.current[pid]?.click()}
                                        className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-[#5A1E12]/40 hover:text-[#5A1E12]/60 transition-all shrink-0"
                                      >
                                        <ImagePlus className="w-4 h-4" />
                                        <span className="text-[9px] font-semibold">Add</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#5A1E12] text-[#ead7b7] font-bold rounded-xl hover:bg-[#4a1810] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            ) : (
              <><ReceiptText className="w-4 h-4" /> Submit Refund Request</>
            )}
          </button>
        </>
      )}
    </form>
  );
}

// ─── Track Tab ────────────────────────────────────────────────────────────────

interface TrackTabProps {
  prefillOrderId?: string;
}

function TrackTab({ prefillOrderId = "" }: TrackTabProps) {
  const [orderId, setOrderId] = useState(prefillOrderId);
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<RefundTicket[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!orderId.trim() || !email.trim()) {
      toast.error("Please enter both Order ID and Email.");
      return;
    }
    setIsSearching(true);
    setSearched(false);
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/guest/refund-requests?orderId=${encodeURIComponent(orderId.trim())}&customerEmail=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to fetch requests.");
        setTickets(null);
        return;
      }
      setTickets(Array.isArray(data.requests) ? data.requests : []);
      setSearched(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [orderId, email]);

  return (
    <div className="space-y-5">
      {/* Search fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Order ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. A4X9KR"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="guest@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={isSearching}
        className="w-full py-3.5 bg-[#5A1E12] text-[#ead7b7] font-bold rounded-xl hover:bg-[#4a1810] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
      >
        {isSearching ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
        ) : (
          <><Search className="w-4 h-4" /> Find Requests</>
        )}
      </button>

      {/* Skeleton loader */}
      {isSearching && (
        <div className="space-y-3 mt-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!isSearching && searched && tickets !== null && (
        <>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No refund requests found for this order.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-medium">
                {tickets.length} request{tickets.length > 1 ? "s" : ""} found
              </p>
              {tickets.map((ticket) => (
                <RequestCard
                  key={ticket.id}
                  ticket={ticket}
                  orderId={orderId}
                  email={email}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Policy sections (sidebar ToC) ───────────────────────────────────────────

const POLICY_SECTIONS = [
  { id: "consumer-guarantees",  label: "Consumer Guarantees" },
  { id: "major-minor",          label: "Major vs Minor Failures" },
  { id: "change-of-mind",       label: "Change-of-Mind Returns" },
  { id: "how-to-request",       label: "How to Request a Refund" },
  { id: "timeframes",           label: "Timeframes" },
  { id: "return-shipping",      label: "Return Shipping" },
  { id: "refund-method",        label: "Refund Method" },
  { id: "exclusions",           label: "Exclusions" },
  { id: "disputes",             label: "Disputes" },
  { id: "governing-law",        label: "Governing Law" },
];

export default function GuestRefundPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");
  const [trackPrefillId, setTrackPrefillId] = useState("");
  const [trackKey, setTrackKey] = useState(0);

  const handleSubmitSuccess = (ticketId: string, submittedOrderId: string) => {
    setTrackPrefillId(submittedOrderId);
    setTrackKey((k) => k + 1);
    setActiveTab("track");
  };

  return (
    <div className="bg-[#f3e9dd]">

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <VideoHeroSection className="min-h-[40vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-20 md:py-40 gap-6">
          <h1 className="text-5xl font-bold">Refund Policy</h1>
          <p className="text-lg max-w-2xl">
            Understand your rights and how refunds, returns, and exchanges are handled on the Made in Arnhem Land marketplace.
          </p>
          <a
            href="#refund-form"
            className="mt-2 inline-flex items-center gap-2 bg-[#ead7b7] text-[#5A1E12] font-bold px-8 py-3.5 rounded-full hover:bg-white transition-colors text-sm"
          >
            <ReceiptText className="w-4 h-4" /> Request a Refund
          </a>
        </div>
      </VideoHeroSection>

      {/* ─── Policy content ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 pt-20 pb-20 px-6 md:px-16">

        {/* Sidebar — Table of Contents */}
        <aside className="w-full md:w-64 lg:w-72 md:sticky md:top-32 h-fit">
          <h2 className="font-bold mb-4 text-2xl">Table of Contents</h2>
          <ul className="space-y-3 text-gray-800">
            {POLICY_SECTIONS.map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <FaFileSignature size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main policy text */}
        <main className="flex-1 max-w-screen-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Refund Policy</h1>
          {/* <p className="leading-relaxed mb-2">
            <span className="font-semibold">Effective Date:</span> 24/03/2026
          </p> */}
          <p className="leading-relaxed mb-4">
            This policy outlines how refunds, returns, and exchanges are handled on the Made in Arnhem Land marketplace.
          </p>
          <p className="leading-relaxed mb-4">
            This policy should be read together with our{" "}
            <Link href="/term-and-conditions" className="text-[#5A1E12] font-semibold hover:underline">Terms &amp; Conditions</Link>.
          </p>
          <p className="leading-relaxed mb-12">
            Nothing in this policy excludes rights under the Australian Consumer Law (ACL).
          </p>

          <section id="consumer-guarantees" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">1. Consumer Guarantees</h2>
            <p className="leading-relaxed mb-4">
              Under the Australian Consumer Law (ACL), buyers have automatic consumer guarantees when purchasing goods.
            </p>
            <p className="leading-relaxed mb-4">
              Where goods fail to meet these guarantees, the seller is responsible for providing an appropriate remedy, which may include a refund, replacement, or repair, depending on the circumstances.
            </p>
            <p className="leading-relaxed">
              Consumer guarantees apply in addition to any seller warranties and cannot be excluded.
            </p>
          </section>

          <section id="major-minor" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">2. Major vs Minor Failures</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <span className="font-semibold">Major failure:</span> If a product has a major failure under the ACL, the buyer may choose a refund or replacement.
              </li>
              <li>
                <span className="font-semibold">Minor failure:</span> If a product has a minor failure, the seller is entitled to offer a repair, replacement, or refund. If a repair is offered, it must be carried out within a reasonable time. If the seller does not remedy the issue within a reasonable time, the buyer may be entitled to a refund or replacement.
              </li>
            </ul>
          </section>

          <section id="change-of-mind" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">3. Change-of-Mind Returns</h2>
            <p className="leading-relaxed mb-4">
              Change-of-mind returns are not required under Australian Consumer Law and are only available where:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>the individual seller offers change-of-mind returns, and</li>
              <li>the product listing or seller terms allow it.</li>
            </ul>
            <p className="leading-relaxed mb-4">Where accepted by the seller, change-of-mind items must be returned:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>unused,</li>
              <li>in original condition, and</li>
              <li>within the timeframe specified by the seller (if any).</li>
            </ul>
            <p className="leading-relaxed">
              Change-of-mind returns do not apply to faulty items and do not affect rights under the Australian Consumer Law.
            </p>
          </section>

          <section id="how-to-request" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">4. How to Request a Refund</h2>
            <p className="leading-relaxed mb-4">
              To request a return or refund, buyers may be asked to provide:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Order number,</li>
              <li>Description of the issue, and</li>
              <li>Reasonable supporting information (such as images), where applicable.</li>
            </ul>
            <p className="leading-relaxed">
              Requests will be assessed in accordance with Australian Consumer Law.
            </p>
          </section>

          <section id="timeframes" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">5. Timeframes</h2>
            <p className="leading-relaxed mb-4">We aim to:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Acknowledge refund or return requests within 3 business days,</li>
              <li>Resolve issues within a reasonable timeframe, and</li>
              <li>Process approved refunds as soon as reasonably practicable once the outcome is determined.</li>
            </ul>
            <p className="leading-relaxed">
              Actual timeframes may vary depending on the nature of the issue, the seller involved, and payment provider processing times.
            </p>
          </section>

          <section id="return-shipping" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">6. Return Shipping</h2>
            <p className="leading-relaxed mb-4">
              Where goods are faulty, unsafe, incorrectly supplied, or otherwise fail to meet consumer guarantees, the seller is responsible for return shipping costs.
            </p>
            <p className="leading-relaxed">
              For approved change-of-mind returns, return shipping costs are generally the responsibility of the buyer, unless the seller states otherwise.
            </p>
          </section>

          <section id="refund-method" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">7. Refund Method</h2>
            <p className="leading-relaxed">
              Approved refunds are issued using the original payment method where possible, or by another method agreed with the buyer.
            </p>
          </section>

          <section id="exclusions" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">8. Exclusions</h2>
            <p className="leading-relaxed mb-4">
              Refunds may not apply where damage or issues arise due to misuse, neglect, or abnormal use of the product after delivery.
            </p>
            <p className="leading-relaxed">
              Nothing in this section limits or excludes consumer guarantees or any rights available under the Australian Consumer Law.
            </p>
          </section>

          <section id="disputes" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">9. Disputes</h2>
            <p className="leading-relaxed mb-4">
              If a refund or return issue cannot be resolved directly with the seller, the Marketplace support team may assist by facilitating communication and mediation.
            </p>
            <p className="leading-relaxed">
              The Marketplace does not determine legal liability or override statutory consumer rights.
            </p>
          </section>

          <section id="governing-law" className="scroll-mt-32 mb-12">
            <h2 className="text-2xl font-bold mb-2">10. Governing Law</h2>
            <p className="leading-relaxed">
              This policy is governed by the laws of the Northern Territory, Australia and applicable Commonwealth laws.
            </p>
          </section>

          {/* Bottom CTA */}
          <div className="flex justify-start">
            <a
              href="#refund-form"
              className="inline-flex items-center gap-2 bg-[#5A1E12] text-[#ead7b7] font-bold px-8 py-3.5 rounded-full hover:bg-[#4a1810] transition-colors text-sm"
            >
              <ReceiptText className="w-4 h-4" /> Request a Refund
            </a>
          </div>
        </main>
      </div>

      {/* ─── Refund Form ───────────────────────────────────────────────── */}
      <div id="refund-form" className="scroll-mt-10 bg-[#FAF7F2] px-4 py-16">
        <div className="w-full max-w-2xl mx-auto">

          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5A1E12] leading-tight">
              Submit or Track a Refund Request
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Use your Order ID and the email used at checkout.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab("submit")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "submit"
                  ? "bg-white text-[#5A1E12] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Submit Request
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "track"
                  ? "bg-white text-[#5A1E12] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Track Requests
            </button>
          </div>

          {/* Tab content — both always mounted to preserve state on tab switch */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className={activeTab === "submit" ? undefined : "hidden"}>
              <SubmitTab onSuccess={handleSubmitSuccess} />
            </div>
            <div className={activeTab === "track" ? undefined : "hidden"}>
              <TrackTab key={trackKey} prefillOrderId={trackPrefillId} />
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Have an account?{" "}
            <Link href="/login" className="text-[#5A1E12] font-semibold hover:underline">
              Log in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
