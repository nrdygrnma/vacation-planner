import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");

  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Trip ID is required",
    });
  }

  return prisma.comparisonSnapshot.findMany({
    where: { tripId },
    orderBy: { createdAt: "desc" },
  });
});
