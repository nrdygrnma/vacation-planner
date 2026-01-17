import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, "tripId") as string;
  const body = await readBody(event);
  const { date, content, photos } = body;

  return prisma.journalEntry.create({
    data: {
      tripId,
      date: new Date(date),
      content,
      photos: {
        create: photos?.map((p: any) => ({
          url: p.url,
          caption: p.caption,
        })),
      },
    },
    include: {
      photos: true,
    },
  });
});
