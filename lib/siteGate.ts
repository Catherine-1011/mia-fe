const SITE_ACCESS_COOKIE = "site-access";
const SITE_ACCESS_TOKEN_PAYLOAD = "mia-site-access";
const SITE_REENTRY_PARAM = "reentry";
const PUBLIC_FILE = /\.(.*)$/;

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

export { SITE_ACCESS_COOKIE, SITE_REENTRY_PARAM };

export function isSitePasswordProtectionEnabled(): boolean {
  return process.env.SITE_PASSWORD_PROTECTION === "true";
}

export function isGateExcludedPath(pathname: string): boolean {
  return (
    pathname === "/gate" ||
    pathname === "/api/verify-password" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  );
}

export function isNewEntryExemptPath(pathname: string): boolean {
  return pathname === "/checkout";
}

export function isForcedGateReentry(searchParams: URLSearchParams): boolean {
  return searchParams.get(SITE_REENTRY_PARAM) === "1";
}

export function isTopLevelDocumentNavigation(headers: Headers): boolean {
  const fetchMode = headers.get("sec-fetch-mode");
  const fetchDest = headers.get("sec-fetch-dest");

  return fetchMode === "navigate" && (!fetchDest || fetchDest === "document");
}

export function isNewSiteEntry(headers: Headers): boolean {
  if (!isTopLevelDocumentNavigation(headers)) return false;

  const fetchSite = headers.get("sec-fetch-site");
  return fetchSite === "cross-site" || fetchSite === "none";
}

export function shouldForceSiteGateReentry(
  pathname: string,
  headers: Headers,
  hasValidAccess: boolean,
): boolean {
  return (
    hasValidAccess &&
    !isGateExcludedPath(pathname) &&
    !isNewEntryExemptPath(pathname) &&
    isNewSiteEntry(headers)
  );
}

export function shouldRequireSiteGate(pathname: string, hasValidAccess: boolean): boolean {
  return !isGateExcludedPath(pathname) && !hasValidAccess;
}

export function buildGateUrl(requestUrl: string, forcedReentry = false): URL {
  const gateUrl = new URL("/gate", requestUrl);

  if (forcedReentry) {
    gateUrl.searchParams.set(SITE_REENTRY_PARAM, "1");
  }

  return gateUrl;
}

export function siteAccessCookieOptions(value: string) {
  return {
    name: SITE_ACCESS_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export function clearSiteAccessCookieOptions() {
  return {
    ...siteAccessCookieOptions(""),
    maxAge: 0,
  };
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
