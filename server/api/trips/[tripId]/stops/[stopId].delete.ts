import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const stopId = getRouterParam(event, "stopId");

  if (!tripId || !stopId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id or stop id",
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Unset selected accommodation first (or delete accommodations)
      await tx.tripStop.update({
        where: { id: stopId },
        data: { selectedAccommodationId: null },
      });
      await tx.accommodation.deleteMany({ where: { tripStopId: stopId } });
      await tx.tripStop.delete({
        where: { id: stopId, tripId: tripId },
      });
    });
    return { message: "Trip stop deleted successfully" };
  } catch (e: any) {
    if (e.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Trip stop not found",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete trip stop",
    });
  }
});
