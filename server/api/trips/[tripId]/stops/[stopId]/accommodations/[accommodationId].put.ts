import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const accommodationId = getRouterParam(event, "accommodationId");
  if (!accommodationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing accommodation id",
    });
  }

  const body = await readBody(event);
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.provider !== undefined) data.provider = body.provider;
  if (body.roomType !== undefined) data.roomType = body.roomType;
  if (body.nightlyRate !== undefined)
    data.nightlyRate = body.nightlyRate ? parseFloat(body.nightlyRate) : 0;
  if (body.currencyId !== undefined) data.currencyId = body.currencyId;
  if (body.totalCostEUR !== undefined)
    data.totalCostEUR = body.totalCostEUR ? parseFloat(body.totalCostEUR) : 0;

  try {
    const updated = await prisma.accommodation.update({
      where: { id: accommodationId },
      data,
      include: { currency: true },
    });
    return updated;
  } catch (e: any) {
    if (e.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Accommodation not found",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update accommodation",
    });
  }
});
