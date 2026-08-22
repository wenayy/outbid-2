import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const listings = await prisma.listing.findMany({
    where: { active: true },
    orderBy: [{ boost: "desc" }, { stars: "desc" }],
  });

  const stats = await prisma.siteStats.upsert({
    where: { id: "global" },
    update: { totalViews: { increment: 1 } },
    create: { id: "global", totalViews: 1 },
  });

  const totalStars = listings.reduce((sum, l) => sum + l.stars, 0);
  const totalBoosted = listings.reduce((sum, l) => sum + l.boost, 0);

  return NextResponse.json({
    listings,
    meta: {
      totalStars,
      totalBoosted,
      totalListings: listings.length,
      totalViews: stats.totalViews,
    },
  });
}
