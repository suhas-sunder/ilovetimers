import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ROUTES = JSON.parse(readFileSync(path.join(ROOT, "docs/route-architecture-manifest.json"), "utf8"))
  .filter((entry) => entry.indexability !== "redirect")
  .map((entry) => entry.sourcePath);
const PORT = Number(process.env.ILT_UI_INTERACTIONS_PORT || 3110);
const BASE = "http://127.0.0.1:" + PORT;
const failures = [];
let passes = 0;

async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const configured = process.env.ILT_PLAYWRIGHT_MODULE;
    if (!configured || !existsSync(configured)) {
      throw new Error("Playwright is unavailable; provide ILT_PLAYWRIGHT_MODULE");
    }
    return import(pathToFileURL(configured).href);
  }
}
async function awaitPreview() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Static preview did not start");
}

const server = spawnStaticPreview({ root: ROOT, port: PORT });
let browser;
try {
  await awaitPreview();
  const { chromium } = await loadPlaywright();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ILT_BROWSER_PATH || undefined,
    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
  });
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    let currentRoute = "";
    page.on("pageerror", (error) => runtimeErrors.push(currentRoute + ": " + error.message));
    try {
      for (const route of ROUTES) {
        currentRoute = route;
        runtimeErrors.length = 0;
        try {
          const response = await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
          assert.equal(response?.status(), 200, "Expected HTTP 200");
          await page.locator('header a[aria-label="iLoveTimers home"]').first().waitFor();
          assert.ok(await page.locator("header").first().getByText("i💛Timers.com", { exact: true }).isVisible(),
            "Correct public brand not visible in header");
          assert.ok((await page.locator("footer").first().innerText()).includes("i💛Timers.com"),
            "Correct public brand missing from footer");
          await page.getByRole("button", { name: "Switch to dark mode" }).click();
          assert.equal(await page.locator("html").getAttribute("data-theme"), "dark",
            "Theme toggle did not select dark");
          await page.getByRole("button", { name: "Switch to light mode" }).click();
          assert.equal(await page.locator("html").getAttribute("data-theme"), "light",
            "Theme toggle did not restore light");
          if (width < 1024) {
            const open = page.getByRole("button", { name: "Open menu" });
            await open.click();
            await page.locator("#mobile-nav").waitFor({ state: "visible" });
            const close = page.getByRole("button", { name: "Close menu" }).first();
            await close.click();
            await page.locator("#mobile-nav").waitFor({ state: "hidden" });
          } else {
            const more = page.getByRole("button", { name: /More/ });
            await more.click();
            await page.locator("#timer-directory-menu").waitFor({ state: "visible" });
            await more.click();
            await page.locator("#timer-directory-menu").waitFor({ state: "hidden" });
          }
          assert.equal(runtimeErrors.length, 0, "Browser errors: " + runtimeErrors.join(" | "));
          passes++;
        } catch (error) {
          failures.push(width + " " + route + ": " + error.message);
        }
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}

if (failures.length) {
  console.error("Navigation/brand/theme interaction failures (" + failures.length + "):");
  failures.slice(0, 60).forEach((msg) => console.error("- " + msg));
  process.exitCode = 1;
} else {
  console.log("PASS: " + passes + " branded route/theme/navigation interaction cases on " +
    ROUTES.length + " routes at mobile and desktop widths.");
}
