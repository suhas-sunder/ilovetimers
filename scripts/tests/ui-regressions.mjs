import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateTapTempo, nextAlarmOccurrence } from "../../app/clients/lib/specialtyMath.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

const now = new Date(2026, 6, 16, 10, 30, 45, 0);
const laterToday = nextAlarmOccurrence(now, "11:15");
assert.ok(laterToday);
assert.equal(laterToday.getDate(), now.getDate());
assert.equal(laterToday.getHours(), 11);
assert.equal(laterToday.getMinutes(), 15);

for (const time of ["10:30", "09:00"]) {
  const next = nextAlarmOccurrence(now, time);
  assert.ok(next);
  assert.equal(next.getDate(), now.getDate() + 1);
}
assert.equal(nextAlarmOccurrence(now, ""), null);
assert.equal(nextAlarmOccurrence(now, "24:00"), null);
assert.equal(nextAlarmOccurrence(new Date(Number.NaN), "10:00"), null);

assert.equal(calculateTapTempo([0, 500]).bpm, null);
assert.deepEqual(calculateTapTempo([0, 500, 1000]), {
  intervals: [500, 500],
  bpm: 120,
  stability: null,
});
assert.deepEqual(calculateTapTempo([0, 50, 550, 1050, 1550]), {
  intervals: [500, 500, 500],
  bpm: 120,
  stability: "Very steady",
});
assert.equal(calculateTapTempo([0, 400, 900, 1300]).bpm, 150);

const [
  css,
  pizza,
  reaction,
  silent,
  metronome,
  bpm,
  relatedTools,
  rootSource,
  footerSource,
  author,
  millisecondTimer,
  kitchenTimer,
  secondsTimer,
  timerClock,
  timerStopwatch,
  countdownTimer,
  sharePresetPanel,
  eggTimer,
  onlineTimer,
  silentTimer,
  freeOnlineTimers,
] = await Promise.all([
  read("app/app.css"),
  read("app/routes/pizza-timer.tsx"),
  read("app/routes/reaction-time-test.tsx"),
  read("app/routes/silent-timer.tsx"),
  read("app/routes/metronome.tsx"),
  read("app/routes/bpm-tapper.tsx"),
  read("app/clients/components/navigation/RelatedTools.tsx"),
  read("app/root.tsx"),
  read("app/clients/components/navigation/Footer.tsx"),
  read("app/routes/author.suhas-sunder.tsx"),
  read("app/routes/millisecond-timer.tsx"),
  read("app/routes/kitchen-timer.tsx"),
  read("app/routes/seconds-timer.tsx"),
  read("app/routes/timer-clock.tsx"),
  read("app/routes/timer-stopwatch.tsx"),
  read("app/routes/countdown-timer.tsx"),
  read("app/clients/components/share/SharePresetPanel.tsx"),
  read("app/routes/egg-timer.tsx"),
  read("app/routes/online-timer.tsx"),
  read("app/routes/silent-timer.tsx"),
  read("app/routes/free-online-timers.tsx"),
]);

const controlsRule = css.match(/\.timer-controls-row\s*\{([\s\S]*?)\}/)?.[1] ?? "";
assert.match(controlsRule, /position:\s*relative/);
assert.match(controlsRule, /z-index:\s*1/);
assert.match(pizza, /timer-countdown-stack/);
assert.match(pizza, /<ControlGroup>/);

