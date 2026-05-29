// lib/orderUtils.ts - Utility functions for order handling

export const detectMultiSellerOrder = (order: any): boolean => {
  if (!order) return false;
  
  // Check explicit flag first
  if (order.isMultiSeller === true) return true;
  
  // Check if items have different seller IDs
  if (order.items && Array.isArray(order.items) && order.items.length > 1) {
    const sellerIds = order.items
      .map((item: any) => item.product?.sellerId)
      .filter(Boolean);
    
    const uniqueSellerIds = new Set(sellerIds);
    return uniqueSellerIds.size > 1;
  }
  
  return false;
};

export const logApiResponse = (endpoint: string, response: any, orderId?: string) => {
  if (typeof window !== 'undefined') {
    console.group(`🔍 API Response: ${endpoint}`);
    console.log('Order ID:', orderId);
    console.log('Response:', response);
    
    if (response.order) {
      console.log('Order Items Count:', response.order.items?.length || 0);
      console.log('Is Multi-Seller:', response.order.isMultiSeller);
      
      if (response.order.segregatedData) {
        console.log('Segregated Sellers:', response.order.segregatedData.sellerOrders?.length || 0);
      }
      
      if (response.order.items) {
        const sellerIds = response.order.items
          .map((item: any) => item.product?.sellerId)
          .filter(Boolean);
        console.log('Detected Seller IDs:', [...new Set(sellerIds)]);
      }
    }
    
    console.groupEnd();
  }
};

export const validateOrderData = (order: any): string[] => {
  const issues: string[] = [];
  
  if (!order) {
    issues.push('Order object is null or undefined');
    return issues;
  }
  
  if (!order.id) {
    issues.push('Order ID is missing');
  }
  
  if (!order.items || !Array.isArray(order.items)) {
    issues.push('Order items array is missing or invalid');
  } else if (order.items.length === 0) {
    issues.push('Order has no items');
  }
  
  if (order.isMultiSeller && !order.segregatedData) {
    issues.push('Multi-seller order missing segregated data');
  }
  
  if (order.segregatedData && (!order.segregatedData.sellerOrders || order.segregatedData.sellerOrders.length === 0)) {
    issues.push('Segregated data exists but has no seller orders');
  }
  
  return issues;
};

// Determine parent order status based on seller statuses
export const calculateParentOrderStatus = (sellerOrders: any[]): string => {
  if (!sellerOrders || sellerOrders.length === 0) {
    return 'CONFIRMED';
  }
  
  // Get all unique seller statuses
  const statuses = sellerOrders.map(so => so.status);
  const uniqueStatuses = [...new Set(statuses)];
  
  // If all sellers have the same status, parent adopts that status
  if (uniqueStatuses.length === 1) {
    return uniqueStatuses[0];
  }
  
  // Priority order: DELIVERED > SHIPPED > PROCESSING > CONFIRMED
  const statusPriority = {
    'DELIVERED': 4,
    'SHIPPED': 3,
    'PROCESSING': 2,
    'CONFIRMED': 1
  };
  
  // If sellers have mixed statuses, use the lowest common status
  // But if any seller is DELIVERED and others are SHIPPED, parent can be SHIPPED
  // If any seller is SHIPPED and others are PROCESSING, parent can be PROCESSING
  
  const hasDelivered = statuses.includes('DELIVERED');
  const hasShipped = statuses.includes('SHIPPED');
  const hasProcessing = statuses.includes('PROCESSING');
  const hasConfirmed = statuses.includes('CONFIRMED');
  
  // If all items are delivered or shipped, parent can be shipped
  if (hasDelivered && !hasProcessing && !hasConfirmed) {
    return 'SHIPPED';
  }
  
  // If all items are delivered, shipped, or processing, parent can be processing
  if ((hasDelivered || hasShipped || hasProcessing) && !hasConfirmed) {
    return 'PROCESSING';
  }
  
  // If any item is still confirmed, parent stays confirmed
  if (hasConfirmed) {
    return 'CONFIRMED';
  }
  
  // Fallback: return the minimum status
  const minPriority = Math.min(...statuses.map(s => statusPriority[s as keyof typeof statusPriority] || 1));
  const minStatus = Object.keys(statusPriority).find(s => statusPriority[s as keyof typeof statusPriority] === minPriority);
  
  return minStatus || 'CONFIRMED';
};