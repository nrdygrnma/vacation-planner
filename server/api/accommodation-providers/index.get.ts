import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default defineEventHandler(async () => {
  const filePath = join(
    process.cwd(),
    "app",
    "assets",
    "data",
    "accommodation-providers.json",
  );
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read accommodation providers:", error);
    return [];
  }
});
