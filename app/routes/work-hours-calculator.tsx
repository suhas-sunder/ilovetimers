// app/routes/work-hours-calculator.tsx
import type { Route } from "./+types/work-hours-calculator";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Work Hours Calculator | Calculate Time Worked (Start, End, Break) + Payroll Hours";
  const description =
    "Free work hours calculator for payroll and time tracking. Enter start time, end time, and subtract break minutes to get total hours worked. Supports overnight shifts, decimal hours, and copyable results.";
  const url = "https://ilovetimers.com/work-hours-calculator";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "work hours calculator",
        "hours worked calculator",
        "payroll hours calculator",
        "time card calculator",
        "calculate hours worked",
        "subtract break",
        "overnight shift hours",
        "decimal hours",
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

    // Optional rounding of paid minutes
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
    ? `Paid: ${paidHHMM} (${paidDec} hrs). Shift: ${shiftHHMM}. Break: ${
        result.breakMin
      } min.${result.overnight ? " Overnight shift." : ""}`
    : "";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Work Hours Calculator
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Payroll-style hours: enter <strong>Start</strong>,{" "}
            <strong>End</strong>, and subtract a <strong>break</strong>. Works
            for overnight shifts.
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
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
      </div>

      {/* Options + Results */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-extrabold text-amber-950">Options</div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
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

            <label className="block">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Round paid time
              </div>
              <select
                value={roundTo}
                onChange={(e) => setRoundTo(Number(e.target.value) as any)}
                className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 font-semibold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value={0}>No rounding</option>
                <option value={5}>Nearest 5 min</option>
                <option value={10}>Nearest 10 min</option>
                <option value={15}>Nearest 15 min</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3 text-sm text-amber-900">
            <div className="font-extrabold text-amber-950">Notes</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                If End is earlier than Start, this assumes an{" "}
                <strong>overnight shift</strong> (into the next day).
              </li>
              <li>
                “Decimal hours” are useful for payroll systems (example: 7:30 =
                7.50).
              </li>
              <li>
                Shortcut: <strong>C</strong> copies a compact summary.{" "}
                <strong>R</strong> resets.
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
                Copyable payroll hours
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

          <div className="mt-3 rounded-xl border border-amber-200 bg-white p-4">
            {result.ok ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                    Paid time (after break)
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-3">
                    <div className="text-4xl font-extrabold text-amber-950">
                      {paidHHMM}
                    </div>
                    <div className="text-lg font-bold text-amber-900">
                      {paidDec} hrs
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                      Total shift
                    </div>
                    <div className="text-sm font-extrabold text-amber-950">
                      {shiftHHMM}
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                      Break
                    </div>
                    <div className="text-sm font-extrabold text-amber-950">
                      {result.breakMin} min
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
export default function WorkHoursCalculatorPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/work-hours-calculator";

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
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work Hours Calculator",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I calculate hours worked with a break?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Subtract the break minutes from the total time between start and end. This calculator does it instantly and shows both HH:MM and decimal hours.",
            },
          },
          {
            "@type": "Question",
            name: "Does this work for overnight shifts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. If the end time is earlier than the start time, the calculator assumes the shift continues into the next day.",
            },
          },
          {
            "@type": "Question",
            name: "What are decimal hours?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Decimal hours convert minutes into a fraction of an hour (example: 7:30 becomes 7.50). Many payroll systems prefer this format.",
            },
          },
          {
            "@type": "Question",
            name: "Can I round time to the nearest 15 minutes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the rounding option to round paid time to the nearest 5, 10, or 15 minutes.",
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
            / <span className="text-amber-950">Work Hours Calculator</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Work Hours Calculator (Start, End, Break)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Built for payroll and time tracking. Enter <strong>start</strong>{" "}
            and <strong>end</strong>, subtract a <strong>break</strong>, and get{" "}
            <strong>HH:MM</strong> plus <strong>decimal hours</strong>.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <WorkHoursCalculatorCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Payroll-style time worked calculator
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              A stopwatch is for timing something live. A{" "}
              <strong>work hours calculator</strong> is different: you already
              know the <strong>start time</strong>, <strong>end time</strong>,
              and your <strong>break</strong>, and you need accurate payroll
              hours fast.
            </p>

            <p>
              This calculator handles <strong>overnight shifts</strong> (end
              time earlier than start time) and can show results as{" "}
              <strong>decimal hours</strong> for timecards.
            </p>

            <p>
              If you need a live timer instead, try{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>{" "}
              or{" "}
              <Link to="/countdown" className="font-semibold hover:underline">
                Countdown
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Work Hours Calculator FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I calculate time worked with a break?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Calculate the total time between Start and End, then subtract
              break minutes. The “Paid time” result is what you typically enter
              for payroll.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What if my shift goes past midnight?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              If End is earlier than Start, this assumes the shift continues
              into the next day and marks it as an overnight shift.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why does payroll use decimal hours?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Many systems store time as a number. Example: 7 hours 30 minutes
              becomes 7.50 hours.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I round to the nearest 15 minutes?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use the rounding dropdown to round paid time to 5, 10, or 15
              minutes.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
