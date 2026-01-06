import { spawn, spawnSync } from "node:child_process";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import waitOn from "wait-on";

const RESULTS_E2E = "tests/e2e/allure-results";
const RESULTS_API = "tests/api/allure-results";
const MERGED = ".allure/merged-results";
const REPORT = ".allure/report";

// Dev server URLs
const DEV_SERVER_URL = "http://localhost:3000/";

// Commands - use dev server and run tests directly with bunx
const API_TEST_CMD = ["bunx", ["jest", "tests/api/"]];
const E2E_TEST_CMD = ["bun", ["run", "e2e"]];

function resolveCmd(cmd) {
  if (process.platform !== "win32") return cmd;

  // If cmd already has an extension, use it as-is
  if (/\.(exe|cmd|bat)$/i.test(cmd)) return cmd;

  // Try common Windows command shims
  const candidates = [`${cmd}.exe`, `${cmd}.cmd`, `${cmd}.bat`];
  for (const c of candidates) {
    // If it's on PATH, spawn can still resolve it even if we can't check existsSync.
    // But if it's a local path, existsSync helps.
    if (existsSync(c)) return c;
  }
  return cmd; // let Windows PATH resolution handle it
}

async function rm(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}
async function mkdir(dir) {
  await fs.mkdir(dir, { recursive: true });
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
  const entries = await fs
    .readdir(src, { withFileTypes: true })
    .catch(() => []);
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) {
      await mkdir(d);
      await copyDir(s, d);
    } else if (e.isFile()) {
      await fs.copyFile(s, d);
    }
  }
}

// returns exit code (does NOT throw)
function runCapture(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(resolveCmd(cmd), args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...opts,
    });
    p.on("exit", (code) => resolve(code ?? 1));
  });
}

// throws on non-zero (use for report generation)
async function runStrict(cmd, args, opts = {}) {
  const code = await runCapture(cmd, args, opts);
  if (code !== 0) throw new Error(`${cmd} exited ${code}`);
}

// Windows-safe: kill a process tree by PID
function killTree(pid) {
  if (!pid) return;
  try {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      shell: false,
    });
  } catch {
    // ignore
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

  // titlePath is usually an array, but be defensive
  let tp = [];
  if (Array.isArray(obj.titlePath)) tp = obj.titlePath.map(String);
  else if (typeof obj.titlePath === "string") tp = [obj.titlePath];
  else if (obj.titlePath != null) tp = [String(obj.titlePath)];

  if (tp[0] !== p) obj.titlePath = [p, ...tp];
}

async function stampAllureResults(dir, bucket) {
  const entries = await fs
    .readdir(dir, { withFileTypes: true })
    .catch(() => []);
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith("-result.json"))
    .map((e) => path.join(dir, e.name));

  for (const file of files) {
    let raw;
    try {
      raw = await fs.readFile(file); // Buffer / NonSharedBuffer
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

    // Preserve original info (optional but handy)
    const originalPackage = getLabel(json, "package");
    if (originalPackage)
      setLabel(json, "allure.originalPackage", originalPackage);

    if (Array.isArray(json.titlePath)) {
      setLabel(json, "allure.originalTitlePath", json.titlePath.join(" > "));
    }

    // ✅ This shows up in the test detail panel
    setLabel(json, "parentSuite", bucket);

    // ✅ This makes the LEFT Overview/Results tree start with Frontend / API
    prefixTitlePath(json, bucket);

    // Optional: also makes grouping obvious in other views
    setLabel(json, "epic", bucket);

    // Optional: if your Results tree is grouping by "package" in your Allure build,
    // this forces that too:
    setLabel(json, "package", bucket);

    const tmp = file + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(json), "utf8");
    await fs.rename(tmp, file);
  }
}

