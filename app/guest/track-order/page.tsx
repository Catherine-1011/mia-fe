"use client";

import { useState, useEffect, Suspense, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2, Download, Package, ArrowLeft, Search,
  CheckCircle2, Settings2, Truck, PackageCheck,
  MapPin, Hash, CalendarDays, User, Tag, Store, 
  Box, Clock, Edit3, Save, X,
} from "lucide-react";
import { toast } from "react-toastify";
import { SegregatedOrder, SellerOrder, ORDER_STATUS_MAPPING, SELLER_ORDER_STEPS } from "@/types/seller-orders";
import { detectMultiSellerOrder, logApiResponse, validateOrderData } from "@/lib/orderUtils";

interface OrderItem {
  quantity: number;
  price: string;
  selectedVariant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  variant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  size?: string;
  color?: string;
  attributes?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  options?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  productVariant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  product: {
    id: any;
    featuredImage: string;
    title: string;
    images: string[];
  };
}

interface TrackOrder {
  id: string;
  displayId: string;
  orderType: string;
  status: string;
  totalAmount: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  orderSummary: {
    subtotal: string;
    gstAmount: string;
    couponCode: string | null;
    finalTotal: number;
    grandTotal: string;
    shippingCost: string;
    discountAmount: number;
    shippingMethod: any;
  } | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  items: OrderItem[];
  createdAt: string;
  isMultiSeller?: boolean;
  segregatedData?: SegregatedOrder;
}

