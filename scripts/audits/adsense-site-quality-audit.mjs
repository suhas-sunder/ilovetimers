import { spawn } from "node:child_process";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import { RELATED_TOOL_LINKS } from "../../app/clients/config/relatedTools.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";
import {
  STAGE3_NEW_REDIRECTS,
  STAGE3_NOINDEX_ROUTE_SET,
  STAGE3_REDIRECT_SOURCE_SET,
} from "../../app/config/routeArchitecture.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP_DIR = path.join(ROOT, "app");
const DOCS_DIR = path.join(ROOT, "docs");
const PORT = Number(process.env.ILT_AUDIT_PORT || 3022);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SITE_URL = "https://www.ilovetimers.com";
const SHARED_LAYOUT_FILES = new Set([
  "app/root.tsx",
  "app/clients/components/navigation/Footer.tsx",
  "app/clients/components/navigation/RelatedTools.tsx",
  "app/clients/config/siteDirectory.js",
  "app/clients/config/relatedTools.js",
]);

const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

async function listFiles(directory, matcher = () => true) {
  const entries = await readdir(path.join(ROOT, directory), {
    withFileTypes: true,
  });
  const files = [];
  for (const entry of entries) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(relative, matcher)));
    } else if (matcher(relative)) {
      files.push(relative);
    }
  }
  return files;
}

function decodeHtml(value = "") {
  const named = value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ");
  return named
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) =>
      String.fromCodePoint(Number.parseInt(number, 16)),
    );
}

function stripTags(value = "") {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value = "") {
  return (value.match(/\b[\p{L}\p{N}][\p{L}\p{N}'’.-]*\b/gu) ?? []).length;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractAttribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return decodeHtml(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function extractElements(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi"))]
    .map((match) => ({
      attributes: match[1],
      html: match[2],
      text: stripTags(match[2]),
      full: match[0],
    }));
}

function extractMetaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const tagName = extractAttribute(tag, "name");
    const property = extractAttribute(tag, "property");
    if (tagName === name || property === name) return extractAttribute(tag, "content");
  }
  return "";
}

function extractLinkHref(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (extractAttribute(tag, "rel") === rel) return extractAttribute(tag, "href");
  }
  return "";
}

function parseRouteConfig(source) {
  const routes = [{ path: "/", file: "app/routes/home.tsx" }];
  for (const match of source.matchAll(
    /\broute\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g,
  )) {
    routes.push({
      path: `/${match[1]}`,
      file: path.posix.join("app", match[2]),
    });
  }
  return routes;
}

function parseXmlPaths(source) {
  return [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    try {
      return new URL(match[1].trim()).pathname || "/";
    } catch {
      return "INVALID_URL";
    }
  });
}

function parseRootDirectory(source) {
  const start = source.indexOf("const TIMER_DIRECTORY");
  const end = source.indexOf("\n];", start);
  if (start < 0 || end < 0) return [];
  return unique(
    [...source.slice(start, end).matchAll(/href:\s*["'](\/[^"']*)["']/g)].map(
      (match) => match[1],
    ),
  );
}

function parseFooterRoutes(source) {
  const start = source.indexOf("export const footerSections");
  const end = source.indexOf("const footerLinkClass", start);
  if (start < 0 || end < 0) return [];
  return unique(
    [...source.slice(start, end).matchAll(/to:\s*["'](\/[^"']*)["']/g)].map(
      (match) => match[1],
    ),
  );
}

function routeType(routePath) {
  if (routePath === "/") return "homepage";
  if (routePath === "/free-online-timers") return "archived multi-tool page";
  if (routePath === "/sitemap") return "HTML directory";
  if (["/about", "/author/suhas-sunder", "/contact", "/how-ilovetimers-is-made", "/copyright"].includes(routePath)) {
    return "trust page";
  }
  if (["/privacy", "/terms", "/cookies"].includes(routePath)) return "legal page";
  if (/\/(?:1|5|10|15|30)-minute-timer$/.test(routePath)) return "preset-duration countdown";
  if (routePath === "/seconds-timer") return "seconds countdown";
  if (/calculator$/.test(routePath)) return "calculator";
  if (/converter$/.test(routePath)) return "converter";
  if (/clock$/.test(routePath) || routePath.includes("clock-with-")) return "clock or live time display";
  if (routePath.includes("stopwatch") || routePath.includes("count-up")) return "stopwatch or count-up tool";
  if (routePath.includes("countdown")) return "date or event countdown";
  if (routePath.includes("timer")) return "timer";
  if (["/metronome", "/bpm-tapper", "/reaction-time-test"].includes(routePath)) {
    return "interactive measurement or rhythm tool";
  }
  return "specialty time tool";
}

const intentGroups = [
  {
    id: "generic-countdowns",
    routes: [
      "/countdown-timer",
      "/online-timer",
      "/fullscreen-timer",
      "/silent-timer",
      "/visual-timer",
      "/alarm-timer",
      "/seconds-timer",
      "/1-minute-timer",
      "/5-minute-timer",
      "/10-minute-timer",
      "/15-minute-timer",
      "/30-minute-timer",
    ],
  },
  {
    id: "focus-study-break",
    routes: [
      "/pomodoro-timer",
      "/focus-session-timer",
      "/productivity-timer",
      "/study-timer",
      "/study-stopwatch",
      "/break-timer",
      "/count-up-timer",
    ],
  },
  {
    id: "meeting-classroom-presentation",
    routes: [
      "/meeting-timer",
      "/meeting-agenda-timer",
      "/meeting-count-up-timer",
      "/presentation-timer",
      "/speech-timer",
      "/classroom-timer",
      "/exam-timer",
      "/timer-clock",
    ],
  },
  {
    id: "kitchen-food",
    routes: [
      "/cooking-timer",
      "/kitchen-timer",
      "/tea-timer",
      "/egg-timer",
      "/pizza-timer",
    ],
  },
  {
    id: "interval-workout",
    routes: [
      "/interval-timer",
      "/hiit-timer",
      "/tabata-timer",
      "/workout-timer",
      "/rest-timer",
      "/emom-timer",
      "/amrap-timer",
      "/round-timer",
      "/boxing-timer",
      "/pace-timer",
      "/stretch-timer",
    ],
  },
  {
    id: "stopwatch-count-up",
    routes: [
      "/stopwatch",
      "/stopwatch-with-milliseconds",
      "/timer-stopwatch",
      "/study-stopwatch",
      "/count-up-timer",
      "/meeting-count-up-timer",
      "/binary-stopwatch",
      "/speedcubing-timer",
      "/speedrun-timer",
    ],
  },
  {
    id: "digital-local-clock",
    routes: [
      "/current-local-time",
      "/digital-clock",
      "/big-digital-clock",
      "/full-screen-clock",
      "/clock-with-seconds",
      "/clock-with-milliseconds",
      "/minimalist-clock",
      "/12-hour-clock",
      "/24-hour-clock",
      "/military-time-clock",
      "/atomic-clock",
      "/timer-clock",
    ],
  },
  {
    id: "analog-clock",
    routes: [
      "/analog-clock",
      "/analog-clock-with-second-hand",
      "/smooth-second-hand-clock",
      "/full-screen-analog-clock",
    ],
  },
  {
    id: "world-time",
    routes: [
      "/world-clock",
      "/world-clock-with-seconds",
      "/world-clock-with-milliseconds",
      "/utc-clock",
      "/time-zone-converter",
      "/time-zone-meeting-planner",
    ],
  },
  {
    id: "unix-milliseconds",
    routes: [
      "/epoch-unix-time-clock",
      "/unix-timestamp-converter",
      "/milliseconds-converter",
      "/millisecond-timer",
      "/stopwatch-with-milliseconds",
      "/clock-with-milliseconds",
    ],
  },
  {
    id: "event-date-countdown",
    routes: [
      "/event-countdown",
      "/countdown-to-date",
      "/new-year-countdown",
      "/christmas-countdown",
      "/birthday-countdown",
      "/days-until-calculator",
      "/hours-until-calculator",
    ],
  },
  {
    id: "date-calculators",
    routes: [
      "/date-calculator",
      "/date-duration-calculator",
      "/days-until-calculator",
      "/weeks-between-dates-calculator",
      "/months-between-dates-calculator",
      "/hours-until-calculator",
      "/weekday-calculator",
      "/week-number-calculator",
      "/age-calculator",
      "/business-days-calculator",
      "/workdays-calculator",
    ],
  },
  {
    id: "work-time-tracking",
    routes: [
      "/work-hours-calculator",
      "/time-card-calculator",
      "/weekly-timesheet-calculator",
      "/billable-hours-calculator",
      "/billable-hours-clock",
    ],
  },
  {
    id: "astronomy",
    routes: [
      "/sunrise-sunset-clock",
      "/golden-hour-clock",
      "/moon-phase-clock",
      "/astronomical-clock",
    ],
  },
  {
    id: "novelty-encoded-clocks",
    routes: [
      "/binary-clock",
      "/hexadecimal-clock",
      "/morse-code-clock",
      "/fibonacci-clock",
      "/roman-numeral-clock",
      "/retro-flip-clock",
      "/swatch-internet-time-clock",
    ],
  },
];

const routeToIntent = new Map();
for (const group of intentGroups) {
  for (const route of group.routes) {
    if (!routeToIntent.has(route)) routeToIntent.set(route, group.id);
  }
}

function closestOverlaps(routePath) {
  const groups = intentGroups.filter((group) => group.routes.includes(routePath));
  return unique(
    groups
      .flatMap((group) => group.routes)
      .filter((candidate) => candidate !== routePath),
  ).slice(0, 8);
}

const configurationCandidates = new Set([
  "/online-timer",
  "/productivity-timer",
  "/world-clock-with-seconds",
  "/world-clock-with-milliseconds",
  "/analog-clock-with-second-hand",
  "/full-screen-analog-clock",
  "/smooth-second-hand-clock",
  "/big-digital-clock",
  "/full-screen-clock",
  "/clock-with-seconds",
  "/minimalist-clock",
  "/countdown-to-date",
  "/new-year-countdown",
  "/christmas-countdown",
  "/birthday-countdown",
]);

