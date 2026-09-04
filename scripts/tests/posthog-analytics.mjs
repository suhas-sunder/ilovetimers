import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";
import { spawnStaticPreview } from "./preview-process.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PREVIEW_PORT = Number(process.env.ILT_ANALYTICS_TEST_PORT || 3061);
const BASE = `http://127.0.0.1:${PREVIEW_PORT}`;
const analyticsSource = readFileSync(
  path.join(ROOT, "app/clients/lib/analytics.ts"),
  "utf8",
);
const projectTokenMatches = analyticsSource.match(/phc_[A-Za-z0-9_-]{20,}/g) || [];
assert.equal(
  projectTokenMatches.length,
  1,
  "Analytics source must contain exactly one public PostHog project token.",
);
assert.ok(
  !analyticsSource.includes("VITE_POSTHOG_KEY"),
  "Production analytics still depends on VITE_POSTHOG_KEY.",
);
const PROJECT_TOKEN = projectTokenMatches[0];
const PRIVATE_QUERY_VALUE = "private.user@example.test";
const PRIVATE_FRAGMENT_VALUE = "private-fragment-value";
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const requests = [];
const browserDiagnostics = [];
let failAnalyticsRequests = false;

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const configured = process.env.ILT_PLAYWRIGHT_MODULE;
    const bundled = path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
    );
    const target = configured || bundled;
    if (!existsSync(target)) throw new Error("Playwright is unavailable.");
    return import(pathToFileURL(target).href);
  }
}

function corsHeaders() {
  return {
    "access-control-allow-origin": BASE,
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json",
  };
}

const collector = createServer((request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders());
    response.end();
    return;
  }

  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
    requests.push({
      method: request.method,
      url: request.url || "/",
      headers: request.headers,
      body: Buffer.concat(chunks),
    });

    response.writeHead(failAnalyticsRequests ? 503 : 200, corsHeaders());
    response.end(JSON.stringify(failAnalyticsRequests ? { status: "unavailable" } : { status: "ok" }));
  });
});

await new Promise((resolve, reject) => {
  collector.once("error", reject);
  collector.listen(0, "127.0.0.1", resolve);
});

const collectorAddress = collector.address();
assert.ok(collectorAddress && typeof collectorAddress !== "string");
const collectorHost = `http://127.0.0.1:${collectorAddress.port}`;
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, "npm_execpath is required; run this test through npm.");

const buildEnvironment = {
  ...process.env,
  NODE_ENV: "production",
  VITE_POSTHOG_HOST: collectorHost,
};
delete buildEnvironment.VITE_POSTHOG_KEY;

const build = spawnSync(process.execPath, [npmCli, "run", "build"], {
  cwd: ROOT,
  env: buildEnvironment,
  encoding: "utf8",
  timeout: 240_000,
});

if (build.status !== 0) {
  collector.close();
  process.stderr.write(build.stdout || "");
  process.stderr.write(build.stderr || "");
  throw new Error(`Analytics fixture build failed with exit code ${build.status}.`);
}

const builtAssetDirectory = path.join(ROOT, "build/client/assets");
const builtJavaScript = readdirSync(builtAssetDirectory)
  .filter((file) => file.endsWith(".js"))
  .map((file) => ({
    file,
    contents: readFileSync(path.join(builtAssetDirectory, file), "utf8"),
  }));
const initializationAsset = builtJavaScript.find(({ contents }) =>
  contents.includes(PROJECT_TOKEN),
);
assert.ok(initializationAsset, "The production browser bundle omits the PostHog project token.");
const builtJavaScriptText = builtJavaScript.map(({ contents }) => contents).join("\n");
assert.ok(
  builtJavaScriptText.includes("cookieless_mode"),
  "The PostHog initialization bundle omits cookieless mode.",
);
assert.ok(
  builtJavaScriptText.includes("PostHog analytics initialization failed."),
  "The production bundle omits the application PostHog initialization path.",
);
assert.ok(
  builtJavaScriptText.includes("disable_persistence"),
  "The production bundle omits the PostHog persistence restriction.",
);
assert.doesNotMatch(
  builtJavaScriptText,
  /(?:phx_[A-Za-z0-9_-]{20,}|BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY|AKIA[0-9A-Z]{16}|sk_live_[A-Za-z0-9]{16,})/,
  "The production browser bundle contains a personal API key or likely secret.",
);

