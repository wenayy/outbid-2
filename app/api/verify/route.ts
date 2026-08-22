import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordSuccessfulPayment } from "@/lib/listings";

const POLAR_API = process.env.POLAR_SERVER === "sandbox"
  ? "https://sandbox-api.polar.sh/v1"
  : "https://api.polar.sh/v1";

export async function POST(req: NextRequest) {
  const { listingId } = await req.json();

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Already active
  if (listing.active) {
    return NextResponse.json({ active: true });
  }

  // Try to verify via Polar API — search for checkouts with this listing ID
  const polarToken = process.env.POLAR_ACCESS_TOKEN;
  if (polarToken) {
    try {
      // List recent checkouts and find ours by metadata
      const res = await fetch(`${POLAR_API}/checkouts/?limit=20`, {
        headers: {
          Authorization: `Bearer ${polarToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const checkout = data.items?.find(
          (c: { metadata?: { listing_id?: string }; status: string }) =>
            c.metadata?.listing_id === listingId && c.status === "succeeded"
        );

        if (checkout && typeof checkout.id === "string") {
          const activated = await recordSuccessfulPayment({
            listingId,
            checkoutId: checkout.id,
          });
          return NextResponse.json({ active: Boolean(activated) });
        }
      }
    } catch (e) {
      console.error("Polar verify error:", e);
    }
  }

  return NextResponse.json({ active: false });
}
