import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId");

  return prisma.journalEntry.findMany({
    where: { tripId },
    include: {
      photos: true,
    },
    orderBy: {
      date: "asc",
    },
  });
});
