// app/routes/event-countdown.tsx
import type { Route } from "./+types/event-countdown";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
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
      content: "https://www.ilovetimers.com/og-image.jpg",
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

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

function useIsFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const el = targetRef.current;
      setIsFs(!!el && document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  return isFs;
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

/**
 * Fit a single-line time string into its container by adjusting font size.
 * Uses ResizeObserver + rAF and binary search.
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const [fontPx, setFontPx] = useState<number>(minPx);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf: number | null = null;

    const compute = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;

      const rect = c.getBoundingClientRect();
      const availW = Math.max(0, rect.width - paddingAllowancePx);
      const availH = Math.max(0, rect.height - paddingAllowancePx);

      if (availW <= 0 || availH <= 0) return;

      const originalFontSize = (t as HTMLElement).style.fontSize;

      const fits = (px: number) => {
        (t as HTMLElement).style.fontSize = `${px}px`;
        const tr = t.getBoundingClientRect();
        return tr.width <= availW && tr.height <= availH;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      (t as HTMLElement).style.fontSize = originalFontSize;
      setFontPx(best);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontPx;
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

function makeDefaultEvent(now = Date.now()): StoredEvent {
  return {
    id: uid(),
    name: "My Event",
    targetValue: toLocalInputValue(new Date(now + 60 * 60 * 1000)),
    sound: true,
    finalBeeps: false,
    createdAt: now,
  };
}

function normalizeState(input: any): StoredStateV1 {
  const fallbackEvent = makeDefaultEvent();
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
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
  cardRef,
  isFullscreen,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      isFullscreen
        ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
        : "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

const Btn = ({
  kind = "solid",
  children,
  onClick,
  className = "",
  disabled,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  right?: React.ReactNode;
  onExit: () => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Btn kind="ghost" onClick={onExit} className="py-1 text-sm">
            Exit (Esc)
          </Btn>
        </div>
      </div>
    </div>
  );
}

function FullscreenBottomBar({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

/* =========================================================
   EVENT COUNTDOWN CARD
========================================================= */
function EventCountdownCard() {
  const beep = useBeep();

  const [store, setStore] = useState<StoredStateV1>(() => normalizeState(null));
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
  const isFs = useIsFullscreen(cardRef);

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
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
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
    maxPx: isFs ? 520 : 380,
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
        onExit={() => document.exitFullscreen().catch(() => {})}
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

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status line (normal only) */}
            {!isFs && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                {!targetDate ? (
                  <div className="font-semibold text-slate-900">
                    Pick a valid date and time to start.
                  </div>
                ) : status === "past" ? (
                  <div className="font-semibold text-rose-700">
                    That date/time is in the past.
                  </div>
                ) : status === "done" ? (
                  <div className="font-semibold text-emerald-700">
                    {(selectedEvent?.name || "Event").trim() || "Event"}{" "}
                    reached.
                  </div>
                ) : (
                  <div className="font-semibold text-slate-900">
                    Target:{" "}
                    <span className="font-extrabold">{readableTarget}</span>
                  </div>
                )}

                <div className="mt-1 text-xs font-semibold text-slate-600">
                  Shortcuts: Space start/pause · R reset · F fullscreen
                </div>
              </div>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
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
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            urgent ? "ring-2 ring-rose-300/50" : "",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {(selectedEvent?.name || "Event").trim() || "Event"}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownLong}
          </span>

          <div className="mt-3 text-sm font-semibold text-slate-700">
            {shownShort}
          </div>

          {/* Fullscreen overlays */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Status
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {statusLabel}
                    {targetDate && status !== "past" && status !== "done" ? (
                      <span className="ml-2 text-slate-600">
                        Target: {readableTarget}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            {/* Row 1: event selector + event actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-600">
                  Saved events
                </label>
                <select
                  value={store.selectedId}
                  onChange={(e) => selectEvent(e.target.value)}
                  className="cursor-pointer mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                >
                  {sortedEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name || "Untitled Event"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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
              </div>
            </div>

            {/* Row 2: name + datetime */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-900">
                Event name
                <input
                  value={selectedEvent?.name ?? ""}
                  onChange={(e) =>
                    updateSelectedEvent({ name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  placeholder="My Event"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Date & time (local)
                <input
                  type="datetime-local"
                  value={selectedEvent?.targetValue ?? ""}
                  onChange={(e) =>
                    updateSelectedEvent({ targetValue: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
              </label>
            </div>

            {/* Row 3: run controls + toggles + presets */}
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Btn onClick={startPause} disabled={!canStart && !running}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset} disabled={!targetDate}>
                  Reset
                </Btn>

                <div className="ml-0 flex flex-wrap items-center gap-2 lg:ml-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={!!selectedEvent?.sound}
                      onChange={(e) =>
                        updateSelectedEvent({ sound: e.target.checked })
                      }
                    />
                    Sound
                  </label>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={!!selectedEvent?.finalBeeps}
                      onChange={(e) =>
                        updateSelectedEvent({ finalBeeps: e.target.checked })
                      }
                      disabled={!selectedEvent?.sound}
                    />
                    Final beeps
                  </label>
                </div>
              </div>

              {/* Time adjust chips */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Adjust:
                  </span>

                  <button
                    type="button"
                    onClick={() => adjustTargetHours(-1)}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    title="Subtract 1 hour"
                  >
                    -1h
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustTargetHours(-2)}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    title="Subtract 2 hours"
                  >
                    -2h
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustTargetHours(-24)}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    title="Subtract 24 hours"
                  >
                    -24h
                  </button>

                  <span className="mx-1 text-xs font-semibold text-slate-400">
                    |
                  </span>

                  <button
                    type="button"
                    onClick={() => adjustTargetHours(1)}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    title="Add 1 hour"
                  >
                    +1h
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustTargetHours(2)}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    title="Add 2 hours"
                  >
                    +2h
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustTargetHours(24)}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    title="Add 24 hours"
                  >
                    +24h
                  </button>
                </div>

                <div className="ml-1 text-xs font-semibold text-slate-600">
                  Saved in your browser
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
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
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Minimal header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Event Countdown (Countdown to Date & Time)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Count down to an exact date and time with a big, readable fullscreen
            display.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <EventCountdownCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Event Countdown</span>
        </p>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}
