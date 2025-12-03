import { prisma } from "~~/server/utils/prisma";
import { getRouterParam, createError } from "h3";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const rentalId = getRouterParam(event, "rentalId");

  if (!tripId || !rentalId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing ids in route",
    });
  }

  const body = await readBody(event);

  const rental = await prisma.carRental.update({
    where: { id: rentalId },
    data: {
      tripOptionId: body.tripOptionId ?? null,
    },
  });

  return rental;
});
