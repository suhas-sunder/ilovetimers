export const SHARE_CONFIGURATION_VERSION = 1 as const;
export const SHARE_URL_MAX_LENGTH = 1800;
export const SHARE_CANONICAL_ORIGIN = "https://www.ilovetimers.com";

export type ShareParseResult<T> =
  | { status: "none" }
  | { status: "valid"; config: T; legacy: boolean }
  | { status: "invalid"; message: string };

export type ConfigurationValidation<T> =
  | { valid: true; config: T }
  | { valid: false; message: string };

export type ShareConfigurationSchema<T> = {
  toolId: string;
  path: string;
  version: typeof SHARE_CONFIGURATION_VERSION;
  storageKey: string | null;
  parse: (input: URLSearchParams | string, fallback?: Partial<T>) => ShareParseResult<T>;
  validate: (value: unknown) => ConfigurationValidation<T>;
  buildUrl: (config: T, origin?: string) => string;
};

export type CountdownShareConfig = {
  durationSeconds: number;
};

export type PomodoroShareConfig = {
  workMinutes: number;
  breakMinutes: number;
  cycles: number;
  longBreakEnabled: boolean;
  longBreakMinutes: number;
  autoAdvance: boolean;
  sound: boolean;
  finalCountdownBeeps: boolean;
};

export type HiitShareConfig = {
  warmupSeconds: number;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  cooldownSeconds: number;
  sound: boolean;
  finalCountdownBeeps: boolean;
};

export type TimeZoneMeetingPlannerShareConfig = {
  date: string;
  durationMinutes: number;
  workStartHour: number;
  workEndHour: number;
  zones: string[];
};

export type TimeZoneConverterShareConfig = {
  fromZone: string;
  toZone: string;
  date: string;
  time: string;
  showSeconds: boolean;
};

type SchemaOptions<T> = {
  toolId: string;
  path: string;
  storageKey: string | null;
  parameterNames: readonly string[];
  allowLegacyWithoutVersion?: boolean;
  decode: (params: URLSearchParams, fallback: Partial<T> | undefined, legacy: boolean) => T;
  encode: (config: T) => Array<readonly [string, string]>;
  validate: (value: unknown) => ConfigurationValidation<T>;
};

function asParams(input: URLSearchParams | string) {
  if (input instanceof URLSearchParams) return input;
  const queryIndex = input.indexOf("?");
  const raw = queryIndex >= 0 ? input.slice(queryIndex + 1) : input;
  return new URLSearchParams(raw.split("#", 1)[0]);
}

