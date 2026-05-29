// app/hooks/useProducts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface Product {
  id: string;
  title?: string;  // Made optional as DB might not always have this
  description?: string;  // Made optional
  price?: string;  // Made optional 
  category?: string;  // Made optional
  stock?: number;
  images?: string[];
  featuredImage?: string;
  galleryImages?: string[];
  brand?: string;
  slug?: string;
  tags?: string[];
  featured?: boolean;
  discount?: boolean;
  artistName?: string;
  sellerName?: string;
  sellerId?: string;
  avgRating?: number;
  ratingCount?: number;
  rating?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  sellerUserName?: string;
  // Variable product fields
  displayPrice?: string;
  totalStock?: number;
  variantCount?: number;
  productType?: string;
  type?: string;
}

export const productQueryKeys = {
  products: ["products"] as const,
  allProducts: ["products", "all"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.allProducts,
    queryFn: async (): Promise<Product[]> => {
      try {
        const data = await apiClient.get<{ products: Product[] }>("/products/all");
        
        // Validate that we got the expected data structure
        if (!data || !Array.isArray(data.products)) {
          console.warn("Invalid products data structure:", data);
          return [];
        }

        // Extract brand from title if not provided and add slug with null safety
        return data.products.map((product: Product) => {
          // For VARIABLE products, price and stock are null on the root level.
          // The API provides displayPrice (e.g. "$25") and totalStock instead.
          const effectivePrice =
            product.price ||
            (product.displayPrice
              ? product.displayPrice.replace(/[^0-9.]/g, '')
              : '0');
          const effectiveStock =
            product.stock != null ? product.stock : (product.totalStock ?? 0);

          return {
            ...product,
            // Ensure required fields have safe defaults
            title: product.title || 'Untitled Product',
            description: product.description || 'No description available',
            category: product.category || 'Uncategorized',
            price: effectivePrice,
            stock: effectiveStock,
            images: product.images || [],
            tags: product.tags || [],
            // Safe brand extraction
            brand: product.brand || (product.title ? product.title.split(" ")[0] : 'Unknown'),
            // Safe slug generation
            slug: product.title ? product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `product-${product.id}`,
            rating: product.avgRating ?? 0,
            // Keep artistName as-is (undefined if not available)
            artistName: product.artistName,
            // Handle featured/discount fields safely
            featured: product.featured ?? false,
            discount: product.discount ?? false,
            // Preserve variable product metadata
            displayPrice: product.displayPrice,
            totalStock: product.totalStock,
            variantCount: product.variantCount,
            productType: product.productType || product.type,
          };
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        // Re-throw with more context
        throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    // Cache products for 20 minutes since they don't change frequently
    staleTime: 1000 * 60 * 20,
    // Keep in cache for 1 hour
    gcTime: 1000 * 60 * 60,
    // Never refetch automatically
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only retry once on failure
    retry: 1,
  });
}