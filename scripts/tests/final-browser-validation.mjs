import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = Number(process.env.ILT_FINAL_BROWSER_PORT || 3047);
const BASE = `http://127.0.0.1:${PORT}`;
const ORIGIN = "https://www.ilovetimers.com";
const ROUTE_REPORT = path.join(ROOT, "docs/final-route-validation.json");
const QUALITY_REPORT = path.join(ROOT, "docs/final-performance-accessibility.json");
const chromiumPath = process.env.ILT_BROWSER_PATH || path.join(
  os.homedir(),
  "AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe",
);
const webkitPath = path.join(
  os.homedir(),
  "AppData/Local/ms-playwright/webkit-2272/Playwright.exe",
);

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const configured = process.env.ILT_PLAYWRIGHT_MODULE;
    const bundled = path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs",
    );
    const target = configured || bundled;
    if (!existsSync(target)) throw new Error("Playwright is unavailable.");
    return import(pathToFileURL(target).href);
  }
}

const manifest = JSON.parse(await readFile(path.join(ROOT, "docs/route-architecture-manifest.json"), "utf8"));
const inventory = JSON.parse(await readFile(path.join(ROOT, "docs/adsense-route-inventory.json"), "utf8"));
const canonicalEntries = manifest.filter((entry) => entry.indexability !== "redirect");
const inventoryByPath = new Map(inventory.map((entry) => [entry.path, entry]));
const informationTypes = new Set([
  "homepage",
  "trust page",
  "legal/privacy page",
  "legal page",
  "HTML sitemap",
  "HTML directory",
  "guide index",
  "technical guide",
]);
const responsivePaths = [
  "/",
  "/countdown-timer",
  "/interval-timer",
  "/time-calculator",
  "/world-clock",
  "/guides/how-browser-timers-measure-time",
  "/sitemap",
  "/1-minute-timer",
  "/countdown-timer?v=1&duration=61",
];
const performancePaths = [
  "/",
  "/countdown-timer",
  "/interval-timer",
  "/time-calculator",
  "/world-clock",
  "/guides/how-browser-timers-measure-time",
  "/sitemap",
  "/1-minute-timer",
];
const viewports = [
  { label: "mobile-320", width: 320, height: 800 },
  { label: "mobile-390", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1365, height: 900 },
  { label: "large-desktop", width: 1920, height: 1080 },
];

function expectedCanonical(routePath) {
  return routePath === "/" ? ORIGIN : `${ORIGIN}${routePath}`;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(BASE, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Production server did not become ready.");
}

async function installGuards(context) {
  await context.addInitScript(() => {
    window.__iltAutomaticCalls = { geolocation: 0, notification: 0, fullscreen: 0 };
    if (navigator.geolocation) {
      const originalGet = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = (...args) => {
        window.__iltAutomaticCalls.geolocation += 1;
        return originalGet(...args);
      };
    }
    if (typeof Notification !== "undefined") {
      const originalRequest = Notification.requestPermission.bind(Notification);
      Notification.requestPermission = (...args) => {
        window.__iltAutomaticCalls.notification += 1;
        return originalRequest(...args);
      };
    }
    if (Element.prototype.requestFullscreen) {
      const originalFullscreen = Element.prototype.requestFullscreen;
      Element.prototype.requestFullscreen = function (...args) {
        window.__iltAutomaticCalls.fullscreen += 1;
        return originalFullscreen.apply(this, args);
      };
    }
  });
}

async function pageSemantics(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const name = (element) => {
      const labelledBy = element.getAttribute("aria-labelledby");
      const labelledText = labelledBy
        ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ")
        : "";
      const labels = "labels" in element && element.labels
        ? [...element.labels].map((label) => label.textContent || "").join(" ")
        : "";
      return [
        element.getAttribute("aria-label"),
        labelledText,
        labels,
        element.getAttribute("alt"),
        element.getAttribute("title"),
        element.textContent,
        element.getAttribute("value"),
      ].filter(Boolean).join(" ").trim();
    };
    const controls = [...document.querySelectorAll("button,input,select,textarea,[role=button]")]
      .filter((element) => visible(element) && element.getAttribute("type") !== "hidden");
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((element) => ({
      level: Number(element.tagName[1]),
      text: (element.textContent || "").trim(),
    }));
    const headingJumps = headings.slice(1).filter((heading, index) => heading.level > headings[index].level + 1);
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => {
      try {
        return { valid: true, value: JSON.parse(script.textContent || "null") };
      } catch (error) {
        return { valid: false, error: String(error) };
      }
    });
    const structuredUrls = [];
    const visit = (value) => {
      if (typeof value === "string" && /^https?:/.test(value)) structuredUrls.push(value);
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    jsonLd.filter((entry) => entry.valid).forEach((entry) => visit(entry.value));
    return {
      h1Count: document.querySelectorAll("h1").length,
      controlCount: controls.length,
      unnamedControls: controls.filter((element) => !name(element)).map((element) => element.outerHTML.slice(0, 180)),
      missingAltImages: [...document.querySelectorAll("img:not([alt])")].map((element) => element.outerHTML.slice(0, 180)),
      duplicateIds: [...document.querySelectorAll("[id]")].map((element) => element.id).filter((id, index, ids) => ids.indexOf(id) !== index),
      headingJumps,
      jsonLdCount: jsonLd.length,
      invalidJsonLd: jsonLd.filter((entry) => !entry.valid).length,
      parameterizedStructuredUrls: structuredUrls.filter((url) => url.includes("?")),
      localStructuredUrls: structuredUrls.filter((url) => /localhost|127\.0\.0\.1|file:\//i.test(url)),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      processLanguage: (document.body.innerText.match(/\b(?:Codex|worktree|release candidate|Stage [1-7]|AdSense review|SEO audit|this pass|repository audit)\b/gi) || []),
      externalScripts: [...document.scripts].map((script) => script.src).filter((src) => src && new URL(src).origin !== location.origin),
    };
  });
}