const consolidationCandidates = new Set([
  "/online-timer",
  "/cooking-timer",
  "/kitchen-timer",
  "/productivity-timer",
  "/event-countdown",
  "/countdown-to-date",
]);

const humanReviewCandidates = new Set([
  "/debt-clock",
  "/debt-repayment-timer",
  "/atomic-clock",
  "/astronomical-clock",
  "/sunrise-sunset-clock",
  "/golden-hour-clock",
  "/moon-phase-clock",
]);

const conciseRoutes = new Set([
  "/seconds-timer",
  "/1-minute-timer",
  "/5-minute-timer",
  "/10-minute-timer",
  "/15-minute-timer",
  "/30-minute-timer",
  "/silent-timer",
  "/break-timer",
  "/rest-timer",
  "/tea-timer",
  "/egg-timer",
  "/pizza-timer",
  "/current-local-time",
  "/digital-clock",
  "/big-digital-clock",
  "/full-screen-clock",
  "/clock-with-seconds",
  "/minimalist-clock",
  "/12-hour-clock",
  "/24-hour-clock",
  "/military-time-clock",
  "/analog-clock",
  "/analog-clock-with-second-hand",
  "/full-screen-analog-clock",
  "/smooth-second-hand-clock",
  "/binary-clock",
  "/hexadecimal-clock",
  "/morse-code-clock",
  "/fibonacci-clock",
  "/roman-numeral-clock",
  "/retro-flip-clock",
  "/swatch-internet-time-clock",
]);

const methodologyRoutes = new Set([
  "/atomic-clock",
  "/clock-with-milliseconds",
  "/world-clock-with-milliseconds",
  "/utc-clock",
  "/epoch-unix-time-clock",
  "/unix-timestamp-converter",
  "/milliseconds-converter",
  "/military-time-converter",
  "/time-zone-converter",
  "/time-zone-meeting-planner",
  "/time-calculator",
  "/time-duration-calculator",
  "/date-duration-calculator",
  "/date-calculator",
  "/business-days-calculator",
  "/workdays-calculator",
  "/age-calculator",
  "/days-until-calculator",
  "/weekday-calculator",
  "/week-number-calculator",
  "/months-between-dates-calculator",
  "/weeks-between-dates-calculator",
  "/hours-until-calculator",
  "/work-hours-calculator",
  "/time-card-calculator",
  "/weekly-timesheet-calculator",
  "/billable-hours-calculator",
  "/billable-hours-clock",
  "/debt-clock",
  "/debt-repayment-timer",
  "/sunrise-sunset-clock",
  "/golden-hour-clock",
  "/moon-phase-clock",
  "/astronomical-clock",
  "/swatch-internet-time-clock",
  "/reaction-time-test",
  "/metronome",
  "/bpm-tapper",
]);

const citationRoutes = new Set([
  "/atomic-clock",
  "/utc-clock",
  "/epoch-unix-time-clock",
  "/unix-timestamp-converter",
  "/time-zone-converter",
  "/time-zone-meeting-planner",
  "/week-number-calculator",
  "/military-time-converter",
  "/sunrise-sunset-clock",
  "/golden-hour-clock",
  "/moon-phase-clock",
  "/astronomical-clock",
  "/swatch-internet-time-clock",
  "/reaction-time-test",
  "/metronome",
]);

const stage2Resolutions = new Map([
  ["/meeting-timer", {
    issueStatus: "resolved",
    methodologyStatus: "implemented behavior documented",
    citationStatus: "not required",
    remainingConcerns: ["Repeated legacy supporting content is deferred to the content rewrite stage."],
    evidenceFiles: ["app/routes/meeting-timer.tsx", "app/clients/components/meeting-timer/HowItWorks.tsx", "scripts/audits/stage2-accuracy.mjs"],
  }],
  ["/speedcubing-timer", {
    issueStatus: "resolved",
    methodologyStatus: "implemented session behavior documented",
    citationStatus: "not required",
    remainingConcerns: ["Durable solve history is deferred to feature work; the page now describes session-only results."],
    evidenceFiles: ["app/routes/speedcubing-timer.tsx", "scripts/audits/stage2-accuracy.mjs"],
  }],
  ["/atomic-clock", {
    issueStatus: "resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary sources added in Stage 2",
    remainingConcerns: ["The familiar route name remains with an immediate device-time qualification."],
    evidenceFiles: ["app/routes/atomic-clock.tsx", "app/clients/config/technicalSources.ts", "scripts/audits/stage2-accuracy.mjs"],
  }],
  ["/sunrise-sunset-clock", {
    issueStatus: "audit finding corrected",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary source added in Stage 2",
    remainingConcerns: ["The external API controls the modeled result and availability."],
    evidenceFiles: ["app/routes/sunrise-sunset-clock.tsx", "app/routes/privacy.tsx", "app/clients/config/technicalSources.ts"],
  }],
  ["/golden-hour-clock", {
    issueStatus: "partially resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary source added in Stage 2",
    remainingConcerns: ["The local solar approximation has not been validated across a broad coordinate and date reference dataset."],
    evidenceFiles: ["app/routes/golden-hour-clock.tsx", "app/clients/config/technicalSources.ts", "scripts/audits/stage2-accuracy.mjs"],
  }],
  ["/moon-phase-clock", {
    issueStatus: "partially resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary source added in Stage 2",
    remainingConcerns: ["The simple synodic-cycle estimate has not been validated across a broad historical and future reference dataset."],
    evidenceFiles: ["app/routes/moon-phase-clock.tsx", "app/clients/lib/technicalTimeMath.js", "scripts/tests/technical-time.mjs"],
  }],
  ["/astronomical-clock", {
    issueStatus: "partially resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary sources added in Stage 2",
    remainingConcerns: ["The UTC-instant and date-boundary error found in browser QA is fixed and tested; the combined local astronomy approximations still need broad reference-data validation."],
    evidenceFiles: ["app/routes/astronomical-clock.tsx", "app/routes/privacy.tsx", "app/clients/lib/technicalTimeMath.js", "scripts/tests/technical-time.mjs"],
  }],
  ...[
    "/utc-clock",
    "/epoch-unix-time-clock",
    "/swatch-internet-time-clock",
  ].map((route) => [route, {
    issueStatus: "resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary sources added in Stage 2",
    remainingConcerns: [],
    evidenceFiles: [`app/routes/${route.slice(1)}.tsx`, "app/clients/config/technicalSources.ts"],
  }]),
  ["/time-zone-converter", {
    issueStatus: "resolved",
    methodologyStatus: "revised in Stage 2",
    citationStatus: "primary sources added in Stage 2",
    remainingConcerns: ["Results depend on the IANA timezone data supplied by the user's JavaScript runtime."],
    evidenceFiles: ["app/routes/time-zone-converter.tsx", "app/clients/lib/technicalTimeMath.js", "scripts/tests/technical-time.mjs"],
  }],
  ["/time-zone-meeting-planner", {
    issueStatus: "resolved",
    methodologyStatus: "revised in Stage 2",
    citationStatus: "primary sources added in Stage 2",
    remainingConcerns: ["Results depend on runtime IANA timezone data; the planner does not model calendars or holidays."],
    evidenceFiles: ["app/routes/time-zone-meeting-planner.tsx", "app/clients/lib/technicalTimeMath.js", "scripts/tests/technical-time.mjs"],
  }],
  ["/unix-timestamp-converter", {
    issueStatus: "resolved",
    methodologyStatus: "revised in Stage 2",
    citationStatus: "primary sources added in Stage 2",
    remainingConcerns: ["Automatic unit detection remains a documented digit-count convention; users can override it."],
    evidenceFiles: ["app/routes/unix-timestamp-converter.tsx", "app/clients/lib/technicalTimeMath.js", "scripts/tests/technical-time.mjs"],
  }],
  ["/reaction-time-test", {
    issueStatus: "resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary source added in Stage 2",
    remainingConcerns: ["The result remains a browser measurement affected by hardware and scheduling latency."],
    evidenceFiles: ["app/routes/reaction-time-test.tsx", "app/clients/lib/technicalTimeMath.js", "scripts/tests/technical-time.mjs"],
  }],
  ["/metronome", {
    issueStatus: "resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary source added in Stage 2",
    remainingConcerns: ["Queued Web Audio clicks and device sleep remain documented browser limitations."],
    evidenceFiles: ["app/routes/metronome.tsx", "app/clients/lib/technicalTimeMath.js", "scripts/tests/technical-time.mjs"],
  }],
  ["/military-time-converter", {
    issueStatus: "resolved",
    methodologyStatus: "revised in Stage 2",
    citationStatus: "primary source added in Stage 2",
    remainingConcerns: [],
    evidenceFiles: ["app/routes/military-time-converter.tsx", "app/clients/config/technicalSources.ts", "scripts/audits/stage2-accuracy.mjs"],
  }],
  ["/week-number-calculator", {
    issueStatus: "resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "primary source added in Stage 2",
    remainingConcerns: [],
    evidenceFiles: ["app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx", "app/clients/lib/calculatorMath.js", "scripts/tests/calculator-formulas.mjs"],
  }],
  ...[
    ["/debt-clock", "app/routes/debt-clock.tsx"],
    ["/debt-repayment-timer", "app/routes/debt-repayment-timer.tsx"],
  ].map(([route, file]) => [route, {
    issueStatus: "resolved",
    methodologyStatus: "added in Stage 2",
    citationStatus: "not required; calculation is entirely user-entered",
    remainingConcerns: [],
    evidenceFiles: [file, "scripts/audits/stage2-accuracy.mjs"],
  }]),
  ["/privacy", {
    issueStatus: "resolved",
    methodologyStatus: "not applicable",
    citationStatus: "not required",
    remainingConcerns: [],
    evidenceFiles: ["app/routes/privacy.tsx", "app/routes/astronomical-clock.tsx", "scripts/tests/technical-time.mjs"],
  }],
  ["/how-ilovetimers-is-made", {
    issueStatus: "resolved",
    methodologyStatus: "repository check scope documented",
    citationStatus: "not required",
    remainingConcerns: [],
    evidenceFiles: ["app/routes/how-ilovetimers-is-made.tsx", "package.json"],
  }],
]);

