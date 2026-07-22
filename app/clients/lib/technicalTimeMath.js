const MAX_DATE_MS = 8_640_000_000_000_000;

/** @param {number} year @param {number} month @param {number} day */
export function isValidCalendarDate(year, month, day) {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** @param {string} value */
export function parseUtcDateTime(value) {
  const match =
    /^([+-]?\d{4,6})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
      value.trim(),
    );
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText = "0"] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (
    !isValidCalendarDate(year, month, day) ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59 ||
    !Number.isInteger(second) ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }
  const milliseconds = Date.UTC(year, month - 1, day, hour, minute, second);
  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime())) return null;
  return date;
}

/** @param {string} raw */
export function detectUnixTimestampUnit(raw) {
  const normalized = raw.trim().replace(/^[+-]/, "");
  const integerPart = normalized.split(".")[0].replace(/[,_]/g, "");
  if (!/^\d+$/.test(integerPart)) return null;
  if (integerPart.length >= 15) return "microseconds";
  if (integerPart.length >= 12) return "milliseconds";
  return "seconds";
}

/**
 * @param {string} rawValue
 * @param {"auto"|"seconds"|"milliseconds"|"microseconds"} mode
 */
export function parseUnixTimestamp(rawValue, mode = "auto") {
  const trimmed = rawValue.trim().replace(/,/g, "").replace(/_/g, "");
  if (!trimmed) return { ok: false, error: "Enter a Unix timestamp to convert." };
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) {
    return { ok: false, error: "That timestamp is not a valid number." };
  }
  const numericValue = Number(trimmed);
  if (!Number.isFinite(numericValue)) {
    return { ok: false, error: "That timestamp is not a valid number." };
  }
  const unit = mode === "auto" ? detectUnixTimestampUnit(trimmed) : mode;
  if (!unit) return { ok: false, error: "That timestamp is not a valid number." };
  const rawMilliseconds =
    unit === "seconds"
      ? numericValue * 1000
      : unit === "microseconds"
        ? numericValue / 1000
        : numericValue;
  if (!Number.isFinite(rawMilliseconds) || Math.abs(rawMilliseconds) > MAX_DATE_MS) {
    return {
      ok: false,
      error: "That timestamp is outside the range this browser can display.",
    };
  }
  const milliseconds = Math.trunc(rawMilliseconds);
  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime())) {
    return {
      ok: false,
      error: "That timestamp is outside the range this browser can display.",
    };
  }
  return { ok: true, date, milliseconds, unit, truncated: rawMilliseconds !== milliseconds };
}

/** @param {number} bpm */
export function metronomeBeatIntervalSeconds(bpm) {
  if (!Number.isFinite(bpm) || bpm <= 0) return null;
  return 60 / bpm;
}

/**
 * @param {number} bpm
 * @param {1|2|3|4} subdivision
 */
export function metronomeSubdivisionIntervalSeconds(bpm, subdivision) {
  const beat = metronomeBeatIntervalSeconds(bpm);
  if (beat === null || ![1, 2, 3, 4].includes(subdivision)) return null;
  return beat / subdivision;
}

/** @param {number[]} values */
export function summarizeReactionTimes(values) {
  const valid = values.filter((value) => Number.isFinite(value) && value >= 0);
  if (!valid.length) return { best: null, mean: null, median: null, sampleDeviation: null };
  const mean = valid.reduce((sum, value) => sum + value, 0) / valid.length;
  const sorted = [...valid].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  const sampleDeviation =
    valid.length < 2
      ? null
      : Math.sqrt(
          valid.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
            (valid.length - 1),
        );
  return { best: Math.min(...valid), mean, median, sampleDeviation };
}

/** @param {"idle"|"waiting"|"go"|"falseStart"|"done"} phase */
export function reactionPressAction(phase) {
  if (phase === "waiting") return "false-start";
  if (phase === "go") return "record";
  if (phase === "done") return "ignore";
  return "start";
}

