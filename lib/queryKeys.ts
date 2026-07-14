export const productQueryKeys = {
  products: ["products"] as const,
  allProducts: ["products", "all"] as const,
};

export const singleProductQueryKeys = {
  all: ["product"] as const,
  detail: (id: string) => ["product", id] as const,
};

export const couponQueryKeys = {
  coupons: ["coupons"] as const,
};
