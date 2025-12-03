import { prisma } from "~~/server/utils/prisma";
import { getRouterParam, createError } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const flightId = getRouterParam(event, "flightId");

  if (!tripId || !flightId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing tripId or flightId",
    });
  }

  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
  });

  if (!flight || flight.tripId !== tripId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Flight not found for this trip",
    });
  }

  await prisma.flight.delete({
    where: { id: flightId },
  });

  return { success: true };
});