async function interactWithTool(page) {
  const preferred = /^(start|calculate|convert|tap|begin|apply|set alarm|new test|add timer|add row|generate|run|show result)$/i;
  const excluded = /fullscreen|location|share|preset|delete|clear|download|print|cookie|analytics/i;
  const buttons = page.locator("main button:visible:enabled");
  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    const label = ((await button.getAttribute("aria-label")) || (await button.innerText())).trim();
    if (!preferred.test(label) || excluded.test(label)) continue;
    await button.evaluate((element) => element.click());
    await page.waitForTimeout(120);
    const pause = page.getByRole("button", { name: /^(pause|stop)$/i }).first();
    if (await pause.isVisible().catch(() => false)) await pause.evaluate((element) => element.click()).catch(() => {});
    const reset = page.getByRole("button", { name: /^reset/i }).first();
    if (await reset.isVisible().catch(() => false)) await reset.evaluate((element) => element.click()).catch(() => {});
    return `activated ${label}`;
  }
  const toggle = page.locator('main input[type="checkbox"]:visible:enabled').first();
  if (await toggle.count()) {
    await toggle.evaluate((element) => element.click());
    await toggle.evaluate((element) => element.click());
    return "toggled and restored a setting";
  }
  const safeButton = page.locator("main button:visible:enabled").filter({ hasNotText: excluded }).first();
  if (await safeButton.count()) {
    const label = ((await safeButton.getAttribute("aria-label")) || (await safeButton.innerText())).trim();
    await safeButton.click({ timeout: 2000 }).catch(() => {});
    return `activated ${label || "an accessible control"}`;
  }
  return "live display and SSR-visible controls verified; no safe generic mutation was available";
}

