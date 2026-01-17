// app/routes/meeting-timer.tsx
import type { Route } from "./+types/meeting-timer";
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
    "Meeting Timer | Agenda Timer for Meetings (Fullscreen, Simple, Visible)";
  const description =
    "Free meeting timer for teams and agendas. Big fullscreen countdown, quick presets, custom minutes, optional sound, and keyboard shortcuts. Great for keeping meeting sections on time.";
  const url = "https://ilovetimers.com/meeting-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "meeting timer",
        "agenda timer",
        "timer for meetings",
        "timebox timer",
        "standup timer",
        "scrum meeting timer",
        "fullscreen timer",
        "countdown timer for meetings",
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
   MEETING TIMER CARD
========================================================= */
function MeetingTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 60],
    [],
  );

  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }, [minutes]);

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

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        if (sound) beep(660, 220);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, remaining, sound, finalCountdownBeeps, beep]);

  function reset() {
    setRunning(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
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
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Meeting Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Keep agenda items on time. Big digits, quick presets, fullscreen,
            sound optional, and keyboard shortcuts.
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
            max={180}
            value={minutes}
            onChange={(e) =>
              setMinutes(clamp(Number(e.target.value || 1), 1, 180))
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
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          urgent
            ? "border-rose-300 bg-rose-50 text-rose-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
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
            <div className="fs-label">Meeting Timer</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Space start/pause · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen
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
export default function MeetingTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/meeting-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Meeting Timer",
        url,
        description:
          "Fullscreen meeting timer for agendas and timeboxing. Big countdown, presets, optional sound, and keyboard shortcuts.",
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
            name: "Meeting Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a meeting timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A meeting timer is a countdown clock used to timebox agenda items so meetings stay on schedule. It is often displayed on a shared screen or projector so everyone can see the remaining time.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen for meetings?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen (or press F) while the timer card is focused. Fullscreen mode shows a clean dark background and very large digits for easy visibility.",
            },
          },
          {
            "@type": "Question",
            name: "Can I turn sound off?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toggle Sound off for quiet rooms. The timer still runs normally and the countdown stays visible.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts/pauses, R resets, and F toggles fullscreen while the card is focused.",
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
            / <span className="text-amber-950">Meeting Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Meeting Timer
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>meeting timer</strong> for agenda timeboxing with
            presets and a true fullscreen view. Built for shared-screen
            visibility and simple control.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <MeetingTimerCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Timebox agenda items
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Set a time per topic, start the countdown, and reset between
              sections. It keeps meetings from drifting.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Common meeting presets
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Try <strong>5–10 minutes</strong> for updates,{" "}
              <strong>12–15</strong> for discussion blocks, and{" "}
              <strong>20–30</strong> for deep dives.
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
            Free meeting timer for agendas, standups, and timeboxing
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>meeting timer</strong> is a simple{" "}
              <strong>agenda timer</strong> designed to keep meetings on track.
              Choose a time for each agenda item, press Start, and keep the
              countdown visible on a shared screen so everyone knows how much
              time is left.
            </p>

            <p>
              Use the preset buttons for common timeboxes, or enter custom
              minutes for your agenda. Fullscreen mode is intentionally plain: a
              dark background and very large digits for long-distance
              visibility.
            </p>

            <p>
              If you want a general tool, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For silent rooms, keep Sound off. For structured work and break
              blocks, use{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>{" "}
              or{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Agenda timer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Assign a timebox per topic and reset between sections to stay on
                schedule.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Standups and check-ins
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Use 1–3 minutes per person, or 5–10 for a fast round of updates.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Shared screen friendly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Fullscreen keeps the timer readable without distracting UI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Meeting Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a meeting timer or an agenda timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Both. It is a large countdown designed for meetings where you want
              clear timeboxes per agenda item.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use it for a standup?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Pick a preset like 1–3 minutes, press Start, and reset between
              speakers. Fullscreen works well on a shared screen.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I turn sound off?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle <strong>Sound</strong> off for quiet rooms.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause • <strong>R</strong> reset •{" "}
              <strong>F</strong> fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 i💛Timers - free countdown, stopwatch, Pomodoro, and HIIT
          interval timers
        </div>
      </footer>
    </main>
  );
}
