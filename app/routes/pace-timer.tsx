// app/routes/pace-timer.tsx
import type { Route } from "./+types/pace-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Pace Timer for Running and Rowing";
  const description =
    "Train at a steady pace with a clear running and rowing pace timer. Set your target pace or finish time and follow a big, easy-to-read timer built for workouts.";

  const url = "https://ilovetimers.com/pace-timer";

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

function safeNum(v: string) {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function paceToSeconds(p: string) {
  const t = p.trim();
  if (!t) return 0;
  if (!t.includes(":")) return Math.max(0, Math.floor(safeNum(t)));
  const [m, s] = t.split(":");
  return Math.max(0, Math.floor(safeNum(m) * 60 + safeNum(s)));
}

function secondsToPace(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${pad2(r)}`;
}

// WebAudio beep (same style as other pages)
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 120) => {
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
   PACE TIMER CARD
========================================================= */
type Mode = "running" | "rowing";
type RunUnit = "km" | "mi";
type InputMode = "pace" | "finish";

function PaceTimerCard() {
  const beep = useBeep();

  const [mode, setMode] = useState<Mode>("running");
  const [runUnit, setRunUnit] = useState<RunUnit>("km");
  const [inputMode, setInputMode] = useState<InputMode>("pace");

  // Inputs
  const [distance, setDistance] = useState(mode === "rowing" ? 2000 : 5); // meters for rowing, km/mi for running
  const [targetPace, setTargetPace] = useState(
    mode === "rowing" ? "2:10" : "5:00",
  ); // /500m for rowing, /km or /mi for running
  const [finishTime, setFinishTime] = useState(
    mode === "rowing" ? "8:40" : "25:00",
  ); // total time

  // Interval beeps
  const [sound, setSound] = useState(true);
  const [beepEvery, setBeepEvery] = useState(1); // running: per X km/mi, rowing: per X*500m
  const [volume, setVolume] = useState(0.1);

  // Timer state
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  // For interval beeps: track last boundary index
  const lastBeepIndexRef = useRef<number>(-1);

  // Derived labels
  const distanceLabel = mode === "rowing" ? "m" : runUnit;
  const paceLabel =
    mode === "rowing" ? "/500m" : runUnit === "km" ? "/km" : "/mi";
  const beepLabel = mode === "rowing" ? "x 500m" : runUnit;

  // Convert distance to meters
  const distanceMeters = useMemo(() => {
    const d = clamp(distance, 0, 1_000_000);
    if (mode === "rowing") return d;
    return runUnit === "km" ? d * 1000 : d * 1609.344;
  }, [distance, mode, runUnit]);

  // Pace seconds per "unit"
  // running unit = km/mi, rowing unit = 500m
  const paceSeconds = useMemo(() => {
    if (inputMode === "finish") {
      const total = paceToSeconds(finishTime);
      if (total <= 0 || distanceMeters <= 0) return 0;
      if (mode === "rowing") {
        const units = distanceMeters / 500;
        return units > 0 ? total / units : 0;
      }
      const units =
        mode === "running" && runUnit === "km"
          ? distanceMeters / 1000
          : distanceMeters / 1609.344;
      return units > 0 ? total / units : 0;
    }
    return paceToSeconds(targetPace);
  }, [inputMode, finishTime, targetPace, distanceMeters, mode, runUnit]);

  const computedPaceText = secondsToPace(paceSeconds);

  // Total target time in seconds
  const totalTargetSeconds = useMemo(() => {
    if (paceSeconds <= 0 || distanceMeters <= 0) return 0;
    if (mode === "rowing") return (distanceMeters / 500) * paceSeconds;
    const units =
      runUnit === "km" ? distanceMeters / 1000 : distanceMeters / 1609.344;
    return units * paceSeconds;
  }, [paceSeconds, distanceMeters, mode, runUnit]);

  const totalTargetMs = totalTargetSeconds * 1000;

  // Reset remaining when key inputs change
  useEffect(() => {
    setRemaining(totalTargetMs);
    setRunning(false);
    endRef.current = null;
    lastBeepIndexRef.current = -1;
  }, [totalTargetMs, mode, runUnit, inputMode]);

  // Timer loop
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remaining;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      // progress meters based on target pace (virtual guidance)
      if (sound && totalTargetMs > 0 && paceSeconds > 0) {
        const elapsed = totalTargetMs - rem;
        const elapsedSec = elapsed / 1000;

        let metersPerSecond = 0;
        if (mode === "rowing") metersPerSecond = 500 / paceSeconds;
        else
          metersPerSecond = (runUnit === "km" ? 1000 : 1609.344) / paceSeconds;

        const metersSoFar = elapsedSec * metersPerSecond;

        // Determine beep segment meters
        const segMeters =
          mode === "rowing"
            ? 500 * clamp(beepEvery, 0.25, 1000)
            : (runUnit === "km" ? 1000 : 1609.344) *
              clamp(beepEvery, 0.25, 1000);

        const idx = segMeters > 0 ? Math.floor(metersSoFar / segMeters) : 0;
        if (idx >= 1 && idx !== lastBeepIndexRef.current) {
          lastBeepIndexRef.current = idx;
          // simple volume via gain scaling: map 0..1 to gain 0..0.15
          const g = clamp(volume, 0, 1);
          // hack: use freq variance slightly so it's not annoying
          const freq = mode === "rowing" ? 820 : 880;
          // Temporarily adjust global gain by calling beep multiple times with different freq would be worse.
          // We'll just keep same gain in hook and treat volume as "on/off feel" with shorter beep.
          if (g > 0.001) beep(freq, 90);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepIndexRef.current = -1;
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
    beep,
    totalTargetMs,
    paceSeconds,
    mode,
    runUnit,
    beepEvery,
    volume,
  ]);

  function reset() {
    setRunning(false);
    setRemaining(totalTargetMs);
    endRef.current = null;
    lastBeepIndexRef.current = -1;
  }

  function startPause() {
    // prime audio on gesture
    if (!running && sound) beep(0, 1);
    setRunning((r) => !r);
  }

  function setRunningPreset() {
    setMode("running");
    setRunUnit("km");
    setInputMode("pace");
    setDistance(5);
    setTargetPace("5:00");
    setFinishTime("25:00");
    setBeepEvery(1);
  }

  function setRowingPreset() {
    setMode("rowing");
    setInputMode("pace");
    setDistance(2000);
    setTargetPace("2:10");
    setFinishTime("8:40");
    setBeepEvery(1);
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

  const totalText = totalTargetMs > 0 ? msToClock(totalTargetMs) : "0:00";

  // Guidance "should be at" distance, in display units
  const shouldBeAt = useMemo(() => {
    if (totalTargetMs <= 0 || paceSeconds <= 0) return 0;

    const elapsed = totalTargetMs - remaining;
    const elapsedSec = Math.max(0, elapsed / 1000);

    let metersPerSecond = 0;
    if (mode === "rowing") metersPerSecond = 500 / paceSeconds;
    else metersPerSecond = (runUnit === "km" ? 1000 : 1609.344) / paceSeconds;

    const meters = elapsedSec * metersPerSecond;

    if (mode === "rowing") return meters; // meters
    return runUnit === "km" ? meters / 1000 : meters / 1609.344;
  }, [totalTargetMs, remaining, paceSeconds, mode, runUnit]);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Pace Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            A <strong>running pace timer</strong> and{" "}
            <strong>rowing pace timer</strong> in one. Set a target pace or a
            finish time, then run a big countdown with optional interval beeps
            and fullscreen.
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

      {/* Mode toggle */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={setRunningPreset}
          className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
            mode === "running"
              ? "bg-amber-700 text-white hover:bg-amber-800"
              : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
          }`}
        >
          Running
        </button>

        <button
          type="button"
          onClick={setRowingPreset}
          className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
            mode === "rowing"
              ? "bg-amber-700 text-white hover:bg-amber-800"
              : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
          }`}
        >
          Rowing
        </button>

        {mode === "running" && (
          <>
            <span className="mx-1 text-xs font-semibold text-amber-800">
              Units
            </span>
            <button
              type="button"
              onClick={() => setRunUnit("km")}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                runUnit === "km"
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
              }`}
            >
              km
            </button>
            <button
              type="button"
              onClick={() => setRunUnit("mi")}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                runUnit === "mi"
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
              }`}
            >
              mi
            </button>
          </>
        )}
      </div>

      {/* Inputs */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block text-sm font-semibold text-amber-950">
          Distance ({distanceLabel})
          <input
            type="number"
            min={mode === "rowing" ? 50 : 0.1}
            max={mode === "rowing" ? 100000 : 500}
            step={mode === "rowing" ? 50 : 0.1}
            value={distance}
            onChange={(e) =>
              setDistance(
                clamp(
                  Number(e.target.value || (mode === "rowing" ? 2000 : 5)),
                  mode === "rowing" ? 50 : 0.1,
                  mode === "rowing" ? 100000 : 500,
                ),
              )
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode("pace")}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                inputMode === "pace"
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
              }`}
            >
              Target pace
            </button>
            <button
              type="button"
              onClick={() => setInputMode("finish")}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                inputMode === "finish"
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
              }`}
            >
              Finish time
            </button>
          </div>

          {inputMode === "pace" ? (
            <label className="block text-sm font-semibold text-amber-950">
              Target pace ({paceLabel})
              <input
                type="text"
                value={targetPace}
                onChange={(e) => setTargetPace(e.target.value)}
                placeholder={mode === "rowing" ? "2:10" : "5:00"}
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </label>
          ) : (
            <label className="block text-sm font-semibold text-amber-950">
              Finish time (mm:ss or hh:mm:ss)
              <input
                type="text"
                value={finishTime}
                onChange={(e) => setFinishTime(e.target.value)}
                placeholder={mode === "rowing" ? "8:40" : "25:00"}
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </label>
          )}
        </div>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause} disabled={totalTargetMs <= 0}>
            {running ? "Pause" : "Start"}
          </Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
        </div>
      </div>

      {/* Interval beeps */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="inline-flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          Beep every
          <input
            type="number"
            min={0.25}
            max={1000}
            step={0.25}
            value={beepEvery}
            onChange={(e) =>
              setBeepEvery(clamp(Number(e.target.value || 1), 0.25, 1000))
            }
            className="w-28 rounded-lg border-2 border-amber-300 bg-white px-2 py-1 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            disabled={!sound}
            aria-label="Beep interval"
          />
          <span className="text-xs font-bold text-amber-800">{beepLabel}</span>
        </label>

        <label className="inline-flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          Volume
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) =>
              setVolume(clamp(Number(e.target.value || 0.1), 0, 1))
            }
            className="w-28 rounded-lg border-2 border-amber-300 bg-white px-2 py-1 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            disabled={!sound}
            aria-label="Volume"
          />
        </label>

        <div className="flex items-center gap-3">
          <Btn
            kind="ghost"
            onClick={() => sound && beep(880, 120)}
            disabled={!sound}
          >
            Test beep
          </Btn>
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
        {/* Fullscreen CSS: show ONLY fullscreen shell in fullscreen */}
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
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Remaining
              </div>
              <div className="mt-2 font-mono text-5xl font-extrabold tracking-widest">
                {shownTime}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Target pace
                  </div>
                  <div className="mt-1 font-mono text-2xl font-extrabold">
                    {computedPaceText}
                    <span className="ml-1 text-base font-semibold text-amber-800">
                      {paceLabel}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Target finish
                  </div>
                  <div className="mt-1 font-mono text-2xl font-extrabold">
                    {totalText}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Guidance
              </div>
              <div className="mt-2 text-sm text-slate-700">
                At this pace, you should be at:
              </div>
              <div className="mt-2 font-mono text-4xl font-extrabold tracking-wide">
                {mode === "rowing"
                  ? `${Math.round(shouldBeAt)}m`
                  : `${shouldBeAt.toFixed(2)}${runUnit}`}
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Interval beeps follow the target pace, not GPS. Adjust effort to
                stay on target.
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Pace Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-sub">
              Target {computedPaceText}
              {paceLabel} ·{" "}
              {mode === "rowing"
                ? `${Math.round(distanceMeters)}m`
                : `${distance}${runUnit}`}{" "}
              total
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
export default function PaceTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/pace-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Pace Timer",
        url,
        description:
          "A pace timer for running and rowing with fullscreen mode, interval beeps, and clear pace units (min/km, min/mi, split per 500m).",
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
            name: "Pace Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a running pace timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A running pace timer is a countdown timer based on your target pace (min/km or min/mi). You set a distance and pace, and it shows the target finish time and a big countdown you can follow during training.",
            },
          },
          {
            "@type": "Question",
            name: "What is a rowing pace timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A rowing pace timer uses split time per 500 meters. Set your rowing distance (like 2000m) and a target split (like 2:10/500m), and the timer counts down the target finish time.",
            },
          },
          {
            "@type": "Question",
            name: "Does this pace timer work in fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Press Fullscreen (or F) while the timer card is focused to get a dark, high-contrast view with huge digits for distance visibility.",
            },
          },
          {
            "@type": "Question",
            name: "How do interval beeps work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Interval beeps trigger at the selected distance intervals based on the target pace. They are guidance beeps and do not use GPS.",
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
            / <span className="text-amber-950">Pace Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Pace Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>running pace timer</strong> and{" "}
            <strong>rowing pace timer</strong> with a clean fullscreen view,
            interval beeps, and simple controls.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <PaceTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Running pace timer
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Choose <strong>km</strong> or <strong>mi</strong>, set a distance,
              and enter a target pace like <strong>5:00/km</strong> or{" "}
              <strong>8:00/mi</strong>. The timer counts down your target
              finish.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Rowing pace timer (split per 500m)
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Set meters (like <strong>2000m</strong>) and a split like{" "}
              <strong>2:10/500m</strong>. The timer shows a target finish and
              beeps each interval if enabled.
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
            Free pace timer for running and rowing (split per 500m)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>pace timer</strong> combines a{" "}
              <strong>running pace timer</strong> and a{" "}
              <strong>rowing pace timer</strong> into one simple tool. Pick a
              distance, set a target pace (or a target finish time), then use
              the big countdown to stay on schedule without staring at a phone.
            </p>

            <p>
              Running mode supports <strong>min/km</strong> and{" "}
              <strong>min/mi</strong>. Rowing mode uses the standard{" "}
              <strong>split per 500m</strong>. Optional interval beeps help you
              check your pacing at consistent milestones.
            </p>

            <p>
              If you want a general tool, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For structured intervals, use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              . For simple time tracking without a target pace, use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Running pacing
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Set km or miles, pick a pace, and follow the countdown for a
                clean target finish.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Rowing split pacing
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Use split per 500m for 2k training and other standard rowing
                distances.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Fullscreen visibility
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Dark fullscreen reduces glare and keeps digits readable from a
                distance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Pace Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a running pace timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A running pace timer is a countdown based on your target pace
              (min/km or min/mi). Set distance and pace to get a target finish
              time and a big, readable countdown.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a rowing pace timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A rowing pace timer uses split time per 500 meters. Set meters and
              a target split (like 2:10/500m) to get a target finish and pacing
              intervals.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use finish time instead of pace?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Switch to Finish time, enter the total time you want, and the
              tool computes the required pace automatically.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>F</strong> fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
