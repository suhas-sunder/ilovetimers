// app/routes/classroom-timer.tsx
import type { Route } from "./+types/classroom-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Classroom Timer | Timer for Teachers & Smartboard (Fullscreen, Big, Simple)";
  const description =
    "Free classroom timer for teachers. Big fullscreen countdown for smartboards and projectors, quick presets, custom minutes, optional sound, and keyboard shortcuts. Great for transitions, centers, and tests.";
  const url = "https://ilovetimers.com/classroom-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "classroom timer",
        "timer for teachers",
        "smartboard timer",
        "interactive whiteboard timer",
        "timer for classroom",
        "teacher timer",
        "countdown timer for classroom",
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
   CLASSROOM TIMER CARD
========================================================= */
function ClassroomTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 30, 45, 60],
    [],
  );

  const [label, setLabel] = useState("Classroom Timer");
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);
  const [endChime, setEndChime] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  const lastBeepSecondRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    endedRef.current = false;
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

        if (!endedRef.current) {
          endedRef.current = true;
          if (sound && endChime) {
            // simple 2-tone chime
            beep(660, 180);
            window.setTimeout(() => beep(990, 220), 220);
          } else if (sound && !endChime) {
            beep(660, 220);
          }
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
  }, [running, remaining, sound, finalCountdownBeeps, endChime, beep]);

  function reset() {
    setRunning(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    endedRef.current = false;
  }

  function startPause() {
    endedRef.current = false;
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  function addSeconds(deltaSeconds: number) {
    const delta = deltaSeconds * 1000;
    setRemaining((r) => {
      const next = clamp(r + delta, 0, 3 * 60 * 60 * 1000);
      if (running && endRef.current) {
        endRef.current = endRef.current + delta;
      }
      return next;
    });
    endedRef.current = false;
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
    } else if (e.key === "+") {
      addSeconds(60);
    } else if (e.key === "-") {
      addSeconds(-60);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const finished = !running && remaining <= 0;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Classroom Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Built for teachers. Big digits for smartboards, quick presets for
            transitions, optional sound, and simple keyboard shortcuts.
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
              checked={endChime}
              onChange={(e) => setEndChime(e.target.checked)}
              disabled={!sound}
            />
            End chime
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

      {/* Custom minutes + label */}
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <label className="block text-sm font-semibold text-amber-950">
          Custom minutes
          <input
            type="number"
            min={1}
            max={180}
            value={minutes}
            onChange={(e) =>
              setMinutes(clamp(Number(e.target.value || 1), 1, 180))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Label (optional)
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value.slice(0, 40))}
            placeholder="Transition, Centers, Quiz..."
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

      {/* Quick adjust */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Btn kind="ghost" onClick={() => addSeconds(-60)}>
          -1 min
        </Btn>
        <Btn kind="ghost" onClick={() => addSeconds(60)}>
          +1 min
        </Btn>
        <Btn kind="ghost" onClick={() => addSeconds(300)}>
          +5 min
        </Btn>
        <div className="text-xs text-slate-600">
          Shortcuts: + adds 1 minute · - removes 1 minute
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          finished
            ? "border-emerald-300 bg-emerald-50 text-emerald-950"
            : urgent
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
                width:min(1600px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 900 22px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.92;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(96px, 18vw, 260px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.86;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-state{
                margin-top:2px;
                font: 900 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.10em;
                text-transform:uppercase;
                opacity:.86;
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
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <div className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
              {label.trim() ? label : "Classroom Timer"}
            </div>
            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl md:text-8xl">
                {shownTime}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              Space start/pause · R reset · F fullscreen · + / - adjust
            </div>
            {finished ? (
              <div className="mt-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white">
                Time is up
              </div>
            ) : null}
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">{label.trim() ? label : "Classroom"}</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-sub">
              Space start/pause · R reset · F fullscreen · + / - adjust
            </div>
            <div className="fs-state">
              {finished ? "TIME IS UP" : running ? "RUNNING" : "READY"}
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts note */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen · + / - adjust
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function ClassroomTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/classroom-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Classroom Timer",
        url,
        description:
          "Fullscreen classroom timer for teachers and smartboards. Big countdown, quick presets, optional sound, and keyboard shortcuts.",
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
            name: "Classroom Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a classroom timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A classroom timer is a large countdown clock used by teachers to keep activities on schedule. It is commonly shown on a smartboard or projector so students can see the remaining time from across the room.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a smartboard timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use Fullscreen (or press F) for a clean dark view with huge digits that works well on smartboards, projectors, and TVs.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use this timer silently?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Turn Sound off. The timer still runs normally and stays visible on screen.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, F toggles fullscreen, and + or - adjusts the remaining time by one minute while the card is focused.",
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
            / <span className="text-amber-950">Classroom Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Classroom Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>classroom timer</strong> for teachers and a true{" "}
            <strong>smartboard timer</strong> in fullscreen. Designed for
            readability, quick control, and simple routines.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <ClassroomTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Made for teacher visibility
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use Fullscreen for a dark view with huge digits. It stays readable
              across the classroom on smartboards and projectors.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fast presets for classroom routines
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Try <strong>1 to 3 minutes</strong> for transitions,{" "}
              <strong>5 to 10</strong> for warm ups, and{" "}
              <strong>15 to 30</strong> for centers or independent work.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Simple shortcuts
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
                <strong>+</strong> / <strong>-</strong> = Add / remove 1 minute
              </li>
            </ul>
          </div>
        </div>
      </section>


      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free classroom timer for teachers and smartboards
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>classroom timer</strong> is a simple{" "}
              <strong>timer for teachers</strong> that keeps lessons moving.
              Pick a preset, press Start, and display the countdown where
              students can see it. It works well as a{" "}
              <strong>smartboard timer</strong> because fullscreen is clean,
              high contrast, and easy to read from the back of the room.
            </p>

            <p>
              Use the Label box for quick context like “Transition”, “Centers”,
              or “Quiz”. Need flexibility mid activity? Use the + and - buttons
              (or keyboard) to add or remove time without restarting.
            </p>

            <p>
              If you want an all purpose option, try{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For quiet work time, toggle Sound off. For structured work and
              break blocks, use{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>{" "}
              or{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Classroom routines
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Use 1 to 3 minutes for transitions, 5 to 10 for warm ups, and 15
                to 30 for stations and centers.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Smartboard friendly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Fullscreen reduces visual clutter and keeps the countdown
                readable at a distance.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Flexible control
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Adjust time on the fly with + and - without resetting the whole
                activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Classroom Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a classroom timer or a smartboard timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Both. It is a classroom countdown designed to be shown on a
              smartboard, projector, or TV with big readable digits.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I make it look good on a smartboard?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Use <strong>Fullscreen</strong> (or press <strong>F</strong>) for
              a dark high contrast display with very large digits.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I run it without sound?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle <strong>Sound</strong> off for silent work time. The
              countdown still runs normally.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I add a minute without restarting?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use the +1 min button or press <strong>+</strong>. Use{" "}
              <strong>-</strong> to subtract a minute.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
