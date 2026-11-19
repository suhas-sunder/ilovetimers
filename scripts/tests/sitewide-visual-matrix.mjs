import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(readFileSync(path.join(ROOT, "docs/route-architecture-manifest.json"), "utf8"));
const routes = manifest.filter((item) => item.indexability !== "redirect").map((item) => item.sourcePath);
const PORT = Number(process.env.ILT_VISUAL_INVENTORY_PORT || 3097);
const BASE = "http://127.0.0.1:" + PORT;
const DEST = process.env.ILT_VISUAL_INVENTORY_DIR || path.join(ROOT, "ui-inventory");
const WIDTHS = [390, 1440];
const THEMES = ["light", "dark"];
const results = [];
const fatal = [];

mkdirSync(DEST, { recursive: true });

async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const modulePath = process.env.ILT_PLAYWRIGHT_MODULE;
    if (!modulePath || !existsSync(modulePath)) {
      throw new Error("Playwright unavailable. Configure ILT_PLAYWRIGHT_MODULE or install playwright in runner.");
    }
    return import(pathToFileURL(modulePath).href);
  }
}
async function ready() {
  for (let i = 0; i < 130; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Static preview was not available.");
}
function slug(route) {
  return route === "/" ? "home" : route.replace(/^\/+/, "").replaceAll("/", "__").replaceAll(/[^a-zA-Z0-9_-]/g, "_");
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
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      await context.addInitScript((selected) => {
        try { localStorage.setItem("ilt-theme-mode", selected); } catch {}
      }, theme);
      const page = await context.newPage();
      let pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      for (const route of routes) {
        pageErrors = [];
        const record = {
          route, width, theme, status: null, h1Count: 0,
          documentWidth: null, viewportWidth: width, overflowPx: 0,
          clippedControls: [], oversizedToggles: [], runtimeErrors: [],
          topScreenshot: null, settingsScreenshot: null, screenshotError: null,
        };
        try {
          const response = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 20000 });
          record.status = response?.status() ?? 0;
          await page.evaluate(() => document.fonts.ready);
          const dom = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const controls = [...document.querySelectorAll("button, input, select, textarea, [role='button']")];
            const visible = (node) => {
              const style = getComputedStyle(node);
              const box = node.getBoundingClientRect();
              return style.display !== "none" && style.visibility !== "hidden" &&
                box.width > 0 && box.height > 0 && style.opacity !== "0";
            };
            const clipped = controls.filter(visible).filter((node) => {
              const r = node.getBoundingClientRect();
              return r.left < -4 || r.right > vw + 4;
            }).slice(0, 20).map((node) => ({
              tag: node.tagName, label: node.getAttribute("aria-label") ||
                node.textContent?.trim().slice(0, 45) ||
                node.closest("label")?.innerText?.trim().slice(0, 45) || "",
              left: Math.round(node.getBoundingClientRect().left),
              right: Math.round(node.getBoundingClientRect().right),
            }));
            const oversized = [...document.querySelectorAll("label")]
              .filter((label) => label.querySelector('input[type="checkbox"]'))
              .filter(visible)
              .map((label) => {
                const s = getComputedStyle(label);
                const children = [...label.children];
                const intrinsic = children.reduce((a, child) => a + child.getBoundingClientRect().width, 0) +
                  parseFloat(s.paddingLeft || "0") + parseFloat(s.paddingRight || "0") +
                  (parseFloat(s.columnGap) || 0) * Math.max(0, children.length - 1);
                const actual = label.getBoundingClientRect().width;
                return { label: label.innerText?.trim().slice(0, 50) || "toggle", width: Math.round(actual), extra: Math.round(actual - intrinsic) };
              }).filter((item) => item.extra > 35).slice(0, 20);
            return {
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: vw,
              h1Count: document.querySelectorAll("h1").length,
              clippedControls: clipped,
              oversizedToggles: oversized,
              theme: document.documentElement.getAttribute("data-theme"),
            };
          });
          Object.assign(record, dom);
          record.overflowPx = Math.max(0, record.documentWidth - record.viewportWidth);
          record.runtimeErrors = pageErrors.slice(0, 15);
          const baseName = slug(route) + "-" + width + "-" + theme;
          const topFile = "top-" + baseName + ".jpg";
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({
            path: path.join(DEST, topFile),
            type: "jpeg", quality: 75, fullPage: false, animations: "disabled",
          });
          record.topScreenshot = topFile;
          if (theme === "light") {
            const panel = page.locator("section.timer-settings-panel").first();
            if (await panel.count()) {
              try {
                await panel.scrollIntoViewIfNeeded({ timeout: 3000 });
                const settingsFile = "settings-" + baseName + ".jpg";
                await page.screenshot({
                  path: path.join(DEST, settingsFile),
                  type: "jpeg", quality: 75, fullPage: false, animations: "disabled",
                });
                record.settingsScreenshot = settingsFile;
              } catch (err) {
                record.screenshotError = "Could not capture settings: " + String(err).slice(0, 180);
              }
            }
          }
          if (record.status !== 200 || record.h1Count !== 1 || record.overflowPx > 2 || record.runtimeErrors.length) {
            fatal.push(record);
          }
        } catch (err) {
          record.error = String(err).slice(0, 500);
          fatal.push(record);
        }
        results.push(record);
      }
      await context.close();
    }
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  writeFileSync(path.join(DEST, "sitewide-visual-metrics.json"), JSON.stringify({
    routes: routes.length,
    screenshots: results.length,
    checkedAt: new Date().toISOString(),
    widths: WIDTHS, themes: THEMES,
    fatalCount: fatal.length,
    oversizedToggleCases: results.filter((r) => r.oversizedToggles.length).length,
    clippedControlCases: results.filter((r) => r.clippedControls.length).length,
    results,
  }, null, 2));
}
console.log("Sitewide rendered inventory: " + results.length + " cases on " + routes.length +
  " routes, " + WIDTHS.length + " widths and " + THEMES.length + " themes.");
console.log("Structural failures: " + fatal.length + "; giant-toggle cases: " +
  results.filter((r) => r.oversizedToggles.length).length +
  "; clipped-control cases: " + results.filter((r) => r.clippedControls.length).length);
for (const item of fatal.slice(0, 40)) {
  console.error(JSON.stringify({ route: item.route, width: item.width, theme: item.theme,
    status: item.status, h1: item.h1Count, overflow: item.overflowPx,
    runtimeErrors: item.runtimeErrors, error: item.error }));
}
if (fatal.length) process.exitCode = 1;
