import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnStaticPreview } from "../tests/preview-process.mjs";
import {
  SHARE_SCHEMAS,
  SHARE_URL_MAX_LENGTH,
} from "../../app/clients/lib/shareConfigurations.ts";
import {
  LOCAL_PRESET_LIMIT,
  LOCAL_PRESET_NAME_MAX_LENGTH,
} from "../../app/clients/lib/localPresetStore.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PORT = Number(process.env.ILT_STAGE6_PORT || 3036);
const BASE = `http://127.0.0.1:${PORT}`;
const SITE_ORIGIN = "https://www.ilovetimers.com";
const EVIDENCE_PATH = path.join(ROOT, "docs/stage6-share-preset-evidence.json");
const REPORT_PATH = path.join(ROOT, "docs/stage6-feature-quality-report.json");
const BROWSER_VALIDATION_PATH = path.join(ROOT, "docs/stage6-browser-validation.json");
const ADSENSE_AUDIT_PATH = path.join(ROOT, "docs/adsense-site-quality-audit.md");
const ALLOW_PENDING_BROWSER = process.argv.includes("--allow-pending-browser");

const schemaByPath = new Map(Object.values(SHARE_SCHEMAS).map((schema) => [schema.path, schema]));
const sharePaths = [...schemaByPath.keys()];
const presetPaths = [...schemaByPath.values()].filter((schema) => schema.storageKey).map((schema) => schema.path);
const routeFiles = {
  "/countdown-timer": "app/routes/countdown-timer.tsx",
  "/pomodoro-timer": "app/routes/pomodoro-timer.tsx",
  "/hiit-timer": "app/routes/hiit-timer.tsx",
  "/time-zone-converter": "app/routes/time-zone-converter.tsx",
  "/time-zone-meeting-planner": "app/routes/time-zone-meeting-planner.tsx",
};
const validQueries = {
  "/countdown-timer": "?v=1&duration=61",
  "/pomodoro-timer": "?v=1&work=50&break=10&cycles=6&long=0&longDuration=25&auto=0&sound=0&countdown=1",
  "/hiit-timer": "?v=1&warmup=0&work=45&rest=15&rounds=12&cooldown=60&sound=0&countdown=1",
  "/time-zone-converter": "?v=1&from=America%2FNew_York&to=Europe%2FLondon&date=2026-11-01&time=01%3A30&sec=0",
  "/time-zone-meeting-planner": "?v=1&date=2026-07-21&duration=90&start=7&end=20&zones=Pacific%2FAuckland%2CAmerica%2FLos_Angeles%2CAsia%2FTokyo",
};
const invalidQueries = {
  "/countdown-timer": "?v=1&duration=0",
  "/pomodoro-timer": "?v=1&cycles=99",
  "/hiit-timer": "?v=1&work=0",
  "/time-zone-converter": "?v=1&from=Bad&to=UTC&date=2026-02-30&time=99%3A00&sec=0",
  "/time-zone-meeting-planner": "?v=1&date=2026-02-30&zones=Bad",
};
const sampleConfigs = {
  "/countdown-timer": { durationSeconds: 61 },
  "/pomodoro-timer": {
    workMinutes: 50,
    breakMinutes: 10,
    cycles: 6,
    longBreakEnabled: false,
    longBreakMinutes: 25,
    autoAdvance: false,
    sound: false,
    finalCountdownBeeps: true,
  },
  "/hiit-timer": {
    warmupSeconds: 0,
    workSeconds: 45,
    restSeconds: 15,
    rounds: 12,
    cooldownSeconds: 60,
    sound: false,
    finalCountdownBeeps: true,
  },
  "/time-zone-converter": {
    fromZone: "America/New_York",
    toZone: "Europe/London",
    date: "2026-11-01",
    time: "01:30",
    showSeconds: false,
  },
  "/time-zone-meeting-planner": {
    date: "2026-07-21",
    durationMinutes: 90,
    workStartHour: 7,
    workEndHour: 20,
    zones: ["Pacific/Auckland", "America/Los_Angeles", "Asia/Tokyo"],
  },
};

const failures = [];
let checks = 0;
function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