/** @param {unknown} value */
export function normalizeAstronomicalPreferences(value) {
  if (!value || typeof value !== "object") return { lat: null, lon: null, tz: null };
  const source = /** @type {{lat?: unknown, lon?: unknown, tz?: unknown}} */ (value);
  const lat =
    typeof source.lat === "number" && Number.isFinite(source.lat) && source.lat >= -90 && source.lat <= 90
      ? source.lat
      : null;
  const lon =
    typeof source.lon === "number" && Number.isFinite(source.lon) && source.lon >= -180 && source.lon <= 180
      ? source.lon
      : null;
  let tz = null;
  if (typeof source.tz === "string" && source.tz.trim()) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: source.tz }).format(0);
      tz = source.tz;
    } catch {
      tz = null;
    }
  }
  return { lat: lat !== null && lon !== null ? lat : null, lon: lat !== null && lon !== null ? lon : null, tz };
}

/** @param {string | null} raw */
export function parseAstronomicalPreferences(raw) {
  if (raw === null) {
    return {
      preferences: { lat: null, lon: null, tz: null },
      corrupt: false,
    };
  }
  try {
    return {
      preferences: normalizeAstronomicalPreferences(JSON.parse(raw)),
      corrupt: false,
    };
  } catch {
    return {
      preferences: { lat: null, lon: null, tz: null },
      corrupt: true,
    };
  }
}

/** @param {number} degrees */
const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
/** @param {number} radians */
const radiansToDegrees = (radians) => (radians * 180) / Math.PI;

/**
 * Estimate sunrise and sunset as UTC instants for a local calendar date.
 * IANA-zone date matching preserves events that fall on the previous or next UTC date.
 * @param {{year:number, month:number, day:number, latitude:number, longitude:number, timeZone:string}} input
 */
export function estimateSunEventsUtc(input) {
  const { year, month, day, latitude, longitude, timeZone } = input;
  let validTimeZone = true;
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format(0);
  } catch {
    validTimeZone = false;
  }
  if (
    !isValidCalendarDate(year, month, day) ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !validTimeZone
  ) {
    return { sunrise: null, sunset: null, validInput: false };
  }

  const zenith = 90.833;
  const dayOfYear = Math.floor(
    (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000,
  );
  const longitudeHour = longitude / 15;

  /** @param {boolean} isSunrise */
  const calculate = (isSunrise) => {
    const approximateTime =
      dayOfYear + ((isSunrise ? 6 : 18) - longitudeHour) / 24;
    const meanAnomaly = 0.9856 * approximateTime - 3.289;
    let trueLongitude =
      meanAnomaly +
      1.916 * Math.sin(degreesToRadians(meanAnomaly)) +
      0.02 * Math.sin(degreesToRadians(2 * meanAnomaly)) +
      282.634;
    trueLongitude = (trueLongitude + 360) % 360;

    let rightAscension = radiansToDegrees(
      Math.atan(0.91764 * Math.tan(degreesToRadians(trueLongitude))),
    );
    rightAscension = (rightAscension + 360) % 360;
    const longitudeQuadrant = Math.floor(trueLongitude / 90) * 90;
    const ascensionQuadrant = Math.floor(rightAscension / 90) * 90;
    rightAscension =
      (rightAscension + longitudeQuadrant - ascensionQuadrant) / 15;

    const sinDeclination =
      0.39782 * Math.sin(degreesToRadians(trueLongitude));
    const cosDeclination = Math.cos(Math.asin(sinDeclination));
    const cosHourAngle =
      (Math.cos(degreesToRadians(zenith)) -
        sinDeclination * Math.sin(degreesToRadians(latitude))) /
      (cosDeclination * Math.cos(degreesToRadians(latitude)));
    if (cosHourAngle > 1 || cosHourAngle < -1) return null;

    const hourAngleDegrees = isSunrise
      ? 360 - radiansToDegrees(Math.acos(cosHourAngle))
      : radiansToDegrees(Math.acos(cosHourAngle));
    const localMeanTime =
      hourAngleDegrees / 15 +
      rightAscension -
      0.06571 * approximateTime -
      6.622;
    const normalizedUtcHour =
      ((localMeanTime - longitudeHour) % 24 + 24) % 24;
    const base = Date.UTC(year, month - 1, day) + normalizedUtcHour * 3_600_000;
    for (const dayOffset of [-1, 0, 1]) {
      const candidate = new Date(base + dayOffset * 86_400_000);
      const parts = zonedParts(candidate, timeZone);
      if (
        parts.year === year &&
        parts.month === month &&
        parts.day === day
      ) {
        return candidate;
      }
    }
    return null;
  };

  return {
    sunrise: calculate(true),
    sunset: calculate(false),
    validInput: true,
  };
}

