import { prisma } from "~~/server/utils/prisma";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id in route",
    });
  }

  return prisma.flight.findMany({
    where: {
      tripId,
    },
    orderBy: [
      {
        departureDate: "asc",
      },
      { totalCostEUR: "asc" },
    ],
  });
});
