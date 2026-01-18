// app/routes/countdown-timer.tsx
import type { Route } from "./+types/countdown-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Countdown Timer | Free Online Fullscreen Countdown Timer for Classrooms, Exams, Presentations";
  const description =
    "Free online countdown timer with presets, custom time input, loop mode, sound alerts, fullscreen display, and keyboard shortcuts. Great for classrooms, exams, presentations, and everyday tasks.";
  const url = "https://ilovetimers.com/countdown-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "countdown timer",
        "online countdown timer",
        "fullscreen countdown timer",
        "classroom countdown timer",
        "timer for projector",
        "silent timer",
        "countdown clock",
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
   UTILS (formatting, sound, fullscreen)
========================================================= */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
const pad2 = (n: number) => n.toString().padStart(2, "0");
function msToClock(ms: number) {
  const neg = ms < 0;
  const t = Math.max(0, Math.floor(Math.abs(ms)));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const prefix = neg ? "-" : "";
  return h > 0
    ? `${prefix}${h}:${pad2(m)}:${pad2(sec)}`
    : `${prefix}${m}:${pad2(sec)}`;
}

// WebAudio beep (single oscillator, short)
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

/* =========================================================
   LIGHTWEIGHT UI PRIMITIVES (same as Home)
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

const Chip = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
    }`}
  >
    {children}
  </button>
);

const Btn = ({
  kind = "solid",
  children,
  onClick,
  className = "",
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   COUNTDOWN TIMER (page version)
========================================================= */
function CountdownTimerCard() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);
  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );
  const [loop, setLoop] = useState(false);
  const [sound, setSound] = useState(true);
  const [inputStr, setInputStr] = useState("05:00");
  const displayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setInputStr(msToClock(durationMs));
  }, [durationMs]);

  useEffect(() => {
    if (status !== "running") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endTimeRef.current = null;
      return;
    }

    if (!endTimeRef.current) {
      endTimeRef.current = performance.now() + remainingMs;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endTimeRef.current ?? now) - now);
      setRemainingMs(rem);

      if (rem <= 0) {
        if (sound) beep();
        if (loop) {
          endTimeRef.current = performance.now() + durationMs;
          setRemainingMs(durationMs);
        } else {
          setStatus("done");
          endTimeRef.current = null;
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endTimeRef.current = null;
    };
  }, [status, durationMs, loop, sound, beep, remainingMs]);

  function safeReset(to?: number) {
    const ms = to ?? durationMs;
    setDurationMs(ms);
    setRemainingMs(ms);
    setStatus("idle");
    endTimeRef.current = null;
  }

  function parseInputToMs(str: string) {
    const parts = str
      .trim()
      .split(":")
      .map((p) => p.trim());
    let ms = 0;

    if (parts.length === 1) {
      const n = Number(parts[0] || "0");
      ms = n * 1000;
    } else if (parts.length === 2) {
      const m = Number(parts[0] || "0");
      const s = Number(parts[1] || "0");
      ms = (m * 60 + s) * 1000;
    } else {
      const h = Number(parts[0] || "0");
      const m = Number(parts[1] || "0");
      const s = Number(parts[2] || "0");
      ms = (h * 3600 + m * 60 + s) * 1000;
    }

    return clamp(ms, 0, 24 * 3600 * 1000);
  }

  function onSet() {
    const ms = parseInputToMs(inputStr);
    safeReset(ms);
  }

  const onPreset = (m: number) => safeReset(m * 60 * 1000);
  const onStartPause = () => {
    if (status === "running") {
      setStatus("paused");
      return;
    }
    if (remainingMs <= 0) setRemainingMs(durationMs);
    setStatus("running");
  };
  const onReset = () => safeReset();

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (e.key.toLowerCase() === "r") {
      onReset();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  };

  const done = status === "done";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Countdown Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Presets, custom time, loop, sound, fullscreen, and shortcuts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            Sound
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            Loop
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

      {/* Display */}
      <div
        ref={displayRef}
        className="mt-6 flex items-center justify-center rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 font-mono font-extrabold tracking-widest text-amber-950"
        style={{ minHeight: 220 }}
        aria-live="polite"
      >
        <span className="text-6xl sm:text-7xl md:text-8xl">
          {msToClock(remainingMs)}
        </span>
      </div>

      {/* Presets */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {presets.map((m) => (
          <Chip
            key={m}
            active={durationMs === m * 60 * 1000 && status !== "running"}
            onClick={() => onPreset(m)}
          >
            {m}m
          </Chip>
        ))}
      </div>

      {/* Custom input + controls */}
      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={inputStr}
            onChange={(e) => {
              if (status === "running") setStatus("paused");
              setInputStr(e.target.value);
            }}
            onBlur={onSet}
            placeholder="mm:ss or ss"
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Btn kind="ghost" onClick={onSet}>
            Set
          </Btn>
        </div>

        <Btn onClick={onStartPause}>
          {status === "running" ? "Pause" : "Start"}
        </Btn>

        <Btn kind="ghost" onClick={onReset}>
          Reset
        </Btn>
      </div>

      {done && (
        <div className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950">
          Time’s up. Press Start to run again or pick a preset.
        </div>
      )}

      {/* Shortcuts (readable, not tiny) */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
        Shortcuts: Space start/pause · R reset · F fullscreen
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function CountdownTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/countdown-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Countdown Timer",
        url,
        description:
          "Free online countdown timer with presets, custom input, loop mode, sound alerts, fullscreen display, and keyboard shortcuts. Great for classrooms, exams, presentations, and everyday tasks.",
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
            name: "Countdown Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is this countdown timer accurate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The timer tracks time using absolute timestamps to avoid drift and stays accurate even if the browser slows or the tab briefly loses focus.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use this countdown timer fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Fullscreen or press F while the timer card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "Can I turn off the sound?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the Sound toggle to enable or disable alerts.",
            },
          },
          {
            "@type": "Question",
            name: "Is this good for classrooms and exams?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Large digits and fullscreen mode make the countdown easy to read on projectors, smartboards, and shared screens.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts or pauses, R resets, and F toggles fullscreen while the countdown card is focused.",
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
            / <span className="text-amber-950">Countdown Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Countdown Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Free online countdown timer with presets, custom time input, sound,
            loop mode, fullscreen, and keyboard shortcuts.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {/* Timer: full width */}
        <div>
          <CountdownTimerCard />
        </div>

        {/* Quick-use hints: below, responsive */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Best uses for a countdown timer
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              A countdown timer is ideal when you have a fixed limit and want to
              see time remaining at a glance. It works well for classroom
              activities, timed exams, presentations, cooking, breaks, and short
              routines.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen classroom timer
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              For smartboards, projectors, and shared screens, use fullscreen
              mode so the remaining time is readable from across the room. Tip:
              click the timer card once so keyboard shortcuts work immediately.
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

      {/* SEO Section (under TimerMenuLinks) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free online countdown timer (fullscreen, classroom-friendly)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>countdown timer</strong> is built for fast,
              distraction-free timing. Choose a preset (1 to 60 minutes) or set
              a custom duration, then press <strong>Start</strong> to begin. The
              display uses large digits and high contrast so it’s easy to read
              on phones, laptops, and projectors.
            </p>

            <p>
              For teaching, testing, and meetings, switch to{" "}
              <strong>fullscreen countdown timer</strong> mode so everyone can
              see the remaining time from across the room. If you need a quiet
              setup, toggle <strong>Sound</strong> off. If you run repeating
              routines, enable <strong>Loop</strong> to restart the same
              countdown automatically.
            </p>

            <p>
              Keyboard control keeps the timer usable during presentations and
              proctored sessions. Click the timer card once to focus it, then
              use <strong>Space</strong> to start/pause, <strong>R</strong> to
              reset, and <strong>F</strong> for fullscreen.
            </p>

            <p>
              Looking for a different timing style? Use{" "}
              <strong>Stopwatch</strong> for elapsed time and laps,{" "}
              <strong>Pomodoro</strong> for study and focus cycles, or{" "}
              <strong>HIIT</strong> for work/rest intervals.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Classroom
              </h3>
              <p className="mt-2 text-sm text-amber-800 leading-relaxed">
                Use fullscreen on a smartboard or projector for quizzes,
                stations, transitions, and timed writing.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Exams & practice
              </h3>
              <p className="mt-2 text-sm text-amber-800 leading-relaxed">
                Set section timers for test prep and reset between parts to keep
                pacing consistent.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Presentations
              </h3>
              <p className="mt-2 text-sm text-amber-800 leading-relaxed">
                Keep the timer visible off to the side or fullscreen on a second
                screen to stay on schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Countdown Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this countdown timer accurate?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It tracks time using absolute timestamps to minimize drift,
              so it stays accurate even if the browser momentarily slows down.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use fullscreen mode?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click the Fullscreen button or press <strong>F</strong> while the
              timer card is focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I turn sound off?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle Sound off to run the countdown silently.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What input formats are supported?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              You can enter seconds (<em>90</em>), minutes and seconds (
              <em>05:00</em>), or hours, minutes, and seconds (<em>1:00:00</em>
              ).
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> starts/pauses, <strong>R</strong> resets,
              and <strong>F</strong> toggles fullscreen (when the card is
              focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
