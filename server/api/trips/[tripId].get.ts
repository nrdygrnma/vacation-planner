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
      selectedFlight: true,
      selectedCarRental: true,
      flights: {
        orderBy: [{ departureDate: "asc" }, { totalCostEUR: "asc" }],
      },
      carRentals: true,
      tripStops: {
        orderBy: { startDate: "asc" },
        include: { accommodations: true },
      },
    },
  });

  if (!trip) {
    throw createError({ statusCode: 404, statusMessage: "Trip not found" });
  }

  return trip;
});
