// app/routes/debt-clock.tsx
import type { Route } from "./+types/debt-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Debt Clock | National + World Debt Counter (Estimated, Live, Fullscreen)";
  const description =
    "Free debt clock that estimates national or world debt as a live counter. Pick a preset or enter your own starting debt and yearly change rate. Includes clear disclosures and fullscreen display.";
  const url = "https://ilovetimers.com/debt-clock";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "debt clock",
        "world debt clock",
        "national debt clock",
        "us debt clock",
        "government debt clock",
        "debt counter",
        "live debt clock",
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

function formatMoney(n: number, currency = "USD") {
  const safe = Number.isFinite(n) ? n : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(safe);
  } catch {
    const sign = safe < 0 ? "-" : "";
    const abs = Math.abs(safe);
    return `${sign}$${Math.round(abs).toLocaleString()}`;
  }
}

function formatNumber(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return Math.round(safe).toLocaleString();
}

const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

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
   DATA (DEMO PRESETS)
   NOTE: These are intentionally labeled as demo numbers.
   Users can (and should) replace them with their preferred sources.
========================================================= */
type Preset = {
  id: string;
  label: string;
  currency: string;
  baseDebt: number;
  yearlyChange: number; // can be negative
  asOfLabel: string; // plain text
  notes: string;
};

const PRESETS: Preset[] = [
  {
    id: "world-demo",
    label: "World (demo)",
    currency: "USD",
    baseDebt: 300_000_000_000_000, // 300T
    yearlyChange: 9_000_000_000_000, // +9T / year
    asOfLabel: "Demo preset (replace with your source)",
    notes: "This is a demo starting point, not an official figure.",
  },
  {
    id: "us-demo",
    label: "United States (demo)",
    currency: "USD",
    baseDebt: 34_000_000_000_000, // 34T
    yearlyChange: 1_200_000_000_000, // +1.2T / year
    asOfLabel: "Demo preset (replace with your source)",
    notes: "Use your preferred published total and an average yearly change.",
  },
  {
    id: "canada-demo",
    label: "Canada (demo)",
    currency: "CAD",
    baseDebt: 1_400_000_000_000, // 1.4T
    yearlyChange: 55_000_000_000, // +55B / year
    asOfLabel: "Demo preset (replace with your source)",
    notes: "Currency is CAD in this preset.",
  },
  {
    id: "custom",
    label: "Custom",
    currency: "USD",
    baseDebt: 0,
    yearlyChange: 0,
    asOfLabel: "Your inputs",
    notes: "Enter any starting value and yearly change rate.",
  },
];

