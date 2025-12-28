import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");
  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing trip id",
    });
  }

  const body = await readBody(event);
  const { stops } = body; // Array of { id: string, order: number, startDate?: string, endDate?: string }

  if (!Array.isArray(stops)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid payload: stops must be an array",
    });
  }

  try {
    // Perform updates in a transaction
    await prisma.$transaction(
      stops.map((s) =>
        prisma.tripStop.update({
          where: { id: s.id },
          data: {
            order: s.order,
            ...(s.startDate && { startDate: s.startDate }),
            ...(s.endDate && { endDate: s.endDate }),
          },
        }),
      ),
    );

    // Fetch the updated stops with all relations to ensure frontend state is complete
    const updatedStops = await prisma.tripStop.findMany({
      where: { tripId },
      include: {
        accommodations: {
          include: {
            images: true,
          },
        },
        selectedAccommodation: {
          include: {
            images: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { startDate: "asc" }],
    });

    return { success: true, stops: updatedStops };
  } catch (e: any) {
    console.error(e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to batch update trip stops",
    });
  }
});
