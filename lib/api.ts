// app/lib/api.ts

const API_BASE_URL = "https://alpa-be.onrender.com/api";

// Generic API client with error handling
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(useAuth: boolean = true): Record<string, string> {
    const token = (useAuth && typeof window !== "undefined") ? localStorage.getItem("alpa_token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response, hadToken: boolean = false): Promise<T> {
    if (!response.ok) {
      // Only redirect on 401 when a token was actually sent — meaning the token
      // is expired / invalid. Skip the redirect for guest / unauthenticated calls.
      if (response.status === 401 && hadToken) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("alpa_token");
          window.location.href = "/";
        }
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private hasToken(): boolean {
    return typeof window !== "undefined" && !!localStorage.getItem("alpa_token");
  }

  async get<T>(endpoint: string, useAuth: boolean = true): Promise<T> {
    const hadToken = useAuth && this.hasToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getAuthHeaders(useAuth),
    });
    return this.handleResponse<T>(response, hadToken);
  }

  async post<T>(endpoint: string, data?: any, useAuth: boolean = true): Promise<T> {
    console.log(`API POST to ${endpoint}:`, data);
    const hadToken = useAuth && this.hasToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(useAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await this.handleResponse<T>(response, hadToken);
    console.log(`API POST ${endpoint} response:`, result);
    return result;
  }

  async put<T>(endpoint: string, data?: any, useAuth: boolean = true): Promise<T> {
    const hadToken = useAuth && this.hasToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getAuthHeaders(useAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response, hadToken);
  }

  async delete<T>(endpoint: string, useAuth: boolean = true): Promise<T> {
    const hadToken = useAuth && this.hasToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(useAuth),
    });
    return this.handleResponse<T>(response, hadToken);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string;
  isVerified?: boolean;
}

export interface Coupon {
  id?: string;
  _id?: string;
  code: string;
  description?: string;
  discount?: string | number;
}

export interface ValidatedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  minCartValue: number;
  maxDiscount: number;
  expiresAt: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  coupon?: ValidatedCoupon;
}

export interface CartItem {
  id: string;
  qty: number;
  // Add other cart item properties as needed
}

// API endpoints
export const authApi = {
  getProfile: (): Promise<{ user: User }> => apiClient.get("/profile"),
  logout: (): Promise<void> => apiClient.post("/auth/logout"),
};

export const couponsApi = {
  getCoupons: (): Promise<Coupon[]> => {
    return apiClient.get("/admin/coupons", false).then((data: any) => {
      // Handle different response formats
      return Array.isArray(data) ? data : data.coupons || [];
    });
  },
  validateCoupon: (code: string, orderTotal: number): Promise<ValidateCouponResponse> =>
    apiClient.post("/coupons/validate", { code, orderTotal }, false),
};

// ── Seller Coupon types ───────────────────────────────────────────────────

export interface SellerCouponItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export interface AppliedSellerCoupon {
  code: string;
  couponType: string;
  eligibleSellerId: string;
  savings: number;   // summary.totalSavingsExGST from API
  total: number;     // summary.discountedInclTotal from API
  nonQualifyingItems: { productId: string; quantity: number; reason: string }[];
}

export const sellerCouponsApi = {
  /** No auth required — public endpoint */
  applyCoupon: (
    code: string,
    items: SellerCouponItem[],
  ): Promise<any> =>
    apiClient.post("/seller-coupons/apply", { code, items }, false),

  /** Fetch active coupons, optionally scoped to one seller */
  getActiveCoupons: (sellerId?: string): Promise<any> => {
    const qs = sellerId ? `?sellerId=${sellerId}` : "";
    return apiClient.get(`/seller-coupons/active${qs}`, false);
  },
};

export const cartApi = {
  getCart: (): Promise<{ items: CartItem[] }> => apiClient.get("/cart"),
  getMyCart: (): Promise<{ cart: any[] }> => apiClient.get("/cart/my-cart"),
  addToCart: (data: { productId: string; quantity: number }): Promise<any> => 
    apiClient.post("/cart/add", data),
  updateCart: (data: { productId: string; quantity: number }): Promise<any> => 
    apiClient.put("/cart/update", data),
  removeFromCart: (productId: string): Promise<any> => 
    apiClient.delete(`/cart/remove/${productId}`),
};

