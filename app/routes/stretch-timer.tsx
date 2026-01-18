// app/routes/stretch-timer.tsx
import type { Route } from "./+types/stretch-timer";
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
    "Stretch Timer | Mobility Timer + Yoga Stretch Timer (Intervals, Simple, Fullscreen)";
  const description =
    "Free stretch timer for mobility and yoga stretching. Set stretch + rest intervals, choose rounds, use presets, fullscreen display, and optional sound cues.";
  const url = "https://ilovetimers.com/stretch-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "stretch timer",
        "mobility timer",
        "yoga stretch timer",
        "stretch interval timer",
        "stretch and rest timer",
        "mobility intervals",
        "stretch timer online",
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

/* WebAudio cue */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (freq = 740, duration = 120, gain = 0.07) => {
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
   STRETCH TIMER CARD
========================================================= */
type Phase = "stretch" | "rest";

type Preset = {
  id: string;
  label: string;
  stretchSec: number;
  restSec: number;
  rounds: number;
  note: string;
};

const PRESETS: Preset[] = [
  {
    id: "mobility",
    label: "Mobility (45s stretch / 15s rest × 10)",
    stretchSec: 45,
    restSec: 15,
    rounds: 10,
    note: "Quick mobility circuit. Great warm-up.",
  },
  {
    id: "yoga",
    label: "Yoga Holds (60s stretch / 15s rest × 8)",
    stretchSec: 60,
    restSec: 15,
    rounds: 8,
    note: "Longer holds with short resets.",
  },
  {
    id: "deep",
    label: "Deep Stretch (90s stretch / 30s rest × 6)",
    stretchSec: 90,
    restSec: 30,
    rounds: 6,
    note: "Slower pace for deeper stretches.",
  },
  {
    id: "custom",
    label: "Custom",
    stretchSec: 45,
    restSec: 15,
    rounds: 10,
    note: "Tune the interval lengths and rounds.",
  },
];

function StretchTimerCard() {
  const beep = useBeep();

  const [presetId, setPresetId] = useState("mobility");
  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const [stretchSec, setStretchSec] = useState(preset.stretchSec);
  const [restSec, setRestSec] = useState(preset.restSec);
  const [rounds, setRounds] = useState(preset.rounds);

  const [sound, setSound] = useState(true);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("stretch");
  const [roundIndex, setRoundIndex] = useState(1);
  const [phaseMsLeft, setPhaseMsLeft] = useState(stretchSec * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Apply preset
  useEffect(() => {
    if (presetId === "custom") return;
    setStretchSec(preset.stretchSec);
    setRestSec(preset.restSec);
    setRounds(preset.rounds);
  }, [presetId, preset]);

  // Reset when values change
  useEffect(() => {
    setRunning(false);
    setPhase("stretch");
    setRoundIndex(1);
    setPhaseMsLeft(stretchSec * 1000);
    endRef.current = null;
  }, [stretchSec, restSec, rounds]);

  function phaseDurationMs(p: Phase) {
    return (p === "stretch" ? stretchSec : restSec) * 1000;
  }

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + phaseMsLeft;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setPhaseMsLeft(rem);

      if (rem <= 0) {
        // phase transition
        if (phase === "stretch") {
          if (restSec > 0) {
            setPhase("rest");
            const ms = phaseDurationMs("rest");
            setPhaseMsLeft(ms);
            endRef.current = performance.now() + ms;
            if (sound) beep(520, 110, 0.07);
          } else {
            // no rest: advance round
            const nextRound = roundIndex + 1;
            if (nextRound > rounds) {
              setRunning(false);
              endRef.current = null;
              if (sound) beep(660, 220, 0.08);
              return;
            }
            setRoundIndex(nextRound);
            setPhase("stretch");
            const ms = phaseDurationMs("stretch");
            setPhaseMsLeft(ms);
            endRef.current = performance.now() + ms;
            if (sound) beep(740, 110, 0.07);
          }
        } else {
          // rest -> next stretch round
          const nextRound = roundIndex + 1;
          if (nextRound > rounds) {
            setRunning(false);
            endRef.current = null;
            if (sound) beep(660, 220, 0.08);
            return;
          }
          setRoundIndex(nextRound);
          setPhase("stretch");
          const ms = phaseDurationMs("stretch");
          setPhaseMsLeft(ms);
          endRef.current = performance.now() + ms;
          if (sound) beep(740, 110, 0.07);
        }
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
    roundIndex,
    rounds,
    stretchSec,
    restSec,
    sound,
    beep,
  ]);

  function startPause() {
    setRunning((r) => !r);
    endRef.current = null;
  }

  function reset() {
    setRunning(false);
    setPhase("stretch");
    setRoundIndex(1);
    setPhaseMsLeft(stretchSec * 1000);
    endRef.current = null;
  }

  function skipPhase() {
    // Force phase to end quickly
    setPhaseMsLeft(0);
    endRef.current = performance.now();
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "n") {
      if (running) skipPhase();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (e.key.toLowerCase() === "s") {
      setSound((x) => !x);
    }
  };

  const label = phase === "stretch" ? "Stretch" : "Rest";
  const phaseColor =
    phase === "stretch"
      ? "border-amber-300 bg-amber-50 text-amber-950"
      : "border-slate-300 bg-slate-50 text-slate-900";

  const shown = msToClock(Math.ceil(phaseMsLeft / 1000) * 1000);

  const totalRoundsText = `${roundIndex} / ${rounds}`;
  const presetNote = preset.note;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Stretch Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A <strong>mobility timer</strong> and{" "}
            <strong>yoga stretch timer</strong> for stretch + rest intervals.
            Simple, readable, and built for fullscreen.
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

      {/* Preset + settings */}
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
          <div className="mt-1 text-xs text-slate-600">{presetNote}</div>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Stretch (seconds)
          <input
            type="number"
            min={10}
            max={600}
            value={stretchSec}
            onChange={(e) =>
              setStretchSec(clamp(Number(e.target.value || 10), 10, 600))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Rest (seconds)
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
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block text-sm font-semibold text-amber-950">
          Rounds
          <input
            type="number"
            min={1}
            max={100}
            value={rounds}
            onChange={(e) =>
              setRounds(clamp(Number(e.target.value || 1), 1, 100))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            Total time ≈{" "}
            <strong>
              {Math.round(((stretchSec + restSec) * rounds) / 60)} minutes
            </strong>{" "}
            (approx).
          </div>
        </label>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
          <Btn kind="ghost" onClick={skipPhase} disabled={!running}>
            Next
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${phaseColor}`}
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

              [data-fs-container]:fullscreen .fs-phase{
                font: 900 clamp(40px, 6vw, 90px)/1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.02em;
                text-align:center;
                text-transform:uppercase;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(90px, 16vw, 220px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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
          style={{ minHeight: 280 }}
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Round {totalRoundsText}
            </div>
            <div className="text-2xl font-extrabold">{label}</div>
            <div className="font-mono text-7xl font-extrabold tracking-widest sm:text-8xl">
              {shown}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-700">
              Stretch {stretchSec}s · Rest {restSec}s · Rounds {rounds}
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-phase">{label}</div>
            <div className="fs-time">{shown}</div>
            <div className="fs-sub">
              Round {totalRoundsText} · {stretchSec}s stretch · {restSec}s rest
            </div>
            <div className="fs-sub">
              Space start/pause · N next · R reset · F fullscreen · S sound
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · N next · R reset · F fullscreen · S
          sound
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>

      {/* Safety note */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold text-amber-950">Note</div>
        <p className="mt-2 leading-relaxed">
          Stretch gently and stay within a comfortable range. If you feel pain,
          stop. This timer is a simple pacing tool, not medical advice.
        </p>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function StretchTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/stretch-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Stretch Timer",
        url,
        description:
          "Stretch timer for mobility and yoga stretching with stretch/rest intervals, rounds, presets, and fullscreen.",
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
            name: "Stretch Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a stretch timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A stretch timer helps you hold stretches for a set time and optionally rest between holds, often in rounds.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use this as a mobility timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Choose a preset like 45 seconds stretch and 15 seconds rest, then run multiple rounds to cycle through movements.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use this as a yoga stretch timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use longer stretch holds like 60 to 90 seconds and short rests between positions.",
            },
          },
          {
            "@type": "Question",
            name: "Does it keep running if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It runs while the page is open. Some browsers may reduce update frequency in background tabs.",
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
            / <span className="text-amber-950">Stretch Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Stretch Timer (Mobility + Yoga Stretch Holds)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>stretch timer</strong> for mobility routines and
            yoga stretching. Set stretch/rest intervals, pick rounds, and go
            fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <StretchTimerCard />
      </section>

      {/* Menu Links (before RelatedSites) */}
      <TimerMenuLinks />

      {/* Related Sites */}
      <RelatedSites
        contextTags={["fitness", "habits", "focus", "productivity"]}
        title="More tools for routines and consistency"
        subtitle="A small set of related sites that fit this page."
      />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free stretch timer for mobility and yoga stretching
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>stretch timer</strong> helps you hold a stretch for a
              set amount of time and optionally rest before the next hold. This
              is useful for mobility warmups, cooldown routines, and yoga
              stretch sessions.
            </p>

            <p>
              For a quick mobility circuit, try{" "}
              <strong>45 seconds stretch</strong> and{" "}
              <strong>15 seconds rest</strong>. For deeper holds, try{" "}
              <strong>60 to 90 seconds</strong> with a short rest between
              positions.
            </p>

            <p>
              Want a more general interval tool? Use{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT / Interval Timer
              </Link>
              . For strict rest counting, try{" "}
              <Link to="/rest-timer" className="font-semibold hover:underline">
                Rest Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Stretch Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a mobility timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A mobility timer is used to time mobility movements and holds in
              intervals, often with short rests between moves.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How long should I hold a stretch?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many routines use 30 to 60 seconds. Deeper holds often use 60 to
              90 seconds, depending on comfort and experience.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I skip to the next stretch/rest phase?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use the <strong>Next</strong> button (or press{" "}
              <strong>N</strong>) while running.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it keep running if I close the tab?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It runs while the page is open. Some browsers may reduce update
              frequency in background tabs.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
