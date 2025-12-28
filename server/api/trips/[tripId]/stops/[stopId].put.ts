import { prisma } from "~~/server/utils/prisma";

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

  try {
    const updated = await prisma.tripStop.update({
      where: { id: stopId },
      data: {
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        lat: body.lat !== undefined ? parseFloat(body.lat) : undefined,
        lng: body.lng !== undefined ? parseFloat(body.lng) : undefined,
        type: body.type,
        order: body.order !== undefined ? parseInt(body.order) : undefined,
        selectedAccommodationId: body.selectedAccommodationId,
      },
      include: {
        accommodations: {
          include: {
            currency: true,
            images: true,
          },
        },
        selectedAccommodation: {
          include: {
            currency: true,
            images: true,
          },
        },
      },
    });
    return updated;
  } catch (e: any) {
    console.error(e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update trip stop",
    });
  }
});
