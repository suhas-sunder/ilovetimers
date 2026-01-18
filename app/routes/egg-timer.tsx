// app/routes/egg-timer.tsx
import type { Route } from "./+types/egg-timer";
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
    "Egg Timer | Boiled Egg Timer (Soft, Medium, Hard) (Fullscreen, Simple, Visible)";
  const description =
    "Free egg timer for boiled eggs. One-click presets for soft, medium, and hard boiled eggs, plus big readable countdown, optional sound, and fullscreen mode. Includes quick timing guide for common doneness levels.";
  const url = "https://ilovetimers.com/egg-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "egg timer",
        "boiled egg timer",
        "soft boiled egg timer",
        "medium boiled egg timer",
        "hard boiled egg timer",
        "boiled egg timer soft medium hard",
        "egg boiling timer",
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
   UI PRIMITIVES (same style as Home/Pomodoro)
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
   EGG TIMER CARD
========================================================= */
type DonenessKey =
  | "soft"
  | "medium"
  | "hard"
  | "jammy"
  | "very_hard"
  | "poached";

type EggPreset = {
  key: DonenessKey;
  label: string;
  minutes: number;
  seconds: number;
  note: string;
};

const EGG_PRESETS: EggPreset[] = [
  {
    key: "soft",
    label: "Soft",
    minutes: 6,
    seconds: 0,
    note: "6:00 (runny yolk, set whites)",
  },
  {
    key: "jammy",
    label: "Jammy",
    minutes: 7,
    seconds: 0,
    note: "7:00 (creamy/jammy yolk)",
  },
  {
    key: "medium",
    label: "Medium",
    minutes: 8,
    seconds: 0,
    note: "8:00 (mostly set, slightly creamy)",
  },
  {
    key: "hard",
    label: "Hard",
    minutes: 10,
    seconds: 0,
    note: "10:00 (fully set yolk)",
  },
  {
    key: "very_hard",
    label: "Very hard",
    minutes: 12,
    seconds: 0,
    note: "12:00 (extra firm)",
  },
  {
    key: "poached",
    label: "Poached",
    minutes: 3,
    seconds: 30,
    note: "3:30 (classic poach)",
  },
];

