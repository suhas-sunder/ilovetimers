import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnStaticPreview } from "../tests/preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PORT = Number(process.env.ILT_STAGE5_PORT || 3028);
const BASE = `http://127.0.0.1:${PORT}`;
const SITE_ORIGIN = "https://www.ilovetimers.com";
const REVIEW_DATE = "2026-07-21";
const EVIDENCE_PATH = path.join(ROOT, "docs/stage5-guide-evidence.json");
const QUALITY_PATH = path.join(ROOT, "docs/stage5-guide-quality-report.json");
const CHECK_CITATIONS = process.argv.includes("--check-citations");
const WRITE_ONLY = process.argv.includes("--write-only");

const guides = [
  {
    path: "/guides/browser-timers-background-tabs",
    file: "app/routes/guides.browser-timers-background-tabs.tsx",
    title: "Browser Timers in Background Tabs, Locked Phones, and Closed Tabs",
    question: "Will a browser timer keep working in a background tab, on a locked phone, or after I close the tab?",
    topic: "page lifecycle and background timing",
  },
  {
    path: "/guides/browser-timer-alarm-silent",
    file: "app/routes/guides.browser-timer-alarm-silent.tsx",
    title: "Why a Browser Timer or Alarm May Stay Silent",
    question: "Why did my browser timer finish without making a sound?",
    topic: "browser audio and silent alarms",
  },
  {
    path: "/guides/how-browser-timers-measure-time",
    file: "app/routes/guides.how-browser-timers-measure-time.tsx",
    title: "How Browser Timers Measure Elapsed Time and Handle Delays",
    question: "How can a browser timer stay accurate when animation frames and timer callbacks are delayed?",
    topic: "elapsed-time and target-time reconciliation",
  },
  {
    path: "/guides/unix-timestamps-seconds-milliseconds-microseconds",
    file: "app/routes/guides.unix-timestamps-seconds-milliseconds-microseconds.tsx",
    title: "Unix Timestamps in Seconds, Milliseconds, and Microseconds",
    question: "Is this Unix timestamp in seconds, milliseconds, or microseconds?",
    topic: "Unix timestamp units",
  },
  {
    path: "/guides/daylight-saving-time-zone-conversions",
    file: "app/routes/guides.daylight-saving-time-zone-conversions.tsx",
    title: "Daylight-Saving Gaps, Repeated Times, and Timezone Conversions",
    question: "Why can a local time be nonexistent or occur twice during a timezone conversion?",
    topic: "DST wall-time resolution",
  },
  {
    path: "/guides/browser-storage",
    file: "app/routes/guides.browser-storage.tsx",
    title: "What iLoveTimers Stores in Your Browser",
    question: "What does iLoveTimers save in my browser, and what is not saved?",
    topic: "local browser storage",
  },
];

const guidePaths = ["/guides", ...guides.map((guide) => guide.path)];

const toolGuideLinks = {
  "/countdown-timer": [
    "/guides/how-browser-timers-measure-time",
    "/guides/browser-timers-background-tabs",
    "/guides/browser-storage",
  ],
  "/pomodoro-timer": ["/guides/browser-storage"],
  "/hiit-timer": ["/guides/browser-storage"],
  "/stopwatch": ["/guides/how-browser-timers-measure-time"],
  "/online-alarm-clock": [
    "/guides/browser-timer-alarm-silent",
    "/guides/browser-timers-background-tabs",
  ],
  "/metronome": [
    "/guides/how-browser-timers-measure-time",
    "/guides/browser-timer-alarm-silent",
  ],
  "/unix-timestamp-converter": [
    "/guides/unix-timestamps-seconds-milliseconds-microseconds",
  ],
  "/epoch-unix-time-clock": [
    "/guides/unix-timestamps-seconds-milliseconds-microseconds",
  ],
  "/time-zone-converter": [
    "/guides/daylight-saving-time-zone-conversions",
    "/guides/browser-storage",
  ],
  "/time-zone-meeting-planner": [
    "/guides/daylight-saving-time-zone-conversions",
    "/guides/browser-storage",
  ],
  "/speedcubing-timer": ["/guides/browser-storage"],
  "/multiple-timers": ["/guides/browser-storage"],
  "/astronomical-clock": ["/guides/browser-storage"],
};

