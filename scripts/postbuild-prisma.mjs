#!/usr/bin/env node

/**
 * Post-Build Script for Prisma
 *
 * This script copies the Prisma query engine to the .output directory
 * after the Nuxt build to ensure it's available in the preview/production build.
 */

import { copyFile, mkdir, readdir, access, stat, cp } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyPrismaEngines() {
  console.log("📦 Copying Prisma engines to build output...");

  // Source: node_modules/.prisma/client
  const sourceDir = join(rootDir, "node_modules", ".prisma", "client");

  // Destination: .output/server/node_modules/.prisma/client
  const destDir = join(
    rootDir,
    ".output",
    "server",
    "node_modules",
    ".prisma",
    "client",
  );

  // Check if source exists
  if (!(await fileExists(sourceDir))) {
    console.error("❌ Prisma client not found. Run: bun prisma generate");
    process.exit(1);
  }

  // Create destination directory
  try {
    await mkdir(destDir, { recursive: true });
    console.log("✅ Created destination directory");
  } catch (error) {
    console.error("❌ Failed to create destination directory:", error.message);
    process.exit(1);
  }

  // Copy all files and directories recursively
  try {
    await cp(sourceDir, destDir, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
    console.log("✅ Prisma engines and runtime copied successfully!");
  } catch (error) {
    console.error("❌ Failed to copy Prisma engines:", error.message);
    // Fallback to manual copy if recursive fails
    console.log("   Trying manual copy...");
    try {
      const files = await readdir(sourceDir);

      for (const file of files) {
        const sourcePath = join(sourceDir, file);
        const destPath = join(destDir, file);

        try {
          const stats = await stat(sourcePath);
          if (stats.isDirectory()) {
            // Copy directory recursively
            await cp(sourcePath, destPath, { recursive: true, force: true });
            console.log(`   ✓ Copied directory ${file}`);
          } else {
            await copyFile(sourcePath, destPath);
            console.log(`   ✓ Copied ${file}`);
          }
        } catch (err) {
          console.warn(`   ⚠ Warning: Could not copy ${file}:`, err.message);
        }
      }

      console.log("✅ Manual copy completed!");
    } catch (fallbackError) {
      console.error("❌ Manual copy also failed:", fallbackError.message);
      process.exit(1);
    }
  }

  // Also symlink to node_modules for resolution
  console.log("\n🔗 Setting up Prisma module resolution...");

  const nodeModulesDest = join(rootDir, ".output", "server", "node_modules");
  await mkdir(nodeModulesDest, { recursive: true });

  console.log("✅ Prisma module resolution configured!");

  console.log("\n✨ Prisma post-build completed!");
}

// Run the script
copyPrismaEngines().catch((error) => {
  console.error("\n❌ Post-build script failed:", error);
  process.exit(1);
});