const ORDER_STEPS = [
  { key: "CONFIRMED",  label: "Confirmed",  icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", icon: Settings2 },
  { key: "SHIPPED",    label: "Shipped",    icon: Truck },
  { key: "DELIVERED",  label: "Delivered",  icon: PackageCheck },
] as const;

// ─── Removed SellerStatusEditor - users can only view status, not edit ───

// ─── Simplified Seller Section (No progress bars, just status) ─────────────────
function SimplifiedSellerSection({ 
  sellerOrder
}: { 
  sellerOrder: SellerOrder;
}) {
  const statusConfig = ORDER_STATUS_MAPPING[sellerOrder.status as keyof typeof ORDER_STATUS_MAPPING];
  
  return (
    <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-4 md:p-6 mb-4 md:mb-6">
      {/* Seller Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#5A1E12]/8 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 md:w-5 md:h-5 text-[#5A1E12]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-bold text-[#5A1E12] flex items-center gap-2 truncate">
              <span className="truncate">{sellerOrder.seller.name}</span>
            </h3>
            <p className="text-xs md:text-sm text-[#5A1E12]/60 flex items-center gap-1">
              <span className="truncate">Sub Order: #{sellerOrder.subDisplayId || sellerOrder.id?.slice(-8).toUpperCase() || 'No ID'}</span>
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          {/* Current status badge */}
          <div>
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: `${statusConfig?.color || '#10b981'}20`,
                color: statusConfig?.color || '#10b981',
                borderColor: `${statusConfig?.color || '#10b981'}40`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig?.color || '#10b981' }} />
              {statusConfig?.label || sellerOrder.status}
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Info */}
      {sellerOrder.trackingNumber && (
        <div className="flex items-center gap-3 bg-[#5A1E12]/5 border border-[#5A1E12]/10 rounded-xl px-3 md:px-4 py-2 md:py-3 mb-4">
          <Truck className="w-4 h-4 text-[#5A1E12] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#5A1E12]/50 font-medium">Tracking Number</p>
            <p className="text-sm font-mono font-bold text-[#5A1E12] break-all">{sellerOrder.trackingNumber}</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h4 className="text-sm font-bold text-[#5A1E12]">Items from this seller</h4>
          <span className="text-xs bg-[#5A1E12]/8 text-[#5A1E12] font-semibold px-2 md:px-2.5 py-1 rounded-full shrink-0">
            {sellerOrder.items.length} {sellerOrder.items.length === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="divide-y divide-[#5A1E12]/6">
          {sellerOrder.items.map((item, idx) => (
            <div key={idx} className="flex gap-3 md:gap-4 py-3 md:py-4 first:pt-0 last:pb-0">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-[#ead7b7]/40 shrink-0">
                <Image
                  src={item.product?.featuredImage || item.product?.images?.[0] || "/images/placeholder.png"}
                  alt={item.product?.title || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-semibold text-sm text-[#5A1E12] truncate">{item.product?.title}</p>
                <p className="text-xs text-[#5A1E12]/50 mt-0.5">
                  Qty {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                  {(() => {
                    // Check multiple possible variant data structures
                    const getVariantAttribute = (attributeName: string) => {
                      // Check variant.attributes array (new structure)
                      if (item.variant?.attributes && Array.isArray(item.variant.attributes)) {
                        const attr = item.variant.attributes.find((attr: any) => 
                          attr.name?.toLowerCase() === attributeName.toLowerCase()
                        );
                        return attr?.value || attr?.displayValue;
                      }
                      return null;
                    };

                    const variantInfo = {
                      size: getVariantAttribute('size') || 
                            item.selectedVariant?.size || 
                            item.variant?.size || 
                            item.size || 
                            item.attributes?.size || 
                            item.options?.size,
                      color: getVariantAttribute('color') || 
                             item.selectedVariant?.color || 
                             item.variant?.color || 
                             item.color || 
                             item.attributes?.color || 
                             item.options?.color
                    };
                    
                    if (variantInfo.size || variantInfo.color) {
                      return (
                        <>
                          <span className="ml-1">•</span>
                          {variantInfo.size && (
                            <span className="ml-1 text-[#5A1E12]/70 font-medium">Size: {variantInfo.size}</span>
                          )}
                          {variantInfo.color && (
                            <span className="ml-1 text-[#5A1E12]/70 font-medium">
                              {variantInfo.size ? ', ' : ''}Color: {variantInfo.color}
                            </span>
                          )}
                        </>
                      );
                    }
                    return null;
                  })()}
                </p>
              </div>
              <div className="flex items-center shrink-0">
                <p className="text-sm font-bold text-[#5A1E12]">
                  ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();

  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [email, setEmail]     = useState(searchParams.get("email")   || "");
  const [order, setOrder]     = useState<TrackOrder | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [errorMsg, setErrorMsg]         = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason]       = useState("");
  const [isCancelling, setIsCancelling]       = useState(false);
  // Users cannot edit status - removed parent status updating
  // const [updatingParentStatus, setUpdatingParentStatus] = useState(false);

  // Restore data from sessionStorage on component mount
  useEffect(() => {
    const savedOrderId = sessionStorage.getItem("guestOrderDisplayId") || sessionStorage.getItem("guestOrderId") || "";
    const savedEmail = sessionStorage.getItem("guestOrderEmail") || "";
    const savedOrder = sessionStorage.getItem("guestOrderData");
    
    if (!orderId && savedOrderId) setOrderId(savedOrderId);
    if (!email && savedEmail) setEmail(savedEmail);
    
    // Restore order data if available
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        setOrder(parsedOrder);
      } catch (error) {
        console.error("Failed to parse saved order data:", error);
        sessionStorage.removeItem("guestOrderData");
      }
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // Only auto-fetch if we have credentials AND no order is cached in sessionStorage.
    // Checking sessionStorage directly (not `order` state) because both effects fire
    // on the same render — `order` is still null here even if the first effect just set it.
    const hasCachedOrder = !!sessionStorage.getItem("guestOrderData");
    if (orderId && email && !hasCachedOrder) {
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save order data to sessionStorage only when order is successfully fetched
  const saveToSessionStorage = (orderData: TrackOrder, orderIdValue: string, emailValue: string) => {
    sessionStorage.setItem("guestOrderData", JSON.stringify(orderData));
    sessionStorage.setItem("guestOrderDisplayId", orderIdValue.toUpperCase());
    sessionStorage.setItem("guestOrderEmail", emailValue);
  };

  const handleTrack = async () => {
    const trimmedOrderId = orderId.trim().toUpperCase();
    const trimmedEmail = email.trim();
    
    if (!trimmedOrderId || !trimmedEmail) {
      setErrorMsg("Please enter both Order ID and Email.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    setOrder(null);
    // Clear cached data when starting new search
    sessionStorage.removeItem("guestOrderData");
    
    try {
      const res = await fetch(
        `https://backend.madeinarnhemland.com.au/api/orders/guest/track?orderId=${encodeURIComponent(trimmedOrderId)}&customerEmail=${encodeURIComponent(trimmedEmail)}`
      );
      const data = await res.json();
      

      // Debug variant data structure
      if (data.order && data.order.items) {
        data.order.items.forEach((item: any, index: number) => {

        });
      }
      
      logApiResponse('/api/orders/guest/track', data, trimmedOrderId);
      
      if (!res.ok || !data.success) { 
        setErrorMsg(data.message || "Order not found."); 
        return; 
      }
      
      let finalOrder = data.order;
      
      // Validate the order data
      const validationIssues = validateOrderData(finalOrder);
      if (validationIssues.length > 0) {
        console.warn('Order validation issues:', validationIssues);
      }
      
      // Check if this is a multi-seller order
      const hasMultipleSellers = detectMultiSellerOrder(finalOrder);
      finalOrder.isMultiSeller = hasMultipleSellers;
      

      

      
      // Always check for subOrders first, regardless of multi-seller detection
      if (finalOrder.subOrders && finalOrder.subOrders.length > 0) {

        
        // Force multi-seller mode if subOrders exist
        finalOrder.isMultiSeller = true;
        
        // Structure the segregated data from subOrders
        finalOrder.segregatedData = {
          status: finalOrder.status,
          subOrders: finalOrder.subOrders
        };
        
        // If main order has no items but subOrders do, populate items from subOrders
        if ((!finalOrder.items || finalOrder.items.length === 0)) {
          const allItems = finalOrder.subOrders.flatMap((subOrder: any) => 
            subOrder.items || []
          );
          finalOrder.items = allItems;
      
        }
        

        
        
        // Debug each subOrder  
        finalOrder.subOrders.forEach((subOrder: any, index: number) => {
         
          

        });
        
      } else if (hasMultipleSellers) {

        finalOrder.isMultiSeller = false; // Fallback to single seller mode
      } else {
        finalOrder.isMultiSeller = false;
      }
      
      // Final validation
      const finalValidationIssues = validateOrderData(finalOrder);
      if (finalValidationIssues.length > 0) {

      }
      

      
    
      
      if (finalOrder.segregatedData && finalOrder.segregatedData.subOrders) {

        

        finalOrder.segregatedData.subOrders.forEach((subOrder: any, index: number) => {

          
          if (subOrder.items && subOrder.items.length > 0) {

            subOrder.items.forEach((item: any, itemIndex: number) => {
            });
          } else {
  
          }

        });
        
        // Summary of API data
        const sellerStatusSummary = finalOrder.segregatedData.subOrders.map((so: any) => ({
          sellerName: so.seller?.name,
          status: so.status,
          hasStatus: !!so.status,
          itemCount: so.items?.length || 0
        }));
        
  
        
        const hasAllStatuses = finalOrder.segregatedData.subOrders.every((so: any) => !!so.status);

        
        // Show product-level status mapping
        const productStatusMap: any[] = [];
        finalOrder.segregatedData.subOrders.forEach((subOrder: any) => {
          subOrder.items?.forEach((item: any) => {
            productStatusMap.push({
              productTitle: item.product?.title || 'Unknown',
              productId: item.product?.id || 'No ID',
              sellerName: subOrder.seller?.name || 'Unknown Seller',
              subOrderId: subOrder.id || 'No Sub-Order ID',
              subOrderStatus: subOrder.status || '❌ NO STATUS',
              statusFromAPI: !!subOrder.status
            });
          });
        });
        console.table(productStatusMap);

        
        // 🚨 ITEM MATCHING DEBUG
        if (finalOrder.items) {
          finalOrder.items.forEach((item: any, index: number) => {

            
            const matchingSeller = finalOrder.segregatedData.subOrders.find((so: any) => 
              so.items?.some((soItem: any) => soItem.product.id === item.product.id)
            );
            
            if (matchingSeller) {
  
            } else {
            }
          });
        }
        
      } else {

        if (finalOrder.items && finalOrder.items.length > 0) {

          finalOrder.items.forEach((item: any, index: number) => {

          });
        }
      }
      console.groupEnd();
      
      // 🚨 FINAL DEBUG: Show exactly what we're setting as the order
            
      setOrder(finalOrder);
      // Save to sessionStorage only on successful order fetch
      saveToSessionStorage(finalOrder, trimmedOrderId, trimmedEmail);
    } catch (error) {
      console.error("❌ Error in handleTrack:", error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const url = `https://backend.madeinarnhemland.com.au/api/orders/guest/invoice?orderId=${encodeURIComponent(orderId.toUpperCase())}&customerEmail=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Download failed" }));
        toast.error(err.message || "Invoice only available after DELIVERED status.");
        return;
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `invoice-${orderId.toUpperCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    setIsCancelling(true);
    try {
      const res = await fetch("https://backend.madeinarnhemland.com.au/api/orders/guest/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayId: orderId.trim().toUpperCase(),
          customerEmail: email.trim(),
          reason: cancelReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to cancel order.");
        return;
      }
      toast.success("Order cancelled successfully.");
      setShowCancelModal(false);
      setCancelReason("");
      await handleTrack();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const currentStepIndex = order
    ? ORDER_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-[#FAF7F2]">

      {/* ─── LEFT PANEL ─────────────────────────────────────────────── */}
      <aside className="w-full lg:w-96 xl:w-md shrink-0 bg-[#5A1E12] flex flex-col lg:min-h-screen">

        {/* Top brand strip */}
        <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#ead7b7]/70 hover:text-[#ead7b7] text-sm transition-colors mb-6 md:mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#ead7b7]/15 flex items-center justify-center">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-[#ead7b7]" />
            </div>
            <span className="text-[#ead7b7]/50 text-[10px] md:text-xs font-semibold uppercase tracking-widest">Order Tracker</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-3 leading-tight">Track Your<br/>Delivery</h1>
          <p className="text-[#ead7b7]/60 text-sm mt-2">Enter your details below to see real-time status updates.</p>
        </div>

        {/* Search form */}
        <div className="px-6 md:px-8 py-6 md:py-8 flex-1">
          <div className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-widest text-[#ead7b7]/50 mb-2">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="Enter your order ID"
                className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 rounded-xl px-4 py-3 md:py-3.5 text-sm focus:outline-none focus:border-[#ead7b7]/50 focus:ring-1 focus:ring-[#ead7b7]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-widest text-[#ead7b7]/50 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="jane@example.com"
                className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 rounded-xl px-4 py-3 md:py-3.5 text-sm focus:outline-none focus:border-[#ead7b7]/50 focus:ring-1 focus:ring-[#ead7b7]/30 transition-all"
              />
            </div>

            {errorMsg && (
              <p className="text-red-300 text-sm bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2.5">{errorMsg}</p>
            )}

            <button
              onClick={handleTrack}
              disabled={isLoading}
              className="w-full py-3 md:py-3.5 bg-[#ead7b7] text-[#5A1E12] font-bold rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Tracking…</>
                : <><Search className="w-4 h-4" /> Track Order</>
              }
            </button>
          </div>

        </div>

        {/* Bottom link */}
        <div className="px-6 md:px-8 pb-6 md:pb-8">
          <Link href="/shop" className="text-xs text-[#ead7b7]/40 hover:text-[#ead7b7]/70 transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </aside>

      {/* ─── RIGHT PANEL ────────────────────────────────────────────── */}
      <main className="flex-1 bg-[#FAF7F2] min-h-screen lg:min-h-0 lg:h-screen lg:overflow-y-auto">

        {/* Empty state */}
        {!order && !isLoading && (
          <div className="min-h-screen lg:min-h-0 lg:h-full flex flex-col items-center justify-center px-6 md:px-8 py-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#5A1E12]/8 flex items-center justify-center mb-6">
              <Package className="w-7 h-7 md:w-9 md:h-9 text-[#5A1E12]/40" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#5A1E12] mb-2">No order loaded yet</h2>
            <p className="text-sm text-[#5A1E12]/50 max-w-xs">Enter your Order ID and email on the left to see your delivery details here.</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="min-h-screen lg:min-h-0 lg:h-full flex items-center justify-center px-6 md:px-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-[#5A1E12]/40 mx-auto mb-4" />
              <p className="text-sm text-[#5A1E12]/50">Fetching your order…</p>
            </div>
          </div>
        )}

        {/* Order details */}
        {order && !isLoading && (
          <div className="px-6 md:px-8 py-6 md:py-10 w-full">

            {/* Cancelled banner */}
            {order.status === "CANCELLED" && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">Order Cancelled</p>
                  <p className="text-xs text-red-500 mt-0.5">This order has been cancelled and will not be processed.</p>
                </div>
              </div>
            )}

            {/* Parent Order Progress - Same for both single and multi-seller */}
            <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-4 md:p-6 mb-6 md:mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5A1E12]/40 mb-4 md:mb-6">Delivery Progress</p>
              <div className="flex items-start">
                {ORDER_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent   = i === currentStepIndex;
                  const isLast      = i === ORDER_STEPS.length - 1;
                  const StepIcon    = step.icon;
                  return (
                    <div key={step.key} className="flex items-start flex-1 last:flex-none">
                      {/* Step node + label */}
                      <div className="flex flex-col items-center gap-1 md:gap-2 shrink-0">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted ? "bg-[#5A1E12]" : "bg-[#5A1E12]/8 border border-[#5A1E12]/15"
                        } ${isCurrent ? "ring-2 ring-[#5A1E12]/30 ring-offset-2 ring-offset-white" : ""}`}>
                          <StepIcon className={`w-3 h-3 md:w-4 md:h-4 ${isCompleted ? "text-[#ead7b7]" : "text-[#5A1E12]/30"}`} />
                        </div>
                        <p className={`text-[10px] md:text-xs font-semibold text-center whitespace-nowrap px-1 ${
                          isCurrent ? "text-[#5A1E12]" : isCompleted ? "text-[#5A1E12]/60" : "text-[#5A1E12]/25"
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[8px] md:text-[10px] text-[#5A1E12]/40 -mt-0.5 md:-mt-1">Now</span>
                        )}
                      </div>
                      {/* Connector line between steps */}
                      {!isLast && (
                        <div className="flex-1 h-0.5 mt-4 md:mt-5 mx-1 md:mx-2 relative">
                          <div className="absolute inset-0 bg-[#5A1E12]/10 rounded-full" />
                          <div
                            className="absolute inset-y-0 left-0 bg-[#5A1E12] rounded-full transition-all duration-700"
                            style={{ width: i < currentStepIndex ? "100%" : "0%" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Multi-seller info */}
              {order.isMultiSeller && (
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#5A1E12]/8">
                  <div className="flex items-center gap-2 text-sm text-[#5A1E12]">
                    <Store className="w-4 h-4" />
                    <span className="font-semibold">Multi-Seller Order</span>
                    <span className="text-[#5A1E12]/60">• {order.segregatedData?.subOrders?.length || 0} sellers</span>
                  </div>
                  <p className="text-xs text-[#5A1E12]/70 mt-2">
                    Track individual seller details below. Overall delivery progress is shown above.
                  </p>
                </div>
              )}
            </div>

            {/* Page heading */}
            <div className="flex items-start justify-between mb-6 md:mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#5A1E12]/40 mb-1">Order Summary</p>
                <h2 className="text-xl md:text-2xl font-bold text-[#5A1E12]">Hello, {order.customerName.split(" ")[0]} 👋</h2>
                <p className="text-sm text-[#5A1E12]/50 mt-1">Here's the latest on your order.</p>
              </div>
              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                order.status === "CONFIRMED" ? (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all text-xs shrink-0 mt-1"
                  >
                    <X className="w-3 h-3" />
                    Cancel Order
                  </button>
                ) : (
                  <button
                    disabled
                    title="Cancel order is only available when the order status is Confirmed."
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-400 font-semibold rounded-lg cursor-not-allowed text-xs shrink-0 mt-1"
                  >
                    <X className="w-3 h-3" />
                    Cancel Order
                  </button>
                )
              )}
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
              {[
                { icon: Hash,         label: "Order ID",  value: order.displayId || order.id.slice(0, 12) + "…" },
                { icon: CalendarDays, label: "Placed",    value: new Date(order.createdAt).toLocaleDateString("en-AU") },
                { icon: User,         label: "Customer",  value: order.customerName },
                { icon: Tag,          label: "Total",     value: `$${parseFloat(order.totalAmount).toFixed(2)}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-2xl p-3 md:p-4 border border-[#5A1E12]/8">
                  <div className="w-8 h-8 rounded-lg bg-[#5A1E12]/8 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-[#5A1E12]" />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5A1E12]/40 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-[#5A1E12] truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Tracking number banner */}
            {order.trackingNumber && (
              <div className="flex items-center gap-3 bg-[#5A1E12]/5 border border-[#5A1E12]/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 mb-6 md:mb-8">
                <Truck className="w-5 h-5 text-[#5A1E12] shrink-0" />
                <div>
                  <p className="text-xs text-[#5A1E12]/50 font-medium">Tracking Number</p>
                  <p className="text-sm font-mono font-bold text-[#5A1E12] break-all">{order.trackingNumber}</p>
                </div>
              </div>
            )}

            {/* Shipping address */}
            <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-4 md:p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#5A1E12]" />
                <h3 className="text-sm font-bold text-[#5A1E12]">Shipping Address</h3>
              </div>
              <p className="text-sm text-[#5A1E12]/70 leading-relaxed">
                {order.shippingAddress.addressLine}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
              </p>
            </div>

            {/* Items */}
            {!order.isMultiSeller ? (
              <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between mb-4 md:mb-5">
                  <h3 className="text-sm font-bold text-[#5A1E12] flex items-center gap-2">
                    Items in this order
                    {order.segregatedData && (
                      <span className="hidden sm:inline text-[10px] px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                        📦 Sub-order statuses (not parent)
                      </span>
                    )}
                  </h3>
                  <span className="text-xs bg-[#5A1E12]/8 text-[#5A1E12] font-semibold px-2.5 py-1 rounded-full">
                    {order.items?.length || 0} {(order.items?.length || 0) === 1 ? "item" : "items"}
                  </span>
                </div>
                
                {/* Mobile status explanation */}
                {order.segregatedData && (
                  <div className="sm:hidden mb-4 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                    <p className="font-medium">📦 Each product shows its specific seller's status</p>
                  </div>
                )}
                
                {!order.items || order.items.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-[#5A1E12]/50">
                    <Package className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-30" />
                    <p>No items found in this order</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-[#5A1E12]/6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 md:gap-4 py-3 md:py-4 first:pt-0 last:pb-0">
                          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-[#ead7b7]/40 shrink-0">
                            <Image
                              src={item.product?.featuredImage || item.product?.images?.[0] || "/images/placeholder.png"}
                              alt={item.product?.title || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="font-semibold text-sm text-[#5A1E12] truncate">{item.product?.title}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5">
                              <p className="text-xs text-[#5A1E12]/50">
                                Qty {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                {(() => {
                                  // Check multiple possible variant data structures
                                  const getVariantAttribute = (attributeName: string) => {
                                    // Check variant.attributes array (new structure)
                                    if (item.variant?.attributes && Array.isArray(item.variant.attributes)) {
                                      const attr = item.variant.attributes.find((attr: any) => 
                                        attr.name?.toLowerCase() === attributeName.toLowerCase()
                                      );
                                      return attr?.value || attr?.displayValue;
                                    }
                                    return null;
                                  };

                                  const variantInfo = {
                                    size: getVariantAttribute('size') || 
                                          item.selectedVariant?.size || 
                                          item.variant?.size || 
                                          item.size || 
                                          item.attributes?.size || 
                                          item.options?.size,
                                    color: getVariantAttribute('color') || 
                                           item.selectedVariant?.color || 
                                           item.variant?.color || 
                                           item.color || 
                                           item.attributes?.color || 
                                           item.options?.color
                                  };
                                  

                                  
                                  if (variantInfo.size || variantInfo.color) {
                                    return (
                                      <>
                                        <span className="ml-1">•</span>
                                        {variantInfo.size && (
                                          <span className="ml-1 text-[#5A1E12]/70 font-medium">Size: {variantInfo.size}</span>
                                        )}
                                        {variantInfo.color && (
                                          <span className="ml-1 text-[#5A1E12]/70 font-medium">
                                            {variantInfo.size ? ', ' : ''}Color: {variantInfo.color}
                                          </span>
                                        )}
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                              </p>
                              {/* Show seller status badge for each product */}
                              {(() => {

                                
                                // ONLY show individual seller status, NOT parent status
                                if (order.segregatedData && order.segregatedData.subOrders) {
          
                                  
                                  const subOrder = order.segregatedData.subOrders.find((so: { items: any[]; seller: any; status: any; }) => {
                                    const hasMatchingItem = so.items && so.items.some((soItem: any) => soItem.product.id === item.product.id);
                                    return hasMatchingItem;
                                  });
                                  
                    
                                  
                                  // Only return status if we found a matching sub-order
                                  if (subOrder && (subOrder as any).status) {
                                    const statusConfig = ORDER_STATUS_MAPPING[(subOrder as any).status as keyof typeof ORDER_STATUS_MAPPING];
                                    return (
                                      <span 
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border max-w-fit"
                                        style={{ 
                                          backgroundColor: `${statusConfig?.color || '#10b981'}15`, 
                                          color: statusConfig?.color || '#10b981',
                                          borderColor: `${statusConfig?.color || '#10b981'}30`
                                        }}
                                        title={`Sub-order status: ${statusConfig?.label || (subOrder as any).status} from ${(subOrder as any).seller.name}`}
                                      >
                                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: statusConfig?.color || '#10b981' }} />
                                        {statusConfig?.label || (subOrder as any).status}
                                        <span className="text-[8px] opacity-70 ml-0.5 hidden sm:inline">({(subOrder as any).seller.name})</span>
                                        <span className="w-1 h-1 rounded-full bg-green-500 opacity-75 ml-0.5" title="Sub-order from API"></span>
                                      </span>
                                    );
                                  } else {

                                  }
                                } else {
                      
                                }
                                
                                // Don't show parent status as fallback - only show if it's a true single-seller order
                                return null;
                              })()}
                            </div>
                          </div>
                          <div className="flex items-center shrink-0">
                            <p className="text-sm font-bold text-[#5A1E12]">
                              ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-[#5A1E12]/8 flex justify-between items-center">
                      <span className="text-sm font-bold text-[#5A1E12]">Order Total</span>
                      <span className="text-base md:text-lg font-bold text-[#5A1E12]">${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                    
                    {/* Status explanation */}
                    {order.segregatedData && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                        <p className="font-semibold mb-1">📋 Status Legend:</p>
                        <p>• <strong>Delivery Progress (above)</strong> = Parent order status</p>
                        <p>• <strong>Product badges</strong> = Individual sub-order status from each seller</p>
                        <p className="mt-1 font-medium">Each product shows its specific seller's sub-order status, not the parent status.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-4 md:p-6 mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-4 md:mb-5">
                    <h3 className="text-sm font-bold text-[#5A1E12]">Multi-Seller Order Summary</h3>
                    {/* <span className="text-xs bg-[#5A1E12]/8 text-[#5A1E12] font-semibold px-2.5 py-1 rounded-full">
                      {order.segregatedData?.sellerOrders?.length || 0} sellers
                    </span> */}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[#5A1E12]">Total Amount</span>
                    <span className="text-base md:text-lg font-bold text-[#5A1E12]">${parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                  {/* Remove debug info - commented out section removed completely */}
                </div>
                
                {/* Individual Seller Sections */}
                {order.segregatedData?.subOrders && order.segregatedData.subOrders.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-[#5A1E12] mb-2 md:mb-3">Items by Seller</h4>
                      <p className="text-xs text-[#5A1E12]/60 mb-3 md:mb-4">
                        Each seller's delivery status affects the overall order progress. Status badges show real-time progress.
                      </p>
                    </div>
                    {order.segregatedData.subOrders.map((subOrder: SellerOrder) => (
                      <SimplifiedSellerSection
                        key={subOrder.id}
                        sellerOrder={subOrder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-4 md:p-6 text-center">
                    <Store className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-[#5A1E12]/30" />
                    <h4 className="text-base md:text-lg font-bold text-[#5A1E12] mb-2">Seller Information Loading</h4>
                    <p className="text-sm text-[#5A1E12]/60 mb-4">
                      This appears to be a multi-seller order, but detailed seller information is still being processed.
                    </p>
                    
                    {/* Fallback: Show items if available in main order */}
                    {order.items && order.items.length > 0 && (
                      <div className="text-left">
                        <h5 className="text-sm font-bold text-[#5A1E12] mb-3">Order Items:</h5>
                        <div className="divide-y divide-[#5A1E12]/6">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 md:gap-4 py-3">
                              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-[#ead7b7]/40 shrink-0">
                                <Image
                                  src={item.product?.featuredImage || item.product?.images?.[0] || "/images/placeholder.png"}
                                  alt={item.product?.title || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-[#5A1E12] truncate">{item.product?.title}</p>
                                <p className="text-xs text-[#5A1E12]/50">
                                  Qty {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                  {(() => {
                                    // Check multiple possible variant data structures
                                    const getVariantAttribute = (attributeName: string) => {
                                      // Check variant.attributes array (new structure)
                                      if (item.variant?.attributes && Array.isArray(item.variant.attributes)) {
                                        const attr = item.variant.attributes.find((attr: any) => 
                                          attr.name?.toLowerCase() === attributeName.toLowerCase()
                                        );
                                        return attr?.value || attr?.displayValue;
                                      }
                                      return null;
                                    };

                                    const variantInfo = {
                                      size: getVariantAttribute('size') || 
                                            item.selectedVariant?.size || 
                                            item.variant?.size || 
                                            item.size || 
                                            item.attributes?.size || 
                                            item.options?.size,
                                      color: getVariantAttribute('color') || 
                                             item.selectedVariant?.color || 
                                             item.variant?.color || 
                                             item.color || 
                                             item.attributes?.color || 
                                             item.options?.color
                                    };
                                    
                                    if (variantInfo.size || variantInfo.color) {
                                      return (
                                        <>
                                          <span className="ml-1">•</span>
                                          {variantInfo.size && (
                                            <span className="ml-1 text-[#5A1E12]/70 font-medium">Size: {variantInfo.size}</span>
                                          )}
                                          {variantInfo.color && (
                                            <span className="ml-1 text-[#5A1E12]/70 font-medium">
                                              {variantInfo.size ? ', ' : ''}Color: {variantInfo.color}
                                            </span>
                                          )}
                                        </>
                                      );
                                    }
                                    return null;
                                  })()}
                                </p>
                              </div>
                              <div className="text-sm font-bold text-[#5A1E12] shrink-0">
                                ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Download Invoice — only for DELIVERED */}
            {order.status === "DELIVERED" && (
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-2.5 px-4 md:px-6 py-3 md:py-3.5 bg-[#5A1E12] text-white font-semibold rounded-xl hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                {isDownloading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />
                }
                Download Invoice
              </button>
            )}
          </div>
        )}
      </main>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Cancel Order</h3>
              </div>
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel order{" "}
              <span className="font-bold text-gray-900">#{orderId.toUpperCase()}</span>?{" "}
              This action cannot be undone.
            </p>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you're cancelling this order..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || !cancelReason.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                {isCancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestTrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#ead7b7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A1E12]" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
