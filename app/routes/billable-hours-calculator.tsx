// app/routes/billable-hours-calculator.tsx
import type { Route } from "./+types/billable-hours-calculator";
import { json } from "@remix-run/node";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Billable Hours Calculator | Time Worked + Hourly Rate = Total (Freelancers & Lawyers)";
  const description =
    "Free billable hours calculator for freelancers, consultants, and lawyers. Enter start time, end time, break, and hourly rate to get billable hours (HH:MM + decimal) and total amount. Supports overnight and rounding to common billing increments.";
  const url = "https://ilovetimers.com/billable-hours-calculator";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "billable hours calculator",
        "hourly rate calculator",
        "freelance hours calculator",
        "lawyer billable hours",
        "billing increment calculator",
        "round to 6 minutes",
        "time tracking billing",
        "calculate billable time",
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

function formatMoney(amount: number, currency = "USD") {
  // Keep it simple and stable (no locale surprises). You can swap to Intl later if you want.
  const sign = amount < 0 ? "-" : "";
  const n = Math.abs(amount);
  const fixed = n.toFixed(2);
  return `${sign}${currency} ${fixed}`;
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
      billableMinRaw: number; // shift - break (before rounding)
      billableMin: number; // after rounding
      roundingMin: number;
      overnight: boolean;
      rate: number;
      total: number;
    }
  | {
      ok: false;
      error: string;
    };

