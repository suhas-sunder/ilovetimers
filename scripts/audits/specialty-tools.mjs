import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import { RELATED_TOOL_LINKS } from "../../app/clients/config/relatedTools.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";
import {
  STAGE3_INDEXABLE_PRESET_ROUTE_SET,
  STAGE3_NOINDEX_ROUTE_SET,
  STAGE3_REDIRECT_SOURCE_SET,
} from "../../app/config/routeArchitecture.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE_URL = "https://www.ilovetimers.com";
const failures = [];

const taskRoutes = [
  "/silent-timer", "/visual-timer", "/multiple-timers",
  "/interval-timer", "/timer-stopwatch", "/timer-clock", "/pomodoro-timer",
  "/hiit-timer", "/presentation-timer", "/speech-timer", "/classroom-timer",
  "/meeting-timer", "/meeting-agenda-timer", "/exam-timer", "/break-timer",
  "/study-timer", "/study-stopwatch", "/workout-timer", "/rest-timer",
  "/tabata-timer", "/kitchen-timer", "/meditation-timer",
  "/speedcubing-timer", "/lab-timer", "/alarm-timer", "/online-alarm-clock",
  "/productivity-timer", "/meeting-count-up-timer", "/breathing-timer",
  "/sleep-timer", "/stretch-timer", "/drink-water-reminder-timer",
  "/emom-timer", "/amrap-timer", "/round-timer",
  "/pace-timer", "/tea-timer", "/egg-timer", "/video-game-challenge-timer",
  "/speedrun-timer", "/pizza-timer", "/debt-repayment-timer",
  "/focus-session-timer", "/time-blocking-clock", "/reaction-time-test",
  "/metronome", "/bpm-tapper", "/chess-clock", "/binary-stopwatch",
  "/event-countdown", "/countdown-to-date", "/new-year-countdown",
  "/christmas-countdown", "/birthday-countdown",
];

const noveltyRoutes = [
  "/chaos-timer", "/fibonacci-clock", "/sunrise-sunset-clock",
  "/morse-code-clock", "/debt-clock", "/golden-hour-clock",
  "/moon-phase-clock", "/astronomical-clock", "/swatch-internet-time-clock",
  "/binary-clock", "/hexadecimal-clock", "/roman-numeral-clock",
  "/retro-flip-clock", "/minimalist-clock",
];

const specialtyRoutes = [...taskRoutes, ...noveltyRoutes];
const scoped = [
  ["/online-alarm-clock", "Online Alarm Clock | Set an Alarm in Your Browser", "Online Alarm Clock"],
  ["/alarm-timer", "Alarm Timer Online | Countdown with Sound", "Alarm Timer"],
  ["/silent-timer", "Silent Timer Online | Countdown with No Sound", "Silent Timer"],
  ["/metronome", "Online Metronome | BPM, Time Signature and Subdivisions", "Online Metronome"],
  ["/bpm-tapper", "BPM Tapper Online | Tap Tempo Counter", "BPM Tapper"],
  ["/pizza-timer", "Pizza Timer (Frozen Pizza Presets, Fullscreen)", "Pizza Timer"],
  ["/reaction-time-test", "Reaction Time Test (Casual Click Speed Test)", "Reaction Time Test"],
];

const classification = {
  "A INDEPENDENT INDEXABLE": specialtyRoutes.filter(
    (route) =>
      !STAGE3_NOINDEX_ROUTE_SET.has(route) &&
      !STAGE3_INDEXABLE_PRESET_ROUTE_SET.has(route),
  ),
  "B CONCISE INDEXABLE PRESET": specialtyRoutes.filter((route) =>
    STAGE3_INDEXABLE_PRESET_ROUTE_SET.has(route),
  ),
  "C NON-INDEXABLE UTILITY": specialtyRoutes.filter((route) =>
    STAGE3_NOINDEX_ROUTE_SET.has(route),
  ),
};

const protectedRoutes = [
  "/online-alarm-clock", "/metronome", "/chaos-timer",
  "/hexadecimal-clock", "/binary-clock",
  "/fibonacci-clock", "/speedrun-timer", "/exam-timer",
];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

function configuredRoutesFrom(source) {
  const routes = new Set(["/"]);
  for (const match of source.matchAll(/\broute\(\s*["']([^"']+)["']/g)) routes.add(`/${match[1]}`);
  return routes;
}

function stringConstant(source, name) {
  return source.match(new RegExp(`const\\s+${name}\\s*=\\s*(?:\\r?\\n\\s*)?["']([^"']+)["']`))?.[1] ?? "";
}

function xmlPathsFrom(source) {
  return [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1].trim()).pathname);
}

function moreDirectoryRoutesFrom(source) {
  const start = source.indexOf("const TIMER_DIRECTORY");
  const end = source.indexOf("\n];", start);
  return start >= 0 && end > start
    ? [...source.slice(start, end).matchAll(/href:\s*["'](\/[^"']*)["']/g)].map((match) => match[1])
    : [];
}

