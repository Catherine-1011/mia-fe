// Guest cart utilities for localStorage management
import { CartItem, CartProduct, ShippingOption } from '@/hooks/useEnhancedCart';

const GUEST_CART_KEY = 'guest_cart_items';
const GUEST_CART_METADATA_KEY = 'guest_cart_metadata';
const SHIPPING_METHODS_CACHE_KEY = 'shipping_methods_cache';
const CHECKOUT_OPTIONS_CACHE_KEY = 'checkout_options_cache';

export interface GuestCartItem {
  productId: string;
  quantity: number;
  product: CartProduct;
  variantId?: string;
  variant?: {
    id: string;
    attributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>;
  };
}

export interface GSTOption {
  id: string;
  name: string;
  percentage: number;
  description: string;
  isDefault?: boolean;
}

// Fetch checkout options (shipping + GST) from backend - single unified call
export const getCheckoutOptions = async (): Promise<{
  shipping: ShippingOption[];
  gstOptions: GSTOption[];
  defaultGST: GSTOption | null;
} | null> => {
  try {
    // Check if we have cached checkout options (valid for 1 hour)
    const cached = localStorage.getItem(CHECKOUT_OPTIONS_CACHE_KEY);
    if (cached) {
      const { options, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 3600000) { // 1 hour cache
        return options;
      }
    }

    // Fetch from backend - GET /api/cart/checkout-options
    const response = await fetch('https://alpa-be.onrender.com/api/cart/checkout-options', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch checkout options');
    }

    const data = await response.json();
    const options = {
      shipping: data.data?.shipping || [],
      gstOptions: data.data?.gst?.options || [],
      defaultGST: data.data?.gst?.default || null,
    };

    // Cache the options
    localStorage.setItem(CHECKOUT_OPTIONS_CACHE_KEY, JSON.stringify({
      options,
      timestamp: Date.now(),
    }));

    return options;
  } catch (error) {
    console.error('Error fetching checkout options:', error);
    return null;
  }
};

// Fetch real shipping methods from backend (uses checkout-options)
export const getShippingMethods = async (): Promise<ShippingOption[]> => {
  const options = await getCheckoutOptions();
  return options?.shipping || [];
};

export const guestCartUtils = {
  // Get all items from guest cart
  getGuestCart: (): GuestCartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error reading guest cart from localStorage:', error);
      return [];
    }
  },

  // Save guest cart to localStorage
  saveGuestCart: (items: GuestCartItem[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving guest cart to localStorage:', error);
    }
  },

  // Add item to guest cart
  addItemToGuestCart: (
    productId: string,
    productData: CartProduct,
    quantity: number = 1,
    variantId?: string,
    variantAttributes?: Record<string, { value: string; displayValue: string; hexColor?: string | null }>,
  ): GuestCartItem[] => {
    const items = guestCartUtils.getGuestCart();
    const existingItem = items.find((item) =>
      item.productId === productId && (!variantId || item.variantId === variantId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({
        productId,
        quantity,
        product: productData,
        ...(variantId && { variantId }),
        ...(variantId && variantAttributes && {
          variant: { id: variantId, attributes: variantAttributes },
        }),
      });
    }

    guestCartUtils.saveGuestCart(items);
    return items;
  },

  // Update item quantity in guest cart
  updateGuestCartItem: (productId: string, newQuantity: number, variantId?: string): GuestCartItem[] => {
    const items = guestCartUtils.getGuestCart();
    const item = items.find((i) =>
      i.productId === productId && (!variantId || i.variantId === variantId)
    );

    if (item) {
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        const updatedItems = items.filter((i) =>
          !(i.productId === productId && (!variantId || i.variantId === variantId))
        );
        guestCartUtils.saveGuestCart(updatedItems);
        return updatedItems;
      } else {
        item.quantity = newQuantity;
        guestCartUtils.saveGuestCart(items);
      }
    }

    return items;
  },

  // Remove item from guest cart
  removeFromGuestCart: (productId: string, variantId?: string): GuestCartItem[] => {
    const items = guestCartUtils.getGuestCart();
    const updatedItems = items.filter((item) =>
      !(item.productId === productId && (!variantId || item.variantId === variantId))
    );
    guestCartUtils.saveGuestCart(updatedItems);
    return updatedItems;
  },

  // Clear all guest cart items
  clearGuestCart: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_CART_KEY);
  },

  // Calculate guest cart totals
  calculateGuestCartTotals: (items: GuestCartItem[]): { subtotal: number; itemCount: number } => {
    const subtotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return { subtotal, itemCount };
  },

  // Check if cart is empty
  isGuestCartEmpty: (): boolean => {
    return guestCartUtils.getGuestCart().length === 0;
  },

  // Calculate guest cart totals using backend API
  calculateGuestCartTotalsFromAPI: async (
    items: { productId: string; quantity: number; variantId?: string }[],
    shippingMethodId?: string,
    gstId?: string
  ): Promise<{ 
    subtotal: number; 
    shippingCost: number; 
    gstAmount: number; 
    grandTotal: number;
    gstPercentage: number;
  } | null> => {
    try {
      const response = await fetch("https://alpa-be.onrender.com/api/cart/calculate-guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          ...(shippingMethodId && { shippingMethodId }),
          ...(gstId && { gstId }),
        }),
      });

      if (!response.ok) {
        console.error("Failed to calculate guest cart totals");
        return null;
      }

      const data = await response.json();
      const calculations = data.calculations || {};
      
      return {
        subtotal: parseFloat(calculations.subtotal || 0),
        shippingCost: parseFloat(calculations.shippingCost || 0),
        gstAmount: parseFloat(calculations.gstAmount || 0),
        grandTotal: parseFloat(calculations.grandTotal || 0),
        gstPercentage: parseFloat(calculations.gstPercentage || 10),
      };
    } catch (error) {
      console.error("Error calculating guest cart totals:", error);
      return null;
    }
  },
};

/**
 * Merges the guest cart (localStorage) into the user's server cart after login.
 * Calls POST /api/cart/sync then clears the local guest cart.
 * Safe to call even if the guest cart is empty.
 */
export const syncGuestCartAfterLogin = async (token: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  const items = guestCartUtils.getGuestCart();
  if (items.length === 0) return;

  try {
    await fetch('https://alpa-be.onrender.com/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });
    // Clear local guest cart after successful sync
    guestCartUtils.clearGuestCart();
  } catch (error) {
    console.error('Failed to sync guest cart after login:', error);
  }
};
