// app/routes/current-local-time.tsx
import type { Route } from "./+types/current-local-time";
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
    "Current Local Time | Local Time Now (Big, Fullscreen, Copyable)";
  const description =
    "See your current local time instantly. Big readable clock, optional seconds, 12/24-hour toggle, fullscreen mode, and copy-friendly output. Great for classrooms, meetings, and streaming overlays.";
  const url = "https://ilovetimers.com/current-local-time";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "current local time",
        "local time now",
        "what time is it",
        "current time",
        "time right now",
        "local time",
        "current time in my location",
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function formatClock(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean },
) {
  const { use24, showSeconds } = opts;

  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: !use24,
    });

    // normalize spacing a bit for readability
    return fmt.format(d).replace(/\u200e/g, "").trim();
  } catch {
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    if (use24) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");
      return showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    }
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const hh = String(h12).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return showSeconds ? `${hh}:${mm}:${ss} ${ampm}` : `${hh}:${mm} ${ampm}`;
  }
}

function formatDateLine(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return d.toDateString();
  }
}

/* =========================================================
   UI PRIMITIVES (same style as Home/Pomodoro)
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
   CURRENT LOCAL TIME CARD
========================================================= */
function CurrentLocalTimeCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  // tick every second if showing seconds, else every 15s to keep fresh
  useEffect(() => {
    const ms = showSeconds ? 1000 : 15000;
    const t = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(t);
  }, [showSeconds]);

  const timeText = useMemo(
    () => formatClock(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const dateText = useMemo(() => formatDateLine(now), [now]);

  const copyText = useMemo(() => {
    // keep it simple and useful
    return `${timeText} (${tz}) - ${dateText}`;
  }, [timeText, tz, dateText]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (e.key.toLowerCase() === "c") {
      copy();
    } else if (e.key.toLowerCase() === "s") {
      setShowSeconds((v) => !v);
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Current Local Time
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Big readable clock with seconds, 12/24-hour toggle, copy, and
            fullscreen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
            />
            Seconds
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={use24}
              onChange={(e) => setUse24(e.target.checked)}
            />
            24-hour
          </label>

          <Btn kind="ghost" onClick={copy} className="py-2">
            {copied ? "Copied" : "Copy"}
          </Btn>

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

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
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
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(92px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 18px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.9;
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
          style={{ minHeight: 280 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Local time now · {tz}
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
              {timeText}
            </div>

            <div className="text-sm font-semibold text-amber-900">
              {dateText}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-amber-800">
              <span className="rounded-full bg-amber-500/30 px-3 py-1">
                {use24 ? "24-hour" : "12-hour"}
              </span>
              <span className="rounded-full bg-amber-500/30 px-3 py-1">
                Seconds {showSeconds ? "on" : "off"}
              </span>
              <span className="rounded-full bg-amber-500/30 px-3 py-1">
                Press C to copy
              </span>
            </div>

            <div className="text-xs font-semibold text-amber-800">
              Shortcuts: F fullscreen · C copy · S seconds · 1 (12h) · 2 (24h)
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Current Local Time</div>
            <div className="fs-time">{timeText}</div>
            <div className="fs-sub">
              {dateText} · {tz}
            </div>
            <div className="fs-help">
              F fullscreen · C copy · S seconds · 1 (12h) · 2 (24h)
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: F fullscreen · C copy · S seconds · 1 (12h) · 2 (24h)
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
export default function CurrentLocalTimePage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/current-local-time";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Current Local Time",
        url,
        description:
          "See your current local time instantly with a big readable clock, optional seconds, 12/24-hour toggle, copy, and fullscreen.",
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
            name: "Current Local Time",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What does current local time mean?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Current local time is the time in your device’s current time zone. This page reads your device settings and shows the time right now.",
            },
          },
          {
            "@type": "Question",
            name: "Why might my local time look wrong?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "If your device time zone or clock is set incorrectly, the displayed local time will be incorrect. Check your device date/time and time zone settings.",
            },
          },
          {
            "@type": "Question",
            name: "Can I show local time in fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Fullscreen (or press F while the card is focused) for a clean dark display with huge digits.",
            },
          },
          {
            "@type": "Question",
            name: "How do I copy the current time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Press Copy (or press C) to copy the current time, time zone, and date to your clipboard.",
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
            / <span className="text-amber-950">Current Local Time</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Current Local Time
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Your <strong>local time now</strong>, shown in a big readable clock
            with seconds, 12/24-hour toggle, copy, and fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <CurrentLocalTimeCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Big clock for visibility
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use it on a second monitor, projector, classroom screen, or stream
              overlay. Fullscreen keeps it clean and readable.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Copy the time</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Copy includes time, time zone, and date so you can paste it into
              messages, notes, or docs.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Switch 12h or 24h
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Toggle 12-hour or 24-hour formats and turn seconds on or off
              depending on what you need.
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
            Local time now, instantly
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              If you searched for <strong>current local time</strong> or{" "}
              <strong>local time now</strong>, this page is the fastest answer.
              It shows the time using your device’s current time zone settings,
              with a clean display that is easy to read at a glance.
            </p>

            <p>
              Need a countdown instead? Use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . Need a stopwatch? Use{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Current Local Time FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this the current time where I am?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It uses your device’s local time and time zone settings.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why does it show the wrong time zone?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              If your device time zone is set manually or incorrectly, the time
              will be wrong. Fix your device time zone and refresh.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the card is focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I copy the current time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Copy</strong> or press <strong>C</strong> to copy
              the time, time zone, and date.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
