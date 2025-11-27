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

  const body = await readBody(event);
  const missing: string[] = [];
  if (!body.airline) missing.push("airline");
  if (!body.fromAirport) missing.push("fromAirport");
  if (!body.toAirport) missing.push("toAirport");
  if (!body.flightNumber) missing.push("flightNumber");
  if (!body.departureDate) missing.push("departureDate");
  if (!body.arrivalDate) missing.push("arrivalDate");
  if (body.stops == null) missing.push("stops");
  if (body.baseFare == null || body.baseFare === "") missing.push("baseFare");
  if (!body.currencyId) missing.push("currencyId");
  if (!body.travelClass) missing.push("travelClass");
  if (missing.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing fields: ${missing.join(", ")}`,
    });
  }

  const durationMin =
    body.departureDate && body.arrivalDate
      ? Math.max(
          0,
          Math.round(
            (+new Date(body.arrivalDate) - +new Date(body.departureDate)) /
              60000,
          ),
        )
      : null;

  const flight = await prisma.flight.create({
    data: {
      tripId,
      airline: body.airline,
      fromAirport: body.fromAirport,
      toAirport: body.toAirport,
      departureDate: body.departureDate ? new Date(body.departureDate) : null,
      arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
      flightNumber: body.flightNumber ?? null,
      travelClass: body.travelClass,
      baseFare: body.baseFare,
      currencyId: body.currencyId,
      totalCostEUR: body.totalCostEUR ?? 0,
      extras: body.extras ?? null,
      bookingUrl: body.bookingUrl ?? null,
      notes: body.notes ?? null,
      stops: body.stops ?? 0,
      durationMin,
      stopOverDurationMinutes: body.stopOverDurationMinutes ?? null,
      stopOverAirports: Array.isArray(body.stopOverAirports)
        ? JSON.stringify(body.stopOverAirports)
        : body.stopOverAirports || null,
    },
  });

  return flight;
});