function makeSchema<T>(options: SchemaOptions<T>): ShareConfigurationSchema<T> {
  const recognized = new Set(["v", ...options.parameterNames]);

  return {
    toolId: options.toolId,
    path: options.path,
    version: SHARE_CONFIGURATION_VERSION,
    storageKey: options.storageKey,
    validate: options.validate,
    parse(input, fallback) {
      const params = asParams(input);
      const hasConfiguration = [...params.keys()].some((key) => recognized.has(key));
      if (!hasConfiguration) return { status: "none" };

      for (const key of recognized) {
        if (params.getAll(key).length > 1) {
          return { status: "invalid", message: `The shared setup repeats the ${key} setting.` };
        }
      }

      const rawVersion = params.get("v");
      const legacy = rawVersion === null && options.allowLegacyWithoutVersion === true;
      if (!legacy && rawVersion !== String(SHARE_CONFIGURATION_VERSION)) {
        return {
          status: "invalid",
          message: "This shared setup uses an unsupported configuration version.",
        };
      }

      try {
        const decoded = options.decode(params, fallback, legacy);
        const validation = options.validate(decoded);
        return validation.valid
          ? { status: "valid", config: validation.config, legacy }
          : { status: "invalid", message: validation.message };
      } catch (error) {
        return {
          status: "invalid",
          message: error instanceof Error ? error.message : "The shared setup is invalid.",
        };
      }
    },
    buildUrl(config, origin = SHARE_CANONICAL_ORIGIN) {
      const validation = options.validate(config);
      if (!validation.valid) throw new Error(validation.message);
      const url = new URL(options.path, origin);
      url.searchParams.set("v", String(SHARE_CONFIGURATION_VERSION));
      for (const [key, value] of options.encode(validation.config)) {
        url.searchParams.set(key, value);
      }
      const output = url.toString();
      if (output.length > SHARE_URL_MAX_LENGTH) {
        throw new Error(`The shared setup exceeds the ${SHARE_URL_MAX_LENGTH}-character URL limit.`);
      }
      return output;
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function validConfig<T>(config: T): ConfigurationValidation<T> {
  return { valid: true, config };
}

function invalidConfig<T>(message: string): ConfigurationValidation<T> {
  return { valid: false, message };
}

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum;
}

function parseInteger(params: URLSearchParams, key: string, fallback: number) {
  const raw = params.get(key);
  if (raw === null) return fallback;
  if (!/^-?\d+$/.test(raw)) throw new Error(`The ${key} setting must be a whole number.`);
  return Number(raw);
}

function parseBoolean(params: URLSearchParams, key: string, fallback: boolean) {
  const raw = params.get(key);
  if (raw === null) return fallback;
  if (raw !== "0" && raw !== "1") throw new Error(`The ${key} setting must be 0 or 1.`);
  return raw === "1";
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validTime(value: unknown, showSeconds: boolean): value is string {
  if (typeof value !== "string") return false;
  const match = value.match(showSeconds ? /^(\d{2}):(\d{2}):(\d{2})$/ : /^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] === undefined ? 0 : Number(match[3]);
  return hour <= 23 && minute <= 59 && second <= 59;
}

const timeZoneValidity = new Map<string, boolean>();

export function isValidShareTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 1 || value.length > 64) return false;
  const cached = timeZoneValidity.get(value);
  if (cached !== undefined) return cached;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date(0));
    timeZoneValidity.set(value, true);
    return true;
  } catch {
    timeZoneValidity.set(value, false);
    return false;
  }
}

const COUNTDOWN_DEFAULTS: CountdownShareConfig = { durationSeconds: 300 };

export const countdownShareSchema = makeSchema<CountdownShareConfig>({
  toolId: "countdown-timer",
  path: "/countdown-timer",
  storageKey: "ilovetimers:presets:countdown-timer:v1",
  parameterNames: ["duration"],
  decode: (params) => ({
    durationSeconds: parseInteger(params, "duration", COUNTDOWN_DEFAULTS.durationSeconds),
  }),
  encode: (config) =>
    config.durationSeconds === COUNTDOWN_DEFAULTS.durationSeconds
      ? []
      : [["duration", String(config.durationSeconds)]],
  validate(value) {
    if (!isRecord(value) || !hasExactKeys(value, ["durationSeconds"])) {
      return invalidConfig("The countdown setup has unexpected fields.");
    }
    if (!integer(value.durationSeconds, 1, 599999)) {
      return invalidConfig("Countdown duration must be between 1 and 599999 seconds.");
    }
    return validConfig({ durationSeconds: value.durationSeconds as number });
  },
});

const POMODORO_DEFAULTS: PomodoroShareConfig = {
  workMinutes: 25,
  breakMinutes: 5,
  cycles: 4,
  longBreakEnabled: true,
  longBreakMinutes: 15,
  autoAdvance: true,
  sound: true,
  finalCountdownBeeps: false,
};

