import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

async function activateListing(tx: Prisma.TransactionClient, listingId: string) {
  const listing = await tx.listing.findUnique({ where: { id: listingId } });
  if (!listing) return null;

  await tx.listing.updateMany({
    where: {
      github: listing.github,
      active: true,
      NOT: { id: listing.id },
    },
    data: { active: false },
  });

  return tx.listing.update({
    where: { id: listing.id },
    data: { active: true },
  });
}

export async function activatePaidListing(listingId: string) {
  return prisma.$transaction((tx) => activateListing(tx, listingId));
}

export async function recordSuccessfulPayment({
  listingId,
  checkoutId,
}: {
  listingId: string;
  checkoutId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.checkoutId !== checkoutId) return null;

    const recorded = await tx.payment.findUnique({ where: { checkoutId } });
    if (recorded) return listing;

    await tx.payment.create({
      data: {
        checkoutId,
        listingId,
        amount: listing.boost,
      },
    });

    return activateListing(tx, listingId);
  });
}
