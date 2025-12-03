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
  // Dates may be derived from segments if provided
  const hasSegments = Array.isArray(body.segments) && body.segments.length > 0;
  if (!hasSegments && !body.departureDate) missing.push("departureDate");
  if (!hasSegments && !body.arrivalDate) missing.push("arrivalDate");
  if (body.stops == null) missing.push("stops");
  if (body.baseFare == null || body.baseFare === "") missing.push("baseFare");
  if (!body.currencyId) missing.push("currencyId");
  if (!body.travelClass) missing.push("travelClass");
  // ⚠️ note: tripOptionId is optional, so no validation needed
  if (missing.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing fields: ${missing.join(", ")}`,
    });
  }

  // If segments are provided, compute derived data (overall dates, durations, stops, stopovers)
  let derived: {
    departureDate: Date | null;
    arrivalDate: Date | null;
    durationMin: number | null;
    stops: number;
    stopOverDurationMinutes: number | null;
    stopOverAirports: string[] | null;
  } | null = null;

  if (hasSegments) {
    try {
      const segs = [...body.segments];
      segs.sort(
        (a: any, b: any) =>
          +new Date(a.departureDate) - +new Date(b.departureDate),
      );
      const flightMinutes = segs.reduce((sum: number, s: any) => {
        const d = +new Date(s.departureDate);
        const a = +new Date(s.arrivalDate);
        return sum + Math.max(0, Math.round((a - d) / 60000));
      }, 0);
      const stopMinutes =
        segs.length > 1
          ? segs.slice(0, -1).reduce((sum: number, s: any, i: number) => {
              const arrive = +new Date(segs[i].arrivalDate);
              const nextDepart = +new Date(segs[i + 1].departureDate);
              return (
                sum + Math.max(0, Math.round((nextDepart - arrive) / 60000))
              );
            }, 0)
          : 0;
      const stopAirports =
        segs.length > 1
          ? segs
              .slice(0, -1)
              .map((s: any) => s.toAirport)
              .filter(Boolean)
          : [];
      derived = {
        departureDate: segs[0]?.departureDate
          ? new Date(segs[0].departureDate)
          : null,
        arrivalDate: segs[segs.length - 1]?.arrivalDate
          ? new Date(segs[segs.length - 1].arrivalDate)
          : null,
        durationMin: flightMinutes,
        stops: Math.max(0, segs.length - 1),
        stopOverDurationMinutes: stopMinutes,
        stopOverAirports: stopAirports.length ? stopAirports : null,
      };
    } catch {
      // If segments parsing fails, ignore and fall back to body dates
    }
  }

  const durationMin = derived
    ? derived.durationMin
    : body.departureDate && body.arrivalDate
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
      departureDate: derived
        ? derived.departureDate
        : body.departureDate
          ? new Date(body.departureDate)
          : null,
      arrivalDate: derived
        ? derived.arrivalDate
        : body.arrivalDate
          ? new Date(body.arrivalDate)
          : null,
      flightNumber: body.flightNumber ?? null,
      travelClass: body.travelClass,
      baseFare: body.baseFare,
      currencyId: body.currencyId,
      totalCostEUR: body.totalCostEUR ?? 0,
      extras: body.extras ?? null,
      bookingUrl: body.bookingUrl ?? null,
      notes: body.notes ?? null,
      stops: derived ? derived.stops : (body.stops ?? 0),
      durationMin,
      stopOverDurationMinutes: derived
        ? derived.stopOverDurationMinutes
        : (body.stopOverDurationMinutes ?? null),
      stopOverAirports: Array.isArray(
        derived?.stopOverAirports ?? body.stopOverAirports,
      )
        ? JSON.stringify(
            (derived?.stopOverAirports ?? body.stopOverAirports) as any,
          )
        : (derived?.stopOverAirports ?? body.stopOverAirports) || null,
      segments: hasSegments ? JSON.stringify(body.segments) : null,

      // 🆕 NEW: bind flight to a trip option if provided
      tripOptionId: body.tripOptionId ?? null,
    },
  });

  // Normalize response to client expectations
  return {
    ...flight,
    stopOverAirports: (() => {
      try {
        return (flight as any).stopOverAirports
          ? JSON.parse((flight as any).stopOverAirports as any)
          : null;
      } catch {
        return null;
      }
    })(),
    segments: (() => {
      try {
        return (flight as any).segments
          ? JSON.parse((flight as any).segments as any)
          : null;
      } catch {
        return null;
      }
    })(),
  } as any;
});
