// app/routes/visual-timer.tsx
import type { Route } from "./+types/visual-timer";
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
    "Visual Timer | Classroom Visual Timer for Kids (Fullscreen, Simple)";
  const description =
    "Free visual timer for kids and classrooms. A countdown with a big time display plus a shrinking visual bar (and optional pie-style ring). Fullscreen, presets, custom minutes, sound optional, and easy keyboard shortcuts.";
  const url = "https://ilovetimers.com/visual-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "visual timer",
        "timer kids",
        "classroom visual timer",
        "visual countdown timer",
        "timer for kids",
        "teacher visual timer",
        "smartboard timer",
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
   VISUAL TIMER CARD
   - Big digits + visual progress that shrinks
   - Two modes: Bar (super clear) and Ring (nice visual)
========================================================= */
type VisualMode = "bar" | "ring";

function VisualTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 60],
    [],
  );

  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [mode, setMode] = useState<VisualMode>("bar");
  const [showTime, setShowTime] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const totalMs = minutes * 60 * 1000;

  useEffect(() => {
    setRemaining(totalMs);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [minutes, totalMs]);

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
        if (sound) beep(660, 240);
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
    setRemaining(totalMs);
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
    } else if (e.key.toLowerCase() === "v") {
      setMode((m) => (m === "bar" ? "ring" : "bar"));
    } else if (e.key.toLowerCase() === "t") {
      setShowTime((v) => !v);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const fracLeft = totalMs > 0 ? clamp(remaining / totalMs, 0, 1) : 0;

  // Ring math
  const ringSize = 220;
  const stroke = 18;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * fracLeft;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Visual Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A <strong>classroom visual timer</strong> for kids: time you can
            see. The visual shrinks as time runs out, so it’s easier to
            understand than numbers alone.
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

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
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

        <div className="flex flex-wrap items-end gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <button
              type="button"
              onClick={() => setMode("bar")}
              className={`rounded-md px-2 py-1 ${
                mode === "bar" ? "bg-amber-700 text-white" : "hover:underline"
              }`}
              title="Bar mode"
            >
              Bar
            </button>
            <button
              type="button"
              onClick={() => setMode("ring")}
              className={`rounded-md px-2 py-1 ${
                mode === "ring" ? "bg-amber-700 text-white" : "hover:underline"
              }`}
              title="Ring mode"
            >
              Ring
            </button>

            <label className="ml-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-950">
              <input
                type="checkbox"
                checked={showTime}
                onChange={(e) => setShowTime(e.target.checked)}
              />
              Show time
            </label>
          </div>
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
        style={{ minHeight: 340 }}
        aria-live="polite"
      >
        {/* Fullscreen CSS: show ONLY the fullscreen shell in fullscreen */}
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
                gap:22px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 22px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(72px, 12vw, 190px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.06em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-visual{
                width:min(1100px, 90vw);
              }

              [data-fs-container]:fullscreen .fs-barOuter{
                height:56px;
                border-radius:999px;
                background:rgba(255,255,255,.14);
                overflow:hidden;
                border:1px solid rgba(255,255,255,.18);
              }
              [data-fs-container]:fullscreen .fs-barFill{
                height:100%;
                background:rgba(255,255,255,.92);
                transform-origin:left center;
              }

              [data-fs-container]:fullscreen .fs-ringWrap{
                width:min(520px, 70vw);
                aspect-ratio:1/1;
                display:flex;
                align-items:center;
                justify-content:center;
              }
              [data-fs-container]:fullscreen .fs-ringTime{
                position:absolute;
                font: 900 clamp(54px, 7vw, 110px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.04em;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 340 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-5">
            {showTime ? (
              <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
                <span className="text-6xl sm:text-7xl md:text-8xl">
                  {shownTime}
                </span>
              </div>
            ) : (
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Visual only
              </div>
            )}

            {mode === "bar" ? (
              <div className="w-full max-w-4xl">
                <div className="h-10 w-full overflow-hidden rounded-full border-2 border-amber-300 bg-white">
                  <div
                    className="h-full bg-amber-700"
                    style={{ width: `${Math.round(fracLeft * 100)}%` }}
                    aria-label="Visual time remaining bar"
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Start</span>
                  <span>Done</span>
                </div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <svg
                  width={ringSize}
                  height={ringSize}
                  viewBox={`0 0 ${ringSize} ${ringSize}`}
                  aria-label="Visual time remaining ring"
                >
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={r}
                    stroke="#fbbf24"
                    strokeWidth={stroke}
                    fill="none"
                    opacity={0.25}
                  />
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={r}
                    stroke="#b45309"
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  />
                </svg>
                {showTime ? (
                  <div className="absolute font-mono text-3xl font-extrabold tracking-widest text-amber-950">
                    {shownTime}
                  </div>
                ) : null}
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
              Shortcuts: Space start/pause · R reset · F fullscreen · V toggle
              visual · T toggle time
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Visual Timer</div>

            {mode === "bar" ? (
              <div className="fs-visual w-full">
                <div className="fs-barOuter">
                  <div
                    className="fs-barFill"
                    style={{ transform: `scaleX(${fracLeft})` }}
                  />
                </div>
              </div>
            ) : (
              <div className="fs-ringWrap fs-visual relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="rgba(255,255,255,.18)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="rgba(255,255,255,.92)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38 * fracLeft} ${2 * Math.PI * 38 * (1 - fracLeft)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                {showTime ? (
                  <div className="fs-ringTime">{shownTime}</div>
                ) : null}
              </div>
            )}

            {showTime ? <div className="fs-time">{shownTime}</div> : null}

            <div className="fs-help">
              Space start/pause · R reset · V visual · T time · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Teacher/kids guidance */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">
            Why visual helps kids
          </h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            A visual timer shows “how much time is left” without needing to read
            minutes and seconds. The bar or ring shrinks until time is done.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">Classroom use</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Great for centers, transitions, silent reading, clean-up time, and
            “you have 5 minutes” moments. Fullscreen is designed for smartboards
            and projectors.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">Simple controls</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Use presets for quick setup. If kids get distracted by numbers, turn
            off “Show time” and use visual-only mode.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function VisualTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/visual-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Visual Timer",
        url,
        description:
          "Visual timer for kids and classrooms with a shrinking visual (bar or ring) plus optional time display. Fullscreen, presets, sound optional, and shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Visual Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a visual timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A visual timer shows time remaining as a shrinking shape, like a bar or ring. That makes it easier for kids to understand how much time is left without focusing on numbers.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a classroom visual timer for smartboards?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Fullscreen is designed for smartboards and projectors with a simple high-contrast display.",
            },
          },
          {
            "@type": "Question",
            name: "Can I hide the numbers for a kids timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Turn off “Show time” to use visual-only mode so kids focus on the shrinking bar or ring instead of minutes and seconds.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, F toggles fullscreen, V switches between bar and ring visuals, and T toggles the time display while the card is focused.",
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
            / <span className="text-amber-950">Visual Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Visual Timer for Kids (Classroom Visual Timer)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>visual timer</strong> that shows time remaining as a
            shrinking bar or ring. Built for classrooms, smartboards, and kids
            who understand visuals faster than numbers.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <VisualTimerCard />
        </div>
      </section>

      {/* Menu Links */}
       <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free visual timer for kids and classrooms (smartboard-friendly)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>visual timer</strong> is designed for situations
              where kids need to “see” time. Instead of relying only on numbers,
              the visual shrinks as time runs out. That makes it a strong{" "}
              <strong>timer for kids</strong> and a practical{" "}
              <strong>classroom visual timer</strong>.
            </p>

            <p>
              Choose a preset (like 5 or 10 minutes) and press Start. Use
              Fullscreen for smartboards and projectors. If the numbers are
              distracting, turn off “Show time” and run visual-only mode.
            </p>

            <p>
              Want a classic numbers-only countdown? Use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . Need a speaker timer for talks? Use{" "}
              <Link
                to="/presentation-timer"
                className="font-semibold hover:underline"
              >
                Presentation Timer
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Visual timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Shows time remaining as a shrinking bar or ring.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Timer for kids
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Visual-only mode helps kids focus without watching every second.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Classroom visual timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Fullscreen is built for smartboards and projectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Visual Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How is a visual timer different from a normal countdown?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A visual timer shows time remaining as a shrinking shape (bar or
              ring). Kids can understand “how much time is left” without reading
              the clock.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I hide the numbers for a kids timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Turn off <strong>Show time</strong> to use visual-only mode.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this good for a smartboard or projector?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use <strong>Fullscreen</strong> for big visuals and high
              contrast on classroom displays.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>F</strong> fullscreen • <strong>V</strong> bar/ring •{" "}
              <strong>T</strong> show/hide time (when focused).
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 i💛Timers - free countdown, stopwatch, Pomodoro, and HIIT
          interval timers
        </div>
      </footer>
    </main>
  );
}
