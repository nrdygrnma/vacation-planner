import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  // Ensure a sensible default set exists, then return all types
  const defaults = ["Hotel", "Studio", "Cabin", "House", "Apartment"];

  try {
    const existing = await prisma.roomType.findMany({ select: { name: true } });
    if (existing.length === 0) {
      await prisma.roomType.createMany({
        data: defaults.map((name) => ({ name })),
        skipDuplicates: true,
      });
    } else {
      // Add any missing defaults without touching existing ones
      const existingNames = new Set(existing.map((r) => r.name));
      const missing = defaults.filter((n) => !existingNames.has(n));
      if (missing.length > 0) {
        await prisma.roomType.createMany({
          data: missing.map((name) => ({ name })),
          skipDuplicates: true,
        });
      }
    }
  } catch (e) {
    // If table doesn't exist or client not ready, fall back to in-memory defaults
    return defaults
      .map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const list = await prisma.roomType.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return list;
});
