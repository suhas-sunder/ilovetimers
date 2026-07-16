import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import { RELATED_TOOL_LINKS } from "../../app/clients/config/relatedTools.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE_URL = "https://www.ilovetimers.com";
const failures = [];

const timeTools = [
  ["/current-local-time", "Current Local Time | Device Clock with Fullscreen", "Current Local Time"],
  ["/digital-clock", "Digital Clock Online | Current Local Time", "Digital Clock"],
  ["/big-digital-clock", "Big Digital Clock | Large Current Time Display", "Big Digital Clock"],
  ["/minimalist-clock", "Minimalist Clock | Clean Current Time Display", "Minimalist Clock"],
  ["/clock-with-seconds", "Clock with Seconds | Live Local Time Display", "Clock With Seconds"],
  ["/clock-with-milliseconds", "Clock with Milliseconds | Local Time Display", "Clock With Milliseconds"],
  ["/full-screen-clock", "Fullscreen Digital Clock | Large Current Time Display", "Full Screen Clock"],
  ["/timer-clock", "Clock and Timer Online | Current Time with Countdown", "Clock and Timer"],
  ["/analog-clock", "Analog Clock Online | Current Local Time", "Analog Clock"],
  ["/analog-clock-with-second-hand", "Analog Clock with Second Hand | Live Local Time", "Analog Clock With Second Hand"],
  ["/smooth-second-hand-clock", "Smooth Second Hand Clock | Analog Time Display", "Smooth Second Hand Clock"],
  ["/full-screen-analog-clock", "Fullscreen Analog Clock | Large Local Time Display", "Full Screen Analog Clock"],
  ["/millisecond-timer", "Millisecond Timer Online | Short Precision-Display Countdown", "Millisecond Timer"],
  ["/milliseconds-converter", "Milliseconds Converter | Seconds, Minutes and Hours", "Milliseconds Converter"],
  ["/stopwatch-with-milliseconds", "Stopwatch with Milliseconds | Laps and Fullscreen", "Stopwatch With Milliseconds"],
  ["/military-time-converter", "Military Time Converter | 12-Hour and 24-Hour Time", "Military Time Converter"],
  ["/military-time-clock", "Military Time Clock | Current 24-Hour Time", "Military Time Clock"],
  ["/24-hour-clock", "24-Hour Clock Online | Current Local Time", "24 Hour Clock"],
  ["/12-hour-clock", "12-Hour Clock Online | Current Local Time", "12 Hour Clock"],
  ["/utc-clock", "UTC Clock Online | Current Coordinated Universal Time", "UTC Clock"],
  ["/epoch-unix-time-clock", "Unix Timestamp Clock | Current Epoch Time", "Unix Time Clock (Epoch Timestamp)"],
  ["/unix-timestamp-converter", "Unix Timestamp Converter | Seconds, Milliseconds and Dates", "Unix Timestamp Converter"],
  ["/world-clock", "World Clock Online | Current Time in Multiple Cities", "World Clock"],
  ["/world-clock-with-seconds", "World Clock with Seconds | Multiple Time Zones", "World Clock With Seconds"],
  ["/world-clock-with-milliseconds", "World Clock with Milliseconds | Multiple Time Zones", "World Clock With Milliseconds"],
  ["/time-zone-converter", "Time Zone Converter | Convert Times Between Cities", "Time Zone Converter"],
  ["/time-zone-meeting-planner", "Time Zone Meeting Planner | Compare Working Hours", "Time Zone Meeting Planner"],
  ["/atomic-clock", "Online Atomic Clock (Device Time With Milliseconds, Fullscreen)", "Atomic Clock"],
];

const reviewedRouteFiles = [
  "clock-with-milliseconds",
  "milliseconds-converter",
  "military-time-converter",
  "utc-clock",
  "epoch-unix-time-clock",
  "unix-timestamp-converter",
  "time-zone-converter",
  "time-zone-meeting-planner",
];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

