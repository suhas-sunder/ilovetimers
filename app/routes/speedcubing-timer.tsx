// app/routes/speedcubing-timer.tsx
import type { Route } from "./+types/speedcubing-timer";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Speedcubing Timer | Cubing Stopwatch + Splits (Fullscreen, Big Digits)";
  const description =
    "Free speedcubing timer with a cubing-style stopwatch and splits (laps). Big fullscreen time, fast keyboard controls, lap list, and a clean layout designed for practice sessions.";
  const url = "https://ilovetimers.com/speedcubing-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "speedcubing timer",
        "cubing stopwatch",
        "cube timer",
        "rubiks cube timer",
        "splits timer",
        "laps timer",
        "stopwatch with splits",
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

function msToStopwatch(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((t % 1000) / 10); // centiseconds
  // Show mm:ss.cc (cubing-friendly)
  return `${m}:${pad2(sec)}.${pad2(cs)}`;
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
   SPEEDCUBING TIMER CARD (STOPWATCH + SPLITS)
========================================================= */
type Lap = { n: number; ms: number; atMs: number };

function SpeedcubingTimerCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [laps, setLaps] = useState<Lap[]>([]);
  const [maxLaps, setMaxLaps] = useState(50);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseElapsedRef = useRef<number>(0);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  // When running, drive display with rAF
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      baseElapsedRef.current = elapsed;
      return;
    }

    if (!startRef.current) {
      startRef.current = performance.now();
    }

    const tick = () => {
      const now = performance.now();
      const delta = now - (startRef.current ?? now);
      setElapsed(baseElapsedRef.current + delta);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, elapsed]);

  function startPause() {
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    baseElapsedRef.current = 0;
    startRef.current = null;
    setLaps([]);
  }

  function lap() {
    if (!running) return;
    setLaps((prev) => {
      if (prev.length >= maxLaps) return prev;
      const lastAt = prev[0]?.atMs ?? 0; // most recent first
      const split = Math.max(0, elapsed - lastAt);
      const next: Lap = { n: prev.length + 1, ms: split, atMs: elapsed };
      return [next, ...prev];
    });
  }

  function removeLap(idx: number) {
    setLaps((prev) => prev.filter((_, i) => i !== idx));
  }

  const best = useMemo(() => {
    if (!laps.length) return null;
    return Math.min(...laps.map((l) => l.ms));
  }, [laps]);

  const worst = useMemo(() => {
    if (!laps.length) return null;
    return Math.max(...laps.map((l) => l.ms));
  }, [laps]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "l") {
      lap();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    }
  };

  const timeText = msToStopwatch(elapsed);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Speedcubing Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A cubing-friendly <strong>stopwatch</strong> with{" "}
            <strong>splits</strong> (laps). Big digits, fullscreen, and a lap
            list placed where you can glance quickly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
        <Btn kind="ghost" onClick={lap} disabled={!running}>
          Split
        </Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>

        <label className="ml-auto inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          Max splits
          <input
            type="number"
            min={5}
            max={200}
            value={maxLaps}
            onChange={(e) =>
              setMaxLaps(clamp(Number(e.target.value || 50), 5, 200))
            }
            className="w-20 rounded-md border border-amber-300 bg-white px-2 py-1 text-amber-950"
          />
        </label>
      </div>

      {/* Display + Splits positioning */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Time display (left, dominant) */}
        <div
          ref={displayWrapRef}
          data-fs-container
          className="overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
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
                  width:min(1500px, 100%);
                  display:flex;
                  align-items:center;
                  justify-content:center;
                }

                [data-fs-container]:fullscreen .fs-time{
                  font: 900 clamp(96px, 18vw, 260px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                  letter-spacing:.06em;
                  text-align:center;
                }

                [data-fs-container]:fullscreen .fs-help{
                  position:fixed;
                  left:0;
                  right:0;
                  bottom:22px;
                  text-align:center;
                  font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                  opacity:.85;
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
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Cubing Stopwatch
              </div>
              <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
                <span className="text-6xl sm:text-7xl md:text-8xl">
                  {timeText}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                Space start/pause · L split · R reset · F fullscreen
              </div>
            </div>
          </div>

          {/* Fullscreen shell */}
          <div data-shell="fullscreen">
            <div className="fs-inner">
              <div className="fs-time">{timeText}</div>
            </div>
            <div className="fs-help">
              Space start/pause · L split · R reset · F fullscreen
            </div>
          </div>
        </div>

        {/* Splits list (right, glanceable) */}
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-amber-950">Splits</h3>
            <div className="text-xs text-slate-600">
              {laps.length ? `${laps.length} recorded` : "No splits yet"}
            </div>
          </div>

          {laps.length > 0 ? (
            <div className="mt-3 grid gap-2">
              <div className="grid grid-cols-[70px_1fr_90px] gap-2 text-xs font-semibold text-slate-600">
                <div>#</div>
                <div>Split</div>
                <div className="text-right">Total</div>
              </div>

              <div className="max-h-[280px] overflow-auto rounded-xl border border-amber-200">
                <div className="divide-y divide-amber-100">
                  {laps.map((l, i) => {
                    const isBest = best != null && l.ms === best;
                    const isWorst = worst != null && l.ms === worst;

                    return (
                      <div
                        key={`${l.n}-${l.atMs}`}
                        className={`grid grid-cols-[70px_1fr_90px] items-center gap-2 px-3 py-2 ${
                          i === 0 ? "bg-amber-50" : "bg-white"
                        }`}
                      >
                        <div className="text-sm font-bold text-amber-950">
                          {l.n}
                        </div>

                        <div className="min-w-0">
                          <div className="font-mono text-sm font-extrabold text-slate-900">
                            {msToStopwatch(l.ms)}
                          </div>
                          <div className="text-xs text-slate-600">
                            {isBest
                              ? "Best split"
                              : isWorst
                                ? "Slowest split"
                                : ""}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono text-sm font-semibold text-slate-900">
                            {msToStopwatch(l.atMs)}
                          </div>
                          <button
                            type="button"
                            className="mt-1 text-xs font-semibold text-amber-800 hover:underline"
                            onClick={() => removeLap(i)}
                          >
                            remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-slate-600">
                Tip: your newest split is highlighted at the top.
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Start the stopwatch, then press <strong>L</strong> (or click
              Split) to record a split.
            </div>
          )}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · L split · R reset · F fullscreen
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
export default function SpeedcubingTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/speedcubing-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Speedcubing Timer",
        url,
        description:
          "Speedcubing timer with a cubing stopwatch and splits (laps). Fullscreen display and a glanceable splits list.",
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
            name: "Speedcubing Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a speedcubing timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A speedcubing timer is a stopwatch used to time Rubik’s Cube solves and practice sessions. Many cubers also track splits (laps) to measure repeated solves or phases.",
            },
          },
          {
            "@type": "Question",
            name: "How do I record splits on this cubing stopwatch?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Start the stopwatch, then press L (or click Split) to record a split. The newest split appears at the top and includes both the split time and the total time.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Press F (or click Fullscreen). Fullscreen shows huge digits designed for visibility during practice.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, L records a split, R resets, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">Speedcubing Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Speedcubing Timer (Cubing Stopwatch + Splits)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>speedcubing timer</strong> with a{" "}
            <strong>cubing stopwatch</strong> display and a{" "}
            <strong>splits timer</strong> (laps) list positioned for quick
            glance.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <SpeedcubingTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Cubing-friendly time format
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              The display uses <strong>mm:ss.cc</strong> (centiseconds), which
              is common for cubing practice and makes small improvements easy to
              see.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Splits timer for repeated solves
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Hit Split each solve to build a list. The newest split appears at
              the top with both split time and total time.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen for practice sessions
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen gives huge digits so you can see the time without
              leaning in or squinting.
            </p>
          </div>
        </div>
      </section>


      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free speedcubing timer: cubing stopwatch with splits (laps)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>speedcubing timer</strong> is a simple{" "}
              <strong>cubing stopwatch</strong> designed for practice. Start the
              timer, then record
              <strong> splits</strong> (laps) each solve to track repetition and
              consistency.
            </p>

            <p>
              The splits panel is positioned beside the main time so you can
              glance at recent results without losing focus. New splits appear
              at the top, making it easy to compare your last few solves.
            </p>

            <p>
              If you only need a basic stopwatch, use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              . If you want interval rounds, try{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Speedcubing timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Big display and fast controls for timing cube solves.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Cubing stopwatch
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                mm:ss.cc format makes small improvements visible.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Splits timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Record splits (laps) and see newest results at the top.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Speedcubing Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use this as a cubing stopwatch?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Press Start (or Space) to begin timing. Press Pause (or Space) to
              stop. Use Reset (or R) to clear the time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do splits (laps) work?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              While the timer is running, press <strong>L</strong> (or Split) to
              record a split. The split shows the time since your previous split
              and the total time at that moment.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use fullscreen mode?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Press <strong>F</strong> (or click Fullscreen) to show huge
              digits for practice.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>L</strong> split •{" "}
              <strong>R</strong> reset • <strong>F</strong> fullscreen (when
              focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
