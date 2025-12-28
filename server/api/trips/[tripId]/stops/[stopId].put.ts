import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const stopId = getRouterParam(event, "stopId");

  if (!tripId || !stopId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id or stop id",
    });
  }

  const body = await readBody(event);
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
  if (body.lat !== undefined) data.lat = body.lat ? parseFloat(body.lat) : null;
  if (body.lng !== undefined) data.lng = body.lng ? parseFloat(body.lng) : null;
  if (body.selectedAccommodationId !== undefined)
    data.selectedAccommodationId = body.selectedAccommodationId;

  try {
    const updated = await prisma.tripStop.update({
      where: { id: stopId, tripId: tripId },
      data,
      include: {
        accommodations: {
          include: { currency: true },
        },
        selectedAccommodation: {
          include: { currency: true },
        },
      },
    });
    return updated;
  } catch (e: any) {
    if (e.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Trip stop not found",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update trip stop",
    });
  }
});
