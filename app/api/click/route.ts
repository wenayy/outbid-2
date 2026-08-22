import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const WINDOW_MS = 60_000;
const MAX_CLICKS_PER_WINDOW = 10;
const clickBuckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  const { id } = await req.json().catch(() => ({ id: "" }));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (typeof id !== "string" || id.length > 128) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const key = `${clientIp(req)}:${id}`;
  if (isRateLimited(key)) {
    return NextResponse.json({ error: "Too many clicks" }, { status: 429 });
  }

  const updated = await prisma.listing.updateMany({
    where: { id, active: true },
    data: { clicks: { increment: 1 } },
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const bucket = clickBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    clickBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_CLICKS_PER_WINDOW;
}
