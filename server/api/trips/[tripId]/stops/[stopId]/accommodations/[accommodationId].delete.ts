import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const accommodationId = getRouterParam(event, "accommodationId");
  const stopId = getRouterParam(event, "stopId");

  if (!accommodationId || !stopId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing accommodation id or stop id",
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Unset if selected
      const stop = await tx.tripStop.findUnique({ where: { id: stopId } });
      if (stop?.selectedAccommodationId === accommodationId) {
        await tx.tripStop.update({
          where: { id: stopId },
          data: { selectedAccommodationId: null },
        });
      }
      await tx.accommodation.delete({ where: { id: accommodationId } });
    });
    return { message: "Accommodation deleted successfully" };
  } catch (e: any) {
    if (e.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Accommodation not found",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete accommodation",
    });
  }
});
