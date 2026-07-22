import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

const methodologyFiles = [
  "app/routes/atomic-clock.tsx",
  "app/routes/utc-clock.tsx",
  "app/routes/epoch-unix-time-clock.tsx",
  "app/routes/unix-timestamp-converter.tsx",
  "app/routes/military-time-converter.tsx",
  "app/routes/time-zone-converter.tsx",
  "app/routes/time-zone-meeting-planner.tsx",
  "app/routes/debt-clock.tsx",
  "app/routes/debt-repayment-timer.tsx",
  "app/routes/sunrise-sunset-clock.tsx",
  "app/routes/golden-hour-clock.tsx",
  "app/routes/moon-phase-clock.tsx",
  "app/routes/astronomical-clock.tsx",
  "app/routes/swatch-internet-time-clock.tsx",
  "app/routes/reaction-time-test.tsx",
  "app/routes/metronome.tsx",
  "app/clients/components/date-calculators/MoreDateTimeCalculatorPages.tsx",
];

for (const file of methodologyFiles) {
  const source = await read(file);
  assert.match(source, /<TechnicalMethod\b/, `${file} has no visible technical method.`);
}

const technicalSourcesFile = await read("app/clients/config/technicalSources.ts");
const technicalSources = [
  ...technicalSourcesFile.matchAll(
    /(\w+):\s*\{\s*href:\s*"([^"]+)",\s*label:\s*"([^"]+)"/g,
  ),
].map(([, key, href, label]) => ({ key, href, label }));
assert.equal(technicalSources.length, 13, "The technical source registry was not parsed.");
for (const source of technicalSources) {
  const url = new URL(source.href);
  assert.equal(url.protocol, "https:", `${source.key} does not use HTTPS.`);
  assert.ok(source.label.length >= 8, `${source.key} has an unclear source label.`);
}

const atomicBundle = (
  await Promise.all([
    read("app/routes/atomic-clock.tsx"),
    read("app/clients/components/atomic-clock/HowItWorks.tsx"),
    read("app/clients/components/atomic-clock/Disclaimer.tsx"),
    read("app/clients/components/atomic-clock/KeyboardShortcuts.tsx"),
    read("app/clients/components/atomic-clock/FAQ.tsx"),
  ])
).join("\n");
for (const forbidden of [
  "laboratory precision",
  "guaranteed atomic accuracy",
  "official atomic time",
]) {
  assert.ok(
    !atomicBundle.toLowerCase().includes(forbidden),
    `Atomic clock still contains unsupported wording: ${forbidden}`,
  );
}
assert.match(atomicBundle, /does not connect to an atomic clock/i);
assert.match(atomicBundle, /depends on your device clock/i);
assert.doesNotMatch(atomicBundle, /clock stays correct/i);
assert.doesNotMatch(atomicBundle, /Preferences may persist/i);
assert.match(atomicBundle, /does not save its milliseconds or freeze settings/i);

const meetingBundle = (
  await Promise.all([
    read("app/routes/meeting-timer.tsx"),
    read("app/clients/components/meeting-timer/HowItWorks.tsx"),
    read("app/clients/components/meeting-timer/FAQ.tsx"),
    read("app/clients/components/meeting-timer/KeyboardShortcuts.tsx"),
    read("app/clients/components/meeting-timer/PopularUseCases.tsx"),
  ])
).join("\n");
assert.match(meetingBundle, /pause.*before.*chang/i);
assert.doesNotMatch(meetingBundle, /change.{0,60}minutes.{0,60}while.{0,30}running/i);

const speedcubing = await read("app/routes/speedcubing-timer.tsx");
assert.match(speedcubing, /Results and averages exist only in memory/i);
assert.match(speedcubing, /Refreshing the page, closing the tab/i);
assert.doesNotMatch(speedcubing, /track splits/i);
assert.doesNotMatch(speedcubing, /local history/i);

const reaction = await read("app/routes/reaction-time-test.tsx");
for (const unsupportedRank of ["Lightning fast", "Excellent", "Slow"]) {
  assert.ok(
    !reaction.includes(unsupportedRank),
    `Reaction test still has an unsupported result rank: ${unsupportedRank}`,
  );
}
assert.match(reaction, /input\s+(?:device|hardware)\s+latency/i);
assert.match(reaction, /false start/i);

const privacy = await read("app/routes/privacy.tsx");
assert.match(privacy, /astroClockPrefs/);
assert.match(privacy, /latitude and longitude/i);
assert.match(privacy, /api\.sunrise-sunset\.org/i);

const root = await read("app/root.tsx");
assert.match(root, /Page Not Found \| iLoveTimers/);
assert.match(root, /noindex,follow/);
assert.match(root, /href="\/sitemap"/);
assert.match(root, /aria-label="Page recovery"/);

const processPage = await read("app/routes/how-ilovetimers-is-made.tsx");
assert.match(processPage, /Automated checks cover the production build/i);
assert.match(processPage, /do not\s+prove that every browser/i);
assert.doesNotMatch(processPage, /every tool is tested/i);
assert.doesNotMatch(processPage, /every formula is verified/i);

const stage2VisibleSources = (
  await Promise.all(methodologyFiles.map((file) => read(file)))
).join("\n");
assert.ok(
  !stage2VisibleSources.includes("\u2014"),
  "A revised methodology source contains an em dash.",
);

console.log(
  `Stage 2 accuracy audit passed (${methodologyFiles.length} methodology source files, ${technicalSources.length} primary sources).`,
);
