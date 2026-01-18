// app/routes/productivity-timer.tsx
import type { Route } from "./+types/productivity-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Productivity Timer | Focus Timer Online (Deep Work, Breaks, Fullscreen)";
  const description =
    "Free productivity timer and focus timer online. Quick deep-work presets, custom work/break cycles, optional sound, fullscreen, and keyboard shortcuts. Built for distraction-free productivity.";
  const url = "https://ilovetimers.com/productivity-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "productivity timer",
        "focus timer online",
        "focus timer",
        "deep work timer",
        "work break timer",
        "study timer",
        "pomodoro alternative",
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
   PRODUCTIVITY TIMER CARD
   - Work/Break cycles (Pomodoro-adjacent but flexible)
   - Loop on/off
   - Minimal, projector-friendly fullscreen
========================================================= */
function ProductivityTimerCard() {
  const beep = useBeep();

  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [longBreakEvery, setLongBreakEvery] = useState(4);

  const [loop, setLoop] = useState(true);
  const [sound, setSound] = useState(true);

  // phase: "work" | "break" | "longBreak"
  const [phase, setPhase] = useState<"work" | "break" | "longBreak">("work");
  const [cycleCount, setCycleCount] = useState(0); // completed work sessions
  const [running, setRunning] = useState(false);

  const totalMs = useMemo(() => {
    if (phase === "work") return workMin * 60 * 1000;
    if (phase === "longBreak") return longBreakMin * 60 * 1000;
    return breakMin * 60 * 1000;
  }, [phase, workMin, breakMin, longBreakMin]);

  const [remaining, setRemaining] = useState(totalMs);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Keep remaining aligned when phase or durations change (only when not running)
  useEffect(() => {
    if (running) return;
    setRemaining(totalMs);
    endRef.current = null;
  }, [totalMs, running]);

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

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);

        if (sound) beep(660, 220);

        // Advance phase
        if (phase === "work") {
          const nextCount = cycleCount + 1;
          setCycleCount(nextCount);

          const shouldLong =
            longBreakEvery > 0 && nextCount % longBreakEvery === 0;
          const nextPhase = shouldLong ? "longBreak" : "break";

          setPhase(nextPhase);
          setRemaining(
            (nextPhase === "longBreak" ? longBreakMin : breakMin) * 60 * 1000,
          );

          if (loop) setRunning(true);
        } else {
          // break -> work
          setPhase("work");
          setRemaining(workMin * 60 * 1000);
          if (loop) setRunning(true);
        }

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
    beep,
    sound,
    loop,
    phase,
    cycleCount,
    workMin,
    breakMin,
    longBreakMin,
    longBreakEvery,
  ]);

  function startPause() {
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    endRef.current = null;
    setPhase("work");
    setCycleCount(0);
    setRemaining(workMin * 60 * 1000);
  }

  function skip() {
    // move to next phase without changing loop setting
    setRunning(false);
    endRef.current = null;

    if (phase === "work") {
      const nextCount = cycleCount + 1;
      setCycleCount(nextCount);
      const shouldLong = longBreakEvery > 0 && nextCount % longBreakEvery === 0;
      const nextPhase = shouldLong ? "longBreak" : "break";
      setPhase(nextPhase);
      setRemaining(
        (nextPhase === "longBreak" ? longBreakMin : breakMin) * 60 * 1000,
      );
    } else {
      setPhase("work");
      setRemaining(workMin * 60 * 1000);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "n") {
      skip();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    }
  };

  const label =
    phase === "work" ? "Focus" : phase === "longBreak" ? "Long break" : "Break";
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const phaseStyle =
    phase === "work"
      ? "border-amber-300 bg-amber-50 text-amber-950"
      : phase === "longBreak"
        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
        : "border-sky-300 bg-sky-50 text-sky-950";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Productivity Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A flexible <strong>focus timer online</strong> with work/break
            cycles. It’s Pomodoro-adjacent, but you control the durations and
            loop behavior.
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
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            Auto-advance
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
        <button
          type="button"
          onClick={() => {
            setWorkMin(25);
            setBreakMin(5);
            setLongBreakMin(15);
            setLongBreakEvery(4);
            reset();
          }}
          className="cursor-pointer rounded-full bg-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-950 hover:bg-amber-400"
        >
          Classic 25/5
        </button>

        <button
          type="button"
          onClick={() => {
            setWorkMin(50);
            setBreakMin(10);
            setLongBreakMin(20);
            setLongBreakEvery(3);
            reset();
          }}
          className="cursor-pointer rounded-full bg-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-950 hover:bg-amber-400"
        >
          Deep work 50/10
        </button>

        <button
          type="button"
          onClick={() => {
            setWorkMin(90);
            setBreakMin(15);
            setLongBreakMin(30);
            setLongBreakEvery(2);
            reset();
          }}
          className="cursor-pointer rounded-full bg-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-950 hover:bg-amber-400"
        >
          Sprint 90/15
        </button>
      </div>

      {/* Settings */}
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <label className="block text-sm font-semibold text-amber-950">
          Focus (min)
          <input
            type="number"
            min={1}
            max={240}
            value={workMin}
            onChange={(e) =>
              setWorkMin(clamp(Number(e.target.value || 1), 1, 240))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Break (min)
          <input
            type="number"
            min={1}
            max={120}
            value={breakMin}
            onChange={(e) =>
              setBreakMin(clamp(Number(e.target.value || 1), 1, 120))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Long break (min)
          <input
            type="number"
            min={1}
            max={180}
            value={longBreakMin}
            onChange={(e) =>
              setLongBreakMin(clamp(Number(e.target.value || 1), 1, 180))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Long break every
          <input
            type="number"
            min={0}
            max={12}
            value={longBreakEvery}
            onChange={(e) =>
              setLongBreakEvery(clamp(Number(e.target.value || 0), 0, 12))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            0 = never use long breaks
          </div>
        </label>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
        <Btn kind="ghost" onClick={skip}>
          Next
        </Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>

        <div className="ml-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Phase: <span className="font-extrabold">{label}</span> · Completed
          focus sessions: <span className="font-extrabold">{cycleCount}</span>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${phaseStyle}`}
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
                width:min(1500px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:20px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 22px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
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
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {label}
            </div>
            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl md:text-8xl">
                {shownTime}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              Space start/pause · N next · R reset · F fullscreen
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">{label}</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · N next · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · N next · R reset · F fullscreen
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
export default function ProductivityTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/productivity-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Productivity Timer",
        url,
        description:
          "Productivity timer and focus timer online with customizable work/break cycles and fullscreen display.",
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
            name: "Productivity Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a productivity timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A productivity timer helps you work in focused blocks with planned breaks. This page lets you set a focus duration, break duration, and optional long breaks.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a focus timer online (Pomodoro-style)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It supports Pomodoro-style cycles, but it’s flexible. You can set your own focus length, break length, and whether to auto-advance.",
            },
          },
          {
            "@type": "Question",
            name: "Can it auto-advance between focus and break?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Turn on Auto-advance to switch to the next phase when a timer ends. Turn it off if you want manual control.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, N skips to the next phase, R resets, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">Productivity Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Productivity Timer (Focus Timer Online)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>productivity timer</strong> that helps you stay on task
            with focus blocks and breaks. Use it as a{" "}
            <strong>focus timer online</strong> for deep work, studying, or
            planning.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <ProductivityTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Simple focus blocks
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use 25/5 for routine tasks, 50/10 for deep work, or longer sprints
              when you want fewer interruptions.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Long breaks that actually happen
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Set a long break every N focus sessions. Good for avoiding burnout
              during long study or work sessions.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen and shortcuts
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen gives big digits. Shortcuts keep it fast: Space, N, R,
              F.
            </p>
          </div>
        </div>
      </section>


      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free productivity timer: a focus timer online for deep work and
            breaks
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>productivity timer</strong> helps you work with
              intention by separating focus time and break time. Instead of
              grinding for hours, you work in focused blocks, then take short
              breaks to reset.
            </p>

            <p>
              Use it as a <strong>focus timer online</strong> for deep work,
              study sessions, writing, homework, or planning. You can
              auto-advance between phases or keep manual control if you prefer
              to decide when to move on.
            </p>

            <p>
              If you want a classic single countdown, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . If you want a strict Pomodoro page, use{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Productivity timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Structured work blocks with planned breaks.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Focus timer online
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Runs in your browser with fullscreen digits and shortcuts.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Work and break cycles
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Auto-advance between phases, plus optional long breaks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Productivity Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a focus timer online?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It’s designed for focus blocks plus breaks, with optional
              auto-advance between phases.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What’s the best setting for deep work?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many people like 50/10 or 90/15 for deep work. The “best” is the
              one you’ll actually stick to. Try 50/10 first, then adjust.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I turn off auto-advance?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Turn off Auto-advance to stop at the end of each phase and
              switch manually.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>N</strong> next phase
              • <strong>R</strong> reset • <strong>F</strong> fullscreen (when
              focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
