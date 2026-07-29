import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import { RELATED_TOOL_LINKS } from "../../app/clients/config/relatedTools.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";
import {
  STAGE3_NOINDEX_ROUTE_SET,
  STAGE3_REDIRECT_SOURCE_SET,
} from "../../app/config/routeArchitecture.js";
import {
  readStaticRedirectRules,
  spawnStaticPreview,
} from "../tests/preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PORT = 3015;
const BASE = `http://127.0.0.1:${PORT}`;
const failures = [];
const warnings = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

async function listSourceFiles(directory) {
  const entries = await readdir(path.join(ROOT, directory), { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(relativePath)));
    } else if (/\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function textContent(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseConfiguredRoutes(source) {
  return [
    "/",
    ...[...source.matchAll(/\broute\(\s*["']([^"']+)["']/g)].map(
      (match) => `/${match[1]}`,
    ),
  ];
}

function parseMoreDirectoryRoutes(source) {
  const start = source.indexOf("const TIMER_DIRECTORY");
  const end = source.indexOf("\n];", start);
  check(start >= 0 && end > start, "Could not parse the More-directory data.");
  if (start < 0 || end <= start) return [];
  return [...source.slice(start, end).matchAll(/href:\s*["'](\/[^"']*)["']/g)].map(
    (match) => match[1],
  );
}

function parseFooterRoutes(source) {
  const start = source.indexOf("export const footerSections");
  const end = source.indexOf("const footerLinkClass", start);
  check(start >= 0 && end > start, "Could not parse the footer route data.");
  if (start < 0 || end <= start) return [];
  return [...source.slice(start, end).matchAll(/to:\s*["'](\/[^"']*)["']/g)].map(
    (match) => match[1],
  );
}

function parseXmlPaths(source) {
  return [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    try {
      return new URL(match[1].trim()).pathname;
    } catch {
      return "INVALID_URL";
    }
  });
}

function parseReportRoutes(source) {
  return [...source.matchAll(/^\|\s*`(\/[^`]*)`\s*\|/gm)].map((match) => match[1]);
}

function normalizeParagraph(value) {
  return textContent(value)
    .toLowerCase()
    .replace(/\b\d+(?::\d+)?\b/g, "#")
    .replace(/[^a-z#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(BASE, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // The production bundle may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Production server did not become ready for release checks.");
}

const [
  routeSource,
  rootSource,
  footerSource,
  sitemapSource,
  packageSource,
  appProviderSource,
  analyticsSource,
  monetizationSource,
  homepageSource,
  searchIntentReport,
  readinessReport,
] = await Promise.all([
  read("app/routes.ts"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
  read("public/sitemap.xml"),
  read("package.json"),
  read("app/provider.tsx"),
  read("app/clients/lib/analytics.ts"),
  read("app/clients/config/monetization.ts"),
  read("app/routes/home.tsx"),
  read("docs/audits/search-intent-map.md"),
  read("docs/audits/adsense-readiness.md"),
]);

const packageJson = JSON.parse(packageSource);
const routes = parseConfiguredRoutes(routeSource);
const routeSet = new Set(routes);
const aliases = Object.keys(PERMANENT_REDIRECTS);
const xmlPaths = parseXmlPaths(sitemapSource);
const moreRoutes = parseMoreDirectoryRoutes(rootSource).filter(
  (route) =>
    !STAGE3_NOINDEX_ROUTE_SET.has(route) &&
    !STAGE3_REDIRECT_SOURCE_SET.has(route),
);
const footerRoutes = parseFooterRoutes(footerSource);
const sitemapDirectoryRoutes = SITEMAP_GROUPS.flatMap((group) => group.routes);
const guideArticleRoutes = new Set(
  (SITEMAP_GROUPS.find((group) => group.title === "Guides")?.routes ?? []).filter(
    (route) => route !== "/guides",
  ),
);
const relatedGroups = Object.keys(RELATED_TOOL_LINKS);

check(new Set(routes).size === routes.length, "Configured canonical routes are not unique.");
check(aliases.length === STAGE3_REDIRECT_SOURCE_SET.size + 17, `Expected retained aliases plus Stage 3 redirects; found ${aliases.length}.`);
check(xmlPaths.length === routes.length - STAGE3_NOINDEX_ROUTE_SET.size, `XML sitemap count does not match indexable canonical routes; found ${xmlPaths.length}.`);
check(new Set(xmlPaths).size === xmlPaths.length, "XML sitemap URLs are not unique.");
check(footerRoutes.includes("/guides"), "Footer must contain the Guides index.");
check([...guideArticleRoutes].every((route) => !footerRoutes.includes(route)), "Guide articles must stay out of the global footer.");
check(footerRoutes.length === routes.length - guideArticleRoutes.size, `Footer must contain every canonical route except guide articles; found ${footerRoutes.length}.`);
check(relatedGroups.length === moreRoutes.length, `Related-tool and discoverable-tool counts differ (${relatedGroups.length} vs ${moreRoutes.length}).`);
check(sitemapDirectoryRoutes.length === routes.length, `HTML sitemap must contain every canonical route; found ${sitemapDirectoryRoutes.length}.`);
check(new Set(sitemapDirectoryRoutes).size === sitemapDirectoryRoutes.length, "HTML sitemap routes are not unique.");

for (const route of routes) {
  check(sitemapDirectoryRoutes.includes(route), `Canonical route is missing from HTML sitemap data: ${route}`);
  check(
    footerRoutes.includes(route) === !guideArticleRoutes.has(route),
    guideArticleRoutes.has(route)
      ? `Guide article must stay out of the full footer: ${route}`
      : `Canonical route is missing from the full footer: ${route}`,
  );
}
for (const alias of aliases) {
  check(!routeSet.has(alias), `Redirect alias is also a live canonical route: ${alias}`);
  check(!xmlPaths.includes(alias), `Redirect alias appears in XML sitemap: ${alias}`);
  check(!moreRoutes.includes(alias), `Redirect alias appears in More directory: ${alias}`);
  check(!footerRoutes.includes(alias), `Redirect alias appears in footer: ${alias}`);
  check(!sitemapDirectoryRoutes.includes(alias), `Redirect alias appears in HTML sitemap: ${alias}`);
  check(!PERMANENT_REDIRECTS[PERMANENT_REDIRECTS[alias]], `Redirect chain exists at ${alias}.`);
}

const readinessRoutes = parseReportRoutes(readinessReport);
check(new Set(readinessRoutes).size === readinessRoutes.length, "Readiness report contains duplicate route rows.");
for (const route of routes) {
  check(readinessRoutes.includes(route), `Readiness report is missing ${route}.`);
}
check(
  /READY TO REAPPLY|NEEDS IMPROVEMENT BEFORE REAPPLYING|BLOCK REAPPLICATION/.test(readinessReport),
  "Readiness report is missing the human AdSense classification.",
);

const requiredIntentPrimaries = [
  "/analog-clock",
  "/full-screen-analog-clock",
  "/analog-clock-with-second-hand",
  "/smooth-second-hand-clock",
  "/full-screen-clock",
  "/clock-with-seconds",
  "/clock-with-milliseconds",
  "/atomic-clock",
  "/world-clock-with-milliseconds",
  "/millisecond-timer",
  "/stopwatch-with-milliseconds",
  "/milliseconds-converter",
  "/timer-stopwatch",
  "/timer-clock",
  "/study-stopwatch",
  "/study-timer",
  "/online-alarm-clock",
  "/alarm-timer",
  "/silent-timer",
  "/metronome",
  "/bpm-tapper",
  "/military-time-converter",
  "/military-time-clock",
  "/24-hour-clock",
  "/12-hour-clock",
  "/utc-clock",
  "/epoch-unix-time-clock",
  "/unix-timestamp-converter",
  "/world-clock",
  "/world-clock-with-seconds",
  "/time-zone-converter",
  "/time-zone-meeting-planner",
  "/date-calculator",
  "/date-duration-calculator",
  "/weeks-between-dates-calculator",
  "/months-between-dates-calculator",
  "/days-until-calculator",
  "/hours-until-calculator",
  "/weekday-calculator",
  "/week-number-calculator",
  "/business-days-calculator",
  "/workdays-calculator",
  "/time-calculator",
  "/time-duration-calculator",
  "/work-hours-calculator",
  "/time-card-calculator",
  "/weekly-timesheet-calculator",
  "/billable-hours-calculator",
  "/billable-hours-clock",
  "/speedrun-timer",
  "/exam-timer",
  "/chaos-timer",
  "/binary-clock",
  "/hexadecimal-clock",
  "/astronomical-clock",
  "/fibonacci-clock",
];
for (const route of requiredIntentPrimaries) {
  check(searchIntentReport.includes(`\`${route}\``), `Search-intent map is missing ${route}.`);
}
for (const phrase of [
  "floating clock with milliseconds",
  "picture-in-picture clock",
  "microsecond clock",
  "nanosecond clock",
  "exact synchronized atomic time",
  "certified time",
  "laboratory precision",
  "official military time source",
  "UTC offset doorway pages",
  "country-specific clock doorway pages",
  "city-specific timer pages",
  "exact conversion-value doorway pages",
]) {
  check(searchIntentReport.toLowerCase().includes(phrase.toLowerCase()), `Unsupported-query exclusion is missing: ${phrase}`);
}

