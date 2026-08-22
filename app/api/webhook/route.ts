import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/polar";
import { recordSuccessfulPayment } from "@/lib/listings";

export async function POST(req: NextRequest) {
  const payload = await req.text();

  if (process.env.POLAR_WEBHOOK_SECRET) {
    const valid = await verifyWebhookSignature(payload, req.headers);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    // Handle Polar.sh checkout completed event
    if (event.type === "checkout.updated" && event.data?.status === "succeeded") {
      const listingId = event.data.metadata?.listing_id;
      const checkoutId = event.data.id;

      if (typeof listingId === "string" && typeof checkoutId === "string") {
        await recordSuccessfulPayment({ listingId, checkoutId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