/* =========================================================
   DEBT CLOCK CARD
========================================================= */
function DebtClockCard() {
  const [presetId, setPresetId] = useState<string>("world-demo");

  const preset = useMemo(() => {
    return PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  }, [presetId]);

  const [currency, setCurrency] = useState(preset.currency);
  const [baseDebt, setBaseDebt] = useState(preset.baseDebt);
  const [yearlyChange, setYearlyChange] = useState(preset.yearlyChange);
  const [asOfLabel, setAsOfLabel] = useState(preset.asOfLabel);

  const [running, setRunning] = useState(true);

  const rafRef = useRef<number | null>(null);
  const startPerfRef = useRef<number | null>(null);
  const startEpochMsRef = useRef<number | null>(null);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Apply preset values when preset changes (except when preset is custom, user controls)
  useEffect(() => {
    const p = preset;
    if (p.id === "custom") return;

    setCurrency(p.currency);
    setBaseDebt(p.baseDebt);
    setYearlyChange(p.yearlyChange);
    setAsOfLabel(p.asOfLabel);

    // Reset clock anchor for consistency
    startPerfRef.current = performance.now();
    startEpochMsRef.current = Date.now();
  }, [preset]);

  // Initialize anchors once
  useEffect(() => {
    startPerfRef.current = performance.now();
    startEpochMsRef.current = Date.now();
  }, []);

  const perSecond = useMemo(() => {
    return (
      (Number.isFinite(yearlyChange) ? yearlyChange : 0) / SECONDS_PER_YEAR
    );
  }, [yearlyChange]);

  const [nowDebt, setNowDebt] = useState(baseDebt);

  // Keep nowDebt in sync if base changes while paused
  useEffect(() => {
    if (!running) setNowDebt(baseDebt);
  }, [baseDebt, running]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    if (!startPerfRef.current) startPerfRef.current = performance.now();

    const tick = () => {
      const elapsedSeconds =
        (performance.now() - (startPerfRef.current ?? performance.now())) /
        1000;

      const next = baseDebt + perSecond * elapsedSeconds;
      setNowDebt(next);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, baseDebt, perSecond]);

  function reset() {
    startPerfRef.current = performance.now();
    startEpochMsRef.current = Date.now();
    setNowDebt(baseDebt);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        // restarting: re-anchor at current debt so it continues smoothly
        // We treat the current displayed debt as the new base.
        startPerfRef.current = performance.now();
        startEpochMsRef.current = Date.now();
        setBaseDebt((prev) => {
          // ensure we keep the displayed value as base
          return nowDebt;
        });
      }
      return next;
    });
  }

  async function copy() {
    try {
      const payload = [
        `Debt Clock: ${preset.label}`,
        `As of: ${asOfLabel}`,
        `Current (estimated): ${formatMoney(nowDebt, currency)}`,
        `Starting: ${formatMoney(baseDebt, currency)}`,
        `Yearly change: ${formatMoney(yearlyChange, currency)} / year`,
        `Per second: ${formatMoney(perSecond, currency)} / second`,
        `Disclosure: Estimated counter based on provided starting value and average rate.`,
      ].join("\n");
      await navigator.clipboard.writeText(payload);
    } catch {
      // ignore
    }
  }

  const signLabel = perSecond >= 0 ? "increasing" : "decreasing";

  const disclosure = (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="font-extrabold text-amber-950">Disclosure</div>
      <p className="mt-2 leading-relaxed">
        This debt clock is an <strong>estimate</strong>. It updates a starting
        debt value using an average yearly change rate. It is for visualization
        and education. It may not match official totals or any real-time
        government figure.
      </p>
      <p className="mt-2 leading-relaxed">
        If you want it to reflect a specific source, paste that source’s latest
        published total into “Starting debt” and use a rate you trust for
        “Yearly change”.
      </p>
    </div>
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (e.key.toLowerCase() === "c") {
      copy();
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Debt Clock</h2>
          <p className="mt-1 text-base text-slate-700">
            An estimated live counter for national or world debt. Pick a preset
            or enter your own starting debt and yearly change.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {/* Preset + inputs */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Preset
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-slate-600">{preset.notes}</div>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Starting debt
          <input
            type="number"
            min={0}
            step={1}
            value={Math.max(0, Math.round(baseDebt))}
            onChange={(e) =>
              setBaseDebt(
                clamp(Number(e.target.value || 0), 0, 1_000_000_000_000_000),
              )
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            Tip: paste a published total from your preferred source.
          </div>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Yearly change (can be negative)
          <input
            type="number"
            step={1}
            value={Math.round(yearlyChange)}
            onChange={(e) =>
              setYearlyChange(
                clamp(
                  Number(e.target.value || 0),
                  -1_000_000_000_000_000,
                  1_000_000_000_000_000,
                ),
              )
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            Example: +1.2T/year means the counter rises over time.
          </div>
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="USD">USD ($)</option>
            <option value="CAD">CAD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AUD">AUD ($)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-amber-950 lg:col-span-2">
          “As of” label (shown in disclosures)
          <input
            type="text"
            value={asOfLabel}
            onChange={(e) => setAsOfLabel(e.target.value)}
            placeholder="e.g. Source X, 2025-12-31"
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
        <Btn kind="ghost" onClick={copy}>
          Copy
        </Btn>

        <div className="ml-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen · C copy
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
                width:min(1500px, 100%);
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

              [data-fs-container]:fullscreen .fs-amount{
                font: 900 clamp(64px, 12vw, 190px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.03em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 700 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
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
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Current estimated debt
            </div>

            <div className="text-center font-mono text-5xl font-extrabold tracking-wider sm:text-6xl md:text-7xl">
              {formatMoney(nowDebt, currency)}
            </div>

            <div className="text-sm font-semibold text-slate-700">
              Rate:{" "}
              <span className="font-extrabold text-amber-950">
                {formatMoney(yearlyChange, currency)}
              </span>{" "}
              / year ·{" "}
              <span className="font-extrabold text-amber-950">
                {formatMoney(perSecond, currency)}
              </span>{" "}
              / second ({signLabel})
            </div>

            <div className="text-xs text-slate-600">
              As of: <span className="font-semibold">{asOfLabel}</span> · This
              is an estimate.
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Debt Clock</div>
            <div className="fs-amount">{formatMoney(nowDebt, currency)}</div>
            <div className="fs-sub">
              {preset.label} · As of {asOfLabel}
            </div>
            <div className="fs-sub">
              {formatMoney(yearlyChange, currency)} per year ·{" "}
              {formatMoney(perSecond, currency)} per second
            </div>
            <div className="fs-sub">
              Space start/pause · R reset · F fullscreen · C copy
            </div>
          </div>
        </div>
      </div>

      {/* Disclosures */}
      <div className="mt-6">{disclosure}</div>

      {/* Quick-use hints */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">How it works</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            The counter starts at your “Starting debt” value and moves by an
            average rate derived from “Yearly change”. It is a smooth
            visualization, not a real-time ledger.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">
            Make it accurate for your source
          </h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Use a published total for “Starting debt”, and an average yearly
            change you trust. Then set the “As of” label to document where the
            numbers came from.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">Use fullscreen</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Fullscreen is built for TVs and projectors. It is useful for
            classrooms, presentations, or sharing a single number clearly.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function DebtClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/debt-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Debt Clock",
        url,
        description:
          "Estimated live debt clock for national or world debt using a starting value and average yearly change rate. Includes disclosures and fullscreen.",
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
          { "@type": "ListItem", position: 2, name: "Debt Clock", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a debt clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A debt clock is a counter that visualizes debt changing over time. Most debt clocks estimate a smooth rate of change using published totals and an average growth rate.",
            },
          },
          {
            "@type": "Question",
            name: "Is this an official real-time government number?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. This page shows an estimated counter based on the inputs you provide. Official totals are typically published on schedules and may be calculated differently.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need an API or external data?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. You can use any published starting value and an average yearly change rate. The clock uses those inputs to animate an estimate.",
            },
          },
          {
            "@type": "Question",
            name: "Does it keep running if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It updates while the page is open. Browsers may reduce update frequency in background tabs to save power.",
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
            / <span className="text-amber-950">Debt Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Debt Clock (Estimated National and World Debt Counter)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>debt clock</strong> is usually a live-looking counter for{" "}
            <strong>world debt</strong> or <strong>national debt</strong>. This
            page provides that style of visualization with clear disclosures,
            plus a custom mode so you can match your own source.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <DebtClockCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            What this debt clock shows (and what it does not)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              Most “debt clock” pages online are visualizations. They start with
              a published debt total and animate a smooth rate of change. That
              is useful for intuition, but it is not the same thing as an
              official ledger or a government reporting schedule.
            </p>
            <p>
              This page is explicit about that. It uses your starting value and
              your yearly change rate to produce a live estimate. If you want it
              to reflect a specific source, enter the latest published total and
              document it in the “As of” label.
            </p>
            <p>
              For time tools, try{" "}
              <Link
                to="/event-countdown"
                className="font-semibold hover:underline"
              >
                Event Countdown
              </Link>{" "}
              or{" "}
              <Link
                to="/productivity-timer"
                className="font-semibold hover:underline"
              >
                Productivity Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Debt Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a real-time official debt number?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. It is an estimated counter based on a starting value and an
              average rate of change.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why do debt clocks differ across websites?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Different sites use different sources, update dates, and rate
              assumptions. Some include or exclude categories of debt, and some
              smooth over time differently.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I enter my own numbers?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Choose the Custom preset, paste a published total into
              “Starting debt”, and set your yearly change rate.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it work offline?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Once loaded, it runs in your browser. The live counter does not
              require external data feeds.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