const storageInventory = [
  { feature: "theme", keys: ["ilt-theme-mode"], evidence: "app/clients/hooks/useThemeMode.ts" },
  { feature: "astronomical clock preferences", keys: ["astroClockPrefs"], evidence: "app/routes/astronomical-clock.tsx" },
  { feature: "BPM tapper settings and history", keys: ["bpmTapper.settings.v1", "bpmTapper.history.v1"], evidence: "app/routes/bpm-tapper.tsx" },
  { feature: "billable-hours clock", keys: ["ilovetimers:billable-hours-clock:v1"], evidence: "app/routes/billable-hours-clock.tsx" },
  { feature: "event countdown", keys: ["ilovetimers:event-countdown:v1"], evidence: "app/routes/event-countdown.tsx" },
  { feature: "meeting agenda", keys: ["ilt-meeting-agenda-timer-items"], evidence: "app/routes/meeting-agenda-timer.tsx" },
  { feature: "multiple timers", keys: ["ilovetimers:multiple-timers:v2"], evidence: "app/routes/multiple-timers.tsx" },
  { feature: "time blocking", keys: ["ilovetimers:time-blocking-clock:v2"], evidence: "app/routes/time-blocking-clock.tsx" },
  { feature: "timezone converter", keys: ["ilovetimers:time-zone-converter:v1"], evidence: "app/routes/time-zone-converter.tsx" },
  { feature: "speedcubing settings", keys: ["sc_start_mode", "sc_auto_save", "sc_max_solves"], evidence: "app/routes/speedcubing-timer.tsx" },
  { feature: "named tool presets", keys: ["ilovetimers:presets:countdown-timer:v1", "ilovetimers:presets:pomodoro-timer:v1", "ilovetimers:presets:hiit-timer:v1", "ilovetimers:presets:time-zone-meeting-planner:v1"], evidence: "app/clients/lib/shareConfigurations.ts" },
];

const implementationClaims = [
  {
    topic: "countdowns and stopwatches",
    claim: "Elapsed and remaining values are reconciled from monotonic performance readings rather than callback counts.",
    evidence: [
      { file: "app/routes/countdown-timer.tsx", needle: "endRef.current = now + currentRemaining" },
      { file: "app/routes/stopwatch.tsx", needle: "const delta = now - (startRef.current ?? now)" },
      { file: "app/clients/hooks/useElapsedStopwatch.ts", needle: "performance.now() - startedAtRef.current" },
    ],
  },
  {
    topic: "visibility reconciliation",
    claim: "The shared elapsed stopwatch reconciles immediately when a running page becomes visible.",
    evidence: [
      { file: "app/clients/hooks/useElapsedStopwatch.ts", needle: "visibilitychange" },
    ],
  },
  {
    topic: "browser audio",
    claim: "Alarm audio creates or reuses Web Audio contexts and requests resume when suspended; the metronome schedules ahead on AudioContext.currentTime.",
    evidence: [
      { file: "app/routes/online-alarm-clock.tsx", needle: "ctx.state === \"suspended\"" },
      { file: "app/routes/metronome.tsx", needle: "nextTimeRef.current = ctx.currentTime + 0.06" },
    ],
  },
  {
    topic: "Unix units",
    claim: "Auto mode uses explicit digit thresholds, normalizes seconds and microseconds to milliseconds, and truncates sub-millisecond Date input.",
    evidence: [
      { file: "app/clients/lib/technicalTimeMath.js", needle: "if (integerPart.length >= 15) return \"microseconds\"" },
      { file: "app/clients/lib/technicalTimeMath.js", needle: "const milliseconds = Math.trunc(rawMilliseconds)" },
    ],
  },
  {
    topic: "DST wall-time resolution",
    claim: "The resolver finds zero, one, or multiple exact IANA-zone wall-time matches and sorts repeated-time matches chronologically.",
    evidence: [
      { file: "app/clients/lib/technicalTimeMath.js", needle: "if (!matches.length) return { status: \"nonexistent\"" },
      { file: "app/clients/lib/technicalTimeMath.js", needle: "status: matches.length > 1 ? \"ambiguous\" : \"valid\"" },
    ],
  },
  {
    topic: "storage failure handling",
    claim: "Theme and route-local persistence fall back safely when storage is missing, invalid, or unavailable.",
    evidence: [
      { file: "app/clients/hooks/useThemeMode.ts", needle: "return value === \"dark\" ? \"dark\" : \"light\"" },
      { file: "app/routes/astronomical-clock.tsx", needle: "if (loaded.corrupt)" },
      { file: "app/routes/multiple-timers.tsx", needle: "return safeParseJSON<StoredState>" },
    ],
  },
];