export const SYNODIC_MONTH_DAYS = 29.530588853;
export const REFERENCE_NEW_MOON_UTC_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

/** @param {number | Date} value */
export function estimateMoonCycle(value) {
  const milliseconds = value instanceof Date ? value.getTime() : value;
  if (!Number.isFinite(milliseconds)) return null;
  const days = (milliseconds - REFERENCE_NEW_MOON_UTC_MS) / 86_400_000;
  const ageDays =
    ((days % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const phaseFraction = ageDays / SYNODIC_MONTH_DAYS;
  const illuminationFraction =
    0.5 * (1 - Math.cos(2 * Math.PI * phaseFraction));
  return { ageDays, phaseFraction, illuminationFraction };
}

/**
 * @typedef {{year:number,month:number,day:number,hour:number,minute:number,second:number}} WallTime
 */

/** @param {Date} date @param {string} timeZone */
function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  /** @param {string} type */
  const get = (type) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** @param {WallTime} left @param {WallTime} right */
function sameWallTime(left, right) {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.second === right.second
  );
}

/**
 * Resolve a wall time against runtime IANA time-zone data.
 * The earlier instant is first when a fall-back transition creates two matches.
 * @param {WallTime & {timeZone:string}} input
 */
export function resolveZonedWallTime(input) {
  const desired = {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    second: input.second,
  };
  if (
    !isValidCalendarDate(desired.year, desired.month, desired.day) ||
    !Number.isInteger(desired.hour) ||
    desired.hour < 0 ||
    desired.hour > 23 ||
    !Number.isInteger(desired.minute) ||
    desired.minute < 0 ||
    desired.minute > 59 ||
    !Number.isInteger(desired.second) ||
    desired.second < 0 ||
    desired.second > 59
  ) {
    return { status: "invalid", instants: [] };
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: input.timeZone }).format(0);
  } catch {
    return { status: "invalid-zone", instants: [] };
  }
  const desiredUtcMs = Date.UTC(
    desired.year,
    desired.month - 1,
    desired.day,
    desired.hour,
    desired.minute,
    desired.second,
  );
  const offsets = new Set();
  for (const hours of [-168, -48, -24, -12, 0, 12, 24, 48, 168]) {
    const probe = desiredUtcMs + hours * 3_600_000;
    const parts = zonedParts(new Date(probe), input.timeZone);
    const renderedUtcMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    offsets.add(renderedUtcMs - probe);
  }
  const matches = [...offsets]
    .map((offset) => desiredUtcMs - offset)
    .filter((candidate) => sameWallTime(zonedParts(new Date(candidate), input.timeZone), desired))
    .filter((candidate, index, all) => all.indexOf(candidate) === index)
    .sort((a, b) => a - b)
    .map((milliseconds) => new Date(milliseconds));
  if (!matches.length) return { status: "nonexistent", instants: [] };
  return {
    status: matches.length > 1 ? "ambiguous" : "valid",
    instants: matches,
  };
}
