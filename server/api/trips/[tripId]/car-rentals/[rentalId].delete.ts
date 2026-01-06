import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  const rentalId = getRouterParam(event, "rentalId");

  if (!tripId || !rentalId) {
    throw createError({ statusCode: 400, statusMessage: "Missing ids" });
  }

  try {
    // If selected on trip, unset first
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (trip?.selectedCarRentalId === rentalId) {
      await prisma.trip.update({
        where: { id: tripId },
        data: { selectedCarRentalId: null },
      });
    }

    await prisma.carRental.delete({
      where: { id: rentalId },
    });
    return { message: "Car rental deleted" };
  } catch (e: any) {
    console.error(e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete car rental",
    });
  }
});
