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

    return { success: true };
  } catch (e: any) {
    console.error(e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to reorder trip stops",
    });
  }
});
