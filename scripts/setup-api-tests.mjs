#!/usr/bin/env node

/**
 * Complete API Tests Setup Script
 *
 * This script performs all necessary steps to set up API tests:
 * 1. Verifies environment
 * 2. Generates Prisma client
 * 3. Runs database migrations
 * 4. Builds the application
 * 5. Copies Prisma engines
 * 6. Fixes DATABASE_URL path
 * 7. Verifies setup
 */

import { spawn } from "child_process";
import { readFile, writeFile, access, stat, mkdir, cp } from "fs/promises";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

let hasErrors = false;

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
  hasErrors = true;
}

function success(message) {
  console.log(`✅ ${message}`);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    log("🔄", `Running: ${command} ${args.join(" ")}`);
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    proc.on("error", (err) => {
      error(`Failed to run ${command}: ${err.message}`);
      reject(err);
    });

    proc.on("exit", (code) => {
      if (code === 0) {
        success(`Completed: ${command} ${args.join(" ")}`);
        resolve();
      } else {
        error(`${command} exited with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

async function step1_verifyEnvironment() {
  console.log("\n" + "=".repeat(60));
  log("📦", "Step 1: Verifying Environment");
  console.log("=".repeat(60));

  // Check Node.js version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0]);

  if (major >= 18) {
    success(`Node.js ${nodeVersion} (requires 18+)`);
  } else {
    error(`Node.js ${nodeVersion} is too old (requires 18+)`);
    return false;
  }

  // Check package.json
  const pkgPath = join(rootDir, "package.json");
  if (await fileExists(pkgPath)) {
    success("package.json exists");
  } else {
    error("package.json not found");
    return false;
  }

  // Check if node_modules exists
  const nodeModulesPath = join(rootDir, "node_modules");
  if (await fileExists(nodeModulesPath)) {
    success("node_modules exists");
  } else {
    error("node_modules not found - run: bun install");
    return false;
  }

  return !hasErrors;
}

async function step2_generatePrisma() {
  console.log("\n" + "=".repeat(60));
  log("🔨", "Step 2: Generating Prisma Client");
  console.log("=".repeat(60));

  try {
    await runCommand("bun", ["prisma", "generate"]);
    return true;
  } catch (err) {
    error("Prisma generate failed");
    return false;
  }
}

async function step3_migratDatabase() {
  console.log("\n" + "=".repeat(60));
  log("🗄️", "Step 3: Running Database Migrations");
  console.log("=".repeat(60));

  // Check if database exists
  const dbPath = join(rootDir, "prisma", "dev.db");
  const dbExists = await fileExists(dbPath);

  if (dbExists) {
    log("ℹ️", "Database already exists - skipping migrations");
    log("ℹ️", "To reset database, run: bun prisma migrate reset --force");
    return true;
  }

  try {
    log("ℹ️", "Creating new database and running migrations...");
    await runCommand("bun", ["prisma", "migrate", "dev", "--name", "init"]);
    return true;
  } catch (err) {
    error("Database migration failed");
    log("ℹ️", "You can try manually: bun prisma migrate dev");
    return false;
  }
}

async function step4_buildApplication() {
  console.log("\n" + "=".repeat(60));
  log("🏗️", "Step 4: Building Application");
  console.log("=".repeat(60));

  // Check if .output exists
  const outputPath = join(rootDir, ".output", "server", "index.mjs");
  if (await fileExists(outputPath)) {
    log("ℹ️", "Build already exists - skipping build");
    log("ℹ️", "To rebuild, delete .output folder and run again");
    return true;
  }

  try {
    const packageManager = "bun"; // Always use bun
    await runCommand(packageManager, ["run", "build:test"]);
    return true;
  } catch (err) {
    error("Build failed");
    return false;
  }
}

async function step5_copyPrismaEngines() {
  console.log("\n" + "=".repeat(60));
  log("📦", "Step 5: Copying Prisma Engines");
  console.log("=".repeat(60));

  const sourceDir = join(rootDir, "node_modules", ".prisma", "client");
  const destDir = join(
    rootDir,
    ".output",
    "server",
    "node_modules",
    ".prisma",
    "client"
  );

  // Check if source exists
  if (!(await fileExists(sourceDir))) {
    error("Prisma client not found - run: bun prisma generate");
    return false;
  }

  // Check if already copied
  const enginePath = join(destDir, "query-engine-windows.exe");
  if (await fileExists(enginePath)) {
    log("ℹ️", "Prisma engines already copied - skipping");
    return true;
  }

  // Create destination directory
  try {
    await mkdir(destDir, { recursive: true });
    success("Created destination directory");
  } catch (err) {
    error(`Failed to create destination directory: ${err.message}`);
    return false;
  }

  // Copy recursively
  try {
    await cp(sourceDir, destDir, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
    success("Prisma engines and runtime copied successfully!");
    return true;
  } catch (err) {
    error(`Failed to copy Prisma engines: ${err.message}`);
    return false;
  }
}

async function step6_fixDatabaseUrl() {
  console.log("\n" + "=".repeat(60));
  log("🔧", "Step 6: Fixing DATABASE_URL");
  console.log("=".repeat(60));

  const envPath = join(rootDir, ".env");
  const dbPath = join(rootDir, "prisma", "dev.db");
  const absoluteDbPath = resolve(dbPath);

  try {
    // Read .env file
    let envContent = await readFile(envPath, "utf-8");
    success("Found .env file");

    // Check current DATABASE_URL
    const currentMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (currentMatch) {
      log("📍", `Current: ${currentMatch[1]}`);

      // Check if already absolute
      if (currentMatch[1].includes(":") && !currentMatch[1].startsWith("file:./")) {
        log("ℹ️", "DATABASE_URL already uses absolute path - skipping");
        return true;
      }
    }

    // Create new DATABASE_URL with absolute path
    const newDatabaseUrl = `DATABASE_URL="file:${absoluteDbPath.replace(/\\/g, "/")}"`;

    // Replace DATABASE_URL
    if (envContent.includes("DATABASE_URL")) {
      envContent = envContent.replace(
        /DATABASE_URL="?[^"\n]+"?/,
        newDatabaseUrl
      );
      success("Updated DATABASE_URL to absolute path");
    } else {
      envContent += `\n${newDatabaseUrl}\n`;
      success("Added DATABASE_URL with absolute path");
    }

    // Write back to .env
    await writeFile(envPath, envContent, "utf-8");
    log("📂", `Database: ${absoluteDbPath}`);

    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      error(".env file not found - creating one");

      const newEnvContent = `DATABASE_URL="file:${absoluteDbPath.replace(/\\/g, "/")}"\n`;
      await writeFile(envPath, newEnvContent, "utf-8");

      success("Created .env file with absolute DATABASE_URL");
      log("📂", `Database: ${absoluteDbPath}`);
      return true;
    } else {
      error(`Failed to fix DATABASE_URL: ${err.message}`);
      return false;
    }
  }
}

async function step7_verifySetup() {
  console.log("\n" + "=".repeat(60));
  log("🔍", "Step 7: Verifying Setup");
  console.log("=".repeat(60));

  const checks = [
    {
      name: "Prisma client generated",
      path: join(rootDir, "node_modules", ".prisma", "client", "index.js"),
    },
    {
      name: "Database exists",
      path: join(rootDir, "prisma", "dev.db"),
    },
    {
      name: "Application built",
      path: join(rootDir, ".output", "server", "index.mjs"),
    },
    {
      name: "Prisma engine copied",
      path: join(
        rootDir,
        ".output",
        "server",
        "node_modules",
        ".prisma",
        "client",
        "query-engine-windows.exe"
      ),
    },
    {
      name: ".env file exists",
      path: join(rootDir, ".env"),
    },
  ];

  let allPassed = true;

  for (const check of checks) {
    if (await fileExists(check.path)) {
      success(check.name);
    } else {
      error(check.name);
      allPassed = false;
    }
  }

  return allPassed;
}

async function main() {
  console.log("╔" + "═".repeat(58) + "╗");
  console.log("║" + " ".repeat(10) + "API Tests Complete Setup" + " ".repeat(23) + "║");
  console.log("╚" + "═".repeat(58) + "╝");

  console.log("\nThis script will:");
  console.log("  1. Verify environment");
  console.log("  2. Generate Prisma client");
  console.log("  3. Run database migrations");
  console.log("  4. Build the application");
  console.log("  5. Copy Prisma engines");
  console.log("  6. Fix DATABASE_URL path");
  console.log("  7. Verify setup");

  console.log("\n⏱️  This may take a few minutes...\n");

  // Run all steps
  const steps = [
    step1_verifyEnvironment,
    step2_generatePrisma,
    step3_migratDatabase,
    step4_buildApplication,
    step5_copyPrismaEngines,
    step6_fixDatabaseUrl,
    step7_verifySetup,
  ];

  for (const step of steps) {
    const result = await step();
    if (!result) {
      console.log("\n" + "=".repeat(60));
      error("Setup failed at one of the steps");
      console.log("=".repeat(60));
      console.log("\n💡 Tips:");
      console.log("  - Check error messages above");
      console.log("  - Run individual commands manually");
      console.log("  - See docs/api-tests/TROUBLESHOOTING.md");
      process.exit(1);
    }
  }

  // Success!
  console.log("\n" + "╔" + "═".repeat(58) + "╗");
  console.log("║" + " ".repeat(16) + "✨ Setup Complete! ✨" + " ".repeat(20) + "║");
  console.log("╚" + "═".repeat(58) + "╝");

  console.log("\n🎉 Your API tests are ready to run!");
  console.log("\n📝 Next steps:");
  console.log("  1. Terminal 1: bun run preview");
  console.log("  2. Terminal 2: bun run test:api:manual");
  console.log("  3. Terminal 2: bun run test:api");
  console.log("\n📚 Documentation:");
  console.log("  - docs/api-tests/API_TESTS_COMPLETE_GUIDE.md");
  console.log("  - docs/api-tests/QUICK_REFERENCE.md");
  console.log("\n✅ All systems ready!");
}

// Run the setup
main().catch((err) => {
  console.error("\n❌ Setup script failed:", err.message);
  process.exit(1);
});
