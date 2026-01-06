import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const flightId = getRouterParam(event, "flightId");

  if (!tripId || !flightId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id or flight id",
    });
  }

  // Verify flight exists and belongs to this trip
  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
  });

  if (!flight || flight.tripId !== tripId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Flight not found",
    });
  }

  try {
    // If this flight is the selected flight for the trip, unset it first
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (trip?.selectedFlightId === flightId) {
      await prisma.trip.update({
        where: { id: tripId },
        data: { selectedFlightId: null },
      });
    }

    await prisma.flight.delete({
      where: { id: flightId },
    });

    return { message: "Flight deleted successfully" };
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete flight",
    });
  }
});
