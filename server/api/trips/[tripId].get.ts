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

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      currency: true,
      selectedFlight: true,
      selectedCarRental: true,
      flights: {
        orderBy: [{ departureDate: "asc" }, { totalCostEUR: "asc" }],
      },
      carRentals: true,
      tripStops: {
        orderBy: [{ order: "asc" }, { startDate: "asc" }],
        include: {
          accommodations: {
            include: {
              currency: true,
              images: true,
              roomType: true,
            },
          },
          selectedAccommodation: {
            include: {
              currency: true,
              images: true,
              roomType: true,
            },
          },
        },
      },
    },
  });

  if (!trip) {
    throw createError({ statusCode: 404, statusMessage: "Trip not found" });
  }

  // Parse JSON fields for flights
  const parseFlight = (f: any) => {
    if (!f) return f;
    return {
      ...f,
      stopOverAirports: (() => {
        try {
          return f.stopOverAirports ? JSON.parse(f.stopOverAirports) : null;
        } catch {
          return null;
        }
      })(),
      segments: (() => {
        try {
          return f.segments ? JSON.parse(f.segments) : null;
        } catch {
          return null;
        }
      })(),
      extras: (() => {
        try {
          return f.extras ? JSON.parse(f.extras) : null;
        } catch {
          return null;
        }
      })(),
    };
  };

  if (trip.selectedFlight) {
    (trip as any).selectedFlight = parseFlight(trip.selectedFlight);
  }

  if (trip.flights) {
    (trip as any).flights = trip.flights.map(parseFlight);
  }

  return trip;
});