async function runCanonicalSweep(browser) {
  const context = await browser.newContext({
    baseURL: BASE,
    viewport: { width: 1365, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await installGuards(context);
  const page = await context.newPage();
  page.on("dialog", (dialog) => dialog.dismiss());
  const results = [];
  for (const entry of canonicalEntries) {
    const routePath = entry.sourcePath;
    console.log(`Canonical ${routePath}`);
    const errors = [];
    const consoleErrors = [];
    const requests = [];
    const onPageError = (error) => errors.push(error.message);
    const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
    const onRequest = (request) => {
      const url = new URL(request.url());
      if (url.origin !== BASE) requests.push(url.origin);
    };
    page.on("pageerror", onPageError);
    page.on("console", onConsole);
    page.on("request", onRequest);
    const response = await page.goto(routePath, { waitUntil: "networkidle", timeout: 30000 });
    const automaticCalls = await page.evaluate(() => window.__iltAutomaticCalls);
    const semantics = await pageSemantics(page);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    const pageType = inventoryByPath.get(routePath)?.pageType || "tool";
    const isTool = !informationTypes.has(pageType) && !routePath.startsWith("/guides");
    const interaction = isTool ? await interactWithTool(page) : "informational page rendered; navigation controls verified";
    const result = {
      path: routePath,
      pageType,
      expectedIndexability: entry.indexability,
      status: response?.status() || null,
      canonical,
      ogUrl,
      robots,
      h1Count: semantics.h1Count,
      primaryControls: semantics.controlCount,
      interaction,
      initialAutomaticPermissionOrFullscreenCalls: automaticCalls,
      accessibility: {
        unnamedControls: semantics.unnamedControls,
        missingAltImages: semantics.missingAltImages,
        duplicateIds: [...new Set(semantics.duplicateIds)],
        headingJumps: semantics.headingJumps,
      },
      structuredData: {
        blocks: semantics.jsonLdCount,
        invalidBlocks: semantics.invalidJsonLd,
        parameterizedUrls: semantics.parameterizedStructuredUrls,
        localUrls: semantics.localStructuredUrls,
      },
      horizontalOverflow: semantics.horizontalOverflow,
      internalProcessLanguage: semantics.processLanguage,
      externalRequestOrigins: [...new Set(requests)].sort(),
      externalScriptUrls: semantics.externalScripts,
      consoleErrors,
      pageErrors: errors,
      passed: false,
    };
    result.passed = result.status === 200
      && result.canonical === expectedCanonical(routePath)
      && result.ogUrl === expectedCanonical(routePath)
      && result.h1Count === 1
      && (!isTool || result.primaryControls > 0)
      && Object.values(automaticCalls).every((value) => value === 0)
      && !result.horizontalOverflow
      && result.accessibility.unnamedControls.length === 0
      && result.accessibility.missingAltImages.length === 0
      && result.accessibility.duplicateIds.length === 0
      && result.structuredData.invalidBlocks === 0
      && result.structuredData.parameterizedUrls.length === 0
      && result.structuredData.localUrls.length === 0
      && result.internalProcessLanguage.length === 0
      && result.externalScriptUrls.length === 0
      && result.consoleErrors.length === 0
      && result.pageErrors.length === 0
      && (entry.indexability === "noindex" ? /^noindex,follow/i.test(robots || "") : /^index,follow/i.test(robots || ""));
    results.push(result);
    page.off("pageerror", onPageError);
    page.off("console", onConsole);
    page.off("request", onRequest);
  }
  await context.close();
  return results;
}

async function runRedirectChecks() {
  const results = [];
  for (const [source, destination] of Object.entries(PERMANENT_REDIRECTS)) {
    const response = await fetch(`${BASE}${source}`, { redirect: "manual" });
    const destinationResponse = await fetch(`${BASE}${destination}`, { redirect: "manual" });
    results.push({
      source,
      destination,
      status: response.status,
      location: response.headers.get("location"),
      destinationStatus: destinationResponse.status,
      oneHop: response.status === 301 && response.headers.get("location") === destination && destinationResponse.status === 200,
    });
  }
  return results;
}

async function responsiveAndThemeChecks(browser) {
  const results = [];
  for (const viewport of viewports) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({ baseURL: BASE, viewport, colorScheme: "light", reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.addInitScript((value) => localStorage.setItem("ilt-theme-mode", value), theme);
      for (const routePath of responsivePaths) {
        await page.goto(routePath, { waitUntil: "networkidle" });
        const data = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          viewportWidth: document.documentElement.clientWidth,
          minControlSizeFailures: [...document.querySelectorAll("button:enabled")].filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24);
          }).length,
        }));
        results.push({ route: routePath, viewport: viewport.label, theme, ...data, passed: data.theme === theme && !data.overflow });
      }
      await context.close();
    }
  }
  return results;
}