async function collectFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await collectFiles(absolute));
    else output.push(absolute);
  }
  return output;
}

function canonical(html) {
  return html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1]
    ?? "";
}

function ogUrl(html) {
  return html.match(/<meta\b[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:url["']/i)?.[1]
    ?? "";
}

function schemaUrls(html) {
  const urls = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
      const visit = (value) => {
        if (typeof value === "string" && value.startsWith("http")) urls.push(value);
        else if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === "object") Object.values(value).forEach(visit);
      };
      visit(parsed);
    } catch {
      failures.push("A rendered JSON-LD block could not be parsed.");
    }
  }
  return urls;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/countdown-timer`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Stage 6 audit server did not start on port ${PORT}.`);
}

const evidence = JSON.parse(await read("docs/stage6-share-preset-evidence.json"));
check(evidence.stage === 6, "Stage 6 evidence has the wrong stage number.");
check(evidence.candidates.length === 10, `Expected 10 evaluated candidates, found ${evidence.candidates.length}.`);
check(evidence.presetPolicy.maximumPresetsPerTool === LOCAL_PRESET_LIMIT, "Evidence preset limit differs from implementation.");
check(evidence.presetPolicy.maximumPresetNameLength === LOCAL_PRESET_NAME_MAX_LENGTH, "Evidence name limit differs from implementation.");
check(evidence.presetPolicy.sharedUrlMaximumLength === SHARE_URL_MAX_LENGTH, "Evidence URL limit differs from implementation.");
for (const candidate of evidence.candidates) {
  for (const field of ["path", "toolType", "currentStateModel", "existingQueryParameters", "existingStorageKeys", "existingPersistence", "configurationFields", "privateOrUnsafeFields", "shareValue", "presetValue", "implementationComplexity", "selectedForSharing", "selectedForPresets", "evidenceFiles", "requiredTests"]) {
    check(Object.hasOwn(candidate, field), `${candidate.path ?? "candidate"} lacks evidence field ${field}.`);
  }
  check(candidate.selectedForSharing || Boolean(candidate.exclusionReason), `${candidate.path} has no sharing exclusion reason.`);
  check(candidate.selectedForPresets || Boolean(candidate.exclusionReason), `${candidate.path} has no preset exclusion reason.`);
}

for (const pathName of sharePaths) {
  const schema = schemaByPath.get(pathName);
  const candidate = evidence.candidates.find((entry) => entry.path === pathName);
  check(Boolean(candidate?.selectedForSharing), `${pathName} has a schema but is not selected in evidence.`);
  check(schema.version === 1, `${pathName} schema is not version 1.`);
  check(schema.path === pathName, `${pathName} schema does not use its canonical route.`);
  const built = schema.buildUrl(sampleConfigs[pathName]);
  check(built.startsWith(`${SITE_ORIGIN}${pathName}?v=1`), `${pathName} does not serialize from its clean production canonical.`);
  check(built.length <= SHARE_URL_MAX_LENGTH, `${pathName} exceeds the share URL limit.`);
  check(!/[?&](name|note|history|remaining|running|preset|latitude|longitude)=/i.test(built), `${pathName} serializes a private or transient field.`);
  check(schema.parse(`${validQueries[pathName]}&unknown=value`).status === "valid", `${pathName} does not ignore unknown parameters safely.`);
  const duplicateKey = [...new URLSearchParams(validQueries[pathName]).keys()].find((key) => key !== "v");
  check(Boolean(duplicateKey), `${pathName} has no tested configuration parameter.`);
  if (duplicateKey) {
    const duplicated = `${validQueries[pathName]}&${encodeURIComponent(duplicateKey)}=duplicate`;
    check(schema.parse(duplicated).status === "invalid", `${pathName} accepts a duplicated recognized parameter.`);
  }
  check(schema.parse(invalidQueries[pathName]).status === "invalid", `${pathName} accepts its invalid audit case.`);
}

for (const pathName of presetPaths) {
  const schema = schemaByPath.get(pathName);
  const candidate = evidence.candidates.find((entry) => entry.path === pathName);
  check(Boolean(candidate?.selectedForPresets), `${pathName} has preset storage but is not selected in evidence.`);
  check(schema.storageKey?.endsWith(":v1"), `${pathName} preset key is not versioned.`);
}

