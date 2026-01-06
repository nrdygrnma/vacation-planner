import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "tripId");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing trips id" });
  }

  const body = await readBody<{
    title?: string;
    startDate?: string | null;
    endDate?: string | null;
    people?: number;
    currencyId?: string;
    imageUrl?: string | null;
    startLocationName?: string | null;
    startLat?: number | null;
    startLng?: number | null;
    endLocationName?: string | null;
    endLat?: number | null;
    endLng?: number | null;
  }>(event);

  const data: any = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.people !== undefined) data.people = body.people;
  if (body.currencyId !== undefined) data.currencyId = body.currencyId;
  if (body.startLocationName !== undefined)
    data.startLocationName = body.startLocationName;
  if (body.startLat !== undefined) data.startLat = body.startLat;
  if (body.startLng !== undefined) data.startLng = body.startLng;
  if (body.endLocationName !== undefined)
    data.endLocationName = body.endLocationName;
  if (body.endLat !== undefined) data.endLat = body.endLat;
  if (body.endLng !== undefined) data.endLng = body.endLng;

  if (body.startDate !== undefined) {
    data.startDate = body.startDate ? new Date(body.startDate) : null;
  }
  if (body.endDate !== undefined) {
    data.endDate = body.endDate ? new Date(body.endDate) : null;
  }
  if (body.imageUrl !== undefined) {
    data.imageUrl = body.imageUrl || null;
  }

  if (data.people !== undefined && data.people < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "people must be >= 1",
    });
  }

  const existing = await prisma.trip.findUnique({ where: { id } });
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Trip not found" });
  }

  const finalTitle = data.title !== undefined ? data.title : existing.title;
  const finalStart =
    data.startDate !== undefined ? data.startDate : existing.startDate;
  const finalEnd = data.endDate !== undefined ? data.endDate : existing.endDate;
  const finalCurrencyId =
    data.currencyId !== undefined ? data.currencyId : existing.currencyId;

  if (!finalTitle || !String(finalTitle).trim()) {
    throw createError({ statusCode: 400, statusMessage: "Title is required." });
  }
  if (!finalStart) {
    throw createError({
      statusCode: 400,
      statusMessage: "Start date is required.",
    });
  }
  if (!finalEnd) {
    throw createError({
      statusCode: 400,
      statusMessage: "End date is required.",
    });
  }
  if (!finalCurrencyId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Currency is required.",
    });
  }

  const currency = await prisma.currency.findUnique({
    where: { id: finalCurrencyId },
  });
  if (!currency) {
    throw createError({ statusCode: 400, statusMessage: "Invalid currency." });
  }

  try {
    const updated = await prisma.trip.update({
      where: { id },
      data,
      include: { currency: true },
    });
    return updated;
  } catch (e: any) {
    if (e.code === "P2025") {
      throw createError({ statusCode: 404, statusMessage: "Trip not found" });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update trips",
    });
  }
});
