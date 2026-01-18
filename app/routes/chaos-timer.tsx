// app/routes/chaos-timer.tsx
import type { Route } from "./+types/chaos-timer";
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
    "Chaos Timer | Random Timer & Random Interval Timer (Fullscreen, Simple, Visible)";
  const description =
    "Free random timer and random interval timer. Generate random countdown durations for training, games, classroom drills, and focus sessions. Optional beep at each interval and a clean fullscreen display.";
  const url = "https://ilovetimers.com/chaos-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "random timer",
        "random interval timer",
        "random countdown timer",
        "random duration timer",
        "interval timer random",
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

function randInt(min: number, max: number) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
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
   CHAOS TIMER CARD
========================================================= */
type Mode = "single" | "intervals";

function ChaosTimerCard() {
  const beep = useBeep();

  const [mode, setMode] = useState<Mode>("intervals");

  // Random range
  const [minSec, setMinSec] = useState(10);
  const [maxSec, setMaxSec] = useState(45);

  // Intervals
  const [intervalCount, setIntervalCount] = useState(10);

  // Options
  const [sound, setSound] = useState(true);
  const [beepEachInterval, setBeepEachInterval] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  // Timer state
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);

  // Session state
  const [currentInterval, setCurrentInterval] = useState(1);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [nextDurationSec, setNextDurationSec] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  function normalizeRange() {
    const min = clamp(minSec, 1, 3600);
    const max = clamp(maxSec, 1, 3600);
    return min <= max ? { min, max } : { min: max, max: min };
  }

  function rollDuration() {
    const { min, max } = normalizeRange();
    return randInt(min, max);
  }

  function primeNext() {
    setNextDurationSec(rollDuration());
  }

  // Initialize durations
  useEffect(() => {
    const d = rollDuration();
    setCurrentDurationSec(d);
    setRemaining(d * 1000);
    setRunning(false);
    setCurrentInterval(1);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    setNextDurationSec(rollDuration());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minSec, maxSec, mode]);

  // Timer loop
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remaining;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound && (beepEachInterval || mode === "single")) {
          beep(660, 220);
        }

        if (mode === "single") {
          setRunning(false);
          return;
        }

        // intervals mode: advance
        setCurrentInterval((i) => {
          const nextI = i + 1;
          return nextI;
        });

        setCurrentDurationSec((_) => {
          const d = nextDurationSec || rollDuration();
          setRemaining(d * 1000);
          // roll a new preview for the next after that
          setNextDurationSec(rollDuration());
          return d;
        });

        // stop if reached count
        if (currentInterval >= intervalCount) {
          setRunning(false);
          return;
        }

        // continue running: set endRef when effect sees remaining update
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
    mode,
    beepEachInterval,
    currentInterval,
    intervalCount,
    nextDurationSec,
  ]);

  // Ensure we stop exactly at intervalCount in intervals mode
  useEffect(() => {
    if (mode !== "intervals") return;
    if (!running) return;
    if (currentInterval > intervalCount) {
      setRunning(false);
    }
  }, [currentInterval, intervalCount, mode, running]);

  function resetSession() {
    const d = rollDuration();
    setRunning(false);
    setCurrentInterval(1);
    setCurrentDurationSec(d);
    setRemaining(d * 1000);
    setNextDurationSec(rollDuration());
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    // prime audio on gesture
    if (!running && sound) beep(0, 1);

    // Guard for intervals mode: if already completed, reset first
    if (!running && mode === "intervals" && currentInterval > intervalCount) {
      resetSession();
    }

    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      resetSession();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const rangeText = useMemo(() => {
    const { min, max } = normalizeRange();
    return `${min}s–${max}s`;
  }, [minSec, maxSec]);

  const progressText =
    mode === "intervals" ? `${Math.min(currentInterval, intervalCount)}/${intervalCount}` : "Single";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Chaos Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            A <strong>random timer</strong> and <strong>random interval timer</strong>. Generate random durations for
            training, games, classroom drills, and chaos workouts.
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

      {/* Mode */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
            mode === "single"
              ? "bg-amber-700 text-white hover:bg-amber-800"
              : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
          }`}
        >
          Random timer
        </button>

        <button
          type="button"
          onClick={() => setMode("intervals")}
          className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
            mode === "intervals"
              ? "bg-amber-700 text-white hover:bg-amber-800"
              : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
          }`}
        >
          Random interval timer
        </button>

        <span className="mx-1 text-xs font-semibold text-amber-800">
          Range: {rangeText}
        </span>

        <Btn kind="ghost" onClick={resetSession} className="py-1.5">
          Reroll
        </Btn>
      </div>

      {/* Inputs */}
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <label className="block text-sm font-semibold text-amber-950">
          Min seconds
          <input
            type="number"
            min={1}
            max={3600}
            value={minSec}
            onChange={(e) => setMinSec(clamp(Number(e.target.value || 1), 1, 3600))}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Max seconds
          <input
            type="number"
            min={1}
            max={3600}
            value={maxSec}
            onChange={(e) => setMaxSec(clamp(Number(e.target.value || 45), 1, 3600))}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Intervals
          <input
            type="number"
            min={1}
            max={500}
            value={intervalCount}
            onChange={(e) =>
              setIntervalCount(clamp(Number(e.target.value || 10), 1, 500))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            disabled={mode !== "intervals"}
          />
        </label>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={resetSession}>
            Reset
          </Btn>
        </div>
      </div>

      {/* Sound options */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          <input
            type="checkbox"
            checked={beepEachInterval}
            onChange={(e) => setBeepEachInterval(e.target.checked)}
            disabled={!sound || mode !== "intervals"}
          />
          Beep each interval
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

        <Btn kind="ghost" onClick={() => sound && beep(880, 140)} disabled={!sound}>
          Test beep
        </Btn>
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
        <div data-shell="normal" className="h-full w-full p-6" style={{ minHeight: 260 }}>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Remaining
              </div>
              <div className="mt-2 font-mono text-6xl font-extrabold tracking-widest">
                {shownTime}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Mode
                  </div>
                  <div className="mt-1 font-extrabold text-amber-950">
                    {mode === "intervals" ? "Intervals" : "Single"}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Progress
                  </div>
                  <div className="mt-1 font-mono text-2xl font-extrabold">
                    {progressText}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                This interval
              </div>
              <div className="mt-2 font-mono text-4xl font-extrabold tracking-wide">
                {currentDurationSec}s
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Next interval preview: <strong>{nextDurationSec}s</strong>
                <div className="mt-2 text-xs text-amber-800">
                  Reroll resets the session and generates new random durations.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Chaos Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-sub">
              {mode === "intervals" ? `Interval ${Math.min(currentInterval, intervalCount)} of ${intervalCount}` : "Random timer"}
              {" · "}
              Range {rangeText}
            </div>
            <div className="fs-help">Space start/pause · R reset · F fullscreen</div>
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
export default function ChaosTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/chaos-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Chaos Timer",
        url,
        description:
          "A random timer and random interval timer that generates random countdown durations for training and games, with fullscreen and optional sound.",
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
            name: "Chaos Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a random timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A random timer generates a countdown duration randomly within a range. It is useful for games, drills, and surprise timing.",
            },
          },
          {
            "@type": "Question",
            name: "What is a random interval timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A random interval timer generates a sequence of random countdowns. Each interval has a random duration within your chosen range, which is useful for training, reaction games, and classroom drills.",
            },
          },
          {
            "@type": "Question",
            name: "Can I control the random range?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Set the minimum and maximum seconds. The timer will choose random durations within that range.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets and rerolls, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">Chaos Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Chaos Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>random timer</strong> and <strong>random interval timer</strong>{" "}
            for training and games. Set a range, roll random durations, and go fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <ChaosTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Random durations (no pattern)
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Useful when you want unpredictability: reaction drills, tag games, classroom games, or surprise work blocks.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Random interval timer for training
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Set a range like <strong>10s–45s</strong> and a number of intervals. Each interval rerolls a new duration.
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
                <strong>R</strong> = Reset / Reroll
              </li>
              <li>
                <strong>F</strong> = Fullscreen
              </li>
            </ul>
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
            Free random timer and random interval timer
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>random timer</strong> generates a countdown duration at random within your chosen range.
              Use it for games, drills, and any activity where predictable timing makes things boring.
            </p>

            <p>
              In <strong>random interval timer</strong> mode, the tool rolls a new random duration each interval.
              That makes it useful for training sessions where you want varied work blocks without doing math.
            </p>

            <p>
              If you want structured intervals instead of randomness, use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>{" "}
              or a standard{" "}
              <Link to="/countdown-timer" className="font-semibold hover:underline">
                Countdown Timer
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Random timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                One random countdown duration. Reroll anytime.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Random interval timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Multiple random intervals in a row for workouts and games.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Fullscreen
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Big digits with a dark, high-contrast display.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Chaos Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How does the random interval timer work?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Set a minimum and maximum duration, choose the number of intervals, and press Start. Each time an interval ends, the next interval rerolls a random duration within your range.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I reroll the random durations?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Press R or click Reroll. It resets the session and generates new random durations.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this random timer work in fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Press Fullscreen (or F) while the card is focused for a dark view with huge digits.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset/reroll •{" "}
              <strong>F</strong> fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 i💛Timers - free countdown, stopwatch, Pomodoro, HIIT, and random timers
        </div>
      </footer>
    </main>
  );
}
