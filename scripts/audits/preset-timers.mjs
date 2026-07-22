import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import {
  presetDurationTimerConfigs,
  secondsTimerContent,
} from "../../app/clients/config/presetTimers.js";
import { RELATED_TOOL_LINKS } from "../../app/clients/config/relatedTools.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";
import {
  STAGE3_NOINDEX_ROUTE_SET,
  STAGE3_REDIRECT_SOURCE_SET,
} from "../../app/config/routeArchitecture.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];

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

function xmlPathsFrom(source) {
  return [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    try {
      return new URL(match[1].trim()).pathname;
    } catch {
      return "INVALID_URL";
    }
  });
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

function normalizeTemplate(value) {
  return value
    .toLowerCase()
    .replace(/\b(?:one|five|ten|fifteen|thirty|sixty|half[- ]hour)\b/g, "#")
    .replace(/\d+(?::\d+)?/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

function expectedClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const [
  routeSource,
  xmlSitemapSource,
  rootSource,
  footerSource,
  sharedPageSource,
  secondsRouteSource,
] = await Promise.all([
  read("app/routes.ts"),
  read("public/sitemap.xml"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
  read("app/clients/components/preset-duration-timer/PresetDurationTimerPage.tsx"),
  read("app/routes/seconds-timer.tsx"),
]);

const configuredRoutes = configuredRoutesFrom(routeSource);
const xmlPaths = xmlPathsFrom(xmlSitemapSource);
const moreDirectoryRoutes = moreDirectoryRoutesFrom(rootSource).filter(
  (route) =>
    !STAGE3_NOINDEX_ROUTE_SET.has(route) &&
    !STAGE3_REDIRECT_SOURCE_SET.has(route),
);
const footerRoutes = footerRoutesFrom(footerSource);
const htmlSitemapRoutes = SITEMAP_GROUPS.flatMap((group) => group.routes);
const guideArticleRoutes = new Set(
  (SITEMAP_GROUPS.find((group) => group.title === "Guides")?.routes ?? []).filter(
    (route) => route !== "/guides",
  ),
);
const redirects = new Set(Object.keys(PERMANENT_REDIRECTS));

const fixedConfigs = Object.values(presetDurationTimerConfigs);
const expectedFixedPaths = new Set([
  "/1-minute-timer",
  "/5-minute-timer",
  "/10-minute-timer",
  "/15-minute-timer",
  "/30-minute-timer",
]);
const family = [secondsTimerContent, ...fixedConfigs];
const familyPaths = family.map((config) => config.path);

check(family.length === 6, `Expected 6 generic preset routes; found ${family.length}.`);
check(new Set(familyPaths).size === familyPaths.length, "Generic preset routes are not unique.");
check(
  fixedConfigs.length === expectedFixedPaths.size &&
    fixedConfigs.every((config) => expectedFixedPaths.has(config.path)),
  "The fixed-duration preset route inventory changed unexpectedly.",
);
check(secondsTimerContent.defaultSeconds > 0, "Seconds timer default must be positive.");
check(
  secondsTimerContent.defaultDisplay === `${secondsTimerContent.defaultSeconds}s`,
  "Seconds timer default display does not match its configured default.",
);

const minuteWords = new Map([
  [1, "one minute"],
  [5, "five minutes"],
  [10, "ten minutes"],
  [15, "fifteen minutes"],
  [30, "thirty minutes"],
]);

for (const config of fixedConfigs) {
  const minutes = config.seconds / 60;
  check(Number.isInteger(minutes) && minutes > 0, `${config.path} has an invalid duration.`);
  check(
    config.defaultDisplay === expectedClock(config.seconds),
    `${config.path} display does not match ${config.seconds} seconds.`,
  );
  check(config.h1 === `${minutes} Minute Timer`, `${config.path} H1 does not match its duration.`);
  check(config.title === config.h1, `${config.path} schema name and visible H1 differ.`);
  check(config.fullscreenTitle === config.h1, `${config.path} fullscreen title differs from its H1.`);
  check(
    config.durationLabel === minuteWords.get(minutes),
    `${config.path} has incorrect singular or plural duration wording.`,
  );
  check(
    config.statusLabel === `${minutes} minute${minutes === 1 ? "" : "s"} ready`,
    `${config.path} ready status has incorrect singular or plural wording.`,
  );
  check(
    config.path === `/${minutes}-minute-timer`,
    `${config.path} route does not match its configured duration.`,
  );
  check(config.metaTitle.startsWith(`${minutes} Minute Timer`), `${config.path} title misses its duration.`);
  check(config.metaDescription.length > 0, `${config.path} has an empty meta description.`);
  check(config.overviewParagraphs.length > 0, `${config.path} has no visible overview.`);
  check(config.useCases.length >= 3 && config.useCases.length <= 5, `${config.path} has an invalid use-case count.`);
  check(config.faqItems.length >= 3 && config.faqItems.length <= 4, `${config.path} has an invalid FAQ count.`);

  const questions = config.faqItems.map((item) => item.question);
  check(new Set(questions).size === questions.length, `${config.path} repeats an FAQ question.`);

  const relatedPaths = config.relatedLinks.map((link) => link.href);
  check(relatedPaths.length >= 3 && relatedPaths.length <= 5, `${config.path} has an invalid related-link count.`);
  check(new Set(relatedPaths).size === relatedPaths.length, `${config.path} repeats a related destination.`);
  check(!relatedPaths.includes(config.path), `${config.path} links to itself.`);

  const presetPaths = config.presetLinks.map((link) => link.href);
  check(new Set(presetPaths).size === presetPaths.length, `${config.path} repeats a preset destination.`);
  check(!presetPaths.includes(config.path), `${config.path} links to itself in its preset controls.`);
  for (const path of presetPaths) {
    check(configuredRoutes.has(path), `${config.path} has a missing preset destination: ${path}`);
    check(!redirects.has(path), `${config.path} has a redirect alias in its preset controls: ${path}`);
    check(!/[?#]/.test(path), `${config.path} has a query or fragment in its preset controls: ${path}`);
  }

  const routeFile = `app/routes/${config.path.slice(1)}.tsx`;
  const routeFileSource = await read(routeFile);
  const expectedKey = Object.entries(presetDurationTimerConfigs).find(
    ([, candidate]) => candidate.path === config.path,
  )?.[0];
  check(
    Boolean(expectedKey) && routeFileSource.includes(`presetDurationTimerConfigs.${expectedKey}`),
    `${config.path} is not wired to its shared configuration.`,
  );
}

for (const config of family) {
  check(configuredRoutes.has(config.path), `${config.path} is not configured.`);
  check(
    xmlPaths.includes(config.path) === !STAGE3_NOINDEX_ROUTE_SET.has(config.path),
    `${config.path} has incorrect XML sitemap indexability.`,
  );
  check(htmlSitemapRoutes.includes(config.path), `${config.path} is missing from the HTML sitemap.`);
  check(
    moreDirectoryRoutes.includes(config.path) === !STAGE3_NOINDEX_ROUTE_SET.has(config.path),
    `${config.path} has incorrect More-directory prominence.`,
  );
  check(footerRoutes.includes(config.path), `${config.path} is missing from the footer.`);

  for (const link of config.relatedLinks) {
    check(configuredRoutes.has(link.href), `${config.path} links to a missing route: ${link.href}`);
    check(!redirects.has(link.href), `${config.path} links to a redirect alias: ${link.href}`);
    check(!/[?#]/.test(link.href), `${config.path} has a query or fragment link: ${link.href}`);
    check(link.href === "/" || !link.href.endsWith("/"), `${config.path} has a trailing-slash link: ${link.href}`);
  }
}

const titles = family.map((config) => config.metaTitle);
const descriptions = family.map((config) => config.metaDescription);
check(new Set(titles).size === titles.length, "Preset routes contain duplicate titles.");
check(new Set(descriptions).size === descriptions.length, "Preset routes contain duplicate meta descriptions.");
check(
  new Set(titles.map(normalizeTemplate)).size === titles.length,
  "Preset titles collapse to a number-swapped template.",
);
check(
  new Set(descriptions.map(normalizeTemplate)).size === descriptions.length,
  "Preset descriptions collapse to a number-swapped template.",
);

const introStarts = family.map((config) => config.overviewParagraphs[0]);
check(new Set(introStarts).size === introStarts.length, "Preset routes repeat the same visible introduction.");

const sharedSchemaSource = `${sharedPageSource}\n${secondsRouteSource}`;
for (const schemaType of ["HowTo", "Organization", "Review", "AggregateRating", "Offer"]) {
  check(
    !new RegExp(`["']@type["']\\s*:\\s*["']${schemaType}["']`).test(sharedSchemaSource),
    `Preset route source contains forbidden ${schemaType} schema.`,
  );
}
check(
  !/["'](?:aggregateRating|reviewRating|offers)["']\s*:/.test(sharedSchemaSource),
  "Preset route source contains rating, review, or offer properties.",
);
check(
  (sharedPageSource.match(/config\.faqItems\.map/g) ?? []).length === 2,
  "Fixed preset FAQ schema and visible FAQ are not sourced from the same data.",
);
check(
  (secondsRouteSource.match(/secondsTimerContent\.faqItems\.map/g) ?? []).length === 2,
  "Seconds timer FAQ schema and visible FAQ are not sourced from the same data.",
);
check(
  sharedPageSource.includes("name: config.title") && sharedPageSource.includes("url: routeUrl"),
  "Fixed preset application schema is not tied to the route configuration.",
);
check(
  secondsRouteSource.includes("name: secondsTimerContent.title") &&
    secondsRouteSource.includes("url: ROUTE_URL"),
  "Seconds timer application schema is not tied to its content configuration.",
);

check(configuredRoutes.size === htmlSitemapRoutes.length, `Configured and HTML-directory route counts differ (${configuredRoutes.size} vs ${htmlSitemapRoutes.length}).`);
check(Object.keys(PERMANENT_REDIRECTS).length === STAGE3_REDIRECT_SOURCE_SET.size + 17, "Permanent redirect count does not match the retained aliases plus Stage 3 decisions.");
check(xmlPaths.length === configuredRoutes.size - STAGE3_NOINDEX_ROUTE_SET.size, `XML sitemap count does not match indexable canonical routes; found ${xmlPaths.length}.`);
check(footerRoutes.includes("/guides"), "Footer must contain the Guides index.");
check(
  [...guideArticleRoutes].every((route) => !footerRoutes.includes(route)),
  "Guide articles must stay out of the global footer.",
);
check(
  footerRoutes.length === configuredRoutes.size - guideArticleRoutes.size,
  `Footer must contain every canonical route except guide articles; found ${footerRoutes.length}.`,
);
check(Object.keys(RELATED_TOOL_LINKS).length === moreDirectoryRoutes.length, "Contextual-link groups must cover every discoverable indexable tool.");

if (failures.length > 0) {
  console.error("Preset timer audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Preset timer audit passed (${family.length} generic preset routes, ${configuredRoutes.size} routes, ${xmlPaths.length} sitemap URLs, ${footerRoutes.length} footer links).`,
  );
}
