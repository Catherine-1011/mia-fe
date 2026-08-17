import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const routeSource = fs.readFileSync(
  new URL("../app/api/verify-password/route.ts", import.meta.url),
  "utf8",
);
const middlewareSource = fs.readFileSync(
  new URL("../middleware.ts", import.meta.url),
  "utf8",
);
const siteGateSource = fs.readFileSync(
  new URL("../lib/siteGate.ts", import.meta.url),
  "utf8",
);
const layoutSource = fs.readFileSync(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);

test("successful verification sets the site access cookie", () => {
  assert.match(routeSource, /response\.cookies\.set\(siteAccessCookieOptions/);
  assert.match(routeSource, /siteAccessCookieOptions\(await createSiteAccessToken\(expectedPassword\)\)/);
});

test("site access cookie remains a browser-session cookie", () => {
  const cookieOptions =
    siteGateSource.match(/export function siteAccessCookieOptions[\s\S]*?\n}/)?.[0] ?? "";

  assert.ok(cookieOptions, "cookie options should be present");
  assert.doesNotMatch(cookieOptions, /\bmaxAge\s*:/);
  assert.doesNotMatch(cookieOptions, /\bexpires\s*:/);
  assert.match(cookieOptions, /httpOnly:\s*true/);
  assert.match(cookieOptions, /secure:\s*process\.env\.NODE_ENV === "production"/);
  assert.match(cookieOptions, /sameSite:\s*"lax"/);
  assert.match(cookieOptions, /path:\s*"\/"/);
});

test("valid access cookie allows protected routes when protection is enabled", () => {
  assert.match(middlewareSource, /const hasValidAccess = await isValidSiteAccessToken/);
  assert.match(siteGateSource, /!isGateExcludedPath\(pathname\) && !hasValidAccess/);
  assert.match(middlewareSource, /return redirectToGate\(request\);/);
});

test("missing or invalid access redirects to the gate when protection is enabled", () => {
  assert.match(middlewareSource, /const shouldProtectSite = isSitePasswordProtectionEnabled\(\);/);
  assert.match(siteGateSource, /!hasValidAccess/);
});

test("protection is bypassed when the feature flag is disabled", () => {
  assert.match(siteGateSource, /process\.env\.SITE_PASSWORD_PROTECTION === "true"/);
  assert.match(middlewareSource, /if \(!shouldProtectSite\) \{/);
  assert.match(middlewareSource, /return NextResponse\.next\(\);[\s\S]*const sitePassword = process\.env\.SITE_PASSWORD;/);
  assert.match(routeSource, /if \(!isSitePasswordProtectionEnabled\(\)\) \{/);
});

test("site access token no longer embeds a persistent time limit", () => {
  assert.doesNotMatch(siteGateSource, /ACCESS_TOKEN_TTL_SECONDS/);
  assert.doesNotMatch(siteGateSource, /Date\.now\(\)/);
  assert.doesNotMatch(siteGateSource, /expiresAt/);
});

test("new site entry is detected only for cross-site or direct top-level document navigations", () => {
  assert.match(siteGateSource, /fetchMode === "navigate"/);
  assert.match(siteGateSource, /!fetchDest \|\| fetchDest === "document"/);
  assert.match(siteGateSource, /fetchSite === "cross-site" \|\| fetchSite === "none"/);
  assert.doesNotMatch(siteGateSource, /fetchSite === "same-origin"/);
});

test("valid old cookie is not accepted for a new site entry", () => {
  assert.match(siteGateSource, /hasValidAccess[\s\S]*isNewSiteEntry\(headers\)/);
  assert.match(middlewareSource, /shouldForceSiteGateReentry\(pathname, request\.headers, hasValidAccess\)/);
  assert.match(middlewareSource, /return redirectToGate\(request, true\);/);
});

test("new entry redirect clears the existing site access cookie", () => {
  assert.match(middlewareSource, /clearSiteAccessCookieOptions\(\)/);
  assert.match(siteGateSource, /siteAccessCookieOptions\(""\)/);
  assert.match(siteGateSource, /maxAge:\s*0/);
  assert.match(siteGateSource, /httpOnly:\s*true/);
  assert.match(siteGateSource, /sameSite:\s*"lax"/);
  assert.match(siteGateSource, /path:\s*"\/"/);
});

test("same-origin browsing and refresh can continue with a valid cookie", () => {
  assert.match(siteGateSource, /return fetchSite === "cross-site" \|\| fetchSite === "none";/);
  assert.match(siteGateSource, /hasValidAccess &&[\s\S]*isNewSiteEntry\(headers\)/);
});

test("gate route and verify-password API remain excluded from gate redirects", () => {
  assert.match(middlewareSource, /pathname === "\/gate"/);
  assert.match(siteGateSource, /pathname === "\/api\/verify-password"/);
});

test("static and framework assets remain reachable", () => {
  assert.match(siteGateSource, /pathname\.startsWith\("\/_next\/"\)/);
  assert.match(siteGateSource, /pathname === "\/favicon\.ico"/);
  assert.match(siteGateSource, /PUBLIC_FILE\.test\(pathname\)/);
});

test("successful verification can navigate into the site without immediate reentry", () => {
  assert.match(routeSource, /response\.cookies\.set\(siteAccessCookieOptions/);
  assert.match(siteGateSource, /fetchSite === "cross-site" \|\| fetchSite === "none"/);
  assert.doesNotMatch(middlewareSource, /fetchSite === "same-origin"/);
});

test("checkout route is narrowly exempt from new-entry reauth for payment returns", () => {
  assert.match(siteGateSource, /function isNewEntryExemptPath\(pathname: string\)/);
  assert.match(siteGateSource, /return pathname === "\/checkout";/);
});

test("existing order-confirmation guard is preserved", () => {
  assert.match(middlewareSource, /pathname === "\/order-confirmation" && !searchParams\.get\("orderId"\)/);
  assert.match(middlewareSource, /NextResponse\.redirect\(new URL\("\/", request\.url\)\)/);
});

test("forced reentry gate route avoids redirect loop and clears a still-valid cookie", () => {
  assert.match(siteGateSource, /searchParams\.get\(SITE_REENTRY_PARAM\) === "1";/);
  assert.match(middlewareSource, /hasValidAccess && !isForcedReentry/);
  assert.match(middlewareSource, /hasValidAccess && isForcedReentry/);
});

test("temporary BFCache guard is not mounted globally", () => {
  assert.doesNotMatch(layoutSource, /SiteReentryGuard/);
  assert.doesNotMatch(middlewareSource, /pageshow|pagehide|event\.persisted/);
});

test("site gate routing rules are isolated in lib/siteGate", () => {
  assert.match(siteGateSource, /export function isGateExcludedPath/);
  assert.match(siteGateSource, /export function shouldRequireSiteGate/);
  assert.match(siteGateSource, /export function shouldForceSiteGateReentry/);
  assert.doesNotMatch(middlewareSource, /function isGateExcludedPath/);
  assert.doesNotMatch(middlewareSource, /function isNewEntryExemptPath/);
});
