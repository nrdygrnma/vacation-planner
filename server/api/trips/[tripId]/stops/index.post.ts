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
    const stop = await prisma.tripStop.create({
      data: {
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        lat: body.lat ? parseFloat(body.lat) : null,
        lng: body.lng ? parseFloat(body.lng) : null,
        trip: { connect: { id: tripId } },
      },
      include: {
        accommodations: true,
        selectedAccommodation: true,
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
