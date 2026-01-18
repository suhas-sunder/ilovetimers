// app/routes/stopwatch.tsx
import type { Route } from "./+types/stopwatch";
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
    "Stopwatch | Free Online Stopwatch with Laps (Millisecond Stopwatch) + Fullscreen";
  const description =
    "Free online stopwatch with laps and millisecond precision. Fullscreen display, keyboard shortcuts, and one-click copy for lap splits and totals. Great for workouts, speedcubing, labs, and timing practice.";
  const url = "https://ilovetimers.com/stopwatch";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "online stopwatch",
        "stopwatch with laps",
        "millisecond stopwatch",
        "lap timer",
        "split timer",
        "fullscreen stopwatch",
        "stopwatch timer",
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
const pad3 = (n: number) => n.toString().padStart(3, "0");

function msToClockMs(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(t / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const msPart = t % 1000;

  // Keep it readable but still “millisecond stopwatch”
  // h:mm:ss.mmm OR m:ss.mmm
  return h > 0
    ? `${h}:${pad2(m)}:${pad2(s)}.${pad3(msPart)}`
    : `${m}:${pad2(s)}.${pad3(msPart)}`;
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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* =========================================================
   UI PRIMITIVES (same style as Home)
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
   STOPWATCH (page version)
   Includes:
   - laps table
   - keyboard shortcuts
   - fullscreen
   - copy laps
========================================================= */
function StopwatchCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTimeRef.current = null;
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = performance.now() - elapsed;
    }

    const tick = () => {
      const now = performance.now();
      setElapsed(now - (startTimeRef.current ?? now));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, elapsed]);

  const lapTotals = useMemo(() => {
    const totals: number[] = [];
    let sum = 0;
    for (const l of laps) {
      sum += l;
      totals.push(sum);
    }
    return totals;
  }, [laps]);

  function reset() {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    startTimeRef.current = null;
    setCopied("idle");
  }

  function startPause() {
    setCopied("idle");
    setRunning((r) => !r);
  }

  function lap() {
    setCopied("idle");
    if (!running && elapsed === 0) return;

    setLaps((xs) => {
      const prevTotal = xs.reduce((a, b) => a + b, 0);
      return [...xs, elapsed - prevTotal];
    });
  }

  const copyText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Lap,Lap Time,Total Time");
    for (let i = 0; i < laps.length; i++) {
      const lapMs = laps[i] ?? 0;
      const totalMs = lapTotals[i] ?? 0;
      lines.push(`${i + 1},${msToClockMs(lapMs)},${msToClockMs(totalMs)}`);
    }
    return lines.join("\n");
  }, [laps, lapTotals]);

  async function copyLaps() {
    if (laps.length === 0) return;
    const ok = await copyToClipboard(copyText);
    setCopied(ok ? "ok" : "fail");
    window.setTimeout(() => setCopied("idle"), 1200);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "l") {
      lap();
    } else if (e.key.toLowerCase() === "c") {
      copyLaps();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  };

  const statusBadge = running ? "RUNNING" : "PAUSED";
  const latestLapIdx = laps.length - 1;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-amber-950">Stopwatch</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-extrabold tracking-wide ${
                running
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {statusBadge}
            </span>
          </div>
          <p className="mt-1 text-base text-slate-700">
            Millisecond display, lap splits, running totals, fullscreen, and
            one-click copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Btn
            kind="ghost"
            onClick={() =>
              displayRef.current && toggleFullscreen(displayRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayRef}
        className={`mt-6 flex items-center justify-center rounded-2xl border-2 p-6 font-mono font-extrabold tracking-widest ${
          running
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 220 }}
        aria-live="polite"
      >
        <span className="text-6xl sm:text-7xl md:text-8xl">
          {msToClockMs(elapsed)}
        </span>
      </div>

      {/* Controls + shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
          <Btn kind="ghost" onClick={lap}>
            Lap
          </Btn>
          <Btn kind="ghost" onClick={copyLaps} disabled={laps.length === 0}>
            Copy laps
          </Btn>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · L lap · C copy · F fullscreen
        </div>
      </div>

      {copied !== "idle" && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${
            copied === "ok"
              ? "bg-emerald-100 text-emerald-900"
              : "bg-rose-100 text-rose-900"
          }`}
        >
          {copied === "ok" ? "Copied to clipboard." : "Could not copy."}
        </div>
      )}

      {/* Laps table */}
      {laps.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-amber-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-amber-50">
              <tr className="text-amber-950">
                <th className="px-4 py-3 text-left font-extrabold">#</th>
                <th className="px-4 py-3 text-left font-extrabold">Lap</th>
                <th className="px-4 py-3 text-left font-extrabold">Total</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((l, i) => {
                const total = lapTotals[i] ?? 0;
                const isLatest = i === latestLapIdx;
                return (
                  <tr
                    key={i}
                    className={`border-t ${
                      isLatest
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-amber-200"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {msToClockMs(l)}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {msToClockMs(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t border-amber-200 px-4 py-3 text-sm text-slate-700">
            Copy format: <span className="font-semibold">CSV</span> (Lap, Lap
            Time, Total Time).
          </div>
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function StopwatchPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/stopwatch";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Stopwatch",
        url,
        description:
          "Free online stopwatch with laps and millisecond precision. Fullscreen display, keyboard shortcuts, and one-click copy for lap splits and totals.",
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
          { "@type": "ListItem", position: 2, name: "Stopwatch", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is this an accurate online stopwatch?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It tracks elapsed time using absolute timestamps to avoid drift and stays accurate even if the browser briefly slows down.",
            },
          },
          {
            "@type": "Question",
            name: "Does this stopwatch support laps?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Press Lap (or L) to record lap splits and totals in a table.",
            },
          },
          {
            "@type": "Question",
            name: "Can I copy lap times?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Copy laps (or press C) to copy lap data as CSV for spreadsheets.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Fullscreen or press F while the stopwatch card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, L records a lap, C copies laps, and F toggles fullscreen (when focused).",
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
            / <span className="text-amber-950">Stopwatch</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Stopwatch
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Free <strong>online stopwatch</strong> with laps and{" "}
            <strong>millisecond precision</strong>. Fullscreen, keyboard
            shortcuts, and one-click copy for lap splits.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <StopwatchCard />
        </div>

        {/* Quick-use hints: below, responsive */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Best uses</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use a stopwatch when you want <strong>elapsed time</strong>{" "}
              instead of a deadline. Great for training splits, labs,
              speedcubing, drills, and timing practice.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Laps & splits</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Hit <strong>Lap</strong> to record each split. The table shows lap
              time and running total so you can compare consistency across
              rounds.
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
                <strong>L</strong> = Lap
              </li>
              <li>
                <strong>C</strong> = Copy laps
              </li>
              <li>
                <strong>F</strong> = Fullscreen
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Menu Links (shared) */}
      <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section (under TimerMenuLinks) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Online stopwatch with laps (millisecond stopwatch)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>online stopwatch</strong> is designed for fast,
              accurate timing. Press <strong>Start</strong> to begin, then
              record <strong>laps</strong> to capture splits. The display shows
              <strong> millisecond precision</strong> so you can time drills and
              repeats without rounding guesswork.
            </p>

            <p>
              For training and experiments, the lap table helps you compare
              consistency. Each row includes the <strong>lap time</strong> and
              the <strong>total elapsed time</strong>. Use{" "}
              <strong>Copy laps</strong> to paste the results into notes or
              spreadsheets.
            </p>

            <p>
              For visibility on shared screens, use{" "}
              <strong>fullscreen stopwatch</strong> mode. Click the card once to
              focus it, then use keyboard shortcuts: <strong>Space</strong> to
              start/pause, <strong>R</strong> to reset, <strong>L</strong> for
              lap,
              <strong> C</strong> to copy, and <strong>F</strong> for
              fullscreen.
            </p>

            <p>
              If you need a fixed deadline instead of elapsed time, use the{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For focus cycles, use{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>
              , and for intervals use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Training splits
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Time sprints, circuits, and repeats with laps to track
                performance across rounds.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Labs & experiments
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Record multiple trials using laps, then copy results as CSV for
                analysis.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Speedcubing & drills
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Use a clean, fast stopwatch to track solve times and split
                consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Stopwatch FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this stopwatch accurate?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It uses absolute timestamps to minimize drift and remains
              accurate even if the browser momentarily slows down.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do laps work?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Press <strong>Lap</strong> (or <strong>L</strong>) to store a
              split. The table shows lap time and total time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I copy lap times?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Copy laps</strong> (or press <strong>C</strong>) to
              copy lap data as CSV for spreadsheets.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click Fullscreen or press <strong>F</strong> while the card
              is focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>L</strong> lap • <strong>C</strong> copy •{" "}
              <strong>F</strong> fullscreen.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
