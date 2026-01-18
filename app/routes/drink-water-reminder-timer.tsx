// app/routes/water-reminder-timer.tsx
import type { Route } from "./+types/drink-water-reminder-timer";
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
    "Water Reminder Timer | Drink Water Timer (Hydration Reminder, Simple)";
  const description =
    "Free drink water timer with repeating hydration reminders. Choose an interval, optional sound, fullscreen display, and a clear note about browser notification limitations.";
  const url = "https://ilovetimers.com/water-reminder-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "drink water timer",
        "water reminder timer",
        "hydration reminder timer",
        "drink water reminder",
        "hydration timer",
        "water timer",
        "water reminder online",
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

/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (freq = 740, duration = 120, gain = 0.08) => {
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
   WATER REMINDER TIMER CARD
========================================================= */
function WaterReminderTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [15, 20, 30, 45, 60, 90, 120], []);
  const [intervalMin, setIntervalMin] = useState(60);

  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);

  // We show "next reminder in" countdown
  const [remaining, setRemaining] = useState(intervalMin * 60 * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Simple counters for “streak” feeling
  const [remindersFired, setRemindersFired] = useState(0);
  const [startedAtISO, setStartedAtISO] = useState<string | null>(null);

  useEffect(() => {
    // changing interval resets the cycle
    setRunning(false);
    setRemaining(intervalMin * 60 * 1000);
    endRef.current = null;
    setRemindersFired(0);
    setStartedAtISO(null);
  }, [intervalMin]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      return;
    }

    if (!startedAtISO) setStartedAtISO(new Date().toISOString());

    if (!endRef.current) {
      endRef.current = performance.now() + remaining;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (rem <= 0) {
        // fire reminder
        setRemindersFired((n) => n + 1);

        if (sound) {
          // 2 quick beeps to feel like a reminder (not an alarm)
          beep(784, 110, 0.08);
          window.setTimeout(() => beep(659, 110, 0.08), 160);
        }

        // reset next cycle
        const next = intervalMin * 60 * 1000;
        setRemaining(next);
        endRef.current = performance.now() + next;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, remaining, intervalMin, sound, beep, startedAtISO]);

  function startPause() {
    setRunning((r) => !r);
    endRef.current = null;
  }

  function reset() {
    setRunning(false);
    setRemaining(intervalMin * 60 * 1000);
    endRef.current = null;
    setRemindersFired(0);
    setStartedAtISO(null);
  }

  function fireNow() {
    setRemindersFired((n) => n + 1);
    if (sound) {
      beep(784, 110, 0.08);
      window.setTimeout(() => beep(659, 110, 0.08), 160);
    }
    const next = intervalMin * 60 * 1000;
    setRemaining(next);
    endRef.current = performance.now() + next;
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
      // next reminder (fire now)
      if (running) fireNow();
    } else if (e.key.toLowerCase() === "s") {
      setSound((x) => !x);
    }
  };

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Water Reminder Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A simple <strong>drink water timer</strong> that repeats on an
            interval. Great for desk work and study sessions.
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

      {/* Presets */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {presetsMin.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setIntervalMin(m)}
            className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
              m === intervalMin
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      {/* Custom interval */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block text-sm font-semibold text-amber-950">
          Reminder interval (minutes)
          <input
            type="number"
            min={5}
            max={360}
            value={intervalMin}
            onChange={(e) =>
              setIntervalMin(clamp(Number(e.target.value || 5), 5, 360))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            Common choices: 30–60 minutes.
          </div>
        </label>

        <div className="flex items-end gap-3">
          <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
          <Btn kind="ghost" onClick={fireNow} disabled={!running}>
            Remind now
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
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
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Next reminder in
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {shownTime}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-slate-700">
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                Interval: {intervalMin}m
              </span>
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                Reminders: {remindersFired}
              </span>
            </div>

            <div className="mt-1 text-xs text-slate-600">
              Runs while the page is open. Background tabs may update less
              often.
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Drink water</div>
            <div className="fs-time">{shownTime}</div>
            <div className="fs-help">
              Interval {intervalMin}m · Reminders {remindersFired}
            </div>
            <div className="fs-help">
              Space start/pause · N remind now · R reset · F fullscreen · S
              sound
            </div>
          </div>
        </div>
      </div>

      {/* Honest limitation disclosure */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold text-amber-950">
          About “hydration reminders”
        </div>
        <p className="mt-2 leading-relaxed">
          This runs <strong>in your browser while the page is open</strong>. Web
          apps can’t reliably send reminders when the tab is closed, and some
          browsers reduce background timer updates to save battery. For the most
          consistent reminders, keep this tab open (fullscreen works great on a
          second monitor).
        </p>
      </div>

      {/* Shortcuts */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · N remind now · R reset · F fullscreen ·
          S sound
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
export default function WaterReminderTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/water-reminder-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Water Reminder Timer",
        url,
        description:
          "Drink water timer with repeating hydration reminders, optional sound, presets, and fullscreen mode.",
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
            name: "Water Reminder Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a drink water timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A drink water timer is a repeating countdown that reminds you to drink water on a set interval.",
            },
          },
          {
            "@type": "Question",
            name: "Will I still get reminders if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. This runs while the page is open. Some browsers also reduce background updates to save battery.",
            },
          },
          {
            "@type": "Question",
            name: "What’s a good hydration reminder interval?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Many people choose 30–60 minutes during desk work. You can adjust the interval based on your routine.",
            },
          },
          {
            "@type": "Question",
            name: "Can I trigger a reminder immediately?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the Remind now button (or press N while running).",
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
            / <span className="text-amber-950">Water Reminder Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Water Reminder Timer (Drink Water Timer)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>hydration reminder timer</strong> that repeats on a
            schedule. Set an interval, keep it open, and get gentle reminders.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <WaterReminderTimerCard />
      </section>

      {/* Menu Links (before RelatedSites) */}
      <TimerMenuLinks />

      {/* Related Sites */}
      <RelatedSites
        contextTags={["habits", "productivity", "focus", "learning"]}
        title="More tools for habits and consistency"
        subtitle="A small set of related sites that fit this page."
      />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free drink water timer and hydration reminder timer
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>drink water timer</strong> is a repeating countdown that
              helps you remember to drink water throughout the day. It’s useful
              during long desk sessions, studying, meetings, and workouts.
            </p>

            <p>
              Choose a reminder interval like <strong>30 minutes</strong> or{" "}
              <strong>60 minutes</strong>, start the timer, and keep the tab
              open while you work. This is a simple in-browser tool, so it’s
              best used on a second screen or in fullscreen.
            </p>

            <p>
              Want a focused work companion? Try{" "}
              <Link
                to="/productivity-timer"
                className="font-semibold hover:underline"
              >
                Productivity Timer
              </Link>{" "}
              or{" "}
              <Link to="/break-timer" className="font-semibold hover:underline">
                Break Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Water Reminder Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this work as a hydration reminder if the tab is closed?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. It runs while the page is open. Some browsers also reduce
              background timer updates to save power.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What’s the best reminder interval?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many people use 30–60 minutes during desk work. Adjust based on
              activity, climate, and personal needs.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I keep it silent?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Turn Sound off and use the on-screen countdown as a visual
              reminder.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I trigger a reminder immediately?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use “Remind now” (or press N while running).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
