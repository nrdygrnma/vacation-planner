import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const stopId = getRouterParam(event, "stopId");
  if (!stopId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing stop id",
    });
  }

  const body = await readBody(event);
  if (!body.name || !body.currencyId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields (name, currencyId)",
    });
  }

  try {
    // Get stop details to calculate nights if nightlyRate is provided
    const stop = await prisma.tripStop.findUnique({
      where: { id: stopId },
    });

    let totalCostEUR = body.totalCostEUR ? Number(body.totalCostEUR) : null;

    if (!totalCostEUR && body.nightlyRate && stop) {
      const start = new Date(stop.startDate);
      const end = new Date(stop.endDate);
      const diff = end.getTime() - start.getTime();
      const nights = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      // Note: In a real app we'd convert currency here.
      // For now, if we don't have currency conversion, we just use the rate.
      // But looking at other parts of the app, totalCostEUR is usually just the value in the selected currency
      // if we don't have a conversion service yet.
      totalCostEUR = Number(body.nightlyRate) * nights;
    }

    // If totalPrice is provided directly
    if (body.totalPrice) {
      totalCostEUR = Number(body.totalPrice);
    }

    const accommodation = await prisma.accommodation.create({
      data: {
        name: body.name,
        provider: body.provider || null,
        roomTypeId: body.roomTypeId || null,
        nightlyRate: body.nightlyRate ? Number(body.nightlyRate) : null,
        totalPrice: body.totalPrice ? Number(body.totalPrice) : null,
        currencyId: body.currencyId,
        totalCostEUR: totalCostEUR,
        tripStopId: stopId,
        notes: body.notes || null,
        url: body.url || null,
        images:
          body.images && Array.isArray(body.images)
            ? {
                create: body.images.map((url: string) => ({ url })),
              }
            : undefined,
      },
      include: {
        currency: true,
        images: true,
        roomType: true,
      },
    });
    return accommodation;
  } catch (e: any) {
    console.error("Error creating accommodation:", e);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create accommodation: ${e.message}`,
    });
  }
});
