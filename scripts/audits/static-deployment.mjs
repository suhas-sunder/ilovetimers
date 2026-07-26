import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import { readStaticRedirectRules } from "../tests/preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUILD_CLIENT = path.join(ROOT, "build", "client");
const SITE_ORIGIN = "https://www.ilovetimers.com";
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

function configuredRoutes(source) {
  return [
    "/",
    ...[...source.matchAll(/\broute\(\s*["']([^"']+)["']/g)].map(
      (match) => `/${match[1]}`,
    ),
  ];
}

function htmlFileForRoute(routePath) {
  return routePath === "/"
    ? path.join(BUILD_CLIENT, "index.html")
    : path.join(BUILD_CLIENT, routePath.slice(1), "index.html");
}

function canonicalFromHtml(html) {
  return (
    html.match(
      /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i,
    )?.[1] ??
    html.match(
      /<link\b(?=[^>]*\bhref=["']([^"']+)["'])(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
    )?.[1] ??
    null
  );
}

const [
  packageSource,
  routeSource,
  reactRouterConfig,
  viteConfig,
  netlifyConfig,
] = await Promise.all([
  read("package.json"),
  read("app/routes.ts"),
  read("react-router.config.ts"),
  read("vite.config.ts"),
  read("netlify.toml"),
]);

const packageJson = JSON.parse(packageSource);
const routes = configuredRoutes(routeSource);
const routeSet = new Set(routes);

check(existsSync(BUILD_CLIENT), "build/client does not exist; run npm run build first.");
check(!existsSync(path.join(ROOT, "build", "server")), "A runtime build/server directory was generated.");
check(!existsSync(path.join(ROOT, "server.js")), "The custom runtime server entry point still exists.");
const runtimeServerPath = path.join(ROOT, "server");
const runtimeServerEntries = existsSync(runtimeServerPath)
  ? await readdir(runtimeServerPath, { recursive: true })
  : [];
check(runtimeServerEntries.length === 0, "The custom runtime server directory still contains files.");
const netlifyFunctionsPath = path.join(ROOT, ".netlify", "v1", "functions");
const netlifyFunctionEntries = existsSync(netlifyFunctionsPath)
  ? await readdir(netlifyFunctionsPath, { recursive: true })
  : [];
check(
  netlifyFunctionEntries.length === 0,
  "A Netlify function declaration exists under .netlify/v1/functions.",
);

check(/\bssr:\s*false\b/.test(reactRouterConfig), "React Router runtime SSR is not disabled.");
check(/\bprerender:\s*true\b/.test(reactRouterConfig), "React Router is not configured to prerender every static route.");
check(!/@netlify\/vite-plugin-react-router|netlifyPlugin/.test(viteConfig), "The Netlify React Router runtime adapter remains configured.");
check(/publish\s*=\s*"build\/client"/.test(netlifyConfig), "Netlify does not publish build/client.");
check(!/\bfunctions\s*=|\bedge_functions\b|\[\[edge_functions\]\]/.test(netlifyConfig), "Netlify runtime functions or edge functions are configured.");
check(/for\s*=\s*"\/assets\/\*"/.test(netlifyConfig) && /immutable/.test(netlifyConfig), "Hashed assets are missing immutable browser caching.");
check(/X-Content-Type-Options/.test(netlifyConfig) && /X-Frame-Options/.test(netlifyConfig), "Static Netlify security headers are incomplete.");

for (const dependency of [
  "@react-router/express",
  "compression",
  "express",
  "morgan",
  "@netlify/vite-plugin-react-router",
]) {
  check(
    !packageJson.dependencies?.[dependency] &&
      !packageJson.devDependencies?.[dependency],
    `${dependency} remains a direct dependency.`,
  );
}
check(
  Boolean(packageJson.dependencies?.["@react-router/node"]) &&
    Boolean(packageJson.dependencies?.isbot),
  "React Router's build-time prerender renderer dependencies are missing.",
);

check(routes.length === routeSet.size, "Configured route paths are not unique.");
check(routes.length === 132, `Expected 132 canonical routes, found ${routes.length}.`);

const titles = new Map();
for (const routePath of routes) {
  const htmlFile = htmlFileForRoute(routePath);
  check(existsSync(htmlFile), `Missing prerendered HTML for ${routePath}.`);
  if (!existsSync(htmlFile)) continue;

  const html = await readFile(htmlFile, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const expectedCanonical = `${SITE_ORIGIN}${routePath === "/" ? "" : routePath}`;
  const canonical = canonicalFromHtml(html);

  check(title.length > 0, `${routePath} has no prerendered title.`);
  check(/<meta\b[^>]*\bname=["']description["']/i.test(html), `${routePath} has no prerendered meta description.`);
  check(canonical === expectedCanonical, `${routePath} prerendered canonical is ${canonical ?? "missing"}.`);
  check(/<h1\b/i.test(html), `${routePath} has no prerendered H1.`);

  const owners = titles.get(title) ?? [];
  owners.push(routePath);
  titles.set(title, owners);
}

check(
  existsSync(path.join(BUILD_CLIENT, "__spa-fallback.html")),
  "React Router did not emit the static not-found fallback.",
);
check(existsSync(path.join(BUILD_CLIENT, "_redirects")), "The deploy output is missing _redirects.");
check(existsSync(path.join(BUILD_CLIENT, "robots.txt")), "The deploy output is missing robots.txt.");
check(existsSync(path.join(BUILD_CLIENT, "sitemap.xml")), "The deploy output is missing sitemap.xml.");

const { rules, permanent } = await readStaticRedirectRules(ROOT);
for (const [source, destination] of Object.entries(PERMANENT_REDIRECTS)) {
  check(permanent.get(source) === destination, `${source} is missing its static 301 mapping.`);
  check(permanent.get(`${source}/`) === destination, `${source}/ is missing its static 301 mapping.`);
  check(!PERMANENT_REDIRECTS[destination], `${source} creates a redirect chain through ${destination}.`);
  check(routeSet.has(destination), `${source} redirects to non-canonical ${destination}.`);
}

const fallback = rules.find(({ from }) => from === "/*");
check(
  fallback?.to === "/__spa-fallback.html" && fallback?.status === "404",
  "Unknown routes are not mapped to the static React Router fallback with HTTP 404.",
);
check(
  !rules.some(
    ({ from, to, status }) =>
      from === "/*" && to === "/index.html" && status.startsWith("200"),
  ),
  "A generic index.html SPA rewrite remains configured.",
);

const topLevelBuildEntries = await readdir(path.join(ROOT, "build"), {
  withFileTypes: true,
});
check(
  topLevelBuildEntries.every((entry) => entry.name === "client"),
  `Unexpected top-level build output: ${topLevelBuildEntries
    .map((entry) => entry.name)
    .join(", ")}.`,
);

if (failures.length) {
  console.error(`Static deployment audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Static deployment audit passed (${routes.length} prerendered canonical routes, ${Object.keys(PERMANENT_REDIRECTS).length} permanent aliases, no runtime server output).`,
  );
}
