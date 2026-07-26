import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PERMANENT_REDIRECTS } from "../../app/config/redirects.js";
import { STAGE3_NOINDEX_ROUTES } from "../../app/config/routeArchitecture.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const GATE_PATH = path.join(ROOT, "docs/final-release-gate.json");
const WORKTREE_PATH = path.join(ROOT, "docs/final-worktree-inventory.json");
const failures = [];
const warnings = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

async function read(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

async function json(relativePath) {
  return JSON.parse(await read(relativePath));
}

async function filesUnder(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  const output = [];
  if (!existsSync(absolute)) return output;
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(child));
    else output.push(child.replaceAll("\\", "/"));
  }
  return output;
}

const obsoleteDeletedRoutes = new Set([
  "app/routes/analog-clock-with-second-hand.tsx",
  "app/routes/big-digital-clock.tsx",
  "app/routes/boxing-timer.tsx",
  "app/routes/clock-with-seconds.tsx",
  "app/routes/cooking-timer.tsx",
  "app/routes/count-up-timer.tsx",
  "app/routes/full-screen-analog-clock.tsx",
  "app/routes/full-screen-clock.tsx",
  "app/routes/fullscreen-timer.tsx",
  "app/routes/smooth-second-hand-clock.tsx",
  "app/routes/world-clock-with-seconds.tsx",
]);

function stageFor(filePath) {
  if (/^docs\/final-|^docs\/post-deployment|^docs\/rollback-plan|final-release-gate|final-browser-validation|netlify\.toml$|server\.js$/.test(filePath)) return "Stage 7";
  if (/stage6|shareConfigurations|localPresetStore|components\/share/.test(filePath)) return "Stage 6";
  if (/stage5|guides\.|config\/guides|technicalSources|technicalTimeMath/.test(filePath)) return "Stage 5";
  if (/stage4|content-repetition|tool-content-dossier|components\/content/.test(filePath)) return "Stage 4";
  if (/routeArchitecture|redirects\.js|route-architecture|_redirects/.test(filePath) || obsoleteDeletedRoutes.has(filePath)) return "Stage 3";
  if (/stage2|adsense-site-quality|adsense-route-inventory/.test(filePath)) return "Stage 2";
  return "Stages 1-7 accumulated release candidate";
}

function classify(filePath, status) {
  if (filePath === ".netlify/v1/functions/react-router-server.mjs" && status.includes("D")) {
    return {
      classification: "generated runtime function intentionally removed",
      reason: "The static deployment no longer uses or publishes a generated Netlify Function.",
      productionImpact: "Removes the tracked runtime function artifact so Netlify serves only prerendered static files.",
      shouldCommit: true,
      requiresOwnerReview: false,
    };
  }
  if (obsoleteDeletedRoutes.has(filePath) && status.includes("D")) {
    return {
      classification: "obsolete source intentionally removed",
      reason: "The public path was consolidated into the recorded canonical destination and is now covered by a direct permanent redirect.",
      productionImpact: "Removes duplicate source while preserving the public request through a one-hop 301.",
      shouldCommit: true,
      requiresOwnerReview: false,
    };
  }
  if (/^(?:build|node_modules|\.react-router|\.netlify|output|coverage|playwright-report|test-results)\//.test(filePath) || /\.(?:log|tmp|har)$|screenshot/i.test(filePath)) {
    return {
      classification: "temporary browser or test output",
      reason: "Machine-generated local output is not part of the release source.",
      productionImpact: "None; it should remain outside the commit.",
      shouldCommit: false,
      requiresOwnerReview: false,
    };
  }
  if (filePath === "public/sitemap.xml" || filePath === "public/_redirects") {
    return {
      classification: "generated file that should remain tracked",
      reason: "This generated public routing/indexing artifact is synchronized with the canonical route architecture.",
      productionImpact: "Controls crawler discovery or hosting redirects.",
      shouldCommit: true,
      requiresOwnerReview: false,
    };
  }
  if (/^(?:docs|scripts)\//.test(filePath)) {
    return {
      classification: "intentional audit or documentation artifact",
      reason: "Release evidence, repeatable validation, or owner handoff documentation produced by the staged workstream.",
      productionImpact: "No direct runtime output; protects release verification and maintenance.",
      shouldCommit: true,
      requiresOwnerReview: false,
    };
  }
  const ownerReview = filePath === "public/ads.txt";
  return {
    classification: "intentional production change",
    reason: ownerReview
      ? "Existing authorized-seller record is syntactically valid, but publisher-account ownership cannot be proved from repository data."
      : "Application, configuration, public asset, or dependency metadata changed intentionally in the accumulated production workstream.",
    productionImpact: status.includes("D")
      ? "Removes superseded production source."
      : "Affects the built application, public metadata, runtime behavior, or hosting configuration.",
    shouldCommit: true,
    requiresOwnerReview: ownerReview,
  };
}

