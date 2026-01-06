import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id",
    });
  }

  const body = await readBody<{ flightId: string | null }>(event);
  if (body.flightId === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing flight id",
    });
  }

  // Verify trip exists
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });
  if (!trip) {
    throw createError({
      statusCode: 404,
      statusMessage: "Trip not found",
    });
  }

  if (body.flightId !== null) {
    // Verify flight exists and belongs to this trip
    const flight = await prisma.flight.findUnique({
      where: { id: body.flightId },
    });
    if (!flight || flight.tripId !== tripId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Flight not found or does not belong to this trip",
      });
    }
  }

  try {
    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        selectedFlightId: body.flightId,
      },
      include: {
        selectedFlight: {
          include: {
            currency: true,
          },
        },
      },
    });
    return updated;
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update trip selection",
    });
  }
});
