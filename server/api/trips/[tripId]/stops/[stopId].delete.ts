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

  try {
    // Check if stop belongs to trip
    const stop = await prisma.tripStop.findUnique({
      where: { id: stopId },
    });

    if (!stop || stop.tripId !== tripId) {
      throw createError({
        statusCode: 404,
        statusMessage: "Trip stop not found",
      });
    }

    // Unset selected accommodation first to avoid constraint issues if needed,
    // but cascade delete might handle it if we delete accommodations.
    // However, TripStop has a relation to Accommodation.

    await prisma.$transaction(async (tx) => {
      // Unset selectedAccommodationId
      await tx.tripStop.update({
        where: { id: stopId },
        data: { selectedAccommodationId: null },
      });

      // Delete accommodations linked to this stop
      await tx.accommodation.deleteMany({
        where: { tripStopId: stopId },
      });

      // Delete the stop itself
      await tx.tripStop.delete({
        where: { id: stopId },
      });
    });

    return { message: "Trip stop deleted successfully" };
  } catch (e: any) {
    console.error(e);
    if (e.statusCode) throw e;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete trip stop",
    });
  }
});
