import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Required field validation
  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Title is required." });
  }
  if (!body.startDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "Start date is required.",
    });
  }
  if (!body.endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "End date is required.",
    });
  }
  if (!body.currencyId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Currency is required.",
    });
  }

  // Validate currency exists
  const currency = await prisma.currency.findUnique({
    where: { id: body.currencyId },
  });
  if (!currency) {
    throw createError({ statusCode: 400, statusMessage: "Invalid currency." });
  }

  const created = await prisma.trip.create({
    data: {
      title: body.title,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      people: body.people ?? 1,
      totalCostEUR: body.totalCostEUR ?? 0,
      imageUrl: body.imageUrl ?? null,
      currencyId: body.currencyId,
      startLocationName: body.startLocationName ?? null,
      startLat: body.startLat ?? null,
      startLng: body.startLng ?? null,
      endLocationName: body.endLocationName ?? null,
      endLat: body.endLat ?? null,
      endLng: body.endLng ?? null,
      splitFlightCost: body.splitFlightCost ?? false,
      splitCarRentalCost: body.splitCarRentalCost ?? true,
      splitAccommodationCost: body.splitAccommodationCost ?? true,
    },
  });

  // Best-effort: create HUB stops for start/end if provided
  try {
    await prisma.$transaction(async (tx) => {
      if (created.startDate) {
        await tx.tripStop.create({
          data: {
            tripId: created.id,
            name: created.startLocationName || "Start",
            startDate: created.startDate,
            endDate: created.startDate,
            lat: created.startLat ?? null,
            lng: created.startLng ?? null,
            type: "HUB",
            order: 0,
          },
        });
      }
      if (created.endDate) {
        await tx.tripStop.create({
          data: {
            tripId: created.id,
            name: created.endLocationName || "End",
            startDate: created.endDate,
            endDate: created.endDate,
            lat: created.endLat ?? null,
            lng: created.endLng ?? null,
            type: "HUB",
            order: 999999,
          },
        });
      }
    });
  } catch (e) {
    console.error("Failed to create HUB stops for new trip", created.id, e);
  }

  return created;
});