const guideEvidenceDetails = {
  "/guides/browser-timers-background-tabs": {
    implementationTopics: ["countdowns and stopwatches", "visibility reconciliation"],
    testEvidence: [
      "scripts/tests/technical-time.mjs",
      "scripts/audits/stage2-accuracy.mjs",
      "Recorded Chromium three-second countdown reconciliation check",
    ],
    browserApis: ["performance.now", "requestAnimationFrame", "setTimeout", "Page Visibility API"],
    externalServices: [],
    verifiedClaims: [
      "The production countdown computes remaining time from a target performance timestamp.",
      "The shared elapsed-stopwatch hook reconciles when the page becomes visible.",
      "Closing the page removes the JavaScript execution context used by these tools.",
    ],
    qualifiedClaims: [
      "Hidden-page throttling, freezing, discard, device lock, and wake behavior vary by browser and operating system.",
      "The recorded Chromium tab test did not simulate a physically locked mobile device.",
    ],
    claimsExcluded: [
      "Guaranteed alarm delivery while a device sleeps",
      "Continued execution after the tab or browser is closed",
      "Identical lifecycle behavior in Chromium, Firefox, and Safari",
    ],
    relatedTools: ["/countdown-timer", "/stopwatch", "/online-alarm-clock", "/interval-timer", "/pomodoro-timer"],
    manualTests: [
      "Ran a three-second countdown, opened a second tab, waited 4.3 seconds, and observed 0:00 with the Finished state.",
    ],
  },
  "/guides/browser-timer-alarm-silent": {
    implementationTopics: ["browser audio"],
    testEvidence: [
      "scripts/tests/ui-regressions.mjs",
      "scripts/audits/stage2-accuracy.mjs",
      "Recorded Chromium Online Alarm Clock Test sound interaction",
    ],
    browserApis: ["AudioContext", "OscillatorNode", "GainNode", "AudioContext.resume"],
    externalServices: [],
    verifiedClaims: [
      "The alarm creates or reuses a Web Audio context and requests resume when it is suspended.",
      "The metronome schedules tones from AudioContext.currentTime.",
      "A user can run the alarm sound test before relying on a scheduled cue.",
    ],
    qualifiedClaims: [
      "Audibility also depends on autoplay policy, volume, mute or silent mode, output routing, background policy, and device sleep.",
      "Automation confirmed control execution and an empty warning/error log, not sound heard by a person.",
    ],
    claimsExcluded: [
      "Bypassing browser or operating-system audio policy",
      "Equivalence to an operating-system alarm",
      "Guaranteed audible output",
    ],
    relatedTools: ["/online-alarm-clock", "/alarm-timer", "/countdown-timer", "/interval-timer", "/metronome"],
    manualTests: [
      "Clicked Test sound from a user gesture in Chromium and observed no browser warning or error logs.",
    ],
  },
  "/guides/how-browser-timers-measure-time": {
    implementationTopics: ["countdowns and stopwatches", "visibility reconciliation", "browser audio"],
    testEvidence: [
      "scripts/tests/technical-time.mjs",
      "scripts/audits/stage2-accuracy.mjs",
      "Recorded Chromium countdown reconciliation check",
    ],
    browserApis: ["performance.now", "Date.now", "requestAnimationFrame", "setTimeout", "AudioContext.currentTime"],
    externalServices: [],
    verifiedClaims: [
      "Countdown and stopwatch paths reconcile from a target or elapsed reference instead of counting callbacks.",
      "Reaction timing uses a monotonic performance reading.",
      "Metronome scheduling uses the audio context clock while live clock displays derive from wall-clock time.",
    ],
    qualifiedClaims: [
      "Different tool families use different timing references and cannot share one universal precision claim.",
      "Displayed milliseconds remain subject to input, rendering, display, browser, and device latency.",
    ],
    claimsExcluded: [
      "Universal drift correction across every route",
      "Millisecond-certified accuracy",
      "Immunity to system-clock changes for wall-clock tools",
    ],
    relatedTools: ["/countdown-timer", "/stopwatch", "/reaction-time-test", "/metronome", "/clock-with-milliseconds"],
    manualTests: [
      "Observed the production countdown reach the expected target after a delayed inspection interval.",
    ],
  },
  "/guides/unix-timestamps-seconds-milliseconds-microseconds": {
    implementationTopics: ["Unix units"],
    testEvidence: [
      "scripts/tests/technical-time.mjs",
      "scripts/audits/stage2-accuracy.mjs",
      "Recorded Chromium Unix unit auto-detection checks",
    ],
    browserApis: ["Date", "Intl.DateTimeFormat"],
    externalServices: [],
    verifiedClaims: [
      "Auto mode treats 0 to 11 integer digits as seconds, 12 to 14 as milliseconds, and 15 or more as microseconds.",
      "The converter normalizes seconds and microseconds to milliseconds for Date and truncates sub-millisecond input.",
      "Equivalent example inputs in all three units resolve to the same UTC instant.",
    ],
    qualifiedClaims: [
      "Digit-count detection is a convenience heuristic and explicit units remain safer for unusual ranges.",
      "Readable local output applies the viewer's timezone after the timestamp instant is resolved.",
    ],
    claimsExcluded: [
      "A Unix timestamp contains a timezone",
      "Arbitrary-precision microsecond preservation in JavaScript Date",
      "Support beyond the browser Date range",
    ],
    relatedTools: ["/unix-timestamp-converter", "/epoch-unix-time-clock", "/utc-clock", "/milliseconds-converter"],
    manualTests: [
      "Entered 1700000000, 1700000000000, and 1700000000000000 in auto mode; each resolved to 2023-11-14T22:13:20.000Z with the expected unit label.",
    ],
  },
  "/guides/daylight-saving-time-zone-conversions": {
    implementationTopics: ["DST wall-time resolution"],
    testEvidence: [
      "scripts/tests/technical-time.mjs",
      "scripts/audits/stage2-accuracy.mjs",
      "Recorded Chromium DST gap and repeated-time checks",
    ],
    browserApis: ["Intl.DateTimeFormat", "browser-provided IANA timezone data"],
    externalServices: [],
    verifiedClaims: [
      "The production resolver classifies a wall time as nonexistent, valid, or ambiguous by matching IANA-zone parts.",
      "America/New_York 2026-03-08 02:30 is rejected as nonexistent.",
      "America/New_York 2026-11-01 01:30 is labeled ambiguous and resolves to the earlier occurrence, 2026-11-01T05:30:00.000Z.",
    ],
    qualifiedClaims: [
      "Results depend on timezone rules available in the browser and operating system.",
      "Historical rules and future political changes can differ from a fixed offset assumption.",
    ],
    claimsExcluded: [
      "Ambiguous abbreviation-only conversion",
      "A fixed offset is equivalent to a named timezone",
      "The browser owns an independently updated authoritative timezone service",
    ],
    relatedTools: ["/time-zone-converter", "/time-zone-meeting-planner", "/world-clock", "/utc-clock"],
    manualTests: [
      "Verified the documented 2026 New York spring gap and fall repeat in the production converter using deterministic URL inputs.",
    ],
  },
  "/guides/browser-storage": {
    implementationTopics: ["storage failure handling"],
    testEvidence: [
      "scripts/tests/sitewide-ui.mjs",
      "scripts/audits/stage5-guides.mjs storage-key checks",
      "Recorded Chromium speedcubing persistence and session-loss check",
    ],
    browserApis: ["localStorage", "in-memory React state"],
    externalServices: [
      "PostHog can receive cookieless, path-only analytics when configured; user-entered tool values are not intentionally captured.",
    ],
    verifiedClaims: [
      "The evidence inventory records eleven production storage categories and their exact keys.",
      "Speedcubing preferences persist in localStorage while solve results remain page-session memory.",
      "Theme and route-local readers catch unavailable or corrupt storage and fall back safely.",
    ],
    qualifiedClaims: [
      "Private browsing, storage partitioning, browser policy, storage pressure, and user clearing can change persistence behavior.",
      "Locally stored data is not a cloud backup or account record.",
    ],
    claimsExcluded: [
      "All browser profiles retain localStorage indefinitely",
      "Stored values are synchronized across devices",
      "No external service ever receives site usage data",
    ],
    relatedTools: ["/speedcubing-timer", "/multiple-timers", "/astronomical-clock", "/bpm-tapper", "/privacy"],
    manualTests: [
      "Set Speedcubing Timer to Instant toggle with a 12-solve limit, recorded a result, reloaded, and confirmed preferences persisted while the result cleared.",
    ],
  },
};

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

