// app/routes/pomodoro-timer.tsx
import type { Route } from "./+types/pomodoro-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Pomodoro Timer (25/5 Focus)";
  const description =
    "Stay focused with a clean Pomodoro timer. Run 25/5 work and break cycles, adjust timings, and keep deep work sessions on track with a clear countdown.";

  const url = "https://ilovetimers.com/pomodoro-timer";

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

/* =========================================================
   POMODORO
========================================================= */
type Phase = "work" | "shortBreak" | "longBreak" | "done";

function PomodoroCard() {
  const beep = useBeep();

  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [cycles, setCycles] = useState(4);

  const [useLongBreak, setUseLongBreak] = useState(true);
  const [longBreakMin, setLongBreakMin] = useState(15);

  const [autoAdvance, setAutoAdvance] = useState(true);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [phase, setPhase] = useState<Phase>("work");
  const [cycleIdx, setCycleIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(workMin * 60 * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const workMs = useMemo(() => workMin * 60 * 1000, [workMin]);
  const shortBreakMs = useMemo(
    () => shortBreakMin * 60 * 1000,
    [shortBreakMin],
  );
  const longBreakMs = useMemo(() => longBreakMin * 60 * 1000, [longBreakMin]);

  function durFor(p: Phase) {
    if (p === "work") return workMs;
    if (p === "shortBreak") return shortBreakMs;
    if (p === "longBreak") return longBreakMs;
    return 0;
  }

  useEffect(() => {
    setRunning(false);
    setPhase("work");
    setCycleIdx(0);
    setRemaining(durFor("work"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMs, shortBreakMs, longBreakMs, cycles]);

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

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 3_000) {
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
          const freq = phase === "work" ? 660 : 980;
          beep(freq, 180);
        }

        if (autoAdvance) {
          window.setTimeout(() => advancePhase(), 20);
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
    sound,
    finalCountdownBeeps,
    autoAdvance,
    beep,
    phase,
  ]);

  function startPhase(next: Phase) {
    const d = durFor(next);
    setPhase(next);
    setRemaining(d);
    endRef.current = performance.now() + d;
    lastBeepSecondRef.current = null;
    setRunning(true);
  }

  function resetAll() {
    setRunning(false);
    setPhase("work");
    setCycleIdx(0);
    setRemaining(durFor("work"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    if (phase === "done") {
      resetAll();
      setRunning(true);
      endRef.current = performance.now() + durFor("work");
      return;
    }
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function advancePhase() {
    if (phase === "work") {
      const isLastWorkSession = cycleIdx + 1 >= cycles;

      if (isLastWorkSession) {
        if (useLongBreak) {
          startPhase("longBreak");
        } else {
          setPhase("done");
          setRemaining(0);
          setRunning(false);
        }
        return;
      }

      startPhase("shortBreak");
      return;
    }

    if (phase === "shortBreak" || phase === "longBreak") {
      setCycleIdx((i) => i + 1);
      startPhase("work");
      return;
    }

    resetAll();
  }

  function skipNext() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    advancePhase();
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
    phase === "work"
      ? `Focus (Work) ${Math.min(cycleIdx + 1, cycles)}/${cycles}`
      : phase === "shortBreak"
        ? `Short Break ${Math.min(cycleIdx + 1, cycles)}/${cycles}`
        : phase === "longBreak"
          ? `Long Break (Finish) ${cycles}/${cycles}`
          : "Complete";

  const displayTone =
    phase === "work"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : phase === "shortBreak"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : phase === "longBreak"
          ? "border-sky-200 bg-sky-50 text-sky-950"
          : "border-slate-200 bg-slate-50 text-slate-600";

  const urgent =
    running && remaining > 0 && remaining <= 10_000 && phase === "work";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Pomodoro Focus Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Default <strong>25/5</strong>. Adjust timings, run cycles, use long
            break, and control everything by keyboard.
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
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
            />
            Auto
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
          <div className="grid gap-3 sm:grid-cols-3">
            <LabeledNumberStrong
              label="Work (minutes)"
              value={workMin}
              set={setWorkMin}
              min={1}
              max={180}
            />
            <LabeledNumberStrong
              label="Break (minutes)"
              value={shortBreakMin}
              set={setShortBreakMin}
              min={1}
              max={60}
            />
            <LabeledNumberStrong
              label="Cycles"
              value={cycles}
              set={setCycles}
              min={1}
              max={12}
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
              Final 3-2-1 beeps
            </label>
            <span className="text-sm text-slate-600">
              Only when Sound is on.
            </span>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="h-full rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
                Long break
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-amber-950">
                <input
                  type="checkbox"
                  checked={useLongBreak}
                  onChange={(e) => setUseLongBreak(e.target.checked)}
                />
                After last cycle
              </label>
            </div>

            <label className="mt-3 block text-sm font-semibold text-amber-950">
              Minutes
              <input
                type="number"
                min={1}
                max={90}
                value={longBreakMin}
                onChange={(e) =>
                  setLongBreakMin(clamp(Number(e.target.value || 0), 1, 90))
                }
                disabled={!useLongBreak}
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
              />
            </label>

            <p className="mt-2 text-sm text-slate-700">
              Common choice: 10 to 20 minutes.
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
            {phase === "done" ? "Done" : phase === "work" ? "Focus" : "Break"}
          </div>
          <div className="text-sm font-semibold opacity-95">{phaseLabel}</div>
        </div>

        <div
          className={`mt-5 flex items-center justify-center font-mono font-extrabold tracking-widest ${
            urgent ? "text-rose-950" : ""
          }`}
        >
          <span className="text-6xl sm:text-7xl md:text-8xl">
            {msToClock(Math.ceil(remaining / 1000) * 1000)}
          </span>
        </div>
      </div>

      {/* Controls + shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Btn onClick={startPause}>
            {running ? "Pause" : phase === "done" ? "Restart" : "Start"}
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

      {!autoAdvance && remaining === 0 && phase !== "done" && (
        <div className="mt-3 rounded-lg bg-amber-500/30 px-3 py-2 text-sm font-semibold text-amber-950">
          Phase finished. Press <strong>Next</strong> to continue.
        </div>
      )}
    </Card>
  );
}

function LabeledNumberStrong({
  label,
  value,
  set,
  min,
  max,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block text-sm font-semibold text-amber-950">
      {label}
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
   PAGE
========================================================= */
export default function PomodoroTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/pomodoro-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Pomodoro Timer",
        url,
        description:
          "Free Pomodoro timer (25/5) with customizable work/break times, cycles, skip/next, sound alerts, fullscreen, and keyboard shortcuts.",
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
            name: "Pomodoro Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a Pomodoro timer (25/5 timer)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A Pomodoro timer alternates focused work and short breaks. The common 25/5 routine means 25 minutes of work followed by a 5 minute break, repeated for multiple cycles.",
            },
          },
          {
            "@type": "Question",
            name: "Can I change work, break, and cycles?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Set Work minutes, Break minutes, and Cycles. You can also enable a long break after the final work session.",
            },
          },
          {
            "@type": "Question",
            name: "Does it auto-switch between work and break?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Auto-advance is on by default. If you turn it off, you can press Next to move to the next phase manually.",
            },
          },
          {
            "@type": "Question",
            name: "Can I skip to the next phase?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Press Next (or N) to skip to the next phase immediately.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, N advances to the next phase, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">Pomodoro Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Pomodoro Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A curated <strong>25/5 Pomodoro timer</strong> built for serious
            focus: customizable work/breaks, cycles, long break, next/skip,
            sound, fullscreen, and keyboard shortcuts.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <PomodoroCard />
        </div>

        {/* Quick-use hints: below, responsive */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              What Pomodoro users expect
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Clear phases, reliable auto-switching, a long break option, and
              controls that don’t get in your way. This page is tuned for that:
              focus first, settings second.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Study timer workflow
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use classic <strong>25/5</strong>, repeat for 4 cycles, then take
              a longer break. If you’re doing deep work, try{" "}
              <strong>50/10</strong>.
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
                <strong>N</strong> = Next phase
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
            Free Pomodoro timer (25/5 focus timer) for study and deep work
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>Pomodoro timer</strong> is a simple, high-trust{" "}
              <strong>focus timer</strong> built for people who actually use the
              Pomodoro technique. Start with the classic{" "}
              <strong>25/5 timer</strong>: 25 minutes of focused work, then a 5
              minute break. Repeat for multiple cycles to stay consistent
              without burning out.
            </p>

            <p>
              Customize <strong>work</strong>, <strong>break</strong>, and{" "}
              <strong>cycles</strong> to match your routine. If you want the
              typical “bigger reset” at the end, enable a{" "}
              <strong>long break</strong> after the final cycle. You can also
              turn <strong>Auto</strong> off to control phase changes manually.
            </p>

            <p>
              Use <strong>Next</strong> (or <strong>N</strong>) to skip ahead if
              you finish early. Sound alerts mark phase changes, and the
              optional final <strong>3-2-1</strong> beeps help you wrap up
              cleanly. For maximum visibility, use fullscreen and control with
              the keyboard after clicking the timer card once to focus it.
            </p>

            <p>
              Need a different timing style? Use{" "}
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
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>{" "}
              for work/rest intervals.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Study timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Keep sessions structured: 25/5 for homework, 50/10 for deep
                work, or your own custom cycle.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Focus timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Clear phases reduce context switching: work, break, repeat, then
                a long break at the end.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Team-friendly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Turn Auto off for group study or meetings and advance phases
                only when the room is ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Pomodoro Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a real 25/5 Pomodoro timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It defaults to 25 minutes work and 5 minutes break, and you
              can customize the routine.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it auto-switch between work and break?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Auto is on by default. Turn it off to advance manually using{" "}
              <strong>Next</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I do a long break after the last cycle?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Enable Long break and set the long break minutes.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I skip to the next phase?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Press <strong>N</strong> or click <strong>Next</strong>.
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
