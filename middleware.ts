import { NextRequest, NextResponse } from "next/server";
import {
  SITE_ACCESS_COOKIE,
  isSitePasswordProtectionEnabled,
  isValidSiteAccessToken,
} from "@/lib/siteGate";

const PUBLIC_FILE = /\.(.*)$/;

function isGateExcludedPath(pathname: string) {
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

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sitePassword = process.env.SITE_PASSWORD;
  const shouldProtectSite = isSitePasswordProtectionEnabled();
  const hasValidAccess = shouldProtectSite
    ? await isValidSiteAccessToken(
        request.cookies.get(SITE_ACCESS_COOKIE)?.value,
        sitePassword,
      )
    : true;

  if (shouldProtectSite && pathname === "/gate") {
    if (hasValidAccess) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (shouldProtectSite && !isGateExcludedPath(pathname) && !hasValidAccess) {
    return NextResponse.redirect(new URL("/gate", request.url));
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
