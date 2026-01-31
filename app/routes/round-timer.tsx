// app/routes/round-timer.tsx
import type { Route } from "./+types/round-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Round Timer for Boxing and MMA";
  const description =
    "Run boxing and MMA rounds with a clear round timer. Set rounds and rest periods and follow a big, easy-to-read countdown built for training.";

  const url = "https://ilovetimers.com/round-timer";

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

  return useCallback((freq = 880, duration = 140, gain = 0.12) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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
  }, []);
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
   ROUND TIMER CARD
========================================================= */
type Phase = "idle" | "warmup" | "work" | "rest" | "done";

type Preset = {
  label: string;
  rounds: number;
  workSec: number;
  restSec: number;
  warmupSec?: number;
};

function RoundTimerCard() {
  const beep = useBeep();

  // Common presets (boxing + MMA + training variants)
  const presets: Preset[] = useMemo(
    () => [
      {
        label: "Boxing 3×3 (1m rest)",
        rounds: 3,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Boxing 6×3 (1m rest)",
        rounds: 6,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Boxing 12×3 (1m rest)",
        rounds: 12,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "MMA 3×5 (1m rest)",
        rounds: 3,
        workSec: 300,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "MMA 5×5 (1m rest)",
        rounds: 5,
        workSec: 300,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Tabata-ish 8×(20/10)",
        rounds: 8,
        workSec: 20,
        restSec: 10,
        warmupSec: 10,
      },
      {
        label: "Sprints 10×(30/30)",
        rounds: 10,
        workSec: 30,
        restSec: 30,
        warmupSec: 10,
      },
    ],
    [],
  );

  const [rounds, setRounds] = useState(3);
  const [workSec, setWorkSec] = useState(180);
  const [restSec, setRestSec] = useState(60);
  const [warmupSec, setWarmupSec] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [roundIndex, setRoundIndex] = useState(0); // 1..rounds for work phases
  const [remainingMs, setRemainingMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  const lastBeepSecondRef = useRef<number | null>(null);

  const isRunning = phase !== "idle" && phase !== "done";

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function hardReset() {
    stopRaf();
    setPhase("idle");
    setRoundIndex(0);
    setRemainingMs(0);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function applyPreset(p: Preset) {
    if (isRunning) return;
    setRounds(p.rounds);
    setWorkSec(p.workSec);
    setRestSec(p.restSec);
    setWarmupSec(p.warmupSec ?? 0);
  }

  function start() {
    stopRaf();
    lastBeepSecondRef.current = null;

    if (warmupSec > 0) {
      setPhase("warmup");
      setRoundIndex(0);
      setRemainingMs(warmupSec * 1000);
      endRef.current = performance.now() + warmupSec * 1000;
    } else {
      setPhase("work");
      setRoundIndex(1);
      setRemainingMs(workSec * 1000);
      endRef.current = performance.now() + workSec * 1000;
      if (sound) beep(520, 160, 0.12); // bell
    }
  }

  function reset() {
    hardReset();
  }

  function skip() {
    // Move to the next logical phase, respecting bounds.
    if (!isRunning) return;

    if (phase === "warmup") {
      setPhase("work");
      setRoundIndex(1);
      setRemainingMs(workSec * 1000);
      endRef.current = performance.now() + workSec * 1000;
      lastBeepSecondRef.current = null;
      if (sound) beep(520, 160, 0.12);
      return;
    }

    if (phase === "work") {
      if (roundIndex >= rounds) {
        setPhase("done");
        setRemainingMs(0);
        endRef.current = null;
        stopRaf();
        if (sound) {
          beep(660, 160, 0.12);
          window.setTimeout(() => beep(880, 160, 0.12), 220);
        }
        return;
      }
      setPhase("rest");
      setRemainingMs(restSec * 1000);
      endRef.current = performance.now() + restSec * 1000;
      lastBeepSecondRef.current = null;
      if (sound) beep(330, 180, 0.12); // rest cue
      return;
    }

    if (phase === "rest") {
      setPhase("work");
      setRoundIndex((r) => Math.min(rounds, r + 1));
      setRemainingMs(workSec * 1000);
      endRef.current = performance.now() + workSec * 1000;
      lastBeepSecondRef.current = null;
      if (sound) beep(520, 160, 0.12);
      return;
    }
  }

  useEffect(() => {
    if (!isRunning) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemainingMs(rem);

      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 85, 0.06);
        }
      } else if (rem > 5_000) {
        lastBeepSecondRef.current = null;
      }

      if (rem <= 0) {
        lastBeepSecondRef.current = null;

        // Phase transitions
        if (phase === "warmup") {
          setPhase("work");
          setRoundIndex(1);
          setRemainingMs(workSec * 1000);
          endRef.current = performance.now() + workSec * 1000;
          if (sound) beep(520, 160, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (phase === "work") {
          if (roundIndex >= rounds) {
            setPhase("done");
            setRemainingMs(0);
            endRef.current = null;
            stopRaf();
            if (sound) {
              beep(660, 160, 0.12);
              window.setTimeout(() => beep(880, 160, 0.12), 220);
            }
            return;
          }

          setPhase("rest");
          setRemainingMs(restSec * 1000);
          endRef.current = performance.now() + restSec * 1000;
          if (sound) beep(330, 180, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (phase === "rest") {
          setPhase("work");
          setRoundIndex((r) => Math.min(rounds, r + 1));
          setRemainingMs(workSec * 1000);
          endRef.current = performance.now() + workSec * 1000;
          if (sound) beep(520, 160, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [
    isRunning,
    phase,
    rounds,
    roundIndex,
    workSec,
    restSec,
    warmupSec,
    sound,
    finalBeeps,
    beep,
  ]);

  const shownTime =
    phase === "idle"
      ? msToClock(workSec * 1000)
      : msToClock(Math.ceil(remainingMs / 1000) * 1000);

  const label =
    phase === "idle"
      ? "Ready"
      : phase === "warmup"
        ? "Warmup"
        : phase === "work"
          ? `Round ${roundIndex} of ${rounds}`
          : phase === "rest"
            ? "Rest"
            : "Complete";

  const shellClass =
    phase === "work"
      ? "border-amber-300 bg-amber-50 text-amber-950"
      : phase === "rest"
        ? "border-sky-200 bg-sky-50 text-sky-950"
        : phase === "warmup"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-amber-300 bg-amber-50 text-amber-950";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (e.key === " ") {
      e.preventDefault();
      if (phase === "idle" || phase === "done") start();
      else skip();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "s") {
      setSound((x) => !x);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Round Timer (Boxing / MMA)
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Pre-set rounds and rest. Great for boxing, MMA, pad work, bag
            rounds, and conditioning.
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

      {/* Presets */}
      <div className="mt-6">
        <div className="text-sm font-extrabold text-amber-950">
          Common presets
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={isRunning}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:opacity-60 ${
                p.rounds === rounds &&
                p.workSec === workSec &&
                p.restSec === restSec &&
                (p.warmupSec ?? 0) === warmupSec
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <label className="block text-sm font-semibold text-amber-950">
          Rounds
          <input
            type="number"
            min={1}
            max={60}
            value={rounds}
            disabled={isRunning}
            onChange={(e) =>
              setRounds(clamp(Number(e.target.value || 1), 1, 60))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Round length (sec)
          <input
            type="number"
            min={10}
            max={3600}
            value={workSec}
            disabled={isRunning}
            onChange={(e) =>
              setWorkSec(clamp(Number(e.target.value || 10), 10, 3600))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Rest (sec)
          <input
            type="number"
            min={0}
            max={3600}
            value={restSec}
            disabled={isRunning}
            onChange={(e) =>
              setRestSec(clamp(Number(e.target.value || 0), 0, 3600))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Warmup (sec)
          <input
            type="number"
            min={0}
            max={600}
            value={warmupSec}
            disabled={isRunning}
            onChange={(e) =>
              setWarmupSec(clamp(Number(e.target.value || 0), 0, 600))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Btn onClick={start} disabled={isRunning}>
          Start
        </Btn>
        <Btn kind="ghost" onClick={skip} disabled={!isRunning}>
          Skip
        </Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${shellClass}`}
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

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 clamp(16px, 3vw, 26px)/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
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
              {label}
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {phase === "idle" ? msToClock(workSec * 1000) : shownTime}
            </div>

            <div className="mt-3 grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Rounds
                </div>
                <div className="mt-1 text-2xl font-extrabold text-amber-950">
                  {phase === "idle"
                    ? rounds
                    : Math.min(rounds, Math.max(1, roundIndex))}{" "}
                  / {rounds}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Round / Rest
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  {Math.round(workSec / 60)}m round · {Math.round(restSec / 60)}
                  m rest
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Controls
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  Start → run · Skip → next phase · Reset → stop
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
            <div className="fs-label">{label}</div>
            <div className="fs-time">
              {phase === "idle" ? msToClock(workSec * 1000) : shownTime}
            </div>
            <div className="fs-sub">
              {phase === "work"
                ? `Round ${roundIndex} / ${rounds}`
                : phase === "rest"
                  ? `Rest · Next: Round ${Math.min(rounds, roundIndex + 1)}`
                  : phase === "warmup"
                    ? `Warmup · Starts Round 1`
                    : phase === "done"
                      ? `Done`
                      : `Rounds ${rounds}`}
            </div>
            <div className="fs-help">
              Space start/skip · R reset · F fullscreen · S sound
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/skip · R reset · F fullscreen · S sound
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
export default function RoundTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/round-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Round Timer",
        url,
        description:
          "Round timer for boxing and MMA with rounds + rest, presets, sound cues, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "Round Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a boxing round timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A boxing round timer alternates between a work round and a rest period for a set number of rounds. It’s used for bag work, pad work, sparring rounds, and conditioning.",
            },
          },
          {
            "@type": "Question",
            name: "What are common boxing and MMA round settings?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Common boxing training rounds are 3 minutes with 1 minute rest. MMA rounds are often 5 minutes with 1 minute rest in competition, and similar for training.",
            },
          },
          {
            "@type": "Question",
            name: "Does this timer have sound cues?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It plays a cue at the start of work rounds and a different cue at the start of rest. You can turn sound off if needed.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use it in fullscreen for a gym?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Fullscreen is high contrast with large digits for gym visibility.",
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
            / <span className="text-amber-950">Round Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Round Timer (Boxing / MMA)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>boxing timer</strong> and <strong>MMA timer</strong>{" "}
            with rounds + rest, common presets, sound cues, and fullscreen mode.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <RoundTimerCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free boxing and MMA round timer with rest periods
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>round timer</strong> alternates between a work interval
              (the round) and a rest interval. This format is used for boxing,
              MMA, kickboxing, pad rounds, heavy bag rounds, and conditioning.
            </p>

            <p>
              Use a common preset like 3×3 with 1 minute rest, or customize the
              number of rounds, round length, rest time, and an optional warmup.
              If you want minute-start cues without separate rest periods, try{" "}
              <Link to="/emom-timer" className="font-semibold hover:underline">
                EMOM Timer
              </Link>
              . For fixed work/rest blocks, use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Round Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What’s a common boxing round timer setting?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A very common boxing training setting is{" "}
              <strong>3 minutes on</strong> and <strong>1 minute rest</strong>,
              repeated for multiple rounds.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What’s a common MMA round setting?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              MMA rounds are often <strong>5 minutes</strong> with{" "}
              <strong>1 minute rest</strong> in competition, and similar timing
              is used for training.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I customize round and rest length?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Set your number of rounds, round length, rest length, and
              optional warmup.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> starts (or skips to the next phase),{" "}
              <strong>R</strong> resets, <strong>F</strong> toggles fullscreen,
              and <strong>S</strong> toggles sound.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
