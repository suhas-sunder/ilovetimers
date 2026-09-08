import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = Number(process.env.ILT_DISPLAY_STABILITY_PORT || 3057);
const BASE = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = process.env.ILT_DISPLAY_SCREENSHOT_DIR;
const exhaustive = process.env.ILT_DISPLAY_ALL === "1";
const routeOverride = process.env.ILT_DISPLAY_ROUTE;
const widthOverride = Number(process.env.ILT_DISPLAY_WIDTH || 0);
const bundledChromiumPath = path.join(
  os.homedir(),
  "AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe",
);
const BROWSER_PATH =
  process.env.ILT_BROWSER_PATH ||
  (existsSync(bundledChromiumPath)
    ? bundledChromiumPath
    : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe");

const representativeRoutes = [
  "/pizza-timer",
  "/millisecond-timer",
  "/clock-with-milliseconds",
  "/binary-stopwatch",
  "/countdown-timer",
  "/interval-timer",
  "/atomic-clock",
  "/time-calculator",
];
const allCanonicalRoutes = JSON.parse(
  readFileSync(path.join(ROOT, "docs/route-architecture-manifest.json"), "utf8"),
)
  .filter((entry) => entry.indexability !== "redirect")
  .map((entry) => entry.canonicalDestination);
const routes = routeOverride
  ? routeOverride.split(",").map((value) => value.trim()).filter(Boolean)
  : exhaustive
    ? allCanonicalRoutes
    : representativeRoutes;
const representativeViewports = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1365, height: 900 },
  { width: 1920, height: 1080 },
];
const viewports = widthOverride
  ? [{ width: widthOverride, height: widthOverride <= 480 ? 800 : 900 }]
  : exhaustive
    ? [
        { width: 320, height: 800 },
        { width: 1365, height: 900 },
      ]
    : representativeViewports;
const sampleDurationMs = exhaustive ? 700 : 1300;

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const configured = process.env.ILT_PLAYWRIGHT_MODULE;
    const bundled = path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
    );
    const target = configured || bundled;
    if (!existsSync(target)) throw new Error("Playwright is unavailable.");
    return import(pathToFileURL(target).href);
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/sitemap`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Production preview did not start on ${BASE}.`);
}

function installFrameSampler({ expectedPath, duration }) {
      window.__iltDisplayStability = { done: false, samples: [] };
      const startedAt = performance.now();
      const sample = () => {
        const state = window.__iltDisplayStability;
        if (!state) return;
        if (window.location.pathname === expectedPath) {
          const candidates = [
            ...document.querySelectorAll(
              '[data-display-stage] [style*="font-size"], .timer-display-surface [style*="font-size"]',
            ),
          ].filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
          const target = candidates.sort(
            (left, right) =>
              Number.parseFloat(getComputedStyle(right).fontSize) -
              Number.parseFloat(getComputedStyle(left).fontSize),
          )[0];
          const stage = target?.closest(
            "[data-display-stage], .timer-display-surface",
          );
          if (target instanceof HTMLElement && stage instanceof HTMLElement) {
            const rect = target.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            const targetStyle = getComputedStyle(target);
            state.samples.push({
              at: performance.now() - startedAt,
              fontSize: Number.parseFloat(targetStyle.fontSize),
              monospace: targetStyle.fontFamily.toLowerCase().includes("mono"),
              width: rect.width,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
              stageLeft: stageRect.left,
              stageRight: stageRect.right,
              stageTop: stageRect.top,
              stageBottom: stageRect.bottom,
            });
          }
        }

        if (performance.now() - startedAt < duration) {
          requestAnimationFrame(sample);
        } else {
          state.done = true;
        }
      };
      requestAnimationFrame(sample);
}

function spread(values) {
  return Math.max(...values) - Math.min(...values);
}

