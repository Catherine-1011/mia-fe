const SITE_ACCESS_COOKIE = "site-access";
const SITE_ACCESS_TOKEN_PAYLOAD = "mia-site-access";

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

export { SITE_ACCESS_COOKIE };

export function isSitePasswordProtectionEnabled(): boolean {
  return process.env.SITE_PASSWORD_PROTECTION === "true";
}

export async function createSiteAccessToken(secret: string): Promise<string> {
  const payload = SITE_ACCESS_TOKEN_PAYLOAD;
  const signature = await signValue(payload, secret);
  return `${payload}.${signature}`;
}

export async function isValidSiteAccessToken(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;

  const [payload, signature, extra] = token.split(".");
  if (payload !== SITE_ACCESS_TOKEN_PAYLOAD || !signature || extra) return false;

  const expectedSignature = await signValue(payload, secret);
  return signature === expectedSignature;
}
