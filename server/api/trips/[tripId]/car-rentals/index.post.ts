import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({ statusCode: 400, statusMessage: "Missing trip id" });
  }

  const body = await readBody(event);

  try {
    // Verify related entities exist
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw createError({ statusCode: 404, statusMessage: "Trip not found" });
    }

    if (body.carTypeId) {
      const carType = await prisma.carType.findUnique({
        where: { id: body.carTypeId },
      });
      if (!carType) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid car type",
        });
      }
    }

    if (body.currencyId) {
      const currency = await prisma.currency.findUnique({
        where: { id: body.currencyId },
      });
      if (!currency) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid currency",
        });
      }
    }

    const created = await prisma.carRental.create({
      data: {
        provider: String(body.provider || body.company || "").trim(),
        carTypeId: body.carTypeId,
        pickupDate: body.pickupDate ? new Date(body.pickupDate) : null,
        dropoffDate:
          body.dropoffDate || body.dropOffDate
            ? new Date(body.dropoffDate || body.dropOffDate)
            : null,
        pickupLocation: String(body.pickupLocation || "").trim(),
        dropoffLocation: String(
          body.dropoffLocation || body.dropOffLocation || "",
        ).trim(),
        baseRate: Number(body.baseRate) || 0,
        fees: Number(body.fees) || 0,
        insurancePerDay: Number(body.insurancePerDay) || 0,
        currencyId: body.currencyId,
        notes: body.notes ? String(body.notes).trim() : null,
        tripId,
        totalCostEUR: 0,
      },
      include: {
        currency: true,
        carType: true,
      },
    });
    return created;
  } catch (e: any) {
    console.error("Prisma Error:", e);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create car rental: ${e.message || "Unknown error"}`,
    });
  }
});
