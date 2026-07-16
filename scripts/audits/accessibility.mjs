import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

async function listFiles(directory) {
  const entries = await readdir(path.join(ROOT, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(relative)));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(relative);
  }
  return files;
}

const files = await listFiles("app");
const sources = new Map(await Promise.all(files.map(async (file) => [file, await read(file)])));
const allSource = [...sources.values()].join("\n");
const foundation = sources.get("app/clients/components/ui/foundation.tsx") ?? "";
const root = sources.get("app/root.tsx") ?? "";
const footer = sources.get("app/clients/components/navigation/Footer.tsx") ?? "";
const css = await read("app/app.css");
const continuousClockFiles = [
  "app/clients/components/clock-discovery/ClockDiscoveryPages.tsx",
  "app/routes/12-hour-clock.tsx",
  "app/routes/24-hour-clock.tsx",
  "app/routes/analog-clock.tsx",
  "app/routes/astronomical-clock.tsx",
  "app/routes/atomic-clock.tsx",
  "app/routes/binary-clock.tsx",
  "app/routes/clock-with-milliseconds.tsx",
  "app/routes/clock-with-seconds.tsx",
  "app/routes/current-local-time.tsx",
  "app/routes/debt-clock.tsx",
  "app/routes/digital-clock.tsx",
  "app/routes/epoch-unix-time-clock.tsx",
  "app/routes/fibonacci-clock.tsx",
  "app/routes/golden-hour-clock.tsx",
  "app/routes/hexadecimal-clock.tsx",
  "app/routes/military-time-clock.tsx",
  "app/routes/minimalist-clock.tsx",
  "app/routes/moon-phase-clock.tsx",
  "app/routes/morse-code-clock.tsx",
  "app/routes/retro-flip-clock.tsx",
  "app/routes/roman-numeral-clock.tsx",
  "app/routes/smooth-second-hand-clock.tsx",
  "app/routes/sunrise-sunset-clock.tsx",
  "app/routes/swatch-internet-time-clock.tsx",
  "app/routes/time-blocking-clock.tsx",
  "app/routes/utc-clock.tsx",
  "app/routes/world-clock.tsx",
];

check(!/aria-live=["']assertive["']/.test(allSource), "An assertive live region was introduced; verify it cannot chatter.");
for (const file of continuousClockFiles) {
  check(
    !(sources.get(file) ?? "").includes('aria-live="polite"'),
    `${file} can announce every continuously updating clock tick.`,
  );
}
check(!/aria-label=["']\s*["']/.test(allSource), "An empty aria-label exists in application source.");
check(!/title=["']\s*["']/.test(allSource), "An empty title attribute exists in application source.");
check(/useId/.test(foundation), "Shared fields do not generate deterministic label-association IDs.");
check(/aria-describedby=\{describedBy\}/.test(foundation), "Shared field descriptions are not associated with inputs.");
check(/role="dialog"[\s\S]*?aria-modal="true"/.test(root), "Mobile navigation is not exposed as a modal dialog.");
check(/focusable\?\.focus\(\)|querySelector<HTMLElement>\(selector\)\?\.focus\(\)/.test(root), "Opening mobile navigation does not move focus inside it.");
check(/event\.key !== "Tab"/.test(root), "Mobile modal navigation does not contain keyboard focus.");
check(/btnRef\.current\?\.focus\(\)/.test(root), "Closing mobile navigation does not restore trigger focus.");
check(/min-h-11/.test(footer), "Footer disclosure and preference controls can regress below 44px.");
check(/prefers-reduced-motion:\s*reduce/.test(css), "Reduced-motion support is missing.");

if (failures.length) {
  console.error("Accessibility audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Accessibility audit passed (${files.length} source files; names, fields, modal focus, touch targets, live regions, and reduced motion).`);
}