function calcBillable(
  startMin: number | null,
  endMin: number | null,
  breakMin: number,
  rate: number,
  roundingMin: number,
): CalcResult {
  if (startMin == null) return { ok: false, error: "Enter a Start Time." };
  if (endMin == null) return { ok: false, error: "Enter an End Time." };

  const b = clamp(Math.floor(breakMin || 0), 0, 24 * 60);
  const r = clamp(Number.isFinite(rate) ? rate : 0, 0, 1_000_000);
  const round = clamp(Math.floor(roundingMin || 0), 0, 60);

  const overnight = endMin < startMin;
  const shift = overnight ? endMin + 24 * 60 - startMin : endMin - startMin;

  if (shift <= 0)
    return { ok: false, error: "End Time must be after Start Time." };
  if (b > shift)
    return { ok: false, error: "Break cannot exceed the total shift." };

  const billableRaw = shift - b;

  let billable = billableRaw;
  if (round > 0) {
    // Typical billing: round UP to the next increment (6, 10, 15)
    billable = Math.ceil(billableRaw / round) * round;
  }

  const hours = billable / 60;
  const total = hours * r;

  return {
    ok: true,
    shiftMin: shift,
    breakMin: b,
    billableMinRaw: billableRaw,
    billableMin: billable,
    roundingMin: round,
    overnight,
    rate: r,
    total,
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

const MiniPill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-950">
    {children}
  </span>
);

const ChipBtn = ({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
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

/* =========================================================
   CARD
========================================================= */
function BillableHoursCalculatorCard() {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [breakMin, setBreakMin] = useState(30);

  const [rate, setRate] = useState(150); // default feels "lawyer/freelance"
  const [currency, setCurrency] = useState<"USD" | "CAD" | "EUR" | "GBP">(
    "USD",
  );

  const [decimalPlaces, setDecimalPlaces] = useState(2);

  // Billing increments: 6 minutes = 0.1 hour, common for lawyers. Also 10, 15.
  const [roundingMin, setRoundingMin] = useState<0 | 6 | 10 | 15>(6);

  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const startMin = useMemo(() => parseTimeValue(start), [start]);
  const endMin = useMemo(() => parseTimeValue(end), [end]);

  const result = useMemo(
    () => calcBillable(startMin, endMin, breakMin, rate, roundingMin),
    [startMin, endMin, breakMin, rate, roundingMin],
  );

  const reset = useCallback(() => {
    setStart("09:00");
    setEnd("17:00");
    setBreakMin(30);
    setRate(150);
    setCurrency("USD");
    setDecimalPlaces(2);
    setRoundingMin(6);
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
        const hoursDec = minutesToDecimalHours(
          result.billableMin,
          decimalPlaces,
        );
        const text = `Billable: ${minutesToHhMm(result.billableMin)} (${hoursDec} hrs) @ ${currency} ${result.rate.toFixed(
          2,
        )}/hr = ${formatMoney(result.total, currency)}`;
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

  const summaryLine =
    result.ok && startMin != null && endMin != null
      ? `${formatTimeLabel(startMin)} → ${formatTimeLabel(endMin)}`
      : "";

  const billableHHMM = result.ok ? minutesToHhMm(result.billableMin) : "—";
  const billableDec = result.ok
    ? minutesToDecimalHours(result.billableMin, decimalPlaces)
    : "—";
  const totalMoney = result.ok ? formatMoney(result.total, currency) : "—";

  const rawHHMM = result.ok ? minutesToHhMm(result.billableMinRaw) : "—";

  const copyPayload = result.ok
    ? `Billable: ${billableHHMM} (${billableDec} hrs) @ ${currency} ${result.rate.toFixed(
        2,
      )}/hr = ${totalMoney}. Break: ${result.breakMin} min.${
        result.roundingMin ? ` Rounded up to ${result.roundingMin} min.` : ""
      }${result.overnight ? " Overnight shift." : ""}`
    : "";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Billable Hours Calculator
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Built for freelancers, consultants, and lawyers: calculate{" "}
            <strong>billable time</strong> and a <strong>total amount</strong>{" "}
            using an hourly rate and common billing increments.
          </p>

          {summaryLine ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MiniPill>{summaryLine}</MiniPill>
              {result.ok && result.overnight ? (
                <MiniPill>Overnight</MiniPill>
              ) : null}
              {roundingMin > 0 ? (
                <MiniPill>Rounded up: {roundingMin} min</MiniPill>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {/* Inputs */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <label className="block">
          <div className="text-sm font-extrabold text-amber-950">
            Start time
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Btn kind="ghost" onClick={setNowStart} className="px-3 py-2">
              Now
            </Btn>
          </div>
          <div className="mt-1 text-xs text-amber-900">
            Shortcut: <span className="font-semibold">S</span> sets Start to now
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-amber-950">End time</div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Btn kind="ghost" onClick={setNowEnd} className="px-3 py-2">
              Now
            </Btn>
          </div>
          <div className="mt-1 text-xs text-amber-900">
            Shortcut: <span className="font-semibold">E</span> sets End to now
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-amber-950">
            Subtract break (minutes)
          </div>
          <input
            type="number"
            min={0}
            max={24 * 60}
            value={breakMin}
            onChange={(e) =>
              setBreakMin(clamp(Number(e.target.value || 0), 0, 24 * 60))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 flex flex-wrap gap-2">
            {[0, 15, 30, 45, 60].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBreakMin(b)}
                className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                  b === breakMin
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                }`}
              >
                {b}m
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-amber-950">
            Rate per hour
          </div>
          <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
            <input
              type="number"
              min={0}
              step={0.01}
              value={rate}
              onChange={(e) =>
                setRate(clamp(Number(e.target.value || 0), 0, 1_000_000))
              }
              className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="rounded-lg border-2 border-amber-300 bg-white px-3 py-2 font-extrabold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Currency"
            >
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div className="mt-1 flex flex-wrap gap-2">
            {[75, 100, 150, 200, 300].map((r) => (
              <ChipBtn key={r} onClick={() => setRate(r)} active={r === rate}>
                {currency} {r}
              </ChipBtn>
            ))}
          </div>
        </label>
      </div>

      {/* Options + Results */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-extrabold text-amber-950">
            Billing options
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                Rounding increment
              </div>
              <select
                value={roundingMin}
                onChange={(e) => setRoundingMin(Number(e.target.value) as any)}
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 font-semibold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value={0}>No rounding</option>
                <option value={6}>6 min (0.1 hr)</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
              </select>
              <div className="mt-1 text-xs text-amber-900">
                Rounds <strong>up</strong> (common for billables).
              </div>
            </label>

            <label className="block">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                Decimal places
              </div>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 font-semibold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {[0, 1, 2, 3, 4].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3 text-sm text-amber-900">
            <div className="font-extrabold text-amber-950">
              How this calculator bills
            </div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Billable time = (End − Start) − Break.</li>
              <li>
                If End is earlier than Start, it assumes an{" "}
                <strong>overnight</strong> span.
              </li>
              <li>
                If rounding is enabled, it rounds billable time{" "}
                <strong>up</strong> to the next increment.
              </li>
              <li>
                Shortcuts: <strong>S</strong> start now · <strong>E</strong> end
                now · <strong>C</strong> copy · <strong>R</strong> reset
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-amber-950">
                Results
              </div>
              <div className="mt-1 text-xs text-amber-900">
                Billable hours + total amount
              </div>
            </div>

            <Btn
              kind="ghost"
              disabled={!result.ok}
              onClick={() =>
                result.ok &&
                copy(
                  "Copied",
                  `${billableHHMM} (${billableDec} hrs) = ${totalMoney}`,
                )
              }
            >
              Copy total
            </Btn>
          </div>

          <div className="mt-3 rounded-xl border border-amber-200 bg-white p-4">
            {result.ok ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                    Total amount
                  </div>
                  <div className="mt-1 text-4xl font-extrabold text-amber-950">
                    {totalMoney}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-amber-900">
                    {currency} {result.rate.toFixed(2)}/hr · {billableDec} hrs
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                      Billable time
                    </div>
                    <div className="text-sm font-extrabold text-amber-950">
                      {billableHHMM}
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                      Before rounding
                    </div>
                    <div className="text-sm font-extrabold text-amber-950">
                      {rawHHMM}
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                      Overnight?
                    </div>
                    <div className="text-sm font-extrabold text-amber-950">
                      {result.overnight ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <div className="font-extrabold text-amber-950">Break</div>
                  <div className="mt-1">
                    {result.breakMin} minutes subtracted.
                    {result.roundingMin
                      ? ` Billable time rounded up to ${result.roundingMin}-minute increments.`
                      : ""}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-amber-900">
                {result.error}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
              Shortcuts: S start now · E end now · C copy · R reset
            </div>
            <div className="text-xs text-slate-600">
              {lastCopied ? (
                <span className="rounded-lg border border-amber-200 bg-white px-2 py-1 font-semibold text-amber-950">
                  {lastCopied}
                </span>
              ) : (
                <span>Tip: click the card once so shortcuts work.</span>
              )}
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
export default function BillableHoursCalculatorPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/billable-hours-calculator";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Billable Hours Calculator",
        url,
        description:
          "Calculate billable hours and total cost using start time, end time, break deduction, hourly rate, and optional billing increments.",
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
            name: "Billable Hours Calculator",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What are billable hours?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Billable hours are the time you can charge to a client. This calculator subtracts breaks, optionally rounds to billing increments, and multiplies by your hourly rate.",
            },
          },
          {
            "@type": "Question",
            name: "What is 6-minute billing?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "6 minutes is a common legal billing increment equal to 0.1 hour. With rounding enabled, this calculator rounds billable time up to the next 6-minute block.",
            },
          },
          {
            "@type": "Question",
            name: "Does this handle overnight work sessions?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. If the end time is earlier than the start time, it assumes the work session continues into the next day.",
            },
          },
          {
            "@type": "Question",
            name: "How do I calculate the total amount from billable hours?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Total = (billable minutes ÷ 60) × hourly rate. The calculator shows both HH:MM and decimal hours plus the final amount.",
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
            / <span className="text-amber-950">Billable Hours Calculator</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Billable Hours Calculator (Hourly Rate + Total)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Designed for freelancers, consultants, and lawyers. Enter{" "}
            <strong>start</strong>, <strong>end</strong>, <strong>break</strong>
            , and an <strong>hourly rate</strong> to get billable hours and the{" "}
            total amount.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <BillableHoursCalculatorCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            A billable hours calculator built for real invoicing
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A general “work hours” tool tells you time worked. A{" "}
              <strong>billable hours calculator</strong> goes one step further:
              it applies an <strong>hourly rate</strong> and common billing
              rules like <strong>rounding to increments</strong>.
            </p>

            <p>
              If you only need payroll hours (no client billing), use{" "}
              <Link
                to="/work-hours-calculator"
                className="font-semibold hover:underline"
              >
                Work Hours Calculator
              </Link>
              . If you need to add or subtract durations, use{" "}
              <Link
                to="/time-calculator"
                className="font-semibold hover:underline"
              >
                Time Calculator
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Billable Hours Calculator FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this round up like real billing?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. If you choose a billing increment (like 6 minutes), the
              calculator rounds billable time <strong>up</strong> to the next
              block, which matches common invoicing practices.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is 6-minute billing (0.1 hour)?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It’s a common legal increment where time is billed in 6-minute
              blocks. Example: 7 minutes becomes 0.2 hours when rounding up.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use this for freelancing?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Set your hourly rate, optionally pick a rounding increment,
              and the tool gives you billable hours plus a total amount to put
              on an invoice.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it handle overnight sessions?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. If End is earlier than Start, it assumes the session crosses
              midnight into the next day.
            </div>
          </details>
        </div>
      </section>
      {/* Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">Disclaimer</h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This calculator provides estimates for convenience. Results can
              vary depending on your billing agreement, employer policy,
              timekeeping rules, and rounding requirements.
            </p>

            <p>
              If you enable rounding, the page applies the selected increment
              (for example 6, 10, or 15 minutes). Always verify your final
              billable time and total amount against your contract or firm
              policy.
            </p>

            <p>
              This tool is not legal, accounting, or tax advice. For official
              invoices, payroll, or compliance needs, confirm calculations with
              your organization’s approved process.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
