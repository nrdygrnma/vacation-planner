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
  if (body.provider !== undefined) data.provider = body.provider || null;
  if (body.roomTypeId !== undefined) data.roomTypeId = body.roomTypeId || null;
  if (body.nightlyRate !== undefined)
    data.nightlyRate = body.nightlyRate ? Number(body.nightlyRate) : null;
  if (body.totalPrice !== undefined)
    data.totalPrice = body.totalPrice ? Number(body.totalPrice) : null;
  if (body.currencyId !== undefined) data.currencyId = body.currencyId;

  // Recalculate totalCostEUR if needed
  if (
    body.nightlyRate !== undefined ||
    body.totalPrice !== undefined ||
    body.totalCostEUR !== undefined
  ) {
    if (body.totalCostEUR !== undefined) {
      data.totalCostEUR = body.totalCostEUR ? Number(body.totalCostEUR) : null;
    } else if (body.totalPrice) {
      data.totalCostEUR = Number(body.totalPrice);
    } else if (body.nightlyRate) {
      // Need stop dates for nights
      const stop = await prisma.tripStop.findFirst({
        where: { accommodations: { some: { id: accommodationId } } },
      });
      if (stop) {
        const start = new Date(stop.startDate);
        const end = new Date(stop.endDate);
        const diff = end.getTime() - start.getTime();
        const nights = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        data.totalCostEUR = Number(body.nightlyRate) * nights;
      }
    } else {
      data.totalCostEUR = null;
    }
  }
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.url !== undefined) data.url = body.url;

  if (body.images !== undefined && Array.isArray(body.images)) {
    data.images = {
      deleteMany: {},
      create: body.images.map((url: string) => ({ url })),
    };
  }

  try {
    const updated = await prisma.accommodation.update({
      where: { id: accommodationId },
      data,
      include: {
        currency: true,
        images: true,
        roomType: true,
      },
    });
    return updated;
  } catch (e: any) {
    console.error("Error updating accommodation:", e);
    if (e.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Accommodation not found",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update accommodation: ${e.message}`,
    });
  }
});
