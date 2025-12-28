import { spawn } from "node:child_process";
import { access, writeFile } from "node:fs/promises";

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export default async () => {
  console.log("🚀 Starting test setup...");

  // Always use bun
  const packageManager = "bun";
  console.log(`📦 Using package manager: ${packageManager}`);

  // 1) Build once (skip if .output exists)
  const built = await fileExists(".output/server/index.mjs");
  if (!built) {
    console.log("🔨 Building Nuxt application...");
    const buildArgs =
      packageManager === "bun" ? ["run", "build:test"] : ["run", "build:test"];

    const build = spawn(packageManager, buildArgs, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        NODE_OPTIONS: "--no-deprecation",
      },
    });

    const code: number = await new Promise((resolve) =>
      build.on("exit", (c) => resolve(c ?? 1)),
    );

    if (code !== 0) {
      throw new Error(`Nuxt build failed with exit code ${code}`);
    }
    console.log("✅ Build completed successfully");
  } else {
    console.log("✅ Build already exists, skipping...");
  }

  // 2) Start preview server (no Vite/HMR)
  console.log("🌐 Starting preview server on port 3001...");
  const previewArgs =
    packageManager === "bun"
      ? ["run", "preview:test"]
      : ["run", "preview:test"];

  const child = spawn(packageManager, previewArgs, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NODE_NO_WARNINGS: "1",
      NODE_OPTIONS: "--no-deprecation",
    },
  });

  await writeFile(".jest-nuxt-pid", String(child.pid));

  // 3) Wait until server is up
  console.log("⏳ Waiting for server to be ready...");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const waitOn = require("wait-on");

  try {
    await waitOn({
      resources: ["http://localhost:3001/"],
      timeout: 120000,
      validateStatus: (status: number) => status >= 200 && status < 500,
    });
    console.log("✅ Server is ready!");
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    throw error;
  }
};
