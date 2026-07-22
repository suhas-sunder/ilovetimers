import type { ConfigurationValidation } from "./shareConfigurations";

export const LOCAL_PRESET_STORE_VERSION = 1 as const;
export const LOCAL_PRESET_LIMIT = 20;
export const LOCAL_PRESET_NAME_MAX_LENGTH = 40;

export type PresetRecord<T> = {
  id: string;
  name: string;
  toolId: string;
  schemaVersion: number;
  config: T;
  createdAt: string;
  updatedAt: string;
};

export type PresetStoreSnapshot<T> = {
  records: PresetRecord<T>[];
  recoveredInvalidRecords: number;
  migrated: boolean;
  unavailable: boolean;
};

export type PresetMutationResult<T> =
  | { ok: true; records: PresetRecord<T>[]; record?: PresetRecord<T> }
  | { ok: false; code: "invalid-name" | "invalid-config" | "limit" | "not-found" | "storage"; message: string };

export type PresetLoadResult<T> =
  | { ok: true; record: PresetRecord<T> }
  | { ok: false; code: "not-found" | "storage"; message: string };

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type PresetStoreOptions<T> = {
  storageKey: string;
  toolId: string;
  schemaVersion: number;
  validateConfig: (value: unknown) => ConfigurationValidation<T>;
  storage: StorageLike;
  now?: () => Date;
  createId?: () => string;
};

