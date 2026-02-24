// app/routes/billable-hours-calculator.tsx
import type { Route } from "./+types/billable-hours-calculator";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Disclaimer from "~/clients/components/billable-hours-calculator/Disclaimer";
import FAQ from "~/clients/components/billable-hours-calculator/FAQ";
import KeyboardShortcuts from "~/clients/components/billable-hours-calculator/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/billable-hours-calculator/PopularUseCases";
import HowItWorks from "~/clients/components/binary-stopwatch/HowItWorks";

export function meta({}: Route.MetaArgs) {
  const title = "Billable Hours Calculator (Time, Rounding + Total Pay)";
  const description =
    "Free billable hours calculator for freelancers and lawyers. Enter start and end times, breaks, and hourly rate to calculate billable time and total pay with common rounding increments.";

  const url = "https://www.ilovetimers.com/billable-hours-calculator";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "billable hours calculator",
        "calculate billable hours",
        "hourly rate calculator",
        "lawyer billable hours",
        "freelance billing calculator",
        "billing increment calculator",
        "round billable time",
      ].join(", "),
    },
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

export function loader() {
  return json({ ok: true });
}

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

function formatMoney(amount: number, currency = "USD") {
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    const sign = safe < 0 ? "-" : "";
    const n = Math.abs(safe);
    return `${sign}${currency} ${n.toFixed(2)}`;
  }
}

