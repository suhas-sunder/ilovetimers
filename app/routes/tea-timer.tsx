// app/routes/tea-timer.tsx
import type { Route } from "./+types/tea-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Tea Timer with Steep Times";
  const description =
    "Brew better tea with a simple tea timer. One-click steep times for green, black, oolong, white, and herbal teas with a clear countdown.";

  const url = "https://ilovetimers.com/tea-timer";

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
   TEA TIMER CARD
========================================================= */
type TeaKey =
  | "green"
  | "black"
  | "oolong"
  | "white"
  | "herbal"
  | "chai"
  | "matcha"
  | "rooibos"
  | "pu_erh";

type TeaPreset = {
  key: TeaKey;
  label: string;
  minutes: number;
  seconds: number;
  note: string;
};

const TEA_PRESETS: TeaPreset[] = [
  {
    key: "green",
    label: "Green tea",
    minutes: 2,
    seconds: 0,
    note: "2:00 (lighter, avoid bitterness)",
  },
  {
    key: "black",
    label: "Black tea",
    minutes: 4,
    seconds: 0,
    note: "4:00 (stronger, classic mug)",
  },
  {
    key: "oolong",
    label: "Oolong",
    minutes: 3,
    seconds: 0,
    note: "3:00 (balanced)",
  },
  {
    key: "white",
    label: "White tea",
    minutes: 3,
    seconds: 0,
    note: "3:00 (gentle)",
  },
  {
    key: "herbal",
    label: "Herbal",
    minutes: 5,
    seconds: 0,
    note: "5:00 (bigger leaves, longer steep)",
  },
  {
    key: "chai",
    label: "Chai",
    minutes: 5,
    seconds: 0,
    note: "5:00 (spiced, bold)",
  },
  {
    key: "rooibos",
    label: "Rooibos",
    minutes: 5,
    seconds: 0,
    note: "5:00 (caffeine-free, forgiving)",
  },
  {
    key: "pu_erh",
    label: "Pu-erh",
    minutes: 4,
    seconds: 0,
    note: "4:00 (earthy)",
  },
  {
    key: "matcha",
    label: "Matcha",
    minutes: 0,
    seconds: 0,
    note: "No steep: whisk and sip",
  },
];

function TeaTimerCard() {
  const beep = useBeep();

  const [preset, setPreset] = useState<TeaKey>("green");
  const [minutes, setMinutes] = useState(2);
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
    const p = TEA_PRESETS.find((x) => x.key === preset);
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
    const p = TEA_PRESETS.find((x) => x.key === preset);
    return p?.note ?? "";
  }, [preset]);

  const isMatcha = preset === "matcha";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Tea Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            A simple <strong>tea timer</strong> with pre-filled steep times for{" "}
            <strong>green tea</strong> and other common teas. Big digits,
            optional sound, and fullscreen.
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
        {TEA_PRESETS.map((p) => (
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
            disabled={isMatcha}
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
            disabled={isMatcha}
          />
        </label>

        <div className="flex items-end gap-3">
          <Btn
            onClick={startPause}
            disabled={isMatcha || minutes * 60 + seconds <= 0}
          >
            {running ? "Pause" : "Start"}
          </Btn>
          <Btn kind="ghost" onClick={reset} disabled={isMatcha}>
            Reset
          </Btn>
        </div>
      </div>

      {/* Preset note */}
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
          Preset note
        </div>
        <div className="mt-1 text-sm font-semibold text-amber-950">
          {isMatcha ? "Matcha is usually whisked, not steeped." : presetNote}
        </div>
        <div className="mt-2 text-sm text-amber-900">
          Adjust based on leaf size, water temperature, and taste. These are
          quick defaults, not strict rules.
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
              {TEA_PRESETS.find((x) => x.key === preset)?.label ?? "Tea"}{" "}
              {isMatcha ? "(no steep)" : "steep time"}
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
            <div className="fs-label">Tea Timer</div>
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
export default function TeaTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/tea-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tea Timer",
        url,
        description:
          "A tea steep timer with pre-filled steep times for green tea, black tea, oolong, herbal tea, and more, plus fullscreen and optional sound.",
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
            name: "Tea Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a tea timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A tea timer is a simple countdown that helps you steep tea for a chosen amount of time. Pick a tea type or set a custom time, start the timer, and stop steeping when it hits zero.",
            },
          },
          {
            "@type": "Question",
            name: "What is a green tea timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A green tea timer is a tea timer with shorter default steep times. Green tea can turn bitter when steeped too long, so presets like 2 to 3 minutes are common starting points.",
            },
          },
          {
            "@type": "Question",
            name: "Are the steep times exact?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Presets are quick defaults. The best steep time depends on the tea, water temperature, leaf size, and taste preferences.",
            },
          },
          {
            "@type": "Question",
            name: "Does this steep timer work in fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Press Fullscreen (or F) while the timer card is focused for a dark, high-contrast display with very large digits.",
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
            / <span className="text-amber-950">Tea Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Tea Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>tea timer</strong> with pre-filled steep times.
            Great for <strong>green tea</strong>, black tea, oolong, herbal tea,
            and more.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <TeaTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Pre-filled steep times
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Pick a tea type and start immediately. Presets are designed as
              practical defaults, and you can tweak the time.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Green tea timer (quick by default)
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Green tea usually steeps shorter than black tea. Use the preset as
              a baseline, then adjust based on taste.
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

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free steep timer for tea (including green tea)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>tea timer</strong> is a fast{" "}
              <strong>steep timer</strong> for everyday brewing. Choose a tea
              type to load a common steep time, then press Start. You can also
              set a custom time if your tea or cup size needs it.
            </p>

            <p>
              Use the <strong>green tea timer</strong> preset for a quick
              baseline and adjust to avoid bitterness. Herbal blends and larger
              leaves often benefit from a longer steep.
            </p>

            <p>
              If you want a general tool, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For cooking, you might also like{" "}
              <Link to="/egg-timer" className="font-semibold hover:underline">
                Egg Timer
              </Link>{" "}
              or{" "}
              <Link to="/pasta-timer" className="font-semibold hover:underline">
                Pasta Timer
              </Link>{" "}
              if you add those pages later.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Tea timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                One-click steep presets, big countdown, and fast reset.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Green tea timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Shorter defaults so you can avoid over-steeping and bitterness.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Steep timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Clean fullscreen view with optional sound and final beeps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Tea Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a steep timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A steep timer is a countdown timer used for tea. It helps you stop
              steeping at the right time so the flavor stays consistent.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What steep time should I use for green tea?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many green teas are steeped around 2 to 3 minutes. This page
              includes a green tea preset you can adjust based on taste and
              water temperature.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I change the steep time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use the preset buttons to start quickly, then adjust minutes
              and seconds for your preference.
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
