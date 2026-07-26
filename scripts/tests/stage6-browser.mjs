import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = Number(process.env.ILT_STAGE6_BROWSER_PORT || 3037);
const BASE = `http://127.0.0.1:${PORT}`;
const SITE_ORIGIN = "https://www.ilovetimers.com";
const bundledChromiumPath = path.join(
  os.homedir(),
  "AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe",
);
const BROWSER_PATH = process.env.ILT_BROWSER_PATH ||
  (existsSync(bundledChromiumPath)
    ? bundledChromiumPath
    : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe");

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
    if (!existsSync(target)) {
      throw new Error("Playwright is unavailable. Set ILT_PLAYWRIGHT_MODULE to its index.mjs path.");
    }
    return import(pathToFileURL(target).href);
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/countdown-timer`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Production server did not start on ${BASE}.`);
}

async function canonicalChecks(page, routePath) {
  const expected = `${SITE_ORIGIN}${routePath}`;
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), expected);
  assert.equal(await page.locator('meta[property="og:url"]').getAttribute("content"), expected);
  const parameterizedStructuredUrls = await page.locator('script[type="application/ld+json"]').evaluateAll(
    (nodes) => nodes.flatMap((node) => {
      try {
        const urls = [];
        const visit = (value) => {
          if (typeof value === "string" && value.startsWith("https://www.ilovetimers.com") && value.includes("?")) urls.push(value);
          else if (Array.isArray(value)) value.forEach(visit);
          else if (value && typeof value === "object") Object.values(value).forEach(visit);
        };
        visit(JSON.parse(node.textContent || "null"));
        return urls;
      } catch {
        return ["invalid-json-ld"];
      }
    }),
  );
  assert.deepEqual(parameterizedStructuredUrls, []);
}

async function setTheme(page, theme) {
  await page.evaluate((value) => localStorage.setItem("ilt-theme-mode", value), theme);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
}

async function readCopiedLink(page) {
  await page.getByRole("button", { name: "Share setup" }).last().click();
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[role="status"]')].some(
      (node) => (node.textContent || "").trim().length > 0,
    ),
  );
  const manual = page.getByLabel("Share link for manual copying");
  if (await manual.count()) return manual.inputValue();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  assert.match(link, /^https:\/\/www\.ilovetimers\.com\//);
  return link;
}