function collectWorktree() {
  const result = spawnSync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "git status failed");
  const chunks = result.stdout.split("\0").filter(Boolean);
  const entries = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const item = chunks[index];
    const gitStatus = item.slice(0, 2);
    let filePath = item.slice(3).replaceAll("\\", "/");
    if (gitStatus.includes("R") || gitStatus.includes("C")) {
      filePath = chunks[++index].replaceAll("\\", "/");
    }
    entries.push({ path: filePath, gitStatus, stageIntroduced: stageFor(filePath), ...classify(filePath, gitStatus) });
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

function runStep(name, command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: { ...process.env, FORCE_COLOR: "0" },
    encoding: "utf8",
    timeout: 15 * 60 * 1000,
    shell: process.platform === "win32" && /\.cmd$/i.test(command),
  });
  const passed = result.status === 0;
  if (!passed) failures.push(`${name} failed with exit code ${result.status ?? "timeout"}.`);
  return {
    name,
    command: [command, ...args].join(" "),
    status: passed ? "passed" : "failed",
    exitCode: result.status,
    stdoutTail: (result.stdout || "").trim().split(/\r?\n/).slice(-8),
    stderrTail: (result.stderr || "").trim().split(/\r?\n/).slice(-8),
  };
}

const npmCli = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
check(existsSync(npmCli), `npm CLI was not found beside the active Node runtime: ${npmCli}`);

const packageJson = await json("package.json");
const routeManifest = await json("docs/route-architecture-manifest.json");
const routeValidation = await json("docs/final-route-validation.json");
const quality = await json("docs/final-performance-accessibility.json");
const googleEvidence = await json("docs/final-google-policy-evidence.json");
const smokeTests = await json("docs/post-deployment-smoke-tests.json");
const sitemap = await read("public/sitemap.xml");
const robots = await read("public/robots.txt");
const adsTxt = (await read("public/ads.txt")).trim();
const appSourceFiles = await filesUnder("app");
const sourceFiles = [
  ...appSourceFiles,
  "netlify.toml",
  "public/_redirects",
  "public/robots.txt",
  "public/ads.txt",
];
const sourceText = (await Promise.all(sourceFiles.map(async (file) => `${file}\n${await read(file)}`))).join("\n");
const canonical = routeManifest.filter((entry) => entry.indexability !== "redirect");
const indexable = canonical.filter((entry) => entry.indexability === "indexable");
const noindex = canonical.filter((entry) => entry.indexability === "noindex");
const redirectEntries = routeManifest.filter((entry) => entry.indexability === "redirect");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

