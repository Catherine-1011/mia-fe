export type CheckoutOwnerProduct = {
  sellerId?: string | null;
  ownerType?: string | null;
  platformAccountId?: string | null;
};

export function getCheckoutOwnerKey(product?: CheckoutOwnerProduct | null): string | null {
  if (!product) return null;

  if (product.ownerType === "PLATFORM") {
    return product.platformAccountId ? `PLATFORM:${product.platformAccountId}` : null;
  }

  return product.sellerId ? `SELLER:${product.sellerId}` : null;
}

export function getCheckoutOwnerKeys(products: Array<CheckoutOwnerProduct | null | undefined>): string[] {
  return Array.from(new Set(products.map(getCheckoutOwnerKey).filter(Boolean) as string[]));
}

export type MultiSellerSetupFetch = (input: string, init: RequestInit) => Promise<Response>;

export async function postMultiSellerSetupWithRetry({
  endpoint,
  token,
  requestBody,
  fetchImpl = fetch,
  max202Polls = 5,
  retryDelayMs = 1200,
}: {
  endpoint: string;
  token: string;
  requestBody: unknown;
  fetchImpl?: MultiSellerSetupFetch;
  max202Polls?: number;
  retryDelayMs?: number;
}) {
  const body = JSON.stringify(requestBody);
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  };

  let response = await fetchImpl(endpoint, init);
  for (let attempt = 0; attempt < max202Polls && response.status === 202; attempt++) {
    await response.json().catch(() => ({}));
    if (retryDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
    response = await fetchImpl(endpoint, init);
  }

  return response;
}
