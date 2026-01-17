import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  // Return minimal list of room types for dropdowns
  const list = await prisma.roomType.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return list;
});
