import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  createLocalPresetStore,
  LOCAL_PRESET_LIMIT,
  LOCAL_PRESET_NAME_MAX_LENGTH,
  type PresetRecord,
} from "~/clients/lib/localPresetStore";
import type { ShareConfigurationSchema } from "~/clients/lib/shareConfigurations";
import { Button, Field, Select, SettingGroup } from "~/clients/components/ui/foundation";

type SharePresetPanelProps<T> = {
  schema: ShareConfigurationSchema<T>;
  currentConfig: T;
  onApply: (config: T) => void;
  loadDisabled?: boolean;
  loadDisabledReason?: string;
  sharedFallback?: Partial<T>;
};

export function SharePresetPanel<T>({
  schema,
  currentConfig,
  onApply,
  loadDisabled = false,
  loadDisabledReason = "Pause or reset the active session before loading a setup.",
  sharedFallback,
}: SharePresetPanelProps<T>) {
  const [records, setRecords] = useState<PresetRecord<T>[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [manualLink, setManualLink] = useState("");
  const storeRef = useRef<ReturnType<typeof createLocalPresetStore<T>> | null>(null);
  const loadedSharedRef = useRef(false);

  useEffect(() => {
    if (schema.storageKey === null) return;
    try {
      const store = createLocalPresetStore({
        storageKey: schema.storageKey,
        toolId: schema.toolId,
        schemaVersion: schema.version,
        validateConfig: schema.validate,
        storage: window.localStorage,
      });
      storeRef.current = store;
      const snapshot = store.read();
      if (snapshot.unavailable) {
        setStatus("Local presets are unavailable in this browser.");
        return;
      }
      setRecords(snapshot.records);
      if (snapshot.records[0]) {
        setSelectedId(snapshot.records[0].id);
        setName(snapshot.records[0].name);
      }
      if (snapshot.recoveredInvalidRecords > 0) {
        setStatus(`Ignored ${snapshot.recoveredInvalidRecords} invalid local preset ${snapshot.recoveredInvalidRecords === 1 ? "record" : "records"}.`);
      } else if (snapshot.migrated) {
        setStatus("Older local presets were loaded and will use the current format after your next change.");
      }
    } catch {
      setStatus("Local presets are unavailable in this browser.");
    }
  }, [schema]);

  useEffect(() => {
    if (loadedSharedRef.current) return;
    loadedSharedRef.current = true;
    const result = schema.parse(window.location.search, sharedFallback);
    if (result.status === "valid") {
      onApply(result.config);
      setStatus(result.legacy ? "Loaded a compatible older shared setup. Review it before starting." : "Loaded the shared setup. Review it before starting.");
    } else if (result.status === "invalid") {
      setStatus(`${result.message} The tool kept its safe default setup.`);
    }
  }, [onApply, schema, sharedFallback]);

  const duplicateNumbers = useMemo(() => {
    const counts = new Map<string, number>();
    const positions = new Map<string, number>();
    for (const record of records) counts.set(record.name, (counts.get(record.name) ?? 0) + 1);
    return records.map((record) => {
      const position = (positions.get(record.name) ?? 0) + 1;
      positions.set(record.name, position);
      return counts.get(record.name) === 1 ? record.name : `${record.name} (${position})`;
    });
  }, [records]);

  function selectRecord(id: string) {
    setSelectedId(id);
    const record = records.find((candidate) => candidate.id === id);
    if (record) setName(record.name);
  }

  function updateFromMutation(result: ReturnType<NonNullable<typeof storeRef.current>["save"]>) {
    if (!result.ok) {
      setStatus(result.message);
      return null;
    }
    setRecords(result.records);
    return result.records;
  }

  async function shareSetup() {
    let link: string;
    try {
      link = schema.buildUrl(currentConfig);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "This setup cannot be shared.");
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(link);
      setManualLink("");
      setStatus("Share link copied. Anyone with the link can read its selected settings.");
    } catch {
      setManualLink(link);
      setStatus("Automatic copying was unavailable. Select and copy the link shown below.");
    }
  }

  function savePreset() {
    const store = storeRef.current;
    if (!store) {
      setStatus("Local presets are unavailable in this browser.");
      return;
    }
    const result = store.save(name, currentConfig);
    const updated = updateFromMutation(result);
    if (!updated || !result.ok) return;
    if (result.record) {
      setSelectedId(result.record.id);
      setName(result.record.name);
    }
    setStatus("Preset saved only in this browser.");
  }

  function loadPreset() {
    const store = storeRef.current;
    if (!store || !selectedId) {
      setStatus("Choose a preset to load.");
      return;
    }
    if (loadDisabled) {
      setStatus(loadDisabledReason);
      return;
    }
    const result = store.load(selectedId);
    if (!result.ok) {
      setStatus(result.message);
      return;
    }
    onApply(result.record.config);
    setStatus(`Loaded ${result.record.name}. Review it before starting.`);
  }

  function renamePreset() {
    const store = storeRef.current;
    if (!store || !selectedId) {
      setStatus("Choose a preset to rename.");
      return;
    }
    const result = store.rename(selectedId, name);
    const updated = updateFromMutation(result);
    if (!updated) return;
    const renamed = updated.find((record) => record.id === selectedId);
    if (renamed) setName(renamed.name);
    setStatus("Preset renamed.");
  }

  function deletePreset() {
    const store = storeRef.current;
    if (!store || !selectedId) {
      setStatus("Choose a preset to delete.");
      return;
    }
    const result = store.remove(selectedId);
    const updated = updateFromMutation(result);
    if (!updated) return;
    const next = updated[0];
    setSelectedId(next?.id ?? "");
    setName(next?.name ?? "");
    setStatus("Preset deleted from this browser.");
  }

  function deleteAllPresets() {
    const store = storeRef.current;
    if (!store || records.length === 0) {
      setStatus("There are no local presets to delete.");
      return;
    }
    if (!window.confirm(`Delete all ${records.length} presets for this tool from this browser?`)) return;
    const result = store.clear();
    if (!updateFromMutation(result)) return;
    setSelectedId("");
    setName("");
    setStatus("All presets for this tool were deleted from this browser.");
  }

  return (
    <SettingGroup
      title="Share and reuse this setup"
      description={`Share links contain selected settings in the URL. Named presets stay in this browser. You can save up to ${LOCAL_PRESET_LIMIT} presets for this tool.`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" onClick={() => void shareSetup()}>
          Share setup
        </Button>
      </div>

      {manualLink ? (
        <Field
          label="Share link for manual copying"
          value={manualLink}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
          hint="Anyone with this link can read the selected settings."
        />
      ) : null}

      {schema.storageKey ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Preset name"
              value={name}
              maxLength={LOCAL_PRESET_NAME_MAX_LENGTH}
              onChange={(event) => setName(event.currentTarget.value)}
              hint={`${name.length}/${LOCAL_PRESET_NAME_MAX_LENGTH} characters. Duplicate names are allowed.`}
            />
            <Select
              label="Saved presets"
              value={selectedId}
              onChange={(event) => selectRecord(event.currentTarget.value)}
              disabled={records.length === 0}
            >
              {records.length === 0 ? <option value="">No presets saved</option> : null}
              {records.map((record, index) => (
                <option key={record.id} value={record.id}>
                  {duplicateNumbers[index]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" onClick={savePreset} disabled={records.length >= LOCAL_PRESET_LIMIT}>
              Save preset
            </Button>
            <Button variant="secondary" onClick={loadPreset} disabled={!selectedId || loadDisabled}>
              Load preset
            </Button>
            <Button variant="secondary" onClick={renamePreset} disabled={!selectedId}>
              Rename
            </Button>
            <Button variant="secondary" onClick={deletePreset} disabled={!selectedId}>
              Delete
            </Button>
            <Button variant="danger" onClick={deleteAllPresets} disabled={records.length === 0}>
              Delete all
            </Button>
          </div>
          {loadDisabled ? <p className="ilt-helper-text text-center">{loadDisabledReason}</p> : null}
        </>
      ) : null}

      <p className="ilt-helper-text min-h-5 text-center" role="status" aria-live="polite">
        {status}
      </p>
      <p className="ilt-helper-text text-center">
        Learn more in the{" "}
        <Link className="ilt-content-link" to="/guides/browser-storage">
          browser storage guide
        </Link>
        .
      </p>
    </SettingGroup>
  );
}