async function runRouteCase(browser, routePath, viewport) {
  const context = await browser.newContext({
    baseURL: BASE,
    viewport,
    reducedMotion: "reduce",
  });
  await context.route(/pagead2\.googlesyndication\.com/, (route) => route.abort());
  await context.addInitScript(installFrameSampler, {
    expectedPath: routePath,
    duration: sampleDurationMs,
  });
  const page = await context.newPage();

  try {
    await page.goto("/sitemap", { waitUntil: "networkidle" });
    const routeLink = page.locator(`main a[href="${routePath}"]`).first();
    if ((await routeLink.count()) > 0) {
      await routeLink.click();
    } else {
      await page.goto(routePath);
    }
    await page.waitForURL(`**${routePath}`);
    await page.waitForFunction(() => window.__iltDisplayStability?.done === true);

    const samples = await page.evaluate(
      () => window.__iltDisplayStability?.samples ?? [],
    );
    if (samples.length === 0 && exhaustive) return false;
    assert.ok(
      samples.length >= (exhaustive ? 8 : 30),
      `${routePath} at ${viewport.width}px produced only ${samples.length} display frames.`,
    );

    const fontSpread = spread(samples.map(({ fontSize }) => fontSize));
    const widthSpread = spread(samples.map(({ width }) => width));
    const heightSpread = spread(samples.map(({ height }) => height));
    assert.ok(
      fontSpread <= 0.1,
      `${routePath} at ${viewport.width}px changed font size by ${fontSpread.toFixed(2)}px after route entry (${Math.min(...samples.map(({ fontSize }) => fontSize)).toFixed(2)}px to ${Math.max(...samples.map(({ fontSize }) => fontSize)).toFixed(2)}px).`,
    );
    assert.ok(
      !samples[0].monospace || widthSpread <= 1,
      `${routePath} at ${viewport.width}px changed display width by ${widthSpread.toFixed(2)}px after route entry.`,
    );
    assert.ok(
      heightSpread <= 1,
      `${routePath} at ${viewport.width}px changed display height by ${heightSpread.toFixed(2)}px after route entry.`,
    );
    assert.ok(
      samples.every(
        ({
          left,
          right,
          top,
          bottom,
          stageLeft,
          stageRight,
          stageTop,
          stageBottom,
        }) =>
          left >= stageLeft - 1 &&
          right <= stageRight + 1 &&
          top >= stageTop - 1 &&
          bottom <= stageBottom + 1,
      ),
      `${routePath} at ${viewport.width}px overflowed its display stage: ${JSON.stringify(samples.find(({ left, right, top, bottom, stageLeft, stageRight, stageTop, stageBottom }) => left < stageLeft - 1 || right > stageRight + 1 || top < stageTop - 1 || bottom > stageBottom + 1))}`,
    );
    assert.equal(
      await page.locator('[aria-hidden="true"][style*="-100000px"]').count(),
      0,
      `${routePath} leaked a text-measurement probe into the document.`,
    );
    if (
      SCREENSHOT_DIR &&
      (routeOverride || routePath === "/pizza-timer") &&
      (viewport.width === 320 || viewport.width === 1365)
    ) {
      mkdirSync(SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `pizza-${viewport.width}.png`),
        fullPage: true,
      });
    }
    return true;
  } finally {
    await context.close();
  }
}

const playwright = await loadPlaywright();
const preview = spawnStaticPreview({ root: ROOT, port: PORT });
let browser;

try {
  await waitForServer();
  browser = await playwright.chromium.launch({
    headless: true,
    executablePath: BROWSER_PATH,
  });
  let displayCases = 0;
  const failures = [];
  for (const viewport of viewports) {
    for (const routePath of routes) {
      try {
        if (await runRouteCase(browser, routePath, viewport)) displayCases += 1;
      } catch (error) {
        failures.push(
          error instanceof Error
            ? error.message
            : `${routePath} at ${viewport.width}px failed: ${String(error)}`,
        );
      }
    }
  }
  assert.deepEqual(failures, [], `Display stability failures:\n- ${failures.join("\n- ")}`);
  console.log(
    `Display stability test passed (${routes.length * viewports.length} document-route entries across ${viewports.length} viewport sizes; ${displayCases} rendered display cases sampled).`,
  );
} finally {
  await browser?.close();
  preview.kill();
}