async function deleteInvalidJson(dir) {
  const entries = await fs
    .readdir(dir, { withFileTypes: true })
    .catch(() => []);
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => path.join(dir, e.name));

  for (const file of files) {
    try {
      const raw = await fs.readFile(file);
      const text = typeof raw === "string" ? raw : raw.toString("utf8");
      JSON.parse(text);
    } catch {
      // Malformed JSON -> remove it so Allure doesn't choke
      await fs.rm(file, { force: true });
    }
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║            QA Test Suite (Dev Mode)                     ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");

  // Check if dev server is running
  console.log("🔍 Checking if dev server is running on port 3000...");
  try {
    await waitOn({
      resources: [DEV_SERVER_URL],
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 500,
    });
    console.log("✅ Dev server is running!\n");
  } catch {
    console.error("❌ Dev server is NOT running!");
    console.error("\nPlease start the dev server first:");
    console.error("  Terminal 1: bun run dev");
    console.error("\nThen run this script again.");
    process.exit(1);
  }

  // Clean per-suite results to avoid stale leftovers
  await rm(RESULTS_E2E);
  await rm(RESULTS_API);

  // ---- 1) Run API tests (Jest) ----
  console.log("📦 Running API tests (Jest)...");
  console.log("═".repeat(60));
  const apiCode = await runCapture(API_TEST_CMD[0], API_TEST_CMD[1]);

  if (apiCode === 0) {
    console.log("✅ API tests passed!\n");
  } else {
    console.log("⚠️  Some API tests failed (will still generate report)\n");
  }

  // Stamp API results BEFORE merge
  await stampAllureResults(RESULTS_API, "API");

  // ---- 2) Run E2E tests (Playwright) ----
  console.log("🌐 Running E2E tests (Playwright)...");
  console.log("═".repeat(60));
  const e2eCode = await runCapture(E2E_TEST_CMD[0], E2E_TEST_CMD[1]);

  if (e2eCode === 0) {
    console.log("✅ E2E tests passed!\n");
  } else {
    console.log("⚠️  Some E2E tests failed (will still generate report)\n");
  }

  // Stamp Frontend results BEFORE merge
  await stampAllureResults(RESULTS_E2E, "Frontend");

  // ---- 3) Merge results (even if tests failed) ----
  console.log("🔀 Merging test results...");
  await rm(MERGED);
  await mkdir(MERGED);

  // Preserve history between runs (nice trend charts)
  const historySrc = path.join(REPORT, "history");
  const historyDst = path.join(MERGED, "history");
  if (await fileExists(historySrc)) {
    await mkdir(historyDst);
    await copyDir(historySrc, historyDst);
  }

  // Copy stamped results into merged folder
  await copyDir(RESULTS_API, MERGED);
  await copyDir(RESULTS_E2E, MERGED);

  // ✅ sanitize merged results
  await deleteInvalidJson(MERGED);
  console.log("✅ Results merged!\n");

  // ---- 4) Generate ONE report (atomic swap) ----
  console.log("📊 Generating Allure report...");
  const REPORT_TMP = path.join(
    process.env.TEMP || "C:\\temp",
    `allure-report-${Date.now()}`,
  );
  const REPORT_OLD = ".allure/report-old";

  await rm(REPORT_TMP);
  // allure will create REPORT_TMP
  await runStrict("bunx", ["allure", "generate", "-o", REPORT_TMP, MERGED]);

  // Swap directories: report -> old, tmp -> report
  await rm(REPORT_OLD);
  try {
    await fs.rename(REPORT, REPORT_OLD);
  } catch {
    // ignore if REPORT doesn't exist yet
  }

  // Move from C: temp to D: project (fs.rename might fail across drives, so use copy + delete)
  await mkdir(REPORT);
  await copyDir(REPORT_TMP, REPORT);
  await rm(REPORT_TMP);

  // Best-effort cleanup (ignore failures on Windows)
  await rm(REPORT_OLD).catch(() => {});

  console.log("✅ Report generated!\n");

  // ---- 5) Final summary ----
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                    QA Summary                            ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(
    `📦 API Tests:      ${apiCode === 0 ? "✅ PASSED" : "❌ FAILED"}`,
  );
  console.log(
    `🌐 E2E Tests:      ${e2eCode === 0 ? "✅ PASSED" : "⚠️  FAILED (or no tests)"}`,
  );
  console.log("");
  console.log("📊 View the Allure report:");
  console.log("   bun run qa:serve");
  console.log("   Then open: http://localhost:5252");
  console.log("");

  const finalCode = apiCode !== 0 || e2eCode !== 0 ? 1 : 0;

  if (finalCode !== 0) {
    console.log("⚠️  Some tests failed. Check the report for details.");
  } else {
    console.log("🎉 All tests passed!");
  }

  process.exit(finalCode);
}

main().catch((e) => {
  console.error("❌ QA script failed:", e);
  process.exit(1);
});
