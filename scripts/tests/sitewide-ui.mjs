import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import {
  readStaticRedirectRules,
  spawnStaticPreview,
} from "./preview-process.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const routeSource = await readFile(path.join(ROOT, "app/routes.ts"), "utf8");
const routes = ["/", ...[...routeSource.matchAll(/\broute\(\s*["']([^"']+)["']/g)].map((match) => `/${match[1]}`)];
const informationalRoutes = new Set([
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
  ...routes.filter((route) => route === "/guides" || route.startsWith("/guides/")),
]);
const adFreeRoutes = new Set([
  "/free-online-timers",
  "/about",
  "/author/suhas-sunder",
  "/contact",
  "/how-ilovetimers-is-made",
  "/copyright",
  "/privacy",
  "/terms",
  "/cookies",
  "/sitemap",
]);
const failures = [];
const PORT = 3013;
const base = `http://127.0.0.1:${PORT}`;
const server = spawnStaticPreview({ root: ROOT, port: PORT });

const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"');

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(base, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // The production process may still be loading the server bundle.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Production server did not become ready for sitewide UI checks.");
}

try {
  await waitForServer();

  for (const route of routes) {
    const response = await fetch(`${base}${route}`, { redirect: "manual" });
    const html = await response.text();
    check(response.status === 200, `${route} returned ${response.status}, expected 200.`);
    check((html.match(/<h1\b/g) ?? []).length === 1, `${route} does not render exactly one SSR H1.`);
    const canonicals = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)].map((match) => decode(match[1]));
    const expectedCanonical =
      route === "/"
        ? "https://www.ilovetimers.com"
        : `https://www.ilovetimers.com${route}`;
    check(canonicals.length === 1, `${route} renders ${canonicals.length} SSR canonicals.`);
    check(canonicals[0] === expectedCanonical, `${route} canonical is ${canonicals[0] ?? "missing"}; expected ${expectedCanonical}.`);

    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    check(duplicates.length === 0, `${route} renders duplicate SSR IDs: ${duplicates.join(", ")}.`);
    check(!/unexpected application error|application error|something went wrong/i.test(html), `${route} renders a fatal error state.`);
    const adCount = (html.match(/aria-label="Advertisements"/g) ?? []).length;
    if (adFreeRoutes.has(route)) {
      check(adCount === 0, `${route} must stay ad-free (${adCount} slots).`);
    } else {
      check(adCount === 4, `${route} must render all four non-sidebar ad placements (${adCount}).`);
    }

    if (!informationalRoutes.has(route)) {
      const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
      check(/<(?:button|input|select|textarea|summary)\b/.test(main), `${route} has no SSR-visible core control.`);
    }
  }

  const { permanent } = await readStaticRedirectRules(ROOT);
  for (const [source, destination] of Object.entries(PERMANENT_REDIRECTS)) {
    check(permanent.get(source) === destination, `${source} is missing its static one-hop 301 mapping.`);
    check(permanent.get(`${source}/`) === destination, `${source}/ is missing its static one-hop 301 mapping.`);
    const destinationResponse = await fetch(`${base}${destination}`, { redirect: "manual" });
    check(destinationResponse.status === 200, `Redirect destination ${destination} returned ${destinationResponse.status}.`);
  }

  const unknown = await fetch(`${base}/sitewide-ui-unknown-route`, { redirect: "manual" });
  check(unknown.status === 404, `Unknown route returned ${unknown.status}, expected 404.`);
} finally {
  server.kill();
}

if (failures.length) {
  console.error("Sitewide SSR UI test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Sitewide SSR UI test passed (${routes.length} canonical routes, ${Object.keys(PERMANENT_REDIRECTS).length} redirects, H1/canonical/ID/control/ad/404 checks).`);
}
