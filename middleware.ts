import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Block direct access to /order-confirmation without a valid orderId
  if (pathname === "/order-confirmation" && !searchParams.get("orderId")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/order-confirmation"],
};
