import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({ statusCode: 400, statusMessage: "Missing trip id" });
  }

  return prisma.carRental.findMany({
    where: { tripId },
    include: {
      currency: true,
      carType: true,
    },
    orderBy: { pickupDate: "asc" },
  });
});
