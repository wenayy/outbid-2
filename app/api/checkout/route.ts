import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchRepo, fetchUser, parseGitHubInput } from "@/lib/github";
import { activatePaidListing } from "@/lib/listings";

const MIN_BOOST_CENTS = 50;
const MAX_BOOST_CENTS = 100_000_000;

type ListingInput = {
  type: "user" | "repo";
  github: string;
  name: string;
  avatar: string;
  stars: number;
  forks: number;
  followers: number;
  repos: number;
  language: string | null;
  bio: string | null;
  url: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const githubInput = typeof body?.github === "string" ? body.github : "";
  const boost = body?.boost;

  if (!githubInput || !Number.isInteger(boost) || boost < MIN_BOOST_CENTS || boost > MAX_BOOST_CENTS) {
    return NextResponse.json({ error: "Invalid data. Minimum bid is $0.50." }, { status: 400 });
  }

  const polarToken = process.env.POLAR_ACCESS_TOKEN;
  if (!polarToken && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Payment checkout is not configured." },
      { status: 503 }
    );
  }

  let listingData: ListingInput;
  try {
    listingData = await getListingInput(githubInput);
  } catch (e) {
    const message = e instanceof Error ? e.message : "GitHub profile or repository not found.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Use a transaction to prevent race conditions
  const result = await prisma.$transaction(async (tx) => {
    // No two listings can have the same bid amount
    const sameBid = await tx.listing.findFirst({
      where: { boost, active: true, NOT: { github: listingData.github } },
    });
    if (sameBid) {
      return { error: `Someone already bid ${formatCents(boost)}. Try ${formatCents(boost + 100)} instead.` };
    }

    // Check if this github profile/repo already has an active listing
    const existing = await tx.listing.findFirst({
      where: { github: listingData.github, active: true },
    });

    if (existing) {
      // Must bid higher than current
      if (boost <= existing.boost) {
        return { error: `You already have a listing at ${formatCents(existing.boost)}. Bid higher to move up.` };
      }
    }

    // Also check for inactive listings for the same github (pending checkout)
    const pending = await tx.listing.findFirst({
      where: { github: listingData.github, active: false },
    });

    const data = {
      ...listingData,
      boost,
      active: false,
    };

    if (pending) {
      // Update the pending listing instead of creating a duplicate
      const updated = await tx.listing.update({
        where: { id: pending.id },
        data,
      });
      return { listing: updated, isNew: false };
    }

    // Create new listing
    const created = await tx.listing.create({
      data,
    });
    return { listing: created, isNew: true };
  });

  // Transaction returned an error
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { listing, isNew } = result;

  // Try Polar.sh checkout
  if (polarToken) {
    try {
      const { createCheckout } = await import("@/lib/polar");
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkout = await createCheckout({
        amount: boost,
        listingId: listing.id,
        successUrl: `${appUrl}/success?id=${listing.id}`,
      });
      if (typeof checkout.id === "string") {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { checkoutId: checkout.id },
        });
      }
      return NextResponse.json({ checkoutUrl: checkout.url, listingId: listing.id });
    } catch (e) {
      console.error("Polar checkout failed:", e);
      return NextResponse.json(
        { error: "Payment checkout is temporarily unavailable." },
        { status: 502 }
      );
    }
  }

  // Local development only: auto-activate if no Polar token.
  if (isNew || !listing.active) {
    await activatePaidListing(listing.id);
  }

  return NextResponse.json({
    checkoutUrl: null,
    listingId: listing.id,
    dev: true,
  });
}

function formatCents(cents: number): string {
  if (cents >= 100) return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toFixed(2)}`;
}

async function getListingInput(input: string): Promise<ListingInput> {
  const parsed = parseGitHubInput(input);

  if (parsed.type === "repo" && parsed.repo) {
    const repo = await fetchRepo(parsed.owner, parsed.repo);
    return {
      type: "repo",
      github: repo.full_name,
      name: repo.name,
      avatar: repo.owner.avatar_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      followers: 0,
      repos: 0,
      language: repo.language,
      bio: repo.description || repo.readme,
      url: repo.html_url,
    };
  }

  const user = await fetchUser(parsed.owner);
  return {
    type: "user",
    github: user.login,
    name: user.name || user.login,
    avatar: user.avatar_url,
    stars: user.total_stars,
    forks: 0,
    followers: user.followers,
    repos: user.public_repos,
    language: null,
    bio: user.readme || user.bio,
    url: user.html_url,
  };
}
