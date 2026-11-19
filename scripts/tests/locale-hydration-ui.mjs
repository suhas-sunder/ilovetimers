import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = process.env.ILT_HYDRATION_REPORT_DIR || path.join(ROOT, "hydration-ui-report");
const PORT = Number(process.env.ILT_HYDRATION_TEST_PORT || 3105);
const ORIGIN = "http://127.0.0.1:" + PORT;
const routes = [
  "/utc-clock", "/current-local-time", "/12-hour-clock",
  "/24-hour-clock", "/roman-numeral-clock", "/golden-hour-clock",
  "/world-clock", "/time-zone-converter", "/sunrise-sunset-clock",
  "/astronomical-clock", "/online-alarm-clock", "/digital-clock",
];
const settings = [
  { locale: "en-US", timezoneId: "UTC" },
  { locale: "en-CA", timezoneId: "America/Toronto" },
  { locale: "fr-CA", timezoneId: "America/Toronto" },
  { locale: "en-GB", timezoneId: "Europe/London" },
  { locale: "en-AU", timezoneId: "Australia/Sydney" },
];
mkdirSync(OUT, { recursive: true });
async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const modulePath = process.env.ILT_PLAYWRIGHT_MODULE;
    if (!modulePath || !existsSync(modulePath)) {
      throw new Error("Set ILT_PLAYWRIGHT_MODULE to Playwright module path.");
    }
    return import(pathToFileURL(modulePath).href);
  }
}
async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    try { const r = await fetch(ORIGIN); if (r.ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error("SSR preview did not become ready");
}
const server = spawnStaticPreview({ root: ROOT, port: PORT });
let browser;
const results = [];
try {
  await waitForServer();
  const { chromium } = await loadPlaywright();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ILT_BROWSER_PATH || undefined,
    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
  });
  for (const setting of settings) {
    const context = await browser.newContext({
      locale: setting.locale,
      timezoneId: setting.timezoneId,
      viewport: { width: 390, height: 844 },
    });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => {
        errors.push("pageerror: " + error.message);
      });
      page.on("console", (message) => {
        if (message.type() === "error" && /hydration|react.*#(?:418|423|425)|Minified React/i.test(message.text())) {
          errors.push("console: " + message.text().slice(0, 250));
        }
      });
      let status = null, body = "";
      try {
        const response = await page.goto(ORIGIN + route, { waitUntil: "domcontentloaded", timeout: 20000 });
        status = response?.status();
        await page.waitForTimeout(400);
        body = (await page.locator("body").innerText({ timeout: 3000 })).slice(0, 160);
      } catch (e) {
        errors.push("navigation: " + String(e).slice(0, 400));
      }
      results.push({ ...setting, route, status, errors, body });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
const failures = results.filter((r) => r.status !== 200 || r.errors.length);
writeFileSync(path.join(OUT, "locale-hydration-results.json"), JSON.stringify({
  routes: routes.length, localeSettings: settings, cases: results.length,
  failures: failures.length, results,
}, null, 2));
console.log("Locale/timezone hydration checked: " + results.length + " cases; failed " + failures.length + ".");
failures.slice(0, 25).forEach((f) => console.error(JSON.stringify({
  route: f.route, locale: f.locale, timezone: f.timezoneId, status: f.status, errors: f.errors,
})));
if (failures.length) process.exitCode = 1;