// Keep saved-setup forms aligned with the timer controls rather than spanning
// nearly the full display width. These assertions cover every route using the
// shared SharePresetPanel, including Countdown, Pomodoro, HIIT and meeting planner.
assert.match(sharePresetPanel, /className="mx-auto max-w-2xl"/);
assert.match(sharePresetPanel, /grid min-w-0 gap-3 sm:grid-cols-2/);
assert.match(sharePresetPanel, /records\.length > 0 \? \(/);
assert.match(countdownTimer, /className="max-w-xl"\s+title="Set countdown"/);
assert.match(eggTimer, /className="max-w-3xl"\s+title="Timer settings"/);
assert.match(eggTimer, /maxPx: isFs \? 520 : 210/);
// Assert the right layout mechanism: the Apply grid item itself must
// align to the bottoms of the labeled fields, not its children internally.
for (const [name, source] of [["countdown", countdownTimer], ["timer clock", timerClock]]) {
  assert.match(source, /className="flex w-full justify-center sm:w-auto sm:self-end sm:justify-start"/, `${name} Apply grid cell must be bottom-aligned`);
  assert.match(source, /className="w-full sm:w-auto"/, `${name} Apply button must fit mobile layout`);
}
assert.doesNotMatch(countdownTimer, /hint="0-59"/, "Duplicate seconds hint reintroduces uneven field heights");


assert.doesNotMatch(reaction, /useFitDisplayText/);
assert.match(reaction, /data-reaction-display-region/);
assert.match(reaction, /data-reaction-value-region/);
assert.match(reaction, /data-reaction-primary-control/);
assert.match(reaction, /className="min-w-28 px-6 py-3 text-lg"/);
assert.match(reaction, /data-reaction-following-content/);
assert.match(reaction, /height:\s*isFs\s*\?\s*undefined\s*:\s*"clamp\(45rem, 64vw, 47\.5rem\)"/);
assert.match(reaction, /tabular-nums/);
assert.match(reaction, /style=\{\{ height: 92/);

assert.doesNotMatch(silent, /AudioContext|createOscillator|label="Sound"/);
assert.match(silent, /no completion beep or ticking sound/i);

assert.match(metronome, /if \(runningRef\.current\) return;/);
assert.match(metronome, /runningRef\.current = true;/);
assert.equal((metronome.match(/window\.setInterval/g) ?? []).length, 1);
assert.match(metronome, /type Subdivision = 1 \| 2 \| 3 \| 4/);

assert.match(bpm, /onPointerDownCapture=\{onStagePointerDownCapture\}/);
assert.doesNotMatch(bpm, /onClick=\{registerTap\}/);
assert.match(bpm, /activeRef\.current \? tapsRef\.current : \[\]/);

assert.match(relatedTools, /pathname\.replace\(\/\\\/\+\$\//);
assert.match(rootSource, /key=\{normalizedPathname\}/);
assert.doesNotMatch(rootSource, /getAdSenseLoaderScript/);
assert.equal((rootSource.match(/i💛Timers\.com/g) ?? []).length, 2, "Desktop and mobile header must show the correct brand");
assert.equal((footerSource.match(/i💛Timers\.com/g) ?? []).length, 3, "Footer brand, copyright and site directory must match");
assert.match(footerSource, /How i💛Timers\.com Is Made/, "Footer site link must use the visible brand");

assert.match(author, /const UPDATED_DATETIME = `\$\{UPDATED_DATE\}T00:00:00Z`;/);
assert.match(author, /dateModified: UPDATED_DATETIME/);
for (const [name, source] of [
  ["millisecond timer", millisecondTimer],
  ["kitchen timer", kitchenTimer],
  ["seconds timer", secondsTimer],
  ["timer clock", timerClock],
  ["timer stopwatch", timerStopwatch],
  ["countdown timer", countdownTimer],
  ["online timer", onlineTimer],
  ["silent timer", silentTimer],
  ["free online timers", freeOnlineTimers],
]) {
  assert.match(source, /onBlur=\{(?:applyCustomInputs|applyCustom|applyInputs|applyInputsToTotal|applyDurationInputs|onSet)\}/, `${name} should apply typed duration values when an input loses focus`);
  assert.match(source, /event\.key === "Enter"/, `${name} should apply typed duration values on Enter`);
}

console.log("Targeted UI regression checks passed (alarm rollover, tap-tempo filtering, control stacking, stable reaction layout, silent audio removal, metronome loop guard, single-path BPM input, trailing-slash hydration stability, ISO dateModified output, and deferred custom duration commits across timer routes).");
