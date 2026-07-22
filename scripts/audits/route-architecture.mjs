import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import {
  STAGE3_INDEXABLE_PRESET_ROUTE_SET,
  STAGE3_NEW_REDIRECTS,
  STAGE3_NOINDEX_ROUTE_SET,
  STAGE3_REDIRECT_SOURCE_SET,
} from "../../app/config/routeArchitecture.js";
import {
  RELATED_TOOL_LINKS,
} from "../../app/clients/config/relatedTools.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE_ORIGIN = "https://www.ilovetimers.com";
const PORT = 3024;
const BASE = `http://127.0.0.1:${PORT}`;
const MANIFEST_PATH = path.join(ROOT, "docs/route-architecture-manifest.json");
const STATUS_E_ROUTES = new Set([
  "/boxing-timer",
  "/analog-clock-with-second-hand",
  "/full-screen-analog-clock",
  "/smooth-second-hand-clock",
  "/full-screen-clock",
  "/big-digital-clock",
  "/clock-with-seconds",
]);
const LEGAL_NOINDEX_ROUTES = new Set(["/privacy", "/terms", "/cookies"]);
const TRUST_ROUTES = new Set(
  SITEMAP_GROUPS.find(({ title }) => title === "Trust and site information")
    ?.routes ?? [],
);
const GUIDE_ROUTES = new Set(
  SITEMAP_GROUPS.find(({ title }) => title === "Guides")?.routes ?? [],
);
const GUIDE_ARTICLE_ROUTES = new Set(
  [...GUIDE_ROUTES].filter((routePath) => routePath !== "/guides"),
);

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

function parseConfiguredRoutes(source) {
  return [
    "/",
    ...[...source.matchAll(/\broute\(\s*["']([^"']+)["']/g)].map(
      (match) => `/${match[1]}`,
    ),
  ];
}

function parseXmlPaths(source) {
  return [...source.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1].trim()).pathname || "/",
  );
}

function parseDirectoryBlock(source, startMarker, endMarker, attribute) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end <= start) return [];
  const pattern = new RegExp(`${attribute}:\\s*["'](\\/[^"']*)["']`, "g");
  return [...source.slice(start, end).matchAll(pattern)].map(
    (match) => match[1],
  );
}

function categoryFor(routePath) {
  const target = PERMANENT_REDIRECTS[routePath] ?? routePath;
  return (
    SITEMAP_GROUPS.find(({ routes }) => routes.includes(target))?.title ??
    "Redirect aliases"
  );
}

function inventoryEvidence(entry) {
  if (!entry) return [];
  const evidence = [entry.functionalitySummary];
  if (entry.availableControls?.length) {
    evidence.push(`Controls: ${entry.availableControls.slice(0, 6).join(", ")}`);
  }
  if (entry.defaultValues?.length) {
    evidence.push(`Defaults: ${entry.defaultValues.slice(0, 5).join(", ")}`);
  }
  if (entry.distinctiveFeatures?.length) {
    evidence.push(`Distinctive features: ${entry.distinctiveFeatures.slice(0, 5).join(", ")}`);
  }
  if (entry.outputProduced) {
    evidence.push(`Output: ${entry.outputProduced.slice(0, 240)}`);
  }
  return evidence.filter(Boolean);
}

