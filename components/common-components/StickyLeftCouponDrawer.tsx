"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Copy, Check, Tag } from "lucide-react";
import { useCoupons } from "@/hooks/useCoupons";

export function StickyLeftCouponDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Use React Query hook
  const { data: coupons = [], isLoading, error, refetch } = useCoupons();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && !isLoading) {
      refetch();
    }
  }, [open]);

  // Handle copy to clipboard
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted) return null;
  if (pathname !== "/cart" && pathname !== "/shop/cart/checkout" && pathname !== "/checkout") return null;

  return (
    <>
      {/* Overlay - only show when drawer is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sticky Left Coupon Drawer Tab */}
      <div 
        className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer */}
        <div
          className="flex flex-col bg-[#5A1E12] shadow-2xl rounded-r-2xl w-80 max-h-105 backdrop-blur-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#441208] text-[#EAD7B7] border-b border-[#803512]/30 rounded-tr-2xl">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-[#EAD7B7]" />
              <h2 className="text-lg font-bold">Available Coupons</h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-[#803512] rounded-lg transition-all hover:scale-110 text-[#EAD7B7] hover:text-white"
              aria-label="Close coupons"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-linear-to-b from-[#5A1E12] to-[#441208] rounded-br-2xl">
            {isLoading && (
              <div className="text-sm text-[#EAD7B7]/70 text-center py-4 font-medium">
                🔄 Loading coupons...
              </div>
            )}
            {error && (
              <div className="text-sm text-red-300 text-center py-4 font-medium">
                ❌ {error.message}
              </div>
            )}
            {!isLoading && !error && coupons.length === 0 && (
              <div className="text-sm text-[#EAD7B7]/70 text-center py-4 font-medium">
                📋 No coupons available
              </div>
            )}
            {!isLoading && !error && coupons.length > 0 && (
              <div className="space-y-3">
                {coupons.map((coupon) => {
                  const couponId = (coupon.id || coupon._id) as string;
                  const isCopied = copiedId === couponId;
                  return (
                    <div
                      key={couponId}
                      className="p-4 border border-[#EAD7B7]/20 rounded-xl bg-[#EAD7B7]/10 hover:bg-[#EAD7B7]/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-[#EAD7B7] text-base tracking-wide">
                            {coupon.code}
                          </div>
                          <div className="text-sm text-[#EAD7B7]/80 line-clamp-2 mt-1">
                            {coupon.discount}{coupon.discount ? ' off' : ''} {coupon.description || "Special Offer"}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code, couponId)}
                          className="p-2 rounded-lg hover:bg-[#EAD7B7]/30 transition-all text-[#EAD7B7] shrink-0 hover:scale-110"
                          title="Copy coupon code"
                        >
                          {isCopied ? (
                            <Check className="w-5 h-5 text-green-300" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {isCopied && (
                        <div className="text-sm text-green-300 font-medium mt-2 animate-pulse">
                          ✓ Copied to clipboard!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Tab Button (visible when drawer is closed) */}
      {/* {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 w-10 h-28 bg-[#5A1E12] text-white flex flex-col items-center justify-center gap-1 rounded-r-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none"
          aria-label="Open coupons drawer"
          title="View Coupons"
        >
          <Tag className="w-4 h-4 mb-5" />
          <span className="text-xs font-bold transform -rotate-90 whitespace-nowrap mb-4">
            Coupons
          </span>
        </button>
      )} */}
    </>
  );
}
