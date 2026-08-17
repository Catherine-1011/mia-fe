const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const SITE_ACCESS_COOKIE = "site-access";

const encoder = new TextEncoder();

function base64UrlEncode(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(signature);
}

export { ACCESS_TOKEN_TTL_SECONDS, SITE_ACCESS_COOKIE };

export async function createSiteAccessToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await signValue(payload, secret);
  return `${payload}.${signature}`;
}

export async function isValidSiteAccessToken(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;

  const [expiresAt, signature, extra] = token.split(".");
  if (!expiresAt || !signature || extra) return false;

  const expiryMs = Number(expiresAt);
  if (!Number.isFinite(expiryMs) || expiryMs <= Date.now()) return false;

  const expectedSignature = await signValue(expiresAt, secret);
  return signature === expectedSignature;
}