const shareCases = [
  {
    path: "/countdown-timer",
    startable: true,
    storageKey: "ilovetimers:presets:countdown-timer:v1",
    configure: async (page) => {
      await page.getByLabel("Minutes").fill("1");
      await page.getByLabel("Seconds").fill("1");
      await page.getByRole("button", { name: "Apply" }).click();
    },
    verify: async (page) => {
      assert.equal(await page.getByLabel("Minutes").inputValue(), "1");
      assert.equal(await page.getByLabel("Seconds").inputValue(), "1");
      await page.getByText(/Countdown \/ Ready/).waitFor();
    },
    expected: ["v=1", "duration=61"],
  },
  {
    path: "/pomodoro-timer",
    startable: true,
    storageKey: "ilovetimers:presets:pomodoro-timer:v1",
    configure: async (page) => {
      await page.getByLabel("Work (minutes)").fill("50");
      await page.getByLabel("Break (minutes)", { exact: true }).fill("10");
      await page.getByLabel("Cycles").fill("6");
      await page.getByLabel("Long break (minutes)").fill("25");
    },
    verify: async (page) => {
      assert.equal(await page.getByLabel("Work (minutes)").inputValue(), "50");
      assert.equal(await page.getByLabel("Break (minutes)", { exact: true }).inputValue(), "10");
      assert.equal(await page.getByLabel("Cycles").inputValue(), "6");
      assert.equal(await page.getByLabel("Long break (minutes)").inputValue(), "25");
      await page.getByText(/Paused|Ready/).first().waitFor();
    },
    expected: ["v=1", "work=50", "break=10", "cycles=6", "longDuration=25"],
  },
  {
    path: "/hiit-timer",
    startable: true,
    storageKey: "ilovetimers:presets:hiit-timer:v1",
    configure: async (page) => {
      await page.getByLabel("Warm-up seconds").fill("0");
      await page.getByLabel("Work seconds").fill("45");
      await page.getByLabel("Rest seconds").fill("15");
      await page.getByLabel("Rounds").fill("12");
      await page.getByLabel("Cool-down seconds").fill("60");
    },
    verify: async (page) => {
      assert.equal(await page.getByLabel("Warm-up seconds").inputValue(), "0");
      assert.equal(await page.getByLabel("Work seconds").inputValue(), "45");
      assert.equal(await page.getByLabel("Rest seconds").inputValue(), "15");
      assert.equal(await page.getByLabel("Rounds").inputValue(), "12");
      assert.equal(await page.getByLabel("Cool-down seconds").inputValue(), "60");
      await page.getByText(/Paused|Ready/).first().waitFor();
    },
    expected: ["v=1", "warmup=0", "work=45", "rest=15", "rounds=12", "cooldown=60"],
  },
  {
    path: "/time-zone-meeting-planner",
    storageKey: "ilovetimers:presets:time-zone-meeting-planner:v1",
    configure: async (page) => {
      await page.getByLabel("UTC reference date").fill("2028-02-29");
      await page.getByLabel("Duration minutes").fill("90");
      await page.getByLabel("Workday start hour").fill("7");
      await page.getByLabel("Workday end hour").fill("20");
    },
    verify: async (page) => {
      assert.equal(await page.getByLabel("UTC reference date").inputValue(), "2028-02-29");
      assert.equal(await page.getByLabel("Duration minutes").inputValue(), "90");
      assert.equal(await page.getByLabel("Workday start hour").inputValue(), "7");
      assert.equal(await page.getByLabel("Workday end hour").inputValue(), "20");
    },
    expected: ["v=1", "date=2028-02-29", "duration=90", "start=7", "end=20"],
  },
  {
    path: "/time-zone-converter",
    storageKey: null,
    configure: async (page) => {
      await page.getByLabel("Date").fill("2026-11-01");
      await page.getByLabel(/Time \(HH:MM/).fill("01:30");
      await page.getByLabel("From time zone").selectOption("America/New_York");
      await page.getByLabel("To time zone").selectOption("Europe/London");
    },
    verify: async (page) => {
      assert.equal(await page.getByLabel("Date").inputValue(), "2026-11-01");
      assert.equal(await page.getByLabel(/Time \(HH:MM/).inputValue(), "01:30");
      assert.equal(await page.getByLabel("From time zone").inputValue(), "America/New_York");
      assert.equal(await page.getByLabel("To time zone").inputValue(), "Europe/London");
    },
    expected: ["v=1", "from=America%2FNew_York", "to=Europe%2FLondon", "date=2026-11-01", "time=01%3A30"],
  },
];

async function runShareCase(browser, testCase, viewport, theme) {
  console.log(`Testing share ${testCase.path} at ${viewport.width}px in ${theme} mode.`);
  const sourceContext = await browser.newContext({
    baseURL: BASE,
    viewport,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const source = await sourceContext.newPage();
  await source.goto(testCase.path, { waitUntil: "networkidle" });
  await setTheme(source, theme);
  await testCase.configure(source);
  if (process.env.ILT_STAGE6_SCREENSHOT_DIR) {
    mkdirSync(process.env.ILT_STAGE6_SCREENSHOT_DIR, { recursive: true });
    const slug = testCase.path.slice(1).replaceAll("/", "-");
    await source.screenshot({
      path: path.join(process.env.ILT_STAGE6_SCREENSHOT_DIR, `${slug}-${viewport.width}-${theme}.png`),
      fullPage: false,
    });
  }
  const link = await readCopiedLink(source);
  assert.equal(new URL(link).origin, SITE_ORIGIN);
  assert.equal(new URL(link).pathname, testCase.path);
  for (const part of testCase.expected) assert.ok(link.includes(part), `${testCase.path} link lacks ${part}`);
  await sourceContext.close();

  const targetContext = await browser.newContext({ baseURL: BASE, viewport });
  const target = await targetContext.newPage();
  const localUrl = `${BASE}${new URL(link).pathname}${new URL(link).search}`;
  await target.goto(localUrl, { waitUntil: "networkidle" });
  await target.getByText(/Loaded (?:a compatible older )?shared setup|Loaded the shared setup/).waitFor();
  await testCase.verify(target);
  if (testCase.storageKey) {
    assert.equal(await target.evaluate((key) => localStorage.getItem(key), testCase.storageKey), null);
  }
  await canonicalChecks(target, testCase.path);
  if (testCase.startable) {
    const start = target.getByRole("button", { name: /^Start$/ }).first();
    assert.ok(await start.isVisible());
    await start.click();
    await target.getByRole("button", { name: /^Pause$/ }).first().waitFor();
  }
  assert.ok((await target.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)));
  await targetContext.close();
}

async function runPresetCase(browser, testCase) {
  if (!testCase.storageKey) return;
  const otherKey = "ilovetimers:presets:test-isolation:v1";
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(testCase.path, { waitUntil: "networkidle" });
  await testCase.configure(page);
  await testCase.verify(page);
  await page.getByLabel("Preset name").fill("Stage 6 routine");
  await page.getByRole("button", { name: "Save preset" }).click();
  await page.getByText("Preset saved only in this browser.").waitFor();
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: otherKey, value: "keep" });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Load preset" }).click();
  await page.getByText(/Loaded Stage 6 routine/).waitFor();
  await testCase.verify(page);
  await page.getByLabel("Preset name").fill("Renamed routine");
  await page.getByRole("button", { name: "Rename" }).click();
  await page.getByText("Preset renamed.").waitFor();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByText("Preset deleted from this browser.").waitFor();
  await page.getByLabel("Preset name").fill("First routine");
  await page.getByRole("button", { name: "Save preset" }).click();
  await page.getByLabel("Preset name").fill("Second routine");
  await page.getByRole("button", { name: "Save preset" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete all" }).click();
  await page.getByText(/All presets for this tool were deleted/).waitFor();
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), otherKey), "keep");
  await page.evaluate((key) => localStorage.setItem(key, '{"version":1,"records":[{"bad":true}]}'), testCase.storageKey);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText(/Ignored 1 invalid local preset record/).waitFor();
  assert.equal(await page.locator("h1").count(), 1);
  assert.ok(await page.getByRole("button", { name: "Share setup" }).last().isVisible());
  assert.equal(new URL(page.url()).search, "");
  await context.close();
}

