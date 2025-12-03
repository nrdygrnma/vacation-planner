import { prisma } from "~~/server/utils/prisma";
import { createError, getRouterParam, readBody } from "h3";

export default defineEventHandler(async (event) => {
    const tripId = getRouterParam(event, "tripId");
    if (!tripId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing trip id in route",
        });
    }

    const body = await readBody<{ name?: string }>(event);

    // Auto-name options: Option 1, 2, 3...
    const count = await prisma.tripOption.count({
        where: { tripId },
    });

    const option = await prisma.tripOption.create({
        data: {
            tripId,
            name: body?.name?.trim() || `Option ${count + 1}`,
        },
    });

    return option;
});