export const pomodoroShareSchema = makeSchema<PomodoroShareConfig>({
  toolId: "pomodoro-timer",
  path: "/pomodoro-timer",
  storageKey: "ilovetimers:presets:pomodoro-timer:v1",
  parameterNames: ["work", "break", "cycles", "long", "longDuration", "auto", "sound", "countdown"],
  decode: (params) => ({
    workMinutes: parseInteger(params, "work", POMODORO_DEFAULTS.workMinutes),
    breakMinutes: parseInteger(params, "break", POMODORO_DEFAULTS.breakMinutes),
    cycles: parseInteger(params, "cycles", POMODORO_DEFAULTS.cycles),
    longBreakEnabled: parseBoolean(params, "long", POMODORO_DEFAULTS.longBreakEnabled),
    longBreakMinutes: parseInteger(params, "longDuration", POMODORO_DEFAULTS.longBreakMinutes),
    autoAdvance: parseBoolean(params, "auto", POMODORO_DEFAULTS.autoAdvance),
    sound: parseBoolean(params, "sound", POMODORO_DEFAULTS.sound),
    finalCountdownBeeps: parseBoolean(params, "countdown", POMODORO_DEFAULTS.finalCountdownBeeps),
  }),
  encode(config) {
    const pairs: Array<readonly [string, string]> = [];
    if (config.workMinutes !== POMODORO_DEFAULTS.workMinutes) pairs.push(["work", String(config.workMinutes)]);
    if (config.breakMinutes !== POMODORO_DEFAULTS.breakMinutes) pairs.push(["break", String(config.breakMinutes)]);
    if (config.cycles !== POMODORO_DEFAULTS.cycles) pairs.push(["cycles", String(config.cycles)]);
    if (config.longBreakEnabled !== POMODORO_DEFAULTS.longBreakEnabled) pairs.push(["long", config.longBreakEnabled ? "1" : "0"]);
    if (config.longBreakMinutes !== POMODORO_DEFAULTS.longBreakMinutes) pairs.push(["longDuration", String(config.longBreakMinutes)]);
    if (config.autoAdvance !== POMODORO_DEFAULTS.autoAdvance) pairs.push(["auto", config.autoAdvance ? "1" : "0"]);
    if (config.sound !== POMODORO_DEFAULTS.sound) pairs.push(["sound", config.sound ? "1" : "0"]);
    if (config.finalCountdownBeeps !== POMODORO_DEFAULTS.finalCountdownBeeps) pairs.push(["countdown", config.finalCountdownBeeps ? "1" : "0"]);
    return pairs;
  },
  validate(value) {
    const keys = ["workMinutes", "breakMinutes", "cycles", "longBreakEnabled", "longBreakMinutes", "autoAdvance", "sound", "finalCountdownBeeps"];
    if (!isRecord(value) || !hasExactKeys(value, keys)) return invalidConfig("The Pomodoro setup has unexpected fields.");
    if (!integer(value.workMinutes, 1, 180)) return invalidConfig("Work time must be between 1 and 180 minutes.");
    if (!integer(value.breakMinutes, 1, 60)) return invalidConfig("Break time must be between 1 and 60 minutes.");
    if (!integer(value.cycles, 1, 12)) return invalidConfig("Cycles must be between 1 and 12.");
    if (!integer(value.longBreakMinutes, 1, 90)) return invalidConfig("Long break time must be between 1 and 90 minutes.");
    for (const key of ["longBreakEnabled", "autoAdvance", "sound", "finalCountdownBeeps"] as const) {
      if (typeof value[key] !== "boolean") return invalidConfig(`The ${key} setting must be true or false.`);
    }
    return validConfig(value as PomodoroShareConfig);
  },
});

const HIIT_DEFAULTS: HiitShareConfig = {
  warmupSeconds: 30,
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
  cooldownSeconds: 30,
  sound: true,
  finalCountdownBeeps: false,
};

