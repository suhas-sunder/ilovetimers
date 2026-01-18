// app/routes/hiit-timer.tsx
import type { Route } from "./+types/hiit-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "HIIT Timer | Free Interval Timer (Tabata + Work/Rest) with Rounds, Fullscreen, and Shortcuts";
  const description =
    "Free HIIT / interval timer with warmup, work, rest, rounds, and cooldown. Includes Tabata presets, skip/next, sound, fullscreen, and keyboard shortcuts. Built for workouts and training.";
  const url = "https://ilovetimers.com/hiit-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "hiit timer",
        "interval timer",
        "tabata timer",
        "work rest timer",
        "workout interval timer",
        "circuit timer",
        "boxing round timer",
        "online interval timer",
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

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
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

/* =========================================================
   UI PRIMITIVES (same style as Home)
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

function LabeledNumberStrong({
  label,
  value,
  set,
  min,
  max,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-amber-950">
      <div className="flex items-baseline justify-between gap-2">
        <span>
          {label}{" "}
          {suffix ? <span className="text-slate-600">{suffix}</span> : null}
        </span>
        {hint ? (
          <span className="text-xs font-medium text-slate-600">{hint}</span>
        ) : null}
      </div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(clamp(Number(e.target.value || 0), min, max))}
        className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </label>
  );
}

/* =========================================================
   HIIT / INTERVAL TIMER
========================================================= */
type Step = "warmup" | "work" | "rest" | "cooldown" | "done";

