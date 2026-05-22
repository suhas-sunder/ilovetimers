// app/routes/event-countdown.tsx
import type { Route } from "./+types/event-countdown";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";
import {
  Button as Btn,
  ControlGroup,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  Select,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  Toggle,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/event-countdown/HowItWorks";
import Disclaimer from "~/clients/components/event-countdown/Disclaimer";
import FAQ from "~/clients/components/event-countdown/FAQ";
import KeyboardShortcuts from "~/clients/components/event-countdown/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/event-countdown/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Event Countdown (Countdown to a Date & Time, Fullscreen)";
  const description =
    "Free event countdown timer to count down to a specific date and time. Big fullscreen display with simple controls and optional sound alerts for launches and deadlines.";

  const url = "https://www.ilovetimers.com/event-countdown";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "event countdown",
        "countdown to date",
        "countdown to time",
        "countdown to a date",
        "date countdown timer",
        "event countdown timer",
        "countdown clock",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.png",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffffff" },
  ];
}

/* =========================================================
   LOADER
========================================================= */
export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClockShort(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

function msToClockLong(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0) return `${days}d ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

function toLocalInputValue(d: Date) {
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hour = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${min}`;
}

function parseLocalDateTime(value: string) {
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;

  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);

  if (
    !Number.isFinite(y) ||
    !Number.isFinite(mo) ||
    !Number.isFinite(d) ||
    !Number.isFinite(h) ||
    !Number.isFinite(mi)
  ) {
    return null;
  }

  const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

// WebAudio beep
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 160, gain = 0.1) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = gain;

      o.connect(g);
      g.connect(ctx.destination);

      o.start();
      window.setTimeout(() => {
        o.stop();
        o.disconnect();
        g.disconnect();
      }, duration);
    } catch {
      // ignore
    }
  }, []);
}

/* =========================================================
   LOCAL STORAGE
========================================================= */
type StoredEvent = {
  id: string;
  name: string;
  targetValue: string; // datetime-local value
  sound: boolean;
  finalBeeps: boolean;
  createdAt: number;
};

type StoredStateV1 = {
  v: 1;
  selectedId: string;
  events: StoredEvent[];
};

const LS_KEY = "ilovetimers:event-countdown:v1";

function makeDefaultEvent(now = Date.now(), id = uid()): StoredEvent {
  return {
    id,
    name: "My Event",
    targetValue: toLocalInputValue(new Date(now + 60 * 60 * 1000)),
    sound: true,
    finalBeeps: false,
    createdAt: now,
  };
}

function normalizeState(
  input: any,
  fallbackSeed?: { now?: number; id?: string },
): StoredStateV1 {
  const fallbackEvent = makeDefaultEvent(fallbackSeed?.now, fallbackSeed?.id);
  const fallback: StoredStateV1 = {
    v: 1,
    selectedId: fallbackEvent.id,
    events: [fallbackEvent],
  };

  if (!input || typeof input !== "object") return fallback;
  if (input.v !== 1) return fallback;

  const eventsRaw = Array.isArray(input.events) ? input.events : [];
  const events: StoredEvent[] = eventsRaw
    .map((e: any) => {
      if (!e || typeof e !== "object") return null;

      const id = typeof e.id === "string" && e.id ? e.id : "";
      const name = typeof e.name === "string" ? e.name : "My Event";
      const targetValue =
        typeof e.targetValue === "string" && e.targetValue.includes("T")
          ? e.targetValue
          : fallbackEvent.targetValue;

      const sound = typeof e.sound === "boolean" ? e.sound : true;
      const finalBeeps =
        typeof e.finalBeeps === "boolean" ? e.finalBeeps : false;

      const createdAt =
        typeof e.createdAt === "number" && Number.isFinite(e.createdAt)
          ? e.createdAt
          : Date.now();

      if (!id) return null;

      return { id, name, targetValue, sound, finalBeeps, createdAt };
    })
    .filter(Boolean) as StoredEvent[];

  const safeEvents = events.length > 0 ? events : [fallbackEvent];

  const selectedId =
    typeof input.selectedId === "string" && input.selectedId
      ? input.selectedId
      : safeEvents[0].id;

  const finalSelectedId = safeEvents.some((e) => e.id === selectedId)
    ? selectedId
    : safeEvents[0].id;

  return { v: 1, selectedId: finalSelectedId, events: safeEvents };
}

