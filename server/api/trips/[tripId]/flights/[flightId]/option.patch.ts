import { prisma } from "~~/server/utils/prisma";
import { createError, getRouterParam, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const flightId = getRouterParam(event, "flightId");
  if (!flightId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing flight id in route",
    });
  }

  const body = await readBody<{ tripOptionId?: string | null }>(event);

  const flightExists = await prisma.flight.findUnique({
    where: { id: flightId },
    select: { id: true },
  });

  if (!flightExists) {
    throw createError({
      statusCode: 404,
      statusMessage: "Flight not found",
    });
  }

  const updated = await prisma.flight.update({
    where: { id: flightId },
    data: {
      tripOptionId: body.tripOptionId ?? null,
    },
  });

  // Normalize fields that are stored as strings
  return {
    ...updated,
    stopOverAirports: (() => {
      try {
        return (updated as any).stopOverAirports
          ? JSON.parse((updated as any).stopOverAirports as any)
          : null;
      } catch {
        return null;
      }
    })(),
    segments: (() => {
      try {
        return (updated as any).segments
          ? JSON.parse((updated as any).segments as any)
          : null;
      } catch {
        return null;
      }
    })(),
  } as any;
});
