import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/polar";
import { activatePaidListing } from "@/lib/listings";

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

  try {
    const event = JSON.parse(payload);

    // Handle Polar.sh checkout completed event
    if (event.type === "checkout.updated" && event.data?.status === "succeeded") {
      const listingId = event.data.metadata?.listing_id;

      if (listingId) {
        await activatePaidListing(listingId);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
