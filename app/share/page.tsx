import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ShareCard } from "@/components/share-card";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({ searchParams }: Props) {
  await connection();
  const { id } = await searchParams;
  if (!id) return { title: "GitFlex" };

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return { title: "GitFlex" };

  const rank = await prisma.listing.count({
    where: { active: true, boost: { gt: listing.boost } },
  }) + 1;

  const ogUrl = new URL("/api/og", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  ogUrl.searchParams.set("name", listing.name);
  ogUrl.searchParams.set("rank", rank.toString());
  ogUrl.searchParams.set("stars", listing.stars.toString());
  ogUrl.searchParams.set("avatar", listing.avatar);
  ogUrl.searchParams.set("language", listing.language || "");
  ogUrl.searchParams.set("followers", listing.followers.toString());
  ogUrl.searchParams.set("bid", listing.boost.toString());
  ogUrl.searchParams.set("type", listing.type);

  return {
    title: `${listing.name} is #${rank} on GitFlex`,
    description: `${listing.name} is ranked #${rank} on the GitFlex leaderboard with ${listing.stars.toLocaleString()} stars.`,
    openGraph: {
      title: `${listing.name} is #${rank} on GitFlex`,
      description: `Ranked #${rank} with ${listing.stars.toLocaleString()} stars. Can you outrank them?`,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.name} is #${rank} on GitFlex`,
      description: `Ranked #${rank} with ${listing.stars.toLocaleString()} stars.`,
      images: [ogUrl.toString()],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  await connection();
  const { id } = await searchParams;
  if (!id) redirect("/");

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || !listing.active) redirect("/");

  const rank = await prisma.listing.count({
    where: { active: true, boost: { gt: listing.boost } },
  }) + 1;

  return <ShareCard listing={{ ...listing, createdAt: listing.createdAt.toISOString(), updatedAt: listing.updatedAt.toISOString() }} rank={rank} />;
}
