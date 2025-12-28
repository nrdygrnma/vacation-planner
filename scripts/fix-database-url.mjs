#!/usr/bin/env node

/**
 * Fix DATABASE_URL Script
 *
 * This script updates the DATABASE_URL in .env to use an absolute path
 * which is required for the preview server to work correctly.
 */

import { readFile, writeFile } from "fs/promises";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

async function fixDatabaseUrl() {
  console.log("🔧 Fixing DATABASE_URL in .env file...\n");

  const envPath = join(rootDir, ".env");
  const dbPath = join(rootDir, "prisma", "dev.db");
  const absoluteDbPath = resolve(dbPath);

  try {
    // Read .env file
    let envContent = await readFile(envPath, "utf-8");
    console.log("✅ Found .env file");

    // Check current DATABASE_URL
    const currentMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (currentMatch) {
      console.log(`📍 Current DATABASE_URL: ${currentMatch[1]}`);
    }

    // Create new DATABASE_URL with absolute path
    const newDatabaseUrl = `DATABASE_URL="file:${absoluteDbPath.replace(/\\/g, "/")}"`;

    // Replace DATABASE_URL
    if (envContent.includes("DATABASE_URL")) {
      envContent = envContent.replace(
        /DATABASE_URL="?[^"\n]+"?/,
        newDatabaseUrl
      );
      console.log(`✅ Updated DATABASE_URL to absolute path`);
    } else {
      // Add DATABASE_URL if it doesn't exist
      envContent += `\n${newDatabaseUrl}\n`;
      console.log(`✅ Added DATABASE_URL with absolute path`);
    }

    // Write back to .env
    await writeFile(envPath, envContent, "utf-8");

    console.log(`\n✨ DATABASE_URL fixed!`);
    console.log(`📂 Database location: ${absoluteDbPath}`);
    console.log(`\n✅ You can now run: bun run preview`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("❌ .env file not found!");
      console.error("Creating .env file with DATABASE_URL...");

      const newEnvContent = `DATABASE_URL="file:${absoluteDbPath.replace(/\\/g, "/")}"\n`;
      await writeFile(envPath, newEnvContent, "utf-8");

      console.log("✅ Created .env file with absolute DATABASE_URL");
      console.log(`📂 Database location: ${absoluteDbPath}`);
    } else {
      console.error("❌ Error fixing DATABASE_URL:", error.message);
      process.exit(1);
    }
  }
}

// Run the script
fixDatabaseUrl().catch((error) => {
  console.error("\n❌ Script failed:", error);
  process.exit(1);
});