export const hiitShareSchema = makeSchema<HiitShareConfig>({
  toolId: "hiit-timer",
  path: "/hiit-timer",
  storageKey: "ilovetimers:presets:hiit-timer:v1",
  parameterNames: ["warmup", "work", "rest", "rounds", "cooldown", "sound", "countdown"],
  decode: (params) => ({
    warmupSeconds: parseInteger(params, "warmup", HIIT_DEFAULTS.warmupSeconds),
    workSeconds: parseInteger(params, "work", HIIT_DEFAULTS.workSeconds),
    restSeconds: parseInteger(params, "rest", HIIT_DEFAULTS.restSeconds),
    rounds: parseInteger(params, "rounds", HIIT_DEFAULTS.rounds),
    cooldownSeconds: parseInteger(params, "cooldown", HIIT_DEFAULTS.cooldownSeconds),
    sound: parseBoolean(params, "sound", HIIT_DEFAULTS.sound),
    finalCountdownBeeps: parseBoolean(params, "countdown", HIIT_DEFAULTS.finalCountdownBeeps),
  }),
  encode(config) {
    const pairs: Array<readonly [string, string]> = [];
    if (config.warmupSeconds !== HIIT_DEFAULTS.warmupSeconds) pairs.push(["warmup", String(config.warmupSeconds)]);
    if (config.workSeconds !== HIIT_DEFAULTS.workSeconds) pairs.push(["work", String(config.workSeconds)]);
    if (config.restSeconds !== HIIT_DEFAULTS.restSeconds) pairs.push(["rest", String(config.restSeconds)]);
    if (config.rounds !== HIIT_DEFAULTS.rounds) pairs.push(["rounds", String(config.rounds)]);
    if (config.cooldownSeconds !== HIIT_DEFAULTS.cooldownSeconds) pairs.push(["cooldown", String(config.cooldownSeconds)]);
    if (config.sound !== HIIT_DEFAULTS.sound) pairs.push(["sound", config.sound ? "1" : "0"]);
    if (config.finalCountdownBeeps !== HIIT_DEFAULTS.finalCountdownBeeps) pairs.push(["countdown", config.finalCountdownBeeps ? "1" : "0"]);
    return pairs;
  },
  validate(value) {
    const keys = ["warmupSeconds", "workSeconds", "restSeconds", "rounds", "cooldownSeconds", "sound", "finalCountdownBeeps"];
    if (!isRecord(value) || !hasExactKeys(value, keys)) return invalidConfig("The HIIT setup has unexpected fields.");
    if (!integer(value.warmupSeconds, 0, 600)) return invalidConfig("Warm-up time must be between 0 and 600 seconds.");
    if (!integer(value.workSeconds, 1, 600)) return invalidConfig("Work time must be between 1 and 600 seconds.");
    if (!integer(value.restSeconds, 0, 600)) return invalidConfig("Rest time must be between 0 and 600 seconds.");
    if (!integer(value.rounds, 1, 50)) return invalidConfig("Rounds must be between 1 and 50.");
    if (!integer(value.cooldownSeconds, 0, 600)) return invalidConfig("Cool-down time must be between 0 and 600 seconds.");
    if (typeof value.sound !== "boolean" || typeof value.finalCountdownBeeps !== "boolean") {
      return invalidConfig("Cue settings must be true or false.");
    }
    return validConfig(value as HiitShareConfig);
  },
});

const MEETING_DEFAULTS: Omit<TimeZoneMeetingPlannerShareConfig, "date"> = {
  durationMinutes: 60,
  workStartHour: 9,
  workEndHour: 17,
  zones: ["UTC", "America/New_York", "Europe/London"],
};

export const timeZoneMeetingPlannerShareSchema = makeSchema<TimeZoneMeetingPlannerShareConfig>({
  toolId: "time-zone-meeting-planner",
  path: "/time-zone-meeting-planner",
  storageKey: "ilovetimers:presets:time-zone-meeting-planner:v1",
  parameterNames: ["date", "duration", "start", "end", "zones"],
  decode(params, fallback) {
    const date = params.get("date") ?? fallback?.date;
    if (!date) throw new Error("The shared meeting setup needs a date.");
    const rawZones = params.get("zones");
    return {
      date,
      durationMinutes: parseInteger(params, "duration", MEETING_DEFAULTS.durationMinutes),
      workStartHour: parseInteger(params, "start", MEETING_DEFAULTS.workStartHour),
      workEndHour: parseInteger(params, "end", MEETING_DEFAULTS.workEndHour),
      zones: rawZones === null ? [...MEETING_DEFAULTS.zones] : rawZones.split(","),
    };
  },
  encode(config) {
    const pairs: Array<readonly [string, string]> = [["date", config.date]];
    if (config.durationMinutes !== MEETING_DEFAULTS.durationMinutes) pairs.push(["duration", String(config.durationMinutes)]);
    if (config.workStartHour !== MEETING_DEFAULTS.workStartHour) pairs.push(["start", String(config.workStartHour)]);
    if (config.workEndHour !== MEETING_DEFAULTS.workEndHour) pairs.push(["end", String(config.workEndHour)]);
    if (config.zones.join(",") !== MEETING_DEFAULTS.zones.join(",")) pairs.push(["zones", config.zones.join(",")]);
    return pairs;
  },
  validate(value) {
    const keys = ["date", "durationMinutes", "workStartHour", "workEndHour", "zones"];
    if (!isRecord(value) || !hasExactKeys(value, keys)) return invalidConfig("The meeting setup has unexpected fields.");
    if (!validDate(value.date)) return invalidConfig("The meeting date is invalid.");
    if (!integer(value.durationMinutes, 15, 720) || (value.durationMinutes as number) % 15 !== 0) {
      return invalidConfig("Meeting duration must be 15 to 720 minutes in 15-minute steps.");
    }
    if (!integer(value.workStartHour, 0, 23) || !integer(value.workEndHour, 1, 24)) {
      return invalidConfig("Work hours must use valid whole hours.");
    }
    if ((value.workEndHour as number) <= (value.workStartHour as number)) {
      return invalidConfig("Workday end must be later than workday start.");
    }
    if (!Array.isArray(value.zones) || value.zones.length < 1 || value.zones.length > 8) {
      return invalidConfig("A meeting setup must contain 1 to 8 time zones.");
    }
    if (!value.zones.every(isValidShareTimeZone) || new Set(value.zones).size !== value.zones.length) {
      return invalidConfig("Meeting time zones must be valid and unique.");
    }
    return validConfig({
      date: value.date,
      durationMinutes: value.durationMinutes as number,
      workStartHour: value.workStartHour as number,
      workEndHour: value.workEndHour as number,
      zones: [...value.zones] as string[],
    });
  },
});