const decisionReasons = {
  "/fullscreen-timer": "Its timer, sound, looping, and fullscreen task are satisfied by the stronger Online Timer without loss of state or controls.",
  "/count-up-timer": "Its zero-based elapsed-time workflow is functionally equivalent to the standard stopwatch.",
  "/cooking-timer": "Its general kitchen countdown task and presets overlap the broader Kitchen Timer.",
  "/world-clock-with-seconds": "The World Clock already renders seconds and adds city search, multiple saved rows, and a stronger comparison workflow.",
  "/boxing-timer": "Boxing presets were added to Round Timer, which already uses the same prep, round, rest, sound, and round-count state model.",
  "/analog-clock-with-second-hand": "Second-hand visibility was consolidated into Analog Clock as a setting.",
  "/full-screen-analog-clock": "Analog Clock already supports fullscreen and now carries the consolidated display controls.",
  "/smooth-second-hand-clock": "Smooth versus ticking second-hand motion is now a setting on Analog Clock.",
  "/full-screen-clock": "Digital Clock already supports fullscreen and now carries the consolidated date and minimal-display settings.",
  "/big-digital-clock": "Digital Clock provides the same large responsive display and fullscreen workflow.",
  "/clock-with-seconds": "Seconds visibility is already a setting on Digital Clock, which now also preserves the useful date and minimal-display choices.",
  "/silent-timer": "The quiet no-audio configuration remains useful to direct visitors, but it is a thin configuration of the general countdown workflow.",
  "/focus-session-timer": "This remains a useful focused default, but its state and controls are a single generic countdown rather than an independent focus system.",
  "/study-timer": "This remains a useful study default, but its implemented workflow is a renamed fixed countdown.",
  "/break-timer": "This remains useful for direct break timing, but its implemented workflow is a renamed fixed countdown.",
  "/meeting-timer": "This remains useful for bookmarked meeting timeboxes, but it lacks the agenda, warning, topic, or allocation state of the retained specialist meeting tools.",
  "/workout-timer": "This remains a useful simple work/rest utility, but the retained interval and protocol tools provide the defensible structured workflows.",
  "/rest-timer": "This remains a useful direct recovery countdown, but it is a thin preset rather than an independent training workflow.",
  "/current-local-time": "The route remains a useful direct local-time reference, but its comparison output is too minor to compete independently with the retained digital clock.",
  "/minimalist-clock": "The distraction-free auto-hide mode remains useful, but it is a presentation variant of the local digital clock.",
  "/atomic-clock": "The device-time freeze and precision-style display remain useful, but the route does not use an external atomic source and should not be an independent search landing page.",
  "/debt-clock": "The elapsed projection remains functional and disclosed, but it is a simplified financial estimate whose name can imply live measurement.",
  "/debt-repayment-timer": "The payoff interpolation remains functional and disclosed, but it is a simplified estimate rather than a financial calculator suitable for independent indexing.",
  "/golden-hour-clock": "The disclosed local solar approximation remains useful, but representative broad validation is insufficient for an independent search landing page.",
  "/moon-phase-clock": "The disclosed synodic-cycle approximation remains useful, but representative broad validation is insufficient for independent indexing.",
  "/astronomical-clock": "The combined approximation remains useful as an experimental display, but its broad solar and lunar reference validation is incomplete.",
};

const presetReasons = {
  "/seconds-timer": "A direct whole-seconds input and output workflow serves recurring short-duration tasks without duplicating the fixed-minute preset set.",
  "/tabata-timer": "The established 20/10 protocol and repeated round workflow provide a concise, direct training preset.",
  "/tea-timer": "Tea-specific steeping choices immediately load useful recurring configurations.",
  "/egg-timer": "Doneness choices immediately load useful recurring egg-timing configurations.",
  "/pizza-timer": "Bake, reheat, rest, and check presets provide a concise recurring kitchen task.",
  "/new-year-countdown": "The recurring next-January calculation provides a direct seasonal destination.",
  "/christmas-countdown": "The recurring next-December-25 calculation provides a direct seasonal destination.",
  "/birthday-countdown": "Birthday recurrence and age-oriented output provide a direct recurring event task.",
};

function noindexReason(routePath) {
  if (LEGAL_NOINDEX_ROUTES.has(routePath)) {
    return "The policy remains public and self-canonical but is intentionally excluded from search indexing and the XML sitemap.";
  }
  if (/^\/(?:1|5|10|15|30)-minute-timer$/.test(routePath)) {
    return "The route preserves a useful bookmarked duration, but only the default duration differs from the shared preset timer interface.";
  }
  return decisionReasons[routePath];
}

