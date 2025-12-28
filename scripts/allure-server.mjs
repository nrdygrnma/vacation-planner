#!/usr/bin/env node

/**
 * Persistent Allure Report Server
 *
 * This server:
 * 1. Starts and keeps running on port 5252
 * 2. Watches for new test results
 * 3. Automatically regenerates reports when tests complete
 * 4. Merges API and E2E results seamlessly
 * 5. Maintains test history across runs
 */

import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const RESULTS_E2E = path.join(ROOT, "tests/e2e/allure-results");
const RESULTS_API = path.join(ROOT, "tests/api/allure-results");
const MERGED = path.join(ROOT, ".allure/merged-results");
const REPORT = path.join(ROOT, ".allure/report");
const PORT = 5252;

let isGenerating = false;
let pendingRegeneration = false;
let serverProcess = null;

// Utility functions
async function rm(dir) {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
}

async function mkdir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dst) {
  const entries = await fs.readdir(src, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) {
      await mkdir(d);
      await copyDir(s, d);
    } else if (e.isFile()) {
      await fs.copyFile(s, d).catch(() => {});
    }
  }
}

function setLabel(obj, name, value) {
  obj.labels ??= [];
  obj.labels = obj.labels.filter((l) => l?.name !== name);
  obj.labels.push({ name, value: String(value) });
}

function getLabel(obj, name) {
  const v = (obj.labels ?? []).find((l) => l?.name === name)?.value;
  return v == null ? undefined : String(v);
}

function prefixTitlePath(obj, prefix) {
  const p = String(prefix);
  let tp = [];
  if (Array.isArray(obj.titlePath)) tp = obj.titlePath.map(String);
  else if (typeof obj.titlePath === "string") tp = [obj.titlePath];
  else if (obj.titlePath != null) tp = [String(obj.titlePath)];
  if (tp[0] !== p) obj.titlePath = [p, ...tp];
}

async function stampAllureResults(dir, bucket) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith("-result.json"))
    .map((e) => path.join(dir, e.name));

  for (const file of files) {
    let raw;
    try {
      raw = await fs.readFile(file);
    } catch {
      continue;
    }

    const text = typeof raw === "string" ? raw : raw.toString("utf8");
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      continue;
    }

    const originalPackage = getLabel(json, "package");
    if (originalPackage) setLabel(json, "allure.originalPackage", originalPackage);
    if (Array.isArray(json.titlePath)) {
      setLabel(json, "allure.originalTitlePath", json.titlePath.join(" > "));
    }

    setLabel(json, "parentSuite", bucket);
    prefixTitlePath(json, bucket);
    setLabel(json, "epic", bucket);
    setLabel(json, "package", bucket);

    const tmp = file + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(json), "utf8");
    await fs.rename(tmp, file).catch(() => {});
  }
}

async function deleteInvalidJson(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => path.join(dir, e.name));

  for (const file of files) {
    try {
      const raw = await fs.readFile(file);
      const text = typeof raw === "string" ? raw : raw.toString("utf8");
      JSON.parse(text);
    } catch {
      await fs.rm(file, { force: true }).catch(() => {});
    }
  }
}

async function hasResults(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.some((e) => e.endsWith("-result.json"));
  } catch {
    return false;
  }
}

async function generateReport() {
  if (isGenerating) {
    pendingRegeneration = true;
    return;
  }

  isGenerating = true;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n🔄 [${timestamp}] Regenerating Allure report...`);

  try {
    // Check if we have any results
    const hasApiResults = await hasResults(RESULTS_API);
    const hasE2eResults = await hasResults(RESULTS_E2E);

    if (!hasApiResults && !hasE2eResults) {
      console.log("   ℹ️  No test results found yet");
      isGenerating = false;
      return;
    }

    // Stamp results with bucket names
    if (hasApiResults) {
      console.log("   📊 Processing API results...");
      await stampAllureResults(RESULTS_API, "API");
    }

    if (hasE2eResults) {
      console.log("   📊 Processing E2E results...");
      await stampAllureResults(RESULTS_E2E, "Frontend");
    }

    // Prepare merged directory
    await rm(MERGED);
    await mkdir(MERGED);

    // Preserve history for trend charts
    const historySrc = path.join(REPORT, "history");
    const historyDst = path.join(MERGED, "history");
    if (await fileExists(historySrc)) {
      await mkdir(historyDst);
      await copyDir(historySrc, historyDst);
    }

    // Merge results
    console.log("   🔀 Merging results...");
    if (hasApiResults) await copyDir(RESULTS_API, MERGED);
    if (hasE2eResults) await copyDir(RESULTS_E2E, MERGED);

    // Sanitize
    await deleteInvalidJson(MERGED);

    // Generate report atomically
    const REPORT_TMP = path.join(ROOT, ".allure/report-tmp");
    const REPORT_OLD = path.join(ROOT, ".allure/report-old");

    console.log("   📝 Generating report...");
    await rm(REPORT_TMP);
    await mkdir(REPORT_TMP);

    // Run allure generate
    await new Promise((resolve, reject) => {
      const proc = spawn(
        process.platform === "win32" ? "bunx" : "bunx",
        ["allure", "generate", "-o", REPORT_TMP, MERGED],
        {
          stdio: "pipe",
          shell: process.platform === "win32",
        }
      );

      let output = "";
      proc.stdout?.on("data", (data) => {
        output += data.toString();
      });
      proc.stderr?.on("data", (data) => {
        output += data.toString();
      });

      proc.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Allure generate failed: ${output}`));
        }
      });
    });

    // Atomic swap
    await rm(REPORT_OLD);
    try {
      await fs.rename(REPORT, REPORT_OLD);
    } catch {}
    await fs.rename(REPORT_TMP, REPORT);
    await rm(REPORT_OLD).catch(() => {});

    const doneTime = new Date().toLocaleTimeString();
    console.log(`✅ [${doneTime}] Report updated successfully!`);
    console.log(`   📊 View at: http://localhost:${PORT}`);
  } catch (error) {
    console.error(`❌ Report generation failed:`, error.message);
  } finally {
    isGenerating = false;

    // If another request came in during generation, process it
    if (pendingRegeneration) {
      pendingRegeneration = false;
      setTimeout(() => generateReport(), 1000);
    }
  }
}

