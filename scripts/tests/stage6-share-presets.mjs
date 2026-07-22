import assert from "node:assert/strict";
import {
  SHARE_CANONICAL_ORIGIN,
  SHARE_URL_MAX_LENGTH,
  countdownShareSchema,
  hiitShareSchema,
  pomodoroShareSchema,
  timeZoneConverterShareSchema,
  timeZoneMeetingPlannerShareSchema,
} from "../../app/clients/lib/shareConfigurations.ts";
import {
  LOCAL_PRESET_LIMIT,
  LOCAL_PRESET_NAME_MAX_LENGTH,
  createLocalPresetStore,
  validatePresetName,
} from "../../app/clients/lib/localPresetStore.ts";

let assertions = 0;

function check(value, message) {
  assertions += 1;
  assert.ok(value, message);
}

function equal(actual, expected, message) {
  assertions += 1;
  assert.deepEqual(actual, expected, message);
}

function valid(schema, query, fallback) {
  const result = schema.parse(query, fallback);
  check(result.status === "valid", `${schema.toolId} should accept ${query}`);
  if (result.status !== "valid") throw new Error(result.message);
  return result;
}

function invalid(schema, query) {
  const result = schema.parse(query);
  check(result.status === "invalid", `${schema.toolId} should reject ${query}`);
}

function roundTrip(schema, config) {
  const url = schema.buildUrl(config);
  check(url.startsWith(`${SHARE_CANONICAL_ORIGIN}${schema.path}?v=1`), `${schema.toolId} uses its canonical path and v=1 first`);
  check(url.length <= SHARE_URL_MAX_LENGTH, `${schema.toolId} stays within the URL limit`);
  equal(valid(schema, url).config, config, `${schema.toolId} round trips deterministically`);
  equal(schema.buildUrl(config), url, `${schema.toolId} serialization is deterministic`);
}

const countdownDefault = { durationSeconds: 300 };
const countdownCustom = { durationSeconds: 3661 };
equal(countdownShareSchema.buildUrl(countdownDefault), `${SHARE_CANONICAL_ORIGIN}/countdown-timer?v=1`, "countdown omits its fixed default");
roundTrip(countdownShareSchema, countdownCustom);
equal(valid(countdownShareSchema, "?v=1").config, countdownDefault, "countdown accepts a version-only default link");
equal(valid(countdownShareSchema, "?v=1&duration=1&utm_source=test").config.durationSeconds, 1, "unknown parameters are ignored");
equal(valid(countdownShareSchema, "?v=1&duration=599999").config.durationSeconds, 599999, "countdown accepts maximum");
invalid(countdownShareSchema, "?duration=10");
invalid(countdownShareSchema, "?v=2&duration=10");
invalid(countdownShareSchema, "?v=1&duration=0");
invalid(countdownShareSchema, "?v=1&duration=600000");
invalid(countdownShareSchema, "?v=1&duration=1.5");
invalid(countdownShareSchema, "?v=1&duration=");
invalid(countdownShareSchema, "?v=1&duration=1&duration=2");
invalid(countdownShareSchema, "?v=1&duration=%3Cscript%3E");
equal(countdownShareSchema.parse("?utm_source=test").status, "none", "unrelated query strings do not activate shared config");

const pomodoroDefault = {
  workMinutes: 25,
  breakMinutes: 5,
  cycles: 4,
  longBreakEnabled: true,
  longBreakMinutes: 15,
  autoAdvance: true,
  sound: true,
  finalCountdownBeeps: false,
};
const pomodoroCustom = {
  workMinutes: 50,
  breakMinutes: 10,
  cycles: 6,
  longBreakEnabled: false,
  longBreakMinutes: 25,
  autoAdvance: false,
  sound: false,
  finalCountdownBeeps: true,
};
equal(pomodoroShareSchema.buildUrl(pomodoroDefault), `${SHARE_CANONICAL_ORIGIN}/pomodoro-timer?v=1`, "Pomodoro omits all fixed defaults");
roundTrip(pomodoroShareSchema, pomodoroCustom);
equal(valid(pomodoroShareSchema, "?v=1&work=180&break=60&cycles=12&longDuration=90").config.workMinutes, 180, "Pomodoro accepts maximum values");
invalid(pomodoroShareSchema, "?v=1&work=0");
invalid(pomodoroShareSchema, "?v=1&break=61");
invalid(pomodoroShareSchema, "?v=1&cycles=13");
invalid(pomodoroShareSchema, "?v=1&longDuration=91");
invalid(pomodoroShareSchema, "?v=1&sound=true");
invalid(pomodoroShareSchema, "?v=1&auto=2");
invalid(pomodoroShareSchema, "?v=1&work=25&work=50");
equal(valid(pomodoroShareSchema, "?v=1&work=45").config.breakMinutes, 5, "Pomodoro fills absent supported fields from fixed defaults");
check(!pomodoroShareSchema.buildUrl(pomodoroCustom).includes("phase="), "Pomodoro links exclude runtime phase");
check(!pomodoroShareSchema.buildUrl(pomodoroCustom).includes("remaining="), "Pomodoro links exclude remaining time");

