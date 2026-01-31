// app/routes/emom-timer.tsx
import type { Route } from "./+types/emom-timer";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "EMOM Timer | Fullscreen Every Minute On the Minute Timer";
  const description =
    "Free EMOM timer for Every Minute On the Minute workouts. Set rounds and total time, add an optional prep countdown, enable sound cues, and track rounds clearly in fullscreen.";
  const url = "https://ilovetimers.com/emom-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "emom timer",
        "every minute on the minute timer",
        "emom workout timer",
        "crossfit emom timer",
        "emom rounds timer",
        "emom online timer",
      ].join(", "),
    },
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

/* =========================================================
   EMOM TIMER CARD
========================================================= */
type Phase = "idle" | "prep" | "emom" | "done";

function EmomTimerCard() {
  const beep = useBeep();

  const presetsRounds = useMemo(() => [6, 8, 10, 12, 15, 20, 30], []);
  const [rounds, setRounds] = useState(12);

  const prepPresets = useMemo(() => [0, 5, 10, 15, 20], []);
  const [prepSeconds, setPrepSeconds] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");

  // display
  const [remainingInMinute, setRemainingInMinute] = useState(60_000);
  const [minuteIndex, setMinuteIndex] = useState(0); // 0-based (0..rounds-1)

  const rafRef = useRef<number | null>(null);
  const startPerfRef = useRef<number | null>(null);

  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const lastMinuteMarkRef = useRef<number | null>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function reset() {
    stopRaf();
    startPerfRef.current = null;
    setPhase("idle");
    setMinuteIndex(0);
    setRemainingInMinute(60_000);
    lastBeepSecondRef.current = null;
    lastMinuteMarkRef.current = null;
  }

  function start() {
    stopRaf();
    setMinuteIndex(0);
    lastBeepSecondRef.current = null;
    lastMinuteMarkRef.current = null;

    // Start at prep if > 0, else go straight into EMOM.
    startPerfRef.current = performance.now();
    setPhase(prepSeconds > 0 ? "prep" : "emom");
  }

  useEffect(() => {
    if (phase === "idle" || phase === "done") {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const start = startPerfRef.current ?? now;
      const elapsed = now - start;

      if (phase === "prep") {
        const rem = Math.max(0, prepSeconds * 1000 - elapsed);
        setRemainingInMinute(rem);

        if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
          const secLeft = Math.ceil(rem / 1000);
          if (lastBeepSecondRef.current !== secLeft) {
            lastBeepSecondRef.current = secLeft;
            beep(880, 90, 0.08);
          }
        }

        if (rem <= 0) {
          // transition to emom
          if (sound) beep(660, 160, 0.1);
          startPerfRef.current = performance.now();
          setPhase("emom");
          setRemainingInMinute(60_000);
          setMinuteIndex(0);
          lastBeepSecondRef.current = null;
          lastMinuteMarkRef.current = null;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // EMOM phase
      // elapsed in EMOM
      const emomElapsed = elapsed;
      const totalEmomMs = rounds * 60_000;

      if (emomElapsed >= totalEmomMs) {
        setPhase("done");
        stopRaf();
        setMinuteIndex(rounds);
        setRemainingInMinute(0);
        if (sound) {
          // finishing chime
          beep(660, 160, 0.1);
          window.setTimeout(() => beep(880, 160, 0.1), 220);
        }
        return;
      }

      const currentMinute = Math.floor(emomElapsed / 60_000); // 0..rounds-1
      const intoMinute = emomElapsed % 60_000;
      const remInMinute = Math.max(0, 60_000 - intoMinute);

      setMinuteIndex(currentMinute);
      setRemainingInMinute(remInMinute);

      // Minute boundary cue: when currentMinute changes, beep once.
      if (sound) {
        if (lastMinuteMarkRef.current !== currentMinute) {
          lastMinuteMarkRef.current = currentMinute;
          beep(520, 140, 0.1);
        }
      }

      // Final 5 seconds cue inside each minute (optional)
      if (sound && finalBeeps && remInMinute > 0 && remInMinute <= 5_000) {
        const secLeft = Math.ceil(remInMinute / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 80, 0.06);
        }
      } else {
        // reset so the beeps are correct at the end of next minute
        if (remInMinute > 5_000) lastBeepSecondRef.current = null;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [phase, rounds, prepSeconds, sound, finalBeeps, beep]);

  const isRunning = phase === "prep" || phase === "emom";
  const shownTime =
    phase === "emom"
      ? msToClock(Math.ceil(remainingInMinute / 1000) * 1000)
      : msToClock(Math.ceil(remainingInMinute / 1000) * 1000);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      if (phase === "idle" || phase === "done") start();
      else reset(); // simple: space toggles start/reset for EMOM
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (e.key.toLowerCase() === "s") {
      setSound((x) => !x);
    }
  };

  const label =
    phase === "prep"
      ? "Get ready"
      : phase === "emom"
        ? `Minute ${minuteIndex + 1} of ${rounds}`
        : phase === "done"
          ? "Complete"
          : "Ready";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">EMOM Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            Every Minute On the Minute: you start a new round at the top of each
            minute. Great for CrossFit-style conditioning and pacing.
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
            Total minutes (rounds)
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {presetsRounds.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setRounds(m)}
                disabled={isRunning}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:opacity-60 ${
                  m === rounds
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-white text-amber-950 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-amber-950">
              Rounds
              <input
                type="number"
                min={1}
                max={120}
                value={rounds}
                disabled={isRunning}
                onChange={(e) =>
                  setRounds(clamp(Number(e.target.value || 1), 1, 120))
                }
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </label>

            <div className="text-xs text-slate-600 sm:pt-6">
              One round starts every minute. Finish your work, then rest until
              the next minute.
            </div>
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
                disabled={isRunning}
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
              disabled={isRunning}
              onChange={(e) =>
                setPrepSeconds(clamp(Number(e.target.value || 0), 0, 60))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Btn onClick={start} disabled={isRunning}>
          Start
        </Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
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
                gap:18px;
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
              {label}
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {phase === "done" ? "0:00" : shownTime}
            </div>

            {phase === "emom" ? (
              <div className="mt-3 grid w-full gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Round
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-amber-950">
                    {minuteIndex + 1} / {rounds}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Work window
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    Do your reps, then rest until the next minute starts.
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Cue
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    Beep at each minute start (and optional final beeps).
                  </div>
                </div>
              </div>
            ) : phase === "prep" ? (
              <div className="mt-2 text-xs text-slate-600">
                Prep ends, then minute 1 starts immediately.
              </div>
            ) : phase === "done" ? (
              <div className="mt-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-950">
                EMOM complete. Nice work.
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-600">
                Set rounds + prep, then press Start.
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">{label}</div>
            <div className="fs-time">
              {phase === "done" ? "0:00" : shownTime}
            </div>
            <div className="fs-help">
              {phase === "emom"
                ? `Round ${minuteIndex + 1} / ${rounds} · Beep each minute start`
                : `Rounds ${rounds} · Prep ${prepSeconds}s`}
            </div>
            <div className="fs-help">
              Space start/reset · R reset · F fullscreen · S sound
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/reset · R reset · F fullscreen · S sound
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
export default function EmomTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/emom-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "EMOM Timer",
        url,
        description:
          "EMOM timer (Every Minute On the Minute) with rounds, optional prep countdown, sound cues, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "EMOM Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is an EMOM timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "EMOM stands for Every Minute On the Minute. A new round starts at the top of each minute. You do your work, then rest until the next minute begins.",
            },
          },
          {
            "@type": "Question",
            name: "How many rounds should I set?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Common EMOMs are 8, 10, 12, 15, or 20 minutes depending on the workout and intensity.",
            },
          },
          {
            "@type": "Question",
            name: "Does the timer beep at each minute?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It beeps at each minute start so you know exactly when a new round begins. You can also enable optional final beeps in the last 5 seconds of each minute.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use it on a phone or gym screen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use fullscreen for a clean high-contrast display on a phone, tablet, TV, or projector.",
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
            / <span className="text-amber-950">EMOM Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            EMOM Timer (Every Minute On the Minute)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>EMOM timer</strong> with minute-by-minute round
            tracking, optional prep countdown, sound cues, and fullscreen mode.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <EmomTimerCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free EMOM timer for CrossFit-style workouts
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              An <strong>EMOM timer</strong> (Every Minute On the Minute) starts
              a new round at the top of each minute. You complete your reps as
              fast as you can, then use the remaining time to rest before the
              next minute begins.
            </p>

            <p>
              Set the total number of minutes (rounds), add a short prep
              countdown if needed, and use fullscreen for a clean gym-friendly
              display. If you want interval blocks with separate work/rest
              phases, use{" "}
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
        <h2 className="text-2xl font-bold">EMOM Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What does EMOM mean?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              EMOM means Every Minute On the Minute. A new round starts exactly
              when each minute begins.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it beep at each minute start?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It beeps at the start of each minute. You can also enable
              optional beeps in the final 5 seconds of each minute.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What’s a good EMOM length?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Common EMOMs are 8–20 minutes depending on intensity. Longer EMOMs
              (20–30) are often used at lower intensity.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use fullscreen on a phone or TV?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Fullscreen is designed for high contrast and readability in a
              gym setting.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
