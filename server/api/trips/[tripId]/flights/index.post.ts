import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id in route",
    });
  }

  const body = await readBody(event);

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
      flightNumber: body.flightNumber ?? null,
      fromAirport: body.fromAirport,
      toAirport: body.toAirport,
      departureDate: body.departureDate ? new Date(body.departureDate) : null,
      arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
      travelClass: body.travelClass,
      baseFare: body.baseFare,
      currencyId: body.currencyId,
      totalCostEUR: body.totalCostEUR ?? 0,
      extras: body.extras ?? null,
      bookingUrl: body.bookingUrl ?? null,
      notes: body.notes ?? null,
      stops: body.stops ?? 0,
      durationMin,
    },
  });

  return flight;
});
