import assert from "node:assert/strict";
import {
  detectUnixTimestampUnit,
  estimateMoonCycle,
  estimateSunEventsUtc,
  isValidCalendarDate,
  metronomeBeatIntervalSeconds,
  metronomeSubdivisionIntervalSeconds,
  normalizeAstronomicalPreferences,
  parseAstronomicalPreferences,
  parseUnixTimestamp,
  parseUtcDateTime,
  reactionPressAction,
  REFERENCE_NEW_MOON_UTC_MS,
  resolveZonedWallTime,
  summarizeReactionTimes,
  SYNODIC_MONTH_DAYS,
} from "../../app/clients/lib/technicalTimeMath.js";

assert.equal(isValidCalendarDate(2024, 2, 29), true);
assert.equal(isValidCalendarDate(2023, 2, 29), false);
assert.equal(isValidCalendarDate(2026, 2, 31), false);
assert.equal(isValidCalendarDate(2026, 13, 1), false);

assert.equal(
  parseUtcDateTime("2024-02-29T23:59:58")?.toISOString(),
  "2024-02-29T23:59:58.000Z",
);
assert.equal(parseUtcDateTime("2026-02-31T12:00"), null);
assert.equal(parseUtcDateTime("2026-01-01T24:00"), null);
assert.equal(parseUtcDateTime("not-a-date"), null);

assert.equal(detectUnixTimestampUnit("99999999999"), "seconds");
assert.equal(detectUnixTimestampUnit("100000000000"), "milliseconds");
assert.equal(detectUnixTimestampUnit("99999999999999"), "milliseconds");
assert.equal(detectUnixTimestampUnit("100000000000000"), "microseconds");
assert.equal(detectUnixTimestampUnit("-1704067200.5"), "seconds");

const secondsResult = parseUnixTimestamp("1704067200", "auto");
assert.equal(secondsResult.ok, true);
assert.equal(secondsResult.unit, "seconds");
assert.equal(secondsResult.date?.toISOString(), "2024-01-01T00:00:00.000Z");

const millisecondsResult = parseUnixTimestamp("1704067200000", "auto");
assert.equal(millisecondsResult.ok, true);
assert.equal(millisecondsResult.unit, "milliseconds");
assert.equal(millisecondsResult.milliseconds, 1_704_067_200_000);

const microsecondsResult = parseUnixTimestamp("1704067200000123", "auto");
assert.equal(microsecondsResult.ok, true);
assert.equal(microsecondsResult.unit, "microseconds");
assert.equal(microsecondsResult.milliseconds, 1_704_067_200_000);
assert.equal(microsecondsResult.truncated, true);

assert.equal(
  parseUnixTimestamp("-1", "seconds").date?.toISOString(),
  "1969-12-31T23:59:59.000Z",
);
assert.equal(parseUnixTimestamp("1.25", "seconds").milliseconds, 1_250);
assert.equal(parseUnixTimestamp("1001", "microseconds").milliseconds, 1);
assert.equal(parseUnixTimestamp("1001", "microseconds").truncated, true);
assert.equal(parseUnixTimestamp("12x", "seconds").ok, false);
assert.equal(parseUnixTimestamp("8640000000000001", "milliseconds").ok, false);

const normalNewYork = resolveZonedWallTime({
  year: 2026,
  month: 7,
  day: 18,
  hour: 12,
  minute: 0,
  second: 0,
  timeZone: "America/New_York",
});
assert.equal(normalNewYork.status, "valid");
assert.equal(normalNewYork.instants[0]?.toISOString(), "2026-07-18T16:00:00.000Z");

const springForward = resolveZonedWallTime({
  year: 2026,
  month: 3,
  day: 8,
  hour: 2,
  minute: 30,
  second: 0,
  timeZone: "America/New_York",
});
assert.equal(springForward.status, "nonexistent");
assert.deepEqual(springForward.instants, []);