const shareCandidates = new Map([
  ["/countdown-timer", ["duration", "sound"]],
  ["/online-timer", ["duration", "sound"]],
  ["/fullscreen-timer", ["duration", "sound"]],
  ["/visual-timer", ["duration", "display"]],
  ["/pomodoro-timer", ["work", "break", "longBreak", "cycles", "sound"]],
  ["/interval-timer", ["steps", "rounds", "sound"]],
  ["/hiit-timer", ["work", "rest", "rounds", "sound"]],
  ["/tabata-timer", ["work", "rest", "rounds", "sound"]],
  ["/round-timer", ["work", "rest", "rounds", "warmup", "sound"]],
  ["/boxing-timer", ["work", "rest", "rounds", "prep", "sound"]],
  ["/meeting-agenda-timer", ["items"]],
  ["/time-zone-converter", ["from", "to", "date", "time", "sec"]],
  ["/time-zone-meeting-planner", ["zones", "date", "window"]],
  ["/event-countdown", ["date", "time", "title"]],
  ["/countdown-to-date", ["date", "time"]],
  ["/birthday-countdown", ["date"]],
  ["/multiple-timers", ["timers"]],
  ["/time-blocking-clock", ["blocks"]],
  ["/workdays-calculator", ["start", "end", "weekdays"]],
]);

const localStorageCandidates = new Map([
  ["/countdown-timer", ["favorite durations"]],
  ["/online-timer", ["recent durations", "sound preference"]],
  ["/pomodoro-timer", ["named phase presets"]],
  ["/interval-timer", ["named interval routines"]],
  ["/hiit-timer", ["named workout presets"]],
  ["/tabata-timer", ["named workout presets"]],
  ["/round-timer", ["named round presets"]],
  ["/boxing-timer", ["named boxing presets"]],
  ["/multiple-timers", ["timer groups"]],
  ["/stopwatch", ["recent completed sessions"]],
  ["/stopwatch-with-milliseconds", ["recent completed sessions"]],
  ["/study-stopwatch", ["optional saved sessions, not live marker text by default"]],
  ["/speedcubing-timer", ["solve history"]],
  ["/speedrun-timer", ["split layouts and recent runs"]],
  ["/time-zone-meeting-planner", ["favorite timezone groups"]],
  ["/weekly-timesheet-calculator", ["draft rows with explicit clear control"]],
  ["/time-card-calculator", ["draft rows with explicit clear control"]],
]);

function contentScope(routePath, pageType) {
  if (["homepage", "trust page", "legal page", "HTML directory"].includes(pageType)) {
    return routePath === "/" ? "moderate" : "concise";
  }
  if (methodologyRoutes.has(routePath)) return "methodology-heavy";
  if (conciseRoutes.has(routePath)) return "concise";
  if (pageType === "preset-duration countdown") return "minimal";
  if (pageType.includes("clock")) return "concise";
  return "moderate";
}

function recommendation(routePath, pageType, repeatedContent, issues) {
  if (["/privacy", "/terms", "/cookies"].includes(routePath)) {
    return "retain with concise supporting content";
  }
  if (humanReviewCandidates.has(routePath)) return "requires human review";
  if (consolidationCandidates.has(routePath)) return "consider redirect or consolidation";
  if (configurationCandidates.has(routePath)) return "convert into a configuration of another tool";
  if (pageType === "preset-duration countdown" || conciseRoutes.has(routePath)) {
    return "retain with concise supporting content";
  }
  if (
    repeatedContent ||
    citationRoutes.has(routePath) ||
    issues.some((issue) =>
      /conflicts with the implemented|lost on refresh|disabled while running/i.test(
        issue,
      ),
    )
  ) {
    return "retain, but substantially improve";
  }
  return "retain as a distinct indexable tool";
}

async function resolveImport(fromFile, specifier) {
  if (
    !specifier ||
    specifier.startsWith("react") ||
    specifier.startsWith("@") ||
    (!specifier.startsWith(".") && !specifier.startsWith("~/"))
  ) {
    return null;
  }
  let base;
  if (specifier.startsWith("~/")) {
    base = path.join(APP_DIR, specifier.slice(2));
  } else {
    base = path.resolve(path.dirname(path.join(ROOT, fromFile)), specifier);
  }
  const candidates = path.extname(base)
    ? [base]
    : [
        `${base}.tsx`,
        `${base}.ts`,
        `${base}.js`,
        `${base}.jsx`,
        path.join(base, "index.tsx"),
        path.join(base, "index.ts"),
        path.join(base, "index.js"),
      ];
  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) {
        return path.relative(ROOT, candidate).replaceAll(path.sep, "/");
      }
    } catch {
      // Candidate does not exist.
    }
  }
  return null;
}

async function sourceBundle(entryFile, sources) {
  const queue = [entryFile];
  const visited = new Set();
  while (queue.length) {
    const file = queue.shift();
    if (!file || visited.has(file) || !sources.has(file)) continue;
    visited.add(file);
    const source = sources.get(file);
    const importSpecifiers = [
      ...source.matchAll(/\bfrom\s*["']([^"']+)["']/g),
      ...source.matchAll(/\bimport\s*["']([^"']+)["']/g),
    ].map((match) => match[1]);
    for (const specifier of importSpecifiers) {
      const resolved = await resolveImport(file, specifier);
      if (resolved && !visited.has(resolved)) queue.push(resolved);
    }
  }
  return [...visited];
}

function constantsFromSource(source) {
  const constants = new Map();
  for (const match of source.matchAll(
    /\bconst\s+([A-Z][A-Z0-9_]*)\s*=\s*["']([^"']+)["']/g,
  )) {
    constants.set(match[1], match[2]);
  }
  return constants;
}