export const timeZoneConverterShareSchema = makeSchema<TimeZoneConverterShareConfig>({
  toolId: "time-zone-converter",
  path: "/time-zone-converter",
  storageKey: null,
  parameterNames: ["from", "to", "date", "time", "sec"],
  allowLegacyWithoutVersion: true,
  decode(params, fallback, legacy) {
    if (!legacy && ["from", "to", "date", "time", "sec"].some((key) => params.get(key) === null)) {
      throw new Error("The versioned shared conversion is missing a required setting.");
    }
    const fromZone = params.get("from") ?? fallback?.fromZone;
    const toZone = params.get("to") ?? fallback?.toZone;
    const date = params.get("date") ?? fallback?.date;
    const rawSeconds = params.get("sec");
    const showSeconds = rawSeconds === null ? (fallback?.showSeconds ?? false) : parseBoolean(params, "sec", false);
    let time = params.get("time") ?? fallback?.time;
    if (time && showSeconds && /^\d{2}:\d{2}$/.test(time)) time = `${time}:00`;
    if (time && !showSeconds && /^\d{2}:\d{2}:\d{2}$/.test(time)) time = time.slice(0, 5);
    if (!fromZone || !toZone || !date || !time) {
      throw new Error("The shared conversion is missing a required setting.");
    }
    return { fromZone, toZone, date, time, showSeconds };
  },
  encode: (config) => [
    ["from", config.fromZone],
    ["to", config.toZone],
    ["date", config.date],
    ["time", config.time],
    ["sec", config.showSeconds ? "1" : "0"],
  ],
  validate(value) {
    const keys = ["fromZone", "toZone", "date", "time", "showSeconds"];
    if (!isRecord(value) || !hasExactKeys(value, keys)) return invalidConfig("The conversion setup has unexpected fields.");
    if (!isValidShareTimeZone(value.fromZone) || !isValidShareTimeZone(value.toZone)) {
      return invalidConfig("The conversion setup contains an invalid time zone.");
    }
    if (!validDate(value.date)) return invalidConfig("The conversion date is invalid.");
    if (typeof value.showSeconds !== "boolean" || !validTime(value.time, value.showSeconds)) {
      return invalidConfig("The conversion time is invalid.");
    }
    return validConfig(value as TimeZoneConverterShareConfig);
  },
});

export const SHARE_SCHEMAS = {
  countdown: countdownShareSchema,
  pomodoro: pomodoroShareSchema,
  hiit: hiitShareSchema,
  timeZoneMeetingPlanner: timeZoneMeetingPlannerShareSchema,
  timeZoneConverter: timeZoneConverterShareSchema,
} as const;
