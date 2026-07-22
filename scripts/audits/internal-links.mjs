import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import {
  PRIORITY_CONTEXTUAL_ROUTES,
  RELATED_TOOL_LINKS,
} from "../../app/clients/config/relatedTools.js";
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

async function listSourceFiles(directory) {
  const entries = await readdir(path.join(ROOT, directory), { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(relativePath)));
    } else if (/\.(?:js|ts|tsx)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

function parseConfiguredRoutes(source) {
  const routes = new Set(["/"]);
  for (const match of source.matchAll(/\broute\(\s*["']([^"']+)["']/g)) {
    routes.add(`/${match[1]}`);
  }
  return routes;
}

function parseDirectoryRoutes(source) {
  const start = source.indexOf("const TIMER_DIRECTORY");
  const end = source.indexOf("\n];", start);
  check(start >= 0 && end > start, "Could not parse the root More-directory data.");
  if (start < 0 || end <= start) return [];

  return [...source.slice(start, end).matchAll(/href:\s*["'](\/[^"']*)["']/g)].map(
    (match) => match[1],
  );
}

function parseFooterSections(source) {
  const start = source.indexOf("export const footerSections");
  const end = source.indexOf("const footerLinkClass", start);
  check(start >= 0 && end > start, "Could not parse the footer directory data.");
  if (start < 0 || end <= start) return [];

  const sectionSource = source.slice(start, end);
  const sections = [];
  for (const match of sectionSource.matchAll(
    /title:\s*["']([^"']+)["'][\s\S]*?links:\s*\[([\s\S]*?)\]\s*,?\s*}/g,
  )) {
    sections.push({
      title: match[1],
      links: [...match[2].matchAll(/to:\s*["'](\/[^"']*)["']/g)].map(
        (linkMatch) => linkMatch[1],
      ),
    });
  }

  return sections;
}

const [routeSource, rootSource, footerSource, sitemapRouteSource] =
  await Promise.all([
    read("app/routes.ts"),
    read("app/root.tsx"),
    read("app/clients/components/navigation/Footer.tsx"),
    read("app/routes/sitemap.tsx"),
  ]);

const configuredRoutes = parseConfiguredRoutes(routeSource);
const redirectSources = new Set(Object.keys(PERMANENT_REDIRECTS));
const redirectDestinations = new Set(Object.values(PERMANENT_REDIRECTS));
const guideRoutes = new Set(
  SITEMAP_GROUPS.find((section) => section.title === "Guides")?.routes ?? [],
);
const guideArticleRoutes = new Set(
  [...guideRoutes].filter((route) => route !== "/guides"),
);

for (const [source, destination] of Object.entries(PERMANENT_REDIRECTS)) {
  check(source !== destination, `Redirect source equals destination: ${source}`);
  check(!redirectSources.has(destination), `Redirect chain found: ${source} -> ${destination}`);
  check(configuredRoutes.has(destination), `Redirect destination is not configured: ${destination}`);
}

const relatedIncoming = new Map();
for (const [source, group] of Object.entries(RELATED_TOOL_LINKS)) {
  check(configuredRoutes.has(source), `Related-tool source is not configured: ${source}`);
  check(group.links.length >= 3 && group.links.length <= 5, `${source} has an invalid related-tool count.`);

  const destinations = group.links.map((link) => link.to);
  check(new Set(destinations).size === destinations.length, `${source} has duplicate related-tool destinations.`);

  for (const link of group.links) {
    check(link.to !== source, `${source} links to itself in its related-tool group.`);
    check(!/[?#]/.test(link.to), `${source} has a related-tool query string or fragment: ${link.to}`);
    check(link.to === "/" || !link.to.endsWith("/"), `${source} has a trailing-slash related link: ${link.to}`);
    check(configuredRoutes.has(link.to), `${source} links to a missing related tool: ${link.to}`);
    check(!redirectSources.has(link.to), `${source} links to a redirect alias: ${link.to}`);
    check(!STAGE3_NOINDEX_ROUTE_SET.has(link.to), `${source} prominently links to a noindex utility: ${link.to}`);
    relatedIncoming.set(link.to, (relatedIncoming.get(link.to) ?? 0) + 1);
  }
}

for (const route of PRIORITY_CONTEXTUAL_ROUTES) {
  check(configuredRoutes.has(route), `Priority contextual route is not configured: ${route}`);
  check((relatedIncoming.get(route) ?? 0) > 0, `Priority route has no contextual incoming link: ${route}`);
}

const footerSections = parseFooterSections(footerSource);
const footerRoutes = footerSections.flatMap((section) => section.links);
check(footerSections.length > 1, "Footer no longer exposes the grouped route directory.");
for (const section of footerSections) {
  check(section.links.length > 0, `Footer group has no links: ${section.title}`);
  check(
    new Set(section.links).size === section.links.length,
    `Footer group contains duplicate destinations: ${section.title}`,
  );
  for (const route of section.links) {
    check(configuredRoutes.has(route), `Footer link is not configured: ${route}`);
    check(!redirectSources.has(route), `Footer link uses a redirect alias: ${route}`);
    check(!/[?#]/.test(route), `Footer link contains a query string or fragment: ${route}`);
    check(route === "/" || !route.endsWith("/"), `Footer link has a trailing slash: ${route}`);
  }
}
for (const route of configuredRoutes) {
  if (!guideArticleRoutes.has(route)) {
    check(footerRoutes.includes(route), `Configured route is missing from the footer directory: ${route}`);
  }
}
for (const route of [
  "/about",
  "/author/suhas-sunder",
  "/contact",
  "/how-ilovetimers-is-made",
  "/privacy",
  "/terms",
  "/cookies",
  "/copyright",
  "/sitemap",
]) {
  check(footerRoutes.includes(route), `Required trust link is missing from the footer: ${route}`);
}
check(
  footerSource.includes('to="/author/suhas-sunder"') &&
    footerSource.includes("Built and maintained by"),
  "Footer ownership attribution no longer links to the author page.",
);
check(footerSource.includes("AnalyticsPreferencesButton"), "Footer lost the analytics-preference control.");

const sitemapRoutes = SITEMAP_GROUPS.flatMap((section) => section.routes);
check(new Set(sitemapRoutes).size === sitemapRoutes.length, "HTML sitemap groups contain a duplicate route.");
for (const route of configuredRoutes) {
  const count = sitemapRoutes.filter((item) => item === route).length;
  check(count === 1, `Configured route appears ${count} times in HTML sitemap groups: ${route}`);
}
for (const route of sitemapRoutes) {
  check(configuredRoutes.has(route), `HTML sitemap contains a missing route: ${route}`);
  check(!redirectSources.has(route), `HTML sitemap contains a redirect alias: ${route}`);
}
check(
  sitemapRouteSource.includes("SITEMAP_GROUPS"),
  "HTML sitemap route is not using the task-based sitemap groups.",
);

const siteInformationRoutes = new Set([
  "/",
  "/about",
  "/author/suhas-sunder",
  "/contact",
  "/how-ilovetimers-is-made",
  "/copyright",
  "/privacy",
  "/terms",
  "/cookies",
  "/sitemap",
  ...guideRoutes,
]);
const intendedToolRoutes = new Set(
  [...configuredRoutes].filter(
    (route) =>
      !siteInformationRoutes.has(route) &&
      !STAGE3_NOINDEX_ROUTE_SET.has(route),
  ),
);
const moreDirectoryRoutes = parseDirectoryRoutes(rootSource).filter(
  (route) =>
    !STAGE3_NOINDEX_ROUTE_SET.has(route) &&
    !STAGE3_REDIRECT_SOURCE_SET.has(route),
);
check(
  new Set(moreDirectoryRoutes).size === moreDirectoryRoutes.length,
  "Root More-directory data contains duplicate routes.",
);
for (const route of intendedToolRoutes) {
  check(moreDirectoryRoutes.includes(route), `Tool route is missing from the More directory: ${route}`);
}
for (const route of moreDirectoryRoutes) {
  check(intendedToolRoutes.has(route), `More directory contains a non-tool or missing route: ${route}`);
  check(!redirectSources.has(route), `More directory contains a redirect alias: ${route}`);
}
for (const route of ["/privacy", "/terms", "/cookies"]) {
  check(!moreDirectoryRoutes.includes(route), `${route} is incorrectly treated as a tool result.`);
}

check(!rootSource.includes("<RelatedSites"), "RelatedSites is still rendered from the sitewide root layout.");
check(rootSource.includes("<RelatedTools"), "The route-aware related-tools component is not rendered from the root.");
check(footerSource.includes("footerSections"), "Footer is not using the full grouped directory.");

const appFiles = await listSourceFiles("app");
const excludedLinkOwners = new Set([
  "app/config/redirects.js",
  "app/config/routeArchitecture.js",
  "app/root.tsx",
  "app/routes/sitemap.tsx",
  "app/clients/config/relatedTools.js",
]);
for (const file of appFiles) {
  if (excludedLinkOwners.has(file)) continue;
  const source = await read(file);
  const internalLinks = source.matchAll(/(?:\bto|\bhref)\s*[:=]\s*["'](\/[^"']*)["']/g);

  for (const match of internalLinks) {
    const value = match[1];
    const pathname = value.split(/[?#]/, 1)[0] || "/";
    check(configuredRoutes.has(pathname), `Static internal link points to a missing route in ${file}: ${value}`);
    check(!redirectSources.has(pathname), `Static internal link points to a redirect alias in ${file}: ${value}`);
  }
}

for (const alias of redirectSources) {
  check(!sitemapRoutes.includes(alias), `Redirect alias appears in HTML sitemap groups: ${alias}`);
  check(!moreDirectoryRoutes.includes(alias), `Redirect alias appears in the More directory: ${alias}`);
  check(!footerRoutes.includes(alias), `Redirect alias appears in footer directory: ${alias}`);
  check(!Object.values(RELATED_TOOL_LINKS).some((group) => group.links.some((link) => link.to === alias)), `Redirect alias appears in related-tool data: ${alias}`);
}

check(
  [...redirectDestinations].every((destination) => configuredRoutes.has(destination)),
  "At least one redirect destination is not a configured route.",
);

if (failures.length > 0) {
  console.error("Internal-link audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Internal-link audit passed (${configuredRoutes.size} routes, ${moreDirectoryRoutes.length} More-directory tools, ${Object.keys(RELATED_TOOL_LINKS).length} related-tool groups, ${footerRoutes.length} footer links).`,
  );
}
