import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

export default async () => {
  try {
    const pid = Number(await readFile(".jest-nuxt-pid", "utf8"));
    if (!pid) return;

    // Windows: kill process tree reliably
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      shell: false,
    });
  } catch {
    // ignore
  }
};