function EggTimerCard() {
  const beep = useBeep();

  const [preset, setPreset] = useState<DonenessKey>("soft");
  const [minutes, setMinutes] = useState(6);
  const [seconds, setSeconds] = useState(0);

  const [remaining, setRemaining] = useState((minutes * 60 + seconds) * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  // Apply preset
  useEffect(() => {
    const p = EGG_PRESETS.find((x) => x.key === preset);
    if (!p) return;
    setMinutes(p.minutes);
    setSeconds(p.seconds);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    setRemaining((p.minutes * 60 + p.seconds) * 1000);
  }, [preset]);

  // When custom time changes
  useEffect(() => {
    setRemaining((minutes * 60 + seconds) * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [minutes, seconds]);

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
    setRemaining((minutes * 60 + seconds) * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    // prime audio on gesture
    if (!running && sound) beep(0, 1);
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
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
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const presetNote = useMemo(() => {
    const p = EGG_PRESETS.find((x) => x.key === preset);
    return p?.note ?? "";
  }, [preset]);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Egg Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            A fast <strong>egg timer</strong> for boiled eggs. One-click presets
            for <strong>soft</strong>, <strong>medium</strong>, and{" "}
            <strong>hard</strong> (plus jammy). Big digits, optional sound, and
            fullscreen.
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

      {/* Presets */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {EGG_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPreset(p.key)}
            className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
              p.key === preset
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom time */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block text-sm font-semibold text-amber-950">
          Minutes
          <input
            type="number"
            min={0}
            max={60}
            value={minutes}
            onChange={(e) =>
              setMinutes(clamp(Number(e.target.value || 0), 0, 60))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Seconds
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) =>
              setSeconds(clamp(Number(e.target.value || 0), 0, 59))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause} disabled={minutes * 60 + seconds <= 0}>
            {running ? "Pause" : "Start"}
          </Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
        </div>
      </div>

      {/* Quick doneness cue */}
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
          Selected preset
        </div>
        <div className="mt-1 text-sm font-semibold text-amber-950">
          {presetNote}
        </div>
        <div className="mt-2 text-sm text-amber-900">
          These are common starting points for large eggs in simmering water.
          Adjust for fridge-cold eggs, altitude, and preference.
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
        {/* Fullscreen CSS: show ONLY fullscreen shell in fullscreen */}
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
          style={{ minHeight: 240 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              {EGG_PRESETS.find((x) => x.key === preset)?.label ?? "Egg"} timer
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {shownTime}
            </div>

            <div className="text-xs font-semibold text-amber-800">
              Shortcuts: Space start/pause · R reset · F fullscreen
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Egg Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen
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
export default function EggTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/egg-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Egg Timer",
        url,
        description:
          "An egg timer for boiled eggs with soft, medium, and hard presets, plus fullscreen and optional sound.",
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
            name: "Egg Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How long do you boil eggs for soft, medium, and hard?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Common starting points are about 6 minutes for soft-boiled, 8 minutes for medium, and 10 minutes for hard-boiled eggs. Actual timing can vary by egg size, starting temperature, and altitude.",
            },
          },
          {
            "@type": "Question",
            name: "Does this boiled egg timer work for soft, medium, and hard eggs?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the one-click presets for soft, medium, and hard boiled eggs, or set a custom time for your preferred doneness.",
            },
          },
          {
            "@type": "Question",
            name: "Should I start timing eggs from cold water or boiling water?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Many timing guides assume you start timing once the water is gently boiling or simmering. If you start from cold water, the total time can be longer and less consistent.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, and F toggles fullscreen while the timer card is focused.",
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
            / <span className="text-amber-950">Egg Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Egg Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>egg timer</strong> with one-click presets for{" "}
            <strong>soft</strong>, <strong>medium</strong>, and{" "}
            <strong>hard</strong> boiled eggs.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <EggTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Soft, medium, hard presets
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Tap a preset and start. If your eggs are extra large or
              fridge-cold, add a bit of time.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Reduce overcooking
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              When the timer ends, move eggs to an ice bath to stop cooking fast
              and reduce the gray yolk ring.
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

      {/* Menu Links */}
      <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free boiled egg timer (soft, medium, hard)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>egg timer</strong> is a quick{" "}
              <strong>boiled egg timer</strong> with presets for{" "}
              <strong>soft</strong>, <strong>medium</strong>, and{" "}
              <strong>hard</strong> boiled eggs. Pick your doneness, press
              Start, and stop the cook when the countdown hits zero.
            </p>

            <p>
              Timing depends on egg size and starting temperature. Many people
              start the timer when the water is gently boiling or simmering. If
              you start from cold water, you will usually need more time.
            </p>

            <p>
              If you want a general-purpose tool, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For tea and coffee, use{" "}
              <Link to="/tea-timer" className="font-semibold hover:underline">
                Tea Timer
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Soft boiled
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Runny center with set whites. Good for toast dipping.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Medium / jammy
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Creamy yolk that is not fully firm. Popular for ramen eggs.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Hard boiled
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Fully set yolk for salads, meal prep, and snacks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Egg Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How long for soft, medium, and hard boiled eggs?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Common starting points are about <strong>6 minutes</strong> for
              soft,
              <strong> 8 minutes</strong> for medium, and{" "}
              <strong>10 minutes</strong> for hard boiled eggs, counted once the
              water is gently boiling or simmering. Adjust for egg size and
              starting temperature.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Do I start timing in cold water or boiling water?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many timing guides assume you start timing once the water is
              gently boiling or simmering. Starting from cold water usually
              increases the time and can be less consistent.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why use an ice bath after boiling?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              An ice bath stops cooking quickly, making timing more accurate and
              helping prevent overcooked yolks.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>F</strong> fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
