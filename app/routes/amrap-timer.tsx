// app/routes/amrap-timer.tsx
import type { Route } from "./+types/amrap-timer";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import RelatedSites from "~/clients/components/navigation/RelatedSites";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "AMRAP Timer | CrossFit AMRAP Countdown + Rep Counter (Fullscreen, Simple)";
  const description =
    "Free AMRAP timer (As Many Rounds/Reps As Possible). Set minutes, run a clean fullscreen countdown, and track reps/rounds with big tap buttons and keyboard shortcuts.";
  const url = "https://ilovetimers.com/amrap-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "amrap timer",
        "crossfit amrap timer",
        "amrap countdown",
        "amrap rep counter",
        "amrap rounds timer",
        "as many reps as possible timer",
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

/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (freq = 880, duration = 120, gain = 0.1) => {
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
      g.gain.value = gain;

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
  };
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

const BigTap = ({
  label,
  value,
  onPlus,
  onMinus,
  disabled,
}: {
  label: string;
  value: number;
  onPlus: () => void;
  onMinus: () => void;
  disabled?: boolean;
}) => (
  <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
    <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
      {label}
    </div>
    <div className="mt-2 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onMinus}
        disabled={disabled}
        className="h-12 w-12 rounded-xl border border-amber-200 bg-amber-50 text-xl font-extrabold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>

      <div className="min-w-0 text-center">
        <div className="text-4xl font-extrabold text-amber-950">{value}</div>
        <div className="text-xs text-slate-600">Tap + / −</div>
      </div>

      <button
        type="button"
        onClick={onPlus}
        disabled={disabled}
        className="h-12 w-12 rounded-xl bg-amber-700 text-xl font-extrabold text-white hover:bg-amber-800 disabled:opacity-60"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  </div>
);

