// app/routes/epoch-unix-time-clock.tsx
import type { Route } from "./+types/epoch-unix-time-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Unix Time Clock | Current Epoch Timestamp (Seconds and Milliseconds)";
  const description =
    "Free Unix time clock showing the current epoch timestamp in seconds and milliseconds. Includes copy buttons, local and UTC display, and a clean fullscreen view.";
  const url = "https://ilovetimers.com/epoch-unix-time-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "unix time clock",
        "epoch time clock",
        "unix timestamp",
        "current unix time",
        "epoch timestamp",
        "unix time seconds",
        "unix time milliseconds",
        "epoch converter",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
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

function safeInt(n: number) {
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function formatDateTimeLocal(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function formatDateTimeUTC(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
    hour12: false,
  }).format(d);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* =========================================================
   UI PRIMITIVES (matches your site)
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   EPOCH / UNIX TIME CLOCK CARD
========================================================= */
function EpochUnixTimeClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [mode, setMode] = useState<"live" | "freeze">("live");
  const [copied, setCopied] = useState<string | null>(null);

  const fsRef = useRef<HTMLDivElement>(null);

  // Live ticker
  useEffect(() => {
    if (mode !== "live") return;
    const t = window.setInterval(() => setNow(new Date()), 100);
    return () => window.clearInterval(t);
  }, [mode]);

  // Copy toast
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const ms = now.getTime();
  const unixSeconds = useMemo(() => safeInt(ms / 1000), [ms]);
  const unixMillis = useMemo(() => safeInt(ms), [ms]);

  const localStr = useMemo(() => formatDateTimeLocal(now), [now]);
  const utcStr = useMemo(() => formatDateTimeUTC(now), [now]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key.toLowerCase() === "f" && fsRef.current) {
      toggleFullscreen(fsRef.current);
    } else if (e.key === " ") {
      e.preventDefault();
      setMode((m) => (m === "live" ? "freeze" : "live"));
    } else if (e.key.toLowerCase() === "c") {
      // default copy seconds
      void (async () => {
        const ok = await copyToClipboard(String(unixSeconds));
        if (ok) setCopied("Copied seconds");
      })();
    }
  };

  const doCopy = async (label: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) setCopied(label);
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Epoch / Unix Time Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A live <strong>Unix timestamp clock</strong> showing epoch time in{" "}
            <strong>seconds</strong> and <strong>milliseconds</strong>, plus
            local and UTC date-time. Copy-friendly and fullscreen-ready.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={mode === "live"}
              onChange={(e) => setMode(e.target.checked ? "live" : "freeze")}
            />
            Live
          </label>

          <Btn
            kind="ghost"
            onClick={() => setNow(new Date())}
            disabled={mode === "live"}
          >
            Snap now
          </Btn>

          <Btn
            kind="ghost"
            onClick={() => fsRef.current && toggleFullscreen(fsRef.current)}
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={fsRef}
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
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(56px, 10vw, 150px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.06em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 clamp(14px, 2.2vw, 22px)/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
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
          className="h-full w-full flex-col items-center justify-center p-6"
          style={{ minHeight: 280 }}
        >
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Current Unix timestamp
          </div>

          <div className="mt-3 grid w-full max-w-4xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Seconds
              </div>
              <div className="mt-2 font-mono text-3xl font-extrabold tracking-wider text-amber-950">
                {unixSeconds}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn
                  kind="ghost"
                  onClick={() =>
                    void doCopy("Copied seconds", String(unixSeconds))
                  }
                >
                  Copy
                </Btn>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Milliseconds
              </div>
              <div className="mt-2 font-mono text-3xl font-extrabold tracking-wider text-amber-950">
                {unixMillis}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn
                  kind="ghost"
                  onClick={() =>
                    void doCopy("Copied milliseconds", String(unixMillis))
                  }
                >
                  Copy
                </Btn>
              </div>
            </div>
          </div>

          <div className="mt-5 grid w-full max-w-4xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Local time
              </div>
              <div className="mt-2 text-sm font-semibold text-amber-950">
                {localStr}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                UTC time
              </div>
              <div className="mt-2 text-sm font-semibold text-amber-950">
                {utcStr}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs font-semibold text-amber-950 text-center">
            Shortcuts: Space live/freeze · C copy seconds · F fullscreen
          </div>

          {copied && (
            <div className="mt-3 text-xs font-bold text-amber-900">
              {copied}
            </div>
          )}
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Unix Time</div>
            <div className="fs-time">{unixSeconds}</div>
            <div className="fs-sub">Milliseconds: {unixMillis}</div>
            <div className="fs-help">
              Space live/freeze · C copy seconds · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Footer tips */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
            What is Unix time?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Unix time (epoch time) counts seconds since{" "}
            <strong>Jan 1, 1970 (UTC)</strong>. It is widely used in logs, APIs,
            and systems programming.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
            Seconds vs milliseconds
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Many APIs use seconds, while JavaScript <code>Date.now()</code> uses
            milliseconds. This page shows both to prevent mistakes.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
            Freeze mode
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Turn Live off to freeze a specific timestamp and copy it accurately.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function EpochUnixTimeClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/epoch-unix-time-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Epoch / Unix Time Clock",
        url,
        description:
          "Live Unix timestamp clock showing epoch time in seconds and milliseconds, plus local and UTC date-time.",
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
            name: "Epoch / Unix Time Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is epoch time (Unix time)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Epoch time (Unix time) is the number of seconds since Jan 1, 1970 00:00:00 UTC. It is commonly used in logs and APIs.",
            },
          },
          {
            "@type": "Question",
            name: "Why do some timestamps use milliseconds?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "JavaScript and many client-side tools represent time in milliseconds for higher precision. Some APIs use seconds, others use milliseconds.",
            },
          },
          {
            "@type": "Question",
            name: "How do I copy the Unix timestamp quickly?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use the Copy buttons, or press C to copy the seconds value. You can also freeze the clock by turning Live off.",
            },
          },
          {
            "@type": "Question",
            name: "Does this show UTC and local time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The page shows both your local date-time and UTC date-time to reduce timezone confusion.",
            },
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Epoch / Unix Time Clock",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
            / <span className="text-amber-950">Epoch / Unix Time Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Epoch / Unix Time Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live <strong>Unix timestamp</strong> clock showing epoch time in{" "}
            <strong>seconds</strong> and <strong>milliseconds</strong>, plus UTC
            and local time.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <EpochUnixTimeClockCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Current Unix time (epoch timestamp) in seconds and milliseconds
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              If you searched for a <strong>Unix time clock</strong> or{" "}
              <strong>current epoch timestamp</strong>, this page is built for
              quick copy and clarity. Unix time counts from{" "}
              <strong>Jan 1, 1970 (UTC)</strong>. Many systems store timestamps
              this way because it avoids timezone issues.
            </p>

            <p>
              One common mistake is mixing <strong>seconds</strong> and{" "}
              <strong>milliseconds</strong>. JavaScript uses milliseconds (for
              example, <code>Date.now()</code>), while many APIs and logs use
              seconds. This clock shows both formats together so you can copy
              the right one instantly.
            </p>

            <p>
              Need conversions? Add a dedicated converter route later (epoch →
              date-time and date-time → epoch). For now, this page focuses on
              the “live timestamp” intent: view, copy, fullscreen.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="text-xs text-slate-600">Build: {nowISO}</div>
      </section>
      <EpochFaqSection />
    </main>
  );
}