const hiitDefault = {
  warmupSeconds: 30,
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
  cooldownSeconds: 30,
  sound: true,
  finalCountdownBeeps: false,
};
const hiitCustom = {
  warmupSeconds: 0,
  workSeconds: 45,
  restSeconds: 15,
  rounds: 12,
  cooldownSeconds: 60,
  sound: false,
  finalCountdownBeeps: true,
};
equal(hiitShareSchema.buildUrl(hiitDefault), `${SHARE_CANONICAL_ORIGIN}/hiit-timer?v=1`, "HIIT omits all fixed defaults");
roundTrip(hiitShareSchema, hiitCustom);
equal(valid(hiitShareSchema, "?v=1&warmup=600&work=600&rest=600&rounds=50&cooldown=600").config.rounds, 50, "HIIT accepts maximum values");
invalid(hiitShareSchema, "?v=1&warmup=-1");
invalid(hiitShareSchema, "?v=1&work=0");
invalid(hiitShareSchema, "?v=1&rest=601");
invalid(hiitShareSchema, "?v=1&rounds=51");
invalid(hiitShareSchema, "?v=1&cooldown=601");
invalid(hiitShareSchema, "?v=1&countdown=yes");
check(!hiitShareSchema.buildUrl(hiitCustom).includes("running="), "HIIT links cannot autostart a session");
check(!hiitShareSchema.buildUrl(hiitCustom).includes("step="), "HIIT links exclude runtime step");

const meetingDefault = {
  date: "2026-07-21",
  durationMinutes: 60,
  workStartHour: 9,
  workEndHour: 17,
  zones: ["UTC", "America/New_York", "Europe/London"],
};
const meetingCustom = {
  date: "2028-02-29",
  durationMinutes: 90,
  workStartHour: 7,
  workEndHour: 20,
  zones: ["Pacific/Auckland", "America/Los_Angeles", "Asia/Tokyo"],
};
equal(timeZoneMeetingPlannerShareSchema.buildUrl(meetingDefault), `${SHARE_CANONICAL_ORIGIN}/time-zone-meeting-planner?v=1&date=2026-07-21`, "meeting planner retains its dynamic date and omits fixed defaults");
roundTrip(timeZoneMeetingPlannerShareSchema, meetingCustom);
equal(valid(timeZoneMeetingPlannerShareSchema, "?v=1", { date: "2026-07-21" }).config, meetingDefault, "meeting planner can use the loader date when a version-only link is received");
invalid(timeZoneMeetingPlannerShareSchema, "?v=1");
invalid(timeZoneMeetingPlannerShareSchema, "?v=1&date=2027-02-29");
invalid(timeZoneMeetingPlannerShareSchema, "?v=1&date=2026-01-01&duration=16");
invalid(timeZoneMeetingPlannerShareSchema, "?v=1&date=2026-01-01&start=17&end=9");
invalid(timeZoneMeetingPlannerShareSchema, "?v=1&date=2026-01-01&zones=UTC,UTC");
invalid(timeZoneMeetingPlannerShareSchema, "?v=1&date=2026-01-01&zones=Not%2FA_Zone");
invalid(timeZoneMeetingPlannerShareSchema, `?v=1&date=2026-01-01&zones=${Array(9).fill("UTC").map((zone, index) => index ? `${zone}+${index}` : zone).join(",")}`);
invalid(timeZoneMeetingPlannerShareSchema, "?v=1&date=2026-01-01&zones=%3Cscript%3E");
const eightZones = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Asia/Tokyo", "Australia/Sydney"];
equal(valid(timeZoneMeetingPlannerShareSchema, `?v=1&date=2026-01-01&zones=${eightZones.join(",")}`).config.zones.length, 8, "meeting planner accepts eight valid zones");
invalid(timeZoneMeetingPlannerShareSchema, `?v=1&date=2026-01-01&zones=${[...eightZones, "Pacific/Auckland"].join(",")}`);
check(!timeZoneMeetingPlannerShareSchema.buildUrl(meetingCustom).includes("label="), "meeting links exclude arbitrary labels");
check(timeZoneMeetingPlannerShareSchema.buildUrl({ ...meetingCustom, zones: eightZones }).length <= SHARE_URL_MAX_LENGTH, "maximum meeting array remains inside serialized length limit");

