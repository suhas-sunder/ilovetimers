// app/routes/work-hours-calculator.tsx
import type { Route } from "./+types/work-hours-calculator";
import { json } from "@remix-run/node";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/work-hours-calculator/HowItWorks";
import Disclaimer from "~/clients/components/work-hours-calculator/Disclaimer";
import FAQ from "~/clients/components/work-hours-calculator/FAQ";
import KeyboardShortcuts from "~/clients/components/work-hours-calculator/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/work-hours-calculator/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Work Hours Calculator (Time Worked, Breaks Subtracted)";
  const description =
    "Calculate hours worked from start and end times. Subtract breaks and get total work hours instantly with a simple, accurate calculator.";

  const url = "https://www.ilovetimers.com/work-hours-calculator";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.jpg",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffffff" },
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

const pad2 = (n: number) => n.toString().padStart(2, "0");

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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function minutesToHhMm(totalMin: number) {
  const m = Math.max(0, Math.floor(totalMin));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${pad2(mm)}`;
}

function minutesToDecimalHours(totalMin: number, decimals: number) {
  const h = totalMin / 60;
  const d = clamp(decimals, 0, 4);
  return h.toFixed(d);
}

/**
 * Parses "HH:MM" (from <input type="time">)
 * returns minutes since midnight or null
 */
function parseTimeValue(v: string) {
  const s = (v || "").trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

function formatTimeLabel(minutesSinceMidnight: number) {
  const h24 = Math.floor(minutesSinceMidnight / 60) % 24;
  const m = minutesSinceMidnight % 60;
  const isPM = h24 >= 12;
  const h12raw = h24 % 12;
  const h12 = h12raw === 0 ? 12 : h12raw;
  return `${h12}:${pad2(m)} ${isPM ? "PM" : "AM"}`;
}

type CalcResult =
  | {
      ok: true;
      shiftMin: number;
      breakMin: number;
      paidMin: number;
      overnight: boolean;
    }
  | {
      ok: false;
      error: string;
    };

function calcWorkedMinutes(
  startMin: number | null,
  endMin: number | null,
  breakMin: number,
): CalcResult {
  if (startMin == null) return { ok: false, error: "Enter a Start Time." };
  if (endMin == null) return { ok: false, error: "Enter an End Time." };

  const b = clamp(Math.floor(breakMin || 0), 0, 24 * 60);

  // If end < start, assume overnight shift to next day
  const overnight = endMin < startMin;
  const rawShift = overnight ? endMin + 24 * 60 - startMin : endMin - startMin;

  if (rawShift <= 0) {
    return { ok: false, error: "End Time must be after Start Time." };
  }

  if (b > rawShift) {
    return {
      ok: false,
      error: "Break time cannot be longer than the total shift.",
    };
  }

  const paid = rawShift - b;

  return {
    ok: true,
    shiftMin: rawShift,
    breakMin: b,
    paidMin: paid,
    overnight,
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
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      "timer-tool-card h-full rounded-2xl bg-white p-4 sm:p-6",
      className,
    ].join(" ")}
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
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer timer-control-shadow rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const MiniPill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
    {children}
  </span>
);

/* =========================================================
   CARD
========================================================= */
function WorkHoursCalculatorCard() {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [breakMin, setBreakMin] = useState(30);

  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [roundTo, setRoundTo] = useState<0 | 5 | 10 | 15>(0);

  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const startMin = useMemo(() => parseTimeValue(start), [start]);
  const endMin = useMemo(() => parseTimeValue(end), [end]);

  const result = useMemo(() => {
    const base = calcWorkedMinutes(startMin, endMin, breakMin);
    if (!base.ok) return base;

    if (roundTo > 0) {
      const roundedPaid =
        Math.round(base.paidMin / roundTo) * (roundTo as number);
      return {
        ...base,
        paidMin: clamp(roundedPaid, 0, 24 * 60),
      };
    }

    return base;
  }, [startMin, endMin, breakMin, roundTo]);

  const reset = useCallback(() => {
    setStart("09:00");
    setEnd("17:00");
    setBreakMin(30);
    setDecimalPlaces(2);
    setRoundTo(0);
  }, []);

  const copy = useCallback(async (label: string, text: string) => {
    const ok = await copyToClipboard(text);
    setLastCopied(ok ? label : "Copy failed");
    window.setTimeout(() => setLastCopied(null), 900);
  }, []);

  const setNowStart = useCallback(() => {
    const d = new Date();
    setStart(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
  }, []);

  const setNowEnd = useCallback(() => {
    const d = new Date();
    setEnd(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "r") {
      e.preventDefault();
      reset();
    } else if (k === "c") {
      e.preventDefault();
      if (result.ok) {
        const text = `${minutesToHhMm(result.paidMin)} (${minutesToDecimalHours(
          result.paidMin,
          decimalPlaces,
        )} hrs)`;
        copy("Copied", text);
      }
    } else if (k === "s") {
      e.preventDefault();
      setNowStart();
    } else if (k === "e") {
      e.preventDefault();
      setNowEnd();
    }
  };

  const paidHHMM = result.ok ? minutesToHhMm(result.paidMin) : "—";
  const paidDec = result.ok
    ? minutesToDecimalHours(result.paidMin, decimalPlaces)
    : "—";
  const shiftHHMM = result.ok ? minutesToHhMm(result.shiftMin) : "—";

  const summaryLine =
    result.ok && startMin != null && endMin != null
      ? `${formatTimeLabel(startMin)} → ${formatTimeLabel(endMin)}`
      : "";

  const copyPayload = result.ok
    ? `Paid: ${paidHHMM} (${paidDec} hrs). Shift: ${shiftHHMM}. Break: ${result.breakMin} min.${result.overnight ? " Overnight shift." : ""}`
    : "";

  const statusLabel = result.ok
    ? result.overnight
      ? "Overnight shift"
      : "Same day"
    : "Fix inputs";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <div className="timer-first-stack flex h-full flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-sky-700">
            Work Hours Calculator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter start, end, and subtract a break. Supports overnight shifts.
          </p>

          {summaryLine ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MiniPill>{summaryLine}</MiniPill>
              {result.ok && result.overnight ? (
                <MiniPill>Overnight</MiniPill>
              ) : null}
              {roundTo > 0 ? (
                <MiniPill>Rounded to {roundTo} min</MiniPill>
              ) : null}
              <MiniPill>{statusLabel}</MiniPill>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MiniPill>{statusLabel}</MiniPill>
            </div>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Btn
            kind="ghost"
            onClick={() => result.ok && copy("Copied", copyPayload)}
            disabled={!result.ok}
            className="py-2"
          >
            Copy summary
          </Btn>
          <Btn kind="ghost" onClick={reset} className="py-2">
            Reset
          </Btn>
        </div>
      </div>

      {/* Big Result Display */}
      <div
        className={[
          "timer-display-surface mt-4 flex flex-col items-center justify-start rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center sm:p-6",
          "text-slate-950",
        ].join(" ")}
        style={{ minHeight: "clamp(320px, 42svh, 560px)" }}
        aria-live="polite"
      >
        {result.ok ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Paid time (after break)
              </div>
              <div className="mt-2 flex flex-wrap items-baseline justify-center gap-4">
                <div className="font-mono font-extrabold leading-none text-[76px] sm:text-[144px]">
                  {paidHHMM}
                </div>
                <div className="text-lg font-bold text-slate-700 sm:text-xl">
                  {paidDec} hrs
                </div>
              </div>
            </div>

            <div className="grid w-full max-w-5xl gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  Total shift
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {shiftHHMM}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  Break
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {result.breakMin} min
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  Overnight?
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {result.overnight ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm font-semibold text-slate-700">
            {result.error}
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="timer-settings-panel mt-4 grid gap-4 lg:grid-cols-3">
        <label className="block">
          <div className="text-sm font-extrabold text-slate-900">
            Start time
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
            <Btn kind="ghost" onClick={setNowStart} className="px-3 py-2">
              Now
            </Btn>
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Shortcut: <span className="font-semibold">S</span> sets Start to now
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-slate-900">End time</div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
            <Btn kind="ghost" onClick={setNowEnd} className="px-3 py-2">
              Now
            </Btn>
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Shortcut: <span className="font-semibold">E</span> sets End to now
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-slate-900">
            Subtract break (minutes)
          </div>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={24 * 60}
            value={breakMin}
            onChange={(e) => {
              const raw = e.target.value;
              const next = raw === "" ? 0 : Number(raw);
              setBreakMin(clamp(Number.isFinite(next) ? next : 0, 0, 24 * 60));
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[0, 15, 30, 45, 60].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBreakMin(b)}
                className={[
                  "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                  b === breakMin
                    ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                    : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                ].join(" ")}
              >
                {b}m
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* Options */}
      <div className="timer-settings-panel mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
          <div className="text-sm font-extrabold text-slate-900">Options</div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Decimal places
              </div>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                {[0, 1, 2, 3, 4].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Round paid time
              </div>
              <select
                value={roundTo}
                onChange={(e) => setRoundTo(Number(e.target.value) as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <option value={0}>No rounding</option>
                <option value={5}>Nearest 5 min</option>
                <option value={10}>Nearest 10 min</option>
                <option value={15}>Nearest 15 min</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="font-extrabold text-slate-900">Shortcuts</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>S</strong> start now, <strong>E</strong> end now
              </li>
              <li>
                <strong>C</strong> copy paid time, <strong>R</strong> reset
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-slate-900">Copy</div>
              <div className="mt-1 text-xs text-slate-600">
                Copy a compact payroll string
              </div>
            </div>

            <Btn
              kind="ghost"
              disabled={!result.ok}
              onClick={() =>
                result.ok && copy("Copied", `${paidHHMM} (${paidDec} hrs)`)
              }
            >
              Copy paid time
            </Btn>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-600">
                Tip: click the card once so shortcuts work.
              </div>
              <div className="text-xs text-slate-600">
                {lastCopied ? (
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-900">
                    {lastCopied}
                  </span>
                ) : (
                  <span>Shortcuts: S, E, C, R</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Btn
              kind="ghost"
              onClick={() => result.ok && copy("Copied", copyPayload)}
              disabled={!result.ok}
            >
              Copy summary
            </Btn>
            <Btn kind="ghost" onClick={reset}>
              Reset
            </Btn>
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function WorkHoursCalculatorPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/work-hours-calculator";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Work Hours Calculator",
        url,
        description:
          "Calculate hours worked for payroll with start time, end time, and break deduction. Supports overnight shifts and decimal hours.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work Hours Calculator",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <WorkHoursCalculatorCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Work Hours Calculator</span>
        </p>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}