export const wishlistApi = {
  getWishlist: (): Promise<any[]> => apiClient.get("/wishlist"),
  checkWishlist: (productId: string | number): Promise<{ inWishlist: boolean }> =>
    apiClient.get(`/wishlist/check/${productId}`),
  addToWishlist: (data: { productId: string | number; variantId?: string | null }): Promise<any> => {
    console.log("API: Trying multiple wishlist endpoints for productId:", data.productId, "variantId:", data.variantId);
    
    // Prepare payload with variantId if provided
    const payload: any = { productId: data.productId };
    if (data.variantId) {
      payload.variantId = data.variantId;
    }
    
    // Try the most common patterns for wishlist APIs
    const attempts = [
      () => apiClient.post("/wishlist", payload),
      () => apiClient.put("/wishlist", payload),
      () => apiClient.post("/user/wishlist", payload),
      () => apiClient.post("/wishlist/items", payload),
      () => apiClient.put(`/wishlist/${data.productId}`, data.variantId ? { variantId: data.variantId } : {}),
      () => apiClient.post(`/wishlist/${data.productId}`, data.variantId ? { variantId: data.variantId } : {}),
      // Some APIs expect the product ID in the URL path
      () => apiClient.get(`/wishlist/add/${data.productId}${data.variantId ? `?variantId=${data.variantId}` : ''}`),
      // Or as query parameter
      () => apiClient.post(`/wishlist/add?productId=${data.productId}${data.variantId ? `&variantId=${data.variantId}` : ''}`, {})
    ];
    
    let lastError: unknown;
    
    const tryEndpoint = async (index = 0): Promise<any> => {
      if (index >= attempts.length) {
        console.error("All wishlist endpoints failed. Last error:", lastError);
        let errorMsg = "";
        if (lastError && typeof lastError === "object" && "message" in lastError) {
          errorMsg = (lastError as any).message;
        } else {
          errorMsg = String(lastError);
        }
        throw new Error(`All wishlist endpoints failed. Available endpoints might be different. Last error: ${errorMsg}`);
      }
      
      try {
        console.log(`Trying wishlist endpoint ${index + 1}/${attempts.length}`);
        const result = await attempts[index]();
        console.log(`Wishlist endpoint ${index + 1} succeeded:`, result);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`Wishlist endpoint ${index + 1} failed:`, error);
        return tryEndpoint(index + 1);
      }
    };
    
    return tryEndpoint();
  },
  removeFromWishlist: (data: { productId: string | number; variantId?: string | null }): Promise<any> => {
    const attempts = [
      () => apiClient.delete(`/wishlist/${data.productId}${data.variantId ? `?variantId=${data.variantId}` : ''}`),
      () => apiClient.delete(`/wishlist/remove/${data.productId}${data.variantId ? `?variantId=${data.variantId}` : ''}`),
      () => apiClient.post(`/wishlist/remove`, { productId: data.productId, variantId: data.variantId }),
      () => apiClient.put(`/wishlist/remove`, { productId: data.productId, variantId: data.variantId })
    ];

    const tryRemove = async (index = 0): Promise<any> => {
      if (index >= attempts.length) {
        throw new Error(`All remove endpoints failed for productId: ${data.productId}, variantId: ${data.variantId}`);
      }
      try {
        return await attempts[index]();
      } catch (error) {
        return await tryRemove(index + 1);
      }
    };

    return tryRemove();
  },
  
  // New toggle wishlist API method
  toggleWishlist: (data: { productId: string | number; variantId?: string | null }): Promise<any> => {
    console.log("API: Trying toggle wishlist endpoints for productId:", data.productId, "variantId:", data.variantId);
    
    // Prepare payload with variantId if provided
    const payload: any = { productId: data.productId };
    if (data.variantId) {
      payload.variantId = data.variantId;
    }
    
    // Try multiple toggle endpoint patterns
    const attempts = [
      () => apiClient.post(`/wishlist/toggle/${data.productId}`, payload),
      () => apiClient.put(`/wishlist/toggle/${data.productId}`, payload),
      () => apiClient.post("/wishlist/toggle", payload),
      () => apiClient.put("/wishlist/toggle", payload),
      () => apiClient.post(`/user/wishlist/toggle/${data.productId}`, payload),
      () => apiClient.get(`/wishlist/toggle/${data.productId}`)
    ];
    
    let lastError: unknown;
    
    const tryToggleEndpoint = async (index = 0): Promise<any> => {
      if (index >= attempts.length) {
        // If no toggle endpoint works, fall back to manual check and add/remove
        console.log("No toggle endpoint found, falling back to manual toggle");
        try {
          const checkResult = await wishlistApi.checkWishlist(data.productId);
          if (checkResult.inWishlist) {
            console.log("Product in wishlist, removing...");
            return await wishlistApi.removeFromWishlist(data);
          } else {
            console.log("Product not in wishlist, adding...");
            return await wishlistApi.addToWishlist(data);
          }
        } catch (fallbackError) {
          console.error("Fallback toggle failed:", fallbackError);
          throw new Error(`Toggle wishlist failed. Neither dedicated endpoints nor fallback worked. Last error: ${fallbackError}`);
        }
      }
      
      try {
        console.log(`Trying toggle endpoint ${index + 1}/${attempts.length}`);
        const result = await attempts[index]();
        console.log(`Toggle endpoint ${index + 1} succeeded:`, result);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`Toggle endpoint ${index + 1} failed:`, error);
        return tryToggleEndpoint(index + 1);
      }
    };
    
    return tryToggleEndpoint();
  }
};

export const productsApi = {
  getAllProducts: (): Promise<{ products: any[] }> => apiClient.get("/products/all"),
  getProduct: (id: string): Promise<any> => apiClient.get(`/products/${id}`),
  // Add more product endpoints as needed
};