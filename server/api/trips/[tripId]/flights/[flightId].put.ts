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
      airlineLogoUrl?: string | null;
      notes?: string | null;
      stopOverDurationMinutes?: number | null;
      stopOverAirports?: any[] | null;
      segments?: any[] | null;
      // Optional, not always present in payload, but supported by schema
      isRoundTrip?: boolean;
      returnDepartureDate?: string | null;
      returnArrivalDate?: string | null;
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
  if (body.isRoundTrip !== undefined) data.isRoundTrip = body.isRoundTrip;
  if (body.returnDepartureDate !== undefined)
    data.returnDepartureDate = body.returnDepartureDate;
  if (body.returnArrivalDate !== undefined)
    data.returnArrivalDate = body.returnArrivalDate;
  if (body.currencyId !== undefined) data.currencyId = body.currencyId;
  if (body.totalCostEUR !== undefined) data.totalCostEUR = body.totalCostEUR;
  if (body.bookingUrl !== undefined) data.bookingUrl = body.bookingUrl;
  if (body.airlineLogoUrl !== undefined)
    data.airlineLogoUrl = body.airlineLogoUrl;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.segments !== undefined) {
    data.segments = Array.isArray(body.segments)
      ? JSON.stringify(body.segments)
      : (body.segments as any);
  }
  if (body.stopOverDurationMinutes !== undefined)
    data.stopOverDurationMinutes = body.stopOverDurationMinutes;
  if (body.stopOverAirports !== undefined) {
    data.stopOverAirports = Array.isArray(body.stopOverAirports)
      ? JSON.stringify(body.stopOverAirports)
      : (body.stopOverAirports as any);
  }

  // If segments provided, derive dates/durations/stops/stopovers
  let outboundInfo: any = null;
  let returnInfo: any = null;
  const hasSegments = Array.isArray(body.segments) && body.segments.length > 0;

  if (hasSegments) {
    const calcLeg = (segs: any[]) => {
      if (segs.length === 0) return null;
      segs.sort(
        (a: any, b: any) =>
          +new Date(a.departureDate) - +new Date(b.departureDate),
      );

      const parseInTz = (dateStr: string, tz?: string) => {
        if (!tz || tz === "UTC") return new Date(dateStr);
        const localStr = dateStr.replace("Z", "");
        const date = new Date(localStr + "Z");
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
      outboundInfo = calcLeg(body.segments!.filter((s: any) => !s.isReturn));
      returnInfo = calcLeg(body.segments!.filter((s: any) => s.isReturn));

      data.isRoundTrip = !!body.isRoundTrip || !!returnInfo;
      data.segments = JSON.stringify(body.segments);

      if (outboundInfo) {
        data.departureDate = outboundInfo.firstDep;
        data.arrivalDate = outboundInfo.lastArr;
        data.stops = outboundInfo.stops;
        data.durationMin = outboundInfo.totalGross;
        data.outboundDurationMin = outboundInfo.totalGross;
        data.outboundNetDurationMin = outboundInfo.netFlight;
        data.outboundStopoverMin = outboundInfo.stopover;
      }
      if (returnInfo) {
        data.returnDepartureDate = returnInfo.firstDep;
        data.returnArrivalDate = returnInfo.lastArr;
        data.returnDurationMin = returnInfo.totalGross;
        data.returnNetDurationMin = returnInfo.netFlight;
        data.returnStopoverMin = returnInfo.stopover;
      }

      data.stopOverDurationMinutes =
        (outboundInfo?.stopover ?? 0) + (returnInfo?.stopover ?? 0) || null;
      data.stopOverAirports = JSON.stringify([
        ...(outboundInfo?.stopAirports ?? []),
        ...(returnInfo?.stopAirports ?? []),
      ]);
    } catch (e) {
      console.error("Segment calculation failed", e);
    }
  }

  let nextDeparture: Date | null | undefined = undefined;
  let nextArrival: Date | null | undefined = undefined;

  if (body.departureDate !== undefined && !outboundInfo) {
    nextDeparture = body.departureDate ? new Date(body.departureDate) : null;
    data.departureDate = nextDeparture;
  }
  if (body.arrivalDate !== undefined && !outboundInfo) {
    nextArrival = body.arrivalDate ? new Date(body.arrivalDate) : null;
    data.arrivalDate = nextArrival;
  }

  if (
    (body.departureDate !== undefined || body.arrivalDate !== undefined) &&
    !outboundInfo
  ) {
    const depart =
      nextDeparture !== undefined ? nextDeparture : existing.departureDate;
    const arrive =
      nextArrival !== undefined ? nextArrival : existing.arrivalDate;

    if (depart && arrive) {
      const minutes = Math.max(0, Math.round((+arrive - +depart) / 60000));
      data.durationMin = minutes;
      data.outboundDurationMin = minutes;
    } else {
      data.durationMin = null;
      data.outboundDurationMin = null;
    }
  }

  if (body.returnDepartureDate !== undefined && !returnInfo) {
    data.returnDepartureDate = body.returnDepartureDate
      ? new Date(body.returnDepartureDate)
      : null;
  }
  if (body.returnArrivalDate !== undefined && !returnInfo) {
    data.returnArrivalDate = body.returnArrivalDate
      ? new Date(body.returnArrivalDate)
      : null;
  }
  if (body.isRoundTrip !== undefined) {
    data.isRoundTrip = body.isRoundTrip;
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

  const updated = await prisma.flight.update({
    where: { id: flightId },
    data,
    include: {
      currency: true,
    },
  });
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
    extras: (() => {
      try {
        return (updated as any).extras
          ? JSON.parse((updated as any).extras as any)
          : null;
      } catch {
        return null;
      }
    })(),
  } as any;
});