function storageKeysFromSource(source) {
  const constants = constantsFromSource(source);
  const keys = [];
  for (const match of source.matchAll(
    /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*(["']([^"']+)["']|[A-Z][A-Z0-9_]*)/g,
  )) {
    const raw = match[1];
    keys.push(match[2] || constants.get(raw) || raw);
  }
  for (const match of source.matchAll(
    /usePersistentState(?:<[^>]+>)?\(\s*(["']([^"']+)["']|[A-Z][A-Z0-9_]*)/g,
  )) {
    const raw = match[1];
    keys.push(match[2] || constants.get(raw) || raw);
  }
  const globalKeys = new Set([
    "ilt-analytics-consent",
    "ilt-theme-mode",
    "ilt-posthog-capture-consent",
  ]);
  return unique(keys).filter(
    (key) => !key.includes("STORAGE_KEY") && !globalKeys.has(key),
  );
}

function parameterKeysFromSource(source) {
  return unique(
    [...source.matchAll(/searchParams\.(?:get|set|has|delete)\(\s*["']([^"']+)["']/g)].map(
      (match) => match[1],
    ),
  );
}

function staticInternalLinks(source) {
  return unique(
    [
      ...source.matchAll(
        /(?:\bto|\bhref)\s*(?:=|:)\s*["'](\/[^"'#?]*)[^"']*["']/g,
      ),
    ].map((match) => match[1] || "/"),
  );
}

function sourceClaims(source) {
  const flags = [];
  const lower = source.toLowerCase();
  for (const phrase of [
    "exact",
    "precise",
    "precision",
    "atomic",
    "official",
    "scientific",
    "astronomical",
    "accurate",
    "real-time",
    "perfect for",
  ]) {
    if (lower.includes(phrase)) flags.push(phrase);
  }
  return flags;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(BASE_URL, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // Production server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Production server did not become ready for the site-quality audit.");
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function parseRenderedPage(routePath, html) {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const mainHtml = mainMatch?.[1] ?? "";
  const mainText = stripTags(mainHtml);
  const h1 = extractElements(mainHtml, "h1")[0]?.text ?? "";
  const h1CloseIndex = mainHtml.search(/<\/h1>/i);
  let supportingHtml =
    h1CloseIndex >= 0 ? mainHtml.slice(h1CloseIndex + 5) : mainHtml;
  let utilityHtml = h1CloseIndex >= 0 ? mainHtml.slice(0, h1CloseIndex) : "";
  if (routePath === "/free-online-timers") {
    const supportingStart = mainHtml.search(
      /<h2\b[^>]*>\s*Timers for everyday use\s*<\/h2>/i,
    );
    if (supportingStart >= 0) {
      utilityHtml = mainHtml.slice(0, supportingStart);
      supportingHtml = mainHtml.slice(supportingStart);
    }
  }
  const supportingText = stripTags(supportingHtml);
  const utilityText = stripTags(utilityHtml);
  const headings = ["h2", "h3", "h4"].flatMap((tag) =>
    extractElements(mainHtml, tag).map((element) => ({
      level: tag,
      text: element.text,
    })),
  );
  const paragraphs = extractElements(mainHtml, "p")
    .map((element) => element.text)
    .filter((text) => wordCount(text) >= 5);
  const buttons = extractElements(utilityHtml, "button").map((element) => {
    const aria = extractAttribute(element.attributes, "aria-label");
    return aria || element.text;
  });
  const summaries = extractElements(utilityHtml, "summary").map((element) => element.text);
  const labels = extractElements(utilityHtml, "label").map((element) => element.text);
  const inputTags = utilityHtml.match(/<input\b[^>]*>/gi) ?? [];
  const selectElements = extractElements(utilityHtml, "select");
  const defaultValues = unique(
    inputTags
      .map((tag) => {
        const type = extractAttribute(tag, "type") || "text";
        const value = extractAttribute(tag, "value");
        const checked = /\bchecked(?:=|[\s>])/i.test(tag);
        if (type === "checkbox" || type === "radio") {
          return checked ? `${type}: checked` : "";
        }
        return value ? `${type}: ${value}` : "";
      })
      .concat(
        selectElements.flatMap((select) =>
          [...select.html.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)]
            .filter((match) => /\bselected(?:=|[\s>])/i.test(match[1]))
            .map((match) => `select: ${stripTags(match[2])}`),
        ),
      ),
  ).slice(0, 20);
  const controls = unique([...buttons, ...summaries, ...labels])
    .filter((text) => text && text.length <= 140)
    .slice(0, 40);
  const externalLinks = unique(
    [...mainHtml.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/gi)].map(
      (match) => decodeHtml(match[1]),
    ).filter((href) => !href.startsWith(SITE_URL)),
  );
  const adCount = (html.match(/data-ad-placeholder/g) ?? []).length;
  const title = extractElements(html, "title")[0]?.text ?? "";

  return {
    routePath,
    title,
    metaDescription: extractMetaContent(html, "description"),
    robots: extractMetaContent(html, "robots"),
    canonical: extractLinkHref(html, "canonical"),
    h1,
    mainWordCount: wordCount(mainText),
    supportingWordCount: wordCount(supportingText),
    utilityText: utilityText.slice(0, 500),
    controls,
    defaultValues,
    headings,
    paragraphs,
    externalLinks,
    adCount,
    html,
  };
}

function normalizeRepetitionText(value, routePath = "", h1 = "") {
  let normalized = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/&/g, " and ")
    .replace(/\b\d+(?::\d+)?(?:\.\d+)?\b/g, "#");
  const routeWords = unique(
    `${routePath.replaceAll("-", " ")} ${h1}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 3),
  ).sort((a, b) => b.length - a.length);
  for (const word of routeWords) {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, "g"), "<tool>");
  }
  return normalized
    .replace(/[^a-z0-9#<>']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceFilesForLiteral(literal, sources) {
  const needle = literal
    .replace(/[“”]/g, '"')
    .replace(/[’‘]/g, "'")
    .slice(0, 80)
    .toLowerCase();
  if (!needle) return [];
  const words = needle.split(/\s+/).filter(Boolean).slice(0, 8);
  return [...sources.entries()]
    .filter(([file, source]) => {
      if (SHARED_LAYOUT_FILES.has(file)) return false;
      const normalized = source
        .replace(/\s+/g, " ")
        .replace(/[“”]/g, '"')
        .replace(/[’‘]/g, "'")
        .toLowerCase();
      return words.length >= 1 && normalized.includes(words.join(" "));
    })
    .map(([file]) => file);
}

function createRepetitionReport(renderedPages, sources, routeFiles) {
  const headingOwners = new Map();
  const headingOccurrences = new Map();
  const paragraphOwners = new Map();
  const paragraphOccurrences = new Map();
  const templatedParagraphOwners = new Map();
  const templatedParagraphExamples = new Map();
  const phraseOwners = new Map();
  const phraseOccurrences = new Map();
  const promptPhrases = [
    "built for one job",
    "this page is not a guide",
    "what most people do",
    "fast use",
    "fastest setup",
    "at a glance",
    "real world examples",
    "real scenarios",
    "practical fit",
    "stays out of the way",
    "in plain terms",
    "this page is intentionally",
    "this route keeps",
    "what you are actually looking at",
    "quick checklist",
    "smooth run",
    "designed to help",
    "simple and easy",
    "perfect for",
    "whether you are",
    "you can use this",
    "this tool helps",
    "without distractions",
    "without unnecessary features",
  ];

  for (const page of renderedPages) {
    for (const heading of page.headings) {
      const key = heading.text.toLowerCase().replace(/\s+/g, " ").trim();
      if (!key) continue;
      headingOccurrences.set(key, (headingOccurrences.get(key) ?? 0) + 1);
      if (!headingOwners.has(key)) headingOwners.set(key, new Set());
      headingOwners.get(key).add(page.routePath);
    }

    for (const paragraph of page.paragraphs) {
      if (wordCount(paragraph) < 12) continue;
      const exact = paragraph
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[’‘]/g, "'")
        .trim();
      paragraphOccurrences.set(exact, (paragraphOccurrences.get(exact) ?? 0) + 1);
      if (!paragraphOwners.has(exact)) paragraphOwners.set(exact, new Set());
      paragraphOwners.get(exact).add(page.routePath);

      const templated = normalizeRepetitionText(paragraph, page.routePath, page.h1);
      if (!templatedParagraphOwners.has(templated)) {
        templatedParagraphOwners.set(templated, new Set());
        templatedParagraphExamples.set(templated, paragraph);
      }
      templatedParagraphOwners.get(templated).add(page.routePath);

      const words = normalizeRepetitionText(paragraph)
        .split(" ")
        .filter((word) => word && word !== "<tool>");
      for (let size = 5; size <= Math.min(10, words.length); size += 1) {
        for (let index = 0; index <= words.length - size; index += 1) {
          const phrase = words.slice(index, index + size).join(" ");
          if (!/[a-z]{3}/.test(phrase)) continue;
          phraseOccurrences.set(phrase, (phraseOccurrences.get(phrase) ?? 0) + 1);
          if (!phraseOwners.has(phrase)) phraseOwners.set(phrase, new Set());
          phraseOwners.get(phrase).add(page.routePath);
        }
      }
    }

    const normalizedMain = normalizeRepetitionText(
      `${page.headings.map((item) => item.text).join(" ")} ${page.paragraphs.join(" ")}`,
    );
    for (const phrase of promptPhrases) {
      const normalizedPhrase = normalizeRepetitionText(phrase);
      const count = normalizedMain.split(normalizedPhrase).length - 1;
      if (count <= 0) continue;
      phraseOccurrences.set(
        normalizedPhrase,
        (phraseOccurrences.get(normalizedPhrase) ?? 0) + count,
      );
      if (!phraseOwners.has(normalizedPhrase)) phraseOwners.set(normalizedPhrase, new Set());
      phraseOwners.get(normalizedPhrase).add(page.routePath);
    }
  }

  const repeatedHeadings = [...headingOwners.entries()]
    .filter(([, owners]) => owners.size >= 3)
    .map(([heading, owners]) => ({
      heading,
      occurrenceCount: headingOccurrences.get(heading) ?? owners.size,
      affectedRoutes: [...owners].sort(),
      affectedFiles: sourceFilesForLiteral(heading, sources),
    }))
    .sort(
      (a, b) =>
        b.affectedRoutes.length - a.affectedRoutes.length ||
        b.occurrenceCount - a.occurrenceCount ||
        a.heading.localeCompare(b.heading),
    );

  const repeatedParagraphs = [...paragraphOwners.entries()]
    .filter(([, owners]) => owners.size >= 2)
    .map(([paragraph, owners]) => ({
      paragraph,
      occurrenceCount: paragraphOccurrences.get(paragraph) ?? owners.size,
      affectedRoutes: [...owners].sort(),
      affectedFiles: sourceFilesForLiteral(paragraph, sources),
    }))
    .sort(
      (a, b) =>
        b.affectedRoutes.length - a.affectedRoutes.length ||
        b.occurrenceCount - a.occurrenceCount,
    )
    .slice(0, 100);

  const nearRepeatedParagraphs = [...templatedParagraphOwners.entries()]
    .filter(([, owners]) => owners.size >= 2)
    .map(([template, owners]) => ({
      normalizedTemplate: template,
      representativeExcerpt: templatedParagraphExamples.get(template),
      occurrenceCount: owners.size,
      affectedRoutes: [...owners].sort(),
      affectedFiles: sourceFilesForLiteral(
        templatedParagraphExamples.get(template) ?? "",
        sources,
      ),
    }))
    .sort((a, b) => b.affectedRoutes.length - a.affectedRoutes.length)
    .slice(0, 100);

  const phraseCandidates = [...phraseOwners.entries()]
    .filter(([phrase, owners]) => {
      const isPromptPhrase = promptPhrases.some(
        (prompt) => normalizeRepetitionText(prompt) === phrase,
      );
      return owners.size >= (isPromptPhrase ? 2 : 5);
    })
    .map(([phrase, owners]) => ({
      phrase,
      words: phrase.split(" ").length,
      occurrenceCount: phraseOccurrences.get(phrase) ?? owners.size,
      affectedRoutes: [...owners].sort(),
    }))
    .sort(
      (a, b) =>
        b.affectedRoutes.length * b.words - a.affectedRoutes.length * a.words ||
        b.occurrenceCount - a.occurrenceCount,
    );

  const repeatedPhrases = [];
  for (const candidate of phraseCandidates) {
    const redundant = repeatedPhrases.some(
      (kept) =>
        kept.affectedRoutes.join("|") === candidate.affectedRoutes.join("|") &&
        (kept.phrase.includes(candidate.phrase) || candidate.phrase.includes(kept.phrase)),
    );
    if (!redundant) repeatedPhrases.push(candidate);
    if (repeatedPhrases.length >= 120) break;
  }
  for (const item of repeatedPhrases) {
    item.affectedFiles = sourceFilesForLiteral(item.phrase, sources);
  }

  const templateFileRoutes = new Set();
  for (const [routePath, files] of routeFiles) {
    const roleNames = new Set(
      files
        .map((file) => path.posix.basename(file))
        .filter((file) =>
          ["HowItWorks.tsx", "FAQ.tsx", "PopularUseCases.tsx", "Disclaimer.tsx"].includes(file),
        ),
    );
    if (roleNames.size >= 3) templateFileRoutes.add(routePath);
  }

  const substantialRepeatedRoutes = renderedPages
    .filter((page) => {
      const repeatedHeadingCount = page.headings.filter((item) => {
        const owners = headingOwners.get(item.text.toLowerCase().replace(/\s+/g, " ").trim());
        return (owners?.size ?? 0) >= 8;
      }).length;
      const repeatedPhraseCount = repeatedPhrases.filter(
        (item) =>
          item.affectedRoutes.includes(page.routePath) &&
          item.affectedRoutes.length >= 8,
      ).length;
      return (
        templateFileRoutes.has(page.routePath) ||
        repeatedHeadingCount >= 3 ||
        repeatedPhraseCount >= 4
      );
    })
    .map((page) => page.routePath)
    .sort();

  const requestedPhraseAudit = promptPhrases.map((phrase) => {
    const normalizedPhrase = normalizeRepetitionText(phrase);
    const renderedOwners = phraseOwners.get(normalizedPhrase) ?? new Set();
    const affectedFiles = sourceFilesForLiteral(phrase, sources);
    const affectedFileSet = new Set(affectedFiles);
    const sourceOwners = [...routeFiles.entries()]
      .filter(([, files]) => files.some((file) => affectedFileSet.has(file)))
      .map(([routePath]) => routePath);
    const sourceOccurrenceCount = affectedFiles.reduce((total, file) => {
      const normalizedSource = (sources.get(file) ?? "")
        .replace(/\s+/g, " ")
        .replace(/[“”]/g, '"')
        .replace(/[’‘]/g, "'")
        .toLowerCase();
      const normalizedLiteral = phrase
        .replace(/\s+/g, " ")
        .replace(/[“”]/g, '"')
        .replace(/[’‘]/g, "'")
        .toLowerCase();
      return total + (normalizedSource.split(normalizedLiteral).length - 1);
    }, 0);
    const renderedOccurrenceCount =
      phraseOccurrences.get(normalizedPhrase) ?? 0;
    return {
      phrase,
      occurrenceCount:
        sourceOccurrenceCount > 0
          ? sourceOccurrenceCount
          : renderedOccurrenceCount,
      renderedOccurrenceCount,
      sourceOccurrenceCount,
      sourceFileCount: affectedFiles.length,
      affectedRoutes: unique([
        ...renderedOwners,
        ...sourceOwners,
      ]).sort(),
      affectedFiles,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    exclusionsUsedForSharedLayoutContent: [
      "Only text inside each route's first <main> element was analyzed.",
      "The global header, More directory, route-aware related-tools band, footer directory, analytics banner, and root WebSite schema were excluded.",
      "Exact paragraph analysis ignored paragraphs shorter than 12 words.",
      "Five-to-ten-word phrase analysis excluded route-title tokens and normalized numbers.",
    ],
    summary: {
      routesAnalyzed: renderedPages.length,
      repeatedHeadingGroups: repeatedHeadings.length,
      repeatedPhraseGroups: repeatedPhrases.length,
      exactRepeatedParagraphGroups: repeatedParagraphs.length,
      nearRepeatedParagraphGroups: nearRepeatedParagraphs.length,
      pagesWithSubstantialRepeatedContent: substantialRepeatedRoutes.length,
    },
    pagesWithSubstantialRepeatedContent: substantialRepeatedRoutes,
    requestedPhraseAudit,
    repeatedHeadings,
    repeatedPhrases,
    repeatedParagraphs,
    nearRepeatedParagraphs,
  };
}

function functionalitySummary(routePath, rendered, source) {
  const controls = rendered.controls.slice(0, 8).join(", ");
  const featureFlags = [];
  if (/AudioContext|createOscillator|new Audio\b/.test(source)) featureFlags.push("browser-generated audio");
  if (/useFullscreen|requestFullscreen/.test(source)) featureFlags.push("fullscreen");
  if (/navigator\.clipboard/.test(source)) featureFlags.push("copy");
  if (/navigator\.share/.test(source)) featureFlags.push("native share or copy fallback");
  if (/geolocation/.test(source)) featureFlags.push("optional geolocation");
  if (/calculate|converter|DateTimeFormat|performance\.now|Date\.now/.test(source)) {
    featureFlags.push("client-side calculation or live reconciliation");
  }
  const type = routeType(routePath);
  if (type === "homepage") {
    return "Navigation-first homepage with popular tool links, browse-by-task sections, FAQ, and two reserved ad placeholders.";
  }
  if (type === "trust page" || type === "legal page" || type === "HTML directory") {
    return `${rendered.h1} informational page with ${rendered.headings.length} supporting subsections.`;
  }
  const featureText = featureFlags.length ? ` It implements ${unique(featureFlags).join(", ")}.` : "";
  const controlText = controls ? ` SSR-visible controls include ${controls}.` : "";
  return `${rendered.h1} is implemented as a ${type}.${featureText}${controlText}`;
}

function visibleOutputSummary(rendered) {
  if (!rendered.utilityText) return "Textual page content; no separate tool output before the H1.";
  return rendered.utilityText
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function keyboardKeysFromSource(source) {
  const keys = [];
  for (const match of source.matchAll(
    /(?:event|e|keyboardEvent)\.key(?:\.toLowerCase\(\))?\s*===?\s*["']([^"']+)["']/g,
  )) {
    keys.push(match[1]);
  }
  for (const match of source.matchAll(
    /(?:case\s+|["'])(space|escape|enter|arrowleft|arrowright|arrowup|arrowdown|[a-z0-9])["']?\s*:/gi,
  )) {
    keys.push(match[1]);
  }
  return unique(keys.map((key) => (key === " " ? "Space" : key))).slice(0, 20);
}

function behaviorInspection(routePath, pageType, source, rendered, storageKeys) {
  const hasInteractiveControls = rendered.controls.length > 0;
  const isTimerLike =
    /timer|stopwatch|countdown|metronome|reaction|bpm|clock/i.test(
      `${routePath} ${pageType}`,
    ) && !["homepage", "trust page", "legal page", "HTML directory"].includes(pageType);
  const usesPerformanceClock = /performance\.now\(\)/.test(source);
  const usesWallClock = /Date\.now\(\)|new Date\(/.test(source);
  const usesTargetTimestamp =
    /(?:end|target|deadline|startedAt|startTime)[A-Za-z]*Ref[\s\S]{0,160}(?:performance\.now|Date\.now)|(?:performance\.now|Date\.now)\(\)[\s\S]{0,160}(?:end|target|deadline|startedAt|startTime)[A-Za-z]*Ref/i.test(
      source,
    );
  const usesAnimationFrame = /requestAnimationFrame/.test(source);
  const usesInterval = /setInterval/.test(source);
  const hasAudio = /AudioContext|createOscillator|new Audio\b/.test(source);
  const hasFullscreen = /useFullscreen|requestFullscreen/.test(source);
  const hasHotkeys = /useHotkeys|onKeyDown|addEventListener\(\s*["']keydown/.test(source);
  const hasVisibilityListener = /visibilitychange/.test(source);
  const hasNotifications = /\bNotification\b|serviceWorker\.showNotification/.test(source);
  const hasWakeLock = /wakeLock|WakeLock/.test(source);
  const hasAutomaticAdvance =
    /nextPhase|advancePhase|nextStep|advanceStep|phaseIndex|stepIndex|currentRound|cycleCount|nextRound/i.test(
      source,
    );
  const settingsDisabledWhileRunning =
    /disabled=\{[^}]{0,100}(?:running|isRunning|status\s*===\s*["']running)/i.test(
      source,
    );
  const hasMutableSettings =
    /<Field|<Select|<input|<select|<Toggle/.test(source);
  const validatesInputs =
    /Math\.(?:min|max|floor|ceil)|\bclamp\(|aria-invalid|setError|invalid/i.test(
      source,
    );
  const keyList = keyboardKeysFromSource(source);
  const liveStatePersistence =
    storageKeys.length > 0 &&
    /running|remaining|elapsed|status|startedAt|endAt|timers|sessions|history/i.test(
      source,
    );

  let timingEngine = "not applicable";
  if (isTimerLike) {
    if (usesTargetTimestamp && usesPerformanceClock) {
      timingEngine =
        "monotonic performance-clock target/reference with scheduled rendering";
    } else if (usesTargetTimestamp && usesWallClock) {
      timingEngine =
        "device wall-clock target/reference with scheduled rendering";
    } else if (usesPerformanceClock) {
      timingEngine = "monotonic performance clock";
    } else if (usesWallClock && /clock|date|timezone|unix|epoch/i.test(routePath)) {
      timingEngine = "device wall clock read on scheduled updates";
    } else if (usesInterval) {
      timingEngine = "interval-driven scheduled updates";
    } else {
      timingEngine = "state-driven browser implementation";
    }
  }

  let backgroundBehavior = "not applicable";
  if (isTimerLike) {
    if (usesTargetTimestamp || /clock|date|timezone|unix|epoch/i.test(routePath)) {
      backgroundBehavior =
        "time is derived from a target/reference or fresh clock read, so the display can reconcile when callbacks resume; background throttling can delay visual updates and completion side effects";
    } else if (usesPerformanceClock) {
      backgroundBehavior =
        "elapsed time uses a monotonic reference, but scheduled rendering and completion behavior still pause or throttle with the page";
    } else {
      backgroundBehavior =
        "no explicit target-time reconciliation was detected; browser throttling can delay updates";
    }
  }

  return {
    startPauseResumeReset:
      hasInteractiveControls
        ? "Control labels are listed in availableControls; dynamic Pause/Resume labels may not appear in the initial SSR snapshot."
        : "No separate interactive start/pause/reset workflow.",
    settingsWhileRunning:
      !hasMutableSettings
        ? "No mutable settings detected."
        : settingsDisabledWhileRunning
          ? "At least some settings are disabled while the active state is running."
          : "Settings are not globally disabled by a running-state guard; individual handlers determine whether changes apply immediately or on the next reset/phase.",
    automaticAdvance:
      hasAutomaticAdvance
        ? "Phase, step, round, or cycle advancement logic is present."
        : "No phase/round auto-advance pattern detected.",
    sound:
      hasAudio
        ? "Web Audio or an HTML audio path is present; user interaction, mute/volume state, throttling, and sleep can affect delivery."
        : "No audio-generation path detected.",
    fullscreen:
      hasFullscreen
        ? "Uses the browser Fullscreen API; requires browser support and normally a user gesture."
        : "No route-level fullscreen implementation detected.",
    keyboard:
      hasHotkeys
        ? {
            implemented: true,
            detectedKeys: keyList,
            note: "Most handlers ignore form-field typing; focus requirements vary by route.",
          }
        : { implemented: false, detectedKeys: [], note: "No route hotkey handler detected." },
    browserNotifications:
      hasNotifications
        ? "Notification API path detected."
        : "No browser Notification API or service-worker notification path detected.",
    pageVisibility:
      hasVisibilityListener
        ? "An explicit visibilitychange listener reconciles or updates state."
        : "No explicit route visibilitychange handler detected.",
    backgroundTabBehavior: backgroundBehavior,
    deviceSleep:
      hasWakeLock
        ? "A Wake Lock API path is present, but platform support and revocation still require handling."
        : isTimerLike
          ? "No Wake Lock or background service is implemented; device sleep can suspend display, audio, and completion behavior."
          : "No special device-sleep behavior.",
    refreshAndClosePersistence:
      storageKeys.length
        ? liveStatePersistence
          ? `Local storage is used (${storageKeys.join(", ")}); inspect each stored payload before assuming every live state survives refresh.`
          : `Preferences or records use local storage (${storageKeys.join(", ")}); the active in-memory session is not proven to survive refresh or tab close.`
        : "No route-local persistence key detected; active state is in memory and is lost on refresh or tab close.",
    multipleTabs:
      storageKeys.length
        ? "Tabs can read or overwrite the same local-storage keys, but no route-level BroadcastChannel or cross-tab live-session coordination was detected."
        : "Each tab runs independent in-memory state; no cross-tab coordination detected.",
    timingEngine,
    reliesOnDeviceClock:
      pageType === "calculator"
        ? "Arithmetic is deterministic; current-date/time defaults, where present, come from the device clock."
        : usesWallClock
        ? "yes for current date/time or target anchoring"
        : usesPerformanceClock
          ? "uses the browser monotonic performance clock rather than civil time"
          : "not detected",
    inputValidation:
      validatesInputs
        ? "Clamping, numeric normalization, or invalid-state handling is present in source; route-specific limits are reflected in controls/defaults and methodology notes."
        : "No general validation/clamping pattern detected.",
    mobileBehavior:
      "Responsive CSS is present in the route/shared primitives; no separate mobile timing engine or background capability is implemented.",
    accessibility:
      /aria-|<Field|<Select|<Button|<Toggle|role=/.test(source)
        ? "Accessible names, shared labeled fields, roles, or keyboard handling are present; representative browser checks are still required."
        : "No substantial route-specific accessibility markup detected beyond native elements.",
    schedulerSignals: {
      requestAnimationFrame: usesAnimationFrame,
      setInterval: usesInterval,
      performanceNow: usesPerformanceClock,
      dateNowOrDateObject: usesWallClock,
      targetTimestampPattern: usesTargetTimestamp,
      note: "Signals come from the route's statically imported source bundle; shared family files can also contain sibling-route code.",
    },
  };
}

function claimIssues(routePath, source, rendered) {
  const issues = [];
  const lower = `${source}\n${rendered.paragraphs.join("\n")}`.toLowerCase();
  if (lower.includes("perfect for")) {
    issues.push("Uses subjective “perfect for” language that cannot be verified and adds little task-specific evidence.");
  }
  if (citationRoutes.has(routePath) && rendered.externalLinks.length === 0) {
    issues.push("Technical or precision-related claims are unsupported by an external primary-source citation on the page.");
  }
  if (/AudioContext|createOscillator|new Audio\b/.test(source) && !/device sleep|sleep mode|keep.*awake/i.test(lower)) {
    issues.push("Audio is implemented, but the visible text does not clearly explain device-sleep delivery limits.");
  }
  if (/performance\.now\(\)|Date\.now\(\)/.test(source) && !/background|inactive tab|throttl|device sleep/i.test(lower)) {
    issues.push("Live timing depends on browser scheduling, but the page lacks a clear background-tab or sleep limitation.");
  }
  if (
    ["/astronomical-clock", "/golden-hour-clock", "/moon-phase-clock"].includes(routePath) &&
    !source.includes("TechnicalMethod")
  ) {
    issues.push("Astronomical output lacks a visible named method, limitations, and primary-source citation.");
  }
  if (
    routePath === "/meeting-timer" &&
    /change.{0,60}minutes.{0,60}while.{0,30}running/i.test(lower)
  ) {
    issues.push("The visible instructions say changing minutes during a run resets the timer, but the minute presets and custom-minute field are disabled while running; the user must pause first.");
  }
  if (
    routePath === "/speedcubing-timer" &&
    /local history|solves? (?:are|is) saved|survive.*refresh/i.test(lower)
  ) {
    issues.push("The interface calls solves “saved” and “local history,” but only preferences are persisted; solve rows and averages are lost on refresh or tab close.");
  }
  if (
    routePath === "/time-zone-converter" &&
    !source.includes("resolveZonedWallTime")
  ) {
    issues.push("Calendar validation accepts impossible dates such as February 31 and lets Date.UTC normalize them; ambiguous and nonexistent DST wall times are warned about but not explicitly detected in the result.");
  }
  if (
    routePath === "/unix-timestamp-converter" &&
    !source.includes("parseUtcDateTime")
  ) {
    issues.push("The UTC date-time parser does not round-trip its components, so impossible calendar dates can be silently normalized instead of rejected.");
  }
  return unique(issues);
}

const [
  routeConfigSource,
  xmlSitemapSource,
  rootSource,
  footerSource,
  appFiles,
] = await Promise.all([
  read("app/routes.ts"),
  read("public/sitemap.xml"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
  listFiles("app", (file) => /\.(?:js|jsx|ts|tsx)$/.test(file)),
]);

const sources = new Map(
  await Promise.all(appFiles.map(async (file) => [file, await read(file)])),
);
const canonicalRoutes = parseRouteConfig(routeConfigSource);
const canonicalRouteSet = new Set(canonicalRoutes.map((route) => route.path));
const xmlPaths = new Set(parseXmlPaths(xmlSitemapSource));
const moreDirectoryRoutes = new Set(
  parseRootDirectory(rootSource).filter(
    (routePath) =>
      !STAGE3_NOINDEX_ROUTE_SET.has(routePath) &&
      !STAGE3_REDIRECT_SOURCE_SET.has(routePath),
  ),
);
const footerRoutes = new Set(parseFooterRoutes(footerSource));
const htmlSitemapRoutes = new Set(
  SITEMAP_GROUPS.flatMap((group) => group.routes),
);

const bundlesByRoute = new Map();
for (const route of canonicalRoutes) {
  bundlesByRoute.set(route.path, await sourceBundle(route.file, sources));
}

const sourceByRoute = new Map();
for (const route of canonicalRoutes) {
  sourceByRoute.set(
    route.path,
    (bundlesByRoute.get(route.path) ?? [])
      .map((file) => sources.get(file) ?? "")
      .join("\n"),
  );
}

const contextualOutgoing = new Map();
for (const route of canonicalRoutes) {
  const files = bundlesByRoute.get(route.path) ?? [];
  const links =
    route.path === "/sitemap"
      ? []
      : unique(
          files
            .filter((file) => !SHARED_LAYOUT_FILES.has(file))
            .flatMap((file) => staticInternalLinks(sources.get(file) ?? "")),
        ).filter((link) => canonicalRouteSet.has(link) && link !== route.path);
  contextualOutgoing.set(route.path, links);
}
const contextualIncoming = new Map(
  canonicalRoutes.map((route) => [route.path, []]),
);
for (const [sourceRoute, destinations] of contextualOutgoing) {
  for (const destination of destinations) {
    contextualIncoming.get(destination)?.push(sourceRoute);
  }
}
for (const values of contextualIncoming.values()) values.sort();

const server = spawn(process.execPath, ["server.js"], {
  cwd: ROOT,
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(PORT),
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverStdout = "";
let serverStderr = "";
server.stdout.on("data", (chunk) => {
  serverStdout += chunk;
});
server.stderr.on("data", (chunk) => {
  serverStderr += chunk;
});

let renderedPages;
try {
  await waitForServer();
  renderedPages = await mapWithConcurrency(canonicalRoutes, 10, async (route) => {
    const response = await fetch(`${BASE_URL}${route.path}`, {
      redirect: "manual",
    });
    const html = await response.text();
    if (response.status !== 200) {
      throw new Error(`${route.path} returned ${response.status}`);
    }
    return parseRenderedPage(route.path, html);
  });
} finally {
  server.kill();
}

if (!renderedPages) {
  throw new Error(
    `Rendering failed.\nstdout:\n${serverStdout}\nstderr:\n${serverStderr}`,
  );
}

const renderedByPath = new Map(
  renderedPages.map((page) => [page.routePath, page]),
);
const repetitionReport = createRepetitionReport(
  renderedPages,
  sources,
  bundlesByRoute,
);
const repeatedRouteSet = new Set(
  repetitionReport.pagesWithSubstantialRepeatedContent,
);

const canonicalInventory = canonicalRoutes.map((route) => {
  const rendered = renderedByPath.get(route.path);
  const source = sourceByRoute.get(route.path) ?? "";
  const stage2 = stage2Resolutions.get(route.path);
  const evidenceFiles = unique([
    ...(bundlesByRoute.get(route.path) ?? [route.file]),
    ...(stage2?.evidenceFiles ?? []),
  ]);
  const storageKeys = storageKeysFromSource(source);
  const urlParameters = parameterKeysFromSource(source);
  const issues = [];
  if (repeatedRouteSet.has(route.path)) {
    issues.push("Substantial route content follows a repeated editorial/template pattern.");
  }
  if ((contextualIncoming.get(route.path) ?? []).length === 0) {
    issues.push("No static contextual incoming link was found outside global directory/navigation sources.");
  }
  if (rendered.supportingWordCount > 1800 && conciseRoutes.has(route.path)) {
    issues.push("Supporting content is disproportionate to the simplicity of the tool.");
  }
  if (rendered.supportingWordCount < 180 && methodologyRoutes.has(route.path)) {
    issues.push("Technical output has too little visible methodology or limitation context.");
  }
  if (configurationCandidates.has(route.path)) {
    issues.push("Functionality substantially overlaps another route and could be exposed as a saved configuration or display mode.");
  }
  if (consolidationCandidates.has(route.path)) {
    issues.push("Search intent and implemented controls substantially overlap a sibling route; consolidation should be evaluated with query/page data.");
  }
  issues.push(...claimIssues(route.path, source, rendered));

  const templateFiles = evidenceFiles.filter((file) =>
    /\/(?:HowItWorks|FAQ|PopularUseCases|Disclaimer)\.tsx$/.test(file),
  );
  const pageType = routeType(route.path);
  const primaryIntent =
    routeToIntent.get(route.path) ??
    SITEMAP_GROUPS.find((group) => group.routes.includes(route.path))?.title ??
    pageType;
  const currentIndexing = rendered.robots || "No route robots meta found";
  const share = shareCandidates.get(route.path);
  const storageCandidate = localStorageCandidates.get(route.path);

  return {
    path: route.path,
    routeKind: "canonical",
    routeFile: route.file,
    pageType,
    primaryIntent,
    currentTitle: rendered.title,
    currentMetaDescription: rendered.metaDescription,
    currentCanonical: rendered.canonical,
    currentIndexing,
    currentSitemapStatus: xmlPaths.has(route.path)
      ? "included in XML and HTML sitemaps"
      : htmlSitemapRoutes.has(route.path)
        ? "HTML sitemap only"
        : "not included",
    primaryHeading: rendered.h1,
    approximateVisibleSupportingWordCount: rendered.supportingWordCount,
    approximateTotalMainWordCount: rendered.mainWordCount,
    functionalitySummary: functionalitySummary(route.path, rendered, source),
    distinctiveFeatures: unique([
      /AudioContext|createOscillator|new Audio\b/.test(source)
        ? "browser audio"
        : "",
      /useFullscreen|requestFullscreen/.test(source) ? "fullscreen" : "",
      /navigator\.clipboard/.test(source) ? "copy" : "",
      /navigator\.share/.test(source) ? "share" : "",
      /geolocation/.test(source) ? "geolocation" : "",
      storageKeys.length > 0 ? "local persistence" : "",
      /searchParams\.(?:get|set)/.test(source) ? "URL configuration" : "",
      /visibilitychange/.test(source) ? "visibility reconciliation" : "",
      /FAQPage/.test(source) ? "visible FAQ with FAQ schema" : "",
    ]),
    availableControls: rendered.controls,
    defaultValues: rendered.defaultValues,
    outputProduced: visibleOutputSummary(rendered),
    localStorageUse: {
      implemented: storageKeys.length > 0,
      keys: storageKeys,
    },
    urlParameterUse: {
      implemented: urlParameters.length > 0,
      parameters: urlParameters,
    },
    closestOverlaps: closestOverlaps(route.path),
    internalLinksPointingToIt: {
      contextualIncomingRoutes: contextualIncoming.get(route.path) ?? [],
      contextualIncomingCount: (contextualIncoming.get(route.path) ?? []).length,
      inGlobalFooter: footerRoutes.has(route.path),
      inMoreDirectory: moreDirectoryRoutes.has(route.path),
      inHtmlSitemap: htmlSitemapRoutes.has(route.path),
    },
    editorialPattern:
      templateFiles.length >= 3
        ? `legacy multi-section template (${templateFiles.map((file) => path.posix.basename(file, ".tsx")).join(", ")})`
        : repeatedRouteSet.has(route.path)
          ? "substantial repeated heading/phrase structure"
          : "predominantly route-specific",
    contentScope: contentScope(route.path, pageType),
    preliminaryRecommendation: recommendation(
      route.path,
      pageType,
      repeatedRouteSet.has(route.path),
      issues,
    ),
    methodologyRequired: methodologyRoutes.has(route.path),
    citationsRequired: citationRoutes.has(route.path),
    shareConfigurationCandidate: share
      ? { candidate: true, suggestedParameters: share }
      : { candidate: false, suggestedParameters: [] },
    localStorageCandidate: storageCandidate
      ? { candidate: true, suggestedData: storageCandidate }
      : { candidate: false, suggestedData: [] },
    behaviorInspection: behaviorInspection(
      route.path,
      pageType,
      source,
      rendered,
      storageKeys,
    ),
    technicalClaimTermsFound: sourceClaims(source),
    issueStatus:
      stage2?.issueStatus ??
      (repeatedRouteSet.has(route.path)
        ? "deferred to content rewrite"
        : configurationCandidates.has(route.path) ||
            consolidationCandidates.has(route.path)
          ? "deferred to route architecture"
          : "no Stage 2 accuracy issue recorded"),
    methodologyStatus:
      stage2?.methodologyStatus ??
      (methodologyRoutes.has(route.path)
        ? "present before Stage 2 or not changed in this stage"
        : "not required"),
    citationStatus:
      stage2?.citationStatus ??
      (citationRoutes.has(route.path)
        ? rendered.externalLinks.length > 0
          ? "present"
          : "not added in Stage 2"
        : "not required"),
    remainingConcerns:
      stage2?.remainingConcerns ??
      unique(issues).filter((issue) =>
        /repeated|overlap|consolidat|contextual incoming|disproportionate/i.test(
          issue,
        ),
      ),
    issues: unique(issues),
    evidenceFiles,
  };
});

const redirectInventory = Object.entries(PERMANENT_REDIRECTS).map(
  ([source, destination]) => ({
    path: source,
    routeKind: "permanent redirect alias",
    pageType: "legacy or synonym alias",
    primaryIntent:
      routeToIntent.get(destination) ??
      canonicalInventory.find((route) => route.path === destination)?.primaryIntent ??
      "redirect",
    currentTitle: null,
    currentMetaDescription: null,
    currentCanonical: `301 redirect to ${destination}; destination is self-canonical`,
    currentIndexing: "not independently indexable; one-hop permanent redirect",
    currentSitemapStatus: "excluded from XML and HTML sitemaps",
    primaryHeading: null,
    approximateVisibleSupportingWordCount: 0,
    approximateTotalMainWordCount: 0,
    functionalitySummary: Object.hasOwn(STAGE3_NEW_REDIRECTS, source)
      ? `Permanently redirects to ${destination} and drops unsupported legacy query parameters.`
      : `Preserves the query string and permanently redirects to ${destination}.`,
    distinctiveFeatures: Object.hasOwn(STAGE3_NEW_REDIRECTS, source)
      ? ["one-hop 301", "unsupported-query removal"]
      : ["one-hop 301", "query-string preservation"],
    availableControls: [],
    defaultValues: [],
    outputProduced: `HTTP 301 Location: ${destination}`,
    localStorageUse: { implemented: false, keys: [] },
    urlParameterUse: {
      implemented: true,
      parameters: [
        Object.hasOwn(STAGE3_NEW_REDIRECTS, source)
          ? "unsupported legacy query parameters are removed"
          : "all existing query parameters are preserved",
      ],
    },
    closestOverlaps: [destination],
    internalLinksPointingToIt: {
      contextualIncomingRoutes: [],
      contextualIncomingCount: 0,
      inGlobalFooter: false,
      inMoreDirectory: false,
      inHtmlSitemap: false,
    },
    editorialPattern: "no page content",
    contentScope: "none",
    preliminaryRecommendation: "consider redirect or consolidation",
    methodologyRequired: false,
    citationsRequired: false,
    shareConfigurationCandidate: {
      candidate: false,
      suggestedParameters: [],
    },
    localStorageCandidate: { candidate: false, suggestedData: [] },
    behaviorInspection: {
      startPauseResumeReset: "No controls; the request receives an HTTP redirect.",
      settingsWhileRunning: "Not applicable.",
      automaticAdvance: "Not applicable.",
      sound: "Not applicable.",
      fullscreen: "Not applicable.",
      keyboard: { implemented: false, detectedKeys: [], note: "Not applicable." },
      browserNotifications: "Not applicable.",
      pageVisibility: "Not applicable.",
      backgroundTabBehavior: "Not applicable.",
      deviceSleep: "Not applicable.",
      refreshAndClosePersistence: "Not applicable.",
      multipleTabs: "Not applicable.",
      timingEngine: "Not applicable.",
      reliesOnDeviceClock: "Not applicable.",
      inputValidation: "Not applicable.",
      mobileBehavior: "Not applicable.",
      accessibility: "Not applicable.",
      schedulerSignals: {
        requestAnimationFrame: false,
        setInterval: false,
        performanceNow: false,
        dateNowOrDateObject: false,
        targetTimestampPattern: false,
      },
    },
    technicalClaimTermsFound: [],
    issueStatus: "deferred to route architecture",
    methodologyStatus: "not applicable",
    citationStatus: "not required",
    remainingConcerns: ["Redirect and consolidation decisions are outside Stage 2."],
    issues: [],
    evidenceFiles: [
      "app/config/redirects.js",
      "app/root.tsx",
      "server.js",
      "public/_redirects",
    ],
  }),
);

const errorInventory = {
  path: "* (unmatched URL)",
  routeKind: "catch-all 404 error response",
  routeFile: "app/root.tsx",
  pageType: "error page",
  primaryIntent: "not-found recovery",
  currentTitle: "Page Not Found | iLoveTimers",
  currentMetaDescription: null,
  currentCanonical: "No canonical element on the rendered 404 response",
  currentIndexing: "HTTP 404; noindex,follow robots meta",
  currentSitemapStatus: "excluded from XML and HTML sitemaps",
  primaryHeading: "Page not found",
  approximateVisibleSupportingWordCount: 35,
  approximateTotalMainWordCount: 35,
  functionalitySummary: "Returns HTTP 404 with a clear title, recovery links, and four small category links.",
  distinctiveFeatures: ["HTTP 404 response", "noindex", "recovery navigation"],
  availableControls: ["Homepage", "Tool directory", "Four category links"],
  defaultValues: [],
  outputProduced: "404 explanation and recovery navigation",
  localStorageUse: { implemented: false, keys: [] },
  urlParameterUse: { implemented: false, parameters: [] },
  closestOverlaps: [],
  internalLinksPointingToIt: {
    contextualIncomingRoutes: [],
    contextualIncomingCount: 0,
    inGlobalFooter: false,
    inMoreDirectory: false,
    inHtmlSitemap: false,
  },
  editorialPattern: "single shared error boundary",
  contentScope: "minimal",
  preliminaryRecommendation: "retain with concise supporting content",
  methodologyRequired: false,
  citationsRequired: false,
  shareConfigurationCandidate: { candidate: false, suggestedParameters: [] },
  localStorageCandidate: { candidate: false, suggestedData: [] },
  behaviorInspection: {
    startPauseResumeReset: "No tool controls.",
    settingsWhileRunning: "Not applicable.",
    automaticAdvance: "Not applicable.",
    sound: "Not applicable.",
    fullscreen: "Not applicable.",
    keyboard: { implemented: false, detectedKeys: [], note: "Not applicable." },
    browserNotifications: "Not applicable.",
    pageVisibility: "Not applicable.",
    backgroundTabBehavior: "Not applicable.",
    deviceSleep: "Not applicable.",
    refreshAndClosePersistence: "Not applicable.",
    multipleTabs: "Not applicable.",
    timingEngine: "Not applicable.",
    reliesOnDeviceClock: "Not applicable.",
    inputValidation: "Not applicable.",
    mobileBehavior: "The compact recovery links wrap at narrow breakpoints.",
    accessibility: "One visible H1, labeled recovery navigation, native links, and focus-visible styling are present.",
    schedulerSignals: {
      requestAnimationFrame: false,
      setInterval: false,
      performanceNow: false,
      dateNowOrDateObject: false,
      targetTimestampPattern: false,
      note: "Not applicable.",
    },
  },
  technicalClaimTermsFound: [],
  issueStatus: "resolved",
  methodologyStatus: "not applicable",
  citationStatus: "not required",
  remainingConcerns: [],
  issues: [],
  evidenceFiles: ["app/root.tsx", "app/routes.ts", "scripts/audits/stage2-accuracy.mjs"],
};

const routeArchitectureManifest = JSON.parse(
  await read("docs/route-architecture-manifest.json"),
);
const architectureByPath = new Map(
  routeArchitectureManifest.map((entry) => [entry.sourcePath, entry]),
);

function addArchitectureDecision(entry) {
  const architecture = architectureByPath.get(entry.path);
  if (!architecture) {
    return {
      ...entry,
      finalStage3Status: "not applicable",
      remainingContentWork: "not applicable",
      laterRewriteScope: "no later rewrite",
    };
  }
  return {
    ...entry,
    finalStage3Status: architecture.newStatus,
    finalStage3StatusLabel: architecture.statusLabel,
    canonicalDestination: architecture.canonicalDestination,
    indexability: architecture.indexability,
    sitemapStatus: architecture.sitemapStatus,
    redirectDestination: architecture.redirectDestination,
    overlapGroup: architecture.overlapGroup,
    retainedDistinctiveFunctionality:
      architecture.retainedDistinctiveFunctionality,
    stage3DecisionReason: architecture.reason,
    stage3ImplementationEvidence: architecture.implementationEvidence,
    remainingContentWork: architecture.remainingContentWork,
    laterRewriteScope: architecture.laterRewriteScope,
    finalRecommendation: architecture.statusLabel,
  };
}

const routeInventory = [
  ...canonicalInventory.map(addArchitectureDecision),
  ...redirectInventory.map(addArchitectureDecision),
  addArchitectureDecision(errorInventory),
];

repetitionReport.routes = routeArchitectureManifest.map((architecture) => ({
  sourcePath: architecture.sourcePath,
  finalStage3Status: architecture.newStatus,
  canonicalDestination: architecture.canonicalDestination,
  visibleRepetitionStatus:
    architecture.indexability === "redirect"
      ? "no visible page after redirect"
      : repetitionReport.pagesWithSubstantialRepeatedContent.includes(
            architecture.sourcePath,
          )
        ? "substantial visible repetition remains"
        : "no substantial repetition flag",
  indexability: architecture.indexability,
  sitemapIncluded: architecture.sitemapIncluded,
  remainingContentWork: architecture.remainingContentWork,
  laterRewriteScope: architecture.laterRewriteScope,
}));
repetitionReport.summary.stage3ArchitectureStatuses =
  routeArchitectureManifest.reduce((counts, route) => {
    counts[route.newStatus] = (counts[route.newStatus] ?? 0) + 1;
    return counts;
  }, {});
repetitionReport.summary.noindexDoesNotResolveVisibleRepetition = true;

await writeFile(
  path.join(DOCS_DIR, "adsense-route-inventory.json"),
  `${JSON.stringify(routeInventory, null, 2)}\n`,
  "utf8",
);
await writeFile(
  path.join(DOCS_DIR, "content-repetition-report.json"),
  `${JSON.stringify(repetitionReport, null, 2)}\n`,
  "utf8",
);

function markdownCell(value) {
  return String(value ?? "—")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .replace(/\s+/g, " ")
    .trim() || "—";
}

function compact(value, maxLength = 110) {
  const text = markdownCell(value);
  return text.length <= maxLength
    ? text
    : `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function renderRouteTable(routes) {
  const header = [
    "| Path | Kind / intent | Current title and meta description | Utility, controls, and defaults | Supporting words | Indexing / sitemap | Storage / URL params | Closest overlap | Final Stage 3 decision and evidence |",
    "|---|---|---|---|---:|---|---|---|---|",
  ];
  const rows = routes.map((route) => {
    const utility =
      route.routeKind === "canonical"
        ? `${compact(route.functionalitySummary, 125)} Controls: ${route.availableControls.slice(0, 5).join(", ") || "none"}. Defaults: ${route.defaultValues.slice(0, 4).join(", ") || "none"}.`
        : route.functionalitySummary;
    const storageAndParams = [
      route.localStorageUse?.implemented
        ? `storage: ${route.localStorageUse.keys.join(", ")}`
        : "",
      route.urlParameterUse?.implemented
        ? `params: ${route.urlParameterUse.parameters.join(", ")}`
        : "",
    ].filter(Boolean).join("; ") || "—";
    const evidence =
      route.issues?.length
        ? compact(route.issues.join(" "), 145)
        : `Distinct function/defaults shown; compare ${route.closestOverlaps?.slice(0, 3).join(", ") || "no close sibling"}.`;
    const titleMeta = route.currentTitle
      ? `${compact(route.currentTitle, 80)}<br>${compact(route.currentMetaDescription, 120)}`
      : "—";
    return [
      `| \`${markdownCell(route.path)}\``,
      markdownCell(`${route.routeKind}; ${route.pageType}; ${route.primaryIntent}`),
      titleMeta,
      compact(utility, 175),
      Number(route.approximateVisibleSupportingWordCount ?? 0).toLocaleString("en-US"),
      markdownCell(`${route.currentIndexing}; ${route.currentSitemapStatus}`),
      compact(storageAndParams, 100),
      markdownCell(route.closestOverlaps?.slice(0, 4).join(", ") || "—"),
      markdownCell(
        `${route.finalStage3Status ? `Stage 3 ${route.finalStage3Status}: ${route.finalRecommendation ?? route.preliminaryRecommendation}. ` : ""}${evidence}`,
      ),
    ].join(" | ") + " |";
  });
  return [...header, ...rows].join("\n");
}

const auditDocumentPath = path.join(DOCS_DIR, "adsense-site-quality-audit.md");
try {
  const auditDocument = await readFile(auditDocumentPath, "utf8");
  const tableStart = "<!-- ROUTE_TABLE_START -->";
  const tableEnd = "<!-- ROUTE_TABLE_END -->";
  const routeTablePattern =
    /<!-- ROUTE_TABLE_START -->[\s\S]*?<!-- ROUTE_TABLE_END -->/;
  if (routeTablePattern.test(auditDocument)) {
    await writeFile(
      auditDocumentPath,
      auditDocument.replace(
        routeTablePattern,
        `${tableStart}\n${renderRouteTable(routeInventory)}\n${tableEnd}`,
      ),
      "utf8",
    );
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const indexableCanonicalCount = canonicalInventory.filter(
  (route) => !/noindex/i.test(route.currentIndexing),
).length;
const claimIssueRoutes = canonicalInventory.filter((route) =>
  ["partially resolved", "requires human decision"].includes(route.issueStatus) &&
  route.issues.some((issue) =>
    /claim|primary-source|citation|atomic|astronomical|projection|perfect for/i.test(issue),
  ),
);
const methodologyGapRoutes = canonicalInventory.filter(
  (route) =>
    route.methodologyRequired &&
    /not added|too little|missing/i.test(
      `${route.methodologyStatus} ${route.citationStatus}`,
    ),
);

console.log(
  JSON.stringify(
    {
      canonicalRoutes: canonicalInventory.length,
      redirectAliases: redirectInventory.length,
      totalAddressableConfiguredPaths:
        canonicalInventory.length + redirectInventory.length,
      catchAllErrorResponses: 1,
      totalInventoryObjects: routeInventory.length,
      indexableCanonicalRoutes: indexableCanonicalCount,
      xmlSitemapRoutes: xmlPaths.size,
      htmlSitemapRoutes: htmlSitemapRoutes.size,
      footerRoutes: footerRoutes.size,
      moreDirectoryRoutes: moreDirectoryRoutes.size,
      substantialRepeatedContentRoutes:
        repetitionReport.summary.pagesWithSubstantialRepeatedContent,
      claimIssueRoutes: claimIssueRoutes.length,
      methodologyGapRoutes: methodologyGapRoutes.length,
      stage2ResolutionCounts: Object.fromEntries(
        [...stage2Resolutions.values()].reduce((counts, resolution) => {
          counts.set(
            resolution.issueStatus,
            (counts.get(resolution.issueStatus) ?? 0) + 1,
          );
          return counts;
        }, new Map()),
      ),
      stage3StatusCounts: Object.fromEntries(
        routeArchitectureManifest.reduce((counts, route) => {
          counts.set(route.newStatus, (counts.get(route.newStatus) ?? 0) + 1);
          return counts;
        }, new Map()),
      ),
      outputFiles: [
        "docs/adsense-route-inventory.json",
        "docs/content-repetition-report.json",
        "docs/route-architecture-manifest.json",
      ],
    },
    null,
    2,
  ),
);
