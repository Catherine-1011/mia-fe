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

test("successful verification sets the site access cookie", () => {
  assert.match(routeSource, /response\.cookies\.set\(\{/);
  assert.match(routeSource, /name:\s*SITE_ACCESS_COOKIE/);
  assert.match(routeSource, /value:\s*await createSiteAccessToken\(expectedPassword\)/);
});

test("site access cookie remains a browser-session cookie", () => {
  const cookieOptions = routeSource.match(/response\.cookies\.set\(\{[\s\S]*?\n\s*\}\);/)?.[0] ?? "";

  assert.ok(cookieOptions, "cookie options should be present");
  assert.doesNotMatch(cookieOptions, /\bmaxAge\s*:/);
  assert.doesNotMatch(cookieOptions, /\bexpires\s*:/);
  assert.match(cookieOptions, /httpOnly:\s*true/);
  assert.match(cookieOptions, /secure:\s*process\.env\.NODE_ENV === "production"/);
  assert.match(cookieOptions, /sameSite:\s*"lax"/);
  assert.match(cookieOptions, /path:\s*"\/"/);
});

test("valid access cookie allows protected routes when protection is enabled", () => {
  assert.match(middlewareSource, /const hasValidAccess = shouldProtectSite[\s\S]*await isValidSiteAccessToken/);
  assert.match(middlewareSource, /!isGateExcludedPath\(pathname\) && !hasValidAccess/);
  assert.match(middlewareSource, /NextResponse\.redirect\(new URL\("\/gate", request\.url\)\)/);
});

test("missing or invalid access redirects to the gate when protection is enabled", () => {
  assert.match(middlewareSource, /const shouldProtectSite = isSitePasswordProtectionEnabled\(\);/);
  assert.match(middlewareSource, /!hasValidAccess/);
});

test("protection is bypassed when the feature flag is disabled", () => {
  assert.match(siteGateSource, /process\.env\.SITE_PASSWORD_PROTECTION === "true"/);
  assert.match(middlewareSource, /const hasValidAccess = shouldProtectSite[\s\S]*:\s*true;/);
  assert.match(middlewareSource, /shouldProtectSite && !isGateExcludedPath\(pathname\) && !hasValidAccess/);
  assert.match(routeSource, /if \(!isSitePasswordProtectionEnabled\(\)\) \{/);
});

test("site access token no longer embeds a persistent time limit", () => {
  assert.doesNotMatch(siteGateSource, /ACCESS_TOKEN_TTL_SECONDS/);
  assert.doesNotMatch(siteGateSource, /Date\.now\(\)/);
  assert.doesNotMatch(siteGateSource, /expiresAt/);
});