/* =========================================================
   EVENT COUNTDOWN CARD
========================================================= */
function EventCountdownCard({ initialNowISO }: { initialNowISO: string }) {
  const beep = useBeep();
  const initialNowMs = useMemo(() => {
    const parsed = Date.parse(initialNowISO);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [initialNowISO]);

  const [store, setStore] = useState<StoredStateV1>(() =>
    normalizeState(null, { now: initialNowMs, id: "default-event" }),
  );
  const [hydrated, setHydrated] = useState(false);

  // Runtime-only
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "counting" | "past" | "done">(
    "idle",
  );

  const rafRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const selectedEvent = useMemo(() => {
    return (
      store.events.find((e) => e.id === store.selectedId) ?? store.events[0]
    );
  }, [store]);

  const targetDate = useMemo(() => {
    return parseLocalDateTime(selectedEvent?.targetValue ?? "");
  }, [selectedEvent?.targetValue]);

  const computeRemaining = useCallback(() => {
    if (!targetDate) return 0;
    return Math.max(0, targetDate.getTime() - Date.now());
  }, [targetDate]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Load from localStorage once on mount.
  useEffect(() => {
    const loaded = safeJsonParse<StoredStateV1>(localStorage.getItem(LS_KEY));
    const normalized = normalizeState(loaded);
    setStore(normalized);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever store changes (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(store));
    } catch {
      // ignore
    }
  }, [store, hydrated]);

  // When selected event or its target changes, refresh remaining and stop running.
  useEffect(() => {
    setRunning(false);
    stopRaf();
    lastBeepSecondRef.current = null;

    if (!targetDate) {
      setRemaining(0);
      setStatus("idle");
      return;
    }

    const ms = targetDate.getTime() - Date.now();
    if (ms <= 0) {
      setRemaining(0);
      setStatus("past");
    } else {
      setRemaining(ms);
      setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.selectedId, selectedEvent?.targetValue, targetDate]);

  // Tick loop
  useEffect(() => {
    if (!running) {
      stopRaf();
      lastBeepSecondRef.current = null;
      return;
    }

    const tick = () => {
      const rem = computeRemaining();
      setRemaining(rem);

      const sound = !!selectedEvent?.sound;
      const finalBeeps = !!selectedEvent?.finalBeeps;

      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110, 0.09);
        }
      }

      if (rem <= 0) {
        setRunning(false);
        setStatus("done");
        lastBeepSecondRef.current = null;
        if (sound) beep(660, 240, 0.12);
        stopRaf();
        return;
      }

      setStatus("counting");
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [
    running,
    computeRemaining,
    beep,
    selectedEvent?.sound,
    selectedEvent?.finalBeeps,
  ]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    if (!targetDate) return;

    const ms = targetDate.getTime() - Date.now();
    if (ms <= 0) {
      setStatus("past");
      setRemaining(0);
      setRunning(false);
      stopRaf();
      return;
    }

    lastBeepSecondRef.current = null;
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    stopRaf();
    lastBeepSecondRef.current = null;

    const ms = computeRemaining();
    setRemaining(ms);
    setStatus(ms > 0 ? "idle" : "past");
  }

  function updateSelectedEvent(patch: Partial<StoredEvent>) {
    setStore((prev) => {
      const events = prev.events.map((e) =>
        e.id === prev.selectedId ? { ...e, ...patch } : e,
      );
      return { ...prev, events };
    });
  }

  function selectEvent(id: string) {
    setRunning(false);
    stopRaf();
    lastBeepSecondRef.current = null;
    setStore((prev) => ({ ...prev, selectedId: id }));
  }

  // NEW: creates a fresh event with default values
  function addNewEvent() {
    const now = Date.now();
    const next = makeDefaultEvent(now);

    setRunning(false);
    stopRaf();
    lastBeepSecondRef.current = null;

    setStore((prev) => ({
      ...prev,
      events: [next, ...prev.events],
      selectedId: next.id,
    }));
  }

  // DUPLICATE: clones the selected event (name, target, toggles)
  function duplicateSelectedEvent() {
    const now = Date.now();
    const base = selectedEvent ?? makeDefaultEvent(now);

    const next: StoredEvent = {
      ...base,
      id: uid(),
      name: base.name ? `${base.name} (Copy)` : "Event (Copy)",
      createdAt: now,
    };

    setRunning(false);
    stopRaf();
    lastBeepSecondRef.current = null;

    setStore((prev) => ({
      ...prev,
      events: [next, ...prev.events],
      selectedId: next.id,
    }));
  }

  function deleteSelectedEvent() {
    setRunning(false);
    stopRaf();
    lastBeepSecondRef.current = null;

    setStore((prev) => {
      if (prev.events.length <= 1) {
        const only = prev.events[0];
        const resetEvent: StoredEvent = {
          ...only,
          name: "My Event",
          targetValue: toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
          sound: true,
          finalBeeps: false,
          createdAt: Date.now(),
        };
        return { ...prev, events: [resetEvent], selectedId: resetEvent.id };
      }

      const idx = prev.events.findIndex((e) => e.id === prev.selectedId);
      const nextEvents = prev.events.filter((e) => e.id !== prev.selectedId);
      const nextIdx = clamp(idx, 0, nextEvents.length - 1);
      const nextSelectedId = nextEvents[nextIdx]?.id ?? nextEvents[0].id;

      return { ...prev, events: nextEvents, selectedId: nextSelectedId };
    });
  }

  function setPresetHours(h: number) {
    const d = new Date(Date.now() + h * 60 * 60 * 1000);
    updateSelectedEvent({ targetValue: toLocalInputValue(d) });
  }

  function adjustTargetHours(deltaHours: number) {
    const base = targetDate ?? new Date();
    const next = new Date(base.getTime() + deltaHours * 60 * 60 * 1000);
    updateSelectedEvent({ targetValue: toLocalInputValue(next) });
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;

  const roundedMs = Math.ceil(remaining / 1000) * 1000;
  const shownLong = msToClockLong(roundedMs);
  const shownShort = msToClockShort(roundedMs);

  const readableTarget = targetDate
    ? targetDate.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const statusLabel =
    status === "past"
      ? "Past"
      : status === "done"
        ? "Done"
        : running
          ? "Running"
          : remaining > 0
            ? "Ready"
            : "Ready";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownLong,
      isFs,
      running,
      urgent,
      status,
      selectedEvent?.name,
      selectedEvent?.targetValue,
      store.events.length,
      store.selectedId,
    ],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 64 : 72,
  });

  const canStart = !!targetDate && remaining > 0;

  const sortedEvents = useMemo(() => {
    return store.events.slice().sort((a, b) => b.createdAt - a.createdAt);
  }, [store.events]);

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Event Countdown"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={startPause}
              className="py-1 text-sm"
              disabled={!canStart && !running}
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-result-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="order-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status line (normal only) */}
            {!isFs && (
              <div className="ilt-surface-muted px-4 py-3 text-sm">
                {!targetDate ? (
                  <div className="font-semibold text-[var(--ilt-text-primary)]">
                    Pick a valid date and time to start.
                  </div>
                ) : status === "past" ? (
                  <div className="font-semibold text-[var(--ilt-text-primary)]">
                    That date/time is in the past.
                  </div>
                ) : status === "done" ? (
                  <div className="font-semibold text-[var(--ilt-text-primary)]">
                    {(selectedEvent?.name || "Event").trim() || "Event"}{" "}
                    reached.
                  </div>
                ) : (
                  <div className="font-semibold text-[var(--ilt-text-primary)]">
                    Target:{" "}
                    <span className="font-extrabold">{readableTarget}</span>
                  </div>
                )}

                <div className="hidden">
                  Shortcuts: Space start/pause · R reset · F fullscreen
                </div>
              </div>
            )}
            <div className="hidden">
              <Btn
                kind="ghost"
                onClick={() =>
                  void fullscreen.toggle()
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "order-1 timer-display-surface relative mt-4 flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
            "border-[var(--ilt-border-subtle)] p-3 sm:p-6",
            urgent ? "ring-1 ring-amber-300/70" : "",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div className="timer-result-label ilt-content-label">
            {(selectedEvent?.name || "Event").trim() || "Event"}
          </div>

          <span
            ref={timeTextRef}
            data-primary-display-value
            className={[
              "timer-result-value",
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownLong}
          </span>

          <div className="timer-result-context mt-3 text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {shownShort}
          </div>

          {/* Fullscreen overlays */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
                    Status
                  </div>
                  <div className="ilt-helper-text font-semibold">
                    {statusLabel}
                    {targetDate && status !== "past" && status !== "done" ? (
                      <span className="ml-2 text-[var(--ilt-text-secondary)]">
                        Target: {readableTarget}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="hidden sm:block ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)] backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <SettingGroup
            title="Event setup"
            description="Choose the saved event, target date, and countdown cues."
            className="order-2 mt-5"
          >
            {/* Row 1: event selector + event actions */}
            <SettingRow className="sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0 flex-1">
                <Select
                  label="Saved events"
                  value={store.selectedId}
                  onChange={(e) => selectEvent(e.target.value)}
                >
                  {sortedEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name || "Untitled Event"}
                    </option>
                  ))}
                </Select>
              </div>

              <SecondaryActionRow className="timer-result-actions sm:justify-end">
                <Btn kind="ghost" onClick={addNewEvent} className="px-3 py-2">
                  New
                </Btn>
                <Btn
                  kind="ghost"
                  onClick={duplicateSelectedEvent}
                  className="px-3 py-2"
                >
                  Duplicate
                </Btn>
                <Btn
                  kind="ghost"
                  onClick={deleteSelectedEvent}
                  className="px-3 py-2"
                  disabled={store.events.length <= 1}
                >
                  Delete
                </Btn>
              </SecondaryActionRow>
            </SettingRow>

            {/* Row 2: name + datetime */}
            <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
              <Field
                label="Event name"
                value={selectedEvent?.name ?? ""}
                onChange={(e) =>
                  updateSelectedEvent({ name: e.target.value })
                }
                placeholder="My Event"
              />

              <Field
                label="Date & time (local)"
                type="datetime-local"
                value={selectedEvent?.targetValue ?? ""}
                onChange={(e) =>
                  updateSelectedEvent({ targetValue: e.target.value })
                }
              />
            </SettingRow>

            <ControlGroup>
              <Btn onClick={startPause} disabled={!canStart && !running}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset} disabled={!targetDate}>
                Reset
              </Btn>
            </ControlGroup>

            <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
              <Toggle
                label="Sound"
                checked={!!selectedEvent?.sound}
                onCheckedChange={(checked) =>
                  updateSelectedEvent({ sound: checked })
                }
              />

              <Toggle
                label="Final beeps"
                checked={!!selectedEvent?.finalBeeps}
                onCheckedChange={(checked) =>
                  updateSelectedEvent({ finalBeeps: checked })
                }
                disabled={!selectedEvent?.sound}
              />
            </SettingRow>

            <PresetGroup
              title="Adjust target"
              description="Move the selected event target without editing the date field."
            >
              <Chip onClick={() => adjustTargetHours(-1)} title="Subtract 1 hour">
                -1h
              </Chip>
              <Chip onClick={() => adjustTargetHours(-2)} title="Subtract 2 hours">
                -2h
              </Chip>
              <Chip onClick={() => adjustTargetHours(-24)} title="Subtract 24 hours">
                -24h
              </Chip>
              <Chip onClick={() => adjustTargetHours(1)} title="Add 1 hour">
                +1h
              </Chip>
              <Chip onClick={() => adjustTargetHours(2)} title="Add 2 hours">
                +2h
              </Chip>
              <Chip onClick={() => adjustTargetHours(24)} title="Add 24 hours">
                +24h
              </Chip>
            </PresetGroup>

            <SecondaryActionRow className="timer-result-actions">
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Space start/pause / R reset / F fullscreen / saved in your browser
            </ShortcutHint>
          </SettingGroup>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="ilt-helper-text font-semibold">
              {statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function EventCountdownPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/event-countdown";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Event Countdown",
        url,
        description:
          "Event countdown that counts down to a specific date and time. Big fullscreen display, optional sound, and simple controls.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Event Countdown",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<EventCountdownCard initialNowISO={_nowISO} />}
        title="Event Countdown (Countdown to Date & Time)"
        description="Count down to an exact local date and time with saved events, fullscreen, optional sound, and quick adjustments."
      />

      <SeoBand>
        <HowItWorks />
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}
