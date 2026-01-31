// app/routes/breathing-timer.tsx
import type { Route } from "./+types/breathing-timer";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Breathing Timer | Box Breathing and Guided Breathing Cycles";
  const description =
    "Free breathing timer for box breathing, 4-7-8 breathing, and custom inhale, hold, and exhale cycles. Clean guided visuals, optional sound, and fullscreen mode.";
  const url = "https://ilovetimers.com/breathing-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "breathing timer",
        "box breathing timer",
        "breathing exercise timer",
        "4-7-8 breathing timer",
        "guided breathing timer",
        "inhale exhale timer",
        "breathing cycle timer",
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
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${pad2(sec)}`;
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

/* WebAudio beep (gentle cue) */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (freq = 660, duration = 90, gain = 0.06) => {
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
   BREATHING TIMER CARD
========================================================= */
type PhaseKey = "inhale" | "hold1" | "exhale" | "hold2";

type Preset = {
  id: string;
  label: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number; // 0 means infinite
  note: string;
};

const PRESETS: Preset[] = [
  {
    id: "box",
    label: "Box Breathing (4-4-4-4)",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 0,
    note: "Balanced and simple. Great for calm focus.",
  },
  {
    id: "478",
    label: "4-7-8 Breathing (4-7-8)",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
    note: "Often used for winding down. Try 4 cycles.",
  },
  {
    id: "calm",
    label: "Calm Pace (4-2-6-0)",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 0,
    note: "Longer exhale for a calmer feel.",
  },
  {
    id: "custom",
    label: "Custom",
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    cycles: 0,
    note: "Make your own inhale/hold/exhale pattern.",
  },
];

function BreathingTimerCard() {
  const beep = useBeep();

  const [presetId, setPresetId] = useState("box");
  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const [inhale, setInhale] = useState(preset.inhale);
  const [hold1, setHold1] = useState(preset.hold1);
  const [exhale, setExhale] = useState(preset.exhale);
  const [hold2, setHold2] = useState(preset.hold2);
  const [cyclesTarget, setCyclesTarget] = useState(preset.cycles);

  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(false);

  const [phase, setPhase] = useState<PhaseKey>("inhale");
  const [phaseMsLeft, setPhaseMsLeft] = useState(inhale * 1000);

  const [cycleCount, setCycleCount] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Apply preset on change (except custom, user can still start from values but preset sets defaults)
  useEffect(() => {
    if (presetId === "custom") return;
    setInhale(preset.inhale);
    setHold1(preset.hold1);
    setExhale(preset.exhale);
    setHold2(preset.hold2);
    setCyclesTarget(preset.cycles);
  }, [presetId, preset]);

  // Reset state when pattern changes
  useEffect(() => {
    setRunning(false);
    setPhase("inhale");
    setCycleCount(0);
    setPhaseMsLeft(inhale * 1000);
    endRef.current = null;
  }, [inhale, hold1, exhale, hold2, cyclesTarget]);

  const pattern = useMemo(() => {
    const steps: { key: PhaseKey; label: string; seconds: number }[] = [];
    steps.push({ key: "inhale", label: "Inhale", seconds: inhale });
    if (hold1 > 0) steps.push({ key: "hold1", label: "Hold", seconds: hold1 });
    steps.push({ key: "exhale", label: "Exhale", seconds: exhale });
    if (hold2 > 0) steps.push({ key: "hold2", label: "Hold", seconds: hold2 });
    return steps.filter((s) => s.seconds > 0);
  }, [inhale, hold1, exhale, hold2]);

  function stepIndexFor(p: PhaseKey) {
    const idx = pattern.findIndex((x) => x.key === p);
    return idx >= 0 ? idx : 0;
  }

  function nextPhase(cur: PhaseKey): PhaseKey {
    const idx = stepIndexFor(cur);
    const next = pattern[(idx + 1) % pattern.length];
    return next.key;
  }

  function phaseSeconds(p: PhaseKey) {
    const found = pattern.find((x) => x.key === p);
    return found?.seconds ?? inhale;
  }

  const phaseLabel = useMemo(() => {
    return pattern.find((x) => x.key === phase)?.label ?? "Inhale";
  }, [pattern, phase]);

  // Main loop
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      return;
    }

    // bootstrap end time for current phase
    if (!endRef.current) {
      endRef.current = performance.now() + phaseMsLeft;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setPhaseMsLeft(rem);

      if (rem <= 0) {
        // phase transition
        const nxt = nextPhase(phase);

        if (sound) {
          // gentle cues by phase
          if (nxt === "inhale") beep(740, 90, 0.06);
          else if (nxt === "exhale") beep(520, 90, 0.06);
          else beep(620, 70, 0.05);
        }

        // completed a cycle when we wrap back to inhale
        const wrapped = nxt === "inhale";
        if (wrapped) {
          const nextCycle = cycleCount + 1;
          setCycleCount(nextCycle);

          if (cyclesTarget > 0 && nextCycle >= cyclesTarget) {
            setRunning(false);
            endRef.current = null;
            setPhase("inhale");
            setPhaseMsLeft(inhale * 1000);
            if (sound) beep(660, 160, 0.07);
            return;
          }
        }

        setPhase(nxt);
        const nextMs = phaseSeconds(nxt) * 1000;
        setPhaseMsLeft(nextMs);
        endRef.current = performance.now() + nextMs;
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
    phase,
    phaseMsLeft,
    inhale,
    cycleCount,
    cyclesTarget,
    sound,
    beep,
    pattern,
  ]);

  function startPause() {
    setRunning((r) => !r);
    endRef.current = null;
  }

  function reset() {
    setRunning(false);
    setPhase("inhale");
    setCycleCount(0);
    setPhaseMsLeft(inhale * 1000);
    endRef.current = null;
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
      setSound((x) => !x);
    }
  };

  const secondsLeft = Math.ceil(phaseMsLeft / 1000);
  const cycleText =
    cyclesTarget > 0
      ? `Cycle ${Math.min(cycleCount + 1, cyclesTarget)} of ${cyclesTarget}`
      : `Cycle ${cycleCount + 1} (continuous)`;

  // Simple “breath ring” animation: scale based on phase progress
  const phaseTotal = phaseSeconds(phase) * 1000 || 1;
  const progress = 1 - clamp(phaseMsLeft / phaseTotal, 0, 1);
  const ringScale =
    phase === "inhale"
      ? 0.82 + 0.28 * progress
      : phase === "exhale"
        ? 1.1 - 0.28 * progress
        : 1.02;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Breathing Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Simple inhale, hold, exhale cycles. Includes{" "}
            <strong>box breathing</strong>, <strong>4-7-8</strong>, and custom
            patterns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            Sound cues
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

      {/* Presets + pattern */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Preset
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-slate-600">{preset.note}</div>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Cycles (0 = continuous)
          <input
            type="number"
            min={0}
            max={60}
            value={cyclesTarget}
            onChange={(e) =>
              setCyclesTarget(clamp(Number(e.target.value || 0), 0, 60))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
            Pattern
          </div>
          <div className="mt-2 text-sm font-semibold text-amber-900">
            Inhale {inhale}s · Hold {hold1}s · Exhale {exhale}s · Hold {hold2}s
          </div>
          <div className="mt-2 text-xs text-slate-700">
            Shortcuts: Space start/pause · R reset · F fullscreen · S sound
          </div>
        </div>
      </div>

      {/* Custom timing */}
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <label className="block text-sm font-semibold text-amber-950">
          Inhale (sec)
          <input
            type="number"
            min={1}
            max={30}
            value={inhale}
            onChange={(e) =>
              setInhale(clamp(Number(e.target.value || 1), 1, 30))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Hold (sec)
          <input
            type="number"
            min={0}
            max={30}
            value={hold1}
            onChange={(e) =>
              setHold1(clamp(Number(e.target.value || 0), 0, 30))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Exhale (sec)
          <input
            type="number"
            min={1}
            max={40}
            value={exhale}
            onChange={(e) =>
              setExhale(clamp(Number(e.target.value || 1), 1, 40))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Hold (sec)
          <input
            type="number"
            min={0}
            max={30}
            value={hold2}
            onChange={(e) =>
              setHold2(clamp(Number(e.target.value || 0), 0, 30))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>

        <div className="ml-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Tip: click the card once so shortcuts work.
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 300 }}
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

              [data-fs-container]:fullscreen .fs-phase{
                font: 900 clamp(42px, 6vw, 90px)/1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.02em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-count{
                font: 900 clamp(70px, 10vw, 140px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 700 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="w-full p-6"
          style={{ minHeight: 300 }}
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {cycleText}
            </div>

            {/* Ring */}
            <div className="relative flex items-center justify-center">
              <div
                className="h-56 w-56 rounded-full border-4 border-amber-300 bg-white shadow-sm transition-transform duration-150"
                style={{ transform: `scale(${ringScale})` }}
              />
              <div className="absolute text-center">
                <div className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
                  {phaseLabel}
                </div>
                <div className="mt-1 font-mono text-6xl font-extrabold tracking-widest text-amber-950">
                  {secondsLeft}
                </div>
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-700">
              Inhale {inhale}s · Hold {hold1}s · Exhale {exhale}s · Hold {hold2}
              s
            </div>

            <div className="text-xs text-slate-600">
              Runs while this page is open. Background tabs may update less
              often.
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-phase">{phaseLabel}</div>
            <div className="fs-count">{secondsLeft}</div>
            <div className="fs-sub">{cycleText}</div>
            <div className="fs-sub">
              Pattern: {inhale}-{hold1}-{exhale}-{hold2}
            </div>
            <div className="fs-sub">
              Space start/pause · R reset · F fullscreen · S sound
            </div>
          </div>
        </div>
      </div>

      {/* Calm disclosure */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold text-amber-950">Note</div>
        <p className="mt-2 leading-relaxed">
          This is a simple breathing exercise timer for calm focus. It is not
          medical advice. If you feel dizzy or uncomfortable, stop and breathe
          normally.
        </p>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BreathingTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/breathing-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Breathing Timer",
        url,
        description:
          "Breathing timer for box breathing, 4-7-8 breathing, and custom inhale/hold/exhale cycles with fullscreen mode.",
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
            name: "Breathing Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a breathing timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A breathing timer guides inhale, hold, and exhale timing so you can follow a steady breathing rhythm.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use a box breathing timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Box breathing uses equal timing: inhale, hold, exhale, hold. A common pattern is 4-4-4-4. Start the timer and follow the on-screen phase cues.",
            },
          },
          {
            "@type": "Question",
            name: "How does 4-7-8 breathing work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A common 4-7-8 pattern is inhale for 4 seconds, hold for 7 seconds, then exhale for 8 seconds. Many people run 4 cycles to wind down.",
            },
          },
          {
            "@type": "Question",
            name: "Does it keep running if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It runs while the page is open. Some browsers may reduce update frequency in background tabs to save power.",
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
            / <span className="text-amber-950">Breathing Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Breathing Timer (Box Breathing + 4-7-8)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>breathing exercise timer</strong> for guided
            inhale, hold, and exhale cycles. Includes{" "}
            <strong>box breathing</strong> and <strong>4-7-8 breathing</strong>.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <BreathingTimerCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free box breathing timer and 4-7-8 breathing timer
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>breathing timer</strong> helps you follow a steady
              rhythm for inhale, hold, and exhale. It’s commonly used for calm
              focus, stress reduction, and settling your attention before work
              or sleep.
            </p>

            <p>
              <strong>Box breathing</strong> typically uses equal segments like{" "}
              <strong>4-4-4-4</strong>. <strong>4-7-8 breathing</strong> is
              often <strong>4 seconds inhale</strong>,{" "}
              <strong>7 seconds hold</strong>, <strong>8 seconds exhale</strong>
              , commonly run for <strong>4 cycles</strong>.
            </p>

            <p>
              If you want longer quiet sessions, use{" "}
              <Link
                to="/meditation-timer"
                className="font-semibold hover:underline"
              >
                Meditation Timer
              </Link>
              . For a silent room, try{" "}
              <Link
                to="/silent-timer"
                className="font-semibold hover:underline"
              >
                Silent Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Breathing Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is box breathing?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Box breathing is a four-part cycle: inhale, hold, exhale, hold. A
              common timing is 4-4-4-4.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is 4-7-8 breathing?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A common pattern is inhale for 4 seconds, hold for 7 seconds, then
              exhale for 8 seconds. Many people run it for 4 cycles.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I customize inhale and exhale times?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Adjust inhale/hold/exhale values and choose how many cycles
              to run (or set 0 for continuous).
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it keep running if I close the tab?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It runs while the page is open. Browsers may reduce update
              frequency in background tabs.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
