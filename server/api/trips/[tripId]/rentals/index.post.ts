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
  if (!body.provider) missing.push("provider");
  if (!body.pickupLocation) missing.push("pickupLocation");
  if (!body.dropoffLocation) missing.push("dropoffLocation");
  if (body.baseRate == null) missing.push("baseRate");
  if (!body.currencyId) missing.push("currencyId");

  if (missing.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing fields: ${missing.join(", ")}`,
    });
  }

  const rental = await prisma.carRental.create({
    data: {
      tripId,
      provider: body.provider,
      carTypeId: body.carTypeId ?? null,

      pickupDate: body.pickupDate ? new Date(body.pickupDate) : null,
      dropoffDate: body.dropoffDate ? new Date(body.dropoffDate) : null,

      pickupLocation: body.pickupLocation,
      dropoffLocation: body.dropoffLocation,

      baseRate: body.baseRate,
      fees: body.fees ?? null,
      insurancePerDay: body.insurancePerDay ?? null,

      currencyId: body.currencyId,
      totalCostEUR: body.totalCostEUR ?? null,

      notes: body.notes ?? null,
      bookingUrl: body.bookingUrl ?? null,

      tripOptionId: body.tripOptionId ?? null,
    },
  });

  return rental;
});
