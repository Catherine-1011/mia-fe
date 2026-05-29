// app/components/common-components/CouponDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Component, Copy, Check } from "lucide-react";
import { useCoupons } from "@/hooks/useCoupons";

// Desktop Coupon Dropdown with text
export function CouponDropdown() {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use React Query hook
  const { data: coupons = [], isLoading, error, refetch } = useCoupons();

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      // Optionally refetch when opening if data is stale
      if (next && !isLoading) {
        refetch();
      }
      return next;
    });
  };

  // Handle copy to clipboard
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        Coupons 
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
          <div className="p-3">
            {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error.message}</div>}
            {!isLoading && !error && coupons.length === 0 && (
              <div className="text-sm text-gray-500">No coupons found.</div>
            )}
            {!isLoading && !error && coupons.length > 0 && (
              <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {coupons.map((coupon) => {
                  const couponId = (coupon.id || coupon._id) as string;
                  const isCopied = copiedId === couponId;
                  return (
                    <li key={couponId} className="py-2 px-1 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800">{coupon.code}</div>
                          <div className="text-xs text-gray-600">
                            {coupon.description || coupon.discount || "No description"}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code, couponId)}
                          className="shrink-0 p-1.5 rounded hover:bg-gray-200 transition text-gray-600 hover:text-gray-800"
                          title="Copy coupon code"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Desktop Coupon Dropdown with icon only
export function CouponDropdownIcon() {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use React Query hook
  const { data: coupons = [], isLoading, error, refetch } = useCoupons();

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      // Optionally refetch when opening if data is stale
      if (next && !isLoading) {
        refetch();
      }
      return next;
    });
  };

  // Handle copy to clipboard
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="View Coupons"
      >
        <Component className="w-6 h-6 text-gray-800" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
          <div className="p-3">
            {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error.message}</div>}
            {!isLoading && !error && coupons.length === 0 && (
              <div className="text-sm text-gray-500">No coupons found.</div>
            )}
            {!isLoading && !error && coupons.length > 0 && (
              <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {coupons.map((coupon) => {
                  const couponId = (coupon.id || coupon._id) as string;
                  const isCopied = copiedId === couponId;
                  return (
                    <li key={couponId} className="py-2 px-1 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800">{coupon.code}</div>
                          <div className="text-xs text-gray-600">
                            {coupon.description || coupon.discount || "No description"}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code, couponId)}
                          className="shrink-0 p-1.5 rounded hover:bg-gray-200 transition text-gray-600 hover:text-gray-800"
                          title="Copy coupon code"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}