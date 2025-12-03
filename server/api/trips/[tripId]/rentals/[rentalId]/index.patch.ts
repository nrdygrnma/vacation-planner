import { prisma } from "~~/server/utils/prisma";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const rentalId = getRouterParam(event, "rentalId");

  if (!tripId || !rentalId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing tripId or rentalId",
    });
  }

  const body = await readBody(event);

  // Basic required fields — same rules as creation
  const missing: string[] = [];
  if (!body.provider) missing.push("provider");
  if (!body.pickupDate) missing.push("pickupDate");
  if (!body.dropoffDate) missing.push("dropoffDate");
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

  const rental = await prisma.carRental.update({
    where: { id: rentalId },
    data: {
      provider: body.provider.trim(),

      pickupDate: new Date(body.pickupDate),
      dropoffDate: new Date(body.dropoffDate),

      pickupLocation: body.pickupLocation.trim(),
      dropoffLocation: body.dropoffLocation.trim(),

      baseRate: Number(body.baseRate),
      fees: body.fees != null ? Number(body.fees) : null,
      insurancePerDay:
        body.insurancePerDay != null ? Number(body.insurancePerDay) : null,

      carTypeId: body.carTypeId ?? null,

      currencyId: body.currencyId,
      totalCostEUR:
        body.totalCostEUR != null ? Number(body.totalCostEUR) : null,

      notes: body.notes ?? null,
      bookingUrl: body.bookingUrl ?? null,

      tripOptionId: body.tripOptionId ?? null,
      tripId, // ensure rental belongs to correct trip
    },
  });

  return rental;
});
