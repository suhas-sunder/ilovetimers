import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITEMAP_GROUPS } from "../../app/clients/config/siteDirectory.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const [routes, foundation, root, footer, fitText, css, archived, billable] =
  await Promise.all([
    read("app/routes.ts"),
    read("app/clients/components/ui/foundation.tsx"),
    read("app/root.tsx"),
    read("app/clients/components/navigation/Footer.tsx"),
    read("app/clients/hooks/useFitDisplayText.ts"),
    read("app/app.css"),
    read("app/routes/free-online-timers.tsx"),
    read("app/routes/billable-hours-clock.tsx"),
  ]);
const touchTargetSources = await Promise.all(
  [
    "app/routes/free-online-timers.tsx",
    "app/routes/lab-timer.tsx",
    "app/routes/multiple-timers.tsx",
    "app/routes/time-zone-meeting-planner.tsx",
    "app/routes/reaction-time-test.tsx",
    "app/routes/metronome.tsx",
  ].map(read),
);

const configuredRoutes = ["/", ...[...routes.matchAll(/\broute\(\s*["']([^"']+)["']/g)].map((match) => `/${match[1]}`)];
const declaredDirectoryRoutes = SITEMAP_GROUPS.flatMap(({ routes }) => routes);
check(configuredRoutes.length === declaredDirectoryRoutes.length, `Configured and declared route counts differ (${configuredRoutes.length} vs ${declaredDirectoryRoutes.length}).`);
check(new Set(configuredRoutes).size === configuredRoutes.length, "Configured routes contain duplicates.");

check(/sm:\s*["'][^"']*min-h-11/.test(foundation), "Small shared buttons no longer guarantee a 44px minimum height.");
check(/PresetChip[\s\S]*?min-h-11 min-w-11/.test(foundation), "PresetChip no longer guarantees a 44px hit area.");
check(/Toggle[\s\S]*?min-h-11/.test(foundation), "Toggle no longer guarantees a 44px hit area.");
check(/aria-describedby=\{describedBy\}/.test(foundation), "Field hints and errors are not programmatically associated.");
check(/aria-invalid=\{error \? true : providedInvalid\}/.test(foundation), "Field errors do not expose aria-invalid.");
check(/role="alert"/.test(foundation), "Field errors do not use an alert role.");

check(/h-11 w-11/.test(root), "Theme control no longer has a 44px hit area.");
check(/aria-label=\{open \? "Close menu" : "Open menu"\}/.test(root), "Mobile menu button label does not reflect its state.");
check(/keepFocusInside/.test(root) && /closeMobileMenu/.test(root), "Mobile modal navigation lost focus containment or restoration.");
check(/min-h-11/.test(footer), "Footer mobile controls no longer have a 44px hit area.");

check(/Math\.max\(\s*16/.test(fitText), "Display fitting no longer permits a narrow-screen safety floor.");
check(/mobileContainerWidth = 256/.test(fitText) && /clamp\(16px/.test(fitText), "Deterministic display sizing is not safe for a 320px first render.");
check(/replace\(\/\\d\/g, "0"\)/.test(fitText), "Display fitting no longer stabilizes tabular timer geometry across ticks.");
check(/cqw/.test(fitText) && /useMemo/.test(fitText), "Display fitting no longer uses deterministic container-relative CSS sizing.");
check(!/useLayoutEffect|useState|ResizeObserver|requestAnimationFrame|getComputedStyle|setInterval|setTimeout/.test(fitText), "Display fitting reintroduced client-side measurement or delayed resizing.");
check(/prefers-reduced-motion:\s*reduce/.test(css), "Reduced-motion handling is missing.");
check(/animation-duration:\s*0\.01ms\s*!important/.test(css), "Reduced-motion handling does not suppress long animations.");
check(/flex flex-col items-start gap-3 sm:flex-row/.test(archived), "Archived timer header can regress to 320px overflow.");
check((archived.match(/aria-label="Countdown duration"/g) ?? []).length === 2, "Archived countdown duration inputs are not both named.");
check(touchTargetSources.every((source) => source.includes("min-h-11")), "A corrected route-local control no longer guarantees a 44px hit area.");
for (const label of ["Active timer note", "Name for ${t.name}", "Hourly rate for ${t.name}", "Note for ${t.name}"]) {
  check(billable.includes(label), `Billable-hours clock input label is missing: ${label}`);
}

if (failures.length) {
  console.error("UI integrity audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`UI integrity audit passed (${configuredRoutes.length} routes; shared targets, focus, labels, reduced motion, and narrow displays).`);
}
