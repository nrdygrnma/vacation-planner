import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const rentalId = getRouterParam(event, "rentalId");

  if (!tripId || !rentalId) {
    throw createError({ statusCode: 400, statusMessage: "Missing ids" });
  }

  const body = await readBody(event);

  try {
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

    const updated = await prisma.carRental.update({
      where: { id: rentalId },
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
        notes: body.notes ? String(body.notes) : null,
        url: body.url ? String(body.url).trim() : null,
        imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
      },
      include: {
        currency: true,
        carType: true,
      },
    });
    return updated;
  } catch (e: any) {
    console.error("Prisma Error:", e);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update car rental: ${e.message || "Unknown error"}`,
    });
  }
});
