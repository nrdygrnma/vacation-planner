import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  return prisma.currency.delete({
    where: { id },
  });
});