function manifestStatus(routePath, configuredSet) {
  if (!configuredSet.has(routePath)) {
    return STATUS_E_ROUTES.has(routePath) ? "E" : "D";
  }
  if (STAGE3_NOINDEX_ROUTE_SET.has(routePath)) return "C";
  if (STAGE3_INDEXABLE_PRESET_ROUTE_SET.has(routePath)) return "B";
  return "A";
}

function statusReason(routePath, status, entry) {
  if (status === "B") return presetReasons[routePath];
  if (status === "C") return noindexReason(routePath);
  if (status === "D" || status === "E") {
    return (
      decisionReasons[routePath] ??
      "The historical URL is an existing synonym whose final destination satisfies the same task."
    );
  }
  return `Retained because the implemented ${categoryFor(routePath).toLowerCase()} interface provides a distinct user task, calculation, output, representation, or state model. ${entry?.functionalitySummary ?? "The route remains independently useful."}`;
}

async function writeManifest(configuredRoutes) {
  const configuredSet = new Set(configuredRoutes);
  const [inventorySource, repetitionSource] = await Promise.all([
    read("docs/adsense-route-inventory.json"),
    read("docs/content-repetition-report.json"),
  ]);
  const inventory = JSON.parse(inventorySource);
  const inventoryByPath = new Map(
    inventory.map((entry) => [entry.path ?? entry.routePath, entry]),
  );
  const repetition = JSON.parse(repetitionSource);
  const repetitiveRoutes = new Set(
    (repetition.routes ?? [])
      .filter((entry) => entry.status === "substantial")
      .map((entry) => entry.routePath),
  );
  const publicPaths = [...configuredRoutes, ...Object.keys(PERMANENT_REDIRECTS)].sort(
    (a, b) => a.localeCompare(b),
  );
  const manifest = publicPaths.map((sourcePath) => {
    const status = manifestStatus(sourcePath, configuredSet);
    const redirect = status === "D" || status === "E";
    const destination = redirect ? PERMANENT_REDIRECTS[sourcePath] : null;
    const finalPath = destination ?? sourcePath;
    const noindex = status === "C";
    const entry = inventoryByPath.get(sourcePath) ?? inventoryByPath.get(finalPath);
    const previousStatus =
      Object.hasOwn(PERMANENT_REDIRECTS, sourcePath) &&
      !Object.hasOwn(STAGE3_NEW_REDIRECTS, sourcePath)
        ? "permanent redirect alias"
        : LEGAL_NOINDEX_ROUTES.has(sourcePath)
          ? "non-indexable canonical"
          : "indexable canonical";
    const laterRewriteScope = redirect
      ? "no later rewrite"
      : status === "B" || status === "C"
        ? "concise rewrite"
        : repetitiveRoutes.has(sourcePath)
          ? "full rewrite"
          : "no later rewrite";

    return {
      sourcePath,
      previousStatus,
      newStatus: status,
      statusLabel:
        {
          A: "retain independent indexable route",
          B: "retain concise indexable preset",
          C: "retain non-indexable utility",
          D: "permanent redirect",
          E: "functionality consolidated, then permanent redirect",
        }[status],
      destination,
      canonical: `${SITE_ORIGIN}${finalPath === "/" ? "" : finalPath}`,
      canonicalDestination: finalPath,
      indexability: redirect ? "redirect" : noindex ? "noindex" : "indexable",
      sitemapIncluded: !redirect && !noindex,
      sitemapStatus: !redirect && !noindex ? "included" : "excluded",
      robots: redirect ? null : noindex ? "noindex,follow" : "index,follow",
      redirectDestination: destination,
      overlapGroup: categoryFor(sourcePath),
      retainedDistinctiveFunctionality: redirect
        ? status === "E"
          ? `Useful capability retained on ${destination} before redirecting.`
          : "No independent interface or state is retained at the alias."
        : entry?.functionalitySummary ?? "Public site-information route.",
      reason: statusReason(sourcePath, status, entry),
      functionalEvidence: inventoryEvidence(entry),
      implementationEvidence: redirect
        ? [
            `301 mapping in app/config/redirects.js to ${destination}`,
            "source removed from app/routes.ts and public/sitemap.xml",
            "internal navigation points to the final destination",
          ]
        : noindex
          ? [
              "rendered robots metadata is noindex,follow",
              "self-referencing production canonical is preserved",
              "route is absent from public/sitemap.xml",
              ...(sourcePath === "/golden-hour-clock"
                ? [
                    "rendered QA verified corrected dawn/evening crossings and a non-overlapping 390px display",
                  ]
                : []),
            ]
          : [
              "configured canonical route in app/routes.ts",
              "self-referencing production canonical and index,follow metadata",
              "route is present in public/sitemap.xml and contextual discovery",
            ],
      affectedInternalLinks: redirect
        ? [
            "root More directory",
            "global footer",
            "HTML sitemap",
            "related-tool links",
            "route supporting-content links",
          ]
        : ["HTML sitemap", "global footer", "contextual related-tool links"],
      verificationTests: [
        "audit:route-architecture",
        "audit:seo",
        "audit:links",
        redirect ? "301 destination and chain test" : "rendered canonical and robots test",
      ],
      remainingContentWork:
        redirect
          ? "None on the alias; generic duplicate copy was intentionally not migrated."
          : repetitiveRoutes.has(sourcePath)
            ? "Visible repetition remains for the later content-rewrite stage."
            : "No route-architecture content blocker remains.",
      laterRewriteScope,
    };
  });

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

function extractMeta(html, attribute, value) {
  const pattern = new RegExp(
    `<meta[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${value}["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1] ?? match?.[2] ?? "";
}

function extractCanonical(html) {
  const match = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>|<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i,
  );
  return match?.[1] ?? match?.[2] ?? "";
}

function renderedInternalPaths(html) {
  return [...html.matchAll(/\shref=["']([^"']+)["']/g)]
    .map((match) => {
      const value = match[1];
      if (value.startsWith("/")) return value.split(/[?#]/, 1)[0] || "/";
      try {
        const url = new URL(value);
        return url.origin === SITE_ORIGIN ? url.pathname : null;
      } catch {
        return null;
      }
    })
    .filter(
      (pathname) =>
        pathname && !pathname.startsWith("/assets/"),
    );
}

function structuredDataUrls(html) {
  const urls = [];
  for (const match of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const value = JSON.parse(match[1].replaceAll("&quot;", '"'));
      const visit = (node) => {
        if (typeof node === "string" && /^https?:\/\//.test(node)) {
          urls.push(node);
        } else if (Array.isArray(node)) {
          node.forEach(visit);
        } else if (node && typeof node === "object") {
          Object.values(node).forEach(visit);
        }
      };
      visit(value);
    } catch {
      failures.push("A rendered JSON-LD block could not be parsed.");
    }
  }
  return urls;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(BASE, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become ready on ${BASE}`);
}

async function runBatches(items, worker, size = 8) {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(worker));
  }
}