function configuredRoutesFrom(source) {
  const routes = new Set(["/"]);
  for (const match of source.matchAll(/\broute\(\s*["']([^"']+)["']/g)) {
    routes.add(`/${match[1]}`);
  }
  return routes;
}

function stringConstant(source, name) {
  const match = source.match(
    new RegExp(`const\\s+${name}\\s*=\\s*(?:\\r?\\n\\s*)?["']([^"']+)["']`),
  );
  return match?.[1] ?? "";
}

function xmlPathsFrom(source) {
  return [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    new URL(match[1].trim()).pathname,
  );
}

function moreDirectoryRoutesFrom(source) {
  const start = source.indexOf("const TIMER_DIRECTORY");
  const end = source.indexOf("\n];", start);
  check(start >= 0 && end > start, "Could not parse the More-directory data.");
  if (start < 0 || end <= start) return [];
  return [...source.slice(start, end).matchAll(/href:\s*["'](\/[^"']*)["']/g)].map(
    (match) => match[1],
  );
}

function footerRoutesFrom(source) {
  const start = source.indexOf("export const footerSections");
  const end = source.indexOf("const footerLinkClass", start);
  check(start >= 0 && end > start, "Could not parse the footer route directory.");
  if (start < 0 || end <= start) return [];
  return [...source.slice(start, end).matchAll(/to:\s*["'](\/[^"']*)["']/g)].map(
    (match) => match[1],
  );
}

const [routesSource, sitemapSource, rootSource, footerSource, discoverySource] =
  await Promise.all([
    read("app/routes.ts"),
    read("public/sitemap.xml"),
    read("app/root.tsx"),
    read("app/clients/components/navigation/Footer.tsx"),
    read("app/clients/components/clock-discovery/ClockDiscoveryPages.tsx"),
  ]);

const configuredRoutes = configuredRoutesFrom(routesSource);
const redirectSources = new Set(Object.keys(PERMANENT_REDIRECTS));
const xmlPaths = xmlPathsFrom(sitemapSource);
const moreDirectoryRoutes = moreDirectoryRoutesFrom(rootSource);
const footerRoutes = footerRoutesFrom(footerSource);
const htmlSitemapRoutes = SITEMAP_GROUPS.flatMap((group) => group.routes);
const titles = [];
const descriptions = [];
const scopedSources = [discoverySource];

for (const [route, expectedTitle, expectedH1] of timeTools) {
  const routeFile = `app/routes/${route.slice(1)}.tsx`;
  const source = await read(routeFile);
  scopedSources.push(source);
  const title = stringConstant(source, "title");
  const description = stringConstant(source, "description");

  check(configuredRoutes.has(route), `Time-tool route is not configured: ${route}`);
  check(title === expectedTitle, `${route} has an unexpected title: ${title}`);
  check(description.length > 0, `${route} has an empty meta description.`);
  check(
    (source.match(/rel:\s*["']canonical["']/g) ?? []).length === 1,
    `${route} does not declare exactly one canonical in its route metadata.`,
  );
  check(
    source.includes(`${SITE_URL}${route}`) ||
      source.includes(`ROUTE_PATH = "${route}"`) ||
      source.includes(`\`${SITE_URL}\${route}\``) ||
      source.includes(`\`\${SITE_URL}${route}\``),
    `${route} does not declare its canonical path.`,
  );
  check(!redirectSources.has(route), `${route} is unexpectedly a redirect source.`);
  check(
    source.includes(`title="${expectedH1}"`) || discoverySource.includes(`title="${expectedH1}"`),
    `${route} does not expose the expected ToolHero H1: ${expectedH1}`,
  );

  titles.push(title);
  descriptions.push(description);
}

check(new Set(titles).size === titles.length, "Scoped time tools contain duplicate titles.");
check(
  new Set(descriptions).size === descriptions.length,
  "Scoped time tools contain duplicate meta descriptions.",
);

const forbiddenMetadata = [
  "exact atomic time",
  "certified",
  "official",
  "synchronized with an atomic clock",
  "laboratory precision",
];
for (const [index, [route]] of timeTools.entries()) {
  const metadata = `${titles[index]} ${descriptions[index]}`.toLowerCase();
  for (const term of forbiddenMetadata) {
    check(!metadata.includes(term), `${route} metadata contains unsupported wording: ${term}`);
  }
}

for (const file of reviewedRouteFiles) {
  const source = await read(`app/routes/${file}.tsx`);
  check(
    source.includes('iso: "2026-07-15"') && source.includes('label: "July 15, 2026"'),
    `/${file} does not use the reviewed July 15 date pair.`,
  );
  check(source.includes("dateModified: REVIEW_DATE.iso"), `/${file} schema date is not tied to its visible review date.`);
}
check(
  discoverySource.includes('iso: "2026-07-15"') &&
    discoverySource.includes('label: "July 15, 2026"') &&
    discoverySource.includes("dateModified={REVIEW_DATE.iso}"),
  "/world-clock-with-milliseconds review and schema dates are not aligned.",
);

for (const [route] of timeTools) {
  const group = RELATED_TOOL_LINKS[route];
  check(Boolean(group), `${route} has no centralized related-tool group.`);
  if (!group) continue;
  check(group.links.length >= 3 && group.links.length <= 6, `${route} has an invalid related-link count.`);
  const destinations = group.links.map((link) => link.to);
  check(new Set(destinations).size === destinations.length, `${route} repeats a related destination.`);
  for (const destination of destinations) {
    check(destination !== route, `${route} links to itself.`);
    check(configuredRoutes.has(destination), `${route} links to a missing route: ${destination}`);
    check(!redirectSources.has(destination), `${route} links to a redirect alias: ${destination}`);
    check(!/[?#]/.test(destination), `${route} has a query or fragment in related links: ${destination}`);
    check(destination === "/" || !destination.endsWith("/"), `${route} has a trailing-slash related link: ${destination}`);
  }
}

const scopedSchemaSource = scopedSources.join("\n");
for (const schemaType of ["HowTo", "Organization", "Review", "AggregateRating", "Offer"]) {
  check(
    !new RegExp(`["']@type["']\\s*:\\s*["']${schemaType}["']`).test(scopedSchemaSource),
    `Scoped time-tool source contains forbidden ${schemaType} schema.`,
  );
}
check(
  !/["'](?:aggregateRating|reviewRating|offers)["']\s*:/.test(scopedSchemaSource),
  "Scoped time-tool source contains rating, review, or offer properties.",
);

check(
  discoverySource.includes("faqItems={WORLD_SECONDS_FAQ}") &&
    discoverySource.includes('items={WORLD_SECONDS_FAQ}') &&
    discoverySource.includes("faqItems={WORLD_MILLISECONDS_FAQ}") &&
    discoverySource.includes('items={WORLD_MILLISECONDS_FAQ}'),
  "World-clock FAQ schema and visible FAQ are not sourced from the same data.",
);

const converterSource = await read("app/routes/unix-timestamp-converter.tsx");
check(
  converterSource.includes('value="microseconds"') &&
    converterSource.includes('unit === "microseconds"') &&
    converterSource.includes('type TimestampUnit = "auto" | "seconds" | "milliseconds" | "microseconds"'),
  "Unix converter no longer exposes and handles microseconds consistently.",
);
const millisecondsSource = await read("app/routes/milliseconds-converter.tsx");
check(
  millisecondsSource.includes("BigInt(divisor)") && millisecondsSource.includes("shiftDecimal"),
  "Milliseconds converter no longer uses its decimal-string conversion path.",
);
const meetingPlannerSource = await read("app/routes/time-zone-meeting-planner.tsx");
check(
  meetingPlannerSource.includes('label="UTC reference date"') &&
    meetingPlannerSource.includes("Date.UTC(") &&
    meetingPlannerSource.includes("Intl.DateTimeFormat"),
  "Meeting planner no longer exposes its UTC reference-date policy.",
);

check(configuredRoutes.size === 136, `Expected 136 configured routes; found ${configuredRoutes.size}.`);
check(Object.keys(PERMANENT_REDIRECTS).length === 17, "Expected 17 permanent redirects.");
check(xmlPaths.length === 133, `Expected 133 XML sitemap URLs; found ${xmlPaths.length}.`);
check(moreDirectoryRoutes.length === 126, `Expected 126 More-directory tools; found ${moreDirectoryRoutes.length}.`);
check(footerRoutes.length === 136, `Expected 136 footer routes; found ${footerRoutes.length}.`);
check(Object.keys(RELATED_TOOL_LINKS).length === 81, "Expected 81 centralized related-tool groups.");
for (const [route] of timeTools) {
  check(htmlSitemapRoutes.includes(route), `${route} is missing from the HTML sitemap.`);
  check(footerRoutes.includes(route), `${route} is missing from the footer directory.`);
  check(moreDirectoryRoutes.includes(route), `${route} is missing from the More directory.`);
  check(xmlPaths.includes(route), `${route} is missing from the XML sitemap.`);
}

if (failures.length > 0) {
  console.error("Time-tool audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Time-tool audit passed (${timeTools.length} routes, ${configuredRoutes.size} canonical routes, ${Object.keys(PERMANENT_REDIRECTS).length} redirects, ${xmlPaths.length} sitemap URLs, ${Object.keys(RELATED_TOOL_LINKS).length} related groups).`,
  );
}