const sourceFiles = await listSourceFiles("app");
const sourceEntries = await Promise.all(sourceFiles.map(async (file) => [file, await read(file)]));
const appSource = sourceEntries.map(([, source]) => source).join("\n");
check(!/["']@type["']\s*:\s*["']HowTo["']/.test(appSource), "HowTo schema exists in app source.");
check(!/["']@type["']\s*:\s*["']Organization["']/.test(appSource), "Organization schema exists in app source.");
check(
  !/["']@type["']\s*:\s*["'](?:Review|AggregateRating)["']/.test(appSource) &&
    !/["'](?:aggregateRating|reviewRating)["']\s*:/.test(appSource),
  "Rating or review schema exists in app source.",
);
check(!/["']offers["']\s*:/.test(appSource), "Offer schema exists in app source.");
check(
  (appSource.match(/["']@type["']\s*:\s*["']WebSite["']/g) ?? []).length === 1,
  "Source must contain one root-owned WebSite emitter.",
);

check(
  (homepageSource.match(/<AdPlaceholder\s+slot=/g) ?? []).length === 2,
  "Homepage must render exactly two declared placeholders.",
);
check(!/adsbygoogle|googlesyndication/i.test(appSource), "Live Google advertising code exists in app source.");
check(monetizationSource.includes('path: "/"'), "Homepage monetization entry is missing.");
check(monetizationSource.includes("allowedSlots: HOMEPAGE_AD_SLOTS"), "Homepage placeholder slots are not configured.");
check(monetizationSource.includes("allowedSlots: NO_AD_SLOTS"), "Ad-free route configuration is missing.");

check(appProviderSource.includes('cookieless_mode: "always"'), "PostHog always-on cookieless mode is missing.");
check(appProviderSource.includes('persistence: "memory"'), "PostHog memory-only persistence is missing.");
check(appProviderSource.includes("disable_persistence: true"), "PostHog persistence is not disabled.");
check(appProviderSource.includes("capture_pageview: false"), "Automatic pageview capture is not disabled.");
check(appProviderSource.includes("autocapture: false"), "PostHog autocapture is not disabled.");
check(appProviderSource.includes("disable_session_recording: true"), "Session recording is not disabled.");
check(appProviderSource.includes("disable_surveys: true"), "PostHog surveys are not disabled.");
check(appProviderSource.includes("advanced_disable_feature_flags: true"), "PostHog feature flags are not disabled.");
check(appProviderSource.includes("disable_web_experiments: true"), "PostHog web experiments are not disabled.");
check(appProviderSource.includes('person_profiles: "never"'), "PostHog person profiles are not disabled.");
check(!appProviderSource.includes("AnalyticsConsentBanner"), "The PostHog consent banner is still rendered.");
check(!analyticsSource.includes("localStorage.setItem"), "Analytics still writes to localStorage.");
check(analyticsSource.includes("window.location.pathname"), "Manual analytics path sanitization is missing.");

for (const route of [
  "/about",
  "/author/suhas-sunder",
  "/contact",
  "/how-ilovetimers-is-made",
  "/copyright",
  "/privacy",
  "/terms",
  "/cookies",
]) {
  check(routeSet.has(route), `Trust route is missing: ${route}`);
  check(footerRoutes.includes(route), `Trust route is missing from footer: ${route}`);
}

const server = spawnStaticPreview({ root: ROOT, port: PORT });
const pageResults = [];

try {
  await waitForServer();

  for (const route of routes) {
    const response = await fetch(`${BASE}${route}`, { redirect: "manual" });
    const html = await response.text();
    const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((match) => textContent(match[1]));
    const descriptions = [...html.matchAll(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/g)].map((match) => decodeHtml(match[1]));
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((match) => textContent(match[1]));
    const canonicals = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)].map((match) => decodeHtml(match[1]));
    const robots = [...html.matchAll(/<meta\b[^>]*name="robots"[^>]*content="([^"]*)"[^>]*>/g)].map((match) => match[1]);
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const duplicateIds = duplicateValues(ids).map(([id]) => id);
    const adCount = (html.match(/aria-label="Advertisements"/g) ?? []).length;
    const jsonLd = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
      (match) => match[1],
    );
    const schemaDocuments = jsonLd.flatMap((value) => {
      try {
        return [JSON.parse(value)];
      } catch {
        failures.push(`${route} contains invalid JSON-LD.`);
        return [];
      }
    });
    const schemaNodes = [];
    const visitSchema = (value) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        for (const child of value) visitSchema(child);
        return;
      }
      schemaNodes.push(value);
      for (const child of Object.values(value)) visitSchema(child);
    };
    for (const document of schemaDocuments) visitSchema(document);
    const faqPages = schemaNodes.filter((node) => node["@type"] === "FAQPage");
    const mainText = textContent(main);
    const expectedCanonical = route === "/" ? "https://www.ilovetimers.com" : `https://www.ilovetimers.com${route}`;
    const shouldNoindex = STAGE3_NOINDEX_ROUTE_SET.has(route);

    check(response.status === 200, `${route} returned ${response.status}.`);
    check(titles.length === 1 && titles[0], `${route} must render one nonempty title.`);
    check(descriptions.length === 1 && descriptions[0], `${route} must render one nonempty description.`);
    check(h1s.length === 1 && h1s[0], `${route} must render one nonempty H1.`);
    check(canonicals.length === 1 && canonicals[0] === expectedCanonical, `${route} canonical is missing or incorrect.`);
    check(robots.length === 1, `${route} must render one robots directive.`);
    check(shouldNoindex ? /noindex/i.test(robots[0] ?? "") : !/noindex/i.test(robots[0] ?? ""), `${route} has unexpected indexability.`);
    check(main.length > 500, `${route} has no substantial SSR main content.`);
    check(duplicateIds.length === 0, `${route} has duplicate IDs: ${duplicateIds.join(", ")}.`);
    check(!/under construction|coming soon|unexpected application error|something went wrong/i.test(main), `${route} renders an empty, unfinished, or fatal state.`);
    check((route === "/" && adCount === 2) || (route !== "/" && adCount === 0), `${route} violates the placeholder policy (${adCount} slots).`);
    check(schemaNodes.filter((node) => node["@type"] === "WebSite").length === 1, `${route} must render one WebSite entity.`);
    check(schemaNodes.filter((node) => node["@type"] === "SoftwareApplication").length <= 1, `${route} renders conflicting application objects.`);
    check(faqPages.length <= 1, `${route} renders ${faqPages.length} FAQPage objects.`);
    for (const faqPage of faqPages) {
      for (const question of Array.isArray(faqPage.mainEntity) ? faqPage.mainEntity : []) {
        check(Boolean(question.name) && mainText.includes(question.name), `${route} has a schema-only FAQ question: ${question.name ?? "missing name"}`);
        const answer = question.acceptedAnswer?.text;
        check(Boolean(answer) && mainText.includes(answer), `${route} has a schema FAQ answer that does not match visible content: ${question.name ?? "missing name"}`);
      }
    }
    const personCount = schemaNodes.filter((node) => node["@type"] === "Person").length;
    const profileCount = schemaNodes.filter((node) => node["@type"] === "ProfilePage").length;
    const aboutCount = schemaNodes.filter((node) => node["@type"] === "AboutPage").length;
    check(personCount === (route === "/author/suhas-sunder" ? 1 : 0), `${route} renders an unexpected Person count (${personCount}).`);
    check(profileCount === (route === "/author/suhas-sunder" ? 1 : 0), `${route} renders an unexpected ProfilePage count (${profileCount}).`);
    check(aboutCount === (route === "/about" ? 1 : 0), `${route} renders an unexpected AboutPage count (${aboutCount}).`);
    check(!schemaNodes.some((node) => ["HowTo", "Organization", "Review", "AggregateRating"].includes(node["@type"]) || node.aggregateRating || node.reviewRating || node.offers), `${route} renders prohibited schema.`);

    pageResults.push({ route, title: titles[0], description: descriptions[0], h1: h1s[0], main });
  }

  const { permanent } = await readStaticRedirectRules(ROOT);
  for (const [source, destination] of Object.entries(PERMANENT_REDIRECTS)) {
    check(permanent.get(source) === destination, `${source} is missing its static one-hop 301 mapping.`);
    check(permanent.get(`${source}/`) === destination, `${source}/ is missing its static one-hop 301 mapping.`);
  }

  const unknown = await fetch(`${BASE}/release-readiness-unknown-route`, { redirect: "manual" });
  check(unknown.status === 404, `Unknown route returned ${unknown.status}, expected 404.`);
} finally {
  server.kill();
}

for (const [title, count] of duplicateValues(pageResults.map((page) => page.title))) {
  failures.push(`Duplicate rendered title on ${count} routes: ${title}`);
}
for (const [description, count] of duplicateValues(pageResults.map((page) => page.description))) {
  failures.push(`Duplicate rendered description on ${count} routes: ${description}`);
}
for (const [h1, count] of duplicateValues(pageResults.map((page) => page.h1))) {
  failures.push(`Duplicate rendered H1 on ${count} routes: ${h1}`);
}

const paragraphOwners = new Map();
for (const page of pageResults) {
  const paragraphs = [...page.main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)]
    .map((match) => normalizeParagraph(match[1]))
    .filter((paragraph) => paragraph.length >= 180);
  for (const paragraph of new Set(paragraphs)) {
    const owners = paragraphOwners.get(paragraph) ?? [];
    owners.push(page.route);
    paragraphOwners.set(paragraph, owners);
  }
}
for (const owners of paragraphOwners.values()) {
  if (owners.length >= 4) warnings.push(`Long paragraph repeats on ${owners.length} routes: ${owners.join(", ")}`);
}

const existingAuditFiles = [
  "seo-integrity.mjs",
  "internal-links.mjs",
  "preset-timers.mjs",
  "time-tools.mjs",
  "calculators.mjs",
  "specialty-tools.mjs",
  "ui-integrity.mjs",
  "accessibility.mjs",
  "route-architecture.mjs",
];
for (const auditFile of existingAuditFiles) {
  const result = spawnSync(process.execPath, [path.join(ROOT, "scripts/audits", auditFile)], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 180_000,
  });
  check(result.status === 0, `${auditFile} failed when run from the release audit: ${(result.stderr || result.stdout).trim()}`);
}

check(Boolean(packageJson.scripts["audit:release"]), "package.json is missing audit:release.");

if (warnings.length) {
  console.warn("Release-readiness manual-review warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (failures.length) {
  console.error("Release-readiness audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Release-readiness audit passed (${routes.length} routes, ${aliases.length} redirects, ${xmlPaths.length} sitemap URLs, ${moreRoutes.length} More tools, ${footerRoutes.length} footer destinations, ${relatedGroups.length} related groups).`,
  );
  console.log("Static checks do not predict rankings, field Core Web Vitals, or AdSense approval; use the human readiness report and post-release monitoring plan.");
}