async function runCanonicalSweep(browser) {
  const manifest = JSON.parse(readFileSync(path.join(ROOT, "docs/route-architecture-manifest.json"), "utf8"));
  const paths = manifest.filter((entry) => entry.indexability !== "redirect").map((entry) => entry.sourcePath);
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  const browserErrors = [];
  let activeRoute = "startup";
  page.on("pageerror", (error) => browserErrors.push(`${activeRoute}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`${activeRoute}: ${message.text()}`);
  });
  for (const routePath of paths) {
    activeRoute = routePath;
    const response = await page.goto(routePath, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `${routePath} did not render HTTP 200`);
    assert.equal(await page.locator("h1").count(), 1, `${routePath} does not have one H1`);
    let canonicalHref;
    try {
      canonicalHref = await page.locator('link[rel="canonical"]').getAttribute("href", { timeout: 5_000 });
    } catch (error) {
      const diagnostics = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim() ?? null,
        body: document.body.innerText.slice(0, 300),
      }));
      throw new Error(
        `${routePath} did not expose its canonical link after navigation: ${JSON.stringify(diagnostics)}; browser errors: ${browserErrors.slice(-5).join(" | ")}.`,
        { cause: error },
      );
    }
    assert.ok(canonicalHref, `${routePath} lacks a canonical`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${routePath} overflows horizontally`);
    assert.doesNotMatch(await page.locator("body").innerText(), /hydration failed|hydration mismatch/i, `${routePath} reports a hydration failure`);
  }
  assert.deepEqual(browserErrors, [], `Canonical sweep reported browser errors: ${browserErrors.join(" | ")}`);
  await context.close();
  return paths.length;
}

const { chromium } = await loadPlaywright();
const server = spawnStaticPreview({ root: ROOT, port: PORT });

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    headless: true,
    executablePath: BROWSER_PATH,
    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
  });
  for (const testCase of shareCases) {
    await runShareCase(browser, testCase, { width: 1280, height: 900 }, "light");
    await runShareCase(browser, testCase, { width: 390, height: 844 }, "dark");
  }
  for (const testCase of shareCases) await runPresetCase(browser, testCase);
  const canonicalCount = await runCanonicalSweep(browser);
  console.log(`Stage 6 browser tests passed (${shareCases.length} share routes at desktop/light and mobile/dark, ${shareCases.filter((item) => item.storageKey).length} preset routes, ${canonicalCount} canonical Chromium renders).`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
