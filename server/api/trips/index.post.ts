import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Required field validation
  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Title is required." });
  }
  if (!body.startDate) {
    throw createError({ statusCode: 400, statusMessage: "Start date is required." });
  }
  if (!body.endDate) {
    throw createError({ statusCode: 400, statusMessage: "End date is required." });
  }
  if (!body.currencyId) {
    throw createError({ statusCode: 400, statusMessage: "Currency is required." });
  }

  // Validate currency exists
  const currency = await prisma.currency.findUnique({ where: { id: body.currencyId } });
  if (!currency) {
    throw createError({ statusCode: 400, statusMessage: "Invalid currency." });
  }

  return prisma.trip.create({
    data: {
      title: body.title,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      people: body.people ?? 1,
      totalCostEUR: body.totalCostEUR ?? 0,
      imageUrl: body.imageUrl ?? null,
      currencyId: body.currencyId,
    },
  });
});
