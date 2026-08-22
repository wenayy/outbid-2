import { prisma } from "./db";

export async function activatePaidListing(listingId: string) {
  return prisma.$transaction(async (tx) => {
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
  });
}
