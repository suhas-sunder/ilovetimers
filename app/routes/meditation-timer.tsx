// app/routes/meditation-timer.tsx
import type { Route } from "./+types/meditation-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Meditation Timer for Breathing and Yoga";
  const description =
    "Calm, distraction-free meditation timer. Set a quiet fullscreen countdown for breathing exercises, yoga sessions, or mindfulness practice. Clear, easy to read, and ready instantly.";

  const url = "https://ilovetimers.com/meditation-timer";

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
      g.gain.value = 0.08; // slightly softer than other timers

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
   MEDITATION TIMER CARD
========================================================= */
type Preset = { label: string; seconds: number; hint?: string };

function MeditationTimerCard() {
  const beep = useBeep();

  // Defaults that feel reasonable for meditation
  const presets: Preset[] = useMemo(
    () => [
      { label: "1m", seconds: 60, hint: "Quick reset" },
      { label: "2m", seconds: 120, hint: "Short breathing" },
      { label: "3m", seconds: 180, hint: "Mini session" },
      { label: "5m", seconds: 300, hint: "Starter meditation" },
      { label: "7m", seconds: 420, hint: "Short session" },
      { label: "10m", seconds: 600, hint: "Common daily" },
      { label: "12m", seconds: 720, hint: "Yoga breathwork" },
      { label: "15m", seconds: 900, hint: "Longer sit" },
      { label: "20m", seconds: 1200, hint: "Classic sit length" },
      { label: "30m", seconds: 1800, hint: "Deep session" },
      { label: "45m", seconds: 2700, hint: "Extended practice" },
      { label: "60m", seconds: 3600, hint: "Long sit / yoga" },
    ],
    [],
  );

  // Breathing presets: set a timer for a number of minutes people actually use for breathwork
  const breathingPresets: Preset[] = useMemo(
    () => [
      { label: "Box 3m", seconds: 3 * 60, hint: "Box breathing practice" },
      { label: "Box 5m", seconds: 5 * 60, hint: "Box breathing practice" },
      { label: "Breathe 7m", seconds: 7 * 60, hint: "Calm breathing" },
      { label: "Breathe 10m", seconds: 10 * 60, hint: "Calm breathing" },
    ],
    [],
  );

  const [seconds, setSeconds] = useState(10 * 60);
  const [remaining, setRemaining] = useState(seconds * 1000);
  const [running, setRunning] = useState(false);

  // Quiet by default: meditation rooms often want silence
  const [sound, setSound] = useState(false);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  // Loop is useful for repeated breathing rounds or yoga intervals
  const [loop, setLoop] = useState(false);
  const loopRef = useRef(false);

  // Optional gentle end chime if sound is on
  const [endChime, setEndChime] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // When sound is toggled off, keep beeps off too
  useEffect(() => {
    if (!sound) setFinalCountdownBeeps(false);
  }, [sound]);

  useEffect(() => {
    setRemaining(seconds * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [seconds]);

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
          // soft tiny beeps for optional countdown
          beep(740, 90);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound && endChime) {
          // gentle two-tone chime
          beep(528, 180);
          window.setTimeout(() => beep(660, 220), 180);
        }

        if (loopRef.current) {
          const next = seconds * 1000;
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
  }, [running, remaining, sound, finalCountdownBeeps, seconds, endChime, beep]);

  function reset() {
    setRunning(false);
    setRemaining(seconds * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function setPreset(sec: number) {
    setSeconds(sec);
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
    } else if (e.key.toLowerCase() === "l") {
      setLoop((v) => !v);
    } else if (e.key.toLowerCase() === "s") {
      setSound((v) => !v);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Meditation Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A quiet, simple countdown for <strong>meditation</strong>,{" "}
            <strong>breathing</strong>, and <strong>yoga</strong>. Loop is
            available for repeated rounds. Sound is optional.
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

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
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
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Breathing presets */}
      <div className="mt-6">
        <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
          Breathing timer presets
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {breathingPresets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(p.seconds)}
              title={p.hint}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                p.seconds === seconds
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meditation / yoga presets */}
      <div className="mt-6">
        <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
          Meditation + yoga presets
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(p.seconds)}
              title={p.hint}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                p.seconds === seconds
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-amber-950">
            Custom minutes
            <input
              type="number"
              min={0}
              max={999}
              value={minutesPart}
              onChange={(e) => {
                const m = clamp(Number(e.target.value || 0), 0, 999);
                setSeconds(m * 60 + secondsPart);
              }}
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>

          <label className="block text-sm font-semibold text-amber-950">
            + extra seconds
            <input
              type="number"
              min={0}
              max={59}
              value={secondsPart}
              onChange={(e) => {
                const s = clamp(Number(e.target.value || 0), 0, 59);
                setSeconds(minutesPart * 60 + s);
              }}
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
        </div>

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
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          urgent
            ? "border-rose-300 bg-rose-50 text-rose-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 240 }}
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
          style={{ minHeight: 240 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl md:text-8xl">
                {shownTime}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              Space start/pause · R reset · F fullscreen · S sound · L loop
              {loop ? " · Loop on" : ""}
              {!sound ? " · Sound off" : ""}
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Meditation Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · R reset · F fullscreen · S sound · L loop
              {loop ? " · Loop on" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen · S sound · L
          loop
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
export default function MeditationTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/meditation-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Meditation Timer",
        url,
        description:
          "Meditation timer with fullscreen countdown, breathing presets, loop option, and sound toggle. Quiet by default for meditation and yoga.",
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
            name: "Meditation Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a meditation timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A meditation timer is a countdown you set for a meditation session so you do not have to check the clock. It helps you stay present and end on time.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a breathing timer or a yoga timer too?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use shorter breathing presets for breathwork, or longer presets for yoga and meditation sessions. Loop can repeat the same duration for multiple rounds.",
            },
          },
          {
            "@type": "Question",
            name: "Can I keep sound off?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Sound is off by default. You can leave it silent, or turn sound on for a gentle end chime and optional final countdown beeps.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, F toggles fullscreen, S toggles sound, and L toggles loop while the card is focused.",
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
            / <span className="text-amber-950">Meditation Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Meditation Timer (Breathing + Yoga)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A quiet <strong>meditation timer</strong> with breathing presets,
            yoga-friendly durations, and a clean fullscreen countdown.{" "}
            <strong>Sound is off by default</strong>.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <MeditationTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Quiet by default
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Meditation spaces are often silent. This timer starts with Sound
              off, but you can enable a gentle end chime if you want it.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Breathing timer presets
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use short presets for breathwork, then toggle Loop to repeat
              rounds without touching your device.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen for yoga classes
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen gives huge digits and a clean display, useful for yoga
              flows, studios, or group sessions.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free meditation timer, breathing timer, and yoga timer with loop and
            sound toggle
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>meditation timer</strong> is a simple countdown you
              can set for a sit, breathwork, or yoga session. The goal is
              clarity: big numbers, fullscreen mode, and controls that do not
              get in the way.
            </p>

            <p>
              Use it as a <strong>breathing timer</strong> by picking a short
              duration (like 3–10 minutes), then enable <strong>Loop</strong> to
              repeat the same length for multiple rounds. For yoga, choose
              longer presets like 20, 30, or 60 minutes.
            </p>

            <p>
              Sound is optional. Leave it silent for quiet rooms, or turn Sound
              on for a gentle end chime and optional final countdown beeps.
            </p>

            <p>
              If you want a general tool, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For structured work and breaks, use{" "}
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
                Meditation timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Set a session length and stop checking the clock.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Breathing timer + loop
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Loop repeats the same duration for multiple breathwork rounds.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Sound off option
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Silent by default, with an optional end chime if you want audio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Meditation Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use this as a breathing timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Pick a short duration like 3–10 minutes. Turn on Loop to
              repeat the same timer for multiple rounds.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is sound required?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. Sound is off by default. You can keep it silent or enable a
              gentle end chime and optional final beeps.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this good for yoga classes?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use longer presets and fullscreen mode so the countdown stays
              visible across the room.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>F</strong> fullscreen • <strong>S</strong> sound •{" "}
              <strong>L</strong> loop (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
