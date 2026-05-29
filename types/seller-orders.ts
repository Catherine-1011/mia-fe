// types/seller-orders.ts - Types for seller-segregated orders

export interface Seller {
  id: string;
  name: string;
  email?: string;
  logo?: string;
}

export interface SellerOrderItem {
  color: any;
  options: any;
  attributes: any;
  size: any;
  variant: any;
  selectedVariant: any;
  id: string;
  quantity: number;
  price: string;
  product: {
    featuredImage: string;
    id: string;
    title: string;
    images: string[];
    sellerId?: string;
  };
}

export interface SellerOrder {
  id: any;
  sellerId: string;
  seller: Seller;
  status: string;
  subOrderId: string;
  items: SellerOrderItem[];
  subTotal: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SegregatedOrder {
  subOrders: any;
  id: string;
  parentOrderId: string;
  status: string; // Parent order status
  totalAmount: string;
  customerName: string;
  shippingAddressLine: string;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  shippingZipCode: string;
  customerEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  sellerOrders: SellerOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatus {
  orderId: string;
  status: string;
  paymentStatus: string;
  isMultiSeller?: boolean;
  segregatedData?: SegregatedOrder;
}

export const ORDER_STATUS_MAPPING = {
  PENDING: { label: "Pending", color: "#f59e0b" },
  CONFIRMED: { label: "Confirmed", color: "#10b981" },
  PROCESSING: { label: "Processing", color: "#3b82f6" },
  SHIPPED: { label: "Shipped", color: "#8b5cf6" },
  DELIVERED: { label: "Delivered", color: "#059669" },
  CANCELLED: { label: "Cancelled", color: "#ef4444" },
} as const;

export const SELLER_ORDER_STEPS = [
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
] as const;