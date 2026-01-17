// app/routes/event-countdown.tsx
import type { Route } from "./+types/event-countdown";
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
    "Event Countdown | Countdown to Date & Time (Online, Fullscreen)";
  const description =
    "Free event countdown. Count down to a specific date and time with big fullscreen display, optional sound, and simple controls. Also supports a duration-based workaround if your browser blocks exact scheduling.";
  const url = "https://ilovetimers.com/event-countdown";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "event countdown",
        "countdown to date",
        "countdown to time",
        "countdown to a date",
        "date countdown timer",
        "countdown clock",
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

function msToLong(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0) return `${days}d ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
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

function toLocalInputValue(d: Date) {
  // "YYYY-MM-DDTHH:mm" in local time
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hour = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${min}`;
}

function parseLocalDateTime(value: string) {
  // value is "YYYY-MM-DDTHH:mm" from <input type="datetime-local">
  // Date(value) treats it as local in most browsers. We'll construct explicitly.
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;

  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(mo) ||
    !Number.isFinite(d) ||
    !Number.isFinite(h) ||
    !Number.isFinite(mi)
  ) {
    return null;
  }

  const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

// WebAudio beep (same style as other pages)
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 160, gain = 0.1) => {
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
   EVENT COUNTDOWN CARD
   - Count down to a specific local date/time
   - Honest "page must stay open" note
   - Also includes duration-based workaround (copy minutes to Countdown Timer)
========================================================= */
function EventCountdownCard() {
  const beep = useBeep();

  const [eventName, setEventName] = useState("My Event");
  const [targetValue, setTargetValue] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );

  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [remaining, setRemaining] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "counting" | "past" | "done">(
    "idle",
  );

  const rafRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const targetDate = useMemo(
    () => parseLocalDateTime(targetValue),
    [targetValue],
  );

  const computeRemaining = useCallback(() => {
    if (!targetDate) return 0;
    return Math.max(0, targetDate.getTime() - Date.now());
  }, [targetDate]);

  // Initialize remaining when target changes (and stop running)
  useEffect(() => {
    setRunning(false);
    lastBeepSecondRef.current = null;

    if (!targetDate) {
      setRemaining(0);
      setStatus("idle");
      return;
    }

    const ms = targetDate.getTime() - Date.now();
    if (ms <= 0) {
      setRemaining(0);
      setStatus("past");
    } else {
      setRemaining(ms);
      setStatus("idle");
    }
  }, [targetDate]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    const tick = () => {
      const rem = computeRemaining();
      setRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110, 0.09);
        }
      }

      if (rem <= 0) {
        setRunning(false);
        setStatus("done");
        lastBeepSecondRef.current = null;
        if (sound) beep(660, 240, 0.12);
        return;
      }

      setStatus("counting");
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, computeRemaining, sound, finalCountdownBeeps, beep]);

  function startPause() {
    if (!targetDate) return;
    const ms = targetDate.getTime() - Date.now();
    if (ms <= 0) {
      setStatus("past");
      setRemaining(0);
      return;
    }
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function reset() {
    setRunning(false);
    lastBeepSecondRef.current = null;

    const ms = computeRemaining();
    setRemaining(ms);
    setStatus(ms > 0 ? "idle" : "past");
  }

  function setPresetHours(h: number) {
    const d = new Date(Date.now() + h * 60 * 60 * 1000);
    setTargetValue(toLocalInputValue(d));
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
  const shownShort = msToClock(Math.ceil(remaining / 1000) * 1000);
  const shownLong = msToLong(remaining);

  const readableTarget = targetDate
    ? targetDate.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const durationWorkaroundMinutes = Math.max(1, Math.ceil(remaining / 60000));

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Event Countdown
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A live <strong>countdown to date</strong> and{" "}
            <strong>countdown to time</strong>. Choose a date/time and run a big
            fullscreen countdown to your event.
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

      {/* Inputs */}
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Event name
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="My Event"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Date & time (local)
          <input
            type="datetime-local"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            Uses your device’s local time.
          </div>
        </label>

        <div className="flex flex-wrap items-end gap-2">
          <Btn onClick={startPause} disabled={!targetDate}>
            {running ? "Pause" : "Start"}
          </Btn>
          <Btn kind="ghost" onClick={reset} disabled={!targetDate}>
            Refresh
          </Btn>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPresetHours(1)}
              className="cursor-pointer rounded-full bg-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-950 hover:bg-amber-400"
              title="Set target to 1 hour from now"
            >
              +1h
            </button>
            <button
              type="button"
              onClick={() => setPresetHours(2)}
              className="cursor-pointer rounded-full bg-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-950 hover:bg-amber-400"
              title="Set target to 2 hours from now"
            >
              +2h
            </button>
            <button
              type="button"
              onClick={() => setPresetHours(24)}
              className="cursor-pointer rounded-full bg-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-950 hover:bg-amber-400"
              title="Set target to 24 hours from now"
            >
              +24h
            </button>
          </div>
        </div>
      </div>

      {/* Status line */}
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        {!targetDate ? (
          <div className="text-sm font-semibold text-amber-950">
            Pick a valid date and time to start the event countdown.
          </div>
        ) : status === "past" ? (
          <div className="text-sm font-semibold text-rose-900">
            That date/time is in the past. Pick a future date/time.
          </div>
        ) : status === "done" ? (
          <div className="text-sm font-semibold text-emerald-900">
            {eventName || "Event"} reached. Countdown finished.
          </div>
        ) : (
          <div className="text-sm font-semibold text-amber-950">
            Counting down to{" "}
            <span className="font-extrabold">{eventName || "your event"}</span>{" "}
            <span className="text-slate-700">({readableTarget})</span>
          </div>
        )}

        {/* Workaround line (captures intent even if user wants duration-only) */}
        {targetDate && remaining > 0 ? (
          <div className="mt-2 text-sm text-amber-900">
            Need a duration-only timer instead? Use{" "}
            <strong>{durationWorkaroundMinutes} minutes</strong> on the{" "}
            <Link
              to="/countdown-timer"
              className="font-semibold hover:underline"
            >
              Countdown Timer
            </Link>{" "}
            page.
          </div>
        ) : null}
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
                width:min(1500px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:20px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 22px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(88px, 16vw, 220px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.08em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
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
          style={{ minHeight: 260 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {eventName || "Event countdown"}
            </div>

            <div className="flex w-full items-center justify-center font-mono font-extrabold tracking-widest">
              <span className="text-6xl sm:text-7xl md:text-8xl">
                {shownShort}
              </span>
            </div>

            <div className="text-sm font-semibold text-slate-700">
              {shownLong}
            </div>

            <div className="text-xs text-slate-600">
              Space start/pause · R refresh · F fullscreen
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">{eventName || "Event Countdown"}</div>
            <div className="fs-time">{shownLong}</div>
            {targetDate ? (
              <div className="fs-sub">Target: {readableTarget}</div>
            ) : null}
            <div className="fs-help">
              Space start/pause · R refresh · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Honest limitation block */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-sm font-extrabold text-amber-950">
          Important: this countdown runs while the page is open
        </div>
        <div className="mt-2 space-y-2 text-sm text-amber-900">
          <p>
            Browsers do not guarantee background timers if you close the tab,
            quit the browser, or your device suspends the page. This event
            countdown is meant for a screen that stays on (like a laptop,
            smartboard, or projector).
          </p>
          <p>
            If you need a guaranteed alarm when the browser is closed, use your
            phone’s alarm clock.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function EventCountdownPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/event-countdown";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Event Countdown",
        url,
        description:
          "Event countdown that counts down to a specific date and time. Big fullscreen display, optional sound, and simple controls. Includes a duration-based workaround.",
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
            name: "Event Countdown",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is an event countdown?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "An event countdown is a timer that counts down to a specific date and time, like a birthday, meeting, launch, or holiday.",
            },
          },
          {
            "@type": "Question",
            name: "How do I count down to a date and time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Enter the target date and time (local), then press Start. The timer updates in real time and shows the remaining time until the target.",
            },
          },
          {
            "@type": "Question",
            name: "What if I only need a duration-based workaround?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "If you don’t want an absolute date, you can use the regular Countdown Timer. This page shows the remaining time in minutes so you can copy that duration into a simple countdown.",
            },
          },
          {
            "@type": "Question",
            name: "Will the countdown keep running if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Browsers can pause or throttle timers when a tab is closed, the browser is quit, or the device sleeps. This is designed to run while the page stays open on screen.",
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
            / <span className="text-amber-950">Event Countdown</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Event Countdown (Countdown to Date & Time)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>event countdown</strong> for a screen. Count down to
            a specific <strong>date</strong> and <strong>time</strong>, then
            show it fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <EventCountdownCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Countdown to date and time
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Set an exact target time for meetings, launches, classroom
              deadlines, or events. The countdown updates live based on the
              current clock.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen for displays
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen is designed for projectors and TVs, with big text and
              minimal clutter.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Duration-based workaround
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              If you don’t want absolute dates, use the remaining minutes shown
              here and run a normal{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>{" "}
              instead.
            </p>
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
            Free event countdown: countdown to a date and time online
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>event countdown</strong> is built for exact targets:
              a <strong>countdown to date</strong> and{" "}
              <strong>countdown to time</strong>. Pick when your event starts
              and show the remaining time on a screen.
            </p>

            <p>
              If you’re running this on a projector, classroom display, or
              second monitor, use Fullscreen. The layout is intentionally
              simple, with large digits and minimal distractions.
            </p>

            <p>
              Don’t need absolute dates? Use the duration-based workaround: look
              at the remaining minutes and start a normal countdown on{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              .
            </p>

            <p>
              Browser reality check: this is designed to work while the page is
              open. Closing the tab, quitting the browser, or letting your
              device sleep can pause timers and prevent alarms.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Event countdown
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Count down to a specific moment.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Countdown to date
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Set a target day and time (local).
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Countdown to time
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Big fullscreen display for screens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Event Countdown FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I count down to a specific date and time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Choose a date/time in the picker (local time), then press Start.
              The countdown updates live until it reaches zero.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What if the date/time picker isn’t what I want?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Use the duration workaround: take the remaining minutes shown on
              this page and run a standard countdown instead.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Will it keep counting if I close the tab?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. Browsers can pause or throttle background tabs, and closing
              the tab stops the page completely. This is built to run on a
              screen that stays open.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use it in fullscreen for a projector?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click Fullscreen (or press <strong>F</strong>) for big
              high-contrast text.
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
