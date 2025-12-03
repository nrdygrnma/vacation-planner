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

  const body = await readBody(event);

  // Ensure the flight exists
  const existing = await prisma.flight.findUnique({
    where: { id: flightId },
  });

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: "Flight not found",
    });
  }

  // Prepare safe update data
  const updateData: any = {
    airline: body.airline ?? existing.airline,
    flightNumber: body.flightNumber ?? existing.flightNumber,
    fromAirport: body.fromAirport ?? existing.fromAirport,
    toAirport: body.toAirport ?? existing.toAirport,
    departureDate: body.departureDate
      ? new Date(body.departureDate)
      : existing.departureDate,
    arrivalDate: body.arrivalDate
      ? new Date(body.arrivalDate)
      : existing.arrivalDate,
    travelClass: body.travelClass ?? existing.travelClass,
    stops: body.stops ?? existing.stops,
    baseFare: body.baseFare ?? existing.baseFare,
    notes: body.notes ?? existing.notes,
    totalCostEUR: body.totalCostEUR ?? existing.totalCostEUR,
    tripOptionId: body.tripOptionId ?? existing.tripOptionId,
  };

  // Normalize nested JSON-ish fields
  if (body.stopOverAirports !== undefined) {
    updateData.stopOverAirports = Array.isArray(body.stopOverAirports)
      ? JSON.stringify(body.stopOverAirports)
      : null;
  }
  if (body.segments !== undefined) {
    updateData.segments = Array.isArray(body.segments)
      ? JSON.stringify(body.segments)
      : null;
  }

  const updated = await prisma.flight.update({
    where: { id: flightId },
    data: updateData,
  });

  // Normalize JSON for response
  return {
    ...updated,
    stopOverAirports: (() => {
      try {
        return updated.stopOverAirports
          ? JSON.parse(updated.stopOverAirports as any)
          : null;
      } catch {
        return null;
      }
    })(),
    segments: (() => {
      try {
        return updated.segments ? JSON.parse(updated.segments as any) : null;
      } catch {
        return null;
      }
    })(),
  };
});