function HIITCard() {
  const beep = useBeep();

  // Strong defaults: Tabata-ish, but with warm/cool included
  const [warmSec, setWarmSec] = useState(30);
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [coolSec, setCoolSec] = useState(30);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [step, setStep] = useState<Step>("warmup");
  const [roundIdx, setRoundIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(warmSec * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const warmMs = useMemo(() => warmSec * 1000, [warmSec]);
  const workMs = useMemo(() => workSec * 1000, [workSec]);
  const restMs = useMemo(() => restSec * 1000, [restSec]);
  const coolMs = useMemo(() => coolSec * 1000, [coolSec]);

  function durFor(s: Step) {
    if (s === "warmup") return warmMs;
    if (s === "work") return workMs;
    if (s === "rest") return restMs;
    if (s === "cooldown") return coolMs;
    return 0;
  }

  // Reset predictably when settings change
  useEffect(() => {
    setRunning(false);
    setStep("warmup");
    setRoundIdx(0);
    setRemaining(durFor("warmup"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warmMs, workMs, restMs, coolMs, rounds]);

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

      // Optional final beeps for the last 3 seconds of WORK only
      if (
        sound &&
        finalCountdownBeeps &&
        step === "work" &&
        rem > 0 &&
        rem <= 3_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 120);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;

        if (sound) {
          // distinct tones: work->rest or rest->work
          const freq = step === "work" ? 660 : 980;
          beep(freq, 180);
        }

        window.setTimeout(() => advanceStep(), 20);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, remaining, sound, finalCountdownBeeps, beep, step]);

  function startStep(next: Step) {
    const d = durFor(next);
    setStep(next);
    setRemaining(d);
    endRef.current = performance.now() + d;
    lastBeepSecondRef.current = null;
    setRunning(true);
  }

  function resetAll() {
    setRunning(false);
    setStep("warmup");
    setRoundIdx(0);
    setRemaining(durFor("warmup"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    if (step === "done") {
      resetAll();
      setRunning(true);
      endRef.current = performance.now() + durFor("warmup");
      return;
    }

    // If current step duration is 0, treat Start as Next
    if (durFor(step) === 0) {
      skipNext();
      return;
    }

    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function advanceStep() {
    // warmup -> first work
    if (step === "warmup") {
      setRoundIdx(0);
      startStep("work");
      return;
    }

    // work -> rest (if rest > 0) else directly to next work/cooldown
    if (step === "work") {
      if (restMs > 0) {
        startStep("rest");
        return;
      }
      // no rest
      const next = roundIdx + 1;
      if (next < rounds) {
        setRoundIdx(next);
        startStep("work");
      } else {
        startStep("cooldown");
      }
      return;
    }

    // rest -> next round work or cooldown
    if (step === "rest") {
      const next = roundIdx + 1;
      if (next < rounds) {
        setRoundIdx(next);
        startStep("work");
      } else {
        startStep("cooldown");
      }
      return;
    }

    // cooldown -> done
    if (step === "cooldown") {
      setStep("done");
      setRemaining(0);
      setRunning(false);
      endRef.current = null;
      return;
    }

    // done -> reset
    resetAll();
  }

  function skipNext() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    advanceStep();
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      resetAll();
    } else if (e.key.toLowerCase() === "n") {
      skipNext();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  };

  const phaseLabel =
    step === "warmup"
      ? "Warm-up"
      : step === "work"
        ? "Work"
        : step === "rest"
          ? "Rest"
          : step === "cooldown"
            ? "Cool-down"
            : "Complete";

  const roundLabel =
    step === "work" || step === "rest"
      ? `Round ${Math.min(roundIdx + 1, rounds)}/${rounds}`
      : step === "warmup"
        ? "Get ready"
        : step === "cooldown"
          ? "Finish"
          : "Done";

  const displayTone =
    step === "work"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : step === "rest"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : step === "warmup"
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : step === "cooldown"
            ? "border-sky-200 bg-sky-50 text-sky-950"
            : "border-slate-200 bg-slate-50 text-slate-600";

  const urgent =
    running && remaining > 0 && remaining <= 10_000 && step === "work";

  const timeText =
    step === "done" ? "0:00" : msToClock(Math.ceil(remaining / 1000) * 1000);

  function applyTabata() {
    setWarmSec(0);
    setWorkSec(20);
    setRestSec(10);
    setRounds(8);
    setCoolSec(0);
  }

  function applyIntervals() {
    setWarmSec(30);
    setWorkSec(40);
    setRestSec(20);
    setRounds(10);
    setCoolSec(30);
  }

  function applyBoxing() {
    setWarmSec(0);
    setWorkSec(180);
    setRestSec(60);
    setRounds(6);
    setCoolSec(0);
  }

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            HIIT / Interval Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Warm-up, work/rest rounds, and cooldown. Includes Tabata presets,
            skip/next, sound, fullscreen, and keyboard shortcuts.
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
              displayRef.current && toggleFullscreen(displayRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Settings */}
      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid gap-3 sm:grid-cols-5">
            <LabeledNumberStrong
              label="Warm-up"
              suffix="(sec)"
              value={warmSec}
              set={setWarmSec}
              min={0}
              max={600}
              hint="0 = skip"
            />
            <LabeledNumberStrong
              label="Work"
              suffix="(sec)"
              value={workSec}
              set={setWorkSec}
              min={1}
              max={600}
            />
            <LabeledNumberStrong
              label="Rest"
              suffix="(sec)"
              value={restSec}
              set={setRestSec}
              min={0}
              max={600}
              hint="0 = none"
            />
            <LabeledNumberStrong
              label="Rounds"
              value={rounds}
              set={setRounds}
              min={1}
              max={50}
            />
            <LabeledNumberStrong
              label="Cool-down"
              suffix="(sec)"
              value={coolSec}
              set={setCoolSec}
              min={0}
              max={600}
              hint="0 = skip"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-amber-950">
              <input
                type="checkbox"
                checked={finalCountdownBeeps}
                onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                disabled={!sound}
              />
              Final 3-2-1 beeps (work only)
            </label>
            <span className="text-sm text-slate-600">
              Only when Sound is on.
            </span>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="h-full rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
              Quick presets
            </div>

            <div className="mt-3 grid gap-2">
              <Btn
                kind="ghost"
                onClick={applyTabata}
                className="justify-center"
              >
                Tabata 20/10 × 8
              </Btn>
              <Btn
                kind="ghost"
                onClick={applyIntervals}
                className="justify-center"
              >
                Intervals 40/20 × 10
              </Btn>
              <Btn
                kind="ghost"
                onClick={applyBoxing}
                className="justify-center"
              >
                Boxing 3:00/1:00 × 6
              </Btn>
            </div>

            <p className="mt-3 text-sm text-slate-700">
              Presets load values. Press <strong>Start</strong> when ready.
            </p>
          </div>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayRef}
        className={`mt-6 rounded-2xl border-2 p-6 ${displayTone}`}
        style={{ minHeight: 220 }}
        aria-live="polite"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="text-sm font-extrabold uppercase tracking-wide opacity-95">
            {step === "done"
              ? "Done"
              : step === "work"
                ? "Work"
                : step === "rest"
                  ? "Rest"
                  : step === "warmup"
                    ? "Warm-up"
                    : "Cool-down"}
          </div>
          <div className="text-sm font-semibold opacity-95">
            {phaseLabel} · {roundLabel}
          </div>
        </div>

        <div
          className={`mt-5 flex items-center justify-center font-mono font-extrabold tracking-widest ${
            urgent ? "text-rose-950" : ""
          }`}
        >
          <span className="text-6xl sm:text-7xl md:text-8xl">{timeText}</span>
        </div>
      </div>

      {/* Controls + shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Btn onClick={startPause}>
            {running ? "Pause" : step === "done" ? "Restart" : "Start"}
          </Btn>
          <Btn kind="ghost" onClick={resetAll}>
            Reset
          </Btn>
          <Btn kind="ghost" onClick={skipNext}>
            Next →
          </Btn>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · N next · F fullscreen
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function HIITTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/hiit-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "HIIT Timer",
        url,
        description:
          "Free HIIT / interval timer with warmup, work, rest, rounds, cooldown, skip/next, sound alerts, fullscreen, and keyboard shortcuts.",
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
            name: "HIIT Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a HIIT timer or interval timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A HIIT (interval) timer alternates work and rest periods for a set number of rounds. Many workouts add a warm-up and cool-down, and Tabata is a popular 20 seconds work / 10 seconds rest format.",
            },
          },
          {
            "@type": "Question",
            name: "Does this work as a Tabata timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the Tabata preset (20/10 × 8). You can keep warm-up and cool-down at 0 seconds to skip them, or add them if you want.",
            },
          },
          {
            "@type": "Question",
            name: "Can I skip to the next interval?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Next (or press N) to advance immediately to the next phase.",
            },
          },
          {
            "@type": "Question",
            name: "Can I run it fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Fullscreen or press F while the timer card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, N goes to the next phase, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">HIIT Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            HIIT / Interval Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A curated <strong>HIIT timer</strong> and{" "}
            <strong>interval timer</strong> built for real workouts: warm-up,
            work/rest rounds, cooldown, Tabata presets, next/skip, sound,
            fullscreen, and keyboard shortcuts.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <HIITCard />
        </div>

        {/* Quick-use hints: below, responsive */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              What interval users expect
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Clear phase labels, big readable digits, fast “next” control, and
              fullscreen for gym TVs. This page is tuned for that: run the
              workout without fighting the UI.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Tabata timer</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              The classic format is <strong>20 seconds work</strong> and{" "}
              <strong>10 seconds rest</strong> for <strong>8 rounds</strong>.
              Use the Tabata preset to load it instantly.
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
                <strong>N</strong> = Next interval
              </li>
              <li>
                <strong>F</strong> = Fullscreen
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section (under TimerMenuLinks) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free HIIT timer and interval timer (Tabata + work/rest)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>HIIT timer</strong> is a simple{" "}
              <strong>interval timer</strong> for workouts that alternate{" "}
              <strong>work</strong> and <strong>rest</strong>. Set a warm-up,
              choose your work/rest durations, set rounds, and optionally add a
              cool-down. The timer runs in your browser and stays accurate even
              if your device slows or the tab loses focus briefly.
            </p>

            <p>
              For <strong>Tabata</strong>, use the preset (20/10 × 8). For other
              routines, adjust the seconds to match your program. Use{" "}
              <strong>Next</strong> (or <strong>N</strong>) to skip ahead, and
              fullscreen the display for gyms, mirrors, TVs, or projector
              setups.
            </p>

            <p>
              Looking for a different timer style? Use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown
              </Link>{" "}
              for fixed deadlines,{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>{" "}
              for elapsed time and laps, or{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>{" "}
              for focus cycles.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Tabata
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Load the classic 20s work / 10s rest × 8 rounds preset, then
                press Start.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Circuits
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Configure longer work blocks (30 to 60s) with rest and repeat
                for the rounds you need.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Fullscreen gym use
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Use fullscreen so the phase and time are readable from across
                the room. Control with Space, N, and R.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">HIIT Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this an interval timer and a Tabata timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Tabata is a specific interval format (20 seconds work / 10
              seconds rest for 8 rounds). Use the preset to load it.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I skip to the next interval?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Press <strong>N</strong> or click <strong>Next</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I set warm-up and cool-down to 0?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Set them to 0 seconds to skip those phases.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I run it fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click Fullscreen or press <strong>F</strong> while focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>N</strong> next • <strong>F</strong> fullscreen (when
              focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
