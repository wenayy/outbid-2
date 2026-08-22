import { createHmac, timingSafeEqual } from "node:crypto";

const POLAR_API = process.env.POLAR_SERVER === "sandbox"
  ? "https://sandbox-api.polar.sh/v1"
  : "https://api.polar.sh/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

// Cache the product price ID so we only create once
let cachedPriceId: string | null = null;

/**
 * Find or create a "GitFlex Listing" product with custom pricing.
 * Returns the price ID to use for checkouts.
 */
async function getOrCreateProductPriceId(): Promise<string> {
  if (cachedPriceId) return cachedPriceId;

  // Search for existing product (don't send org_id — token is org-scoped)
  const searchRes = await fetch(
    `${POLAR_API}/products/`,
    { headers: headers() }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    const existing = data.items?.find(
      (p: { name: string; is_archived: boolean }) => p.name === "GitFlex Listing" && !p.is_archived
    );
    if (existing?.prices?.[0]?.id) {
      cachedPriceId = existing.prices[0].id as string;
      return cachedPriceId;
    }
  }

  // Create the product with a custom price (pay-what-you-want)
  const createRes = await fetch(`${POLAR_API}/products/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: "GitFlex Listing",
      description: "Claim your spot on the GitFlex developer leaderboard.",
      prices: [
        {
          type: "one_time",
          price_currency: "usd",
          price_amount: 50,
          amount_type: "custom",
          minimum_amount: 50,
          preset_amount: 100,
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Polar product: ${err}`);
  }

  const product = await createRes.json();
  cachedPriceId = product.prices[0].id;
  return cachedPriceId!;
}

export async function createCheckout({
  amount,
  listingId,
  successUrl,
}: {
  amount: number; // in cents
  listingId: string;
  successUrl: string;
}) {
  const priceId = await getOrCreateProductPriceId();

  const res = await fetch(`${POLAR_API}/checkouts/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      product_price_id: priceId,
      amount,
      success_url: successUrl,
      metadata: {
        listing_id: listingId,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Polar checkout failed: ${err}`);
  }

  return res.json();
}

export async function verifyWebhookSignature(
  payload: string,
  reqHeaders: Headers
): Promise<boolean> {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = reqHeaders.get("webhook-signature") || reqHeaders.get("x-polar-signature") || "";
  const webhookId = reqHeaders.get("webhook-id");
  const timestamp = reqHeaders.get("webhook-timestamp");

  if (webhookId && timestamp) {
    const ts = Number(timestamp);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isInteger(ts) || Math.abs(now - ts) > 300) return false;

    const signedPayload = `${webhookId}.${timestamp}.${payload}`;
    return verifyAnySignature(signedPayload, signature, signingKeys(secret), "base64");
  }

  return verifyAnySignature(payload, signature, [Buffer.from(secret, "utf8")], "hex");
}

function signingKeys(secret: string) {
  const keys = [Buffer.from(secret, "utf8")];

  if (secret.startsWith("whsec_")) {
    keys.push(Buffer.from(secret.slice("whsec_".length), "base64"));
  }

  return keys;
}

function verifyAnySignature(
  payload: string,
  signatureHeader: string,
  keys: Buffer[],
  encoding: "base64" | "hex"
) {
  const signatures = signatureHeader
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.includes(",") ? part.split(",")[1] : part);

  for (const key of keys) {
    const computed = createHmac("sha256", key).update(payload).digest();
    for (const signature of signatures) {
      let received: Buffer;
      try {
        received = Buffer.from(signature, encoding);
      } catch {
        continue;
      }
      if (received.length === computed.length && timingSafeEqual(received, computed)) {
        return true;
      }
    }
  }

  return false;
}