function footerRoutesFrom(source) {
  const start = source.indexOf("export const footerSections");
  const end = source.indexOf("const footerLinkClass", start);
  return start >= 0 && end > start
    ? [...source.slice(start, end).matchAll(/to:\s*["'](\/[^"']*)["']/g)].map((match) => match[1])
    : [];
}

const [routesSource, sitemapSource, rootSource, footerSource] = await Promise.all([
  read("app/routes.ts"),
  read("public/sitemap.xml"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
]);
const configuredRoutes = configuredRoutesFrom(routesSource);
const xmlPaths = xmlPathsFrom(sitemapSource);
const moreRoutes = moreDirectoryRoutesFrom(rootSource).filter(
  (route) =>
    !STAGE3_NOINDEX_ROUTE_SET.has(route) &&
    !STAGE3_REDIRECT_SOURCE_SET.has(route),
);
const footerRoutes = footerRoutesFrom(footerSource);
const htmlRoutes = SITEMAP_GROUPS.flatMap((group) => group.routes);
const guideArticleRoutes = new Set(
  (SITEMAP_GROUPS.find((group) => group.title === "Guides")?.routes ?? []).filter(
    (route) => route !== "/guides",
  ),
);
const redirectSources = new Set(Object.keys(PERMANENT_REDIRECTS));

check(new Set(specialtyRoutes).size === specialtyRoutes.length, "Specialty inventory contains duplicate routes.");
const classificationRoutes = Object.values(classification).flat();
check(new Set(classificationRoutes).size === specialtyRoutes.length, "Each specialty route must have exactly one classification.");
check(classificationRoutes.every((route) => specialtyRoutes.includes(route)), "Classification contains a route outside the inventory.");

const allSpecialtySource = [];
for (const route of specialtyRoutes) {
  check(configuredRoutes.has(route), `Specialty route is not configured: ${route}`);
  const source = await read(`app/routes/${route.slice(1)}.tsx`);
  allSpecialtySource.push(source);
  check(!redirectSources.has(route), `Specialty route is unexpectedly a redirect source: ${route}`);
  check(htmlRoutes.includes(route), `Specialty route is missing from the HTML sitemap: ${route}`);
  check(footerRoutes.includes(route), `Specialty route is missing from the footer: ${route}`);
  check(
    moreRoutes.includes(route) === !STAGE3_NOINDEX_ROUTE_SET.has(route),
    `Specialty route has incorrect More-directory prominence: ${route}`,
  );
  check(
    xmlPaths.includes(route) === !STAGE3_NOINDEX_ROUTE_SET.has(route),
    `Specialty route has incorrect XML sitemap indexability: ${route}`,
  );
}

const scopedTitles = [];
const scopedDescriptions = [];
for (const [route, expectedTitle, expectedH1] of scoped) {
  const source = await read(`app/routes/${route.slice(1)}.tsx`);
  const title = stringConstant(source, "title");
  const description = stringConstant(source, "description");
  scopedTitles.push(title);
  scopedDescriptions.push(description);
  check(title === expectedTitle, `${route} has an unexpected title: ${title}`);
  check(description.length >= 80, `${route} has a missing or vague description.`);
  check(!source.includes('name: "keywords"'), `${route} still emits a keyword-list meta tag.`);
  check(source.includes(`title="${expectedH1}"`), `${route} does not expose the expected H1: ${expectedH1}`);
  check((source.match(/rel:\s*["']canonical["']/g) ?? []).length === 1, `${route} does not declare exactly one canonical.`);
  check(
    source.includes(`${SITE_URL}${route}`) || source.includes(`ROUTE_PATH = "${route}"`),
    `${route} does not declare its self-canonical URL.`,
  );
}
check(new Set(scopedTitles).size === scopedTitles.length, "Scoped specialty titles are not unique.");
check(new Set(scopedDescriptions).size === scopedDescriptions.length, "Scoped specialty descriptions are not unique.");

const alarmSource = await read("app/routes/online-alarm-clock.tsx");
const alarmTimerSource = await read("app/routes/alarm-timer.tsx");
const silentSource = await read("app/routes/silent-timer.tsx");
const metronomeSource = await read("app/routes/metronome.tsx");
const bpmSource = await read("app/routes/bpm-tapper.tsx");
const goldenHourSource = await read("app/routes/golden-hour-clock.tsx");
check(alarmSource.includes("time of day") && alarmTimerSource.includes("counts down a duration"), "Clock-time and duration alarm intents are not visibly distinct.");
check(!/AudioContext|createOscillator|label="Sound"/.test(silentSource), "Silent Timer still contains an audio path or Sound control.");
check(silentSource.includes("no completion beep or ticking sound"), "Silent Timer does not state its no-sound behavior.");
check(metronomeSource.includes("TS_OPTIONS") && metronomeSource.includes("type Subdivision = 1 | 2 | 3 | 4"), "Metronome no longer exposes time signatures and subdivisions.");
check(bpmSource.includes("calculateTapTempo") && bpmSource.includes("onPointerDownCapture"), "BPM Tapper no longer uses its filtered tap path.");
check(
  goldenHourSource.includes("const Jset = getSetJ(h0") &&
    goldenHourSource.includes("const Jrise = Jnoon * 2 - Jset"),
  "Golden Hour Clock no longer assigns the evening crossing to sunset and mirrors dawn around solar noon.",
);
check(
  goldenHourSource.includes("relative mt-4 w-full sm:absolute"),
  "Golden Hour Clock no longer keeps its golden-window summary in normal flow at mobile widths.",
);

for (const [route] of scoped.slice(0, 5)) {
  const source = await read(`app/routes/${route.slice(1)}.tsx`);
  check(source.includes('"@type": "FAQPage"'), `${route} is missing FAQPage schema.`);
  check((source.match(/FAQ_ITEMS\.map/g) ?? []).length >= 2, `${route} FAQ schema and visible FAQ do not share FAQ_ITEMS.`);
}

for (const route of protectedRoutes) {
  const source = await read(`app/routes/${route.slice(1)}.tsx`);
  check(!/noindex/i.test(source), `Protected specialty route became noindex: ${route}`);
  check(xmlPaths.includes(route), `Protected specialty route is missing from XML sitemap: ${route}`);
}

for (const route of [
  "/online-alarm-clock", "/alarm-timer", "/metronome",
  "/bpm-tapper", "/pizza-timer", "/egg-timer", "/tea-timer",
  "/kitchen-timer",
  "/meeting-agenda-timer", "/presentation-timer", "/speech-timer",
  "/interval-timer", "/hiit-timer", "/amrap-timer", "/pace-timer",
]) {
  const group = RELATED_TOOL_LINKS[route];
  check(Boolean(group), `${route} is missing a centralized related-tool group.`);
  if (!group) continue;
  const destinations = group.links.map((link) => link.to);
  check(new Set(destinations).size === destinations.length, `${route} repeats a related destination.`);
  for (const destination of destinations) {
    check(destination !== route, `${route} links to itself.`);
    check(configuredRoutes.has(destination), `${route} links to a missing route: ${destination}`);
    check(!redirectSources.has(destination), `${route} links to a redirect alias: ${destination}`);
    check(!/[?#]/.test(destination), `${route} related link contains a query or fragment.`);
    check(destination === "/" || !destination.endsWith("/"), `${route} related link has a trailing slash.`);
  }
}

const schemaSource = allSpecialtySource.join("\n");
for (const schemaType of ["HowTo", "Organization", "Review", "AggregateRating", "Offer", "Article"]) {
  check(!new RegExp(`["']@type["']\\s*:\\s*["']${schemaType}["']`).test(schemaSource), `Specialty source contains prohibited ${schemaType} schema.`);
}
check(!/["'](?:aggregateRating|reviewRating|offers)["']\s*:/.test(schemaSource), "Specialty source contains rating, review, or offer properties.");

check(configuredRoutes.size === htmlRoutes.length, `Configured and HTML-directory route counts differ (${configuredRoutes.size} vs ${htmlRoutes.length}).`);
check(Object.keys(PERMANENT_REDIRECTS).length === STAGE3_REDIRECT_SOURCE_SET.size + 17, "Permanent redirect count does not match the retained aliases plus Stage 3 decisions.");
check(xmlPaths.length === configuredRoutes.size - STAGE3_NOINDEX_ROUTE_SET.size, `XML sitemap count does not match indexable canonical routes; found ${xmlPaths.length}.`);
check(footerRoutes.includes("/guides"), "Footer must contain the Guides index.");
check([...guideArticleRoutes].every((route) => !footerRoutes.includes(route)), "Guide articles must stay out of the global footer.");
check(footerRoutes.length === configuredRoutes.size - guideArticleRoutes.size, `Footer must contain every canonical route except guide articles; found ${footerRoutes.length}.`);
check(Object.keys(RELATED_TOOL_LINKS).length === moreRoutes.length, `Related-tool and discoverable-tool counts differ (${Object.keys(RELATED_TOOL_LINKS).length} vs ${moreRoutes.length}).`);

if (failures.length) {
  console.error("Specialty-tool audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  const classes = Object.entries(classification).map(([name, routes]) => `${name}: ${routes.length}`).join(", ");
  console.log(`Specialty-tool audit passed (${specialtyRoutes.length} routes; ${classes}; ${configuredRoutes.size} canonical routes; ${xmlPaths.length} sitemap URLs; ${Object.keys(RELATED_TOOL_LINKS).length} related groups).`);
}
