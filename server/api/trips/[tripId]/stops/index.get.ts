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
    orderBy: [{ startDate: "asc" }, { type: "asc" }, { order: "asc" }],
    include: {
      accommodations: {
        include: {
          currency: true,
          images: true,
          roomType: true,
        },
      },
      selectedAccommodation: {
        include: {
          currency: true,
          images: true,
          roomType: true,
        },
      },
    },
  });
});
