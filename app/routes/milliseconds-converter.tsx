// app/routes/milliseconds-converter.tsx
import type { Route } from "./+types/milliseconds-converter";
import { json } from "@remix-run/node";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Milliseconds Converter | ms to seconds + seconds to ms (Instant)";
  const description =
    "Free milliseconds converter. Convert ms to seconds and seconds to ms instantly, with copy buttons and common quick examples.";
  const url = "https://ilovetimers.com/milliseconds-converter";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "milliseconds converter",
        "ms to seconds",
        "milliseconds to seconds",
        "seconds to ms",
        "seconds to milliseconds",
        "ms to s converter",
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
  return json({ ok: true });
}

/* =========================================================
   UTILS
========================================================= */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function formatNumber(n: number | null) {
  // No locale surprises, but still readable
  if (n === null || !Number.isFinite(n)) return "";
  // Trim trailing zeros for most cases
  const s = n.toFixed(12);
  return s.replace(/\.?0+$/, "");
}

function parseNumeric(s: string) {
  const t = (s || "").trim().replace(/,/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/* =========================================================
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm ${className}`}
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

const TabBtn = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
    }`}
  >
    {children}
  </button>
);

const MiniPill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-950">
    {children}
  </span>
);

/* =========================================================
   TOOL
========================================================= */
function MillisecondsConverterCard() {
  const [tab, setTab] = useState<"ms2s" | "s2ms">("ms2s");

  const [msInput, setMsInput] = useState("1000");
  const [sInput, setSInput] = useState("1");

  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const ms = useMemo(() => parseNumeric(msInput), [msInput]);
  const seconds = useMemo(() => parseNumeric(sInput), [sInput]);

  const msToSeconds = useMemo(() => (ms == null ? null : ms / 1000), [ms]);
  const secondsToMs = useMemo(
    () => (seconds == null ? null : seconds * 1000),
    [seconds],
  );

  const reset = useCallback(() => {
    setTab("ms2s");
    setMsInput("1000");
    setSInput("1");
  }, []);

  const copy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    setLastCopied(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setLastCopied(null), 900);
  }, []);

  const examples = useMemo(
    () => [
      { ms: 1, s: 0.001 },
      { ms: 10, s: 0.01 },
      { ms: 16.67, s: 0.01667 }, // ~60fps frame
      { ms: 100, s: 0.1 },
      { ms: 250, s: 0.25 },
      { ms: 500, s: 0.5 },
      { ms: 1000, s: 1 },
      { ms: 1500, s: 1.5 },
      { ms: 2000, s: 2 },
      { ms: 60000, s: 60 },
    ],
    [],
  );

  const primaryValue =
    tab === "ms2s"
      ? msToSeconds == null
        ? ""
        : formatNumber(msToSeconds)
      : secondsToMs == null
        ? ""
        : formatNumber(secondsToMs);

  const primaryLabel = tab === "ms2s" ? "Seconds" : "Milliseconds";

  const copyText =
    tab === "ms2s"
      ? msToSeconds == null
        ? ""
        : `${formatNumber(ms)} ms = ${formatNumber(msToSeconds)} seconds`
      : secondsToMs == null
        ? ""
        : `${formatNumber(seconds)} seconds = ${formatNumber(secondsToMs)} ms`;

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Milliseconds Converter
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Instant conversions for <strong>ms to seconds</strong> and{" "}
            <strong>seconds to ms</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Btn kind="ghost" onClick={reset} className="py-2">
            Reset
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => copy(copyText)}
            disabled={!copyText}
            className="py-2"
          >
            Copy
          </Btn>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <TabBtn active={tab === "ms2s"} onClick={() => setTab("ms2s")}>
          ms → seconds
        </TabBtn>
        <TabBtn active={tab === "s2ms"} onClick={() => setTab("s2ms")}>
          seconds → ms
        </TabBtn>

        {lastCopied ? <MiniPill>{lastCopied}</MiniPill> : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {tab === "ms2s" ? (
          <label className="block">
            <div className="text-sm font-extrabold text-amber-950">
              Milliseconds (ms)
            </div>
            <input
              value={msInput}
              onChange={(e) => setMsInput(e.target.value)}
              inputMode="decimal"
              placeholder="1000"
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="mt-1 text-xs text-amber-900">
              Tip: you can paste numbers with commas (like 60,000).
            </div>
          </label>
        ) : (
          <label className="block">
            <div className="text-sm font-extrabold text-amber-950">
              Seconds (s)
            </div>
            <input
              value={sInput}
              onChange={(e) => setSInput(e.target.value)}
              inputMode="decimal"
              placeholder="1"
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="mt-1 text-xs text-amber-900">
              Supports decimals (like 0.01667).
            </div>
          </label>
        )}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {primaryLabel}
          </div>
          <div className="mt-2 text-4xl font-extrabold text-amber-950">
            {primaryValue || "—"}
          </div>
          <div className="mt-2 text-sm font-semibold text-amber-900">
            {tab === "ms2s" ? (
              <>{ms == null ? "Enter a valid milliseconds value." : null}</>
            ) : (
              <>{seconds == null ? "Enter a valid seconds value." : null}</>
            )}
          </div>

          {copyText ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-white p-3 text-sm text-amber-900">
              {copyText}
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick examples */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-extrabold text-amber-950">
              Quick examples
            </div>
            <div className="text-xs text-amber-900">
              Click to populate the converter.
            </div>
          </div>
          <div className="text-xs text-slate-600">
            Common: 1000 ms = 1 second
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={`${ex.ms}-${ex.s}`}
              type="button"
              onClick={() => {
                setMsInput(String(ex.ms));
                setSInput(String(ex.s));
              }}
              className="cursor-pointer rounded-full bg-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-950 hover:bg-amber-400"
            >
              {formatNumber(ex.ms)} ms ↔ {formatNumber(ex.s)} s
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MillisecondsConverterPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/milliseconds-converter";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Milliseconds Converter",
        url,
        description:
          "Convert ms to seconds and seconds to ms instantly with copy buttons and examples.",
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
            name: "Milliseconds Converter",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do you convert ms to seconds?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Divide milliseconds by 1000. Example: 1500 ms ÷ 1000 = 1.5 seconds.",
            },
          },
          {
            "@type": "Question",
            name: "How do you convert seconds to ms?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Multiply seconds by 1000. Example: 2.5 seconds × 1000 = 2500 ms.",
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
            / <span className="text-amber-950">Milliseconds Converter</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Milliseconds Converter
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Targets: <strong>ms to seconds</strong> and{" "}
            <strong>seconds to ms</strong>.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <MillisecondsConverterCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Convert milliseconds to seconds (and back)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              To convert <strong>ms to seconds</strong>, divide by 1000. To
              convert <strong>seconds to ms</strong>, multiply by 1000. This
              page does both instantly and gives you a clean number you can
              copy.
            </p>

            <p>
              If you’re working with time durations like 1h 20m + 45m, use{" "}
              <Link
                to="/time-calculator"
                className="font-semibold hover:underline"
              >
                Time Calculator
              </Link>
              . For payroll sessions with breaks and rates, use{" "}
              <Link
                to="/billable-hours-calculator"
                className="font-semibold hover:underline"
              >
                Billable Hours Calculator
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Milliseconds Converter FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is 1000 ms equal to 1 second?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. 1000 milliseconds equals exactly 1 second.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I convert decimals like 0.01667 seconds to ms?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Multiply by 1000. Example: 0.01667 s ≈ 16.67 ms.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
