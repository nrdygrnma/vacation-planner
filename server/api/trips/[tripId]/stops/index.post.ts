import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id",
    });
  }

  const body = await readBody(event);
  if (!body.name || !body.startDate || !body.endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields (name, startDate, endDate)",
    });
  }

  try {
    // Get current max order
    const maxOrder = await prisma.tripStop.aggregate({
      where: { tripId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const stop = await prisma.tripStop.create({
      data: {
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        lat: body.lat ? parseFloat(body.lat) : null,
        lng: body.lng ? parseFloat(body.lng) : null,
        type: body.type || "STOP",
        order: body.order !== undefined ? body.order : nextOrder,
        trip: { connect: { id: tripId } },
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
    return stop;
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create trip stop",
    });
  }
});
