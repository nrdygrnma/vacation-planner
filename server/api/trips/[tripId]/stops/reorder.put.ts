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
  const { orders } = body; // Array of { id: string, order: number }

  if (!Array.isArray(orders)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid payload: orders must be an array",
    });
  }

  try {
    // Perform updates in a transaction
    await prisma.$transaction(
      orders.map((o) =>
        prisma.tripStop.update({
          where: { id: o.id },
          data: { order: o.order },
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
      statusMessage: "Failed to reorder trip stops",
    });
  }
});