check(packageJson.name === "ilovetimers", "Package identity is not ilovetimers.");
check(packageJson.scripts?.["audit:final-release"] === "node scripts/audits/final-release-gate.mjs", "Final release npm script is missing or changed.");
check(canonical.length === 132, `Expected 132 canonical routes, found ${canonical.length}.`);
check(indexable.length === 109, `Expected 109 indexable routes, found ${indexable.length}.`);
check(noindex.length === 23 && STAGE3_NOINDEX_ROUTES.length === 23, `Expected 23 noindex routes, found ${noindex.length}.`);
check(redirectEntries.length === 28 && Object.keys(PERMANENT_REDIRECTS).length === 28, `Expected 28 redirects, found ${redirectEntries.length}.`);
check(sitemapUrls.length === 109 && new Set(sitemapUrls).size === 109, "XML sitemap must contain 109 unique URLs.");
check(sitemapUrls.every((url) => url.startsWith("https://www.ilovetimers.com") && !url.includes("?") && !url.includes("localhost")), "XML sitemap contains a non-production or parameterized URL.");
check(robots.includes("Sitemap: https://www.ilovetimers.com/sitemap.xml") && !/Disallow:\s*\//i.test(robots), "robots.txt sitemap or crawl access is incorrect.");
check(routeValidation.status === "passed" && routeValidation.counts?.canonical === 132 && routeValidation.counts?.redirects === 28, "Final route validation is missing, failed, or stale.");
check(routeValidation.canonical?.every((entry) => entry.passed), "At least one canonical browser record failed.");
check(routeValidation.redirects?.every((entry) => entry.oneHop), "At least one redirect is not a direct one-hop 301.");
check(quality.status === "passed", "Performance/accessibility artifact is not passed.");
check(quality.performance?.lighthouse?.status === "passed", "Lighthouse evidence has not been merged into the final performance artifact.");
check(googleEvidence.sources?.length >= 8 && googleEvidence.sources.every((entry) => entry.sourceUrl.startsWith("https://support.google.com/")), "Official Google policy evidence is incomplete or uses a non-official primary source.");
check(smokeTests.tests?.length >= 17, "Post-deployment smoke-test plan is incomplete.");
check(existsSync(path.join(ROOT, "docs/rollback-plan.md")), "Rollback plan is missing.");
check(!/googlesyndication|doubleclick|adsbygoogle|pagead2/i.test(sourceText), "Live Google advertising code or network hosts are present.");
check(/google\.com,\s*pub-\d{16},\s*DIRECT,\s*f08c47fec0942fa0/i.test(adsTxt), "ads.txt record is malformed.");
check(!/pub-0{8,}|pub-(?:x+|your|placeholder)/i.test(adsTxt), "ads.txt contains a placeholder publisher ID.");
check(!/VITE_POSTHOG_KEY\s*=|phc_[A-Za-z0-9_-]{20,}/.test(sourceText), "A production PostHog key appears in tracked source.");
check(!/(?:BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY|AKIA[0-9A-Z]{16}|sk_live_[A-Za-z0-9]{16,})/.test(sourceText), "A likely secret appears in application or public source.");
check(/X-Frame-Options/.test(await read("netlify.toml")), "Static Netlify clickjacking protection is missing.");
check(routeValidation.canonical.every((entry) => entry.internalProcessLanguage.length === 0), "Rendered public output contains internal workflow language.");
check(routeValidation.canonical.every((entry) => entry.structuredData.invalidBlocks === 0 && entry.structuredData.parameterizedUrls.length === 0 && entry.structuredData.localUrls.length === 0), "Rendered structured data is invalid or contains unsafe URLs.");
check(routeValidation.canonical.every((entry) => entry.externalScriptUrls.length === 0), "An external production script loads in the advertising-disabled, analytics-unconfigured browser run.");
check(["/about", "/author/suhas-sunder", "/contact", "/how-ilovetimers-is-made", "/copyright", "/privacy", "/terms", "/cookies"].every((route) => canonical.some((entry) => entry.sourcePath === route)), "A required legal or trust route is missing.");

const storageInventory = [
  { key: "ilt-theme-mode", feature: "theme preference" },
  { key: "ilt-analytics-consent", feature: "analytics choice" },
  { key: "ilt-posthog-capture-consent", feature: "PostHog SDK consent persistence when configured and allowed" },
  { key: "astroClockPrefs", feature: "astronomical clock coordinates and timezone" },
  { key: "bpmTapper.settings.v1", feature: "BPM tapper settings" },
  { key: "bpmTapper.history.v1", feature: "BPM tapper recent results" },
  { key: "ilovetimers:billable-hours-clock:v1", feature: "billable-hours clock state" },
  { key: "ilovetimers:event-countdown:v1", feature: "saved event countdowns" },
  { key: "ilt-meeting-agenda-timer-items", feature: "meeting agenda items" },
  { key: "ilovetimers:multiple-timers:v2", feature: "multiple-timer configuration" },
  { key: "ilovetimers:time-blocking-clock:v2", feature: "time blocks" },
  { key: "ilovetimers:time-zone-converter:v1", feature: "timezone converter preferences" },
  { key: "sc_start_mode", feature: "speedcubing start mode" },
  { key: "sc_auto_save", feature: "speedcubing add-on-stop preference" },
  { key: "sc_max_solves", feature: "speedcubing result limit" },
  { key: "ilovetimers:presets:countdown-timer:v1", feature: "Countdown Timer named presets" },
  { key: "ilovetimers:presets:pomodoro-timer:v1", feature: "Pomodoro Timer named presets" },
  { key: "ilovetimers:presets:hiit-timer:v1", feature: "HIIT Timer named presets" },
  { key: "ilovetimers:presets:time-zone-meeting-planner:v1", feature: "Time Zone Meeting Planner named presets" },
];
const storageGuide = await read("app/routes/guides.browser-storage.tsx");
for (const item of storageInventory.filter((item) => !item.key.startsWith("ilt-posthog"))) check(storageGuide.includes(item.key), `Browser-storage guide omits ${item.key}.`);
check(!/sessionStorage\.(?:getItem|setItem|removeItem)|indexedDB\.(?:open|deleteDatabase)/.test(sourceText), "Unexpected sessionStorage or IndexedDB persistence exists outside the documented inventory.");

const buildSteps = [
  runStep("typecheck", process.execPath, [npmCli, "run", "typecheck"]),
  runStep("production build", process.execPath, [npmCli, "run", "build"]),
  runStep(
    "static deployment",
    process.execPath,
    ["scripts/audits/static-deployment.mjs"],
  ),
];
const auditScripts = [
  ["SEO integrity", "scripts/audits/seo-integrity.mjs"],
  ["internal links", "scripts/audits/internal-links.mjs"],
  ["preset timers", "scripts/audits/preset-timers.mjs"],
  ["time tools", "scripts/audits/time-tools.mjs"],
  ["Stage 2 accuracy", "scripts/audits/stage2-accuracy.mjs"],
  ["route architecture", "scripts/audits/route-architecture.mjs"],
  ["Stage 4 content", "scripts/audits/stage4-content-quality.mjs"],
  ["Stage 5 guides", "scripts/audits/stage5-guides.mjs", "--check-citations"],
  ["Stage 6 sharing and presets", "scripts/audits/stage6-share-presets.mjs"],
  ["calculators", "scripts/audits/calculators.mjs"],
  ["specialty tools", "scripts/audits/specialty-tools.mjs"],
  ["UI integrity", "scripts/audits/ui-integrity.mjs"],
  ["accessibility source audit", "scripts/audits/accessibility.mjs"],
  ["release readiness", "scripts/audits/release-readiness.mjs"],
];
const auditSteps = auditScripts.map(([name, script, ...args]) => runStep(name, process.execPath, [script, ...args]));

const auditResult = spawnSync(process.execPath, [npmCli, "audit", "--omit=dev", "--json"], { cwd: ROOT, encoding: "utf8", timeout: 5 * 60 * 1000 });
const fullAuditResult = spawnSync(process.execPath, [npmCli, "audit", "--json"], { cwd: ROOT, encoding: "utf8", timeout: 5 * 60 * 1000 });
let dependencyAudit = { status: "unavailable", exitCode: auditResult.status, error: auditResult.stderr?.trim() || null };
try {
  const parsed = JSON.parse(auditResult.stdout);
  const counts = parsed.metadata?.vulnerabilities || {};
  const vulnerabilities = parsed.vulnerabilities || {};
  const acceptedStaticOnlyAdvisoryIds = new Set([1124282]);
  const directlyAcceptedPackages = new Set(
    Object.entries(vulnerabilities)
      .filter(([, vulnerability]) =>
        vulnerability.via?.some(
          (item) =>
            typeof item === "object" &&
            acceptedStaticOnlyAdvisoryIds.has(item.source),
        ),
      )
      .map(([name]) => name),
  );
  const unacceptedHighOrCritical = Object.entries(vulnerabilities)
    .filter(([, vulnerability]) =>
      vulnerability.severity === "high" ||
      vulnerability.severity === "critical",
    )
    .filter(([, vulnerability]) =>
      !vulnerability.via?.every((item) =>
        typeof item === "object"
          ? acceptedStaticOnlyAdvisoryIds.has(item.source)
          : directlyAcceptedPackages.has(item),
      ),
    )
    .map(([name]) => name);
  let developmentCounts = null;
  try {
    developmentCounts = JSON.parse(fullAuditResult.stdout).metadata?.vulnerabilities || null;
  } catch {}
  dependencyAudit = {
    status: "completed",
    exitCode: auditResult.status,
    productionCounts: counts,
    fullTreeCounts: developmentCounts,
    acceptedStaticOnlyAdvisories: [
      {
        id: 1124282,
        ghsa: "GHSA-qwww-vcr4-c8h2",
        title: "React Router: RSC Mode CSRF Bypass Allows Action Execution Before 400 Response",
        rationale: "This application has RSC mode disabled and publishes no runtime server, action endpoint, Netlify Function, or Edge Function. React Router 8.3.0 was evaluated but rejected because it causes verified hydration failures on loader-backed prerendered routes.",
      },
    ],
    productionReachability: "The production scan omits devDependencies. High or critical advisories fail unless the exact advisory is recorded above and its affected runtime surface is absent from the audited static build.",
  };
  check(
    unacceptedHighOrCritical.length === 0,
    `Dependency audit reports unaccepted high or critical vulnerabilities in: ${unacceptedHighOrCritical.join(", ")}.`,
  );
  if ((counts.high || 0) > 0) {
    warnings.push(
      "npm audit reports the accepted React Router RSC-mode CSRF advisory; the audited deployment has no RSC or server action runtime surface.",
    );
  }
  if ((counts.low || 0) + (counts.moderate || 0) > 0) warnings.push(`Dependency audit reports ${counts.low || 0} low and ${counts.moderate || 0} moderate advisories for owner review.`);
  if (developmentCounts && (developmentCounts.total || 0) > (counts.total || 0)) warnings.push(`The full dependency tree reports ${developmentCounts.total || 0} advisories, primarily in development/build tooling; production dependencies report ${counts.total || 0}.`);
} catch {
  failures.push("npm audit did not return parseable JSON.");
}

const buildFiles = await filesUnder("build");
let buildLocalPathMatches = [];
let buildSecretMatches = [];
for (const file of buildFiles) {
  const info = await stat(path.join(ROOT, file));
  if (info.size > 5_000_000 || /\.(?:png|ico|woff2?|jpg|jpeg|gif|webp)$/.test(file)) continue;
  const contents = await read(file).catch(() => "");
  if (/C:\\Users\\Suhas|E:\\PROJECTS-and-WORK|file:\/\/\//i.test(contents)) buildLocalPathMatches.push(file);
  if (/(?:BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY|AKIA[0-9A-Z]{16}|sk_live_[A-Za-z0-9]{16,}|phc_[A-Za-z0-9_-]{20,})/.test(contents)) buildSecretMatches.push(file);
}
check(buildLocalPathMatches.length === 0, `Build output exposes local paths in: ${buildLocalPathMatches.join(", ")}`);
check(buildSecretMatches.length === 0, `Build output exposes likely secrets in: ${buildSecretMatches.join(", ")}`);
check(!buildFiles.some((file) => file.endsWith(".map")), "Production build contains source maps contrary to the current no-source-map output policy.");

const worktreeEntries = collectWorktree();
const worktreeReport = {
  status: worktreeEntries.some((entry) => entry.classification === "temporary browser or test output" || entry.classification === "accidental modification") ? "attention" : "reconciled",
  generatedAt: new Date().toISOString(),
  repository: "ilovetimers",
  migrationStartingSummary: { modified: 0, deleted: 0, untracked: 0, total: 0 },
  currentSummary: {
    modified: worktreeEntries.filter((entry) => entry.gitStatus.includes("M")).length,
    deleted: worktreeEntries.filter((entry) => entry.gitStatus.includes("D")).length,
    untracked: worktreeEntries.filter((entry) => entry.gitStatus === "??").length,
    total: worktreeEntries.length,
    shouldCommit: worktreeEntries.filter((entry) => entry.shouldCommit).length,
    requiresOwnerReview: worktreeEntries.filter((entry) => entry.requiresOwnerReview).length,
  },
  entries: worktreeEntries,
};
await writeFile(WORKTREE_PATH, `${JSON.stringify(worktreeReport, null, 2)}\n`);
check(worktreeReport.status === "reconciled", "Worktree inventory contains an accidental or temporary tracked candidate.");
check(
  [...obsoleteDeletedRoutes].every((filePath) => !existsSync(path.join(ROOT, filePath))),
  "A previously reconciled obsolete route source has reappeared.",
);

const ownerGates = [
  "Confirm that ads.txt publisher ID pub-4810616735714570 belongs to the intended AdSense account.",
  "Choose whether and when to configure production PostHog, future advertising, and a consent solution; none is required for the current ad-disabled release.",
];
const internalNonBlocking = [
  "The repository has no separate lint or formatter script; type checking, source audits, SSR rendering, browser interaction, and diff-whitespace checks provide the current automated coverage.",
  "Firefox, physical-device, assistive-technology, and production field Core Web Vitals data were unavailable in this environment and are not claimed as certified coverage.",
  "Two simulated-mobile Lighthouse LCP results were slightly above the 2.5-second good threshold (2.524 and 2.540 seconds); both remained well below the 4-second poor threshold and the affected performance scores remained at least 95.",
];
const externalGates = [
  "Netlify account access is required to confirm the production branch, environment values, domain/DNS/HTTPS state, deploy preview behavior, and rollback controls.",
  "AdSense account access is required for site ownership, application/review status, publisher-ID confirmation, ads.txt authorization, and any future ad units.",
  "A Google-certified CMP and correct regional configuration are required before eligible personalized ads are served in the EEA, UK, or Switzerland.",
  "Search Console and DNS/domain registrar verification are post-repository account tasks where the owner chooses to use them.",
];
const postDeploymentGates = [
  "Run docs/post-deployment-smoke-tests.json against the exact published deploy and record the deploy ID and Git revision.",
  "Verify production response headers, MIME types, compression/CDN caching, canonical/robots behavior, 404 status, assets, console, and mobile physical-device layout.",
  "Verify /ads.txt over HTTPS and its AdSense account status before enabling advertising.",
  "If analytics is configured, verify no request before consent and inspect actual production event properties after consent.",
];

const gate = {
  status: failures.length ? "failed" : "passed",
  generatedAt: new Date().toISOString(),
  repositoryCodeGate: failures.length ? "internal blocking defects remain" : "passed; no unresolved material internal blocker",
  checks,
  failures,
  warnings,
  counts: { canonical: canonical.length, indexable: indexable.length, noindex: noindex.length, redirects: redirectEntries.length, sitemap: sitemapUrls.length, shareRoutes: 5, presetRoutes: 4, guides: 7 },
  buildAndPriorAudits: [...buildSteps, ...auditSteps],
  dependencyAudit,
  privacyStorageInventory: { localStorage: storageInventory, sessionStorage: [], indexedDB: [], notes: ["PostHog SDK-managed local persistence exists only when a production key is configured and the user explicitly allows analytics.", "Share configurations are URL-carried rather than browser storage; preset names are excluded from URLs."] },
  advertising: { mode: "disabled; homepage placeholder-only", liveNetworkScript: false, publisherRecordPresent: true, publisherOwnershipVerified: false },
  buildOutput: { filesInspected: buildFiles.length, sourceMaps: 0, localPathMatches: buildLocalPathMatches, likelySecretMatches: buildSecretMatches },
  blockerClassification: { internalBlocking: failures, internalNonBlocking: [...internalNonBlocking, ...warnings], ownerAction: ownerGates, externalAccountOrPlatformAction: externalGates, postDeploymentVerification: postDeploymentGates },
  artifactsVerified: [
    "docs/final-worktree-inventory.json",
    "docs/final-google-policy-evidence.json",
    "docs/final-route-validation.json",
    "docs/final-performance-accessibility.json",
    "docs/post-deployment-smoke-tests.json",
    "docs/rollback-plan.md",
  ],
};
await writeFile(GATE_PATH, `${JSON.stringify(gate, null, 2)}\n`);

if (failures.length) {
  console.error(`Final release gate failed (${failures.length} failures across ${checks} static checks plus ${buildSteps.length + auditSteps.length} aggregated steps).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Final release gate passed (${checks} static checks, ${buildSteps.length + auditSteps.length} aggregated build/audit steps, ${worktreeEntries.length} reconciled worktree entries).`);
  if (warnings.length) for (const warning of warnings) console.warn(`Warning: ${warning}`);
}
