// app/routes/fullscreen-timer.tsx
import type { Route } from "./+types/fullscreen-timer";
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
    "Fullscreen Timer | Big Online Timer for Projectors and Classrooms (Countdown + Shortcuts)";
  const description =
    "Free fullscreen timer with huge digits for projectors, smartboards, and classrooms. Start fast with presets or set a custom countdown. Keyboard shortcuts, optional sound, and loop mode.";
  const url = "https://ilovetimers.com/fullscreen-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "fullscreen timer",
        "timer for projector",
        "classroom fullscreen timer",
        "big timer",
        "large countdown timer",
        "online fullscreen countdown timer",
        "smartboard timer",
        "projector timer",
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

function useFullscreenState() {
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  return isFs;
}

// WebAudio beep
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
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
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
    }`}
  >
    {children}
  </button>
);

/* =========================================================
   FULLSCREEN OVERLAY (real fullscreen UX)
========================================================= */
function FullscreenOverlay({
  remainingMs,
  status,
  urgent,
  phaseLabel,
  onStartPause,
  onReset,
  onExitFullscreen,
}: {
  remainingMs: number;
  status: "idle" | "running" | "paused" | "done";
  urgent: boolean;
  phaseLabel: string;
  onStartPause: () => void;
  onReset: () => void;
  onExitFullscreen: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-amber-950 text-amber-50">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
            Fullscreen
          </div>
          <div className="text-sm font-semibold text-amber-100/90">
            {phaseLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={onExitFullscreen}
          className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-amber-50 hover:bg-white/15"
        >
          Exit (Esc)
        </button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <div
          className={`font-mono font-extrabold tracking-widest leading-none ${
            urgent ? "text-rose-300" : "text-amber-50"
          }`}
          style={{ fontSize: "clamp(64px, 16vw, 220px)" }}
          aria-live="polite"
        >
          {msToClock(remainingMs)}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStartPause}
            className="rounded-xl bg-amber-50 px-6 py-3 text-base font-extrabold text-amber-950 hover:bg-white"
          >
            {status === "running"
              ? "Pause"
              : status === "done"
                ? "Restart"
                : "Start"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="rounded-xl bg-white/10 px-6 py-3 text-base font-extrabold text-amber-50 hover:bg-white/15"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-amber-50/90">
          Shortcuts: Space start/pause · R reset · Esc exit fullscreen
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TOOL
========================================================= */
function FullscreenCountdown() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);
  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );

  const [sound, setSound] = useState(true);
  const [loop, setLoop] = useState(false);
  const [inputStr, setInputStr] = useState("05:00");

  const fsSurfaceRef = useRef<HTMLDivElement>(null);
  const isFs = useFullscreenState();

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
  }, [status, durationMs, remainingMs, loop, sound, beep]);

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
    if (status === "done") {
      setRemainingMs(durationMs);
      setStatus("running");
      return;
    }
    if (remainingMs <= 0) setRemainingMs(durationMs);
    setStatus("running");
  };

  const onReset = () => safeReset();

  const urgent =
    status === "running" && remainingMs > 0 && remainingMs <= 10_000;

  const phaseLabel =
    status === "running"
      ? "Running"
      : status === "paused"
        ? "Paused"
        : status === "done"
          ? "Done"
          : "Ready";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (e.key.toLowerCase() === "r") {
      onReset();
    } else if (e.key.toLowerCase() === "f") {
      if (fsSurfaceRef.current) toggleFullscreen(fsSurfaceRef.current);
    } else if (e.key === "Escape" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const requestFs = async () => {
    if (fsSurfaceRef.current) {
      await toggleFullscreen(fsSurfaceRef.current);
      window.setTimeout(() => fsSurfaceRef.current?.focus(), 50);
    }
  };

  const exitFs = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div>
      <div ref={fsSurfaceRef} tabIndex={0} onKeyDown={onKeyDown}>
        {isFs && (
          <FullscreenOverlay
            remainingMs={remainingMs}
            status={status}
            urgent={urgent}
            phaseLabel={phaseLabel}
            onStartPause={onStartPause}
            onReset={onReset}
            onExitFullscreen={exitFs}
          />
        )}
      </div>

      <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-amber-950">
              Fullscreen Timer
            </h2>
            <p className="mt-1 text-base text-slate-700">
              Big readable countdown for projectors and classrooms.
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
              Loop
            </label>

            <Btn kind="ghost" onClick={requestFs} className="py-2">
              Fullscreen
            </Btn>
          </div>
        </div>

        <div
          className={`mt-6 rounded-2xl border-2 p-6 ${
            urgent
              ? "border-rose-200 bg-rose-50 text-rose-950"
              : "border-amber-300 bg-amber-50 text-amber-950"
          }`}
          style={{ minHeight: 220 }}
          aria-live="polite"
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-extrabold uppercase tracking-wide opacity-95">
              Countdown
            </div>
            <div className="text-sm font-semibold opacity-95">{phaseLabel}</div>
          </div>

          <div className="mt-6 flex items-center justify-center font-mono font-extrabold tracking-widest">
            <span className="text-6xl sm:text-7xl md:text-8xl leading-none">
              {msToClock(remainingMs)}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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

          <div className="mt-6 mx-auto grid w-full max-w-3xl gap-3 md:grid-cols-[1fr_auto_auto]">
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
                className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Btn kind="ghost" onClick={onSet}>
                Set
              </Btn>
            </div>

            <Btn onClick={onStartPause}>
              {status === "running"
                ? "Pause"
                : status === "done"
                  ? "Restart"
                  : "Start"}
            </Btn>

            <Btn kind="ghost" onClick={onReset}>
              Reset
            </Btn>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs font-semibold text-amber-950 text-center">
            Shortcuts: Space start/pause · R reset · F fullscreen · Esc exit
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function FullscreenTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/fullscreen-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Fullscreen Timer",
        url,
        description:
          "Free fullscreen timer with huge digits for projectors, smartboards, and classrooms. Presets, custom countdown, sound, loop, fullscreen, and keyboard shortcuts.",
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
            name: "Fullscreen Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a fullscreen timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A fullscreen timer is designed for big screens so the remaining time is readable from across a room. This page uses oversized centered digits for projectors, smartboards, and classroom displays.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a timer for a projector or smartboard?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It is optimized for distance readability and quick controls. Use Fullscreen (or press F) after clicking the timer to focus it.",
            },
          },
          {
            "@type": "Question",
            name: "Can I turn sound off or loop the timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Turn Sound off for quiet rooms and enable Loop to repeat the same countdown automatically.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, F toggles fullscreen, and Esc exits fullscreen (when focused).",
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

      {/* Sticky Header (same style as other pages) */}
      <header className="sticky top-0 z-10 border-b border-amber-400 bg-amber-500/30/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            ⏱ iLoveTimers
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
            / <span className="text-amber-950">Fullscreen Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Fullscreen Timer (Projector + Classroom)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>fullscreen timer</strong> designed for distance
            readability: huge centered digits, quick presets, optional sound,
            loop mode, and keyboard shortcuts.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <FullscreenCountdown />

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Built for projectors
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen uses a dedicated big-screen view with centered digits
              and minimal controls. Press <strong>Esc</strong> to exit.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Classroom routines
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use presets for quick transitions. Turn on <strong>Loop</strong>{" "}
              to repeat the same countdown for stations, rotations, or drills.
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
              <li>
                <strong>Esc</strong> = Exit fullscreen
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Shared menu */}
       <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section (THIS was missing) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Fullscreen timer for projectors and classrooms
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>fullscreen timer</strong> is made for big screens
              where normal timers look tiny. Use it as a{" "}
              <strong>timer for a projector</strong>, smartboard, TV, or shared
              screen. The fullscreen view is a dedicated layout with huge
              centered digits so students, teams, and audiences can read the
              time remaining from anywhere in the room.
            </p>

            <p>
              Start quickly with 1-click presets, or set a custom countdown. If
              you’re in a quiet room, toggle <strong>Sound</strong> off. If
              you’re repeating the same routine over and over, turn on{" "}
              <strong>Loop</strong> to restart automatically at zero.
            </p>

            <p>
              For presentations and classes, keyboard control keeps things
              smooth. Click the timer once to focus it, then use{" "}
              <strong>Space</strong> to start/pause and <strong>R</strong> to
              reset. Press <strong>F</strong> to fullscreen and{" "}
              <strong>Esc</strong> to exit.
            </p>

            <p>
              Need other timing styles? Use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown
              </Link>{" "}
              for a standard page layout,{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>{" "}
              for elapsed time and laps,{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>{" "}
              for study cycles, or{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>{" "}
              for work/rest intervals.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Projector ready
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Huge centered digits in fullscreen so timing is readable from
                the back of the room.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Classroom friendly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Perfect for transitions, stations, quizzes, and timed writing
                with fast presets.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Keyboard control
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Space start/pause, R reset, F fullscreen, Esc exit. No fiddly
                clicking while presenting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Fullscreen Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why use a fullscreen timer instead of a normal countdown?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Fullscreen mode uses a dedicated layout with centered,
              viewport-scaled digits and minimal controls, so it stays readable
              on projectors and TVs.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I exit fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Press <strong>Esc</strong> or click <strong>Exit</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use this as a classroom fullscreen timer without sound?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle <strong>Sound</strong> off for silent classrooms,
              testing rooms, or presentations.
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 I Love Timers - free countdown, stopwatch, Pomodoro, and HIIT
          interval timers
        </div>
      </footer>
    </main>
  );
}
