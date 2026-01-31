// app/routes/pizza-timer.tsx
import type { Route } from "./+types/pizza-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Pizza Timer (Frozen Pizza)";
  const description =
    "Set a simple pizza timer with quick presets for frozen pizza. Big, easy-to-read countdown to help you pull your pizza out at the right time.";

  const url = "https://ilovetimers.com/pizza-timer";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://ilovetimers.com/og-image.jpg" },
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

  return useCallback((freq = 880, duration = 160) => {
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
      g.gain.value = 0.1;

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
   UI PRIMITIVES (same style as Home/Pomodoro)
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   PIZZA TIMER CARD
========================================================= */
type HeatMethod = "oven" | "air_fryer" | "skillet" | "custom";

type PizzaPreset = {
  key: string;
  label: string;
  method: HeatMethod;
  minutes: number;
  seconds: number;
  note: string;
};

const PRESETS: PizzaPreset[] = [
  {
    key: "frozen_oven_14",
    label: "Frozen (Oven 14m)",
    method: "oven",
    minutes: 14,
    seconds: 0,
    note: "Common frozen pizza bake time range is roughly 12 to 18 minutes depending on brand and oven.",
  },
  {
    key: "frozen_oven_16",
    label: "Frozen (Oven 16m)",
    method: "oven",
    minutes: 16,
    seconds: 0,
    note: "Use this if you like crispier crust or your oven runs cool.",
  },
  {
    key: "frozen_air_10",
    label: "Frozen (Air fryer 10m)",
    method: "air_fryer",
    minutes: 10,
    seconds: 0,
    note: "Air fryers are faster. Check early and adjust to avoid burning cheese edges.",
  },
  {
    key: "reheat_slice_6",
    label: "Reheat slice (6m)",
    method: "oven",
    minutes: 6,
    seconds: 0,
    note: "Good for reheating a slice in an oven or toaster oven. Check at 5 minutes.",
  },
  {
    key: "skillet_slice_5",
    label: "Skillet slice (5m)",
    method: "skillet",
    minutes: 5,
    seconds: 0,
    note: "Skillet reheating can be fast. Cover with a lid to melt cheese.",
  },
];

function PizzaTimerCard() {
  const beep = useBeep();

  const [method, setMethod] = useState<HeatMethod>("oven");

  const [minutes, setMinutes] = useState(14);
  const [seconds, setSeconds] = useState(0);

  const [remaining, setRemaining] = useState((minutes * 60 + seconds) * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [checkAtMin, setCheckAtMin] = useState<number>(2);

  // Reminder mode (default = repeating)
  const [reminderMode, setReminderMode] = useState<
    "none" | "triple" | "repeat"
  >("repeat");
  const [reminderFired, setReminderFired] = useState(false);
  const reminderRepeatUntilRef = useRef<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const stopReminder = useCallback(() => {
    reminderRepeatUntilRef.current = null;
  }, []);

  const playReminder = useCallback(() => {
    if (!sound || reminderMode === "none") return;

    if (reminderMode === "triple") {
      beep(740, 140);
      window.setTimeout(() => beep(740, 140), 220);
      window.setTimeout(() => beep(740, 140), 440);
      return;
    }

    // repeat mode: beep every 2s for ~10s
    const until = performance.now() + 10_000;
    reminderRepeatUntilRef.current = until;

    const loop = () => {
      const u = reminderRepeatUntilRef.current;
      if (!u) return;
      if (performance.now() >= u) {
        reminderRepeatUntilRef.current = null;
        return;
      }
      beep(740, 140);
      window.setTimeout(loop, 2000);
    };

    loop();
  }, [sound, reminderMode, beep]);

  function applyPreset(p: PizzaPreset) {
    setMethod(p.method);
    setMinutes(p.minutes);
    setSeconds(p.seconds);

    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    setRemaining((p.minutes * 60 + p.seconds) * 1000);

    // default "check early" cue
    if (p.method === "air_fryer") setCheckAtMin(2);
    else if (p.method === "skillet") setCheckAtMin(1);
    else setCheckAtMin(2);

    setReminderFired(false);
    stopReminder();
  }

  useEffect(() => {
    setRemaining((minutes * 60 + seconds) * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;

    setReminderFired(false);
    stopReminder();
  }, [minutes, seconds, stopReminder]);

  // reset reminder when starting a run
  useEffect(() => {
    if (!running) return;
    setReminderFired(false);
    stopReminder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopReminder();
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remaining;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      // "check early" reminder when remaining hits X minutes
      const checkAtMs = clamp(checkAtMin, 0, 60) * 60 * 1000;
      if (
        sound &&
        !reminderFired &&
        checkAtMs > 0 &&
        rem <= checkAtMs &&
        rem > Math.max(0, checkAtMs - 400)
      ) {
        setReminderFired(true);
        playReminder();
      }

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        setReminderFired(false);
        stopReminder();
        if (sound) beep(660, 220);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [
    running,
    remaining,
    sound,
    finalCountdownBeeps,
    beep,
    checkAtMin,
    reminderFired,
    playReminder,
    stopReminder,
  ]);

  function reset() {
    setRunning(false);
    setRemaining((minutes * 60 + seconds) * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;

    setReminderFired(false);
    stopReminder();
  }

  function startPause() {
    if (!running && sound) beep(0, 1); // prime audio
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const selectedNote = useMemo(() => {
    const p = PRESETS.find(
      (x) =>
        x.method === method && x.minutes === minutes && x.seconds === seconds,
    );
    if (p) return p.note;
    if (method === "air_fryer")
      return "Air fryers run hot and fast. Check early to avoid burning.";
    if (method === "skillet")
      return "Skillet reheating is quick. Use a lid to melt cheese.";
    return "Use your box instructions as the source of truth. This timer helps you stay on track.";
  }, [method, minutes, seconds]);

  const methodLabel = useMemo(() => {
    if (method === "air_fryer") return "Air fryer";
    if (method === "skillet") return "Skillet";
    if (method === "oven") return "Oven";
    return "Custom";
  }, [method]);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Pizza Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            A <strong>pizza timer</strong> and{" "}
            <strong>frozen pizza timer</strong> with quick presets. Big digits,
            optional sound, and fullscreen mode.
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
            onClick={() =>
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => applyPreset(p)}
            className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
              p.method === method &&
              p.minutes === minutes &&
              p.seconds === seconds
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
            }`}
          >
            {p.label}
          </button>
        ))}

        <span className="mx-1 text-xs font-semibold text-amber-800">
          Method: {methodLabel}
        </span>
      </div>

      {/* Inputs */}
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <label className="block text-sm font-semibold text-amber-950">
          Minutes
          <input
            type="number"
            min={0}
            max={180}
            value={minutes}
            onChange={(e) =>
              setMinutes(clamp(Number(e.target.value || 0), 0, 180))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Seconds
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) =>
              setSeconds(clamp(Number(e.target.value || 0), 0, 59))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HeatMethod)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="oven">Oven</option>
            <option value="air_fryer">Air fryer</option>
            <option value="skillet">Skillet</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause} disabled={minutes * 60 + seconds <= 0}>
            {running ? "Pause" : "Start"}
          </Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
        </div>
      </div>

      {/* Check early */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Check with <span className="font-extrabold">{checkAtMin}</span> min
          left
          <input
            type="number"
            min={0}
            max={30}
            value={checkAtMin}
            onChange={(e) =>
              setCheckAtMin(clamp(Number(e.target.value || 0), 0, 30))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-amber-800">
            Reminder will sound when this much time remains.
          </div>
        </label>

        <div className="grid gap-2">
          <label className="block text-sm font-semibold text-amber-950">
            Reminder style
            <select
              value={reminderMode}
              onChange={(e) =>
                setReminderMode(e.target.value as "none" | "triple" | "repeat")
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              disabled={!sound}
            >
              <option value="repeat">Repeating (10s)</option>
              <option value="triple">Triple beep</option>
              <option value="none">None</option>
            </select>
            {!sound ? (
              <div className="mt-1 text-xs text-amber-800">
                Enable Sound to use reminders.
              </div>
            ) : null}
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Btn
              kind="ghost"
              onClick={() => playReminder()}
              disabled={!sound || reminderMode === "none"}
              className="h-fit"
            >
              Test reminder
            </Btn>

            <Btn
              kind="ghost"
              onClick={() => stopReminder()}
              disabled={!sound}
              className="h-fit"
            >
              Stop sound
            </Btn>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Doneness checklist
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Cheese bubbling and starting to brown</li>
            <li>Crust edges golden</li>
            <li>Bottom crisp (lift with spatula)</li>
          </ul>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
          Tip
        </div>
        <div className="mt-1 text-sm font-semibold text-amber-950">
          {selectedNote}
        </div>
        <div className="mt-2 text-sm text-amber-900">
          Frozen pizza varies a lot by brand and thickness. Use the box time as
          the baseline and this timer to keep you honest.
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          urgent
            ? "border-rose-300 bg-rose-50 text-rose-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 260 }}
        aria-live="polite"
      >
        {/* Fullscreen CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen [data-shell="normal"]{display:none;}
              [data-fs-container]:fullscreen [data-shell="fullscreen"]{
                display:flex;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                padding:4vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1400px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:16px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(92px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 18px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full p-6"
          style={{ minHeight: 260 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              {methodLabel} · Pizza timer
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {shownTime}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-amber-800">
              <span className="rounded-full bg-amber-500/30 px-3 py-1">
                Check with {checkAtMin} min left
              </span>
              <span className="rounded-full bg-amber-500/30 px-3 py-1">
                Reminder{" "}
                {sound
                  ? reminderMode === "repeat"
                    ? "repeating"
                    : reminderMode === "triple"
                      ? "triple"
                      : "off"
                  : "off"}
              </span>
              <span className="rounded-full bg-amber-500/30 px-3 py-1">
                Sound {sound ? "on" : "off"}
              </span>
            </div>

            <div className="text-xs font-semibold text-amber-800">
              Shortcuts: Space start/pause · R reset · F fullscreen
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Pizza Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-sub">
              {methodLabel}
              {" · "}
              Check at {checkAtMin} min left
            </div>
            <div className="fs-help">
              Space start/pause · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function PizzaTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/pizza-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Pizza Timer",
        url,
        description:
          "A pizza timer and frozen pizza timer with presets for common bake times, a doneness checklist, fullscreen display, and optional sound.",
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
            name: "Pizza Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How long does frozen pizza take?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Many frozen pizzas bake in roughly 12 to 18 minutes in a conventional oven, but it varies by brand, thickness, and oven temperature. Use the box instructions as the baseline and check early.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use this as a frozen pizza timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Pick a frozen pizza preset (or set your own time) and start the countdown. You can also set a reminder to check doneness a few minutes before the end.",
            },
          },
          {
            "@type": "Question",
            name: "Should I set a reminder to check pizza early?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Pizza can go from perfect to overdone quickly. A reminder 1 to 3 minutes before the end helps you check cheese bubbling, crust color, and crispness.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, and F toggles fullscreen while the timer card is focused.",
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
            / <span className="text-amber-950">Pizza Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Pizza Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>pizza timer</strong> and{" "}
            <strong>frozen pizza timer</strong> with quick presets and a
            reminder to check doneness early.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <PizzaTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Frozen pizza timer presets
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Pick a preset (like 14m or 16m) and adjust to match your box
              instructions and oven.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Check a few minutes early
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Pizza can finish faster than the box depending on oven
              calibration. A check reminder prevents burning.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>Space</strong> = Start / Pause
              </li>
              <li>
                <strong>R</strong> = Reset
              </li>
              <li>
                <strong>F</strong> = Fullscreen
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free pizza timer and frozen pizza timer
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>pizza timer</strong> is a simple countdown designed
              for cooking pizza in an oven or air fryer. It also works as a{" "}
              <strong>frozen pizza timer</strong> by offering common bake-time
              presets.
            </p>

            <p>
              Frozen pizza brands vary a lot. Use your box instructions for
              temperature and baseline time, then set a reminder to check
              doneness a few minutes before the end.
            </p>

            <p>
              For a general cooking countdown, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For boiled eggs, use{" "}
              <Link to="/egg-timer" className="font-semibold hover:underline">
                Egg Timer
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Pizza timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Big countdown that is easy to glance at while cooking.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Frozen pizza timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Presets for common ranges, plus easy custom time.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Check reminder
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Repeating reminder by default so you actually notice it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Pizza Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How long does frozen pizza take?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many frozen pizzas bake in about <strong>12 to 18 minutes</strong>{" "}
              in a conventional oven, but it depends on the brand, thickness,
              temperature, and your oven. Use the box instructions and check
              early.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Should I set a timer to check pizza early?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Pizza can finish faster than expected. A reminder at{" "}
              <strong>1 to 3 minutes</strong> remaining helps you avoid burning
              the cheese or crust.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use this for air fryer pizza?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Choose an air fryer preset or set your own time. Air fryers
              vary, so start checking early.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>F</strong> fullscreen.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
