import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = Number(process.env.ILT_UI_GEOMETRY_PORT || 3094);
const BASE = `http://127.0.0.1:${PORT}`;
const CAPTURE_DIR = process.env.ILT_UI_CAPTURE_DIR || null;
const CASES = [
  ["/online-timer", "Timer settings"],
  ["/silent-timer", "Silent timer settings"],
  ["/kitchen-timer", "Timer settings"],
  ["/tea-timer", "Timer settings"],
  ["/rest-timer", "Settings"],
  ["/alarm-timer", "Settings"],
  ["/sleep-timer", "Quiet settings"],
  ["/pomodoro-timer", "Pomodoro settings"],
  ["/hiit-timer", "Interval settings"],
  ["/tabata-timer", "Tabata settings"],
  ["/pizza-timer", "Timer settings"],
  ["/interval-timer", "Interval steps"],
  ["/classroom-timer", "Classroom settings"],
];

async function playwrightModule() {
  try { return await import("playwright"); }
  catch {
    const modulePath = process.env.ILT_PLAYWRIGHT_MODULE;
    if (!modulePath || !existsSync(modulePath)) {
      throw new Error("Playwright unavailable. Set ILT_PLAYWRIGHT_MODULE to playwright/index.mjs.");
    }
    return import(pathToFileURL(modulePath).href);
  }
}

async function awaitPreview() {
  for (let i = 0; i < 120; i++) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Built preview not available; run npm run build first.");
}

async function fieldGeometry(form) {
  return form.evaluate((container) => {
    const rect = (element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, right: r.right, top: r.top, bottom: r.bottom,
        width: r.width, height: r.height };
    };
    return {
      form: rect(container),
      elements: [...container.querySelectorAll("input, select, button")]
        .filter((element) => {
          const s = getComputedStyle(element);
          return s.display !== "none" && s.visibility !== "hidden";
        })
        .map((element) => ({
          label: element.getAttribute("aria-label") ||
            element.closest("label")?.innerText?.trim().slice(0, 80) ||
            element.textContent?.trim().slice(0, 80) || element.tagName,
          type: element.tagName,
          rect: rect(element),
        })),
    };
  });
}

async function checkSetButtonAlignment(page, route, width) {
  if (!["/online-timer", "/silent-timer"].includes(route)) return;
  const form = page.locator("section.timer-settings-panel").first();
  const input = await form.getByLabel("Custom time").boundingBox();
  const button = await form.getByRole("button", { name: "Set", exact: true }).boundingBox();
  assert.ok(input && button, `Missing Set/input on ${route} ${width}`);
  if (width >= 640) {
    assert.ok(Math.abs((input.y + input.height) - (button.y + button.height)) <= 4,
      `Set not aligned with input: ${route} ${width}: ${JSON.stringify({input, button})}`);
  } else {
    assert.ok(button.y >= input.y + input.height,
      `Mobile Set overlaps input: ${route} ${width}`);
  }
}

const { chromium } = await playwrightModule();
const server = spawnStaticPreview({ root: ROOT, port: PORT });
let browser;
let total = 0;
const failures = [];
const viewports = [390, 768, 1280, 1920];

try {
  await awaitPreview();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ILT_BROWSER_PATH || undefined,
    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
  });
  for (const [route, heading] of CASES) {
    for (const width of viewports) {
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
          await page.evaluate((next) => localStorage.setItem("ilt-theme-mode", next), theme);
          await page.reload({ waitUntil: "domcontentloaded" });
          await page.evaluate(() => document.fonts.ready);
          assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
          const panel = page.locator("section.timer-settings-panel")
            .filter({ has: page.getByRole("heading", { name: heading, exact: true }) }).first();
          assert.equal(await panel.count(), 1, `Missing settings panel on ${route}`);
          const geometry = await fieldGeometry(panel);
          const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          assert.ok(scrollWidth <= viewportWidth + 2,
            `Horizontal overflow ${route} ${width}/${theme}: ${scrollWidth} > ${viewportWidth}`);
          assert.ok(geometry.form.width <= viewportWidth + 2,
            `Settings width exceeds viewport: ${route} ${width}/${theme}`);
          for (const {label, rect} of geometry.elements) {
            assert.ok(rect.width >= 1 && rect.height >= 1 && rect.x >= -2 && rect.right <= viewportWidth + 2,
              `Clipped control ${route} ${width}/${theme} ${label}: ${JSON.stringify(rect)}`);
          }
          await checkSetButtonAlignment(page, route, width);
          assert.deepEqual(errors, [], `Runtime errors on ${route} ${width}/${theme}`);
          if (CAPTURE_DIR) {
            mkdirSync(CAPTURE_DIR, { recursive: true });
            await page.screenshot({
              path: path.join(CAPTURE_DIR, `${route.slice(1)}-${width}-${theme}.png`),
              fullPage: true,
              animations: "disabled",
            });
          }
          total++;
        } catch (e) {
          failures.push(`${route} ${width}/${theme}: ${e.message}`);
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}

if (failures.length) {
  console.error("Rendered page geometry FAIL:");
  failures.forEach((f) => console.error("- " + f));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${total} rendered cases across ${CASES.length} individually checked routes, ${viewports.length} widths and two themes.`);
}
