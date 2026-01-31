// app/routes/meeting-countup-timer.tsx
import type { Route } from "./+types/meeting-count-up-timer";
import { json } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Meeting Count-Up Timer (Elapsed Time)";
  const description =
    "Track how long your meeting has been running with a simple count-up timer. Clear elapsed time display for meetings, standups, and presentations.";

  const url = "https://ilovetimers.com/meeting-countup-timer";

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
const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClockUp(ms: number) {
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

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
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
   MEETING COUNTUP CARD
========================================================= */
type Split = { n: number; label: string; ms: number; splitMs: number };

function MeetingCountupCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const [topicLabel, setTopicLabel] = useState("Topic");
  const [topicsPlanned, setTopicsPlanned] = useState(0);

  const [splits, setSplits] = useState<Split[]>([]);
  const lastSplitElapsedRef = useRef<number>(0);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      return;
    }

    startRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = now - (startRef.current ?? now);
      const next = baseRef.current + delta;
      setElapsed(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running]);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      baseRef.current = elapsed;
      return next;
    });
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setSplits([]);
    lastSplitElapsedRef.current = 0;
  }

  function markTopic(label?: string) {
    const split = elapsed - lastSplitElapsedRef.current;
    lastSplitElapsedRef.current = elapsed;

    const nextN = splits.length + 1;
    const name = (label || topicLabel || "Topic").trim();

    setSplits((prev) => [
      {
        n: nextN,
        label:
          topicsPlanned > 0
            ? `${name} ${nextN}/${topicsPlanned}`
            : `${name} ${nextN}`,
        ms: elapsed,
        splitMs: split,
      },
      ...prev,
    ]);
  }

  const shownTime = msToClockUp(Math.ceil(elapsed / 1000) * 1000);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "t") {
      if (running) markTopic();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Meeting Count Up Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Tracks <strong>meeting running time</strong> and{" "}
            <strong>meeting elapsed time</strong>. Hit “Topic” to mark agenda
            splits as you go.
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
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
        <Btn kind="ghost" onClick={() => markTopic()} disabled={!running}>
          Topic
        </Btn>

        <div className="ml-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · T topic · R reset · F fullscreen
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
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
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Meeting running time
            </div>
            <div className="text-center font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {shownTime}
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Meeting elapsed time</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · T topic · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Meeting inputs + splits */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-950">
            Agenda helper (optional)
          </h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-amber-950">
              Button label
              <input
                type="text"
                value={topicLabel}
                onChange={(e) => setTopicLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Topic"
              />
            </label>

            <label className="block text-sm font-semibold text-amber-950">
              # of agenda topics
              <input
                type="number"
                min={0}
                max={50}
                value={topicsPlanned}
                onChange={(e) =>
                  setTopicsPlanned(clamp(Number(e.target.value || 0), 0, 50))
                }
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </label>
          </div>

          <p className="mt-3 text-sm text-amber-800">
            Press <strong>Topic</strong> (or <strong>T</strong>) to record the
            time spent on each agenda item.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-950">
            Topic splits (most recent first)
          </h3>

          {splits.length === 0 ? (
            <p className="mt-2 text-sm text-slate-700">
              Start the timer, then press <strong>Topic</strong> to record
              splits.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {splits.slice(0, 10).map((s) => (
                <div
                  key={s.n}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
                >
                  <div className="min-w-0 text-sm font-semibold text-amber-950">
                    {s.label}
                  </div>
                  <div className="shrink-0 text-sm font-extrabold text-amber-950">
                    {msToClockUp(s.ms)}
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-slate-700">
                    Split {msToClockUp(s.splitMs)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MeetingCountupTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/meeting-countup-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Meeting Count Up Timer",
        url,
        description:
          "Meeting count up timer for meeting running time and elapsed time with topic splits and fullscreen.",
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
            name: "Meeting Count Up Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a meeting count up timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A meeting count up timer tracks meeting running time by counting upward from zero, so you can see elapsed time at a glance.",
            },
          },
          {
            "@type": "Question",
            name: "How is this different from a meeting timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A meeting timer usually counts down to a limit. This page does the opposite: it counts up to show how long the meeting has been running.",
            },
          },
          {
            "@type": "Question",
            name: "Can I track time per agenda item?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the Topic button (or press T) to record splits for each agenda item.",
            },
          },
          {
            "@type": "Question",
            name: "Does it keep running if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It runs while the page is open. Some browsers may slow updates in background tabs to save power.",
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
            / <span className="text-amber-950">Meeting Count Up Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Meeting Count Up Timer (Meeting Running Time)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Track <strong>meeting elapsed time</strong> with a clean{" "}
            <strong>count-up</strong> display. It’s the opposite of a meeting
            countdown timer.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <MeetingCountupCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Meeting running time and meeting elapsed time, made visible
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>meeting count up timer</strong> shows how long a meeting
              has been running. Instead of counting down to a time limit, it
              counts up so you can see elapsed time instantly.
            </p>

            <p>
              This is useful for timeboxing conversations, keeping meetings
              honest, and tracking how long each agenda item actually takes. Use
              the <strong>Topic</strong> button to record splits per agenda
              section.
            </p>

            <p>
              If you need a strict time limit, use{" "}
              <Link
                to="/meeting-timer"
                className="font-semibold hover:underline"
              >
                Meeting Timer
              </Link>
              . If you just want a general elapsed timer, use{" "}
              <Link
                to="/count-up-timer"
                className="font-semibold hover:underline"
              >
                Count Up Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Meeting Count Up Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What does “meeting running time” mean?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It’s the total time that has passed since the meeting started.
              This timer counts up so you can see that running time at a glance.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How is this different from a meeting countdown timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Countdown timers are for time limits. This is for tracking elapsed
              time. It’s useful when you want visibility, not a deadline.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I track time per agenda topic?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Press <strong>Topic</strong> (or <strong>T</strong>) to
              record a split each time you move to the next agenda item.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it keep running if I close the tab?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It updates while the page is open. Some browsers may reduce update
              frequency in background tabs.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
