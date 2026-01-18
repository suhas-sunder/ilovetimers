// app/routes/speedrun-timer.tsx
import type { Route } from "./+types/speedrun-timer";
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
    "Speedrun Timer | Split Timer for Speedrunning (Fullscreen, Simple, Visible)";
  const description =
    "Free speedrun timer with splits. Start/pause, record splits, undo last split, and view a clean fullscreen display. Built for speedrunning practice and casual runs without complicated setup.";
  const url = "https://ilovetimers.com/speedrun-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "speedrun timer",
        "split timer",
        "speedrunning timer",
        "splits timer",
        "timer for speedrun",
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

function msToClockWithMs(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const totalMs = t;

  const totalSec = Math.floor(totalMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const hundredths = Math.floor((totalMs % 1000) / 10);
  const base = h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
  return `${base}.${pad2(hundredths)}`;
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
   SPEEDRUN TIMER CARD
========================================================= */
type Split = {
  id: string;
  name: string;
  totalMs: number;
  deltaMs: number;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function SpeedrunTimerCard() {
  const [running, setRunning] = useState(false);
  const [nowTick, setNowTick] = useState(0);

  const [splits, setSplits] = useState<Split[]>([]);
  const [nextSplitName, setNextSplitName] = useState("");

  const startRef = useRef<number | null>(null);
  const elapsedBeforeStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  // tick loop for smooth display
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = () => {
      setNowTick(performance.now());
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running]);

  const elapsedMs = useMemo(() => {
    if (!running || startRef.current === null)
      return elapsedBeforeStartRef.current;
    return elapsedBeforeStartRef.current + (nowTick - startRef.current);
  }, [running, nowTick]);

  function startPause() {
    setRunning((r) => {
      const next = !r;

      if (next) {
        startRef.current = performance.now();
      } else {
        if (startRef.current !== null) {
          elapsedBeforeStartRef.current += performance.now() - startRef.current;
        }
        startRef.current = null;
      }

      return next;
    });
  }

  function reset() {
    setRunning(false);
    startRef.current = null;
    elapsedBeforeStartRef.current = 0;
    setNowTick(0);
    setSplits([]);
    setNextSplitName("");
  }

  function addSplit() {
    const total = Math.max(0, Math.floor(elapsedMs));
    const prevTotal = splits.length ? splits[splits.length - 1].totalMs : 0;
    const delta = total - prevTotal;

    const name = (nextSplitName || `Split ${splits.length + 1}`).trim();

    setSplits((prev) => [
      ...prev,
      { id: uid(), name, totalMs: total, deltaMs: delta },
    ]);

    setNextSplitName("");
  }

  function undoSplit() {
    setSplits((prev) => prev.slice(0, -1));
  }

  function finishRun() {
    // Add final split labeled "Finish" if not already added at the same time.
    const total = Math.max(0, Math.floor(elapsedMs));
    const last = splits[splits.length - 1];
    if (last && Math.abs(last.totalMs - total) < 20) {
      setRunning(false);
      return;
    }
    const prevTotal = splits.length ? splits[splits.length - 1].totalMs : 0;
    const delta = total - prevTotal;
    setSplits((prev) => [
      ...prev,
      { id: uid(), name: "Finish", totalMs: total, deltaMs: delta },
    ]);
    setRunning(false);
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
    } else if (e.key.toLowerCase() === "s") {
      addSplit();
    } else if (e.key.toLowerCase() === "u") {
      undoSplit();
    } else if (e.key.toLowerCase() === "e") {
      finishRun();
    }
  };

  const shownTime = msToClockWithMs(elapsedMs);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Speedrun Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A simple <strong>speedrun timer</strong> with{" "}
            <strong>splits</strong>. Start/pause, hit Split, undo the last
            split, and go fullscreen for a clean run display.
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
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap items-end gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
          <Btn
            kind="ghost"
            onClick={finishRun}
            disabled={!running && elapsedMs <= 0}
          >
            End run
          </Btn>
        </div>

        <div className="flex items-end gap-3">
          <label className="block text-sm font-semibold text-amber-950">
            Next split name (optional)
            <input
              value={nextSplitName}
              onChange={(e) => setNextSplitName(e.target.value)}
              placeholder={`Split ${splits.length + 1}`}
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
        </div>
      </div>

      {/* Split buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn onClick={addSplit} disabled={elapsedMs <= 0}>
          Split
        </Btn>
        <Btn kind="ghost" onClick={undoSplit} disabled={splits.length === 0}>
          Undo split
        </Btn>

        <div className="text-xs font-semibold text-amber-800">
          Shortcuts: Space start/pause · S split · U undo · E end · R reset · F
          fullscreen
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 260 }}
        aria-live="polite"
      >
        {/* Fullscreen CSS */}
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
                gap:16px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(92px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.08em;
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
          className="h-full w-full p-6"
          style={{ minHeight: 260 }}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Time
              </div>
              <div className="mt-2 font-mono text-6xl font-extrabold tracking-widest">
                {shownTime}
              </div>
              <div className="mt-3 text-xs font-semibold text-amber-800">
                Space start/pause · S split · U undo · E end · R reset · F
                fullscreen
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Splits
              </div>

              {splits.length === 0 ? (
                <div className="mt-3 text-sm text-amber-900">
                  Press <strong>S</strong> (or click Split) during a run to
                  record split times.
                </div>
              ) : (
                <div className="mt-3 max-h-60 overflow-auto rounded-xl border border-amber-200">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-amber-50">
                      <tr className="text-xs uppercase tracking-wide text-amber-900">
                        <th className="px-3 py-2">Split</th>
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {splits.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={idx % 2 ? "bg-white" : "bg-amber-50/50"}
                        >
                          <td className="px-3 py-2 font-semibold text-amber-950">
                            {s.name}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {msToClockWithMs(s.totalMs)}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {msToClockWithMs(s.deltaMs)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Speedrun Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · S split · U undo · E end · R reset · F
              fullscreen
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function SpeedrunTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/speedrun-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Speedrun Timer",
        url,
        description:
          "A simple speedrun timer with splits. Start/pause, record split times, undo last split, and go fullscreen for a clean display.",
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
            name: "Speedrun Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a speedrun timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A speedrun timer is used to track how long a run takes from start to finish. Many speedrun timers also support splits, which let you record segment times during the run.",
            },
          },
          {
            "@type": "Question",
            name: "What are splits on a split timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Splits are segment timestamps during a run. Each time you hit Split, the timer records the total time and the time since the previous split (delta).",
            },
          },
          {
            "@type": "Question",
            name: "How do I record splits during a run?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Press the Split button or use the keyboard shortcut S while the timer card is focused. You can optionally name the next split before recording it.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, S records a split, U undoes the last split, E ends the run, R resets, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">Speedrun Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Speedrun Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>speedrun timer</strong> and{" "}
            <strong>split timer</strong> for speedrunning. Start/pause, record
            splits, undo, and go fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <SpeedrunTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Split timer basics
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use splits for sections like “Level 1”, “Boss 1”, “Chapter 3”,
              etc. You can name the next split before you hit Split.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen for runs
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen shows a clean dark display with huge digits. Good for
              stream overlays and second monitors.
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
                <strong>S</strong> = Split
              </li>
              <li>
                <strong>U</strong> = Undo split
              </li>
              <li>
                <strong>E</strong> = End run
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
            Free speedrun timer with splits
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This tool is a lightweight <strong>speedrun timer</strong> for
              tracking a run from start to finish. It also works as a
              <strong> split timer</strong> by recording segment times during
              your run.
            </p>

            <p>
              When you press Split, the timer stores the total run time and the
              time since your last split (delta). If you make a mistake, use
              Undo. For casual runs you can end with an optional Finish split
              using End run.
            </p>

            <p>
              If you want a general stopwatch, use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              . For interval training, use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              . For random intervals, use{" "}
              <Link to="/chaos-timer" className="font-semibold hover:underline">
                Chaos Timer
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Speedrun timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Track total time with hundredths.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Split timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Record segment totals and deltas during the run.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Fullscreen
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Clean dark display for streams and second monitors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Speedrun Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How is this different from a speedcubing timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Speedcubing timers usually focus on single solves, inspection
              time, and averages. A speedrun timer tracks one continuous run and
              lets you record splits for segments.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I record splits?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click Split or press <strong>S</strong> while focused. The split
              list shows the total time and the delta since the previous split.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I undo a split?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click Undo split or press <strong>U</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>S</strong> split •{" "}
              <strong>U</strong> undo • <strong>E</strong> end •{" "}
              <strong>R</strong> reset • <strong>F</strong> fullscreen.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
