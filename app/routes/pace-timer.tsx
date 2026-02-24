// app/routes/pace-timer.tsx
import type { Route } from "./+types/pace-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Pace Timer (Running & Rowing, Target Pace)";
  const description =
    "Train at a steady pace with a clear running and rowing pace timer. Set your target pace or finish time and follow a big, easy-to-read timer built for workouts.";

  const url = "https://www.ilovetimers.com/pace-timer";

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

function safeNum(v: string) {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function timeToSecondsFlexible(v: string) {
  const t = v.trim();
  if (!t) return 0;

  const parts = t.split(":").map((x) => safeNum(x));
  if (parts.length === 1) return Math.max(0, Math.floor(parts[0])); // seconds
  if (parts.length === 2) {
    const [m, s] = parts;
    return Math.max(0, Math.floor(m * 60 + s));
  }
  const [h, m, s] = parts;
  return Math.max(0, Math.floor(h * 3600 + m * 60 + s));
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

// WebAudio beep with real volume control
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const prime = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const beep = useCallback((freq = 880, duration = 120, vol = 0.1) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const o = ctx.createOscillator();
      const g = ctx.createGain();

      o.type = "sine";
      o.frequency.value = Math.max(1, freq);

      // map 0..1 to 0..0.15
      g.gain.value = clamp(vol, 0, 1) * 0.15;

      o.connect(g);
      g.connect(ctx.destination);

      o.start();
      window.setTimeout(
        () => {
          o.stop();
          o.disconnect();
          g.disconnect();
        },
        Math.max(10, duration),
      );
    } catch {
      // ignore
    }
  }, []);

  return { prime, beep };
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

