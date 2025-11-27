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
      stopOverDurationMinutes?: number | null;
      stopOverAirports?: any[] | null;
      segments?: any[] | null;
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
  if (body.stopOverDurationMinutes !== undefined)
    data.stopOverDurationMinutes = body.stopOverDurationMinutes;
  if (body.stopOverAirports !== undefined) {
    data.stopOverAirports = Array.isArray(body.stopOverAirports)
      ? JSON.stringify(body.stopOverAirports)
      : (body.stopOverAirports as any);
  }

  // If segments provided, derive dates/durations/stops/stopovers
  let derived: {
    departureDate: Date | null;
    arrivalDate: Date | null;
    durationMin: number | null;
    stops: number;
    stopOverDurationMinutes: number | null;
    stopOverAirports: string[] | null;
  } | null = null;
  const hasSegments = Array.isArray(body.segments) && body.segments.length > 0;
  if (hasSegments) {
    try {
      const segs = [...(body.segments as any[])];
      segs.sort((a, b) => +new Date(a.departureDate) - +new Date(b.departureDate));
      const flightMinutes = segs.reduce((sum, s) => {
        const d = +new Date(s.departureDate);
        const a = +new Date(s.arrivalDate);
        return sum + Math.max(0, Math.round((a - d) / 60000));
      }, 0);
      const stopMinutes = segs.length > 1
        ? segs.slice(0, -1).reduce((sum, _s, i) => {
            const arrive = +new Date(segs[i].arrivalDate);
            const nextDepart = +new Date(segs[i + 1].departureDate);
            return sum + Math.max(0, Math.round((nextDepart - arrive) / 60000));
          }, 0)
        : 0;
      const stopAirports = segs.length > 1 ? segs.slice(0, -1).map((s: any) => s.toAirport).filter(Boolean) : [];
      derived = {
        departureDate: segs[0]?.departureDate ? new Date(segs[0].departureDate) : null,
        arrivalDate: segs[segs.length - 1]?.arrivalDate ? new Date(segs[segs.length - 1].arrivalDate) : null,
        durationMin: flightMinutes,
        stops: Math.max(0, segs.length - 1),
        stopOverDurationMinutes: stopMinutes,
        stopOverAirports: stopAirports.length ? stopAirports : null,
      };
      data.segments = body.segments as any;
      data.stops = derived.stops;
      data.durationMin = derived.durationMin;
      data.departureDate = derived.departureDate;
      data.arrivalDate = derived.arrivalDate;
      data.stopOverDurationMinutes = derived.stopOverDurationMinutes;
      data.stopOverAirports = derived.stopOverAirports
        ? JSON.stringify(derived.stopOverAirports)
        : null;
    } catch {
      // ignore segment errors
    }
  }

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

  const updated = await prisma.flight.update({ where: { id: flightId }, data });
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
  } as any;
});
