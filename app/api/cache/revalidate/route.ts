import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TAGS = new Set(["products", "blogs"]);

function hasValidSecret(request: NextRequest): boolean {
  const expected = process.env.CACHE_REVALIDATION_SECRET;
  const provided = request.headers.get("x-cache-revalidation-secret");
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function POST(request: NextRequest) {
  if (!hasValidSecret(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const tag =
    body && typeof body === "object" && "tag" in body
      ? (body as { tag?: unknown }).tag
      : undefined;

  if (typeof tag !== "string" || !ALLOWED_TAGS.has(tag)) {
    return NextResponse.json({ success: false, message: "Unsupported cache tag" }, { status: 400 });
  }

  revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ success: true, tag });
}
