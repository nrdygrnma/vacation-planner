import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing trip id" });
  }

  try {
    // Delete dependent records in a transaction to avoid FK constraint errors
    await prisma.$transaction(async (tx) => {
      // Ensure optional FKs are cleared before deleting referenced rows
      await tx.trip.update({
        where: { id },
        data: {
          selectedFlightId: null,
          selectedCarRentalId: null,
        },
      });

      // TripStop may reference an Accommodation via selectedAccommodationId
      await tx.tripStop.updateMany({
        where: { tripId: id },
        data: { selectedAccommodationId: null },
      });

      // Delete children in safe order
      await tx.accommodation.deleteMany({ where: { tripStop: { tripId: id } } });
      await tx.tripStop.deleteMany({ where: { tripId: id } });
      await tx.flight.deleteMany({ where: { tripId: id } });
      await tx.carRental.deleteMany({ where: { tripId: id } });

      // Finally delete the Trip
      await tx.trip.delete({ where: { id } });
    });
    setResponseStatus(event, 204);
    return null;
  } catch (e: any) {
    if (e.code === "P2025") {
      throw createError({ statusCode: 404, statusMessage: "Trip not found" });
    }
    if (e.code === "P2003") {
      // Foreign key constraint failed – trip has related records
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete trip with linked items (flights, car rentals, or accommodations). Remove them first.",
      });
    }
    // Fallback
    throw createError({ statusCode: 500, statusMessage: "Failed to delete trip" });
  }
});
