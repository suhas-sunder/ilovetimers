// app/routes/study-timer.tsx
import type { Route } from "./+types/study-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Study Timer for Focus and Homework";
  const description =
    "Stay focused while studying with a simple study timer. Run distraction-free study sessions using a clear fullscreen countdown built for homework and deep focus.";

  const url = "https://ilovetimers.com/study-timer";

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
   STUDY TIMER CARD
========================================================= */
function StudyTimerCard() {
  const beep = useBeep();

  // Study-friendly blocks + quick drills
  const presetsMin = useMemo(
    () => [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90],
    [],
  );
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  // Focus-specific options
  const [focusMode, setFocusMode] = useState(true); // darker, less UI
  const [milestones, setMilestones] = useState(true); // small on-screen cues
  const [showETA, setShowETA] = useState(false); // "Ends at 3:42 PM" (local)

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [minutes]);

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
        setRunning(false);
        lastBeepSecondRef.current = null;
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
  }, [running, remaining, sound, finalCountdownBeeps, beep]);

  function reset() {
    setRunning(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function setPreset(m: number) {
    setMinutes(m);
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
    } else if (e.key.toLowerCase() === "m") {
      setFocusMode((v) => !v);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const progress = useMemo(() => {
    const total = minutes * 60 * 1000;
    const done = clamp(total - remaining, 0, total);
    return total > 0 ? done / total : 0;
  }, [minutes, remaining]);

  const endsAt = useMemo(() => {
    if (!showETA || !running || !endRef.current) return null;
    const msLeft = remaining;
    const end = new Date(Date.now() + msLeft);
    return end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [showETA, running, remaining]);

  const milestoneText = useMemo(() => {
    if (!milestones || !running) return null;
    if (progress >= 0.75 && progress < 1) return "Last quarter";
    if (progress >= 0.5 && progress < 0.75) return "Halfway";
    if (progress >= 0.25 && progress < 0.5) return "Warming up";
    return "Start";
  }, [milestones, running, progress]);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Study Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            Built for focus and homework. Study-length presets, fullscreen,
            optional sound, and simple shortcuts.
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

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={focusMode}
              onChange={(e) => setFocusMode(e.target.checked)}
            />
            Focus mode
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

      {/* Focus extras */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          <input
            type="checkbox"
            checked={milestones}
            onChange={(e) => setMilestones(e.target.checked)}
          />
          Milestones
        </label>

        <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          <input
            type="checkbox"
            checked={showETA}
            onChange={(e) => setShowETA(e.target.checked)}
          />
          Show end time
        </label>

        <div className="text-xs text-slate-600">
          Shortcut: <strong>M</strong> toggles Focus mode (when focused)
        </div>
      </div>

      {/* Presets + custom */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {presetsMin.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPreset(m)}
            className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
              m === minutes
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block text-sm font-semibold text-amber-950">
          Custom minutes
          <input
            type="number"
            min={1}
            max={240}
            value={minutes}
            onChange={(e) =>
              setMinutes(clamp(Number(e.target.value || 1), 1, 240))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        data-focus={focusMode ? "1" : "0"}
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          urgent
            ? "border-rose-300 bg-rose-50 text-rose-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 260 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              /* Focus mode (normal view): reduce extra UI emphasis */
              [data-fs-container][data-focus="1"] .focus-muted{opacity:.7}

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
                font: 800 22px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(96px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-bar{
                width:min(900px, 92vw);
                height:10px;
                border-radius:999px;
                background:rgba(255,255,255,.12);
                overflow:hidden;
              }
              [data-fs-container]:fullscreen .fs-bar > div{
                height:100%;
                width:var(--p, 0%);
                background:rgba(255,255,255,.75);
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
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700 focus-muted">
              {milestoneText ? milestoneText : "Study session"}
              {endsAt ? ` · Ends at ${endsAt}` : ""}
            </div>

            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl md:text-8xl">
                {shownTime}
              </span>
            </div>

            <div className="w-full max-w-xl">
              <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
                <div
                  className="h-full bg-amber-700"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-slate-600 focus-muted">
                Space start/pause · R reset · F fullscreen · M focus mode
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div
            className="fs-inner"
            style={{ ["--p" as any]: `${Math.round(progress * 100)}%` }}
          >
            <div className="fs-label">Study Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-bar">
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="fs-sub">
              Space start/pause · R reset · F fullscreen
              {sound ? "" : " · Sound off"}
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen · M focus mode
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
export default function StudyTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/study-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Study Timer",
        url,
        description:
          "Fullscreen study timer for focus and homework. Big countdown, study-friendly presets, optional sound, and keyboard shortcuts.",
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
            name: "Study Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a study timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A study timer is a countdown clock used to stay focused for a set time while studying or doing homework. It helps you commit to a session and avoid constantly checking the time.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a focus timer for homework?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Choose a preset like 25, 30, or 45 minutes and run fullscreen for a distraction-free focus session.",
            },
          },
          {
            "@type": "Question",
            name: "What are good study session lengths?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Common session lengths are 25 to 30 minutes for short focus blocks and 45 to 60 minutes for deeper study. Pick a preset or set a custom time that matches your workload.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, F toggles fullscreen, and M toggles Focus mode while the timer card is focused.",
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
            / <span className="text-amber-950">Study Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Study Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>study timer</strong> for <strong>focus</strong> and{" "}
            <strong>homework</strong> with presets and a true fullscreen view.
            Designed to keep you on task without distractions.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <StudyTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Focus timer that stays readable
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen keeps the countdown visible while removing clutter.
              Great for laptop, tablet, or a second screen.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Homework friendly presets
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Try <strong>25 to 30 minutes</strong> for a focused block,{" "}
              <strong>45 to 60</strong> for deeper work, and{" "}
              <strong>75 to 90</strong> for long study sessions.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Focus mode + progress
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Turn on Focus mode for less visual noise, and use the progress bar
              to keep pacing without checking the clock.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free study timer for focus sessions and homework blocks
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>study timer</strong> is a simple{" "}
              <strong>focus timer</strong> designed for students and anyone
              doing deep work. Set a time, press Start, and keep the countdown
              visible so you can stay focused without checking your phone.
            </p>

            <p>
              Use it as a <strong>homework timer</strong> by choosing a preset
              like 25, 30, or 45 minutes. Fullscreen mode is intentionally
              minimal: dark background, large digits, and a progress bar for
              pacing.
            </p>

            <p>
              If you want a structured work and break cycle, try{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>
              . For a general purpose tool, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For workouts, use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Study timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Commit to a single session length and finish the block before
                switching tasks.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Focus timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Focus mode and fullscreen reduce distractions during deep work.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Homework timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Use shorter blocks for assignments or longer blocks for big
                projects and study prep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Study Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a study timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A study timer is a countdown clock for staying focused during a
              study session. It helps you commit to a set time and finish the
              block before taking a break.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a focus timer for homework?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It works as a focus timer for homework, studying, reading,
              and any deep work session. Fullscreen is especially helpful.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a good study session length?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many people use 25 to 30 minutes for a focused block and 45 to 60
              minutes for deeper work. Choose what matches your attention and
              workload.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>F</strong> fullscreen • <strong>M</strong> focus mode
              (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
