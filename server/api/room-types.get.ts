import { prisma } from "~~/server/utils/prisma";
import { defineEventHandler } from "h3";

export default defineEventHandler(async () => {
  return await prisma.roomType.findMany({
    orderBy: { name: "asc" },
  });
});