type PresetRoot<T> = {
  version: typeof LOCAL_PRESET_STORE_VERSION;
  records: PresetRecord<T>[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

export function normalizePresetName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validatePresetName(value: string) {
  const normalized = normalizePresetName(value);
  if (!normalized) return { valid: false as const, message: "Enter a preset name." };
  if (normalized.length > LOCAL_PRESET_NAME_MAX_LENGTH) {
    return { valid: false as const, message: `Preset names can use at most ${LOCAL_PRESET_NAME_MAX_LENGTH} characters.` };
  }
  return { valid: true as const, name: normalized };
}

function defaultId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function createValidatedRecord<T>(
  raw: unknown,
  options: Pick<PresetStoreOptions<T>, "toolId" | "schemaVersion" | "validateConfig">,
): PresetRecord<T> | null {
  if (!isRecord(raw)) return null;
  if (!hasExactKeys(raw, ["id", "name", "toolId", "schemaVersion", "config", "createdAt", "updatedAt"])) return null;
  const name = typeof raw.name === "string" ? validatePresetName(raw.name) : { valid: false as const, message: "Invalid" };
  const validation = options.validateConfig(raw.config);
  if (
    typeof raw.id !== "string" || raw.id.length < 1 || raw.id.length > 100 ||
    raw.toolId !== options.toolId || raw.schemaVersion !== options.schemaVersion ||
    !name.valid || !validation.valid || !isIsoDate(raw.createdAt) || !isIsoDate(raw.updatedAt)
  ) return null;
  return {
    id: raw.id,
    name: name.name,
    toolId: options.toolId,
    schemaVersion: options.schemaVersion,
    config: validation.config,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function parseRoot<T>(raw: string | null, options: PresetStoreOptions<T>): PresetStoreSnapshot<T> {
  if (!raw) return { records: [], recoveredInvalidRecords: 0, migrated: false, unavailable: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { records: [], recoveredInvalidRecords: 1, migrated: false, unavailable: false };

    const currentRecords = parsed.version === LOCAL_PRESET_STORE_VERSION && Array.isArray(parsed.records)
      ? parsed.records
      : null;
    const legacyRecords = parsed.v === LOCAL_PRESET_STORE_VERSION && Array.isArray(parsed.presets)
      ? parsed.presets
      : null;
    const source = currentRecords ?? legacyRecords;
    if (!source) return { records: [], recoveredInvalidRecords: 1, migrated: false, unavailable: false };

    const records: PresetRecord<T>[] = [];
    let recoveredInvalidRecords = 0;
    for (const item of source.slice(0, LOCAL_PRESET_LIMIT)) {
      const record = createValidatedRecord<T>(item, options);
      if (record && !records.some((candidate) => candidate.id === record.id)) records.push(record);
      else recoveredInvalidRecords += 1;
    }
    recoveredInvalidRecords += Math.max(0, source.length - LOCAL_PRESET_LIMIT);
    return { records, recoveredInvalidRecords, migrated: legacyRecords !== null, unavailable: false };
  } catch {
    return { records: [], recoveredInvalidRecords: 1, migrated: false, unavailable: false };
  }
}

export function createLocalPresetStore<T>(options: PresetStoreOptions<T>) {
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? defaultId;

  function read(): PresetStoreSnapshot<T> {
    try {
      return parseRoot(options.storage.getItem(options.storageKey), options);
    } catch {
      return { records: [], recoveredInvalidRecords: 0, migrated: false, unavailable: true };
    }
  }

  function write(records: PresetRecord<T>[]): PresetMutationResult<T> {
    try {
      const root: PresetRoot<T> = { version: LOCAL_PRESET_STORE_VERSION, records };
      options.storage.setItem(options.storageKey, JSON.stringify(root));
      return { ok: true, records };
    } catch {
      return {
        ok: false,
        code: "storage",
        message: "Presets could not be saved in this browser. Storage may be disabled or full.",
      };
    }
  }

  function save(name: string, config: T): PresetMutationResult<T> {
    const nameResult = validatePresetName(name);
    if (!nameResult.valid) return { ok: false, code: "invalid-name", message: nameResult.message };
    const validation = options.validateConfig(config);
    if (!validation.valid) return { ok: false, code: "invalid-config", message: validation.message };
    const snapshot = read();
    if (snapshot.unavailable) return { ok: false, code: "storage", message: "Browser storage is unavailable." };
    if (snapshot.records.length >= LOCAL_PRESET_LIMIT) {
      return { ok: false, code: "limit", message: `Delete a preset before saving more than ${LOCAL_PRESET_LIMIT}.` };
    }
    const timestamp = now().toISOString();
    const record: PresetRecord<T> = {
      id: createId(),
      name: nameResult.name,
      toolId: options.toolId,
      schemaVersion: options.schemaVersion,
      config: validation.config,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const result = write([...snapshot.records, record]);
    return result.ok ? { ...result, record } : result;
  }

  function rename(id: string, name: string): PresetMutationResult<T> {
    const nameResult = validatePresetName(name);
    if (!nameResult.valid) return { ok: false, code: "invalid-name", message: nameResult.message };
    const snapshot = read();
    if (snapshot.unavailable) return { ok: false, code: "storage", message: "Browser storage is unavailable." };
    const index = snapshot.records.findIndex((record) => record.id === id);
    if (index < 0) return { ok: false, code: "not-found", message: "That preset no longer exists." };
    const records = [...snapshot.records];
    records[index] = { ...records[index], name: nameResult.name, updatedAt: now().toISOString() };
    return write(records);
  }

  function load(id: string): PresetLoadResult<T> {
    const snapshot = read();
    if (snapshot.unavailable) return { ok: false, code: "storage", message: "Browser storage is unavailable." };
    const record = snapshot.records.find((candidate) => candidate.id === id);
    return record
      ? { ok: true, record }
      : { ok: false, code: "not-found", message: "That preset no longer exists." };
  }

  function remove(id: string): PresetMutationResult<T> {
    const snapshot = read();
    if (snapshot.unavailable) return { ok: false, code: "storage", message: "Browser storage is unavailable." };
    if (!snapshot.records.some((record) => record.id === id)) {
      return { ok: false, code: "not-found", message: "That preset no longer exists." };
    }
    return write(snapshot.records.filter((record) => record.id !== id));
  }

  function clear(): PresetMutationResult<T> {
    try {
      options.storage.removeItem(options.storageKey);
      return { ok: true, records: [] };
    } catch {
      return { ok: false, code: "storage", message: "Presets could not be deleted from this browser." };
    }
  }

  return { read, save, load, rename, remove, clear };
}