const converterConfig = {
  fromZone: "America/New_York",
  toZone: "Europe/London",
  date: "2026-11-01",
  time: "01:30:45",
  showSeconds: true,
};
roundTrip(timeZoneConverterShareSchema, converterConfig);
const legacy = valid(timeZoneConverterShareSchema, "?from=America%2FNew_York&to=Europe%2FLondon&date=2026-11-01&time=01%3A30&sec=0");
check(legacy.legacy, "legacy converter links remain compatible");
equal(legacy.config.time, "01:30", "legacy converter time is retained");
invalid(timeZoneConverterShareSchema, "?v=2&from=UTC&to=UTC&date=2026-01-01&time=12%3A00&sec=0");
invalid(timeZoneConverterShareSchema, "?v=1&from=UTC");
invalid(timeZoneConverterShareSchema, "?v=1&from=Bad&to=UTC&date=2026-01-01&time=12%3A00&sec=0");
invalid(timeZoneConverterShareSchema, "?v=1&from=UTC&to=UTC&date=2026-02-30&time=12%3A00&sec=0");
invalid(timeZoneConverterShareSchema, "?v=1&from=UTC&to=UTC&date=2026-01-01&time=24%3A00&sec=0");
invalid(timeZoneConverterShareSchema, "?v=1&from=UTC&to=UTC&date=2026-01-01&time=12%3A00%3A60&sec=1");
invalid(timeZoneConverterShareSchema, "?v=1&from=UTC&to=UTC&date=2026-01-01&time=12%3A00&sec=0&sec=1");
equal(valid(timeZoneConverterShareSchema, "?v=1&from=UTC&to=UTC&date=2026-01-01&time=12%3A00&sec=1").config.time, "12:00:00", "converter normalizes missing seconds when enabled");

for (const [schema, config] of [
  [countdownShareSchema, countdownDefault],
  [pomodoroShareSchema, pomodoroDefault],
  [hiitShareSchema, hiitDefault],
  [timeZoneMeetingPlannerShareSchema, meetingDefault],
  [timeZoneConverterShareSchema, converterConfig],
]) {
  const validation = schema.validate({ ...config, unexpected: "value" });
  check(!validation.valid, `${schema.toolId} rejects unknown stored configuration fields`);
}

class MemoryStorage {
  constructor() {
    this.values = new Map();
    this.failReads = false;
    this.failWrites = false;
    this.failRemoves = false;
  }
  getItem(key) {
    if (this.failReads) throw new Error("disabled");
    return this.values.get(key) ?? null;
  }
  setItem(key, value) {
    if (this.failWrites) throw new Error("quota");
    this.values.set(key, value);
  }
  removeItem(key) {
    if (this.failRemoves) throw new Error("disabled");
    this.values.delete(key);
  }
}

let id = 0;
let time = 0;
const storage = new MemoryStorage();
const presetStore = createLocalPresetStore({
  storageKey: countdownShareSchema.storageKey,
  toolId: countdownShareSchema.toolId,
  schemaVersion: countdownShareSchema.version,
  validateConfig: countdownShareSchema.validate,
  storage,
  createId: () => `preset-${++id}`,
  now: () => new Date(Date.UTC(2026, 0, 1, 0, 0, time++)),
});

