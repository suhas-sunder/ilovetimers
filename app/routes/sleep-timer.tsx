// app/routes/sleep-timer.tsx
import type { Route } from "./+types/sleep-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import TimerMenuLinks from "~/clients/components/navigation/TimerMenuLinks";
import RelatedSites from "~/clients/components/navigation/RelatedSites";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Sleep Timer | Online Sleep Timer + Screen Off Timer (Soft Alarm Optional)";
  const description =
    "Free sleep timer with a simple countdown and optional soft alarm. Includes screen-dim mode, fullscreen, presets, and honest browser limitations for keeping your screen off.";
  const url = "https://ilovetimers.com/sleep-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "sleep timer",
        "online sleep timer",
        "screen off timer",
        "sleep timer online",
        "bedtime timer",
        "soft alarm timer",
        "countdown sleep timer",
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

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

/* WebAudio beep (soft chime-ish) */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 523.25, duration = 180, gain = 0.06) => {
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
   SLEEP TIMER CARD
========================================================= */
function SleepTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [5, 10, 15, 20, 30, 45, 60, 90, 120], []);
  const [minutes, setMinutes] = useState(30);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [softAlarm, setSoftAlarm] = useState(true);

  const [dimMode, setDimMode] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    endRef.current = null;
  }, [minutes]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remaining;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);

        // Soft alarm: 3 gentle tones
        if (sound && softAlarm) {
          beep(523.25, 160, 0.05);
          window.setTimeout(() => beep(659.25, 160, 0.05), 260);
          window.setTimeout(() => beep(783.99, 200, 0.05), 520);
        } else if (sound) {
          // single beep
          beep(660, 220, 0.07);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, remaining, sound, softAlarm, beep]);

  function reset() {
    setRunning(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
  }

  function startPause() {
    setRunning((r) => !r);
  }

  function setPreset(m: number) {
    setMinutes(m);
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
    } else if (e.key.toLowerCase() === "d") {
      setDimMode((x) => !x);
    }
  };

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Sleep Timer</h2>
          <p className="mt-1 text-base text-slate-700">
            A simple <strong>online sleep timer</strong> with a countdown, dim
            mode, fullscreen, and an optional soft alarm.
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
              checked={softAlarm}
              onChange={(e) => setSoftAlarm(e.target.checked)}
              disabled={!sound}
            />
            Soft alarm
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={dimMode}
              onChange={(e) => setDimMode(e.target.checked)}
            />
            Dim mode
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

      {/* Presets + custom */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {presetsMin.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPreset(m)}
            className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
              m === minutes
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block text-sm font-semibold text-amber-950">
          Custom minutes
          <input
            type="number"
            min={1}
            max={360}
            value={minutes}
            onChange={(e) =>
              setMinutes(clamp(Number(e.target.value || 1), 1, 360))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 ${
          dimMode ? "bg-black text-white" : "bg-amber-50 text-amber-950"
        }`}
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
                background:#000000;
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
          style={{ minHeight: 260 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <div
              className={`text-xs font-extrabold uppercase tracking-widest ${dimMode ? "text-white/70" : "text-slate-700"}`}
            >
              Sleep countdown
            </div>
            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {shownTime}
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Sleep timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · R reset · F fullscreen · D dim
            </div>
          </div>
        </div>
      </div>

      {/* Honest browser disclosure */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold text-amber-950">
          About “screen off timer”
        </div>
        <p className="mt-2 leading-relaxed">
          Browsers cannot reliably turn your screen off. This page can{" "}
          <strong>dim the display</strong> (Dim mode) and run a countdown{" "}
          <strong>while the tab is open</strong>. Your device’s screen sleep and
          power settings still control actual screen-off behavior.
        </p>
      </div>

      {/* Shortcuts */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen · D dim
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
export default function SleepTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/sleep-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Sleep Timer",
        url,
        description:
          "Online sleep timer with countdown, dim mode, fullscreen, and optional soft alarm.",
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
          { "@type": "ListItem", position: 2, name: "Sleep Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a sleep timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A sleep timer is a countdown you start before sleep so something can stop, alert you, or help you keep track of time.",
            },
          },
          {
            "@type": "Question",
            name: "Can an online sleep timer turn my screen off?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Not reliably. Browsers cannot force the device screen to turn off. This page can dim the display and run while the tab is open, but your device power settings control screen-off behavior.",
            },
          },
          {
            "@type": "Question",
            name: "Does the timer keep running if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It runs while the page is open. Browsers may reduce timer update frequency in background tabs to save power.",
            },
          },
          {
            "@type": "Question",
            name: "What is a soft alarm?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A soft alarm uses gentle tones instead of a harsh beep. You can toggle it on or off.",
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
            / <span className="text-amber-950">Sleep Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Sleep Timer (Online + Dim Mode)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>sleep timer</strong> with presets, fullscreen, and{" "}
            <strong>dim mode</strong>. Includes an optional{" "}
            <strong>soft alarm</strong>.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <SleepTimerCard />
      </section>

      {/* Menu Links (before RelatedSites) */}
      <TimerMenuLinks />

      {/* Related Sites */}
      <RelatedSites
        contextTags={["calm", "meditation", "focus", "productivity"]}
        title="More calm and focus tools"
        subtitle="A small set of related sites that fit this page."
      />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free online sleep timer with a simple countdown
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>sleep timer</strong> is a countdown you start before
              bed. You can use it to time a relaxation routine, set a limit for
              a screen session, or run a gentle countdown while you fall asleep.
            </p>

            <p>
              If you searched for a <strong>screen off timer</strong>, here’s
              the honest part: web pages can’t force your device to turn the
              screen off. This page includes <strong>dim mode</strong> to reduce
              glare, but your operating system’s power settings control actual
              screen sleep.
            </p>

            <p>
              For quiet sessions, use{" "}
              <Link
                to="/silent-timer"
                className="font-semibold hover:underline"
              >
                Silent Timer
              </Link>
              . For guided calm breathing, use{" "}
              <Link
                to="/breathing-timer"
                className="font-semibold hover:underline"
              >
                Breathing Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Sleep Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can this act as a “screen off timer”?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Not directly. Browsers can’t reliably turn your screen off. Use
              Dim mode here, and set your device’s screen sleep settings for
              true screen-off behavior.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Will the timer still run in the background?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It runs while the page is open, but some browsers reduce update
              frequency in background tabs to save power.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a soft alarm?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It’s a gentle set of tones instead of a harsh beep. You can toggle
              it on or off.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What’s a good duration for a sleep timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Common choices are 20 to 45 minutes for winding down, or 60 to 90
              minutes if you want a longer cutoff.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
