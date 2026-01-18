// app/routes/count-up-timer.tsx
import type { Route } from "./+types/count-up-timer";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import TimerMenuLinks from "~/clients/components/navigation/TimerMenuLinks";
import RelatedSites from "~/clients/components/navigation/RelatedSites";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Count Up Timer | Elapsed Time & Time Since Timer (Fullscreen, Simple)";
  const description =
    "Free count up timer for tracking elapsed time. Start, pause, lap, reset, and fullscreen mode. Great for tasks, experiments, meetings, workouts, and productivity tracking.";
  const url = "https://ilovetimers.com/count-up-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "count up timer",
        "elapsed time timer",
        "time since timer",
        "count up clock",
        "timer that counts up",
        "fullscreen count up timer",
        "elapsed timer online",
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
   COUNT UP TIMER CARD
========================================================= */
type Lap = { n: number; ms: number; splitMs: number };

function CountUpTimerCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const [laps, setLaps] = useState<Lap[]>([]);
  const lastLapElapsedRef = useRef<number>(0);

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
      if (next) {
        // resume: anchor base to current elapsed
        baseRef.current = elapsed;
      } else {
        // pause: freeze base at current elapsed
        baseRef.current = elapsed;
      }
      return next;
    });
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
    lastLapElapsedRef.current = 0;
  }

  function lap() {
    const split = elapsed - lastLapElapsedRef.current;
    lastLapElapsedRef.current = elapsed;

    setLaps((prev) => [
      { n: prev.length + 1, ms: elapsed, splitMs: split },
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
    } else if (e.key.toLowerCase() === "l") {
      if (running) lap();
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
            Count Up Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Track <strong>elapsed time</strong> for tasks, experiments,
            meetings, and “time since” activities. Includes laps and fullscreen.
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
        <Btn kind="ghost" onClick={lap} disabled={!running}>
          Lap
        </Btn>

        <div className="ml-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · L lap · R reset · F fullscreen
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
          <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
            <span className="text-6xl sm:text-7xl md:text-8xl">
              {shownTime}
            </span>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Elapsed Time</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · L lap · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Laps */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-950">
            Laps (most recent first)
          </h3>

          {laps.length === 0 ? (
            <p className="mt-2 text-sm text-slate-700">
              Press <strong>Lap</strong> (or <strong>L</strong>) while running
              to record splits.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {laps.slice(0, 10).map((l) => (
                <div
                  key={l.n}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
                >
                  <div className="text-sm font-semibold text-amber-950">
                    Lap {l.n}
                  </div>
                  <div className="text-sm font-extrabold text-amber-950">
                    {msToClockUp(l.ms)}
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    Split {msToClockUp(l.splitMs)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-950">
            Common uses
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-amber-800">
            <li>
              <strong>Meetings:</strong> track how long a topic takes.
            </li>
            <li>
              <strong>Experiments:</strong> record elapsed time and lap splits.
            </li>
            <li>
              <strong>Tasks:</strong> “time since started” for focus sessions.
            </li>
            <li>
              <strong>Workouts:</strong> count up between intervals or sets.
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function CountUpTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/count-up-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Count Up Timer",
        url,
        description:
          "Count up timer for elapsed time and time-since tracking with fullscreen and lap splits.",
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
            name: "Count Up Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a count up timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A count up timer tracks elapsed time by counting upward from zero. It is useful when you want to see how long something has been running.",
            },
          },
          {
            "@type": "Question",
            name: "Is this the same as a stopwatch?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It is similar. A stopwatch is a type of count up timer, often with laps and splits. This page includes laps and a fullscreen display.",
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
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts or pauses, L records a lap, R resets, and F toggles fullscreen when focused.",
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
            / <span className="text-amber-950">Count Up Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Count Up Timer (Elapsed Time)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>count up timer</strong> tracks{" "}
            <strong>elapsed time</strong>. Use it as a{" "}
            <strong>time since</strong> timer for tasks, meetings, experiments,
            workouts, and productivity tracking.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <CountUpTimerCard />
      </section>

      {/* Menu Links */}
      <TimerMenuLinks />
      
      {/* Related Sites */}
      <RelatedSites
        contextTags={["productivity", "focus", "learning", "tools"]}
        title="More tools for focus and tracking"
        subtitle="A small set of related sites that fit this page."
      />


      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free count up timer for elapsed time and “time since”
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>count up timer</strong> is useful when you don’t know
              how long something will take. Instead of counting down to zero, it
              counts upward so you can see elapsed time at a glance.
            </p>

            <p>
              This makes it a strong fit for <strong>meetings</strong> (time
              spent on agenda items),
              <strong>experiments</strong> (elapsed duration and splits), and{" "}
              <strong>productivity</strong> tracking (time since you started a
              task).
            </p>

            <p>
              If you need a fixed time limit, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For a dedicated stopwatch, use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Count Up Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is an elapsed time timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              An elapsed time timer counts upward from zero and shows how much
              time has passed.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use this as a “time since” timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Start it when the activity begins and you’ll see the time
              since it started.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it work in a background tab?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It runs while the page is open. Some browsers slow updates in
              background tabs to save battery.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Space start/pause, L lap, R reset, F fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 i💛Timers - timers, clocks, and useful time tools
        </div>
      </footer>
    </main>
  );
}
