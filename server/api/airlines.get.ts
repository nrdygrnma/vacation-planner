import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Airline } from "~/types/tripTypes";

export default defineEventHandler(async (event) => {
  const filePath = join(
    process.cwd(),
    "app",
    "assets",
    "data",
    "airlines.json",
  );
  const raw = await readFile(filePath, "utf-8");
  const obj = JSON.parse(raw) as Record<string, string>;

  const query = getQuery(event);

  const search =
    (query.search as string | undefined)?.trim().toLowerCase() ?? "";
  const limit = Number(query.limit ?? 50);

  let list: Airline[] = Object.entries(obj).map(([code, name]) => ({
    code,
    name,
  }));

  // Sort alphabetically always
  list.sort((a, b) => a.name.localeCompare(b.name));

  // Apply search if given
  if (search) {
    list = list.filter((a) => {
      const name = a.name.toLowerCase();
      const code = a.code.toLowerCase();
      return name.includes(search) || code.includes(search);
    });
  }

  // Apply limit safely
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;

  return list.slice(0, safeLimit);
});
