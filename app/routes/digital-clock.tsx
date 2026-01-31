// app/routes/digital-clock.tsx
import type { Route } from "./+types/digital-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Digital Clock Online | Big Fullscreen Clock With Seconds";
  const description =
    "Free digital clock showing your local time with big readable digits. Toggle seconds and 12 or 24 hour time, go fullscreen, and copy the time for classrooms, offices, and wall displays.";
  const url = "https://ilovetimers.com/digital-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "digital clock",
        "digital clock online",
        "big digital clock",
        "fullscreen digital clock",
        "current local time",
        "time now",
        "clock online",
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

function formatLocalTime(
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
    return fmt
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();

    if (use24) {
      return showSeconds
        ? `${pad2(h)}:${pad2(m)}:${pad2(s)}`
        : `${pad2(h)}:${pad2(m)}`;
    }

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return showSeconds
      ? `${pad2(h12)}:${pad2(m)}:${pad2(s)} ${ampm}`
      : `${pad2(h12)}:${pad2(m)} ${ampm}`;
  }
}

function formatLocalDateLine(d: Date) {
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
   DIGITAL CLOCK CARD
========================================================= */
function DigitalClockCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ms = showSeconds ? 1000 : 15000;
    const t = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(t);
  }, [showSeconds]);

  const timeText = useMemo(
    () => formatLocalTime(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const dateText = useMemo(() => formatLocalDateLine(now), [now]);

  const copyText = useMemo(() => {
    // Include both readable and ISO for copy usefulness.
    const iso = now.toISOString();
    return `${timeText} (${tz}) - ${dateText} (ISO: ${iso})`;
  }, [timeText, tz, dateText, now]);

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
            Digital Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Big digital clock for your local time. Fullscreen, seconds toggle,
            12/24-hour, and copy.
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

              [data-fs-container]:fullscreen .fs-label{
                font: 800 22px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(96px, 18vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
                white-space:nowrap;
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
          style={{ minHeight: 300 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 text-center">
              Local time · {tz}
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl text-center whitespace-nowrap">
              {timeText}
            </div>

            <div className="text-sm font-semibold text-amber-900 text-center">
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

            <div className="text-xs font-semibold text-amber-800 text-center">
              Shortcuts: F fullscreen · C copy · S seconds · 1 (12h) · 2 (24h)
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Digital Clock</div>
            <div className="fs-time">{timeText}</div>
            <div className="fs-sub">{tz}</div>
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
export default function DigitalClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/digital-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Digital Clock",
        url,
        description:
          "Big digital clock showing your current local time with fullscreen, seconds toggle, 12/24-hour mode, and copy.",
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
            name: "Digital Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does this digital clock show my local time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It uses your device’s local time and time zone settings.",
            },
          },
          {
            "@type": "Question",
            name: "Can I hide seconds?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toggle Seconds off or press S while the card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use 12-hour or 24-hour time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toggle 24-hour on or off. You can also press 1 for 12-hour and 2 for 24-hour while focused.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the card is focused to show a clean dark display with huge digits.",
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
            / <span className="text-amber-950">Digital Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Digital Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A big <strong>digital clock</strong> showing your current local time
            with fullscreen mode and optional seconds.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <DigitalClockCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Great for classrooms and offices
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Keep a big clock on-screen during lessons, meetings, and timed
              activities.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Seconds toggle and 12/24-hour
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Show seconds when you need precision, and hide seconds for a
              calmer wall-display style look.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>F</strong> = Fullscreen
              </li>
              <li>
                <strong>C</strong> = Copy
              </li>
              <li>
                <strong>S</strong> = Seconds toggle
              </li>
              <li>
                <strong>1</strong> = 12-hour
              </li>
              <li>
                <strong>2</strong> = 24-hour
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Current time now (digital clock)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              If you searched for <strong>digital clock</strong>,{" "}
              <strong>current time</strong>, or <strong>time now</strong>, this
              page shows your current local time instantly with a big, readable
              display.
            </p>

            <p>
              Need a global reference? Try{" "}
              <Link to="/utc-clock" className="font-semibold hover:underline">
                UTC Clock
              </Link>
              . Prefer an analog face? Try{" "}
              <Link
                to="/analog-clock"
                className="font-semibold hover:underline"
              >
                Analog Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Digital Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this show my current local time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It uses your device’s local time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I switch between 12-hour and 24-hour time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle 24-hour on/off, or press <strong>1</strong> for
              12-hour and <strong>2</strong> for 24-hour while focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I hide seconds?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle Seconds off, or press <strong>S</strong>.
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
        </div>
      </section>
    </main>
  );
}
