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

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      currency: true,
      flights: true,
      carRentals: true,
      tripStops: {
        orderBy: { startDate: "asc" },
        include: { accommodations: true },
      },
        tripOptions: {
          orderBy: { createdAt: "asc" },
        }
    },
  });

  if (!trip) {
    throw createError({ statusCode: 404, statusMessage: "Trip not found" });
  }

  return trip;
});
