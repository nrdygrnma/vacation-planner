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
        nightlyRate: body.nightlyRate ? parseFloat(body.nightlyRate) : 0,
        currencyId: body.currencyId,
        totalCostEUR: body.totalCostEUR ? parseFloat(body.totalCostEUR) : 0,
        tripStop: { connect: { id: stopId } },
      },
      include: { currency: true },
    });
    return accommodation;
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create accommodation",
    });
  }
});
