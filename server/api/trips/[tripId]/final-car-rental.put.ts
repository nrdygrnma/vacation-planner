import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({ statusCode: 400, statusMessage: "Missing trip id" });
  }

  const body = await readBody<{ carRentalId: string | null }>(event);

  try {
    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        selectedCarRentalId: body.carRentalId,
      },
      include: {
        selectedCarRental: {
          include: {
            currency: true,
            carType: true,
          },
        },
      },
    });
    return updated;
  } catch (e: any) {
    console.error(e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update trip selection",
    });
  }
});
