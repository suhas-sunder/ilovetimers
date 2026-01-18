// app/routes/tabata-timer.tsx
import type { Route } from "./+types/tabata-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Tabata Timer 20/10 | Tabata Interval Timer (8 Rounds, Fullscreen)";
  const description =
    "Free Tabata timer with the classic 20/10 × 8 defaults. Big fullscreen intervals, simple controls, optional sound, and keyboard shortcuts. Great for Tabata HIIT, conditioning, and timed workouts.";
  const url = "https://ilovetimers.com/tabata-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "tabata timer 20 10",
        "tabata timer 20/10",
        "tabata interval timer",
        "tabata timer",
        "20 10 tabata",
        "tabata hiit timer",
        "interval timer",
        "fullscreen tabata timer",
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
   TABATA TIMER CARD (20/10 x 8 defaults)
========================================================= */
type Phase = "work" | "rest";

function TabataTimerCard() {
  const beep = useBeep();

  // Classic Tabata defaults: 20s work / 10s rest x 8
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [rounds, setRounds] = useState(8);

  const [phase, setPhase] = useState<Phase>("work");
  const [roundIdx, setRoundIdx] = useState(1);

  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  // Internal timer state (ms remaining in current phase)
  const [remaining, setRemaining] = useState(workSec * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  // Keep aligned when config changes (only when not running)
  useEffect(() => {
    if (running) return;
    setPhase("work");
    setRoundIdx(1);
    setRemaining(workSec * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [workSec, restSec, rounds, running]);

  const quickWork = useMemo(() => [10, 15, 20, 30, 40, 45], []);
  const quickRest = useMemo(() => [5, 10, 15, 20, 30], []);
  const quickRounds = useMemo(() => [4, 6, 8, 10, 12, 16], []);

  const totalTimeMs = useMemo(() => {
    // total = rounds * work + (rounds - 1) * rest (rest after last round not necessary)
    const w = workSec * 1000;
    const r = restSec * 1000;
    const n = rounds;
    return n * w + Math.max(0, n - 1) * r;
  }, [workSec, restSec, rounds]);

  const elapsedMs = useMemo(() => {
    // Approx total elapsed for progress bar: total - (remaining + remaining future phases)
    // Keep it simple and stable: estimate by counting completed rounds/phases plus current phase progress.
    const w = workSec * 1000;
    const r = restSec * 1000;

    const currentPhaseTotal = phase === "work" ? w : r;
    const currentDone = clamp(
      currentPhaseTotal - remaining,
      0,
      currentPhaseTotal,
    );

    const completedRounds = roundIdx - 1;

    // Completed segments before current phase:
    // For each completed round: work + rest (except after last completed round if we are currently in work of next round)
    // If we are in work of roundIdx, we have completed completedRounds full cycles of (work+rest)
    // If we are in rest of roundIdx, we have completed completedRounds cycles + current round work
    let base = completedRounds * (w + r);

    if (phase === "rest") {
      base += w;
    }

    // If on last round and we don't require rest after final work, totalTimeMs already accounts for (n-1) rests
    // base might include an extra rest when completedRounds includes a round whose rest isn't part of total
    // Guard by clamping final progress later.
    return base + currentDone;
  }, [workSec, restSec, roundIdx, phase, remaining]);

  const progress = useMemo(() => {
    if (totalTimeMs <= 0) return 0;
    return clamp(elapsedMs / totalTimeMs, 0, 1);
  }, [elapsedMs, totalTimeMs]);

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

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 3_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(900, 90);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound) {
          // Distinct tones make it obvious: work->rest vs rest->work
          if (phase === "work") beep(520, 240);
          else beep(760, 200);
        }

        // Transition
        if (phase === "work") {
          // If this was the final work interval, finish (no mandatory rest after)
          if (roundIdx >= rounds) {
            setRunning(false);
            return;
          }

          // Go to rest
          setPhase("rest");
          const next = Math.max(0, restSec * 1000);
          setRemaining(next);
          endRef.current = performance.now() + next;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // phase === "rest" -> next round work
        setRoundIdx((r) => Math.min(rounds, r + 1));
        setPhase("work");
        const next = Math.max(0, workSec * 1000);
        setRemaining(next);
        endRef.current = performance.now() + next;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [
    running,
    remaining,
    sound,
    finalCountdownBeeps,
    beep,
    phase,
    roundIdx,
    rounds,
    workSec,
    restSec,
  ]);

  function reset() {
    setRunning(false);
    setPhase("work");
    setRoundIdx(1);
    setRemaining(workSec * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function next() {
    // Skip to next phase/round
    endRef.current = null;
    lastBeepSecondRef.current = null;

    if (phase === "work") {
      if (roundIdx >= rounds) {
        setRunning(false);
        return;
      }
      setPhase("rest");
      setRemaining(restSec * 1000);
      return;
    }

    // rest -> next work
    setRoundIdx((r) => Math.min(rounds, r + 1));
    setPhase("work");
    setRemaining(workSec * 1000);
  }

  function setClassic() {
    setWorkSec(20);
    setRestSec(10);
    setRounds(8);
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
    } else if (e.key.toLowerCase() === "n") {
      next();
    } else if (e.key.toLowerCase() === "c") {
      setClassic();
    }
  };

  const urgent = running && remaining > 0 && remaining <= 6_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const phaseLabel = phase === "work" ? "Work" : "Rest";

  const totalText = useMemo(() => {
    const totalSec = Math.round(totalTimeMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${pad2(s)}`;
  }, [totalTimeMs]);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Tabata Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Classic <strong>Tabata 20/10 × 8</strong> by default. Alternate work
            and rest automatically with big fullscreen intervals.
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

      {/* Config */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
            Work (seconds)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickWork.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setWorkSec(s)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                  s === workSec
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Custom
            <input
              type="number"
              min={5}
              max={600}
              value={workSec}
              onChange={(e) =>
                setWorkSec(clamp(Number(e.target.value || 5), 5, 600))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
            Rest (seconds)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickRest.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRestSec(s)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                  s === restSec
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Custom
            <input
              type="number"
              min={0}
              max={600}
              value={restSec}
              onChange={(e) =>
                setRestSec(clamp(Number(e.target.value || 0), 0, 600))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
          <div className="mt-2 text-xs text-slate-700">
            Tabata default is <strong>10s</strong> rest.
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
            Rounds
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickRounds.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRounds(r)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                  r === rounds
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-semibold text-amber-950">
            Custom
            <input
              type="number"
              min={1}
              max={50}
              value={rounds}
              onChange={(e) =>
                setRounds(clamp(Number(e.target.value || 1), 1, 50))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>
          <div className="mt-2 text-xs text-slate-700">
            Total time (no rest after last work): <strong>{totalText}</strong>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
        <Btn kind="ghost" onClick={next}>
          Next
        </Btn>
        <Btn kind="ghost" onClick={setClassic}>
          Classic 20/10 × 8
        </Btn>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          urgent
            ? "border-rose-300 bg-rose-50 text-rose-950"
            : phase === "work"
              ? "border-amber-300 bg-amber-50 text-amber-950"
              : "border-slate-300 bg-slate-50 text-slate-900"
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
                gap:16px;
              }

              [data-fs-container]:fullscreen .fs-top{
                width:min(900px, 92vw);
                display:flex;
                justify-content:space-between;
                font: 800 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.14em;
                text-transform:uppercase;
                opacity:.9;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(96px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-bar{
                width:min(900px, 92vw);
                height:10px;
                border-radius:999px;
                background:rgba(255,255,255,.14);
                overflow:hidden;
              }
              [data-fs-container]:fullscreen .fs-bar > div{
                height:100%;
                width:var(--p, 0%);
                background:rgba(255,255,255,.75);
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
          style={{ minHeight: 280 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {phaseLabel} · Round {roundIdx}/{rounds} · Total {totalText}
            </div>

            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl md:text-8xl">
                {shownTime}
              </span>
            </div>

            <div className="w-full max-w-xl">
              <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
                <div
                  className="h-full bg-amber-700"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-slate-600">
                Space start/pause · R reset · N next · F fullscreen · C classic
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div
            className="fs-inner"
            style={{ ["--p" as any]: `${Math.round(progress * 100)}%` }}
          >
            <div className="fs-top">
              <div>{phase === "work" ? "Work" : "Rest"}</div>
              <div>
                Round {roundIdx}/{rounds}
              </div>
            </div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-bar">
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="fs-help">
              Space start/pause · R reset · N next · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · N next · F fullscreen · C
          classic
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function TabataTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/tabata-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tabata Timer",
        url,
        description:
          "Tabata timer with classic 20 seconds work and 10 seconds rest for 8 rounds. Fullscreen intervals, optional sound, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Tabata Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a Tabata timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A Tabata timer is an interval timer that alternates short work and rest periods. The classic Tabata protocol is 20 seconds of work and 10 seconds of rest for 8 rounds.",
            },
          },
          {
            "@type": "Question",
            name: "What does Tabata 20/10 × 8 mean?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It means 20 seconds of work followed by 10 seconds of rest, repeated for 8 rounds. This page starts with those exact defaults so you can press Start immediately.",
            },
          },
          {
            "@type": "Question",
            name: "Can I change the intervals?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Adjust Work seconds, Rest seconds, and Rounds. The timer will alternate automatically and stop after the final work interval.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, N skips to the next interval, F toggles fullscreen, and C restores the classic 20/10 × 8 defaults while the card is focused.",
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
            / <span className="text-amber-950">Tabata Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Tabata Timer (20/10 × 8)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>Tabata interval timer</strong> with the classic{" "}
            <strong>20 seconds work / 10 seconds rest</strong> for{" "}
            <strong>8 rounds</strong> pre-filled. Press Start and go.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <TabataTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Classic Tabata defaults (20/10 × 8)
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              This timer starts at <strong>20 seconds work</strong>,{" "}
              <strong>10 seconds rest</strong>, repeated for{" "}
              <strong>8 rounds</strong>. That is the well-known “Tabata 20/10”
              format.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen intervals for workouts
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use Fullscreen for a clean dark display with huge digits. It is
              easy to follow on a phone stand, tablet, or TV during HIIT
              sessions.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Customize any interval timer
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Change work seconds, rest seconds, or rounds to match your
              training. Use <strong>C</strong> to instantly restore classic
              defaults.
            </p>
          </div>
        </div>
      </section>


      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free Tabata timer (20/10) and Tabata interval timer for HIIT
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>Tabata timer 20 10</strong> is an interval timer that
              alternates short work and rest periods. The classic Tabata setup
              is <strong>20 seconds work</strong> and{" "}
              <strong>10 seconds rest</strong> for <strong>8 rounds</strong> and
              that is exactly what this page loads with.
            </p>

            <p>
              In practice, you pick an exercise, go hard for 20 seconds, rest
              for 10 seconds, and repeat until you finish the rounds. Fullscreen
              mode keeps the display readable and the phase changes obvious.
            </p>

            <p>
              If you want a broader workout tool with rounds and longer times,
              try{" "}
              <Link
                to="/workout-timer"
                className="font-semibold hover:underline"
              >
                Workout Timer
              </Link>
              . For a dedicated interval page, use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              . For a basic countdown, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Tabata timer 20/10
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Pre-filled classic protocol: 20 seconds work, 10 seconds rest, 8
                rounds.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Tabata interval timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Easily customize work, rest, and rounds for any interval
                workout.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Fullscreen HIIT display
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Large digits and clear phase labels make it easy to follow
                during training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Tabata Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What does Tabata 20/10 × 8 mean?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It means <strong>20 seconds work</strong>, then{" "}
              <strong>10 seconds rest</strong>, repeated for{" "}
              <strong>8 rounds</strong>. This page loads with those defaults.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How long is a full Tabata set?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              With 20/10 × 8 and no rest after the final work interval, the
              total time is <strong>4 minutes</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I customize the intervals?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Change Work seconds, Rest seconds, and Rounds. Use the
              Classic button (or <strong>C</strong>) to restore 20/10 × 8
              instantly.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>N</strong> next interval • <strong>F</strong> fullscreen •{" "}
              <strong>C</strong> classic defaults (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