function decodeRequestBody(request) {
  if (!request.body.length) return null;

  if (request.body[0] === 0x1f && request.body[1] === 0x8b) {
    return JSON.parse(gunzipSync(request.body).toString("utf8"));
  }

  const text = request.body.toString("utf8");
  if (text.startsWith("data=")) {
    const value = new URLSearchParams(text).get("data") || "";
    const compression = new URL(request.url, collectorHost).searchParams.get("compression");
    return JSON.parse(
      compression === "base64"
        ? Buffer.from(value, "base64").toString("utf8")
        : value,
    );
  }

  return JSON.parse(text);
}

function eventsFromPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.flatMap(eventsFromPayload);
  if (Array.isArray(payload.batch)) return payload.batch.flatMap(eventsFromPayload);
  return typeof payload.event === "string" ? [payload] : [];
}

function capturedEvents() {
  return requests.flatMap((request) => {
    try {
      return eventsFromPayload(decodeRequestBody(request));
    } catch {
      return [];
    }
  });
}

function pageviews() {
  return capturedEvents().filter((event) => event.event === "$pageview");
}

async function waitForPageviewCount(expected) {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    if (pageviews().length >= expected) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(
    pageviews().length,
    expected,
    `Timed out waiting for ${expected} pageviews. Collector requests: ${
      requests.map((request) => `${request.method} ${request.url} (${request.body.length} bytes)`).join(", ") || "none"
    }. Browser diagnostics: ${browserDiagnostics.join(" | ") || "none"}`,
  );
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(BASE);
      if (response.status === 200) return;
    } catch {
      // The production preview may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Production preview did not become ready.");
}

const playwright = await loadPlaywright();
const chromiumPath =
  process.env.ILT_BROWSER_PATH ||
  path.join(
    os.homedir(),
    "AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe",
  );
assert.ok(existsSync(chromiumPath), `Chromium executable not found at ${chromiumPath}.`);

const preview = spawnStaticPreview({ root: ROOT, port: PREVIEW_PORT });
let browser;