/* =========================================================
   FAQ (VISIBLE) + JSON-LD
========================================================= */

const EPOCH_FAQ = [
  {
    q: "What is epoch time (Unix time)?",
    a: "Epoch time (Unix time) is the number of seconds since Jan 1, 1970 00:00:00 UTC. It’s commonly used in logs, databases, and APIs.",
  },
  {
    q: "Why do some timestamps use milliseconds?",
    a: "JavaScript (Date.now()) uses milliseconds for higher precision. Many APIs and logs use seconds. Mixing them is a common bug, so this page shows both.",
  },
  {
    q: "How do I copy the Unix timestamp quickly?",
    a: "Use the Copy buttons, or press C to copy the seconds value. Turn Live off to freeze a specific timestamp and copy it accurately.",
  },
  {
    q: "Does this show UTC and local time?",
    a: "Yes. The page shows both your local date-time and UTC date-time to prevent timezone confusion.",
  },
  {
    q: "What does Live vs Freeze mean?",
    a: "Live updates continuously. Freeze stops updates so the timestamp stays fixed while you copy or screenshot it.",
  },
  {
    q: "Can I use fullscreen?",
    a: "Yes. Click Fullscreen or press F while the card is focused.",
  },
] as const;

function EpochFaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EPOCH_FAQ.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-amber-950">
          Epoch / Unix Time Clock FAQ
        </h2>

        <div className="mt-4 space-y-4">
          {EPOCH_FAQ.map((it, i) => (
            <div key={i}>
              <h3 className="font-semibold text-amber-950">{it.q}</h3>
              <p className="mt-1 text-amber-800 leading-relaxed">{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
