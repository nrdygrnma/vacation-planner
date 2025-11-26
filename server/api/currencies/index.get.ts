import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  return prisma.currency.findMany({
    orderBy: { name: "asc" },
  });
});
