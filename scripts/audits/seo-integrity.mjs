import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import {
  STAGE3_NOINDEX_ROUTES,
} from "../../app/config/routeArchitecture.js";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

async function listSourceFiles(directory) {
  const entries = await readdir(path.join(ROOT, directory), {
    withFileTypes: true,
  });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(relativePath)));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

const [
  routeConfigSource,
  redirectSource,
  netlifyRedirectSource,
  xmlSitemapSource,
  htmlSitemapSource,
  rootSource,
  footerSource,
  siteIdentitySource,
  authorSource,
] = await Promise.all([
  read("app/routes.ts"),
  read("app/config/redirects.js"),
  read("public/_redirects"),
  read("public/sitemap.xml"),
  read("app/routes/sitemap.tsx"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
  read("app/clients/lib/siteIdentity.ts"),
  read("app/routes/author.suhas-sunder.tsx"),
]);

const configuredRoutes = new Set(["/"]);
for (const match of routeConfigSource.matchAll(/\broute\(\s*["']([^"']+)["']/g)) {
  configuredRoutes.add(`/${match[1]}`);
}

const redirects = new Map(Object.entries(PERMANENT_REDIRECTS));
check(redirects.size > 0, "The permanent redirect map is empty.");

const currentToolClusterRedirects = new Map([
  ["/stopwatch-timer", "/timer-stopwatch"],
  ["/timer-and-stopwatch", "/timer-stopwatch"],
  ["/online-timer-stopwatch", "/timer-stopwatch"],
  ["/stopwatch-countdown", "/timer-stopwatch"],
  ["/countdown-stopwatch", "/timer-stopwatch"],
  ["/focus-stopwatch", "/study-stopwatch"],
  ["/stopwatch-for-study", "/study-stopwatch"],
  ["/study-timer-stopwatch", "/study-stopwatch"],
  ["/clock-timer", "/timer-clock"],
  ["/online-clock-timer", "/timer-clock"],
]);
for (const [source, destination] of currentToolClusterRedirects) {
  check(
    redirects.get(source) === destination,
    `Tool-cluster redirect is missing or incorrect: ${source} -> ${destination}`,
  );
}

const xmlUrls = [...xmlSitemapSource.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => decodeXml(match[1].trim()),
);
const xmlPaths = new Set(
  xmlUrls.map((url) => {
    try {
      return new URL(url).pathname;
    } catch {
      return "INVALID_URL";
    }
  }),
);

check(
  new Set(xmlUrls).size === xmlUrls.length,
  "XML sitemap contains duplicate URLs.",
);

for (const url of xmlUrls) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    check(false, `XML sitemap contains an invalid URL: ${url}`);
    continue;
  }
  check(
    parsed.protocol === "https:" && parsed.host === "www.ilovetimers.com",
    `XML sitemap URL is not on the canonical HTTPS host: ${url}`,
  );
  check(
    !parsed.search && !parsed.hash,
    `XML sitemap URL contains a query string or fragment: ${url}`,
  );
}

for (const route of STAGE3_NOINDEX_ROUTES) {
  check(configuredRoutes.has(route), `Noindex route is not configured: ${route}`);
  check(!xmlPaths.has(route), `Noindex route appears in XML sitemap: ${route}`);
}
check(
  xmlPaths.size === configuredRoutes.size - STAGE3_NOINDEX_ROUTES.length,
  `XML sitemap count does not match indexable canonical routes (${xmlPaths.size}).`,
);

const trustRoutes = [
  "/author/suhas-sunder",
  "/contact",
  "/how-ilovetimers-is-made",
  "/copyright",
];
for (const route of trustRoutes) {
  check(configuredRoutes.has(route), `Trust route is not configured: ${route}`);
  check(xmlPaths.has(route), `Trust route is missing from XML sitemap: ${route}`);
}

for (const [source, destination] of redirects) {
  check(source !== destination, `Redirect source equals its destination: ${source}`);
  check(!redirects.has(destination), `Redirect chain detected: ${source} -> ${destination}`);
  check(
    configuredRoutes.has(destination),
    `Redirect destination is not a configured route: ${destination}`,
  );
  check(!configuredRoutes.has(source), `Redirect source is also a live route: ${source}`);
  check(!xmlPaths.has(source), `Redirect source appears in XML sitemap: ${source}`);
  check(
    !SITEMAP_GROUPS.some(({ routes }) => routes.includes(source)),
    `Redirect source appears in the rendered HTML sitemap groups: ${source}`,
  );
}

const netlifyRules = netlifyRedirectSource
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#") && !line.startsWith("/*"))
  .map((line) => line.split(/\s+/))
  .filter((parts) => parts.length >= 3);
const netlifyRuleMap = new Map(
  netlifyRules.map(([source, destination, status]) => [
    source,
    { destination, status },
  ]),
);

