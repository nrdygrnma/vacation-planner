import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "tripId");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing trips id" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id },
        data: {
          selectedFlightId: null,
          selectedCarRentalId: null,
        },
      });

      await tx.tripStop.updateMany({
        where: { tripId: id },
        data: { selectedAccommodationId: null },
      });

      await tx.accommodation.deleteMany({
        where: { tripStop: { tripId: id } },
      });
      await tx.tripStop.deleteMany({ where: { tripId: id } });
      await tx.flight.deleteMany({ where: { tripId: id } });
      await tx.carRental.deleteMany({ where: { tripId: id } });

      await tx.trip.delete({ where: { id } });
    });
    return { message: "Trip deleted successfully" };
  } catch (e: any) {
    if (e.code === "P2025") {
      throw createError({ statusCode: 404, statusMessage: "Trip not found" });
    }
    if (e.code === "P2003") {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Cannot delete trips with linked items (flights, car rentals, or accommodations). Remove them first.",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete trips",
    });
  }
});
