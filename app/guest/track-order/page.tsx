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
              <span className="truncate">Sub Order: #{sellerOrder.id?.slice(-8).toUpperCase() || 'No ID'}</span>
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          {/* Current status badge */}
          <div className="mb-2">
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
          <p className="text-sm md:text-lg font-bold text-[#5A1E12]">${parseFloat(sellerOrder.subTotal || '0').toFixed(2)}</p>
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
    // Only call handleTrack if we have credentials but no cached order
    if (orderId && email && !order) {
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
        `http://134.199.161.119:5000/api/orders/guest/track?orderId=${encodeURIComponent(trimmedOrderId)}&customerEmail=${encodeURIComponent(trimmedEmail)}`
      );
      const data = await res.json();
      
      // Log the initial API response for debugging
      console.log('🔥 FRESH API CALL - CHECKING FOR UPDATED BACKEND STRUCTURE');
      console.log('Full API Response:', data);
      
      // Debug variant data structure
      if (data.order && data.order.items) {
        console.log('🔍 VARIANT DATA DEBUG - Checking item structures:');
        data.order.items.forEach((item: any, index: number) => {
          console.log(`Item ${index + 1}: ${item.product?.title}`);
          console.log('  Full item structure:', JSON.stringify(item, null, 2));
          console.log('  selectedVariant:', item.selectedVariant);
          console.log('  variant:', item.variant);
          console.log('  size:', item.size);
          console.log('  color:', item.color);
          console.log('  attributes:', item.attributes);
          console.log('  options:', item.options);
          console.log('  productVariant:', item.productVariant);
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
      
      console.log(`🛒 Order Analysis:`, {
        orderId: finalOrder.id,
        isMultiSeller: hasMultipleSellers,
        itemCount: finalOrder.items?.length || 0,
        totalAmount: finalOrder.totalAmount,
        hasSubOrders: !!finalOrder.subOrders,
        subOrdersCount: finalOrder.subOrders?.length || 0
      });
      
      console.log('🔍 RAW API RESPONSE STRUCTURE (UPDATED BACKEND):', {
        hasSubOrders: !!finalOrder.subOrders,
        subOrdersCount: finalOrder.subOrders?.length || 0,
        subOrdersData: finalOrder.subOrders ? finalOrder.subOrders.map((so: any) => ({
          id: so.id,
          status: so.status,
          sellerId: so.sellerId,
          sellerName: so.seller?.name,
          hasItems: !!so.items,
          itemsCount: so.items?.length || 0
        })) : 'NO SUBORDERS',
        hasItems: !!finalOrder.items,
        itemsCount: finalOrder.items?.length || 0
      });
      
      // Always check for subOrders first, regardless of multi-seller detection
      if (finalOrder.subOrders && finalOrder.subOrders.length > 0) {
        console.log('📦 FOUND subOrders in API response - processing multi-seller data...');
        
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
          console.log(`📋 Populated ${allItems.length} items from subOrders data`);
        }
        
        console.log(`✅ Successfully structured segregated data from ${finalOrder.subOrders.length} subOrders`);
        
        // Debug each subOrder  
        finalOrder.subOrders.forEach((subOrder: any, index: number) => {
          console.log(`Sub-Order ${index + 1}:`, {
            id: subOrder.id,
            sellerId: subOrder.sellerId,
            sellerName: subOrder.seller?.name,
            status: subOrder.status,
            itemCount: subOrder.items?.length || 0,
            subtotal: subOrder.subtotal
          });
        });
        
      } else if (hasMultipleSellers) {
        console.warn('⚠️ Multi-seller order detected but no subOrders found in API response');
        finalOrder.isMultiSeller = false; // Fallback to single seller mode
      } else {
        console.log('📦 Single-seller order detected');
        finalOrder.isMultiSeller = false;
      }
      
      // Final validation
      const finalValidationIssues = validateOrderData(finalOrder);
      if (finalValidationIssues.length > 0) {
        console.warn('⚠️ Final order validation issues:', finalValidationIssues);
      }
      
      console.log('✅ Final order data ready:', {
        orderId: finalOrder.id,
        parentStatus: finalOrder.status, // This should come from API
        isMultiSeller: finalOrder.isMultiSeller,
        itemCount: finalOrder.items?.length || 0,
        hasSegregatedData: !!finalOrder.segregatedData,
        sellerCount: finalOrder.segregatedData?.subOrders?.length || 0,
        segregatedParentStatus: finalOrder.segregatedData?.status, // Check if API provides this
        sellersStatuses: finalOrder.segregatedData?.subOrders?.map((so: { sellerId: any; seller: { name: any; }; status: any; }) => ({
          sellerId: so.sellerId,
          sellerName: so.seller.name,
          status: so.status,
          hasStatus: !!so.status
        })) || 'No seller data',
        
        // 🚨 CRITICAL DEBUG: Check if items can find their seller orders
        itemSellerMatching: finalOrder.items?.map((item: any) => ({
          productTitle: item.product?.title,
          productId: item.product?.id,
          foundSeller: finalOrder.segregatedData?.subOrders?.find((so: any) => 
            so.items?.some((soItem: any) => soItem.product.id === item.product.id)
          )?.seller?.name || '❌ NO MATCH'
        })) || 'No items'
      });
      
      // Check what data we're getting from API
      console.group('🔍 FINAL API DATA VERIFICATION - SUB-ORDER STATUS CHECK');
      console.log('Main Order Status:', finalOrder.status);
      console.log('Is Multi-Seller:', finalOrder.isMultiSeller);
      console.log('Has Segregated Data:', !!finalOrder.segregatedData);
      
      if (finalOrder.segregatedData && finalOrder.segregatedData.subOrders) {
        console.log('✅ SEGREGATED DATA FOUND - Multi-seller order with sub-orders');
        console.log('Segregated Parent Status:', finalOrder.segregatedData.status);
        
        console.log('\n📦 INDIVIDUAL SUB-ORDER STATUSES FROM API:');
        finalOrder.segregatedData.subOrders.forEach((subOrder: any, index: number) => {
          console.log(`\n--- Sub-Order ${index + 1}: ${subOrder.seller?.name || 'Unknown Seller'} ---`);
          console.log('├─ Seller ID:', subOrder.sellerId);
          console.log('├─ Sub-Order Status from API:', subOrder.status || '❌ NO STATUS');
          console.log('├─ Sub Order ID:', subOrder.id);
          console.log('├─ Sub Total:', subOrder.subtotal);
          console.log('├─ Tracking Number:', subOrder.trackingNumber || 'None');
          
          if (subOrder.items && subOrder.items.length > 0) {
            console.log('├─ Products in this sub-order:');
            subOrder.items.forEach((item: any, itemIndex: number) => {
              console.log(`   ${itemIndex + 1}. ${item.product?.title || 'Unknown Product'}`);
              console.log(`      Price: $${item.price} × Qty: ${item.quantity}`);
              console.log(`      ✅ Individual Product Status: ${subOrder.status || '❌ NO STATUS'}`);
              console.log(`      📦 Seller: ${subOrder.seller?.name}`);
              console.log(`      🔗 Status Source: Main API (/track endpoint - subOrders)`);
            });
          } else {
            console.log('├─ ❌ No items found for this sub-order');
          }
          console.log('└─────────────────────────────────────');
        });
        
        // Summary of API data
        const sellerStatusSummary = finalOrder.segregatedData.subOrders.map((so: any) => ({
          sellerName: so.seller?.name,
          status: so.status,
          hasStatus: !!so.status,
          itemCount: so.items?.length || 0
        }));
        
        console.log('\n📊 API STATUS SUMMARY:');
        console.table(sellerStatusSummary);
        
        const hasAllStatuses = finalOrder.segregatedData.subOrders.every((so: any) => !!so.status);
        console.log(`\n✅ All sellers have SUB-ORDER status from API: ${hasAllStatuses ? 'YES' : '❌ NO - Some sellers missing status'}`);
        console.log(`🔝 Parent order status (shown in delivery progress): ${finalOrder.status}`);
        console.log(`📦 Sub-order statuses (shown on individual products): ${finalOrder.segregatedData.subOrders.map((so: any) => `${so.seller?.name}: ${so.status}`).join(', ')}`);
        
        // Show product-level status mapping
        console.log('\n🏷️ INDIVIDUAL PRODUCT SUB-ORDER STATUS MAPPING:');
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
        console.log('📝 Note: Each product shows its seller\'s SUB-ORDER status from API, NOT parent status');
        
        // 🚨 ITEM MATCHING DEBUG
        console.log('\n🔍 ITEM-TO-SUB-ORDER MATCHING DEBUG:');
        if (finalOrder.items) {
          finalOrder.items.forEach((item: any, index: number) => {
            console.log(`\nItem ${index + 1}: ${item.product?.title || 'Unknown'}`);
            console.log(`  Product ID: ${item.product?.id || 'No ID'}`);
            
            const matchingSeller = finalOrder.segregatedData.subOrders.find((so: any) => 
              so.items?.some((soItem: any) => soItem.product.id === item.product.id)
            );
            
            if (matchingSeller) {
              console.log(`  ✅ Matched to Seller: ${matchingSeller.seller?.name || 'Unknown'}`);
              console.log(`  📊 SUB-ORDER Status: ${matchingSeller.status || '❌ NO STATUS'}`);
              console.log(`  🆔 Sub-Order ID: ${matchingSeller.id || 'No ID'}`);
              console.log(`  🔗 Will show SUB-ORDER status badge: YES`);
            } else {
              console.log(`  ❌ No seller match found - WILL NOT show status badge`);
              console.log(`  🔗 Will show status badge: NO`);
              console.log(`  🐛 Available seller items for comparison:`, finalOrder.segregatedData.subOrders.map((so: any) => ({
                sellerName: so.seller?.name,
                subOrderId: so.id,
                status: so.status,
                itemIds: so.items?.map((si: any) => si.product?.id) || []
              })));
            }
          });
        }
        
      } else {
        console.log('❌ NO SEGREGATED DATA - Either single seller or API not returning seller data');
        console.log('Main order items:', finalOrder.items?.length || 0);
        if (finalOrder.items && finalOrder.items.length > 0) {
          console.log('Products in main order (no individual seller statuses):');
          finalOrder.items.forEach((item: any, index: number) => {
            console.log(`${index + 1}. ${item.product?.title} - Inherits parent status: ${finalOrder.status}`);
          });
        }
      }
      console.groupEnd();
      
      // 🚨 FINAL DEBUG: Show exactly what we're setting as the order
      console.log('🎯 SETTING ORDER WITH THIS STRUCTURE:', {
        id: finalOrder.id,
        status: finalOrder.status,
        isMultiSeller: finalOrder.isMultiSeller,
        hasSegregatedData: !!finalOrder.segregatedData,
        segregatedSubOrdersCount: finalOrder.segregatedData?.subOrders?.length || 0,
        itemsCount: finalOrder.items?.length || 0,
        finalStructure: {
          mainOrder: {
            id: finalOrder.id,
            status: finalOrder.status,
            itemsCount: finalOrder.items?.length || 0
          },
          segregatedData: finalOrder.segregatedData ? {
            subOrdersCount: finalOrder.segregatedData.subOrders?.length || 0,
            subOrders: finalOrder.segregatedData.subOrders?.map((so: any) => ({
              id: so.id,
              sellerName: so.seller?.name,
              status: so.status,
              itemsCount: so.items?.length || 0
            })) || []
          } : null
        }
      });
      
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

  // Users cannot edit status - removed seller status updating
  /*
  const handleSellerStatusUpdate = async (sellerId: string, newStatus: string) => {
    if (!order || !order.segregatedData) return;
    
    try {
      const res = await fetch(
        `http://134.199.161.119:5000/api/orders/guest/seller-status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId.trim(),
            customerEmail: email.trim(),
            sellerId,
            newStatus
          })
        }
      );
      
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      // Get the response data - should include updated parent status from backend
      const responseData = await res.json();
      console.log('🔄 Seller Status Update Response:', responseData);
      
      // Detailed logging for individual seller status update
      console.group('🔍 INDIVIDUAL SELLER STATUS UPDATE FROM API');
      console.log('├─ Seller ID Updated:', sellerId);
      console.log('├─ New Status Set:', newStatus);
      console.log('├─ API Response Data:', responseData);
      console.log('├─ Parent Status from API:', responseData.parentOrderStatus || 'NOT PROVIDED');
      console.log('├─ Full Order Data from API:', responseData.order || 'NOT PROVIDED');
      
      if (responseData.sellerOrders) {
        console.log('├─ Individual Seller Statuses from API:');
        responseData.sellerOrders.forEach((seller: any, index: number) => {
          console.log(`   ${index + 1}. ${seller.seller?.name}: ${seller.status || 'NO STATUS'}`);
        });
      } else if (responseData.subOrders) {
        console.log('├─ Individual Sub-Order Statuses from API:');
        responseData.subOrders.forEach((subOrder: any, index: number) => {
          console.log(`   ${index + 1}. ${subOrder.seller?.name}: ${subOrder.status || 'NO STATUS'}`);
        });
      } else {
        console.log('├─ ❌ No individual seller/sub-order statuses returned from API');
      }
      console.groupEnd();
      
      // Use the parent status from API response if provided
      const updatedParentStatus = responseData.parentOrderStatus || responseData.order?.status || order.status;
      
      console.log(`📊 Status Update from API:`, {
        sellerUpdated: sellerId,
        newSellerStatus: newStatus,
        apiParentStatus: updatedParentStatus,
        currentParentStatus: order.status,
        fullResponse: responseData
      });
      
      // Update local state with API data
      setOrder(prev => {
        if (!prev?.segregatedData) return prev;
        
        const updatedSellerOrders = prev.segregatedData.subOrders.map((so: { sellerId: string; }) =>
          so.sellerId === sellerId ? { ...so, status: newStatus } : so
        );
        
        const updatedOrder = {
          ...prev,
          status: updatedParentStatus, // Use parent status from API
          segregatedData: {
            ...prev.segregatedData,
            status: updatedParentStatus, // Update segregated data parent status too
            subOrders: updatedSellerOrders
          }
        };
        
        // Show info if parent status changed
        if (updatedParentStatus !== prev.status) {
          toast.info(
            `Order status updated to ${ORDER_STATUS_MAPPING[updatedParentStatus as keyof typeof ORDER_STATUS_MAPPING]?.label || updatedParentStatus}`,
            { autoClose: 3000 }
          );
        }
        
        return updatedOrder;
      });
    } catch (error) {
      console.error('❌ Error updating seller status:', error);
      throw error;
    }
  };
  */

  // Users cannot edit status - removed parent status updating
  /*
  const handleParentStatusUpdate = async (newStatus: string, showToast: boolean = true) => {
    if (showToast) setUpdatingParentStatus(true);
    
    try {
      const res = await fetch(
        `http://134.199.161.119:5000/api/orders/guest/parent-status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId.trim().toUpperCase(),
            customerEmail: email.trim(),
            newStatus
          })
        }
      );
      
      if (!res.ok) {
        throw new Error('Failed to update parent order status');
      }
      
      // Update local state only if this wasn't called from seller status update
      if (showToast) {
        setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
        toast.success("Parent order status updated successfully!");
      }
    } catch (error) {
      if (showToast) {
        toast.error("Failed to update parent order status");
      }
    } finally {
      if (showToast) setUpdatingParentStatus(false);
    }
  };
  */

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const url = `http://134.199.161.119:5000/api/orders/guest/invoice?orderId=${encodeURIComponent(orderId.toUpperCase())}&customerEmail=${encodeURIComponent(email)}`;
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
            <div className="mb-6 md:mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5A1E12]/40 mb-1">Order Summary</p>
              <h2 className="text-xl md:text-2xl font-bold text-[#5A1E12]">Hello, {order.customerName.split(" ")[0]} 👋</h2>
              <p className="text-sm text-[#5A1E12]/50 mt-1">Here's the latest on your order.</p>
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
                                  
                                  console.log(`Variant info for ${item.product?.title}:`, variantInfo);
                                  
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
                                console.log(`🔍 PRODUCT STATUS BADGE CHECK for: ${item.product?.title}`);
                                console.log(`  - Has segregatedData: ${!!order.segregatedData}`);
                                console.log(`  - Has subOrders: ${!!order.segregatedData?.subOrders}`);
                                console.log(`  - SubOrders count: ${order.segregatedData?.subOrders?.length || 0}`);
                                console.log(`  - Product ID: ${item.product?.id}`);
                                
                                // ONLY show individual seller status, NOT parent status
                                if (order.segregatedData && order.segregatedData.subOrders) {
                                  console.log(`  - Searching for matching subOrder...`);
                                  
                                  const subOrder = order.segregatedData.subOrders.find((so: { items: any[]; seller: any; status: any; }) => {
                                    const hasMatchingItem = so.items && so.items.some((soItem: any) => soItem.product.id === item.product.id);
                                    console.log(`  - Checking seller ${so.seller?.name}: hasMatchingItem = ${hasMatchingItem}`);
                                    return hasMatchingItem;
                                  });
                                  
                                  console.log(`  - Found matching subOrder:`, subOrder ? {
                                    sellerId: (subOrder as any).sellerId,
                                    sellerName: (subOrder as any).seller?.name,
                                    status: (subOrder as any).status,
                                    hasStatus: !!(subOrder as any).status
                                  } : 'NO MATCH');
                                  
                                  // Only return status if we found a matching sub-order
                                  if (subOrder && (subOrder as any).status) {
                                    console.log(`  ✅ WILL SHOW STATUS BADGE: ${(subOrder as any).status} (${(subOrder as any).seller?.name})`);
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
                                    console.log(`  ❌ NO STATUS BADGE: ${subOrder ? 'subOrder found but no status or seller' : 'no matching subOrder'}`);
                                  }
                                } else {
                                  console.log(`  ❌ NO STATUS BADGE: No segregatedData or subOrders`);
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