equal(presetStore.read().records, [], "new preset store is empty");
check(!validatePresetName("   ").valid, "empty preset names are rejected");
check(!validatePresetName("x".repeat(LOCAL_PRESET_NAME_MAX_LENGTH + 1)).valid, "long preset names are rejected");
equal(validatePresetName("  Daily   focus  "), { valid: true, name: "Daily focus" }, "preset names are normalized");
check(!presetStore.save("Bad config", { durationSeconds: 0 }).ok, "invalid configurations are rejected before storage");
const savedA = presetStore.save("  Five minutes  ", countdownDefault);
check(savedA.ok, "a valid preset saves");
const savedB = presetStore.save("Five minutes", { durationSeconds: 600 });
check(savedB.ok, "duplicate preset names are allowed");
equal(presetStore.read().records.length, 2, "saved presets can be listed");
equal(presetStore.load("preset-1").ok, true, "a saved preset can be loaded by its internal identifier");
equal(presetStore.load("preset-1").ok && presetStore.load("preset-1").record.config, countdownDefault, "loading returns the validated configuration");
check(presetStore.rename("preset-1", "Short focus").ok, "a preset can be renamed");
equal(presetStore.read().records[0].name, "Short focus", "renamed preset persists");
check(!presetStore.rename("missing", "Name").ok, "renaming a missing preset fails safely");
check(presetStore.remove("preset-2").ok, "a preset can be deleted");
equal(presetStore.read().records.length, 1, "deletion preserves other presets");
check(!presetStore.remove("missing").ok, "deleting a missing preset fails safely");

for (let index = presetStore.read().records.length; index < LOCAL_PRESET_LIMIT; index += 1) {
  check(presetStore.save(`Preset ${index + 1}`, { durationSeconds: index + 1 }).ok, `preset ${index + 1} saves within limit`);
}
const overLimit = presetStore.save("Too many", countdownDefault);
check(!overLimit.ok && overLimit.code === "limit", "the per-tool preset limit is enforced");

storage.failWrites = true;
const quotaFailure = presetStore.rename("preset-1", "Write failure");
check(!quotaFailure.ok && quotaFailure.code === "storage", "quota or write failures are surfaced");
storage.failWrites = false;
storage.failReads = true;
check(presetStore.read().unavailable, "disabled storage reads are surfaced");
storage.failReads = false;
storage.failRemoves = true;
check(!presetStore.clear().ok, "disabled storage deletion is surfaced");
storage.failRemoves = false;

const corruptStorage = new MemoryStorage();
corruptStorage.setItem("test", "not json");
const corruptStore = createLocalPresetStore({
  storageKey: "test",
  toolId: countdownShareSchema.toolId,
  schemaVersion: 1,
  validateConfig: countdownShareSchema.validate,
  storage: corruptStorage,
});
equal(corruptStore.read().records, [], "corrupt JSON recovers to an empty store");
equal(corruptStore.read().recoveredInvalidRecords, 1, "corrupt JSON is reported");

const goodRecord = {
  id: "good",
  name: "Good",
  toolId: countdownShareSchema.toolId,
  schemaVersion: 1,
  config: countdownDefault,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
corruptStorage.setItem("test", JSON.stringify({ version: 1, records: [goodRecord, { ...goodRecord, id: "bad", config: { durationSeconds: 0 } }] }));
equal(corruptStore.read().records.map((record) => record.id), ["good"], "valid records survive corrupt siblings");
equal(corruptStore.read().recoveredInvalidRecords, 1, "corrupt sibling count is reported");
corruptStorage.setItem("test", JSON.stringify({ version: 1, records: [{ ...goodRecord, schemaVersion: 0 }] }));
equal(corruptStore.read().records, [], "stale record schema versions are discarded safely");

corruptStorage.setItem("test", JSON.stringify({ version: 99, records: [goodRecord] }));
equal(corruptStore.read().records, [], "unknown root versions fail closed");
corruptStorage.setItem("test", JSON.stringify({ v: 1, presets: [goodRecord] }));
check(corruptStore.read().migrated, "the documented legacy root shape is migrated");
equal(corruptStore.read().records[0].config, countdownDefault, "migration validates and preserves configuration");
check(corruptStore.save("After migration", { durationSeconds: 60 }).ok, "a mutation after migration writes the current root shape");
equal(JSON.parse(corruptStorage.getItem("test")).version, 1, "the migrated store is rewritten using the current version");

const isolatedStorage = new MemoryStorage();
const storeOne = createLocalPresetStore({
  storageKey: "tool-one",
  toolId: countdownShareSchema.toolId,
  schemaVersion: 1,
  validateConfig: countdownShareSchema.validate,
  storage: isolatedStorage,
});
const storeTwo = createLocalPresetStore({
  storageKey: "tool-two",
  toolId: hiitShareSchema.toolId,
  schemaVersion: 1,
  validateConfig: hiitShareSchema.validate,
  storage: isolatedStorage,
});
check(storeOne.save("<b>Rendered as text</b>", countdownDefault).ok, "unsafe-looking preset names remain inert stored text");
equal(storeTwo.read().records, [], "preset stores are isolated by tool key");

console.log(`Stage 6 share and preset tests passed (${assertions} assertions).`);