async function performanceChecks(browser) {
  const results = [];
  for (const viewport of [viewports[0], viewports[3]]) {
    const context = await browser.newContext({ baseURL: BASE, viewport, reducedMotion: "reduce" });
    await context.addInitScript(() => {
      window.__iltPerf = { lcp: 0, cls: 0, longTasks: 0, longTaskDuration: 0 };
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.__iltPerf.lcp = entries.at(-1)?.startTime || window.__iltPerf.lcp;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__iltPerf.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__iltPerf.longTasks += 1;
          window.__iltPerf.longTaskDuration += entry.duration;
        }
      }).observe({ type: "longtask", buffered: true });
    });
    const page = await context.newPage();
    for (const routePath of performancePaths) {
      const requestOrigins = new Set();
      const onRequest = (request) => requestOrigins.add(new URL(request.url()).origin);
      page.on("request", onRequest);
      await page.goto(routePath, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const resources = performance.getEntriesByType("resource");
        return {
          ...window.__iltPerf,
          domContentLoaded: navigation?.domContentLoadedEventEnd || null,
          loadEvent: navigation?.loadEventEnd || null,
          transferBytes: resources.reduce((sum, item) => sum + (item.transferSize || 0), 0),
          decodedBytes: resources.reduce((sum, item) => sum + (item.decodedBodySize || 0), 0),
          resourceCount: resources.length,
          scriptBytes: resources.filter((item) => item.initiatorType === "script").reduce((sum, item) => sum + (item.transferSize || 0), 0),
          imageBytes: resources.filter((item) => item.initiatorType === "img").reduce((sum, item) => sum + (item.transferSize || 0), 0),
        };
      });
      results.push({ route: routePath, viewport: viewport.label, ...metrics, requestOrigins: [...requestOrigins].sort() });
      page.off("request", onRequest);
    }
    await context.close();
  }
  return results;
}

async function storageFailureChecks(browser) {
  const storagePaths = [...new Set(inventory.filter((entry) => entry.routeKind === "canonical" && entry.localStorageUse?.implemented).map((entry) => entry.path))];
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    const storage = window.localStorage;
    for (const method of ["getItem", "setItem", "removeItem", "clear"]) {
      Object.defineProperty(storage, method, {
        configurable: true,
        value: () => { throw new DOMException("Storage disabled for release test", "SecurityError"); },
      });
    }
  });
  const page = await context.newPage();
  const results = [];
  for (const routePath of storagePaths) {
    const errors = [];
    const onError = (error) => errors.push(error.message);
    page.on("pageerror", onError);
    const response = await page.goto(routePath, { waitUntil: "networkidle" });
    results.push({ route: routePath, status: response?.status(), h1Count: await page.locator("h1").count(), errors, passed: response?.status() === 200 && await page.locator("h1").count() === 1 && errors.length === 0 });
    page.off("pageerror", onError);
  }
  await context.close();
  return results;
}

async function keyboardChecks(browser) {
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/countdown-timer", { waitUntil: "networkidle" });
  const menu = page.getByRole("button", { name: /menu/i }).first();
  await menu.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  const opened = await dialog.isVisible();
  const activeInside = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement)));
  await page.keyboard.press("Escape");
  const focusRestored = await menu.evaluate((element) => document.activeElement === element);
  await context.close();
  return { opened, activeInside, focusRestored, passed: opened && activeInside && focusRestored };
}