/* =========================================================
   AMRAP TIMER CARD
========================================================= */
function AmrapTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [4, 6, 8, 10, 12, 15, 20, 25, 30], []);
  const [minutes, setMinutes] = useState(12);

  const prepPresets = useMemo(() => [0, 5, 10, 15, 20], []);
  const [prepSeconds, setPrepSeconds] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [inPrep, setInPrep] = useState(false);

  const [reps, setReps] = useState(0);
  const [rounds, setRounds] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    setInPrep(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [minutes]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function resetTimerOnly() {
    setRunning(false);
    setInPrep(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }

  function resetAll() {
    resetTimerOnly();
    setReps(0);
    setRounds(0);
  }

  function start() {
    resetTimerOnly();
    if (prepSeconds > 0) {
      setInPrep(true);
      setRunning(true);
      setRemaining(prepSeconds * 1000);
      endRef.current = performance.now() + prepSeconds * 1000;
    } else {
      setInPrep(false);
      setRunning(true);
      setRemaining(minutes * 60 * 1000);
      endRef.current = performance.now() + minutes * 60 * 1000;
    }
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      const beepWindow = inPrep ? rem : rem;
      if (sound && finalBeeps && beepWindow > 0 && beepWindow <= 5_000) {
        const secLeft = Math.ceil(beepWindow / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 90, 0.07);
        }
      }

      if (rem <= 0) {
        if (inPrep) {
          // transition to main AMRAP
          if (sound) beep(660, 160, 0.1);
          setInPrep(false);
          setRemaining(minutes * 60 * 1000);
          endRef.current = performance.now() + minutes * 60 * 1000;
          lastBeepSecondRef.current = null;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // finished
        setRunning(false);
        endRef.current = null;
        lastBeepSecondRef.current = null;
        if (sound) {
          beep(660, 160, 0.1);
          window.setTimeout(() => beep(880, 160, 0.1), 220);
        }
        stopRaf();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, inPrep, minutes, sound, finalBeeps, beep]);

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const urgent = running && !inPrep && remaining > 0 && remaining <= 10_000;

  const statusLabel = !running
    ? "Ready"
    : inPrep
      ? "Get ready"
      : "AMRAP running";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      if (!running) start();
      else resetTimerOnly(); // keep simple: space start/reset
    } else if (k === "r") {
      resetAll();
    } else if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "+") {
      setReps((x) => x + 1);
    } else if (k === "-") {
      setReps((x) => Math.max(0, x - 1));
    } else if (k === "arrowup") {
      setRounds((x) => x + 1);
    } else if (k === "arrowdown") {
      setRounds((x) => Math.max(0, x - 1));
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">AMRAP Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            AMRAP = As Many Rounds/Reps As Possible. Run a countdown and track
            your score with big tap buttons.
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
              checked={finalBeeps}
              onChange={(e) => setFinalBeeps(e.target.checked)}
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

      {/* Settings */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-extrabold text-amber-950">
            AMRAP length (minutes)
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {presetsMin.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                disabled={running}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:opacity-60 ${
                  m === minutes
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-white text-amber-950 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Minutes
            <input
              type="number"
              min={1}
              max={180}
              value={minutes}
              disabled={running}
              onChange={(e) =>
                setMinutes(clamp(Number(e.target.value || 1), 1, 180))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>

          <div className="mt-2 text-xs text-slate-600">
            Common AMRAPs: 8, 10, 12, 15, 20 minutes.
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-extrabold text-amber-950">
            Prep countdown (optional)
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {prepPresets.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrepSeconds(s)}
                disabled={running}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:opacity-60 ${
                  s === prepSeconds
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-white text-amber-950 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                {s === 0 ? "None" : `${s}s`}
              </button>
            ))}
          </div>

          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Prep seconds
            <input
              type="number"
              min={0}
              max={60}
              value={prepSeconds}
              disabled={running}
              onChange={(e) =>
                setPrepSeconds(clamp(Number(e.target.value || 0), 0, 60))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
        </div>
      </div>

      {/* Score controls */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BigTap
          label="Reps"
          value={reps}
          onPlus={() => setReps((x) => x + 1)}
          onMinus={() => setReps((x) => Math.max(0, x - 1))}
        />
        <BigTap
          label="Rounds"
          value={rounds}
          onPlus={() => setRounds((x) => x + 1)}
          onMinus={() => setRounds((x) => Math.max(0, x - 1))}
        />
      </div>

      <div className="mt-3 text-xs text-slate-600">
        Keyboard: + / − reps · ↑ / ↓ rounds · Space start/reset · R reset all ·
        F fullscreen · S sound
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Btn onClick={start} disabled={running}>
          Start
        </Btn>
        <Btn kind="ghost" onClick={resetTimerOnly}>
          Reset timer
        </Btn>
        <Btn kind="ghost" onClick={resetAll}>
          Reset all
        </Btn>
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
        style={{ minHeight: 280 }}
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
                gap:14px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.85;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(96px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-score{
                font: 800 clamp(18px, 3vw, 28px)/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.75;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 280 }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-2">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {statusLabel}
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {running ? shownTime : msToClock(minutes * 60 * 1000)}
            </div>

            <div className="mt-3 grid w-full gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Score
                </div>
                <div className="mt-1 text-2xl font-extrabold text-amber-950">
                  {rounds} rounds + {reps} reps
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Tip
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  Track total reps or rounds. Use + and ↑ on a keyboard for fast
                  updates.
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-600">
              Runs while the page is open. Background tabs may update less
              often.
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">AMRAP</div>
            <div className="fs-time">
              {running ? shownTime : msToClock(minutes * 60 * 1000)}
            </div>
            <div className="fs-score">
              {rounds} rounds + {reps} reps
            </div>
            <div className="fs-help">
              + / − reps · ↑ / ↓ rounds · Space start/reset · R reset all · F
              fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/reset · R reset all · F fullscreen · S sound ·
          +/− reps · ↑/↓ rounds
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
export default function AmrapTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/amrap-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "AMRAP Timer",
        url,
        description:
          "AMRAP timer (As Many Rounds/Reps As Possible) with countdown, optional prep, rep/round counter, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "AMRAP Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is an AMRAP timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "AMRAP means As Many Rounds/Reps As Possible. You set a time limit, start the countdown, and try to complete as much work as possible before time runs out.",
            },
          },
          {
            "@type": "Question",
            name: "Does this track reps or rounds?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the big +/− buttons to track reps and rounds. It’s designed for quick tapping during workouts.",
            },
          },
          {
            "@type": "Question",
            name: "What are common AMRAP lengths?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Common AMRAPs are 8, 10, 12, 15, and 20 minutes depending on intensity and workout design.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use fullscreen in a gym?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Fullscreen mode is high contrast with large digits for gym visibility.",
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
            / <span className="text-amber-950">AMRAP Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            AMRAP Timer (Countdown + Rep Counter)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A gym-friendly <strong>AMRAP timer</strong> with a clean countdown,
            optional prep, and fast rep/round tracking.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <AmrapTimerCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free CrossFit AMRAP timer with rep counting
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              An <strong>AMRAP timer</strong> (As Many Rounds/Reps As Possible)
              is a countdown used to cap a workout. Your goal is to complete as
              much work as you can before time runs out.
            </p>

            <p>
              This page combines a clean countdown with a big, easy{" "}
              <strong>rep/round counter</strong> so you can track your score
              without fiddly UI. For minute-based start cues, try{" "}
              <Link to="/emom-timer" className="font-semibold hover:underline">
                EMOM Timer
              </Link>
              . For structured work/rest intervals, use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT Timer
              </Link>{" "}
              or{" "}
              <Link
                to="/tabata-timer"
                className="font-semibold hover:underline"
              >
                Tabata Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">AMRAP Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What does AMRAP stand for?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              AMRAP stands for As Many Rounds (or Reps) As Possible within a set
              time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this count reps automatically?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. You tap +/− to track reps and rounds. That’s intentional so it
              works for any workout.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are common AMRAP times?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Common AMRAPs are 8–20 minutes, depending on intensity and
              movement choices.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use fullscreen mode?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Fullscreen is designed for gym visibility with large digits
              and high contrast.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
