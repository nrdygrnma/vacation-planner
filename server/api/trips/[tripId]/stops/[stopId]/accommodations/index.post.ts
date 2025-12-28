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
    const accommodation = await prisma.accommodation.create({
      data: {
        name: body.name,
        provider: body.provider || null,
        roomType: body.roomType || null,
        nightlyRate: body.nightlyRate ? Number(body.nightlyRate) : null,
        currencyId: body.currencyId,
        totalCostEUR: body.totalCostEUR ? Number(body.totalCostEUR) : null,
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