try {
  await waitForServer();
  browser = await playwright.chromium.launch({
    headless: true,
    executablePath: chromiumPath,
  });

  const context = await browser.newContext({ userAgent: BROWSER_USER_AGENT });
  await context.addCookies([
    { name: "ilt-analytics-consent", value: "allowed", url: BASE },
    { name: "ilt-posthog-capture-consent", value: "1", url: BASE },
    { name: `ph_${PROJECT_TOKEN}_posthog`, value: "legacy", url: BASE },
  ]);

  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      browserDiagnostics.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    browserDiagnostics.push(`request failed: ${request.url()} (${request.failure()?.errorText || "unknown"})`);
  });
  await page.addInitScript(({ key }) => {
    if (window.top !== window) return;

    Object.defineProperty(window.navigator, "webdriver", {
      configurable: true,
      get: () => false,
    });
    window.localStorage.setItem("ilt-analytics-consent", "allowed");
    window.localStorage.setItem("ilt-posthog-capture-consent", "1");
    window.localStorage.setItem(`ph_${key}_posthog`, "legacy");
    window.localStorage.setItem(`ph_${key}_posthog__flags`, "legacy");
  }, { key: PROJECT_TOKEN });

  await page.goto(
    `${BASE}/?private_email=${encodeURIComponent(PRIVATE_QUERY_VALUE)}#${PRIVATE_FRAGMENT_VALUE}`,
    { waitUntil: "networkidle" },
  );
  const startupDiagnostics = await page.evaluate(async () => {
    const analyticsResources = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => /analytics|module-/i.test(name));
    const posthogResource = analyticsResources.find((name) => /module-/i.test(name));
    const posthogModule = posthogResource ? await import(posthogResource) : null;
    const posthog = posthogModule?.default;

    return {
      posthogGlobal: typeof window.posthog,
      userAgent: navigator.userAgent,
      onLine: navigator.onLine,
      doNotTrack: navigator.doNotTrack,
      analyticsResources,
      posthog: posthog
        ? {
            loaded: posthog.__loaded,
            capturing: posthog.is_capturing(),
            distinctId: posthog.get_distinct_id(),
            apiHost: posthog.config.api_host,
            cookielessMode: posthog.config.cookieless_mode,
            persistence: posthog.config.persistence,
            persistenceDisabled: posthog.persistence?.isDisabled?.(),
            bot: posthog._is_bot?.(),
            optOutUserAgentFilter: posthog.config.opt_out_useragent_filter,
            documentReadyState: document.readyState,
            queuedBeforeDomReady: posthog.__request_queue?.length,
          }
        : null,
    };
  });
  browserDiagnostics.push(`startup: ${JSON.stringify(startupDiagnostics)}`);
  await waitForPageviewCount(1);
  assert.equal(pageviews().length, 1, "Direct load emitted more than one pageview.");

  await page.locator('a[href="/countdown-timer"]').first().click();
  await page.waitForURL(`${BASE}/countdown-timer`);
  await waitForPageviewCount(2);
  assert.equal(pageviews().length, 2, "Client navigation emitted more than one pageview.");

  await page.goBack();
  await page.waitForURL((url) => url.pathname === "/");
  await waitForPageviewCount(3);
  assert.equal(pageviews().length, 3, "Back navigation emitted more than one pageview.");

  await page.goForward();
  await page.waitForURL(`${BASE}/countdown-timer`);
  await waitForPageviewCount(4);
  await page.waitForTimeout(700);
  assert.equal(pageviews().length, 4, "Forward navigation or idle time emitted a duplicate pageview.");

  const expectedPaths = ["/", "/countdown-timer", "/", "/countdown-timer"];
  assert.deepEqual(
    pageviews().map((event) => event.properties?.route_path),
    expectedPaths,
    "Pageview route sequence is incorrect.",
  );
  assert.deepEqual(
    pageviews().map((event) => event.properties?.$pathname),
    expectedPaths,
    "PostHog Web Analytics pathname sequence is incorrect.",
  );
  assert.deepEqual(
    pageviews().map((event) => event.properties?.$current_url),
    expectedPaths.map((pathname) => `${BASE}${pathname}`),
    "PostHog Web Analytics URL sequence is incorrect.",
  );
  assert.ok(
    pageviews().every((event) => event.properties?.$host === new URL(BASE).host),
    "PostHog Web Analytics host is missing or incorrect.",
  );
  const allPayloadText = JSON.stringify(capturedEvents());
  for (const privateValue of [
    PRIVATE_QUERY_VALUE,
    encodeURIComponent(PRIVATE_QUERY_VALUE),
    PRIVATE_FRAGMENT_VALUE,
    `?private_email=`,
    `#${PRIVATE_FRAGMENT_VALUE}`,
  ]) {
    assert.ok(!allPayloadText.includes(privateValue), `Analytics payload leaked ${privateValue}.`);
  }

  for (const event of capturedEvents()) {
    assert.ok(!["$autocapture", "$snapshot", "$survey_sent", "$feature_flag_called"].includes(event.event));
  }
  for (const event of pageviews()) {
    assert.equal(event.properties?.$cookieless_mode, true, "Pageview is not marked cookieless.");
    assert.equal(event.properties?.$process_person_profile, false, "Person-profile processing is enabled.");
    assert.ok(event.properties?.$current_url, "Pageview payload omits $current_url.");
    assert.ok(event.properties?.$pathname, "Pageview payload omits $pathname.");
    assert.ok(event.properties?.$host, "Pageview payload omits $host.");
    for (const key of ["$current_url", "$initial_current_url", "$session_entry_url"]) {
      const value = event.properties?.[key];
      if (typeof value !== "string") continue;
      const parsed = new URL(value);
      assert.equal(parsed.search, "", `${key} contains a query string.`);
      assert.equal(parsed.hash, "", `${key} contains a fragment.`);
    }
  }
  assert.ok(
    requests.every((request) => !/flags|decide|survey|session_recording/i.test(request.url)),
    "PostHog requested a disabled flags, survey, or recording endpoint.",
  );

  const storage = await page.evaluate(async () => ({
    cookies: document.cookie,
    localStorage: Object.keys(window.localStorage),
    sessionStorage: Object.keys(window.sessionStorage),
    indexedDB:
      typeof indexedDB.databases === "function"
        ? (await indexedDB.databases()).map((database) => database.name)
        : [],
    banner: Boolean(document.querySelector("[data-analytics-consent-banner]")),
    bodyText: document.body.innerText,
  }));

  assert.deepEqual(
    storage.localStorage.filter((key) => /analytics|posthog|^ph_/i.test(key)),
    [],
    "PostHog or legacy analytics localStorage entries remain.",
  );
  assert.deepEqual(
    storage.sessionStorage.filter((key) => /analytics|posthog|^ph_/i.test(key)),
    [],
    "PostHog created a sessionStorage entry.",
  );
  assert.deepEqual(storage.indexedDB.filter(Boolean), [], "PostHog created an IndexedDB database.");
  assert.ok(!/analytics|posthog|^ph_/i.test(storage.cookies), "PostHog or legacy analytics cookies remain.");
  assert.equal(storage.banner, false, "PostHog consent banner is still rendered.");
  assert.ok(!storage.bodyText.includes("Allow analytics"), "PostHog opt-in text is still visible.");
  assert.deepEqual(pageErrors, [], "The normal analytics run raised a page error.");

  await context.close();

  requests.length = 0;
  failAnalyticsRequests = true;
  const failureContext = await browser.newContext({ userAgent: BROWSER_USER_AGENT });
  await failureContext.addInitScript(() => {
    Object.defineProperty(window.navigator, "webdriver", {
      configurable: true,
      get: () => false,
    });
  });
  const failurePage = await failureContext.newPage();
  const failurePageErrors = [];
  failurePage.on("pageerror", (error) => failurePageErrors.push(error.message));
  await failurePage.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await failurePage.locator("h1").waitFor();
  await failurePage.locator('a[href="/countdown-timer"]').first().click();
  await failurePage.waitForURL(`${BASE}/countdown-timer`);
  await failurePage.waitForTimeout(300);
  assert.ok(requests.length > 0, "Analytics failure fixture did not receive a request.");
  assert.deepEqual(failurePageErrors, [], "Analytics endpoint failure raised an application page error.");
  await failureContext.close();

  console.log("Cookieless PostHog browser test passed.");
  console.log("- bundle: public project token and initialization present without VITE_POSTHOG_KEY");
  console.log("- storage: 0 PostHog cookies, localStorage entries, sessionStorage entries, or IndexedDB databases");
  console.log("- pageviews: direct=1, client navigation=1, Back=1, Forward=1, duplicates=0");
  console.log("- privacy: sanitized Web Analytics paths; query, fragment, and test user value absent");
  console.log("- disabled: autocapture, recording, surveys, flags, experiments, and person profiles");
  console.log("- resilience: application navigation remained functional with analytics returning HTTP 503");
} finally {
  await browser?.close();
  preview.kill();
  await new Promise((resolve) => collector.close(resolve));
}
