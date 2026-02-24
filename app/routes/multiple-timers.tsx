// app/routes/multiple-timers.tsx
import type { Route } from "./+types/multiple-timers";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Multiple Timers Online (Run Two or More at Once)";
  const description =
    "Run multiple timers at the same time. Start two or more countdowns side by side with big, clear digits. Ideal for cooking, workouts, classes, and labs.";

  const url = "https://www.ilovetimers.com/multiple-timers";

  return [
    { title },
    { name: "description", content: description },
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
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClock(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
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

/* =========================================================
   LOCAL CACHE (PERSISTENCE)
========================================================= */
const STORAGE_KEY = "ilovetimers:multiple-timers:v2";

type StoredTimer = {
  id: string;
  label: string;
  seconds: number;
  remainingMs: number;
};

type StoredState = {
  v: 2;
  savedAt: number;
  sound: boolean;
  finalCountdownBeeps: boolean;
  timers: StoredTimer[];
};

function safeParseJSON<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function loadStoredState(): StoredState | null {
  if (typeof window === "undefined") return null;
  return safeParseJSON<StoredState>(window.localStorage.getItem(STORAGE_KEY));
}

function saveStoredState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy mode issues
  }
}

/* =========================================================
   UI PRIMITIVES (MATCH NEW STYLE)
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
  kind?: "solid" | "ghost" | "danger";
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
        : kind === "danger"
          ? `cursor-pointer rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
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
   MULTIPLE TIMERS CARD
========================================================= */
type TimerItem = {
  id: string;
  label: string;
  seconds: number;
  remainingMs: number;
  running: boolean;
  alarming: boolean;
  endAt?: number | null; // performance.now() target
  lastBeepSec?: number | null;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function MultipleTimersCard() {
  const beep = useBeep();
  const presetsMin = useMemo(() => [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30], []);

  const defaultTimers: TimerItem[] = useMemo(
    () => [
      {
        id: "timer-a",
        label: "Timer A",
        seconds: 5 * 60,
        remainingMs: 5 * 60 * 1000,
        running: false,
        alarming: false,
        endAt: null,
        lastBeepSec: null,
      },
      {
        id: "timer-b",
        label: "Timer B",
        seconds: 10 * 60,
        remainingMs: 10 * 60 * 1000,
        running: false,
        alarming: false,
        endAt: null,
        lastBeepSec: null,
      },
    ],
    [],
  );

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);
  const [timers, setTimers] = useState<TimerItem[]>(defaultTimers);

  // ✅ real hydration gate: persist only after restored state has committed
  const [hydrated, setHydrated] = useState(false);

  // Latest-state refs for rAF + alarm loops
  const timersRef = useRef<TimerItem[]>(defaultTimers);
  useEffect(() => {
    timersRef.current = timers;
  }, [timers, defaultTimers]);

  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const finalBeepsRef = useRef(finalCountdownBeeps);
  useEffect(() => {
    finalBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  const rafRef = useRef<number | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const stopRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const startRafIfNeeded = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(function tick() {
      const now = performance.now();

      setTimers((prev) => {
        let changed = false;

        const next = prev.map((t) => {
          if (!t.running) return t;

          const endAt = t.endAt ?? now + t.remainingMs;
          const rem = Math.max(0, endAt - now);

          if (
            soundRef.current &&
            finalBeepsRef.current &&
            rem > 0 &&
            rem <= 5_000
          ) {
            const secLeft = Math.ceil(rem / 1000);
            if (t.lastBeepSec !== secLeft) {
              const pitch = 740 + (t.id.charCodeAt(0) % 5) * 40;
              beep(pitch, 70, 0.08);
              changed = true;
              return { ...t, endAt, remainingMs: rem, lastBeepSec: secLeft };
            }
          }

          if (rem <= 0) {
            changed = true;
            return {
              ...t,
              running: false,
              alarming: true,
              endAt: null,
              remainingMs: 0,
              lastBeepSec: null,
            };
          }

          if (rem !== t.remainingMs || t.endAt !== endAt) {
            changed = true;
            return { ...t, endAt, remainingMs: rem };
          }

          return t;
        });

        return changed ? next : prev;
      });

      const anyRunning = timersRef.current.some((t) => t.running);
      if (anyRunning) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    });
  }, [beep]);

  useEffect(() => {
    const anyRunning = timers.some((t) => t.running);
    if (anyRunning) startRafIfNeeded();
    else stopRaf();
  }, [timers, startRafIfNeeded, stopRaf]);

  useEffect(() => stopRaf, [stopRaf]);

  // Restore persisted state after mount
  useEffect(() => {
    const stored = loadStoredState();

    if (stored && stored.v === 2) {
      const restoredTimers: TimerItem[] = (stored.timers || [])
        .filter((t) => t && typeof t.id === "string")
        .map((t) => {
          const seconds = clamp(Number(t.seconds || 0), 1, 24 * 60 * 60);
          const remainingMs = clamp(
            Number(t.remainingMs || 0),
            0,
            seconds * 1000,
          );

          return {
            id: t.id,
            label: String(t.label || "Timer"),
            seconds,
            remainingMs,
            running: false,
            alarming: false,
            endAt: null,
            lastBeepSec: null,
          };
        });

      setSound(!!stored.sound);
      setFinalCountdownBeeps(!!stored.finalCountdownBeeps);
      setTimers(restoredTimers.length ? restoredTimers : defaultTimers);
    } else {
      setTimers(defaultTimers);
    }

    // ✅ triggers a re-render; persist effect will run on the next commit
    setHydrated(true);
  }, [defaultTimers]);

  // Persist (only after hydration)
  useEffect(() => {
    if (!hydrated) return;

    const stored: StoredState = {
      v: 2,
      savedAt: Date.now(),
      sound,
      finalCountdownBeeps,
      timers: timers.map((t) => ({
        id: t.id,
        label: t.label,
        seconds: t.seconds,
        remainingMs: t.remainingMs,
      })),
    };

    saveStoredState(stored);
  }, [hydrated, timers, sound, finalCountdownBeeps]);

  const anyAlarming = timers.some((t) => t.alarming);

  useEffect(() => {
    if (!anyAlarming) {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      return;
    }

    if (alarmIntervalRef.current) return;

    alarmIntervalRef.current = window.setInterval(() => {
      if (!soundRef.current) return;
      beep(880, 130, 0.11);
      window.setTimeout(() => beep(660, 160, 0.11), 150);
    }, 750);

    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [anyAlarming, beep]);

  function addTimer() {
    setTimers((prev) => [
      ...prev,
      {
        id: uid(),
        label: `Timer ${String.fromCharCode(65 + prev.length)}`,
        seconds: 5 * 60,
        remainingMs: 5 * 60 * 1000,
        running: false,
        alarming: false,
        endAt: null,
        lastBeepSec: null,
      },
    ]);
  }

  function removeTimer(id: string) {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }

  function updateLabel(id: string, label: string) {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)));
  }

  function setSeconds(id: string, seconds: number) {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const s = clamp(seconds, 1, 24 * 60 * 60);
        return {
          ...t,
          seconds: s,
          remainingMs: s * 1000,
          running: false,
          alarming: false,
          endAt: null,
          lastBeepSec: null,
        };
      }),
    );
  }

  function setPreset(id: string, minutes: number) {
    setSeconds(id, minutes * 60);
  }

  function startPause(id: string) {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        if (t.alarming) {
          return {
            ...t,
            alarming: false,
            running: false,
            remainingMs: t.seconds * 1000,
            endAt: null,
            lastBeepSec: null,
          };
        }

        if (t.running) {
          const now = performance.now();
          const rem = Math.max(0, (t.endAt ?? now + t.remainingMs) - now);
          return {
            ...t,
            running: false,
            endAt: null,
            remainingMs: rem,
            lastBeepSec: null,
          };
        }

        const base = t.remainingMs > 0 ? t.remainingMs : t.seconds * 1000;
        const now = performance.now();
        return {
          ...t,
          running: true,
          alarming: false,
          endAt: now + base,
          remainingMs: base,
          lastBeepSec: null,
        };
      }),
    );
  }

  function resetOne(id: string) {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              running: false,
              alarming: false,
              remainingMs: t.seconds * 1000,
              endAt: null,
              lastBeepSec: null,
            }
          : t,
      ),
    );
  }

  function stopAlarmOne(id: string) {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, alarming: false } : t)),
    );
  }

  function startAll() {
    const now = performance.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.alarming || t.running) return t;
        const base = t.remainingMs > 0 ? t.remainingMs : t.seconds * 1000;
        return {
          ...t,
          running: true,
          alarming: false,
          endAt: now + base,
          remainingMs: base,
          lastBeepSec: null,
        };
      }),
    );
  }

  function pauseAll() {
    const now = performance.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (!t.running) return t;
        const rem = Math.max(0, (t.endAt ?? now + t.remainingMs) - now);
        return {
          ...t,
          running: false,
          endAt: null,
          remainingMs: rem,
          lastBeepSec: null,
        };
      }),
    );
  }

  function resetAll() {
    setTimers((prev) =>
      prev.map((t) => ({
        ...t,
        running: false,
        alarming: false,
        remainingMs: t.seconds * 1000,
        endAt: null,
        lastBeepSec: null,
      })),
    );
  }

  function stopAllAlarms() {
    setTimers((prev) => prev.map((t) => ({ ...t, alarming: false })));
  }

  const anyRunning = timers.some((t) => t.running);
  const statusLabel = anyAlarming ? "Alarm" : anyRunning ? "Running" : "Ready";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      anyRunning ? pauseAll() : startAll();
    } else if (k === "r") {
      resetAll();
    } else if (k === "x") {
      stopAllAlarms();
    } else if (k === "a") {
      addTimer();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Multiple Timers"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={anyRunning ? pauseAll : startAll}
              className="py-1 text-sm"
            >
              {anyRunning ? "Pause all" : "Start all"}
            </Btn>
            <Btn kind="ghost" onClick={addTimer} className="py-1 text-sm">
              Add
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
            <Btn
              kind="danger"
              onClick={stopAllAlarms}
              className="py-1 text-sm"
              disabled={!anyAlarming}
            >
              Stop alarms
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Multiple Timers (Run Two or More at Once)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Run parallel countdowns with big digits, per-timer controls, and
                optional sound.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
                Sound
              </label>

              <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={finalCountdownBeeps}
                  onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                  disabled={!sound}
                />
                Final beeps
              </label>

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

        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Btn onClick={anyRunning ? pauseAll : startAll}>
                {anyRunning ? "Pause all" : "Start all"}
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset all
              </Btn>
              <Btn kind="ghost" onClick={addTimer}>
                Add timer
              </Btn>
              <Btn
                kind="danger"
                onClick={stopAllAlarms}
                disabled={!anyAlarming}
              >
                Stop alarms
              </Btn>
            </div>

            <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause all · R reset · A add · X stop alarms ·
              F fullscreen
            </div>
          </div>
        )}

        {/* Grid */}
        <div
          className={[
            "relative mt-4 rounded-2xl border border-slate-200 bg-slate-50",
            "p-3 sm:p-4",
            isFs ? "mx-2 sm:mx-4 flex-1 overflow-auto" : "",
          ].join(" ")}
          style={{
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            overflowAnchor: "none",
          }}
        >
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {timers.map((t, idx) => {
              const urgent =
                t.running && t.remainingMs > 0 && t.remainingMs <= 10_000;
              const shown = msToClock(Math.ceil(t.remainingMs / 1000) * 1000);

              const tileTone = t.alarming
                ? "border-rose-200 bg-rose-50"
                : urgent
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-white";

              const timeSize = isFs
                ? "text-[clamp(2.8rem,7vw,6rem)]"
                : "text-[clamp(2.4rem,6vw,4.8rem)]";

              return (
                <div
                  key={t.id}
                  className={[
                    "rounded-2xl border shadow-sm",
                    tileTone,
                    isFs ? "p-4 sm:p-5" : "p-4",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <input
                        value={t.label}
                        onChange={(e) => updateLabel(t.id, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                        aria-label={`Label for timer ${idx + 1}`}
                      />
                      <div className="mt-1 text-xs font-semibold text-slate-600">
                        {t.alarming
                          ? "Alarm ringing"
                          : t.running
                            ? "Running"
                            : "Paused"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTimer(t.id)}
                      className="cursor-pointer text-xs font-semibold text-slate-600 hover:underline"
                      title="Remove timer"
                      aria-label="Remove timer"
                    >
                      remove
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-center">
                    <div
                      className={`font-mono font-extrabold tracking-widest text-slate-900 ${timeSize}`}
                    >
                      {shown}
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {presetsMin.map((m) => {
                      const active =
                        Math.round(t.seconds / 60) === m &&
                        !t.running &&
                        !t.alarming;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPreset(t.id, m)}
                          className={
                            active
                              ? "cursor-pointer rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-amber-400"
                              : "cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                          }
                          title="Sets duration and resets this timer"
                        >
                          {m}m
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr]">
                    <label className="block text-xs font-semibold text-slate-900">
                      Minutes
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={Math.floor(t.seconds / 60)}
                        onChange={(e) => {
                          const mins = clamp(
                            Number(e.target.value || 0),
                            0,
                            999,
                          );
                          const secs = t.seconds % 60;
                          setSeconds(t.id, mins * 60 + secs);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                      />
                    </label>

                    <label className="block text-xs font-semibold text-slate-900">
                      Seconds
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={t.seconds % 60}
                        onChange={(e) => {
                          const secs = clamp(
                            Number(e.target.value || 0),
                            0,
                            59,
                          );
                          const mins = Math.floor(t.seconds / 60);
                          setSeconds(t.id, mins * 60 + secs);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                      />
                    </label>
                  </div>

                  {/* Controls */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startPause(t.id)}
                      className={
                        t.alarming
                          ? "cursor-pointer rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
                          : "cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                      }
                    >
                      {t.alarming
                        ? "Stop alarm"
                        : t.running
                          ? "Pause"
                          : "Start"}
                    </button>

                    <button
                      type="button"
                      onClick={() => resetOne(t.id)}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={() => stopAlarmOne(t.id)}
                      disabled={!t.alarming}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Stops only the alarm state (does not reset time)"
                    >
                      Silence
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Space start/pause all · R reset · A add · X stop alarms · F
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
export default function MultipleTimersPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/multiple-timers";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Multiple Timers",
        url,
        description:
          "Multiple timers tool to run two timers at once (parallel timers). Each timer has its own countdown, controls, and alarm.",
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
            name: "Multiple Timers",
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

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <MultipleTimersCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Multiple Timers</span>
        </p>
      </section>
    </main>
  );
}
