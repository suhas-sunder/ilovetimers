// app/routes/silent-timer.tsx
import type { Route } from "./+types/silent-timer";
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
    "Silent Timer | Free No Sound Timer (Quiet Countdown) with Fullscreen and Shortcuts";
  const description =
    "Free silent timer and quiet countdown. Turn Sound off for a no sound timer in classrooms, exams, libraries, or meetings. Presets, custom input, loop, fullscreen, and keyboard shortcuts.";
  const url = "https://ilovetimers.com/silent-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "silent timer",
        "no sound timer",
        "quiet countdown",
        "silent countdown timer",
        "mute timer",
        "timer without sound",
        "silent classroom timer",
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
   SILENT COUNTDOWN TOOL
========================================================= */
function SilentCountdownCard() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);
  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );

  // Default to silent for this page
  const [sound, setSound] = useState(false);
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
            Silent Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A <strong>quiet countdown</strong> for libraries, exams, meetings,
            and classrooms. Sound is off by default.
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
        className={`mt-6 rounded-2xl border-2 p-6 ${
          urgent
            ? "border-rose-200 bg-rose-50 text-rose-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 220 }}
        aria-live="polite"
      >
        <div className="flex items-baseline justify-between gap-3">
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
          <span className="text-6xl sm:text-7xl md:text-8xl leading-none">
            {msToClock(remainingMs)}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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

        <div className="mt-6 mx-auto grid w-full max-w-3xl gap-3 md:grid-cols-[1fr_auto_auto]">
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

        <div className="mt-5 rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs font-semibold text-amber-950 text-center">
          Shortcuts: Space start/pause · R reset · F fullscreen
        </div>

        {!sound && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
            Silent mode is ON. Turn <strong>Sound</strong> on if you want an
            alarm at 0.
          </div>
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function SilentTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/silent-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Silent Timer",
        url,
        description:
          "Free silent timer and quiet countdown. Turn Sound off for a no sound timer. Presets, custom input, loop, fullscreen, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Silent Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I make the timer silent (no sound)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Turn the Sound toggle off. This disables the end-of-timer beep so the countdown stays quiet.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a silent countdown for exams or libraries?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Sound is off by default on this page, making it suitable for quiet rooms, tests, meetings, and study halls.",
            },
          },
          {
            "@type": "Question",
            name: "Can I still use fullscreen in silent mode?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Fullscreen or press F while the timer card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "Can I loop a quiet countdown?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Turn on Loop to repeat the countdown automatically, while keeping Sound off for silence.",
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
            / <span className="text-amber-950">Silent Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Silent Timer (No Sound Countdown)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>silent timer</strong> for quiet spaces. Sound is off by
            default. Need audio later? Turn <strong>Sound</strong> on anytime.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <SilentCountdownCard />

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              How to turn sound off
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use the <strong>Sound</strong> toggle at the top of the timer
              card. When it’s off, the timer reaches 0 without any beep.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Quiet countdown use cases
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Ideal for exams, libraries, meetings, meditation, study halls, and
              classrooms where noise is distracting.
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

      {/* Shared menu */}
      <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section (under TimerMenuLinks) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Silent timer and quiet countdown (no sound)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              If you need a <strong>silent timer</strong>, you usually want two
              things: a clear countdown you can see from a distance, and a
              guarantee it will not make noise. This page is a{" "}
              <strong>no sound timer</strong> by default, which makes it a good
              fit for exams, libraries, meetings, and quiet classrooms.
            </p>

            <p>
              To keep the countdown quiet, turn <strong>Sound</strong> off. When
              Sound is off, the timer will reach zero without any beep. If you
              want the alert back, just toggle Sound on again.
            </p>

            <p>
              You can still use all the features: presets for fast starts,
              custom input for exact durations, optional <strong>Loop</strong>{" "}
              to repeat the same countdown, and <strong>Fullscreen</strong> for
              projector use. Control it quickly with the keyboard after clicking
              the timer once to focus it.
            </p>

            <p>
              Looking for a specific style? Try{" "}
              <Link
                to="/fullscreen-timer"
                className="font-semibold hover:underline"
              >
                Fullscreen Timer
              </Link>{" "}
              for projector displays,{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>{" "}
              for the standard countdown page, or{" "}
              <Link
                to="/pomodoro-timer"
                className="font-semibold hover:underline"
              >
                Pomodoro Timer
              </Link>{" "}
              for study and focus cycles.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Quiet by default
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Sound starts OFF so you get a true quiet countdown with no
                surprise beep.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Easy sound control
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Turn Sound off for silence, or on if you want an alarm at zero.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Fullscreen ready
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Use fullscreen for projectors without adding noise to the room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Silent Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I turn the sound off?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Use the <strong>Sound</strong> toggle at the top of the timer
              card. When it’s off, there’s no beep at zero.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a “no sound timer” even in fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Fullscreen only changes the display size. Sound stays off as
              long as the Sound toggle is off.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I still loop a silent countdown?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Turn on <strong>Loop</strong> to repeat automatically while
              keeping Sound off.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What shortcuts work on this page?
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