/**
 * Fit a single-line time string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
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
    className={[
      "relative h-full rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-amber-300/60",
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

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
      active
        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ].join(" ")}
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
  const { prime, beep } = useBeep();

  const [mode, setMode] = useState<Mode>("running");
  const [runUnit, setRunUnit] = useState<RunUnit>("km");
  const [inputMode, setInputMode] = useState<InputMode>("pace");

  // Inputs
  const [distance, setDistance] = useState<number>(5); // meters for rowing, km/mi for running
  const [targetPace, setTargetPace] = useState<string>("5:00"); // /500m for rowing, /km or /mi for running
  const [finishTime, setFinishTime] = useState<string>("25:00"); // total time

  // Interval beeps
  const [sound, setSound] = useState(true);
  const [beepEvery, setBeepEvery] = useState(1); // running: per X km/mi, rowing: per X*500m
  const [volume, setVolume] = useState(0.1);

  // Timer state
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(0);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  // For interval beeps: track last boundary index
  const lastBeepIndexRef = useRef<number>(-1);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Labels
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

  // Pace seconds per "unit" (running: per km/mi, rowing: per 500m)
  const paceSeconds = useMemo(() => {
    if (inputMode === "finish") {
      const total = timeToSecondsFlexible(finishTime);
      if (total <= 0 || distanceMeters <= 0) return 0;

      if (mode === "rowing") {
        const units = distanceMeters / 500;
        return units > 0 ? total / units : 0;
      }

      const units =
        runUnit === "km" ? distanceMeters / 1000 : distanceMeters / 1609.344;
      return units > 0 ? total / units : 0;
    }

    return paceToSeconds(targetPace);
  }, [inputMode, finishTime, targetPace, distanceMeters, mode, runUnit]);

  const computedPaceText = secondsToPace(paceSeconds);

  // Total target time
  const totalTargetSeconds = useMemo(() => {
    if (paceSeconds <= 0 || distanceMeters <= 0) return 0;
    if (mode === "rowing") return (distanceMeters / 500) * paceSeconds;
    const units =
      runUnit === "km" ? distanceMeters / 1000 : distanceMeters / 1609.344;
    return units * paceSeconds;
  }, [paceSeconds, distanceMeters, mode, runUnit]);

  const totalTargetMs = Math.max(0, Math.round(totalTargetSeconds * 1000));

  // Reset remaining when key inputs change
  useEffect(() => {
    setRunning(false);
    endRef.current = null;
    lastBeepIndexRef.current = -1;
    setRemaining(totalTargetMs);
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
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && totalTargetMs > 0 && paceSeconds > 0) {
        const elapsed = totalTargetMs - rem;
        const elapsedSec = elapsed / 1000;

        const metersPerSecond =
          mode === "rowing"
            ? 500 / paceSeconds
            : (runUnit === "km" ? 1000 : 1609.344) / paceSeconds;

        const metersSoFar = elapsedSec * metersPerSecond;

        const segMeters =
          mode === "rowing"
            ? 500 * clamp(beepEvery, 0.25, 1000)
            : (runUnit === "km" ? 1000 : 1609.344) *
              clamp(beepEvery, 0.25, 1000);

        const idx = segMeters > 0 ? Math.floor(metersSoFar / segMeters) : 0;

        if (idx >= 1 && idx !== lastBeepIndexRef.current) {
          lastBeepIndexRef.current = idx;
          const freq = mode === "rowing" ? 820 : 880;
          const vol = clamp(volume, 0, 1);
          if (vol > 0.001) beep(freq, 90, vol);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepIndexRef.current = -1;
        if (sound) beep(660, 220, clamp(volume, 0, 1));
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
    sound,
    beep,
    totalTargetMs,
    paceSeconds,
    mode,
    runUnit,
    beepEvery,
    volume,
  ]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  function reset() {
    setRunning(false);
    setRemaining(totalTargetMs);
    endRef.current = null;
    lastBeepIndexRef.current = -1;
  }

  function startPause() {
    if (!running && sound) prime();
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

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      if (totalTargetMs > 0) startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const totalText = totalTargetMs > 0 ? msToClock(totalTargetMs) : "0:00";

  const statusLabel =
    totalTargetMs <= 0
      ? "Set inputs"
      : running
        ? "Running"
        : remaining < totalTargetMs
          ? "Paused"
          : "Ready";

  // Guidance "should be at" distance, in display units
  const shouldBeAt = useMemo(() => {
    if (totalTargetMs <= 0 || paceSeconds <= 0) return 0;

    const elapsed = totalTargetMs - remaining;
    const elapsedSec = Math.max(0, elapsed / 1000);

    const metersPerSecond =
      mode === "rowing"
        ? 500 / paceSeconds
        : (runUnit === "km" ? 1000 : 1609.344) / paceSeconds;

    const meters = elapsedSec * metersPerSecond;

    if (mode === "rowing") return meters; // meters
    return runUnit === "km" ? meters / 1000 : meters / 1609.344;
  }, [totalTargetMs, remaining, paceSeconds, mode, runUnit]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, urgent, running, mode, runUnit, inputMode],
    minPx: 64,
    maxPx: 360,
    paddingAllowancePx: 72,
  });

  const fsSubtitle = useMemo(() => {
    const distText =
      mode === "rowing"
        ? `${Math.round(distanceMeters)}m`
        : `${distance}${runUnit}`;
    return `Target ${computedPaceText}${paceLabel} · ${distText} total`;
  }, [mode, distanceMeters, distance, runUnit, computedPaceText, paceLabel]);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-sky-700">
            Pace Timer (Running and Rowing)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Set a target pace or finish time, then follow a big countdown.
            Optional interval beeps included.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
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

      {/* DISPLAY (clock first) */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={[
          "mt-4 overflow-hidden rounded-2xl border bg-slate-50 text-slate-950",
          urgent ? "border-rose-200" : "border-slate-200",
        ].join(" ")}
        style={{ minHeight: 320 }}
        aria-live="polite"
      >
        {/* Fullscreen CSS (UNCHANGED behavior): show ONLY fullscreen shell in fullscreen */}
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
          ref={displayBoxRef}
          className="relative w-full flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: 320,
            userSelect: "none",
          }}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className="mt-2 inline-block text-center font-mono font-extrabold tracking-widest"
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Target {computedPaceText}
              {paceLabel}
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Finish {totalText}
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {mode === "rowing"
                ? `${Math.round(distanceMeters)}m`
                : `${distance}${runUnit}`}{" "}
              total
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            At this pace, you should be at{" "}
            <span className="font-extrabold text-slate-900">
              {mode === "rowing"
                ? `${Math.round(shouldBeAt)}m`
                : `${shouldBeAt.toFixed(2)}${runUnit}`}
            </span>
            .
          </div>
        </div>

        {/* Fullscreen shell (kept as before) */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Pace Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-sub">{fsSubtitle}</div>
            <div className="fs-help">
              Space start/pause · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS (moved under the clock) */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-4">
          {/* Row 1: mode/units + input mode + sound */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip active={mode === "running"} onClick={setRunningPreset}>
                Running
              </Chip>
              <Chip active={mode === "rowing"} onClick={setRowingPreset}>
                Rowing
              </Chip>

              {mode === "running" && (
                <>
                  <span className="mx-1 text-xs font-semibold text-slate-500">
                    Units
                  </span>
                  <Chip
                    active={runUnit === "km"}
                    onClick={() => setRunUnit("km")}
                  >
                    km
                  </Chip>
                  <Chip
                    active={runUnit === "mi"}
                    onClick={() => setRunUnit("mi")}
                  >
                    mi
                  </Chip>
                </>
              )}

              <span className="mx-1 text-xs font-semibold text-slate-500">
                Input
              </span>
              <Chip
                active={inputMode === "pace"}
                onClick={() => setInputMode("pace")}
              >
                Target pace
              </Chip>
              <Chip
                active={inputMode === "finish"}
                onClick={() => setInputMode("finish")}
              >
                Finish time
              </Chip>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
              />
              Sound
            </label>
          </div>

          {/* Row 2: main inputs */}
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <label className="block text-sm font-semibold text-slate-900">
              Distance ({distanceLabel})
              <input
                type="number"
                min={mode === "rowing" ? 50 : 0.1}
                max={mode === "rowing" ? 100000 : 500}
                step={mode === "rowing" ? 50 : 0.1}
                value={distance}
                onChange={(e) => {
                  const fallback = mode === "rowing" ? 2000 : 5;
                  const v = Number(e.target.value || fallback);
                  setDistance(
                    clamp(
                      v,
                      mode === "rowing" ? 50 : 0.1,
                      mode === "rowing" ? 100000 : 500,
                    ),
                  );
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            {inputMode === "pace" ? (
              <label className="block text-sm font-semibold text-slate-900">
                Target pace ({paceLabel})
                <input
                  type="text"
                  value={targetPace}
                  onChange={(e) => setTargetPace(e.target.value)}
                  placeholder={mode === "rowing" ? "2:10" : "5:00"}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
              </label>
            ) : (
              <label className="block text-sm font-semibold text-slate-900">
                Finish time (mm:ss or hh:mm:ss)
                <input
                  type="text"
                  value={finishTime}
                  onChange={(e) => setFinishTime(e.target.value)}
                  placeholder={mode === "rowing" ? "8:40" : "25:00"}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
              </label>
            )}
          </div>

          {/* Row 3: beeps */}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
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
                className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                disabled={!sound}
                aria-label="Beep interval"
              />
              <span className="text-xs font-bold text-slate-600">
                {beepLabel}
              </span>
            </label>

            <label className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
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
                className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                disabled={!sound}
                aria-label="Volume"
              />
            </label>

            <div className="flex items-center gap-3">
              <Btn
                kind="ghost"
                onClick={() => sound && beep(880, 120, clamp(volume, 0, 1))}
                disabled={!sound}
              >
                Test beep
              </Btn>
            </div>
          </div>

          {/* Row 4: actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · F fullscreen
            </div>

            <div className="flex items-center gap-3">
              <Btn onClick={startPause} disabled={totalTargetMs <= 0}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function PaceTimerPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/pace-timer";

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
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Pace Timer",
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
          <PaceTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Pace Timer</span>
        </p>
      </section>
    </main>
  );
}