type CalcResult =
  | {
      ok: true;
      shiftMin: number;
      breakMin: number;
      billableMinRaw: number;
      billableMin: number;
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

const CURRENCIES: { code: string; name: string }[] = [
  { code: "USD", name: "US Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "KRW", name: "South Korean Won" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "ZAR", name: "South African Rand" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "ILS", name: "Israeli New Shekel" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "RON", name: "Romanian Leu" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "PEN", name: "Peruvian Sol" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "UYU", name: "Uruguayan Peso" },
];

const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
  cardRef,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60",
      "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
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
  title,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const Chip = ({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? "bg-sky-700 text-white hover:bg-sky-600"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold text-slate-950">{value}</div>
      {sub ? (
        <div className="mt-1 text-sm font-semibold text-slate-700">{sub}</div>
      ) : null}
    </div>
  );
}

function BillableHoursCalculatorCard() {
  const printableRef = useRef<HTMLDivElement>(null);

  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [breakMin, setBreakMin] = useState(30);

  const [rate, setRate] = useState(150);
  const [currency, setCurrency] = useState<string>("USD");

  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [roundingMin, setRoundingMin] = useState<0 | 6 | 10 | 15>(6);

  const [toast, setToast] = useState<string | null>(null);

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

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 900);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyToClipboard(text);
      showToast(ok ? "Copied" : "Copy failed");
    },
    [showToast],
  );

  const setNowStart = useCallback(() => {
    const d = new Date();
    setStart(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
  }, []);

  const setNowEnd = useCallback(() => {
    const d = new Date();
    setEnd(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
  }, []);

  const onPrint = useCallback(() => {
    if (!result.ok) return;
    if (!printableRef.current) return;
    window.print();
  }, [result.ok]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    const k = e.key.toLowerCase();

    if (k === "r") {
      e.preventDefault();
      reset();
    } else if (k === "c") {
      e.preventDefault();
      if (result.ok) {
        const billableHHMM = minutesToHhMm(result.billableMin);
        const billableDec = minutesToDecimalHours(
          result.billableMin,
          decimalPlaces,
        );
        const totalMoney = formatMoney(result.total, currency);
        void copy(
          `Billable: ${billableHHMM} (${billableDec} hrs) @ ${currency} ${result.rate.toFixed(
            2,
          )}/hr = ${totalMoney}`,
        );
      }
    } else if (k === "s") {
      e.preventDefault();
      setNowStart();
    } else if (k === "e") {
      e.preventDefault();
      setNowEnd();
    } else if (k === "p") {
      e.preventDefault();
      onPrint();
    }
  };

  useEffect(() => {
    const onAfterPrint = () => {
      showToast("Print dialog opened");
    };
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, [showToast]);

  const summaryLine =
    result.ok && startMin != null && endMin != null
      ? `${formatTimeLabel(startMin)} → ${formatTimeLabel(endMin)}`
      : "";

  const billableHHMM = result.ok ? minutesToHhMm(result.billableMin) : "-";
  const billableDec = result.ok
    ? minutesToDecimalHours(result.billableMin, decimalPlaces)
    : "-";
  const totalMoney = result.ok ? formatMoney(result.total, currency) : "-";
  const rawHHMM = result.ok ? minutesToHhMm(result.billableMinRaw) : "-";

  const copyPayload = result.ok
    ? `Billable: ${billableHHMM} (${billableDec} hrs) @ ${currency} ${result.rate.toFixed(
        2,
      )}/hr = ${totalMoney}`
    : "";

  const statusLabel = result.ok ? "Ready" : "Fix inputs";

  const currencyName =
    CURRENCIES.find((c) => c.code === currency)?.name ?? currency;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: #fff !important; }
              .no-print { display: none !important; }
              .print-only { display: block !important; }
              .print-only * { color: #0f172a !important; }
              .print-wrap { padding: 0 !important; }
              @page { margin: 14mm; }
            }
            .print-only { display: none; }
          `,
        }}
      />

      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {summaryLine ? (
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                {summaryLine}
              </span>
              {result.ok && result.overnight ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  Overnight
                </span>
              ) : null}
              {roundingMin > 0 ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  Rounded up: {roundingMin} min
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-900">
            {statusLabel}
          </div>
          <Btn
            kind="ghost"
            onClick={() => result.ok && void copy(copyPayload)}
            disabled={!result.ok}
            className="py-2"
            title="Copy (C)"
          >
            Copy
          </Btn>
          <Btn
            kind="ghost"
            onClick={onPrint}
            disabled={!result.ok}
            className="py-2"
            title="Print / Save as PDF (P)"
          >
            Print
          </Btn>
          <Btn kind="ghost" onClick={reset} className="py-2" title="Reset (R)">
            Reset
          </Btn>
        </div>
      </div>

      <div className="no-print mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                Inputs
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Shortcuts: S start now | E end now | C copy | P print | R reset
              </div>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
              {statusLabel}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-base font-extrabold text-slate-900">
                Start time
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Uses your local time on this device.
              </div>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                />
                <Btn
                  kind="ghost"
                  onClick={setNowStart}
                  className="px-4 py-2"
                  title="Set Start to now (S)"
                >
                  Now
                </Btn>
              </div>
            </div>

            <div>
              <div className="text-base font-extrabold text-slate-900">
                End time
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Overnight is supported.
              </div>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                />
                <Btn
                  kind="ghost"
                  onClick={setNowEnd}
                  className="px-4 py-2"
                  title="Set End to now (E)"
                >
                  Now
                </Btn>
              </div>
            </div>

            <div>
              <div className="text-base font-extrabold text-slate-900">
                Break minutes
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Deducted from the shift.
              </div>
              <input
                type="number"
                min={0}
                max={24 * 60}
                value={breakMin}
                onChange={(e) =>
                  setBreakMin(clamp(Number(e.target.value || 0), 0, 24 * 60))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {[0, 15, 30, 45, 60].map((b) => (
                  <Chip
                    key={b}
                    active={b === breakMin}
                    onClick={() => setBreakMin(b)}
                  >
                    {b}m
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="text-base font-extrabold text-slate-900">
                Hourly rate
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Currency applies to totals.
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={rate}
                  onChange={(e) =>
                    setRate(clamp(Number(e.target.value || 0), 0, 1_000_000))
                  }
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                />

                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="cursor-pointer w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                  aria-label="Currency"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[75, 100, 150, 200, 300].map((r) => (
                  <Chip key={r} active={r === rate} onClick={() => setRate(r)}>
                    {currency} {r}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Rounding increment
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[0, 6, 10, 15].map((m) => (
                  <Chip
                    key={m}
                    active={roundingMin === (m as any)}
                    onClick={() => setRoundingMin(m as any)}
                  >
                    {m === 0 ? "None" : `${m} min`}
                  </Chip>
                ))}
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Rounds billable time up to the next increment.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Decimal places
              </div>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                className="cursor-pointer mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
              >
                {[0, 1, 2, 3, 4].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="mt-3 text-sm text-slate-600">
                Controls the displayed billable hours. Total is based on
                billable minutes.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                Results
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Billable time and total amount
              </div>
            </div>

            <Btn
              kind="ghost"
              disabled={!result.ok}
              onClick={() =>
                result.ok &&
                void copy(
                  `${billableHHMM} (${billableDec} hrs) = ${totalMoney}`,
                )
              }
              title="Copy total"
            >
              Copy total
            </Btn>
          </div>

          <div className="mt-3 grid gap-3" ref={printableRef}>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Total amount
              </div>
              <div className="mt-1 text-4xl font-extrabold text-emerald-900">
                {totalMoney}
              </div>
              {result.ok ? (
                <div className="mt-1 text-sm font-semibold text-emerald-800">
                  {currency} {result.rate.toFixed(2)}/hr · {billableDec} hrs
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Billable time" value={billableHHMM} />
              <Stat label="Before rounding" value={rawHHMM} />
              <Stat
                label="Overnight"
                value={result.ok ? (result.overnight ? "Yes" : "No") : "-"}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Inputs used
              </div>
              <div className="mt-2 grid gap-2 text-sm font-semibold text-slate-800 sm:grid-cols-2">
                <div>
                  Start: {startMin != null ? formatTimeLabel(startMin) : "-"}
                </div>
                <div>End: {endMin != null ? formatTimeLabel(endMin) : "-"}</div>
                <div>Break: {breakMin} min</div>
                <div>Currency: {currencyName}</div>
                <div>
                  Rounding: {roundingMin ? `${roundingMin} min (up)` : "None"}
                </div>
                <div>Rate: {formatMoney(rate, currency)} / hr</div>
              </div>
            </div>

            {!result.ok ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
                {result.error}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Break: {result.ok ? `${result.breakMin} min` : "-"}
              {result.ok && result.roundingMin
                ? ` · Rounded up: ${result.roundingMin} min`
                : ""}
            </div>

            {toast ? (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-900">
                {toast}
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Tip: click the card once so shortcuts work.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="print-only">
        <div className="print-wrap">
          <div className="text-xl font-extrabold">
            Billable Hours Calculator
          </div>
          <div className="mt-2 text-sm font-semibold">
            {summaryLine || "Time range"}
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Total amount
            </div>
            <div className="mt-1 text-3xl font-extrabold">{totalMoney}</div>
            {result.ok ? (
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {currency} {result.rate.toFixed(2)}/hr · {billableDec} hrs ·{" "}
                {roundingMin ? `Rounded up ${roundingMin} min` : "No rounding"}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Billable time
              </div>
              <div className="mt-1 text-lg font-extrabold">{billableHHMM}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Before rounding
              </div>
              <div className="mt-1 text-lg font-extrabold">{rawHHMM}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Overnight
              </div>
              <div className="mt-1 text-lg font-extrabold">
                {result.ok ? (result.overnight ? "Yes" : "No") : "-"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Inputs used
            </div>
            <div className="mt-2 grid gap-2 text-sm font-semibold text-slate-800 sm:grid-cols-2">
              <div>
                Start: {startMin != null ? formatTimeLabel(startMin) : "-"}
              </div>
              <div>End: {endMin != null ? formatTimeLabel(endMin) : "-"}</div>
              <div>Break: {breakMin} min</div>
              <div>Currency: {currencyName}</div>
              <div>
                Rounding: {roundingMin ? `${roundingMin} min (up)` : "None"}
              </div>
              <div>Rate: {formatMoney(rate, currency)} / hr</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function BillableHoursCalculatorPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/billable-hours-calculator";

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
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Billable Hours Calculator",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-slate-200 bg-white no-print">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Billable Hours Calculator
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Enter start and end times, subtract breaks, choose a rounding
            increment, and calculate billable time and total pay.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6 print-wrap">
        <div>
          <BillableHoursCalculatorCard />
        </div>

        <p className="text-sm text-slate-600 no-print">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Billable Hours Calculator</span>
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
