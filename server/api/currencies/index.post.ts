import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, symbol } = body;

  return prisma.currency.create({
    data: {
      name,
      symbol,
    },
  });
});
