import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAdSensePageStatus } from "../../app/clients/lib/adSenseStatus.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const adSource = await readFile(
  path.join(root, "app/clients/components/ads/AdSense.tsx"),
  "utf8",
);
const cssSource = await readFile(path.join(root, "app/app.css"), "utf8");
const foundationSource = await readFile(
  path.join(root, "app/clients/components/ui/foundation.tsx"),
  "utf8",
);
const guideSource = await readFile(
  path.join(root, "app/clients/components/guides/GuidePage.tsx"),
  "utf8",
);

assert.equal(resolveAdSensePageStatus([]), "pending");
assert.equal(resolveAdSensePageStatus([null, "unfilled"]), "pending");
assert.equal(
  resolveAdSensePageStatus(["unfilled", "unfilled"]),
  "empty",
);
assert.equal(
  resolveAdSensePageStatus(["unfilled", "filled"]),
  "filled",
);
assert.equal(
  resolveAdSensePageStatus(["unfilled", "unfill-optimized"]),
  "empty",
);
assert.equal(
  resolveAdSensePageStatus(["filled", "unfill-optimized"]),
  "filled",
);

for (const slot of [
  "9536165504",
  "9216706505",
  "8773853377",
  "3573392380",
  "7903624833",
  "5957836976",
]) {
  assert.ok(adSource.includes(slot), `missing AdSense slot ${slot}`);
}

assert.ok(adSource.includes("MutationObserver"));
assert.ok(adSource.includes("function ensureAdSenseLoader()"));
assert.ok(!adSource.includes("getAdSenseLoaderScript"));
assert.ok(!adSource.includes("data-ilt-adsense-loader"));
assert.ok(adSource.includes("hidden={!showFallback}"));
assert.ok(adSource.includes("!import.meta.env.PROD"));
assert.ok(
  cssSource.includes(
    '[data-adsense-page-status="filled"] [data-ad-placeholder]',
  ),
);
assert.ok(
  cssSource.includes(
    '.ilt-ad-unit[data-ad-fallback-visible="true"] > ins.adsbygoogle',
  ),
);
assert.match(adSource, /width: 320px; height: 50px/);
assert.match(adSource, /width: 468px; height: 60px/);
assert.match(adSource, /width: 728px; height: 90px/);
assert.match(adSource, /width: 970px; height: 90px/);
assert.match(adSource, /width: 300px; height: 250px/);
assert.match(adSource, /width: 160px; height: 600px/);
assert.match(adSource, /width: 300px; height: 600px/);
assert.ok(adSource.includes('filledOnceRef.current ? "filled" : nextStatus'));
assert.ok(!adSource.includes("data-ad-format="));
assert.ok(!adSource.includes("data-full-width-responsive="));
assert.ok(foundationSource.includes("contentBeforeAd"));
assert.ok(foundationSource.includes("contentAfterAd"));
assert.ok(!foundationSource.includes("lg:grid-cols-[minmax(0,1fr)_300px]"));
assert.ok(guideSource.includes("guideSections.slice(0, adIndex)"));
assert.ok(guideSource.includes("guideSections.slice(adIndex)"));

console.log("AdSense integration tests passed.");
