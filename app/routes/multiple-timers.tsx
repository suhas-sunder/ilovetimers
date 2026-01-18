// app/routes/multiple-timers.tsx
import type { Route } from "./+types/multiple-timers";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Multiple Timers | Two Timers at Once (Parallel Timers)";
  const description =
    "Free multiple timers tool. Run two timers at once (or more) with parallel countdowns, big digits, presets, optional sound, and fullscreen. Designed for cooking, classrooms, workouts, and labs.";
  const url = "https://ilovetimers.com/multiple-timers";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "multiple timers",
        "two timers at once",
        "parallel timers",
        "two countdown timers",
        "multi timer",
        "multiple countdown timers",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `https://ilovetimers.com/og-image.jpg` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" },
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

// WebAudio beep (same style as other pages)
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

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

/* =========================================================
   LOCAL CACHE (PERSISTENCE)
========================================================= */
const STORAGE_KEY = "ilovetimers:multiple-timers:v1";

type StoredTimer = {
  id: string;
  label: string;
  seconds: number;
  remainingMs: number;
};

type StoredState = {
  v: 1;
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
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
}) => (
  <div
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : kind === "danger"
          ? `cursor-pointer rounded-lg bg-rose-700 px-4 py-2 font-medium text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
          : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

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

  const initial = useMemo(() => {
    // default state (current behavior)
    const defaults = {
      sound: true,
      finalCountdownBeeps: false,
      timers: [
        {
          id: uid(),
          label: "Timer A",
          seconds: 5 * 60,
          remainingMs: 5 * 60 * 1000,
          running: false,
          alarming: false,
          endAt: null,
          lastBeepSec: null,
        },
        {
          id: uid(),
          label: "Timer B",
          seconds: 10 * 60,
          remainingMs: 10 * 60 * 1000,
          running: false,
          alarming: false,
          endAt: null,
          lastBeepSec: null,
        },
      ] as TimerItem[],
    };

    const stored = loadStoredState();
    if (!stored || stored.v !== 1) return defaults;

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
          running: false, // restore paused (predictable)
          alarming: false, // never restore alarming
          endAt: null,
          lastBeepSec: null,
        };
      });

    return {
      sound: !!stored.sound,
      finalCountdownBeeps: !!stored.finalCountdownBeeps,
      timers: restoredTimers.length ? restoredTimers : defaults.timers,
    };
  }, []);

  const [sound, setSound] = useState(initial.sound);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(
    initial.finalCountdownBeeps,
  );

  // Start with two timers by default (matches keyword intent), but restore if cached
  const [timers, setTimers] = useState<TimerItem[]>(initial.timers);

  const rafRef = useRef<number | null>(null);
  const fsRef = useRef<HTMLDivElement>(null);

  // Persist timers + settings
  useEffect(() => {
    const stored: StoredState = {
      v: 1,
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
  }, [timers, sound, finalCountdownBeeps]);

  // Alarm tick for any timer that is alarming
  const alarmIntervalRef = useRef<number | null>(null);
  useEffect(() => {
    const anyAlarming = timers.some((t) => t.alarming);
    if (!anyAlarming) {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      return;
    }

    if (alarmIntervalRef.current) return;

    alarmIntervalRef.current = window.setInterval(() => {
      if (!sound) return;
      // "multi-timer" alarm feel: short alternating tones
      beep(880, 130, 0.11);
      window.setTimeout(() => beep(660, 160, 0.11), 150);
    }, 750);

    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [timers, sound, beep]);

  // Main rAF loop: updates all running timers
  useEffect(() => {
    const anyRunning = timers.some((t) => t.running);
    if (!anyRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = () => {
      const now = performance.now();

      setTimers((prev) =>
        prev.map((t) => {
          if (!t.running) return t;

          // initialize endAt on first run frame
          const endAt = t.endAt ?? now + t.remainingMs;
          const rem = Math.max(0, endAt - now);

          // optional final beeps per timer (last 5s)
          if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
            const secLeft = Math.ceil(rem / 1000);
            if (t.lastBeepSec !== secLeft) {
              // small per-timer beep, slightly different pitch per index via hash
              const pitch = 740 + (t.id.charCodeAt(0) % 5) * 40;
              beep(pitch, 70, 0.08);
              return { ...t, endAt, remainingMs: rem, lastBeepSec: secLeft };
            }
          }

          if (rem <= 0) {
            // finished: stop + start alarming
            return {
              ...t,
              running: false,
              alarming: true,
              endAt: null,
              remainingMs: 0,
              lastBeepSec: null,
            };
          }

          return { ...t, endAt, remainingMs: rem };
        }),
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [timers, sound, finalCountdownBeeps, beep]);

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

        // If alarming, stop alarm and reset to configured duration
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
          // pause: freeze remaining, clear endAt
          return { ...t, running: false, endAt: null, lastBeepSec: null };
        }

        // start: keep remaining as-is, set running true; endAt will be set in rAF loop
        return { ...t, running: true, lastBeepSec: null };
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
    setTimers((prev) =>
      prev.map((t) =>
        t.alarming
          ? t
          : t.running
            ? t
            : { ...t, running: true, lastBeepSec: null },
      ),
    );
  }

  function pauseAll() {
    setTimers((prev) =>
      prev.map((t) =>
        t.running
          ? { ...t, running: false, endAt: null, lastBeepSec: null }
          : t,
      ),
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      // Space toggles start/pause all
      const anyRunning = timers.some((t) => t.running);
      anyRunning ? pauseAll() : startAll();
    } else if (e.key.toLowerCase() === "r") {
      resetAll();
    } else if (e.key.toLowerCase() === "x") {
      stopAllAlarms();
    } else if (e.key.toLowerCase() === "a") {
      addTimer();
    } else if (e.key.toLowerCase() === "f" && fsRef.current) {
      toggleFullscreen(fsRef.current);
    }
  };

  const anyRunning = timers.some((t) => t.running);
  const anyAlarming = timers.some((t) => t.alarming);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Multiple Timers
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Run <strong>two timers at once</strong> (or more). Each timer has
            its own countdown, start/pause, and alarm. Designed for cooking,
            classrooms, workouts, and labs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            Sound
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
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
            onClick={() => fsRef.current && toggleFullscreen(fsRef.current)}
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Global controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Btn onClick={anyRunning ? pauseAll : startAll}>
          {anyRunning ? "Pause all" : "Start all"}
        </Btn>
        <Btn kind="ghost" onClick={resetAll}>
          Reset all
        </Btn>
        <Btn kind="ghost" onClick={addTimer}>
          Add timer
        </Btn>
        <Btn kind="danger" onClick={stopAllAlarms} disabled={!anyAlarming}>
          Stop alarms
        </Btn>

        <div className="ml-auto text-xs text-slate-600">
          Tip: run parallel timers, each with its own duration and alarm.
        </div>
      </div>

      {/* Fullscreen container: grid of timer tiles */}
      <div
        ref={fsRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
                padding:3vh 3vw;
                overflow:auto;
              }
              [data-fs-container]:fullscreen .tile{
                background: rgba(255,255,255,.06);
                border: 1px solid rgba(255,255,255,.16);
              }
              [data-fs-container]:fullscreen .tileLabel,
              [data-fs-container]:fullscreen .tileMeta{
                color: rgba(255,255,255,.88);
              }
              [data-fs-container]:fullscreen .tileTime{
                color: #ffffff;
              }
              [data-fs-container]:fullscreen .tileBtnSolid{
                background:#ffffff;
                color:#0b0b0c;
              }
              [data-fs-container]:fullscreen .tileBtnGhost{
                background: rgba(255,255,255,.12);
                color:#ffffff;
              }
            `,
          }}
        />

        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {timers.map((t) => {
              const urgent =
                t.running && t.remainingMs > 0 && t.remainingMs <= 10_000;
              const shown = msToClock(Math.ceil(t.remainingMs / 1000) * 1000);

              return (
                <div
                  key={t.id}
                  className={`tile rounded-2xl border-2 bg-white p-4 shadow-sm ${
                    t.alarming
                      ? "border-rose-300 bg-rose-50"
                      : urgent
                        ? "border-rose-300 bg-rose-50"
                        : "border-amber-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <input
                        value={t.label}
                        onChange={(e) => updateLabel(t.id, e.target.value)}
                        className="tileLabel w-full rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-sm font-extrabold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <div className="tileMeta mt-1 text-xs text-slate-600">
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
                      className="text-xs font-semibold text-slate-600 hover:underline"
                      title="Remove timer"
                      aria-label="Remove timer"
                    >
                      remove
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-center font-mono font-extrabold tracking-widest">
                    <div className="tileTime text-5xl sm:text-6xl text-amber-950">
                      {shown}
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {presetsMin.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPreset(t.id, m)}
                        className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                          Math.round(t.seconds / 60) === m && !t.running
                            ? "bg-amber-700 text-white hover:bg-amber-800"
                            : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                        }`}
                        title="Sets duration and resets this timer"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>

                  {/* Custom */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr]">
                    <label className="block text-xs font-semibold text-amber-950">
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
                        className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-2 py-2 text-sm text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </label>

                    <label className="block text-xs font-semibold text-amber-950">
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
                        className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-2 py-2 text-sm text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </label>
                  </div>

                  {/* Controls */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startPause(t.id)}
                      className={`tileBtnSolid cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold ${
                        t.alarming
                          ? "bg-rose-700 text-white hover:bg-rose-800"
                          : "bg-amber-700 text-white hover:bg-amber-800"
                      }`}
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
                      className="tileBtnGhost cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-400"
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={() => stopAlarmOne(t.id)}
                      disabled={!t.alarming}
                      className="tileBtnGhost cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Stops only the alarm state (does not reset time)"
                    >
                      Silence
                    </button>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-600">
                    Per-timer controls: Start/Pause, Reset, and its own alarm at
                    zero.
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shortcuts */}
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
            Shortcuts: Space start/pause all · R reset all · A add timer · X
            stop alarms · F fullscreen
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MultipleTimersPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/multiple-timers";

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
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Multiple Timers",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What are multiple timers?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Multiple timers let you run two timers at once (or more). Each timer counts down independently so you can track separate tasks in parallel.",
            },
          },
          {
            "@type": "Question",
            name: "How do I run two timers at once?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Set a duration for Timer A and Timer B, then press Start on each timer (or use Start all). They run independently and alarm when they hit zero.",
            },
          },
          {
            "@type": "Question",
            name: "Can I add more timers?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Add timer (or press A). You can run parallel timers for cooking, classrooms, workouts, and labs.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses all timers, R resets all, A adds a timer, X stops alarms, and F toggles fullscreen while the card is focused.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Multiple Timers</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Multiple Timers (Two Timers at Once)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Run <strong>multiple timers</strong> in parallel. Perfect when you
            need <strong>two timers at once</strong> for cooking, classrooms,
            workouts, or labs.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <MultipleTimersCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Two timers at once (default)
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              The page starts with two timers so you can immediately run
              parallel countdowns. Add more if you need them.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Independent controls
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Each timer has its own Start/Pause and Reset. Use Start all and
              Pause all when you want everything synchronized.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen grid
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen turns the timer list into a high-contrast grid so you
              can see multiple countdowns from farther away.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free multiple timers: run parallel timers (two timers at once or
            more)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This page is built for situations where one timer is not enough.
              Use it as <strong>multiple timers</strong> to run two or more
              independent countdowns. That makes it ideal for cooking multiple
              dishes, managing classroom stations, timing workout sets, or
              running lab steps.
            </p>

            <p>
              Each timer has its own duration and alarm, so you can track tasks
              in parallel without constantly resetting a single timer. If you
              want timers to start together, use <strong>Start all</strong>. If
              you need everything to stop immediately, use{" "}
              <strong>Pause all</strong> or <strong>Stop alarms</strong>.
            </p>

            <p>
              For a single countdown, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For a stopwatch, use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Multiple timers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Run several countdowns at the same time.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Two timers at once
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Starts with Timer A and Timer B, ready to use.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Parallel timers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Each timer runs independently with its own alarm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Multiple Timers FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I run two timers at once?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. The page starts with Timer A and Timer B. Set each duration
              and press Start on each timer (or use Start all).
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I add more than two timers?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click <strong>Add timer</strong> (or press <strong>A</strong>
              ) to add more parallel timers.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Do timers run independently?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Each timer has its own Start/Pause, Reset, and alarm at zero.
              Global buttons help when you want everything synchronized.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause all • <strong>R</strong> reset
              all • <strong>A</strong> add timer • <strong>X</strong> stop
              alarms • <strong>F</strong> fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
