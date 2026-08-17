import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  SITE_ACCESS_COOKIE,
  createSiteAccessToken,
  isSitePasswordProtectionEnabled,
} from "@/lib/siteGate";

function matchesPassword(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export async function POST(request: NextRequest) {
  if (!isSitePasswordProtectionEnabled()) {
    return NextResponse.json({ success: true });
  }

  const expectedPassword = process.env.SITE_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { success: false, message: "Access is not available right now." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid password." },
      { status: 400 },
    );
  }

  const password =
    body && typeof body === "object" && "password" in body
      ? (body as { password?: unknown }).password
      : undefined;

  if (typeof password !== "string" || !matchesPassword(password, expectedPassword)) {
    return NextResponse.json(
      { success: false, message: "Invalid password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SITE_ACCESS_COOKIE,
    value: await createSiteAccessToken(expectedPassword),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
