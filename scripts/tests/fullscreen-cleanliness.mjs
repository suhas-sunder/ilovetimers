import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PORT = Number(process.env.ILT_FULLSCREEN_PORT || 3116);
const BASE = "http://127.0.0.1:" + PORT;
const CAPTURE_DIR = process.env.ILT_FULLSCREEN_CAPTURES || null;
const routesFile = readFileSync(path.join(ROOT, "app/routes.ts"), "utf8");
const routePaths = new Map(
  [...routesFile.matchAll(/\broute\(\s*["']([^"']+)["']\s*,\s*["']([^"']+\.tsx)["']/g)]
    .map((m) => ["/" + m[1], m[2]]),
);
const manifest = JSON.parse(readFileSync(path.join(ROOT, "docs/route-architecture-manifest.json"), "utf8"));
const sharedPresetRoutes = new Set(["/1-minute-timer", "/5-minute-timer",
  "/10-minute-timer", "/15-minute-timer", "/30-minute-timer"]);
const allCandidates = manifest.filter((item) => {
  if (item.indexability === "redirect") return false;
  if (sharedPresetRoutes.has(item.sourcePath)) return true;
  const file = routePaths.get(item.sourcePath);
  if (!file) return false;
  const filename = path.join(ROOT, "app", file);
  return existsSync(filename) && readFileSync(filename, "utf8").includes("FullscreenBottomBar");
}).map((item) => item.sourcePath);
const LIMIT = process.env.ILT_FULLSCREEN_ROUTES?.split(",").filter(Boolean) ?? null;
const routes = LIMIT ? allCandidates.filter((route) => LIMIT.includes(route)) : allCandidates;
if (!routes.length) throw new Error("No fullscreen timer routes identified.");
const failures = [];
const overflowWarnings = [];
let completed = 0;

async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const modulePath = process.env.ILT_PLAYWRIGHT_MODULE;
    if (!modulePath || !existsSync(modulePath)) throw new Error("Playwright unavailable");
    return import(pathToFileURL(modulePath).href);
  }
}
async function ready() {
  for (let i = 0; i < 130; i++) {
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Vite preview failed to start; run npm run build first.");
}
async function enterFullscreen(page) {
  const launch = page.getByRole("button", { name: /fullscreen/i });
  let clickedFullscreenControl = false;
  for (let i = 0; i < await launch.count(); i++) {
    const candidate = launch.nth(i);
    if (await candidate.isVisible() && await candidate.isEnabled()) {
      await candidate.click({ timeout: 5000 });
      clickedFullscreenControl = true;
      break;
    }
  }
  // Never press F immediately after clicking: requestFullscreen resolves
  // asynchronously and F can toggle it back off before React observes it.
  if (!clickedFullscreenControl) {
    const frame = page.locator("[data-fullscreen-frame]").first();
    if (await frame.count()) await frame.focus();
    await page.keyboard.press("f");
  }
  await page.waitForFunction(() => Boolean(document.fullscreenElement), null, { timeout: 5500 });
}
const { chromium } = await loadPlaywright();
const server = spawnStaticPreview({ root: ROOT, port: PORT });
let browser;
try {
  await ready();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ILT_BROWSER_PATH || undefined,
    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
  });
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    try {
      for (const route of routes) {
        // A separate document per route is required. Reusing one page caused
        // late fullscreenchange events from the prior route to tear down the
        // next route's fullscreen element while it was being inspected.
        const page = await context.newPage();
        page.setDefaultTimeout(4500);
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        try {
          const response = await page.goto(BASE + route, { waitUntil: "load", timeout: 12000 });
          assert.equal(response?.status(), 200, "Not HTTP 200");
          await page.waitForTimeout(100);
          await enterFullscreen(page);
          await page.waitForTimeout(150); // let React render the fullscreen-only controls
          const result = await page.evaluate(() => {
            const root = document.fullscreenElement;
            if (!root) return { missing: true };
            const bar = root.querySelector("[data-fullscreen-bottombar]");
            const actions = "button, input, select, textarea, a[href], [role='button']";
            const visible = (element) => {
              if (!(element instanceof HTMLElement)) return false;
              const css = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return css.display !== "none" && css.visibility !== "hidden" &&
                rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;
            };
            const textOnly = bar?.querySelectorAll(
              ":scope > div > :is(div, p):not(:has(" + actions + "))," +
              ":scope > div > :is(div, p) > :is(div, p):not(:has(" + actions + "))," +
              ":scope > div > :is(div, p) > :is(div, p) > :is(div, p):not(:has(" + actions + "))"
            );
            const clutter = [...(textOnly ?? [])].filter(visible)
              .map((e) => e.textContent?.trim().slice(0, 90));
            // Independently check every visible loose text node. Do not only
            // assert on the same CSS selectors used by the implementation.
            const visibleLooseText = [];
            if (bar) {
              const walker = document.createTreeWalker(bar, NodeFilter.SHOW_TEXT);
              let textNode;
              while ((textNode = walker.nextNode())) {
                const value = textNode.textContent?.trim();
                const parent = textNode.parentElement;
                if (value && parent && !parent.closest("button, label, a[href], [role='button']") && visible(parent)) {
                  visibleLooseText.push(value.slice(0, 90));
                }
              }
            }
            const shortcutClutter = [...root.querySelectorAll(".timer-shortcut-hint")].filter(visible).length;
            const actionable = bar ? [...bar.querySelectorAll(actions)] : [];
            const visibleActionCount = actionable.filter(visible).length;
            const header = root.querySelector("[data-fullscreen-topbar]");
            const headerExit = header?.querySelector("button");
            const barVisible = bar ? visible(bar) : false;
            return {
              missing: false, hasHeader: visible(header), hasExit: visible(headerExit),
              barVisible, actionCount: actionable.length, visibleActionCount,
              clutter, visibleLooseText, shortcutClutter,
              scrollWidth: root.scrollWidth, clientWidth: document.documentElement.clientWidth,
            };
          });
          assert.equal(result.missing, false, "Fullscreen element disappeared before inspection");
          if (result.hasHeader) assert.ok(result.hasExit, "Fullscreen header missing Exit button");
          assert.deepEqual(result.clutter, [], "Text-only rows are visible");
          assert.deepEqual(result.visibleLooseText, [], "Loose fullscreen text is visible: " + JSON.stringify(result.visibleLooseText));
          assert.equal(result.shortcutClutter, 0, "Shortcut hint leaked into fullscreen");
          if (result.actionCount === 0) {
            assert.equal(result.barVisible, false, "Empty fullscreen footer overlay remains");
          } else {
            assert.ok(result.visibleActionCount > 0, "All fullscreen footer controls hidden");
          }
          if (result.scrollWidth > result.clientWidth + 2) {
            overflowWarnings.push(route + " " + width + ": " + result.scrollWidth + "/" + result.clientWidth);
          }
          assert.equal(errors.length, 0, "Runtime errors: " + errors.join(" | "));
          if (CAPTURE_DIR && ["/egg-timer", "/countdown-timer", "/chess-clock",
            "/visual-timer", "/12-hour-clock", "/online-timer", "/hiit-timer"].includes(route)) {
            mkdirSync(CAPTURE_DIR, { recursive: true });
            await page.screenshot({
              path: path.join(CAPTURE_DIR, route.slice(1) + "-" + width + ".png"),
              animations: "disabled",
            });
          }
          completed++;
          if (completed % 16 === 0) console.log("Fullscreen checks completed: " + completed);
        } catch (error) {
          failures.push(route + " " + width + ": " + error.message);
          console.error("Fullscreen check failed: " + route + " " + width + ": " + error.message);
        } finally {
          await page.close().catch(() => {});
        }
        if (failures.length >= 12) break;
      }
    } finally {
      await context.close();
    }
    if (failures.length >= 12) break;
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
if (overflowWarnings.length) {
  console.warn("Fullscreen width observations (" + overflowWarnings.length + "):");
  overflowWarnings.slice(0, 50).forEach((w) => console.warn("- " + w));
}
if (failures.length) {
  console.error("Fullscreen cleanliness FAIL (" + failures.length + "):");
  failures.slice(0, 40).forEach((f) => console.error("- " + f));
  process.exitCode = 1;
} else {
  console.log("PASS: " + completed + " real fullscreen checks on " + routes.length +
    " routes at 390px and 1280px; hints hidden, controls preserved. Width observations listed separately.");
}
