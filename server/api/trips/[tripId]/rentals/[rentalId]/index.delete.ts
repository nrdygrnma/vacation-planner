import { prisma } from "~~/server/utils/prisma";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const rentalId = getRouterParam(event, "rentalId");

  if (!rentalId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing rental id",
    });
  }

  await prisma.carRental.delete({
    where: { id: rentalId },
  });

  return { success: true };
});
