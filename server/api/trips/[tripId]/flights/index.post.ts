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
  if (missing.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing fields: ${missing.join(", ")}`,
    });
  }

  // If segments are provided, compute derived data
  let outboundInfo: any = null;
  let returnInfo: any = null;

  if (hasSegments) {
    const calcLeg = (segs: any[]) => {
      if (segs.length === 0) return null;
      segs.sort(
        (a: any, b: any) =>
          +new Date(a.departureDate) - +new Date(b.departureDate),
      );

      const parseInTz = (dateStr: string, tz?: string) => {
        if (!tz || tz === "UTC") return new Date(dateStr);
        // We want to treat the "YYYY-MM-DDTHH:mm:ssZ" from the frontend
        // (which was constructed as `${date}T${time}Z`)
        // as being in the local timezone `tz`.
        const localStr = dateStr.replace("Z", "");
        // This gives "YYYY-MM-DDTHH:mm:ss"
        // We use Intl to find the offset or just use a trick with Date string
        // Actually, the easiest way in Node without heavy libs is to use the date string
        // and let the constructor handle it if we append the offset,
        // but finding the offset for a specific date in a specific TZ is non-trivial.
        // However, we can use Intl.DateTimeFormat to get the parts and calculate the diff.

        const date = new Date(localStr + "Z"); // UTC date as if it were local
        const utcDate = new Date(
          date.toLocaleString("en-US", { timeZone: "UTC" }),
        );
        const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
        const offset = utcDate.getTime() - tzDate.getTime();

        return new Date(date.getTime() + offset);
      };

      const firstDep = parseInTz(
        segs[0].departureDate,
        segs[0].fromAirportTimezone,
      );
      const lastArr = parseInTz(
        segs[segs.length - 1].arrivalDate,
        segs[segs.length - 1].toAirportTimezone,
      );

      const totalGross = Math.max(
        0,
        Math.round((lastArr.getTime() - firstDep.getTime()) / 60000),
      );
      const netFlight = segs.reduce((sum: number, s: any) => {
        const d = parseInTz(s.departureDate, s.fromAirportTimezone).getTime();
        const a = parseInTz(s.arrivalDate, s.toAirportTimezone).getTime();
        return sum + Math.max(0, Math.round((a - d) / 60000));
      }, 0);
      const stopover = Math.max(0, totalGross - netFlight);
      const stopAirports = segs
        .slice(0, -1)
        .map((s: any) => s.toAirport)
        .filter(Boolean);

      return {
        firstDep,
        lastArr,
        totalGross,
        netFlight,
        stopover,
        stopAirports,
        stops: segs.length - 1,
      };
    };

    try {
      outboundInfo = calcLeg(body.segments.filter((s: any) => !s.isReturn));
      returnInfo = calcLeg(body.segments.filter((s: any) => s.isReturn));
    } catch (e) {
      console.error("Segment calculation failed", e);
    }
  }

  const flight = await prisma.flight.create({
    data: {
      tripId,
      airline: body.airline,
      fromAirport: body.fromAirport,
      toAirport: body.toAirport,
      departureDate: outboundInfo
        ? outboundInfo.firstDep
        : body.departureDate
          ? new Date(body.departureDate)
          : null,
      arrivalDate: outboundInfo
        ? outboundInfo.lastArr
        : body.arrivalDate
          ? new Date(body.arrivalDate)
          : null,
      isRoundTrip: !!body.isRoundTrip || !!returnInfo,
      returnDepartureDate: returnInfo
        ? returnInfo.firstDep
        : body.returnDepartureDate
          ? new Date(body.returnDepartureDate)
          : null,
      returnArrivalDate: returnInfo
        ? returnInfo.lastArr
        : body.returnArrivalDate
          ? new Date(body.returnArrivalDate)
          : null,
      flightNumber: body.flightNumber ?? null,
      travelClass: body.travelClass,
      baseFare: body.baseFare,
      currencyId: body.currencyId,
      totalCostEUR: body.totalCostEUR ?? 0,
      extras: body.extras ?? null,
      bookingUrl: body.bookingUrl ?? null,
      notes: body.notes ?? null,
      stops: outboundInfo ? outboundInfo.stops : (body.stops ?? 0),
      durationMin: outboundInfo ? outboundInfo.totalGross : null,
      outboundDurationMin: outboundInfo ? outboundInfo.totalGross : null,
      outboundNetDurationMin: outboundInfo ? outboundInfo.netFlight : null,
      outboundStopoverMin: outboundInfo ? outboundInfo.stopover : null,
      returnDurationMin: returnInfo ? returnInfo.totalGross : null,
      returnNetDurationMin: returnInfo ? returnInfo.netFlight : null,
      returnStopoverMin: returnInfo ? returnInfo.stopover : null,
      stopOverDurationMinutes:
        (outboundInfo?.stopover ?? 0) + (returnInfo?.stopover ?? 0) || null,
      stopOverAirports: JSON.stringify([
        ...(outboundInfo?.stopAirports ?? []),
        ...(returnInfo?.stopAirports ?? []),
      ]),
      segments: hasSegments ? JSON.stringify(body.segments) : null,
    },
    include: {
      currency: true,
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
    extras: (() => {
      try {
        return (flight as any).extras
          ? JSON.parse((flight as any).extras as any)
          : null;
      } catch {
        return null;
      }
    })(),
  } as any;
});
