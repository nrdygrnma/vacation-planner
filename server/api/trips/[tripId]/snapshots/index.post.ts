import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const body = await readBody(event);
  const {
    name,
    flightId,
    carRentalId,
    stopSelections,
    totalCostEUR,
    reasoning,
  } = body;

  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Trip ID is required",
    });
  }

  return prisma.comparisonSnapshot.create({
    data: {
      tripId,
      name,
      flightId,
      carRentalId,
      stopSelections:
        typeof stopSelections === "string"
          ? stopSelections
          : JSON.stringify(stopSelections),
      totalCostEUR,
      reasoning,
    },
  });
});