for (const [source, destination] of redirects) {
  for (const netlifySource of [source, `${source}/`]) {
    const rule = netlifyRuleMap.get(netlifySource);
    check(Boolean(rule), `Netlify redirect is missing: ${netlifySource}`);
    if (rule) {
      check(
        rule.destination === destination && rule.status === "301",
        `Netlify redirect differs from the app redirect map: ${netlifySource}`,
      );
    }
  }
}

const appFiles = await listSourceFiles("app");
const appSources = new Map(
  await Promise.all(appFiles.map(async (file) => [file, await read(file)])),
);
const schemaSource = [...appSources.values()].join("\n");

const newToolRoutes = [
  {
    route: "/timer-stopwatch",
    file: "app/routes/timer-stopwatch.tsx",
    h1: "Timer and Stopwatch",
  },
  {
    route: "/study-stopwatch",
    file: "app/routes/study-stopwatch.tsx",
    h1: "Study Stopwatch",
  },
  {
    route: "/timer-clock",
    file: "app/routes/timer-clock.tsx",
    h1: "Clock and Timer",
  },
];

for (const { route, file, h1 } of newToolRoutes) {
  const source = appSources.get(file) ?? "";
  check(configuredRoutes.has(route), `New tool route is not configured: ${route}`);
  check(xmlPaths.has(route), `New tool route is missing from XML sitemap: ${route}`);
  check(
    source.includes(`title=\"${h1}\"`),
    `New tool route does not expose the expected ToolHero H1: ${route}`,
  );
  check(
    (source.match(/rel:\s*["']canonical["']/g) ?? []).length === 1,
    `New tool route must declare one canonical in source: ${route}`,
  );
  check(
    (source.match(/["']@type["']\s*:\s*["']FAQPage["']/g) ?? []).length === 1 &&
      (source.match(/FAQ_ITEMS\.map/g) ?? []).length >= 2,
    `FAQ schema and visible FAQ data are not paired on ${route}`,
  );
  check(
    /dateModified:\s*(?:REVIEW_DATE\.iso|`\$\{REVIEW_DATE\.iso\}T00:00:00Z`)/.test(source) &&
      source.includes('<ToolTrustNote reviewDate={REVIEW_DATE}>') &&
      source.includes('iso: "2026-07-15"') &&
      source.includes('label: "July 15, 2026"'),
    `Manual review date is not visibly paired with schema on ${route}`,
  );
}

check(
  !/["']@type["']\s*:\s*["']HowTo["']/.test(schemaSource),
  "HowTo structured data remains in app source.",
);
check(
  !/["']@type["']\s*:\s*["']WebApplication["']/.test(schemaSource),
  "Legacy WebApplication structured data remains in app source.",
);
check(
  !/["'](?:aggregateRating|reviewRating)["']\s*:/.test(schemaSource) &&
    !/["']@type["']\s*:\s*["'](?:Review|AggregateRating)["']/.test(schemaSource),
  "Rating or review structured data appears in app source.",
);

const websiteTypeCount = [...schemaSource.matchAll(
  /["']@type["']\s*:\s*["']WebSite["']/g,
)].length;
check(websiteTypeCount === 1, `Expected one WebSite emitter; found ${websiteTypeCount}.`);
check(
  /["']@type["']\s*:\s*["']WebSite["']/.test(siteIdentitySource),
  "The shared site identity does not define WebSite.",
);
check(
  rootSource.includes("JSON.stringify(SITE_IDENTITY_JSON_LD)"),
  "Root does not emit the shared WebSite identity.",
);
check(
  !footerSource.includes('type="application/ld+json"') &&
    !/["']@type["']\s*:\s*["'](?:WebSite|Organization)["']/.test(footerSource),
  "Footer still owns sitewide structured data.",
);
check(
  !/["']@type["']\s*:\s*["']Organization["']/.test(schemaSource),
  "An unsupported Organization schema object remains.",
);

const stablePersonId = "https://www.ilovetimers.com/author/suhas-sunder#person";
check(
  siteIdentitySource.includes(stablePersonId),
  "The stable Suhas Sunder Person identifier changed in site identity.",
);
check(
  authorSource.includes("SUHAS_SUNDER_PERSON_ID") &&
    !authorSource.includes("#suhas-sunder"),
  "The author ProfilePage does not use the stable Person identifier.",
);

const redirectOwnershipFiles = new Set([
  "app/root.tsx",
  "app/routes/sitemap.tsx",
  "app/config/redirects.js",
  "app/config/routeArchitecture.js",
  "app/clients/config/relatedTools.js",
]);
const navigationSources = [...appSources.entries()].filter(
  ([file]) => !redirectOwnershipFiles.has(file),
);
for (const source of redirects.keys()) {
  for (const [file, contents] of navigationSources) {
    if (contents.includes(source)) {
      failures.push(`Redirect source appears outside redirect ownership: ${source} in ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error("SEO integrity audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `SEO integrity audit passed (${configuredRoutes.size} routes, ${redirects.size} redirects, ${xmlUrls.length} sitemap URLs).`,
  );
}
