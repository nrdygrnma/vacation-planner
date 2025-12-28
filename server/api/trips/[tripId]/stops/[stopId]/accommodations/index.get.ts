import { prisma } from "~~/server/utils/prisma";
import { createError, defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const stopId = getRouterParam(event, "stopId");
  if (!stopId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing stop id",
    });
  }

  return prisma.accommodation.findMany({
    where: { tripStopId: stopId },
    include: { currency: true },
    orderBy: { createdAt: "asc" },
  });
});