function decode(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) =>
      String.fromCodePoint(Number.parseInt(number, 16)),
    );
}

function strip(value = "") {
  return decode(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value = "") {
  return (value.match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu) ?? []).length;
}

function attr(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function elements(html, tag) {
  return [
    ...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "gi")),
  ].map((match) => ({
    attributes: match[1],
    html: match[2],
    text: strip(match[2]),
  }));
}

function meta(html, key, value) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (attr(tag, key) === value) return attr(tag, "content");
  }
  return "";
}

function canonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (attr(tag, "rel") === "canonical") return attr(tag, "href");
  }
  return "";
}

function internalLinks(html) {
  return [...html.matchAll(/\bhref=(?:"(\/[^"#?]*)"|'(\/[^'#?]*)')/gi)].map(
    (match) => match[1] ?? match[2],
  );
}

function externalLinks(html) {
  return [...html.matchAll(/\bhref=(?:"(https?:\/\/[^"]+)"|'(https?:\/\/[^']+)')/gi)]
    .map((match) => decode(match[1] ?? match[2]))
    .filter((url) => !url.startsWith(SITE_ORIGIN));
}

function schemaTypes(html) {
  const types = [];
  for (const match of html.matchAll(
    /<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const value = JSON.parse(decode(match[1]));
      const visit = (node) => {
        if (Array.isArray(node)) return node.forEach(visit);
        if (!node || typeof node !== "object") return;
        if (typeof node["@type"] === "string") types.push(node["@type"]);
        Object.values(node).forEach(visit);
      };
      visit(value);
    } catch {
      failures.push("A guide JSON-LD block could not be parsed.");
    }
  }
  return [...new Set(types)];
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(BASE, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Stage 5 guide server did not become ready on ${BASE}.`);
}

async function checkCitationUrl(url) {
  const startedAt = Date.now();
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "iLoveTimers-Stage5-Guide-Audit/1.0" },
    });
    if (response.status === 405) {
      response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: { "user-agent": "iLoveTimers-Stage5-Guide-Audit/1.0" },
      });
    }
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      reachable: response.status < 500,
      checkedInMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      url,
      status: null,
      finalUrl: null,
      reachable: false,
      error: error instanceof Error ? error.message : String(error),
      checkedInMs: Date.now() - startedAt,
    };
  }
}

async function evidenceWithLines() {
  const output = [];
  for (const item of implementationClaims) {
    const evidence = [];
    for (const reference of item.evidence) {
      const source = await read(reference.file);
      const line = source
        .slice(0, source.indexOf(reference.needle))
        .split(/\r?\n/).length;
      check(source.includes(reference.needle), `Missing implementation evidence in ${reference.file}: ${reference.needle}`);
      evidence.push({ ...reference, line: source.includes(reference.needle) ? line : null });
    }
    output.push({ topic: item.topic, claim: item.claim, evidence });
  }
  return output;
}

const [routeSource, sitemapXml, siteDirectorySource, sitemapRouteSource, rootSource, footerSource] =
  await Promise.all([
    read("app/routes.ts"),
    read("public/sitemap.xml"),
    read("app/clients/config/siteDirectory.js"),
    read("app/routes/sitemap.tsx"),
    read("app/root.tsx"),
    read("app/clients/components/navigation/Footer.tsx"),
  ]);

const configuredRoutes = [
  "/",
  ...[...routeSource.matchAll(/\broute\(\s*["']([^"']+)["']/g)].map(
    (match) => `/${match[1]}`,
  ),
];
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => new URL(match[1]).pathname,
);

check(guides.length === 6, `Expected exactly six guide articles, found ${guides.length}.`);
check(guidePaths.length === 7, "Expected the guide index plus six guide routes.");
check(new Set(guides.map((guide) => guide.title)).size === guides.length, "Guide titles are not unique.");
check(new Set(guides.map((guide) => guide.question)).size === guides.length, "Guide direct questions are not unique.");
check(configuredRoutes.length === 132, `Expected 132 canonical routes, found ${configuredRoutes.length}.`);
check(sitemapPaths.length === 109, `Expected 109 XML sitemap URLs, found ${sitemapPaths.length}.`);
for (const guidePath of guidePaths) {
  check(configuredRoutes.includes(guidePath), `${guidePath} is missing from app/routes.ts.`);
  check(sitemapPaths.includes(guidePath), `${guidePath} is missing from public/sitemap.xml.`);
  check(siteDirectorySource.includes(`"${guidePath}"`), `${guidePath} is missing from siteDirectory.js.`);
  check(sitemapRouteSource.includes(`href: "${guidePath}"`), `${guidePath} is missing from the HTML sitemap catalog.`);
}
check(rootSource.includes('href="/guides"'), "The root navigation is missing the Guides link.");
check(footerSource.includes('{ to: "/guides", label: "Guides" }'), "The footer is missing the guide index link.");
for (const guide of guides) {
  check(!footerSource.includes(`to: "${guide.path}"`), `${guide.path} should not be listed individually in the footer.`);
}

for (const [toolPath, destinations] of Object.entries(toolGuideLinks)) {
  const routeMatch = routeSource.match(
    new RegExp(`route\\(\\s*["']${toolPath.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\s*,\\s*["']([^"']+)["']`),
  );
  check(Boolean(routeMatch), `Could not locate ${toolPath} route source.`);
  if (!routeMatch) continue;
  let source = await read(path.posix.join("app", routeMatch[1]));
  if (source.includes("SharePresetPanel")) {
    source += `\n${await read("app/clients/components/share/SharePresetPanel.tsx")}`;
  }
  for (const destination of destinations) {
    check(
      source.includes(`href="${destination}"`) || source.includes(`to="${destination}"`),
      `${toolPath} does not link to ${destination}.`,
    );
  }
}

let priorQuality = null;
try {
  priorQuality = JSON.parse(await readFile(QUALITY_PATH, "utf8"));
} catch {}
const browserValidation = priorQuality?.browserValidation ?? {
  status: "pending",
  testedAt: null,
  environment: null,
  scenarios: [],
  screenshots: [],
  limitations: [
    "No browser validation has been recorded yet.",
  ],
};

let server;
let pageReports = [];
try {
  server = spawnStaticPreview({ root: ROOT, port: PORT });
  await waitForServer();

  for (const guidePath of guidePaths) {
    const response = await fetch(`${BASE}${guidePath}`, { redirect: "manual" });
    check(response.status === 200, `${guidePath} returned HTTP ${response.status}.`);
    const html = await response.text();
    const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
    const title = elements(html, "title")[0]?.text ?? "";
    const h1s = elements(mainHtml, "h1").map((element) => element.text);
    const h2s = elements(mainHtml, "h2").map((element) => element.text);
    const description = meta(html, "name", "description");
    const robots = meta(html, "name", "robots");
    const pageCanonical = canonical(html);
    const sources = [...new Set(externalLinks(mainHtml))];
    const types = schemaTypes(html);
    const words = wordCount(strip(mainHtml));
    const guide = guides.find((candidate) => candidate.path === guidePath);

    check(h1s.length === 1, `${guidePath} rendered ${h1s.length} H1 elements.`);
    check(Boolean(description), `${guidePath} lacks a meta description.`);
    check(pageCanonical === `${SITE_ORIGIN}${guidePath}`, `${guidePath} lacks a self-canonical.`);
    check(robots.includes("index") && robots.includes("follow"), `${guidePath} has wrong robots metadata: ${robots}.`);
    check(mainHtml.includes("Suhas Sunder"), `${guidePath} lacks visible authorship.`);
    check(mainHtml.includes("July 21, 2026"), `${guidePath} lacks the visible review date.`);

    if (guide) {
      check(h1s[0] === guide.title, `${guidePath} H1 does not match its guide title.`);
      check(h2s[0] === guide.question, `${guidePath} does not lead with its direct question.`);
      check(words >= 850, `${guidePath} is too thin at ${words} rendered main words.`);
      check(h2s.length >= 7, `${guidePath} needs at least seven substantive section headings.`);
      check(sources.length >= 3, `${guidePath} renders fewer than three external supporting sources.`);
      check(types.includes("TechArticle"), `${guidePath} lacks TechArticle schema.`);
      check(types.includes("BreadcrumbList"), `${guidePath} lacks BreadcrumbList schema.`);
    } else {
      check(words >= 250, `/guides is too thin at ${words} rendered main words.`);
      check(types.includes("CollectionPage"), "/guides lacks CollectionPage schema.");
      check(types.includes("ItemList"), "/guides lacks ItemList schema.");
    }

    pageReports.push({
      path: guidePath,
      title,
      h1: h1s[0] ?? "",
      metaDescription: description,
      canonical: pageCanonical,
      robots,
      renderedMainWordCount: words,
      directQuestion: guide?.question ?? null,
      sectionHeadings: h2s,
      sourceLinks: sources,
      schemaTypes: types,
      visibleAuthor: mainHtml.includes("Suhas Sunder"),
      visibleReviewDate: mainHtml.includes("July 21, 2026") ? REVIEW_DATE : null,
      internalGuideLinks: internalLinks(mainHtml).filter((link) => link.startsWith("/guides")),
    });
  }
} finally {
  server?.kill("SIGTERM");
}

const articleReports = pageReports.filter((page) => page.path !== "/guides");
const descriptions = articleReports.map((page) => page.metaDescription);
const headingSequences = articleReports.map((page) => page.sectionHeadings.join(" | "));
check(new Set(descriptions).size === descriptions.length, "Guide meta descriptions are not unique.");
check(new Set(headingSequences).size === headingSequences.length, "Two guide articles use the same heading sequence.");

const citationUrls = [...new Set(articleReports.flatMap((page) => page.sourceLinks))];
const allowedCitationHosts = new Set([
  "developer.chrome.com",
  "developer.mozilla.org",
  "html.spec.whatwg.org",
  "storage.spec.whatwg.org",
  "www.iana.org",
  "www.w3.org",
  "tc39.es",
  "webaudio.github.io",
]);
for (const citationUrl of citationUrls) {
  check(allowedCitationHosts.has(new URL(citationUrl).hostname), `Unapproved citation host: ${citationUrl}`);
}
const citationChecks = CHECK_CITATIONS
  ? await Promise.all(citationUrls.map(checkCitationUrl))
  : priorQuality?.citationChecks ?? [];
if (CHECK_CITATIONS) {
  for (const result of citationChecks) {
    check(result.reachable, `Citation URL was not reachable: ${result.url}`);
  }
}

const resolvedImplementationEvidence = await evidenceWithLines();
for (const entry of storageInventory) {
  const source = await read(entry.evidence);
  for (const key of entry.keys) {
    check(source.includes(key), `Storage inventory key ${key} is missing from ${entry.evidence}.`);
  }
}

const manifest = JSON.parse(await read("docs/route-architecture-manifest.json"));
const inventory = JSON.parse(await read("docs/adsense-route-inventory.json"));
const dossier = JSON.parse(await read("docs/tool-content-dossier.json"));
const repetition = JSON.parse(await read("docs/content-repetition-report.json"));
const stage4 = JSON.parse(await read("docs/stage4-content-quality-report.json"));
for (const guidePath of guidePaths) {
  check(manifest.some((entry) => entry.sourcePath === guidePath), `${guidePath} is missing from the route manifest.`);
  check(inventory.some((entry) => entry.path === guidePath), `${guidePath} is missing from the route inventory.`);
  check(dossier.pages.some((entry) => entry.path === guidePath), `${guidePath} is missing from the content dossier.`);
  check(repetition.routes.some((entry) => entry.sourcePath === guidePath), `${guidePath} is missing from the repetition report.`);
  check(stage4.routes.some((entry) => entry.path === guidePath), `${guidePath} is missing from the Stage 4 report.`);
}

check(browserValidation.status === "passed", "Recorded browser validation is not complete.");

const generatedAt = new Date().toISOString();
const guideEvidenceRecords = guides.map((guide) => {
  const details = guideEvidenceDetails[guide.path];
  const report = articleReports.find((candidate) => candidate.path === guide.path);
  const contextualLinksIn = Object.entries(toolGuideLinks)
    .filter(([, destinations]) => destinations.includes(guide.path))
    .map(([sourcePath]) => sourcePath);
  const implementationEvidence = resolvedImplementationEvidence.filter((entry) =>
    details.implementationTopics.includes(entry.topic),
  );

  return {
    path: guide.path,
    title: guide.title,
    slug: guide.path.split("/").at(-1),
    primaryQuestion: guide.question,
    publicationDate: REVIEW_DATE,
    modificationDate: REVIEW_DATE,
    author: "Suhas Sunder",
    wordCount: report?.renderedMainWordCount ?? 0,
    implementationEvidence,
    testEvidence: details.testEvidence,
    browserApis: details.browserApis,
    externalServices: details.externalServices,
    sourceLinks: report?.sourceLinks ?? [],
    verifiedClaims: details.verifiedClaims,
    qualifiedClaims: details.qualifiedClaims,
    claimsExcluded: details.claimsExcluded,
    relatedTools: details.relatedTools,
    manualTests: details.manualTests,
    browserTests: details.manualTests,
    internalLinksIn: ["/guides", ...contextualLinksIn],
    internalLinksOut: [
      ...new Set([...(report?.internalGuideLinks ?? []), ...details.relatedTools]),
    ],
    structuredDataStatus:
      report?.schemaTypes.includes("TechArticle") &&
      report?.schemaTypes.includes("BreadcrumbList")
        ? "passed"
        : "failed",
    manualReviewStatus: browserValidation.status,
    remainingLimitations: details.qualifiedClaims,
    evidenceDate: REVIEW_DATE,
  };
});

const requiredEvidenceFields = [
  "title",
  "slug",
  "primaryQuestion",
  "implementationEvidence",
  "testEvidence",
  "browserApis",
  "externalServices",
  "sourceLinks",
  "verifiedClaims",
  "qualifiedClaims",
  "claimsExcluded",
  "relatedTools",
  "manualTests",
  "evidenceDate",
];
check(guideEvidenceRecords.length === 6, "Evidence artifact must contain one record for each of the six guides.");
for (const record of guideEvidenceRecords) {
  for (const field of requiredEvidenceFields) {
    check(Object.hasOwn(record, field), `${record.path} evidence is missing ${field}.`);
  }
  check(record.implementationEvidence.length > 0, `${record.path} evidence has no implementation reference.`);
  check(record.testEvidence.length > 0, `${record.path} evidence has no test reference.`);
  check(record.sourceLinks.length >= 3, `${record.path} evidence has fewer than three source links.`);
  check(record.verifiedClaims.length > 0, `${record.path} evidence has no verified claims.`);
  check(record.qualifiedClaims.length > 0, `${record.path} evidence has no qualified claims.`);
  check(record.claimsExcluded.length > 0, `${record.path} evidence has no excluded claims.`);
  check(record.relatedTools.length > 0, `${record.path} evidence has no related tools.`);
  check(record.manualTests.length > 0, `${record.path} evidence has no manual tests.`);
  check(record.structuredDataStatus === "passed", `${record.path} evidence has failed structured data status.`);
}

const evidenceArtifact = {
  generatedAt,
  stage: 5,
  repositoryRoot: ROOT.replaceAll("\\", "/"),
  scope: {
    guideIndex: "/guides",
    guideArticles: guides.map(({ path: guidePath, title, question, topic }) => ({
      path: guidePath,
      title,
      directQuestion: question,
      topic,
    })),
    canonicalRouteCount: configuredRoutes.length,
    xmlSitemapUrlCount: sitemapPaths.length,
  },
  guides: guideEvidenceRecords,
  implementationEvidence: resolvedImplementationEvidence,
  storageInventory,
  toolGuideLinks,
  authoritativeSources: citationUrls,
  browserValidation,
  claimBoundaries: [
    "Browser tests cover Chromium on the recorded Windows environment, not every browser or mobile operating system.",
    "Audible output is not machine-verified; the test records control response and console state, while a person must confirm what speakers produce.",
    "No guide claims guaranteed background execution, official time synchronization, certified precision, or durable cloud storage.",
  ],
  stage6StorageUpdate: {
    status: "reviewed",
    reviewedAt: REVIEW_DATE,
    shareRoutes: 5,
    presetRoutes: 4,
    evidence: "docs/stage6-share-preset-evidence.json",
  },
};

const qualityArtifact = {
  generatedAt,
  stage: 5,
  summary: {
    guideIndexRoutes: 1,
    guideArticleRoutes: articleReports.length,
    totalGuideRoutes: pageReports.length,
    totalRenderedArticleWords: articleReports.reduce(
      (sum, page) => sum + page.renderedMainWordCount,
      0,
    ),
    minimumRenderedArticleWords: Math.min(
      ...articleReports.map((page) => page.renderedMainWordCount),
    ),
    duplicateTitles: guides.length - new Set(guides.map((guide) => guide.title)).size,
    duplicateDescriptions: descriptions.length - new Set(descriptions).size,
    duplicateDirectQuestions: guides.length - new Set(guides.map((guide) => guide.question)).size,
    identicalHeadingSequences: headingSequences.length - new Set(headingSequences).size,
    contextualToolPagesLinked: Object.keys(toolGuideLinks).length,
    citationUrlCount: citationUrls.length,
    canonicalRouteCount: configuredRoutes.length,
    xmlSitemapUrlCount: sitemapPaths.length,
    result: failures.length ? "failed" : "passed",
  },
  routes: pageReports,
  citationChecks,
  browserValidation,
  safeguards: {
    exactGuideArticleCount: guides.length === 6,
    allGuideRoutesCanonicalAndIndexable: pageReports.every(
      (page) =>
        page.canonical === `${SITE_ORIGIN}${page.path}` &&
        page.robots.includes("index") &&
        page.robots.includes("follow"),
    ),
    visibleAuthorshipAndDates: pageReports.every(
      (page) => page.visibleAuthor && page.visibleReviewDate === REVIEW_DATE,
    ),
    guideArticlesAbsentFromFooter: guides.every(
      (guide) => !footerSource.includes(`to: "${guide.path}"`),
    ),
    guideIndexInNavigationAndFooter:
      rootSource.includes('href="/guides"') &&
      footerSource.includes('{ to: "/guides", label: "Guides" }'),
    toolBehaviorChanged: false,
    routeAliasesAdded: false,
    adsAdded: false,
  },
  stage6StorageUpdate: {
    status: "reviewed",
    browserStorageGuideUpdated: true,
    namedPresetKeysRegistered: true,
    evidence: "docs/stage6-share-preset-evidence.json",
  },
  failures,
};

await Promise.all([
  writeFile(EVIDENCE_PATH, `${JSON.stringify(evidenceArtifact, null, 2)}\n`),
  writeFile(QUALITY_PATH, `${JSON.stringify(qualityArtifact, null, 2)}\n`),
]);

if (WRITE_ONLY) {
  console.log(
    `Wrote Stage 5 guide artifacts for ${pageReports.length} routes with ${citationUrls.length} citation URLs.`,
  );
} else if (failures.length) {
  console.error(`Stage 5 guide audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Stage 5 guide audit passed: 1 index, ${articleReports.length} substantial guides, ${qualityArtifact.summary.totalRenderedArticleWords} rendered article words, ${citationUrls.length} citation URLs, ${Object.keys(toolGuideLinks).length} contextual tool pages.`,
  );
}
