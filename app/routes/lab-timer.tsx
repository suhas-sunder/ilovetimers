// app/routes/lab-timer.tsx
import type { Route } from "./+types/lab-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import RelatedSites from "~/clients/components/navigation/RelatedSites";
import TimerMenuLinks from "~/clients/components/navigation/TimerMenuLinks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Lab Timer | Experiment & Reaction Timer (Stopwatch, Laps, Repeat Countdown)";
  const description =
    "Free lab timer for experiments and reaction timing. Includes stopwatch with laps (splits), a repeatable countdown for timed steps, fullscreen display, optional sound, and keyboard shortcuts.";
  const url = "https://ilovetimers.com/lab-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "lab timer",
        "experiment timer",
        "reaction timer",
        "lab stopwatch",
        "timer with laps",
        "splits timer",
        "repeat countdown timer",
        "fullscreen timer",
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

function msToStopwatch(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((t % 1000) / 10); // centiseconds
  return `${m}:${pad2(sec)}.${pad2(cs)}`;
}

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
   LAB TIMER CARD (STOPWATCH + LAPS + REPEAT COUNTDOWN)
========================================================= */
type Lap = { n: number; ms: number; atMs: number };

function LabTimerCard() {
  const beep = useBeep();

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  /* ---------- Stopwatch ---------- */
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [maxLaps, setMaxLaps] = useState(60);

  const swRafRef = useRef<number | null>(null);
  const swStartRef = useRef<number | null>(null);
  const swBaseRef = useRef<number>(0);

  useEffect(() => {
    if (!swRunning) {
      if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
      swRafRef.current = null;
      swStartRef.current = null;
      swBaseRef.current = swElapsed;
      return;
    }

    if (!swStartRef.current) swStartRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = now - (swStartRef.current ?? now);
      setSwElapsed(swBaseRef.current + delta);
      swRafRef.current = requestAnimationFrame(tick);
    };

    swRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
      swRafRef.current = null;
    };
  }, [swRunning, swElapsed]);

  function swStartPause() {
    setSwRunning((r) => !r);
  }

  function swReset() {
    setSwRunning(false);
    setSwElapsed(0);
    swBaseRef.current = 0;
    swStartRef.current = null;
    setLaps([]);
  }

  function swLap() {
    if (!swRunning) return;
    setLaps((prev) => {
      if (prev.length >= maxLaps) return prev;
      const lastAt = prev[0]?.atMs ?? 0;
      const split = Math.max(0, swElapsed - lastAt);
      const next: Lap = { n: prev.length + 1, ms: split, atMs: swElapsed };
      return [next, ...prev];
    });
    if (sound) beep(880, 80);
  }

  const bestLap = useMemo(() => {
    if (!laps.length) return null;
    return Math.min(...laps.map((l) => l.ms));
  }, [laps]);

  /* ---------- Repeatable Countdown ---------- */
  const cdDisplayRef = useRef<HTMLDivElement>(null);

  const [stepSec, setStepSec] = useState(60); // default: 1 minute lab step
  const [cdRemaining, setCdRemaining] = useState(stepSec * 1000);
  const [cdRunning, setCdRunning] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const repeatRef = useRef(true);

  const cdRafRef = useRef<number | null>(null);
  const cdEndRef = useRef<number | null>(null);
  const cdLastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    setCdRemaining(stepSec * 1000);
    setCdRunning(false);
    cdEndRef.current = null;
    cdLastBeepSecondRef.current = null;
  }, [stepSec]);

  useEffect(() => {
    if (!cdRunning) {
      if (cdRafRef.current) cancelAnimationFrame(cdRafRef.current);
      cdRafRef.current = null;
      cdEndRef.current = null;
      cdLastBeepSecondRef.current = null;
      return;
    }

    if (!cdEndRef.current) cdEndRef.current = performance.now() + cdRemaining;

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (cdEndRef.current ?? now) - now);
      setCdRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (cdLastBeepSecondRef.current !== secLeft) {
          cdLastBeepSecondRef.current = secLeft;
          beep(880, 100);
        }
      }

      if (rem <= 0) {
        cdEndRef.current = null;
        cdLastBeepSecondRef.current = null;

        if (sound) beep(660, 240);

        if (repeatRef.current) {
          const next = stepSec * 1000;
          setCdRemaining(next);
          cdEndRef.current = performance.now() + next;
          cdRafRef.current = requestAnimationFrame(tick);
          return;
        }

        setCdRunning(false);
        return;
      }

      cdRafRef.current = requestAnimationFrame(tick);
    };

    cdRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (cdRafRef.current) cancelAnimationFrame(cdRafRef.current);
      cdRafRef.current = null;
    };
  }, [cdRunning, cdRemaining, sound, finalCountdownBeeps, stepSec, beep]);

  function cdStartPause() {
    setCdRunning((r) => !r);
    cdLastBeepSecondRef.current = null;
  }

  function cdReset() {
    setCdRunning(false);
    setCdRemaining(stepSec * 1000);
    cdEndRef.current = null;
    cdLastBeepSecondRef.current = null;
  }

  const quickSteps = useMemo(
    () => [10, 15, 30, 45, 60, 90, 120, 180, 300, 600],
    [],
  );
  const cdUrgent = cdRunning && cdRemaining > 0 && cdRemaining <= 10_000;
  const cdText = msToClock(Math.ceil(cdRemaining / 1000) * 1000);

  const swText = msToStopwatch(swElapsed);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    // Stopwatch
    if (e.key === " ") {
      e.preventDefault();
      swStartPause();
      return;
    }
    if (e.key.toLowerCase() === "l") {
      swLap();
      return;
    }
    if (e.key.toLowerCase() === "r") {
      swReset();
      cdReset();
      return;
    }
    // Countdown
    if (e.key.toLowerCase() === "c") {
      cdStartPause();
      return;
    }
    if (e.key.toLowerCase() === "t") {
      // toggle repeat
      setRepeat((v) => !v);
      return;
    }
    if (e.key.toLowerCase() === "f" && cdDisplayRef.current) {
      toggleFullscreen(cdDisplayRef.current);
      return;
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Lab Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            A simple <strong>experiment timer</strong> for labs: use the{" "}
            <strong>stopwatch + laps</strong> for reaction timing and the{" "}
            <strong>repeatable countdown</strong> for step-based protocols.
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
              cdDisplayRef.current && toggleFullscreen(cdDisplayRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Main layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* STOPWATCH + LAPS */}
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-amber-950">
              Stopwatch + Laps
            </h3>
            <div className="text-xs text-slate-600">mm:ss.cc format</div>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl">{swText}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Btn onClick={swStartPause}>{swRunning ? "Pause" : "Start"}</Btn>
            <Btn kind="ghost" onClick={swLap} disabled={!swRunning}>
              Lap
            </Btn>
            <Btn kind="ghost" onClick={swReset}>
              Reset
            </Btn>

            <label className="ml-auto inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
              Max laps
              <input
                type="number"
                min={10}
                max={300}
                value={maxLaps}
                onChange={(e) =>
                  setMaxLaps(clamp(Number(e.target.value || 60), 10, 300))
                }
                className="w-20 rounded-md border border-amber-300 bg-white px-2 py-1 text-amber-950"
              />
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
              Laps (newest first)
            </div>

            {laps.length ? (
              <div className="mt-3 max-h-[260px] overflow-auto rounded-xl border border-amber-200 bg-white">
                <div className="divide-y divide-amber-100">
                  {laps.map((l) => {
                    const isBest = bestLap != null && l.ms === bestLap;
                    return (
                      <div
                        key={`${l.n}-${l.atMs}`}
                        className="grid grid-cols-[70px_1fr_90px] items-center gap-2 px-3 py-2"
                      >
                        <div className="text-sm font-bold text-amber-950">
                          {l.n}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-extrabold text-slate-900">
                            {msToStopwatch(l.ms)}
                          </div>
                          <div className="text-xs text-slate-600">
                            {isBest ? "Best lap" : ""}
                          </div>
                        </div>
                        <div className="text-right font-mono text-sm font-semibold text-slate-900">
                          {msToStopwatch(l.atMs)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-amber-900">
                Start the stopwatch, then press <strong>L</strong> to record
                laps (splits).
              </div>
            )}
          </div>
        </div>

        {/* REPEATABLE COUNTDOWN */}
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-amber-950">
              Repeatable Countdown
            </h3>
            <div className="text-xs text-slate-600">great for timed steps</div>
          </div>

          {/* Step presets */}
          <div className="mt-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
              Common step times
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickSteps.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStepSec(s)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                    s === stepSec
                      ? "bg-amber-700 text-white hover:bg-amber-800"
                      : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                  }`}
                >
                  {s >= 60
                    ? `${Math.floor(s / 60)}m${s % 60 ? ` ${s % 60}s` : ""}`
                    : `${s}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block text-sm font-semibold text-amber-950">
              Custom step (seconds)
              <input
                type="number"
                min={1}
                max={24 * 60 * 60}
                value={stepSec}
                onChange={(e) =>
                  setStepSec(
                    clamp(Number(e.target.value || 1), 1, 24 * 60 * 60),
                  )
                }
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </label>

            <div className="flex items-end gap-3">
              <Btn onClick={cdStartPause}>{cdRunning ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={cdReset}>
                Reset
              </Btn>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
              <input
                type="checkbox"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
              />
              Repeat step
            </label>

            <div className="text-xs text-slate-600">
              If Repeat is on, the countdown restarts automatically after it
              hits zero.
            </div>
          </div>

          {/* Countdown display */}
          <div
            ref={cdDisplayRef}
            data-fs-container
            className={`mt-5 overflow-hidden rounded-2xl border-2 ${
              cdUrgent
                ? "border-rose-300 bg-rose-50 text-rose-950"
                : "border-amber-300 bg-amber-50 text-amber-950"
            }`}
            style={{ minHeight: 220 }}
            aria-live="polite"
          >
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
                    gap:18px;
                  }

                  [data-fs-container]:fullscreen .fs-label{
                    font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                    letter-spacing:.14em;
                    text-transform:uppercase;
                    opacity:.9;
                  }

                  [data-fs-container]:fullscreen .fs-time{
                    font: 900 clamp(96px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    letter-spacing:.10em;
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
              className="h-full w-full items-center justify-center p-6"
              style={{ minHeight: 220 }}
            >
              <div className="flex w-full flex-col items-center justify-center gap-2">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Step Countdown {repeat ? "· Repeat on" : ""}
                </div>
                <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
                  <span className="text-6xl sm:text-7xl">{cdText}</span>
                </div>
                <div className="text-xs text-slate-600">
                  C start/pause · R reset · T toggle repeat · F fullscreen
                </div>
              </div>
            </div>

            {/* Fullscreen shell */}
            <div data-shell="fullscreen">
              <div className="fs-inner">
                <div className="fs-label">Lab Step Timer</div>
                <div className="fs-time">{cdText}</div>
                <div className="fs-help">
                  C start/pause · R reset · T toggle repeat · F fullscreen
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
            Shortcuts: Space stopwatch start/pause · L lap · C countdown
            start/pause · R reset both · T repeat · F fullscreen
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function LabTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/lab-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Lab Timer",
        url,
        description:
          "Lab timer with stopwatch + laps and a repeatable countdown for experiment steps. Fullscreen display, optional sound, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Lab Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a lab timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A lab timer is used to track experiment steps and reactions. This page includes a stopwatch with laps for reaction timing and a repeatable countdown for step-based protocols.",
            },
          },
          {
            "@type": "Question",
            name: "How do laps work for reaction timing?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Start the stopwatch and press L (or Lap) to record a lap. Each lap shows the time since the previous lap plus the total elapsed time.",
            },
          },
          {
            "@type": "Question",
            name: "What is a repeatable countdown used for?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Repeatable countdown is useful for protocols with the same timed step repeated over and over. Turn Repeat on and the timer restarts automatically after it hits zero.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses the stopwatch, L records a lap, C starts/pauses the countdown, R resets both, T toggles repeat, and F toggles fullscreen while the card is focused.",
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

      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-amber-400 bg-amber-500/30/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            ⏱ i💛Timers
          </Link>
          <nav className="hidden gap-4 text-sm font-medium sm:flex">
            <Link to="/countdown-timer" className="hover:underline">
              Countdown
            </Link>
            <Link to="/stopwatch" className="hover:underline">
              Stopwatch
            </Link>
            <Link to="/pomodoro-timer" className="hover:underline">
              Pomodoro
            </Link>
            <Link to="/hiit-timer" className="hover:underline">
              HIIT
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Lab Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Lab Timer (Experiment + Reaction Timer)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>lab timer</strong> with a{" "}
            <strong>stopwatch + laps</strong> for reaction timing and a{" "}
            <strong>repeatable countdown</strong> for timed experiment steps.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <LabTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Reaction timing with laps
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use the stopwatch for runs and press Lap to mark reaction points.
              The newest laps show at the top.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Repeatable step countdown
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use the countdown for protocols like “mix 60s, rest 30s, repeat”
              by setting a step time and turning on Repeat.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen visibility
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen makes the countdown readable across a bench or
              classroom lab setup.
            </p>
          </div>
        </div>
      </section>

      {/* Menu Links */}
       <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free lab timer for experiments: stopwatch with laps and repeat
            countdown
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>lab timer</strong> is built for practical use in
              science labs, classrooms, and timed procedures. It includes two
              tools in one page: a <strong>stopwatch</strong> with{" "}
              <strong>laps</strong> for reaction timing and a{" "}
              <strong>repeatable countdown</strong> for step-based protocols.
            </p>

            <p>
              Use the stopwatch when you need “time since start” and lap markers
              for events. Use the repeat countdown when you need a consistent
              step that restarts automatically, like mixing cycles, incubation
              checks, or repeated timing blocks.
            </p>

            <p>
              For a basic single countdown, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For a plain stopwatch, use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Lab timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Designed for benches, classrooms, and repeatable steps.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Experiment timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Stopwatch + laps for tracking reaction points and events.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Reaction timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Record lap splits quickly without stopping your timing run.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Lab Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use this as an experiment timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Use the stopwatch for elapsed time and press Lap to mark events.
              Use the repeat countdown for step-based protocols.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What does repeatable countdown do?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              When Repeat is on, the countdown automatically restarts after it
              hits zero. That is useful for repeated steps like “stir 60
              seconds” or “check every 5 minutes.”
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Press <strong>F</strong> (or click Fullscreen) to show a
              large, high-contrast display.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> stopwatch start/pause • <strong>L</strong>{" "}
              lap • <strong>C</strong> countdown start/pause •{" "}
              <strong>R</strong> reset both • <strong>T</strong> toggle repeat •{" "}
              <strong>F</strong> fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 i💛Timers - free countdown, stopwatch, Pomodoro, and HIIT
          interval timers
        </div>
      </footer>
    </main>
  );
}