const fallBack = resolveZonedWallTime({
  year: 2026,
  month: 11,
  day: 1,
  hour: 1,
  minute: 30,
  second: 0,
  timeZone: "America/New_York",
});
assert.equal(fallBack.status, "ambiguous");
assert.deepEqual(
  fallBack.instants.map((date) => date.toISOString()),
  ["2026-11-01T05:30:00.000Z", "2026-11-01T06:30:00.000Z"],
);
assert.equal(
  resolveZonedWallTime({
    year: 2026,
    month: 2,
    day: 31,
    hour: 1,
    minute: 0,
    second: 0,
    timeZone: "UTC",
  }).status,
  "invalid",
);
assert.equal(
  resolveZonedWallTime({
    year: 2026,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    timeZone: "Invalid/Zone",
  }).status,
  "invalid-zone",
);

assert.equal(metronomeBeatIntervalSeconds(120), 0.5);
assert.equal(metronomeBeatIntervalSeconds(20), 3);
assert.equal(metronomeBeatIntervalSeconds(0), null);
assert.equal(metronomeSubdivisionIntervalSeconds(120, 4), 0.125);
assert.equal(metronomeSubdivisionIntervalSeconds(120, 3), 1 / 6);
assert.equal(metronomeSubdivisionIntervalSeconds(120, 5), null);

const reactionSummary = summarizeReactionTimes([100, 200, 300, -1, Number.NaN]);
assert.deepEqual(reactionSummary, {
  best: 100,
  mean: 200,
  median: 200,
  sampleDeviation: 100,
});
assert.equal(reactionPressAction("idle"), "start");
assert.equal(reactionPressAction("waiting"), "false-start");
assert.equal(reactionPressAction("go"), "record");
assert.equal(reactionPressAction("done"), "ignore");

assert.deepEqual(
  normalizeAstronomicalPreferences({
    lat: 40.7128,
    lon: -74.006,
    tz: "America/New_York",
  }),
  { lat: 40.7128, lon: -74.006, tz: "America/New_York" },
);
assert.deepEqual(
  normalizeAstronomicalPreferences({
    lat: 91,
    lon: -74.006,
    tz: "Invalid/Zone",
  }),
  { lat: null, lon: null, tz: null },
);
assert.deepEqual(parseAstronomicalPreferences(null), {
  preferences: { lat: null, lon: null, tz: null },
  corrupt: false,
});
assert.deepEqual(parseAstronomicalPreferences("{broken"), {
  preferences: { lat: null, lon: null, tz: null },
  corrupt: true,
});

const referenceMoon = estimateMoonCycle(REFERENCE_NEW_MOON_UTC_MS);
assert.equal(referenceMoon?.ageDays, 0);
assert.equal(referenceMoon?.illuminationFraction, 0);
const halfCycleMoon = estimateMoonCycle(
  REFERENCE_NEW_MOON_UTC_MS + (SYNODIC_MONTH_DAYS / 2) * 86_400_000,
);
assert.ok(Math.abs((halfCycleMoon?.illuminationFraction ?? 0) - 1) < 1e-12);
assert.equal(estimateMoonCycle(Number.NaN), null);

const newYorkSun = estimateSunEventsUtc({
  year: 2026,
  month: 7,
  day: 18,
  latitude: 40.7128,
  longitude: -74.006,
  timeZone: "America/New_York",
});
assert.equal(newYorkSun.validInput, true);
assert.equal(newYorkSun.sunrise?.toISOString(), "2026-07-18T09:39:49.744Z");
assert.equal(newYorkSun.sunset?.toISOString(), "2026-07-19T00:24:11.072Z");
assert.deepEqual(
  estimateSunEventsUtc({
    year: 2026,
    month: 2,
    day: 31,
    latitude: 40.7128,
    longitude: -74.006,
    timeZone: "America/New_York",
  }),
  { sunrise: null, sunset: null, validInput: false },
);
assert.equal(
  estimateSunEventsUtc({
    year: 2026,
    month: 7,
    day: 18,
    latitude: 40.7128,
    longitude: -74.006,
    timeZone: "Invalid/Zone",
  }).validInput,
  false,
);
const polarNight = estimateSunEventsUtc({
  year: 2026,
  month: 12,
  day: 21,
  latitude: 89,
  longitude: 0,
  timeZone: "UTC",
});
assert.equal(polarNight.validInput, true);
assert.equal(polarNight.sunrise, null);
assert.equal(polarNight.sunset, null);

console.log("Technical time tests passed.");
