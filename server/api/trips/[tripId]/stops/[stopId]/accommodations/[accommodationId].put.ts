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
    data.nightlyRate = body.nightlyRate ? Number(body.nightlyRate) : null;
  if (body.currencyId !== undefined) data.currencyId = body.currencyId;
  if (body.totalCostEUR !== undefined)
    data.totalCostEUR = body.totalCostEUR ? Number(body.totalCostEUR) : null;
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
