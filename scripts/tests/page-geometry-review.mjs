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
  ["/study-timer", "Study settings"],
  ["/focus-session-timer", "Focus settings"],
  ["/meeting-timer", "Meeting settings"],
  ["/exam-timer", "Exam cues"],
  ["/workout-timer", "Workout settings"],
  ["/timer-stopwatch", "Set countdown"],
  ["/break-timer", "Break settings"],
  ["/meditation-timer", "Settings"],
  ["/seconds-timer", "Custom seconds"],
  ["/speedrun-timer", "Split setup"],
  ["/meeting-count-up-timer", "Agenda helper"],
  ["/round-timer", "Round settings"],
  ["/clock-with-milliseconds", "Clock settings"],
  ["/visual-timer", null],
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
    const stretchedToggles = [...container.querySelectorAll("label")]
      .filter((label) => label.querySelector('input[type="checkbox"]'))
      .map((label) => {
        const style = getComputedStyle(label);
        const children = [...label.children];
        const innerWidth = children.reduce(
          (sum, child) => sum + child.getBoundingClientRect().width, 0,
        );
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const gap = Number.parseFloat(style.columnGap) || 0;
        const intrinsic = innerWidth + padding + gap * Math.max(0, children.length - 1);
        const width = label.getBoundingClientRect().width;
        return { text: label.textContent?.trim().slice(0, 60) || "toggle", width, intrinsic, extra: width - intrinsic };
      })
      .filter((item) => item.extra > 35);
    return {
      form: rect(container),
      stretchedToggles,
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
          const panel = heading === null
            ? page.locator("section.timer-settings-panel").first()
            : page.locator("section.timer-settings-panel")
              .filter({ has: page.getByRole("heading", { name: heading, exact: true }) }).first();
          assert.equal(await panel.count(), 1, `Missing settings panel on ${route}`);
          const geometry = await fieldGeometry(panel);
          const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          assert.ok(scrollWidth <= viewportWidth + 2,
            `Horizontal overflow ${route} ${width}/${theme}: ${scrollWidth} > ${viewportWidth}`);
          assert.ok(geometry.form.width <= viewportWidth + 2,
            `Settings width exceeds viewport: ${route} ${width}/${theme}`);
          assert.deepEqual(geometry.stretchedToggles, [],
            `Grid-stretched toggles on ${route} ${width}/${theme}: ${JSON.stringify(geometry.stretchedToggles)}`);
          for (const {label, rect} of geometry.elements) {
            assert.ok(rect.width >= 1 && rect.height >= 1 && rect.x >= -2 && rect.right <= viewportWidth + 2,
              `Clipped control ${route} ${width}/${theme} ${label}: ${JSON.stringify(rect)}`);
          }
          await checkSetButtonAlignment(page, route, width);
          if (route === "/timer-stopwatch") {
            const display = await page.locator('[data-tool="timer-stopwatch"] [data-display-stage]').evaluate((node) => {
              const time = node.querySelector("[data-primary-display-value]");
              const stage = node.getBoundingClientRect();
              const digits = time?.getBoundingClientRect();
              return {
                height: stage.height,
                textHeight: digits?.height ?? 0,
                textSize: time ? parseFloat(getComputedStyle(time).fontSize) : 0,
                clipped: !digits || digits.left < stage.left - 2 || digits.right > stage.right + 2,
              };
            });
            if (width === 390) {
              assert.ok(display.height <= 235, `Combined timer has excessive mobile display whitespace: ${JSON.stringify(display)}`);
              assert.ok(display.textSize >= 40, `Combined timer value too small for mobile: ${JSON.stringify(display)}`);
            }
            assert.ok(!display.clipped, `Combined timer text clipped: ${route} ${width}/${theme}`);
          }

          if (route === "/timer-stopwatch") {
            const inputBoxes = await panel.locator(".ilt-setting-row input").evaluateAll((nodes) =>
              nodes.map((node) => {
                const r = node.getBoundingClientRect();
                return { top: r.top, bottom: r.bottom };
              }),
            );
            const applyBox = await panel.getByRole("button", { name: "Apply", exact: true }).boundingBox();
            assert.ok(applyBox && inputBoxes.length === 3, `Missing countdown fields / Apply at ${width}`);
            const applyBottom = applyBox.y + applyBox.height;
            if (width >= 640) {
              for (const box of inputBoxes) {
                assert.ok(Math.abs(box.bottom - applyBottom) <= 4,
                  `Combined timer Apply not bottom-aligned: ${route} ${width}/${theme}, inputs=${JSON.stringify(inputBoxes)}, button=${JSON.stringify(applyBox)}`);
              }
            } else {
              assert.ok(applyBox.y >= inputBoxes.at(-1).bottom,
                `Mobile combined timer Apply overlaps input: ${route} ${width}/${theme}`);
            }
          }

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
