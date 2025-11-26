import { prisma } from "~~/server/utils/prisma";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const flightId = getRouterParam(event, "flightId");

  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id in route",
    });
  }
  if (!flightId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing flight id in route",
    });
  }

  const body = await readBody<
    Partial<{
      airline: string;
      fromAirport: string;
      toAirport: string;
      departureDate: string | null;
      arrivalDate: string | null;
      flightNumber: string;
      stops?: number;
      travelClass: string;
      baseFare: number;
      extras?: string | null;
      currencyId: string;
      totalCostEUR: number;
      bookingUrl?: string | null;
      notes?: string | null;
    }>
  >(event);

  const existing = await prisma.flight.findUnique({
    where: { id: flightId },
    select: { id: true, tripId: true, departureDate: true, arrivalDate: true },
  });
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Flight not found" });
  }
  if (existing.tripId !== tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Flight does not belong to this trip",
    });
  }

  const data: any = {};

  if (body.airline !== undefined) data.airline = body.airline;
  if (body.flightNumber !== undefined) data.flightNumber = body.flightNumber;
  if (body.fromAirport !== undefined) data.fromAirport = body.fromAirport;
  if (body.toAirport !== undefined) data.toAirport = body.toAirport;
  if (body.travelClass !== undefined) data.travelClass = body.travelClass;
  if (body.stops !== undefined) data.stops = body.stops;
  if (body.baseFare !== undefined) data.baseFare = body.baseFare;
  if (body.extras !== undefined) data.extras = body.extras;
  if (body.currencyId !== undefined) data.currencyId = body.currencyId;
  if (body.totalCostEUR !== undefined) data.totalCostEUR = body.totalCostEUR;
  if (body.bookingUrl !== undefined) data.bookingUrl = body.bookingUrl;
  if (body.notes !== undefined) data.notes = body.notes;

  let nextDeparture: Date | null | undefined = undefined;
  let nextArrival: Date | null | undefined = undefined;

  if (body.departureDate !== undefined) {
    nextDeparture = body.departureDate ? new Date(body.departureDate) : null;
    data.departureDate = nextDeparture;
  }
  if (body.arrivalDate !== undefined) {
    nextArrival = body.arrivalDate ? new Date(body.arrivalDate) : null;
    data.arrivalDate = nextArrival;
  }

  if (body.departureDate !== undefined || body.arrivalDate !== undefined) {
    const depart =
      nextDeparture !== undefined ? nextDeparture : existing.departureDate;
    const arrive =
      nextArrival !== undefined ? nextArrival : existing.arrivalDate;

    if (depart && arrive) {
      const minutes = Math.max(0, Math.round((+arrive - +depart) / 60000));
      data.durationMin = minutes;
    } else {
      data.durationMin = null;
    }
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid currency.",
      });
    }
  }

  return prisma.flight.update({ where: { id: flightId }, data });
});