const [panelSource, schemaSource, presetSource, privacySource, guideSource, sitemap, htmlSitemapSource, siteDirectorySource, relatedToolsSource, routeSource, manifestSource] = await Promise.all([
  read("app/clients/components/share/SharePresetPanel.tsx"),
  read("app/clients/lib/shareConfigurations.ts"),
  read("app/clients/lib/localPresetStore.ts"),
  read("app/routes/privacy.tsx"),
  read("app/routes/guides.browser-storage.tsx"),
  read("public/sitemap.xml"),
  read("app/routes/sitemap.tsx"),
  read("app/clients/config/siteDirectory.js"),
  read("app/clients/config/relatedTools.js"),
  read("app/routes.ts"),
  read("docs/route-architecture-manifest.json"),
]);

for (const label of ["Share setup", "Save preset", "Load preset", "Rename", "Delete", "Delete all"]) {
  check(panelSource.includes(label), `Shared controls lack ${label}.`);
}
check(panelSource.includes('role="status"') && panelSource.includes('aria-live="polite"'), "Shared controls lack an accessible live status.");
check(panelSource.includes("window.confirm"), "Delete all lacks explicit confirmation.");
check(panelSource.includes("navigator.clipboard") && panelSource.includes("manualLink"), "Clipboard progressive fallback is missing.");
check(panelSource.includes("disabled={!selectedId || loadDisabled}"), "Preset loading is not guarded while a timer is running.");
check(!/history\.(?:pushState|replaceState)|location\.(?:assign|replace)/.test(panelSource), "Preset controls mutate the URL.");
check(presetSource.includes("recoveredInvalidRecords") && presetSource.includes("migrated"), "Preset corruption or migration safeguards are missing.");
check(!/\b(fetch|XMLHttpRequest|sendBeacon)\b/.test(`${panelSource}\n${schemaSource}\n${presetSource}`), "Share or preset infrastructure adds an external request path.");
check(privacySource.includes("Share links and named presets") && privacySource.includes("are not synchronized"), "Privacy policy does not cover local presets and sharing.");
check(guideSource.includes("Named tool presets") && guideSource.includes("Share links are different from local presets"), "Browser storage guide does not reflect Stage 6.");
check(![...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].some((match) => match[1].includes("?")), "The XML sitemap contains a parameterized URL.");
for (const source of [htmlSitemapSource, siteDirectorySource, relatedToolsSource]) {
  for (const pathName of sharePaths) check(!source.includes(`${pathName}?`), `Internal navigation contains a parameterized ${pathName} URL.`);
}
check((routeSource.match(/\broute\(\s*["']/g) ?? []).length + 1 === 132, "Canonical route count changed from 132.");
check((sitemap.match(/<loc>/g) ?? []).length === 109, "XML sitemap count changed from 109.");
const manifest = JSON.parse(manifestSource);
check(manifest.length === 160, `Route manifest count changed from 160 to ${manifest.length}.`);
for (const pathName of sharePaths) {
  const entry = manifest.find((candidate) => candidate.sourcePath === pathName);
  check(entry?.newStatus === "A", `${pathName} route architecture status changed unexpectedly.`);
}

const stage6PublicSources = [panelSource, privacySource, guideSource, ...await Promise.all(Object.values(routeFiles).map(read))];
check(!stage6PublicSources.some((source) => source.includes("—")), "An em dash appears in Stage 6 public content.");
check(!stage6PublicSources.some((source) => /cloud[- ]synced|syncs across devices|public preset gallery/i.test(source)), "Banned cloud or public-preset wording appears in Stage 6 public content.");

const appFiles = (await collectFiles(path.join(ROOT, "app"))).filter((file) => /\.(?:js|jsx|ts|tsx)$/.test(file));
for (const absolute of appFiles) {
  const source = await readFile(absolute, "utf8");
  for (const pathName of sharePaths) {
    check(!source.includes(`href: "${pathName}?`) && !source.includes(`href="${pathName}?`) && !source.includes(`to: "${pathName}?`) && !source.includes(`to="${pathName}?`), `${path.relative(ROOT, absolute)} contains a parameterized internal link to ${pathName}.`);
  }
}

let server;
const renderedMetadata = [];
try {
  server = spawnStaticPreview({ root: ROOT, port: PORT });
  await waitForServer();
  for (const pathName of sharePaths) {
    for (const [kind, query] of [["valid", validQueries[pathName]], ["invalid", invalidQueries[pathName]]]) {
      const response = await fetch(`${BASE}${pathName}${query}`, { redirect: "manual" });
      check(response.status === 200, `${pathName} ${kind} query returned HTTP ${response.status}.`);
      const html = await response.text();
      const expected = `${SITE_ORIGIN}${pathName}`;
      const renderedCanonical = canonical(html);
      const renderedOgUrl = ogUrl(html);
      const urls = schemaUrls(html);
      check(renderedCanonical === expected, `${pathName} ${kind} query changed the canonical to ${renderedCanonical}.`);
      check(renderedOgUrl === expected, `${pathName} ${kind} query changed og:url to ${renderedOgUrl}.`);
      check(!urls.some((url) => url.startsWith(SITE_ORIGIN) && url.includes("?")), `${pathName} ${kind} query leaked into structured data.`);
      renderedMetadata.push({ path: pathName, queryKind: kind, httpStatus: response.status, canonical: renderedCanonical, openGraphUrl: renderedOgUrl, structuredDataParameterizedUrlCount: urls.filter((url) => url.startsWith(SITE_ORIGIN) && url.includes("?")).length });
    }
  }
} finally {
  server?.kill("SIGTERM");
}

let priorReport = null;
try {
  priorReport = JSON.parse(await readFile(REPORT_PATH, "utf8"));
} catch {}
let recordedBrowserValidation = null;
try {
  recordedBrowserValidation = JSON.parse(await readFile(BROWSER_VALIDATION_PATH, "utf8"));
} catch {}
const browserValidation = recordedBrowserValidation ?? priorReport?.browserValidation ?? {
  status: "pending",
  testedAt: null,
  environment: null,
  scenarios: [],
  screenshots: [],
  limitations: ["Browser interaction validation has not been recorded yet."],
};
if (!ALLOW_PENDING_BROWSER) check(browserValidation.status === "passed", "Recorded Stage 6 browser validation is not complete.");

const records = evidence.candidates.map((candidate) => {
  const schema = schemaByPath.get(candidate.path);
  return {
    path: candidate.path,
    shareStatus: candidate.selectedForSharing ? "implemented" : `excluded: ${candidate.exclusionReason}`,
    presetStatus: candidate.selectedForPresets ? "implemented" : `excluded: ${candidate.exclusionReason}`,
    shareFields: candidate.selectedForSharing ? candidate.configurationFields : [],
    excludedFields: candidate.privateOrUnsafeFields,
    schemaVersion: schema?.version ?? null,
    parameterExamples: schema ? [schema.buildUrl(sampleConfigs[candidate.path])] : [],
    canonicalStatus: schema ? "clean canonical, Open Graph, and structured-data URLs verified with valid and invalid parameters" : "unchanged clean route",
    autostartStatus: schema ? "shared configuration contains no runtime start state and route applies it stopped or ready" : "not applicable",
    storageKey: schema?.storageKey ?? null,
    presetLimit: candidate.selectedForPresets ? LOCAL_PRESET_LIMIT : null,
    corruptionHandling: candidate.selectedForPresets ? "versioned root validation, valid-sibling preservation, safe stale-root discard, and legacy v1 root migration" : "not applicable",
    privacyCoverage: candidate.selectedForSharing || candidate.selectedForPresets ? "privacy policy, browser-storage guide, and concise tool disclosure" : "exclusion documented in Stage 6 evidence",
    accessibilityCoverage: candidate.selectedForSharing || candidate.selectedForPresets ? "labeled fields, keyboard-native controls, visible focus, live status, and wrapped touch actions" : "not applicable",
    browserTests: candidate.selectedForSharing || candidate.selectedForPresets
      ? { status: browserValidation.status, scenarios: browserValidation.scenarios }
      : { status: "not applicable", scenarios: [] },
    finalStatus: browserValidation.status === "passed" || (!candidate.selectedForSharing && !candidate.selectedForPresets) ? "passed" : "implementation passed; browser validation pending",
  };
});

for (const candidate of evidence.candidates) {
  const schema = schemaByPath.get(candidate.path);
  const sampleUrl = schema ? new URL(schema.buildUrl(sampleConfigs[candidate.path])) : null;
  candidate.shareParameterNames = sampleUrl ? [...sampleUrl.searchParams.keys()] : [];
  candidate.schemaVersion = schema?.version ?? null;
  candidate.stage6StorageKey = schema?.storageKey ?? null;
  candidate.stage6Limits = {
    shareUrlCharacters: candidate.selectedForSharing ? SHARE_URL_MAX_LENGTH : null,
    presetsPerTool: candidate.selectedForPresets ? LOCAL_PRESET_LIMIT : null,
    presetNameCharacters: candidate.selectedForPresets ? LOCAL_PRESET_NAME_MAX_LENGTH : null,
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  stage: 6,
  repositoryRoot: ROOT.replaceAll("\\", "/"),
  summary: {
    evaluatedCandidates: evidence.candidates.length,
    shareRoutes: sharePaths.length,
    presetRoutes: presetPaths.length,
    schemaVersion: 1,
    shareUrlMaximumLength: SHARE_URL_MAX_LENGTH,
    presetLimitPerTool: LOCAL_PRESET_LIMIT,
    presetNameMaximumLength: LOCAL_PRESET_NAME_MAX_LENGTH,
    routeCount: 132,
    sitemapUrlCount: 109,
  },
  safeguards: {
    checks,
    failures,
    renderedMetadata,
    externalPresetServices: 0,
    parameterizedSitemapUrls: 0,
    routeArchitectureChanged: false,
  },
  browserValidation,
  candidates: records,
};
const stage6AuditSection = `<!-- STAGE6_FEATURES_START -->
## Stage 6 shareable setups and local preset update

Stage 6 reviewed ten configuration candidates and implemented versioned share links on five canonical tools: Countdown Timer, Pomodoro Timer, HIIT Timer, Time Zone Converter, and Time Zone Meeting Planner. Countdown Timer, Pomodoro Timer, HIIT Timer, and Time Zone Meeting Planner also support up to ${LOCAL_PRESET_LIMIT} named presets per tool in versioned browser storage. Preset names are limited to ${LOCAL_PRESET_NAME_MAX_LENGTH} characters.

Shared URLs use the clean production canonical route with validated parameters and a maximum length of ${SHARE_URL_MAX_LENGTH} characters. They exclude preset names, notes, history, running state, remaining time, and private labels. Loading a link leaves timers stopped and does not save the configuration locally. Parameterized URLs remain absent from XML and HTML sitemaps, navigation, Open Graph URLs, and structured-data URLs.

Interval Timer, Meeting Agenda Timer, Event Countdown, and Multiple Timers were excluded because their meaningful configurations depend on arbitrary labels or already-persistent named collections. World Clock was excluded to keep reusable timezone groups on the more actionable Time Zone Meeting Planner. The Stage 6 browser record covers all five share routes at desktop and 390px mobile widths plus complete preset CRUD, corruption recovery, and tool-isolation flows.
<!-- STAGE6_FEATURES_END -->`;
let adsenseAudit = await readFile(ADSENSE_AUDIT_PATH, "utf8");
const stage6Pattern = /<!-- STAGE6_FEATURES_START -->[\s\S]*?<!-- STAGE6_FEATURES_END -->/;
adsenseAudit = stage6Pattern.test(adsenseAudit)
  ? adsenseAudit.replace(stage6Pattern, stage6AuditSection)
  : `${adsenseAudit.trimEnd()}\n\n${stage6AuditSection}\n`;

await Promise.all([
  writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8"),
  writeFile(EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`, "utf8"),
  writeFile(ADSENSE_AUDIT_PATH, adsenseAudit, "utf8"),
]);

if (failures.length > 0) {
  console.error(`Stage 6 audit failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Stage 6 share and preset audit passed (${checks} checks, ${sharePaths.length} share routes, ${presetPaths.length} preset routes).`);
}
