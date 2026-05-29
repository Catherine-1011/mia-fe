// app/hooks/useSingleProduct.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface VariantAttributeValue {
  value: string;
  displayValue: string;
  hexColor?: string | null;
}

export interface ProductVariant {
  id: string;
  price?: string;
  stock?: number;
  sku?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  featuredImage?: string;
  images?: string[];
  attributes?: Record<string, VariantAttributeValue>;
  // Legacy / fallback fields
  title?: string;
  options?: Record<string, string>;
}

export interface SingleProduct {
  weight?: string | number;
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  featuredImage?: string;
  galleryImages?: string[];
  stock: number;
  category?: string;
  brand?: string;
  sellerName?: string;
  artistName?: string;
  rating?: number;
  reviews?: number;
  discount?: number | boolean;
  tags?: string[];
  featured?: boolean;
  sellerId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  sellerUserName?: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  variants?: ProductVariant[];
  hasVariants?: boolean;
  // Variable product fields
  displayPrice?: string;
  totalStock?: number;
  variantCount?: number;
  productType?: string;
  type?: string;
}

interface ProductResponse {
  success: boolean;
  product: SingleProduct;
}

export const singleProductQueryKeys = {
  all: ["product"] as const,
  detail: (id: string) => [...singleProductQueryKeys.all, id] as const,
};

export function useSingleProduct(productId: string | undefined) {
  return useQuery({
    queryKey: singleProductQueryKeys.detail(productId || ""),
    queryFn: async (): Promise<SingleProduct> => {
      if (!productId) throw new Error("Product ID is required");
      
      const response = await apiClient.get<ProductResponse>(`/products/${productId}`);
      
      // Handle both wrapped and unwrapped responses
      const productData = response.product || (response as any as SingleProduct);

      // For VARIABLE products, price and stock come as null on root level.
      // The API returns displayPrice (e.g. "$25") and totalStock as the real values.
      const effectivePrice =
        productData.price ||
        (productData.displayPrice
          ? productData.displayPrice.replace(/[^0-9.]/g, '')
          : '0');
      const effectiveStock =
        productData.stock != null ? productData.stock : (productData.totalStock ?? 0);
      
      return {
        ...productData,
        price: effectivePrice,
        stock: effectiveStock,
        productType: productData.productType || productData.type,
        hasVariants: !!(productData.variants?.length || productData.variantCount),
      };
    },
    // Only fetch if we have a productId
    enabled: !!productId,
    // Always fetch fresh data on mount so featuredImage / galleryImages are never stale
    staleTime: 0,
    // Keep in cache for 5 minutes to avoid re-fetching on rapid navigations
    gcTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only retry once on failure
    retry: 1,
  });
}
// product

