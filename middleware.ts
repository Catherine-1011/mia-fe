import { NextRequest, NextResponse } from "next/server";
import {
  SITE_ACCESS_COOKIE,
  buildGateUrl,
  clearSiteAccessCookieOptions,
  isForcedGateReentry,
  isSitePasswordProtectionEnabled,
  isValidSiteAccessToken,
  shouldForceSiteGateReentry,
  shouldRequireSiteGate,
} from "@/lib/siteGate";

function redirectToGate(request: NextRequest, clearCookie = false) {
  const response = NextResponse.redirect(buildGateUrl(request.url, clearCookie));

  if (clearCookie) {
    response.cookies.set(clearSiteAccessCookieOptions());
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const shouldProtectSite = isSitePasswordProtectionEnabled();

  if (!shouldProtectSite) {
    // Block direct access to /order-confirmation without a valid orderId
    if (pathname === "/order-confirmation" && !searchParams.get("orderId")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  const sitePassword = process.env.SITE_PASSWORD;
  const hasValidAccess = await isValidSiteAccessToken(
    request.cookies.get(SITE_ACCESS_COOKIE)?.value,
    sitePassword,
  );

  if (pathname === "/gate") {
    const isForcedReentry = isForcedGateReentry(searchParams);

    if (hasValidAccess && !isForcedReentry) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.next();

    if (hasValidAccess && isForcedReentry) {
      response.cookies.set(clearSiteAccessCookieOptions());
    }

    return response;
  }

  if (shouldForceSiteGateReentry(pathname, request.headers, hasValidAccess)) {
    return redirectToGate(request, true);
  }

  if (shouldRequireSiteGate(pathname, hasValidAccess)) {
    return redirectToGate(request);
  }

  // Block direct access to /order-confirmation without a valid orderId
  if (pathname === "/order-confirmation" && !searchParams.get("orderId")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
