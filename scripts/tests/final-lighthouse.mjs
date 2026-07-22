import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = Number(process.env.ILT_FINAL_LIGHTHOUSE_PORT || 3050);
const BASE = `http://127.0.0.1:${PORT}`;
const QUALITY_PATH = path.join(ROOT, "docs/final-performance-accessibility.json");
const CHROME = process.env.ILT_BROWSER_PATH || path.join(
  os.homedir(),
  "AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe",
);
const routes = [
  { family: "homepage", path: "/" },
  { family: "basic timer", path: "/countdown-timer" },
  { family: "structured timer", path: "/interval-timer" },
  { family: "calculator", path: "/time-calculator" },
  { family: "world time", path: "/world-clock" },
  { family: "guide", path: "/guides/how-browser-timers-measure-time" },
  { family: "directory", path: "/sitemap" },
  { family: "noindex utility", path: "/1-minute-timer" },
];

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Production server did not start for Lighthouse.");
}

function metric(report, id) {
  const audit = report.audits?.[id];
  return audit ? { value: audit.numericValue ?? null, displayValue: audit.displayValue ?? null, score: audit.score ?? null } : null;
}

if (!existsSync(CHROME)) throw new Error(`Chromium executable not found at ${CHROME}`);
const server = spawn(process.execPath, ["server.js"], {
  cwd: ROOT,
  env: { ...process.env, NODE_ENV: "production", PORT: String(PORT) },
  stdio: "ignore",
});

const reuseReports = process.env.ILT_LIGHTHOUSE_REUSE_REPORTS === "1";
const priorQuality = JSON.parse(await readFile(QUALITY_PATH, "utf8"));
const results = reuseReports ? [...(priorQuality.performance?.lighthouse?.results || [])] : [];
const failures = [];
const cleanupWarnings = [];
try {
  await waitForServer();
  for (const formFactor of ["mobile", "desktop"]) {
    for (const route of routes) {
      if (results.some((result) => result.formFactor === formFactor && result.route === route.path)) continue;
      const slug = route.path === "/" ? "home" : route.path.slice(1).replaceAll("/", "-");
      const prefix = `ilt-lighthouse-${slug}-${formFactor}-`;
      const reusable = reuseReports
        ? (await readdir(os.tmpdir())).find((name) => name.startsWith(prefix) && name.endsWith(".json"))
        : null;
      const output = reusable
        ? path.join(os.tmpdir(), reusable)
        : path.join(os.tmpdir(), `${prefix}${process.pid}.json`);
      const args = [
        "--yes",
        "lighthouse",
        `${BASE}${route.path}`,
        "--quiet",
        "--output=json",
        `--output-path=${output}`,
        `--chrome-path=${CHROME}`,
        "--chrome-flags=--headless --no-sandbox --disable-gpu --disable-dev-shm-usage",
        "--only-categories=performance,accessibility,best-practices,seo",
      ];
      if (formFactor === "desktop") args.push("--preset=desktop");
      let run = { status: 0, stderr: "" };
      if (!reusable) {
        console.log(`Lighthouse ${formFactor} ${route.path}`);
        run = spawnSync("npx.cmd", args, { cwd: ROOT, encoding: "utf8", timeout: 3 * 60 * 1000, shell: process.platform === "win32" });
      } else {
        console.log(`Merging completed Lighthouse report ${formFactor} ${route.path}`);
      }
      if (!existsSync(output)) {
        failures.push(`${formFactor} ${route.path}: ${run.stderr || `exit ${run.status}`}`);
        continue;
      }
      if (run.status !== 0) cleanupWarnings.push(`${formFactor} ${route.path}: Lighthouse returned ${run.status} after writing a complete report; stderr was ${run.stderr || "not provided"}`);
      const report = JSON.parse(await readFile(output, "utf8"));
      const result = {
        family: route.family,
        route: route.path,
        formFactor,
        lighthouseVersion: report.lighthouseVersion,
        fetchTime: report.fetchTime,
        scores: Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)])),
        metrics: {
          firstContentfulPaint: metric(report, "first-contentful-paint"),
          largestContentfulPaint: metric(report, "largest-contentful-paint"),
          cumulativeLayoutShift: metric(report, "cumulative-layout-shift"),
          totalBlockingTime: metric(report, "total-blocking-time"),
          speedIndex: metric(report, "speed-index"),
          interactive: metric(report, "interactive"),
        },
        resources: report.audits?.["resource-summary"]?.details?.items || [],
        longTasks: report.audits?.["long-tasks"]?.details?.items?.length || 0,
        thirdPartySummary: report.audits?.["third-party-summary"]?.details?.items || [],
      };
      const lcp = result.metrics.largestContentfulPaint?.value ?? Infinity;
      const cls = result.metrics.cumulativeLayoutShift?.value ?? Infinity;
      const tbt = result.metrics.totalBlockingTime?.value ?? Infinity;
      result.thresholdStatus = lcp <= 2500 && cls <= 0.1 && tbt <= 200
        ? "good lab thresholds"
        : lcp <= 4000 && cls <= 0.25 && tbt <= 600
          ? "needs improvement but not a material poor-threshold regression"
          : "poor threshold";
      results.push(result);
      await rm(output, { force: true });
    }
  }
} finally {
  server.kill("SIGTERM");
}

const quality = JSON.parse(await readFile(QUALITY_PATH, "utf8"));
const poor = results.filter((result) => result.thresholdStatus === "poor threshold");
quality.performance.lighthouse = {
  status: failures.length === 0 && results.length === routes.length * 2 && poor.length === 0 ? "passed" : "failed",
  tool: `Lighthouse ${results[0]?.lighthouseVersion || "unknown"}`,
  commandEnvironment: "Local React Router production server, bundled Chromium 1217, Lighthouse simulated mobile and desktop, no field data.",
  thresholds: {
    officialCoreWebVitalsGood: { lcpMilliseconds: 2500, cls: 0.1, inpMilliseconds: 200 },
    labResponsivenessProxy: { metric: "Total Blocking Time", goodMilliseconds: 200, poorMilliseconds: 600 },
    interpretation: "Lighthouse cannot measure field INP; TBT is used only as a lab proxy. Core Web Vitals status requires 75th-percentile field data after deployment.",
  },
  results,
  poorThresholdResults: poor.map((result) => `${result.formFactor} ${result.route}`),
  failures,
  cleanupWarnings,
};
await writeFile(QUALITY_PATH, `${JSON.stringify(quality, null, 2)}\n`);

if (quality.performance.lighthouse.status !== "passed") {
  console.error(`Final Lighthouse suite failed (${results.length} reports, ${poor.length} poor-threshold reports, ${failures.length} execution failures).`);
  process.exitCode = 1;
} else {
  console.log(`Final Lighthouse suite passed (${results.length} reports; no poor-threshold LCP, CLS, or TBT result).`);
}