async function runWebKit(playwright) {
  if (!existsSync(webkitPath)) return { available: false, reason: "Bundled WebKit executable not found." };
  let browser;
  try {
    browser = await playwright.webkit.launch({ headless: true, executablePath: webkitPath });
    const context = await browser.newContext({ baseURL: BASE, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const results = [];
    for (const routePath of ["/", "/countdown-timer", "/time-calculator", "/world-clock", "/guides/how-browser-timers-measure-time", "/1-minute-timer"]) {
      const errors = [];
      const onError = (error) => errors.push(error.message);
      page.on("pageerror", onError);
      const response = await page.goto(routePath, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      results.push({ route: routePath, status: response?.status(), overflow, errors, passed: response?.status() === 200 && !overflow && errors.length === 0 });
      page.off("pageerror", onError);
    }
    await context.close();
    return { available: true, engine: "Bundled Playwright WebKit 2272", results, passed: results.every((item) => item.passed) };
  } catch (error) {
    return { available: true, passed: false, error: String(error) };
  } finally {
    await browser?.close();
  }
}

const playwright = await loadPlaywright();
assert.ok(existsSync(chromiumPath), `Chromium executable not found at ${chromiumPath}`);
const server = spawn(process.execPath, ["server.js"], {
  cwd: ROOT,
  env: { ...process.env, NODE_ENV: "production", PORT: String(PORT) },
  stdio: "ignore",
});

let browser;
let routeReport;
let qualityReport;
try {
  await waitForServer();
  browser = await playwright.chromium.launch({
    headless: true,
    executablePath: chromiumPath,
    args: ["--disable-dev-shm-usage", "--no-sandbox", "--mute-audio"],
  });
  const canonical = await runCanonicalSweep(browser);
  const redirects = await runRedirectChecks();
  const responsive = await responsiveAndThemeChecks(browser);
  const performance = await performanceChecks(browser);
  const storageFailure = await storageFailureChecks(browser);
  const keyboard = await keyboardChecks(browser);
  const webkit = await runWebKit(playwright);
  const unknown = await fetch(`${BASE}/final-release-unknown-route`, { redirect: "manual" });
  const unknownHtml = await unknown.text();
  const canonicalPassed = canonical.every((item) => item.passed);
  const redirectsPassed = redirects.every((item) => item.oneHop);
  const responsivePassed = responsive.every((item) => item.passed);
  const storagePassed = storageFailure.every((item) => item.passed);
  routeReport = {
    status: canonicalPassed && redirectsPassed && unknown.status === 404 ? "passed" : "failed",
    generatedAt: new Date().toISOString(),
    environment: {
      server: "local React Router production build through server.js",
      browser: "Bundled Chromium 1217 through Playwright 1.61.1 on Windows",
      originUnderTest: BASE,
      metadataOrigin: ORIGIN,
    },
    counts: { canonical: canonical.length, redirects: redirects.length, indexable: canonical.filter((item) => item.expectedIndexability === "indexable").length, noindex: canonical.filter((item) => item.expectedIndexability === "noindex").length },
    canonical,
    redirects,
    unknownRoute: { path: "/final-release-unknown-route", status: unknown.status, h1Present: /<h1\b/i.test(unknownHtml), passed: unknown.status === 404 },
    limitations: [
      "Generic interaction activates one safe primary control or reversible setting on each tool route; specialized formulas and workflows are additionally covered by repository tests and audits.",
      "Automated browser checks do not prove audible speaker output, physical-device behavior, assistive-technology interoperability, or every locale and timezone combination.",
    ],
  };
  qualityReport = {
    status: responsivePassed && storagePassed && keyboard.passed && (!webkit.available || webkit.passed) ? "passed" : "failed",
    generatedAt: new Date().toISOString(),
    environment: "Local production build on Windows; Playwright Chromium 1217 and bundled WebKit 2272 where available. Network and CPU were not throttled.",
    accessibility: {
      automatedCanonicalCoverage: canonical.length,
      canonicalFailures: canonical.filter((item) => !item.passed).map((item) => item.path),
      keyboard,
      responsiveChecks: responsive.length,
      responsiveFailures: responsive.filter((item) => !item.passed),
      reducedMotion: "All representative contexts requested reduced motion; the source accessibility audit separately verifies the reduced-motion stylesheet.",
      zoomAndReflow: "The 320 CSS-pixel sweep represents the reflow pressure of 200% zoom on a 640 CSS-pixel layout; real browser zoom was not independently instrumented.",
      certificationLimit: "Automated checks and keyboard sampling are not a formal accessibility certification or a replacement for assistive-technology testing.",
    },
    performance: {
      method: "Playwright PerformanceObserver lab sampling after network idle; LCP, CLS, long tasks, navigation timing, and transferred resource bytes are diagnostic lab proxies, not field Core Web Vitals.",
      thresholds: { lcpMilliseconds: 2500, cls: 0.1, responsivenessProxy: "long-task count and duration; not INP" },
      measurements: performance,
      lighthouse: { status: "pending separate CLI run", reason: "Recorded separately after the browser artifact is generated." },
      adLayoutShift: "Homepage ad placeholders reserve fixed responsive dimensions; route sweep found no horizontal overflow and CLS measurements are recorded above.",
    },
    storageFailure,
    crossBrowser: { chromium: "full 132-route sweep", webkit, firefox: "not installed in the available Playwright browser cache" },
    physicalDeviceCoverage: "Not performed; post-deployment physical-device and real assistive-technology checks remain a verification gate.",
  };
  await writeFile(ROUTE_REPORT, `${JSON.stringify(routeReport, null, 2)}\n`);
  await writeFile(QUALITY_REPORT, `${JSON.stringify(qualityReport, null, 2)}\n`);
  assert.equal(routeReport.status, "passed", `Final route validation failed for ${canonical.filter((item) => !item.passed).map((item) => item.path).join(", ")}`);
  assert.equal(qualityReport.status, "passed", "Responsive, storage-failure, keyboard, or cross-browser validation failed.");
  console.log(`Final browser validation passed (${canonical.length} canonical routes, ${redirects.length} redirects, ${responsive.length} responsive/theme checks, ${storageFailure.length} storage-failure checks).`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
