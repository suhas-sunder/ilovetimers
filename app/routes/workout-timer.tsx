// app/routes/workout-timer.tsx
import type { Route } from "./+types/workout-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Workout Timer (Rounds and Rest)";
  const description =
    "Run workouts with a simple round and rest timer. Big fullscreen countdown designed for gym training, boxing, circuits, and conditioning.";

  const url = "https://ilovetimers.com/workout-timer";

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
   WORKOUT TIMER CARD (rounds + rest)
========================================================= */
type Phase = "work" | "rest";

function WorkoutTimerCard() {
  const beep = useBeep();

  // Defaults that map to “boxing round timer” but also usable for gym circuits
  const [workMin, setWorkMin] = useState(3); // round length
  const [restMin, setRestMin] = useState(1); // rest between rounds
  const [rounds, setRounds] = useState(3);

  const [phase, setPhase] = useState<Phase>("work");
  const [roundIdx, setRoundIdx] = useState(1);

  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  // Internal timer state (ms remaining in current phase)
  const [remaining, setRemaining] = useState(workMin * 60 * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  // Keep remaining aligned when config changes (only when not running)
  useEffect(() => {
    if (running) return;
    setPhase("work");
    setRoundIdx(1);
    setRemaining(workMin * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [workMin, restMin, rounds, running]);

  const workPresets = useMemo(() => [1, 2, 3, 4, 5], []);
  const restPresets = useMemo(() => [0.25, 0.5, 1, 2, 3], []); // 15s, 30s, 1m...
  const roundsPresets = useMemo(() => [2, 3, 4, 5, 6, 8, 10, 12], []);

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

        if (sound) {
          // Different tones for phase transitions
          if (phase === "work") beep(520, 260);
          else beep(740, 220);
        }

        // Transition
        if (phase === "work") {
          if (restMin > 0) {
            setPhase("rest");
            const next = Math.max(0, restMin * 60 * 1000);
            setRemaining(next);
            endRef.current = performance.now() + next;
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          // No rest: advance round immediately
          if (roundIdx < rounds) {
            setRoundIdx((r) => r + 1);
            setPhase("work");
            const next = workMin * 60 * 1000;
            setRemaining(next);
            endRef.current = performance.now() + next;
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          setRunning(false);
          return;
        }

        // Rest ended: next round or finish
        if (roundIdx < rounds) {
          setRoundIdx((r) => r + 1);
          setPhase("work");
          const next = workMin * 60 * 1000;
          setRemaining(next);
          endRef.current = performance.now() + next;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setRunning(false);
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
    phase,
    roundIdx,
    rounds,
    workMin,
    restMin,
  ]);

  function reset() {
    setRunning(false);
    setPhase("work");
    setRoundIdx(1);
    setRemaining(workMin * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function skipPhase() {
    // Only meaningful while running or paused mid-session
    endRef.current = null;
    lastBeepSecondRef.current = null;

    if (phase === "work") {
      if (restMin > 0) {
        setPhase("rest");
        setRemaining(restMin * 60 * 1000);
      } else if (roundIdx < rounds) {
        setRoundIdx((r) => r + 1);
        setPhase("work");
        setRemaining(workMin * 60 * 1000);
      } else {
        setRunning(false);
      }
      return;
    }

    // phase === "rest"
    if (roundIdx < rounds) {
      setRoundIdx((r) => r + 1);
      setPhase("work");
      setRemaining(workMin * 60 * 1000);
    } else {
      setRunning(false);
    }
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
    } else if (e.key.toLowerCase() === "n") {
      skipPhase();
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const phaseLabel = phase === "work" ? "Work" : restMin > 0 ? "Rest" : "Next";
  const phaseColor = phase === "work" ? "text-amber-950" : "text-slate-900";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Workout Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Gym intervals and boxing rounds. Set round length, rest, and number
            of rounds. Fullscreen and simple shortcuts included.
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

      {/* Controls */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
            Round (work)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {workPresets.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setWorkMin(m)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                  m === workMin
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Custom minutes
            <input
              type="number"
              min={0.25}
              max={30}
              step={0.25}
              value={workMin}
              onChange={(e) =>
                setWorkMin(clamp(Number(e.target.value || 0.25), 0.25, 30))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
            Rest
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {restPresets.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setRestMin(m)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                  m === restMin
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                }`}
              >
                {m < 1 ? `${Math.round(m * 60)}s` : `${m}m`}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Custom minutes
            <input
              type="number"
              min={0}
              max={30}
              step={0.25}
              value={restMin}
              onChange={(e) =>
                setRestMin(clamp(Number(e.target.value || 0), 0, 30))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
          <div className="mt-2 text-xs text-slate-700">
            Tip: set Rest to <strong>0</strong> for back-to-back rounds.
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
            Rounds
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {roundsPresets.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRounds(r)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                  r === rounds
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Custom rounds
            <input
              type="number"
              min={1}
              max={50}
              value={rounds}
              onChange={(e) =>
                setRounds(clamp(Number(e.target.value || 1), 1, 50))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
        </div>
      </div>

      {/* Start / reset / skip */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
        <Btn
          kind="ghost"
          onClick={skipPhase}
          disabled={rounds <= 1 && phase === "work"}
        >
          Next
        </Btn>
        <div className="text-xs text-slate-600">
          Shortcut: <strong>N</strong> next phase/round
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          urgent
            ? "border-rose-300 bg-rose-50 text-rose-950"
            : phase === "work"
              ? "border-amber-300 bg-amber-50 text-amber-950"
              : "border-slate-300 bg-slate-50 text-slate-900"
        }`}
        style={{ minHeight: 260 }}
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
                gap:16px;
              }

              [data-fs-container]:fullscreen .fs-top{
                width:min(900px, 92vw);
                display:flex;
                justify-content:space-between;
                font: 800 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
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
          style={{ minHeight: 260 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <div
              className={`text-xs font-extrabold uppercase tracking-widest ${phaseColor}`}
            >
              {phaseLabel} · Round {roundIdx}/{rounds}
            </div>
            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl md:text-8xl">
                {shownTime}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              Space start/pause · R reset · N next · F fullscreen
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-top">
              <div>{phase === "work" ? "Work" : "Rest"}</div>
              <div>
                Round {roundIdx}/{rounds}
              </div>
            </div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · R reset · N next · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · N next · F fullscreen
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
export default function WorkoutTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/workout-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Workout Timer",
        url,
        description:
          "Fullscreen workout timer for gym intervals and boxing rounds. Round + rest mode, big countdown, optional sound, and keyboard shortcuts.",
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
            name: "Workout Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a workout timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A workout timer is a countdown tool used to structure training sessions. It helps you time work intervals and rest periods for circuits, conditioning, and rounds.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a boxing round timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Set Round (work) to 3 minutes, Rest to 1 minute, and choose your number of rounds. The timer automatically alternates work and rest.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use it for circuits at the gym?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Set shorter work intervals for stations and adjust rest as needed. Use Fullscreen for easy viewing on a phone stand, tablet, or TV.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, N skips to the next phase or round, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">Workout Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Workout Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>workout timer</strong> for the <strong>gym</strong>{" "}
            and a <strong>boxing round timer</strong> for rounds and rest, with
            a true fullscreen view.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <WorkoutTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Boxing rounds with rest
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Set <strong>3:00</strong> work and <strong>1:00</strong> rest for
              classic rounds. The timer automatically alternates phases.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Gym circuits and conditioning
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use shorter work intervals for stations and adjust rest based on
              intensity. Fullscreen stays readable at a distance.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Simple controls, fast flow
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use <strong>N</strong> to skip to the next phase or round, and{" "}
              <strong>R</strong> to reset. Great for coaching and group
              sessions.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free workout timer for the gym and boxing rounds
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>workout timer</strong> is designed for interval-based
              training. Use it as a <strong>gym timer</strong> for circuits,
              stations, and conditioning, or as a{" "}
              <strong>boxing round timer</strong> for rounds with rest.
            </p>

            <p>
              Set your round (work) time, rest time, and number of rounds. Press
              Start and the timer will alternate work and rest automatically.
              Fullscreen mode keeps the display clean and readable without extra
              clutter.
            </p>

            <p>
              If you want a dedicated interval tool, try{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              . For a basic countdown, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For general time tracking, use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Workout timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Work and rest intervals for circuits, training stations, and
                conditioning blocks.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Gym timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Set your station time and rest, then keep the countdown visible
                during the session.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Boxing round timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Classic 3 minute rounds with 1 minute rest, or customize for bag
                work and sparring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Workout Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a workout timer or a gym timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Both. It works as a gym timer for circuits and as a workout timer
              for interval training with work and rest.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I set it up as a boxing round timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Set Round (work) to <strong>3 minutes</strong>, Rest to{" "}
              <strong>1 minute</strong>, and choose your number of rounds. Press
              Start and it will alternate automatically.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I skip to the next round?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click <strong>Next</strong> or press <strong>N</strong> to
              skip to the next phase or round.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>N</strong> next phase/round • <strong>F</strong>{" "}
              fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
