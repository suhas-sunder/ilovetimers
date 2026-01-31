// app/routes/online-timer.tsx
import type { Route } from "./+types/online-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Timer (Free Countdown)";
  const description =
    "Start a free online countdown timer instantly. Big, clear display with quick presets and fullscreen mode, perfect for classrooms, presentations, and everyday timing.";

  const url = "https://ilovetimers.com/online-timer";

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
  // Prefer the "display box" inside the card if it exists
  const target =
    (el.querySelector?.("[data-fullscreen-root]") as HTMLElement | null) ?? el;

  if (!document.fullscreenElement) {
    await target.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
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

const Chip = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
    }`}
  >
    {children}
  </button>
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   ONLINE TIMER TOOL (broad intent = safe default countdown)
========================================================= */
function OnlineTimerCard() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);
  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );

  const [sound, setSound] = useState(true);
  const [loop, setLoop] = useState(false);
  const [inputStr, setInputStr] = useState("05:00");

  const displayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setInputStr(msToClock(durationMs));
  }, [durationMs]);

  useEffect(() => {
    if (status !== "running") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endTimeRef.current = null;
      return;
    }

    if (!endTimeRef.current) {
      endTimeRef.current = performance.now() + remainingMs;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endTimeRef.current ?? now) - now);
      setRemainingMs(rem);

      if (rem <= 0) {
        if (sound) beep();
        if (loop) {
          endTimeRef.current = performance.now() + durationMs;
          setRemainingMs(durationMs);
        } else {
          setStatus("done");
          endTimeRef.current = null;
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endTimeRef.current = null;
    };
  }, [status, durationMs, remainingMs, loop, sound, beep]);

  function safeReset(to?: number) {
    const ms = to ?? durationMs;
    setDurationMs(ms);
    setRemainingMs(ms);
    setStatus("idle");
    endTimeRef.current = null;
  }

  function parseInputToMs(str: string) {
    const parts = str
      .trim()
      .split(":")
      .map((p) => p.trim());
    let ms = 0;

    if (parts.length === 1) {
      const n = Number(parts[0] || "0");
      ms = n * 1000;
    } else if (parts.length === 2) {
      const m = Number(parts[0] || "0");
      const s = Number(parts[1] || "0");
      ms = (m * 60 + s) * 1000;
    } else {
      const h = Number(parts[0] || "0");
      const m = Number(parts[1] || "0");
      const s = Number(parts[2] || "0");
      ms = (h * 3600 + m * 60 + s) * 1000;
    }

    return clamp(ms, 0, 24 * 3600 * 1000);
  }

  function onSet() {
    const ms = parseInputToMs(inputStr);
    safeReset(ms);
  }

  const onPreset = (m: number) => safeReset(m * 60 * 1000);

  const onStartPause = () => {
    if (status === "running") {
      setStatus("paused");
      return;
    }
    if (status === "done") {
      setRemainingMs(durationMs);
      setStatus("running");
      return;
    }
    if (remainingMs <= 0) setRemainingMs(durationMs);
    setStatus("running");
  };

  const onReset = () => safeReset();

  const urgent =
    status === "running" && remainingMs > 0 && remainingMs <= 10_000;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (e.key.toLowerCase() === "r") {
      onReset();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Online Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A simple, reliable <strong>online timer</strong>. Pick a preset, set
            a custom time, go fullscreen, and control it by keyboard.
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
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            Loop
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              displayRef.current && toggleFullscreen(displayRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      <div
        ref={displayRef}
        data-fullscreen-root
        className={`mt-6 rounded-2xl border-2 p-6 ${
          urgent
            ? "border-rose-200 bg-rose-50 text-rose-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 220 }}
        aria-live="polite"
      >
        {/* Fullscreen polish: center + scale + clean background */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
        /* Make fullscreen look intentional (centered, huge digits, no "shabby" padding) */
        :fullscreen[data-fullscreen-root]{
          margin:0 !important;
          padding:0 !important;
          border:none !important;
          border-radius:0 !important;
          width:100vw !important;
          height:100vh !important;
          display:flex !important;
          flex-direction:column !important;
          align-items:center !important;
          justify-content:center !important;
          background:#0b0b0c !important; /* deep neutral */
          color:#ffffff !important;
        }

        /* Hide small UI chrome in fullscreen */
        :fullscreen [data-fs-hide]{
          display:none !important;
        }

        /* Big, centered time in fullscreen */
        :fullscreen [data-fs-time]{
          font-size: clamp(64px, 18vw, 220px) !important;
          line-height: 1 !important;
          letter-spacing: 0.08em !important;
          text-align:center !important;
          font-weight: 900 !important;
          width: 100% !important;
        }

        /* Secondary line under timer (optional) */
        :fullscreen [data-fs-sub]{
          margin-top: 16px !important;
          font-size: clamp(14px, 3vw, 28px) !important;
          opacity: 0.85 !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em !important;
          text-transform: uppercase !important;
        }
      `,
          }}
        />

        <div className="flex items-baseline justify-between gap-3" data-fs-hide>
          <div className="text-sm font-extrabold uppercase tracking-wide opacity-95">
            Countdown
          </div>
          <div className="text-sm font-semibold opacity-95">
            {status === "running"
              ? "Running"
              : status === "paused"
                ? "Paused"
                : status === "done"
                  ? "Done"
                  : "Ready"}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center font-mono font-extrabold tracking-widest">
          <span
            className="text-6xl sm:text-7xl md:text-8xl leading-none"
            data-fs-time
          >
            {msToClock(remainingMs)}
          </span>
        </div>

        {/* Optional: tiny label in fullscreen only (kept hidden in normal view by being empty-ish) */}
        <div data-fs-sub className="hidden">
          {/* This node exists for fullscreen styling; leave it empty or add text if you want */}
        </div>

        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
          data-fs-hide
        >
          {presets.map((m) => (
            <Chip
              key={m}
              active={durationMs === m * 60 * 1000 && status !== "running"}
              onClick={() => onPreset(m)}
            >
              {m}m
            </Chip>
          ))}
        </div>

        <div
          className="mt-6 mx-auto grid w-full max-w-3xl gap-3 md:grid-cols-[1fr_auto_auto]"
          data-fs-hide
        >
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              value={inputStr}
              onChange={(e) => {
                if (status === "running") setStatus("paused");
                setInputStr(e.target.value);
              }}
              onBlur={onSet}
              placeholder="mm:ss or ss"
              className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Btn kind="ghost" onClick={onSet}>
              Set
            </Btn>
          </div>

          <Btn onClick={onStartPause}>
            {status === "running"
              ? "Pause"
              : status === "done"
                ? "Restart"
                : "Start"}
          </Btn>

          <Btn kind="ghost" onClick={onReset}>
            Reset
          </Btn>
        </div>

        <div
          className="mt-5 rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs font-semibold text-amber-950 text-center"
          data-fs-hide
        >
          Shortcuts: Space start/pause · R reset · F fullscreen
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function OnlineTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/online-timer";

  /* =========================
   JSON-LD (update)
========================= */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Online Timer",
        url,
        description:
          "Free online timer website with a fast countdown timer: presets, custom input, loop mode, sound toggle, fullscreen, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Online Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I set a timer for 10 minutes (or any duration)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Choose a preset like 10m, or type a custom time using mm:ss (like 10:00) or h:mm:ss (like 1:00:00), then press Set and Start.",
            },
          },
          {
            "@type": "Question",
            name: "Can I set a 1 minute timer, 2 minute timer, or 5 minute timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the preset chips for common times, or type your own duration (for example 1:00, 2:00, or 5:00) and press Set.",
            },
          },
          {
            "@type": "Question",
            name: "Can I set a timer for seconds (like 10 seconds or 30 seconds)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Type seconds directly (like 10 or 30) or use mm:ss (like 0:10 or 0:30), then press Set and Start.",
            },
          },
          {
            "@type": "Question",
            name: "Does this online timer work on phones and laptops?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The timer is responsive and works on phones, tablets, laptops, and desktops.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use this timer fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Fullscreen or press F while the timer card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "Can I turn sound off or loop the timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toggle Sound off to run silently. Enable Loop to repeat the same countdown automatically.",
            },
          },
          {
            "@type": "Question",
            name: "What keyboard shortcuts are supported?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space starts or pauses, R resets, and F toggles fullscreen (when the timer card is focused).",
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
            / <span className="text-amber-950">Online Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Online Timer (Timer Website)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A fast, clean <strong>timer website</strong> for everyday timing:
            presets, custom input, sound toggle, loop, fullscreen, and keyboard
            shortcuts.
          </p>
        </div>
      </section>
      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <OnlineTimerCard />

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Quick start</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Click a preset (like <strong>5m</strong>), then press{" "}
              <strong>Start</strong>. For an exact duration, type{" "}
              <strong>mm:ss</strong> and press <strong>Set</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Fullscreen</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              For projectors and shared screens, use fullscreen so the digits
              are readable from across the room.
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
      {/* SEO Section (broad intent, without spam) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Set a timer fast (minutes, seconds, or custom)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              If you searched for an <strong>online timer</strong>, a{" "}
              <strong>timer website</strong>, or something like{" "}
              <strong>set a timer for 10 minutes</strong>, this page is built
              for that exact job: pick a preset, press Start, and you are done.
            </p>

            <p>
              Popular timer settings people use daily include short bursts like
              a <strong>10 second timer</strong> or{" "}
              <strong>30 second timer</strong>, quick tasks like a{" "}
              <strong>1 minute timer</strong> and{" "}
              <strong>2 minute timer</strong>, and common work blocks like a{" "}
              <strong>5 minute timer</strong>, <strong>10 minute timer</strong>,{" "}
              <strong>15 minute timer</strong>, <strong>20 minute timer</strong>
              , <strong>25 minute timer</strong>, and{" "}
              <strong>30 minute timer</strong>. For longer sessions, use a{" "}
              <strong>40 minute timer</strong>, <strong>45 minute timer</strong>
              , or <strong>60 minute timer</strong>.
            </p>

            <p>
              Want something specific that is not in the chips? Type your own
              duration using <strong>mm:ss</strong> (like <strong>08:00</strong>
              ) or <strong>h:mm:ss</strong> (like <strong>1:15:00</strong>),
              then press <strong>Set</strong>. This is useful for exact requests
              such as a <strong>7 minute timer</strong>,{" "}
              <strong>12 minute timer</strong>, <strong>16 minute timer</strong>
              , or <strong>27 minute timer</strong>.
            </p>

            <p>
              Use <strong>Fullscreen</strong> for visibility on a projector or
              shared screen, and control everything by keyboard after clicking
              the card once:
              <strong> Space</strong> to start or pause, <strong>R</strong> to
              reset, and <strong>F</strong> for fullscreen. Toggle{" "}
              <strong>Sound</strong> off for a silent timer, or enable{" "}
              <strong>Loop</strong> for repeating intervals.
            </p>

            <p>
              Need a different tool? Try{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>{" "}
              for elapsed time and laps,{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro
              </Link>{" "}
              for focus cycles, or{" "}
              <Link to="/hiit-timer" className="font-semibold hover:underline">
                HIIT / Interval
              </Link>{" "}
              for work/rest rounds.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Quick presets
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                One tap for common picks like 1m, 5m, 10m, 15m, 20m, 30m, 45m,
                and 60m.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Exact durations
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Set any time you need with mm:ss or h:mm:ss, then press Set.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Presentation ready
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Fullscreen mode makes the digits readable across a room.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Online Timer FAQ</h2>

        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I set a timer for 10 minutes (or any duration)?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Choose a preset (like <strong>10m</strong>) or type a custom time
              using <strong>mm:ss</strong> (like <strong>10:00</strong>) or{" "}
              <strong>h:mm:ss</strong> (like <strong>1:00:00</strong>). Press{" "}
              <strong>Set</strong>, then press <strong>Start</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I set a 1 minute timer, 2 minute timer, or 5 minute timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use the preset chips for common times, or type your own
              duration (for example <strong>1:00</strong>, <strong>2:00</strong>
              , or <strong>5:00</strong>) and press <strong>Set</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I set a timer for seconds (like 10 seconds or 30 seconds)?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Type seconds directly (like <strong>10</strong> or{" "}
              <strong>30</strong>) or use <strong>mm:ss</strong> (like{" "}
              <strong>0:10</strong> or <strong>0:30</strong>). Press{" "}
              <strong>Set</strong>, then press <strong>Start</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this online timer work on phones and laptops?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. The timer is responsive and works on phones, tablets,
              laptops, and desktops.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use it fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the timer card is focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I turn sound off or loop the timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle <strong>Sound</strong> off to run silently. Enable{" "}
              <strong>Loop</strong> to repeat the same countdown automatically.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What shortcuts are supported?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause · <strong>R</strong> reset ·{" "}
              <strong>F</strong> fullscreen (when focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
