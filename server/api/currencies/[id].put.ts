import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { name, symbol } = body;

  return prisma.currency.update({
    where: { id },
    data: {
      name,
      symbol,
    },
  });
});
