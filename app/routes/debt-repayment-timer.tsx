// app/routes/debt-repayment-timer.tsx
import type { Route } from "./+types/debt-repayment-timer";
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
    "Debt Repayment Timer | Debt Payoff Timer (Countdown + Motivation, Simple)";
  const description =
    "Free debt repayment timer. Set a payoff date or a countdown duration, track time remaining, estimate progress, and stay motivated. Includes clear disclosures: this is a planning tool, not financial advice.";
  const url = "https://ilovetimers.com/debt-repayment-timer";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "debt repayment timer",
        "debt payoff timer",
        "debt pay off timer",
        "debt countdown",
        "payoff countdown timer",
        "debt tracker timer",
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
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(sec)}`;
  return `${m}:${pad2(sec)}`;
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
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

function safeDateInputValue(d: Date) {
  // YYYY-MM-DD for <input type="date">
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
   DEBT REPAYMENT TIMER CARD
========================================================= */
type Mode = "payoff-date" | "duration";

function DebtRepaymentTimerCard() {
  const displayWrapRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>("payoff-date");

  // Inputs
  const [currency, setCurrency] = useState("USD");
  const [startingBalance, setStartingBalance] = useState<number>(5000);
  const [targetBalance, setTargetBalance] = useState<number>(0);

  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState<string>(safeDateInputValue(today));
  const [payoffDate, setPayoffDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return safeDateInputValue(d);
  });

  const [durationDays, setDurationDays] = useState<number>(180);

  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const endTsRef = useRef<number | null>(null);

  const [remainingMs, setRemainingMs] = useState<number>(0);

  const startTs = useMemo(
    () => new Date(startDate + "T00:00:00").getTime(),
    [startDate],
  );

  const endTs = useMemo(() => {
    if (mode === "payoff-date") {
      return new Date(payoffDate + "T00:00:00").getTime();
    }
    return startTs + durationDays * 86400_000;
  }, [mode, payoffDate, startTs, durationDays]);

  const totalMs = Math.max(0, endTs - startTs);

  // Derived: progress from time elapsed
  const nowTs = Date.now();
  const elapsedMs = clamp(nowTs - startTs, 0, totalMs);
  const progress = totalMs === 0 ? 0 : elapsedMs / totalMs;

  const principalToPay = Math.max(0, startingBalance - targetBalance);
  const estPaid = principalToPay * progress;
  const estRemaining = Math.max(0, principalToPay - estPaid);

  // Countdown display uses endTs
  useEffect(() => {
    // initialize remaining
    setRemainingMs(Math.max(0, endTs - Date.now()));
    setRunning(false);
    endTsRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, [endTs]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endTsRef.current = null;
      return;
    }

    if (!endTsRef.current) endTsRef.current = endTs;

    const tick = () => {
      const rem = Math.max(0, (endTsRef.current ?? Date.now()) - Date.now());
      setRemainingMs(rem);

      if (rem <= 0) {
        setRunning(false);
        endTsRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, endTs]);

  function startPause() {
    setRunning((r) => !r);
    endTsRef.current = null;
  }

  function reset() {
    setRunning(false);
    setRemainingMs(Math.max(0, endTs - Date.now()));
    endTsRef.current = null;
  }

  const shownRemaining = msToClock(Math.ceil(remainingMs / 1000) * 1000);

  const pct = Math.round(progress * 100);

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

  const invalidDates = endTs <= startTs;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Debt Repayment Timer
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A simple payoff countdown plus an estimated progress bar. It’s a
            motivation tool, not a calculator for interest or exact
            amortization.
          </p>
        </div>

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

      {/* Mode */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { id: "payoff-date", label: "Payoff date" },
          { id: "duration", label: "Duration (days)" },
        ].map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setMode(x.id as Mode)}
            className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
              mode === x.id
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {["USD", "CAD", "GBP", "EUR", "AUD"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Starting balance
          <input
            type="number"
            min={0}
            step={50}
            value={startingBalance}
            onChange={(e) =>
              setStartingBalance(clamp(Number(e.target.value || 0), 0, 1e9))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Target balance
          <input
            type="number"
            min={0}
            step={50}
            value={targetBalance}
            onChange={(e) =>
              setTargetBalance(clamp(Number(e.target.value || 0), 0, 1e9))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            Typically 0. If you’re aiming for a partial payoff, set a non-zero
            target.
          </div>
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        {mode === "payoff-date" ? (
          <label className="block text-sm font-semibold text-amber-950">
            Payoff date
            <input
              type="date"
              value={payoffDate}
              onChange={(e) => setPayoffDate(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="mt-1 text-xs text-slate-600">
              Countdown ends at midnight on this date (local time).
            </div>
          </label>
        ) : (
          <label className="block text-sm font-semibold text-amber-950">
            Duration (days)
            <input
              type="number"
              min={1}
              max={3650}
              value={durationDays}
              onChange={(e) =>
                setDurationDays(clamp(Number(e.target.value || 1), 1, 3650))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="mt-1 text-xs text-slate-600">
              Example: 180 days is about 6 months.
            </div>
          </label>
        )}

        <div className="flex items-end gap-3">
          <Btn onClick={startPause} disabled={invalidDates}>
            {running ? "Pause" : "Start"}
          </Btn>
          <Btn kind="ghost" onClick={reset}>
            Reset
          </Btn>
        </div>
      </div>

      {invalidDates ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
          End date must be after start date.
        </div>
      ) : null}

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
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.85;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(84px, 16vw, 220px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.06em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
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
          style={{ minHeight: 280 }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-2">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Time remaining
            </div>

            <div className="font-mono text-5xl font-extrabold tracking-widest sm:text-6xl md:text-7xl">
              {shownRemaining}
            </div>

            <div className="mt-2 grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Progress (time)
                </div>
                <div className="mt-1 text-2xl font-extrabold text-amber-950">
                  {pct}%
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Est. paid (linear)
                </div>
                <div className="mt-1 text-2xl font-extrabold text-amber-950">
                  {formatMoney(estPaid, currency)}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Est. remaining
                </div>
                <div className="mt-1 text-2xl font-extrabold text-amber-950">
                  {formatMoney(estRemaining, currency)}
                </div>
              </div>
            </div>

            <div className="mt-3 w-full">
              <div className="h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-amber-200">
                <div
                  className="h-full bg-amber-700"
                  style={{ width: `${clamp(progress * 100, 0, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-600">
                This “estimated paid” assumes linear progress across time (not
                interest math).
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Debt payoff countdown</div>
            <div className="fs-time">{shownRemaining}</div>
            <div className="fs-sub">
              Progress {pct}% · Est. remaining{" "}
              {formatMoney(estRemaining, currency)}
            </div>
            <div className="fs-sub">
              Space start/pause · R reset · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Disclosures */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold text-amber-950">Disclosures</div>
        <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            This is a <strong>planning and motivation timer</strong>. It does
            not calculate interest, minimum payments, compounding, or
            lender-specific rules.
          </li>
          <li>
            “Estimated paid/remaining” uses a <strong>linear</strong> time-based
            estimate. Real repayment progress may differ.
          </li>
          <li>
            This tool runs{" "}
            <strong>in your browser while the page is open</strong>. Background
            tabs may update less often depending on the browser.
          </li>
          <li>
            This page is not financial advice. For decisions, consider a
            qualified professional.
          </li>
        </ul>
      </div>

      {/* Shortcuts */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
export default function DebtRepaymentTimerPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/debt-repayment-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Debt Repayment Timer",
        url,
        description:
          "Debt repayment timer with payoff countdown and estimated progress. Includes disclosures and honest limitations.",
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
            name: "Debt Repayment Timer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a debt repayment timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A debt repayment timer is a payoff countdown that helps you stay motivated by showing the time remaining until a target date or duration ends.",
            },
          },
          {
            "@type": "Question",
            name: "Does this calculate interest and monthly payments?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. This page is a planning and motivation tool. It does not calculate interest, amortization, or lender-specific rules.",
            },
          },
          {
            "@type": "Question",
            name: "Why does it show “estimated paid/remaining”?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Those values are a simple linear estimate based on time elapsed between your start and end dates. Real progress may differ.",
            },
          },
          {
            "@type": "Question",
            name: "Will it keep running if I close the tab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It runs while the page is open. Background tabs may update less often depending on your browser.",
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
            / <span className="text-amber-950">Debt Repayment Timer</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Debt Repayment Timer (Debt Payoff Countdown)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A simple <strong>debt payoff timer</strong> to keep you motivated.
            Set a payoff date or duration, track time remaining, and see a
            time-based progress estimate.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <DebtRepaymentTimerCard />
      </section>

      {/* Menu Links (before RelatedSites) */}
      <TimerMenuLinks />

      {/* Related Sites */}
      <RelatedSites
        contextTags={["finance", "learning", "tools", "productivity"]}
        title="More tools for money + focus"
        subtitle="A small set of related sites that fit this page."
      />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free debt payoff timer and debt repayment countdown
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A <strong>debt repayment timer</strong> is a payoff countdown that
              helps you stay consistent. Seeing time remaining can be
              motivating, especially when paired with a simple plan and regular
              payments.
            </p>

            <p>
              This page intentionally keeps math simple: it shows a countdown
              and a time-based progress estimate. If you need interest and
              payment math, use a dedicated payoff calculator. For quick finance
              learning, try{" "}
              <a
                href="https://financequizzes.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                FinanceQuizzes
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Debt Repayment Timer FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a real debt payoff calculator?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. It’s a payoff countdown and motivation tool. It does not
              calculate interest, amortization, or lender rules.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why does it show estimated paid and remaining?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Those values are a simple linear estimate based on time elapsed
              between your start and end dates. Real progress may differ.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use a duration instead of a payoff date?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Switch to Duration mode and enter the number of days.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it keep running if I close the tab?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It runs while the page is open. Background tabs may update less
              often depending on the browser.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
