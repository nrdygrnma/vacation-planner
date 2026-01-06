import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const snapshotId = getRouterParam(event, "snapshotId");

  return prisma.comparisonSnapshot.delete({
    where: { id: snapshotId },
  });
});
