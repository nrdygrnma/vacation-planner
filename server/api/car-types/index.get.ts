import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search =
    (query.search as string | undefined)?.trim().toLowerCase() ?? "";
  const limit = Number(query.limit ?? 50);

  const list = await prisma.carType.findMany({
    where: search
      ? {
          OR: [{ name: { contains: search } }, { id: { contains: search } }],
        }
      : {},
    orderBy: { name: "asc" },
    take: Number.isFinite(limit) && limit > 0 ? limit : 50,
  });

  return list;
});