function startServer() {
  console.log(`🚀 Starting Allure report server on port ${PORT}...`);

  const sirv = spawn(
    process.platform === "win32" ? "bunx" : "bunx",
    ["sirv", REPORT, "-p", String(PORT), "--single", "--dev"],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );

  serverProcess = sirv;

  sirv.on("error", (err) => {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  });

  sirv.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.log(`⚠️  Server exited with code ${code}`);
    }
  });

  console.log(`✅ Server started at http://localhost:${PORT}`);
}

function watchForChanges() {
  console.log("\n👀 Watching for test result changes...");

  // Debounce mechanism
  let timeout = null;
  const debounce = (fn, delay) => {
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  };

  const triggerRegeneration = debounce(() => {
    generateReport();
  }, 2000); // Wait 2 seconds after last change

  // Watch API results
  const watchApi = async () => {
    await mkdir(RESULTS_API);
    try {
      const watcher = watch(RESULTS_API, { recursive: false }, (event, filename) => {
        if (filename && filename.endsWith("-result.json")) {
          console.log(`   📝 API test completed: ${filename}`);
          triggerRegeneration();
        }
      });

      watcher.on("error", (err) => {
        console.warn("⚠️  API watcher error:", err.message);
      });
    } catch (err) {
      console.warn("⚠️  Could not watch API results:", err.message);
    }
  };

  // Watch E2E results
  const watchE2e = async () => {
    await mkdir(RESULTS_E2E);
    try {
      const watcher = watch(RESULTS_E2E, { recursive: false }, (event, filename) => {
        if (filename && filename.endsWith("-result.json")) {
          console.log(`   📝 E2E test completed: ${filename}`);
          triggerRegeneration();
        }
      });

      watcher.on("error", (err) => {
        console.warn("⚠️  E2E watcher error:", err.message);
      });
    } catch (err) {
      console.warn("⚠️  Could not watch E2E results:", err.message);
    }
  };

  watchApi();
  watchE2e();
}

async function ensureDirectories() {
  await mkdir(RESULTS_API);
  await mkdir(RESULTS_E2E);
  await mkdir(MERGED);
  await mkdir(REPORT);
}

async function main() {
  console.log("╔" + "═".repeat(58) + "╗");
  console.log("║" + " ".repeat(12) + "Allure Report Server" + " ".repeat(25) + "║");
  console.log("╚" + "═".repeat(58) + "╝");
  console.log("");

  // Ensure directories exist
  await ensureDirectories();

  // Generate initial report if results exist
  console.log("🔍 Checking for existing results...");
  await generateReport();

  // Start the HTTP server
  startServer();

  // Watch for changes
  watchForChanges();

  console.log("\n" + "═".repeat(60));
  console.log("✨ Allure server is ready!");
  console.log("═".repeat(60));
  console.log("");
  console.log("📊 Report URL: http://localhost:" + PORT);
  console.log("👀 Watching:   tests/api/allure-results");
  console.log("               tests/e2e/allure-results");
  console.log("");
  console.log("💡 Tips:");
  console.log("   - Run tests with: bun run test:api");
  console.log("   - Run E2E with:   bun run e2e");
  console.log("   - Reports auto-refresh on test completion");
  console.log("");
  console.log("Press Ctrl+C to stop the server");
  console.log("═".repeat(60) + "\n");

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Shutting down Allure server...");
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n\n🛑 Shutting down Allure server...");
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("❌ Server failed:", err);
  process.exit(1);
});
