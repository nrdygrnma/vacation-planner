import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id",
    });
  }

  return prisma.tripStop.findMany({
    where: { tripId },
    orderBy: { startDate: "asc" },
    include: {
      accommodations: {
        include: {
          currency: true,
          images: true,
        },
      },
      selectedAccommodation: {
        include: {
          currency: true,
          images: true,
        },
      },
    },
  });
});
