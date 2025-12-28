import { prisma } from "~~/server/utils/prisma";
import { defineEventHandler, getRouterParam } from "h3";

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
        },
      },
      selectedAccommodation: {
        include: {
          currency: true,
        },
      },
    },
  });
});
