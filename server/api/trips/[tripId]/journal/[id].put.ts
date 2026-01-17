import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { date, content, photos } = body;

  // First, delete existing photos for this entry
  await prisma.journalPhoto.deleteMany({
    where: { journalEntryId: id },
  });

  return prisma.journalEntry.update({
    where: { id },
    data: {
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