const [routeSource, sitemapSource, rootSource, footerSource] = await Promise.all([
  read("app/routes.ts"),
  read("public/sitemap.xml"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
]);
const configuredRoutes = parseConfiguredRoutes(routeSource);
const configuredSet = new Set(configuredRoutes);
const redirectSources = Object.keys(PERMANENT_REDIRECTS);
const redirectSourceSet = new Set(redirectSources);
const publicPathSet = new Set([...configuredRoutes, ...redirectSources]);
const sitemapPaths = parseXmlPaths(sitemapSource);
const sitemapSet = new Set(sitemapPaths);

if (process.argv.includes("--write")) {
  await writeManifest(configuredRoutes);
  if (process.argv.includes("--write-only")) {
    console.log("Wrote docs/route-architecture-manifest.json.");
    process.exit(0);
  }
}

const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
const manifestByPath = new Map(manifest.map((entry) => [entry.sourcePath, entry]));

check(manifest.length === publicPathSet.size, "Manifest does not cover every public path exactly once.");
check(manifestByPath.size === manifest.length, "Manifest contains duplicate source paths.");
for (const routePath of publicPathSet) {
  check(manifestByPath.has(routePath), `Missing manifest status for ${routePath}.`);
}
for (const entry of manifest) {
  check(publicPathSet.has(entry.sourcePath), `Manifest contains obsolete route ${entry.sourcePath}.`);
  check(/^[A-E]$/.test(entry.newStatus), `Invalid Stage 3 status for ${entry.sourcePath}.`);
  check(entry.newStatus !== "F", `Unresolved human decision remains for ${entry.sourcePath}.`);
}

check(new Set(sitemapPaths).size === sitemapPaths.length, "XML sitemap contains duplicate URLs.");
for (const routePath of redirectSources) {
  check(!sitemapSet.has(routePath), `Redirect source appears in sitemap: ${routePath}.`);
}
for (const routePath of STAGE3_NOINDEX_ROUTE_SET) {
  check(!sitemapSet.has(routePath), `Noindex route appears in sitemap: ${routePath}.`);
}
for (const routePath of configuredRoutes) {
  const shouldAppear = !STAGE3_NOINDEX_ROUTE_SET.has(routePath);
  check(
    sitemapSet.has(routePath) === shouldAppear,
    `${routePath} has incorrect XML sitemap inclusion.`,
  );
}

for (const [source, destination] of Object.entries(PERMANENT_REDIRECTS)) {
  check(source !== destination, `Redirect loop at ${source}.`);
  check(!redirectSourceSet.has(destination), `Redirect chain: ${source} -> ${destination}.`);
  check(configuredSet.has(destination), `Redirect destination is not canonical: ${source} -> ${destination}.`);
}

const directoryRoutes = SITEMAP_GROUPS.flatMap(({ routes }) => routes);
check(new Set(directoryRoutes).size === directoryRoutes.length, "HTML sitemap groups contain duplicate routes.");
check(
  configuredRoutes.every((routePath) => directoryRoutes.includes(routePath)),
  "A configured canonical route is missing from the HTML sitemap groups.",
);
check(
  directoryRoutes.every((routePath) => configuredSet.has(routePath)),
  "HTML sitemap groups contain an unconfigured or redirected route.",
);

const rawMoreRoutes = parseDirectoryBlock(
  rootSource,
  "const TIMER_DIRECTORY",
  "\n];",
  "href",
);
const renderedMoreRoutes = rawMoreRoutes.filter(
  (routePath) =>
    !STAGE3_NOINDEX_ROUTE_SET.has(routePath) &&
    !STAGE3_REDIRECT_SOURCE_SET.has(routePath),
);
check(
  renderedMoreRoutes.every(
    (routePath) => configuredSet.has(routePath) && !STAGE3_NOINDEX_ROUTE_SET.has(routePath),
  ),
  "The More directory promotes a redirected, noindex, or invalid route.",
);
const footerRoutes = parseDirectoryBlock(
  footerSource,
  "export const footerSections",
  "const footerLinkClass",
  "to",
);
check(new Set(footerRoutes).size === footerRoutes.length, "Footer contains duplicate destinations.");
check(
  configuredRoutes.every(
    (routePath) =>
      GUIDE_ARTICLE_ROUTES.has(routePath) || footerRoutes.includes(routePath),
  ),
  "The required footer directory is missing a canonical route.",
);
check(
  footerRoutes.every((routePath) => configuredSet.has(routePath)),
  "Footer contains a redirect alias or invalid route.",
);

const indexableTools = configuredRoutes.filter(
  (routePath) =>
    routePath !== "/" &&
    !TRUST_ROUTES.has(routePath) &&
    !GUIDE_ROUTES.has(routePath) &&
    !STAGE3_NOINDEX_ROUTE_SET.has(routePath),
);
for (const routePath of indexableTools) {
  const related = RELATED_TOOL_LINKS[routePath];
  check(Boolean(related), `Missing related-tool group for ${routePath}.`);
  check(
    related?.links.length >= 3 && related?.links.length <= 5,
    `${routePath} must have three to five related links.`,
  );
  const destinations = related?.links.map(({ to }) => to) ?? [];
  check(new Set(destinations).size === destinations.length, `${routePath} has duplicate related links.`);
  for (const destination of destinations) {
    check(configuredSet.has(destination), `${routePath} links to invalid related route ${destination}.`);
    check(!redirectSourceSet.has(destination), `${routePath} links to redirect alias ${destination}.`);
    check(!STAGE3_NOINDEX_ROUTE_SET.has(destination), `${routePath} prominently links to noindex route ${destination}.`);
  }
}

let server;
try {
  server = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForServer();

  const canonicalOwners = new Map();
  await runBatches(configuredRoutes, async (routePath) => {
    const response = await fetch(`${BASE}${routePath}`, { redirect: "manual" });
    check(response.status === 200, `${routePath} rendered HTTP ${response.status}.`);
    const html = await response.text();
    const canonical = extractCanonical(html);
    const expectedCanonical = `${SITE_ORIGIN}${routePath === "/" ? "" : routePath}`;
    check(canonical === expectedCanonical, `${routePath} lacks its rendered self-canonical (${canonical}).`);
    if (canonical) {
      const url = new URL(canonical);
      check(url.origin === SITE_ORIGIN, `${routePath} canonical uses the wrong origin.`);
      check(!url.search && !url.hash, `${routePath} canonical contains unsupported parameters or fragments.`);
      check(!redirectSourceSet.has(url.pathname), `${routePath} canonical points through a redirect.`);
      const priorOwner = canonicalOwners.get(canonical);
      check(!priorOwner, `${routePath} and ${priorOwner} share a canonical.`);
      canonicalOwners.set(canonical, routePath);
    }

    const robots = extractMeta(html, "name", "robots").toLowerCase();
    const expectedNoindex = STAGE3_NOINDEX_ROUTE_SET.has(routePath);
    check(
      expectedNoindex ? robots.includes("noindex") : !robots.includes("noindex"),
      `${routePath} rendered the wrong robots indexability: ${robots}.`,
    );
    check(robots.includes("follow"), `${routePath} robots metadata must permit follow.`);

    for (const internalPath of renderedInternalPaths(html)) {
      check(!redirectSourceSet.has(internalPath), `${routePath} renders a link to redirect alias ${internalPath}.`);
      check(publicPathSet.has(internalPath), `${routePath} renders a link to invalid route ${internalPath}.`);
    }
    for (const structuredUrl of structuredDataUrls(html)) {
      const url = new URL(structuredUrl);
      if (url.origin === SITE_ORIGIN) {
        check(!redirectSourceSet.has(url.pathname), `${routePath} structured data uses obsolete URL ${url.pathname}.`);
      }
    }
  });

  await runBatches(redirectSources, async (source) => {
    const response = await fetch(`${BASE}${source}?obsolete=1`, { redirect: "manual" });
    check(response.status === 301, `${source} did not return HTTP 301.`);
    const location = response.headers.get("location") ?? "";
    const resolved = new URL(location, BASE);
    check(resolved.pathname === PERMANENT_REDIRECTS[source], `${source} redirects to ${resolved.pathname}, expected ${PERMANENT_REDIRECTS[source]}.`);
    check(!redirectSourceSet.has(resolved.pathname), `${source} begins a redirect chain.`);
    if (Object.hasOwn(STAGE3_NEW_REDIRECTS, source)) {
      check(!resolved.search, `${source} preserved unsupported query parameters.`);
    }
  });
} finally {
  server?.kill("SIGTERM");
}

if (failures.length) {
  console.error(`Route architecture audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  const counts = manifest.reduce((result, entry) => {
    result[entry.newStatus] = (result[entry.newStatus] ?? 0) + 1;
    return result;
  }, {});
  console.log(
    `Route architecture audit passed: ${configuredRoutes.length} canonical pages, ${redirectSources.length} redirects, ${sitemapPaths.length} indexable sitemap routes; A=${counts.A ?? 0}, B=${counts.B ?? 0}, C=${counts.C ?? 0}, D=${counts.D ?? 0}, E=${counts.E ?? 0}.`,
  );
}
