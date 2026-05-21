// app/routes/billable-hours-calculator.tsx
import type { Route } from "./+types/billable-hours-calculator";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  Field,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  Select,
  SeoBand,
  StatusChip,
  ToolFrame as Card,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import Disclaimer from "~/clients/components/billable-hours-calculator/Disclaimer";
import FAQ from "~/clients/components/billable-hours-calculator/FAQ";
import KeyboardShortcuts from "~/clients/components/billable-hours-calculator/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/billable-hours-calculator/PopularUseCases";
import HowItWorks from "~/clients/components/billable-hours-calculator/HowItWorks";

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
    <Card
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="timer-result-stack p-4 sm:p-6"
    >
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

      <div
        data-display-stage
        ref={printableRef}
        className="no-print timer-display-surface flex flex-col items-center justify-start text-center"
        aria-live="polite"
      >
        <div
          data-primary-display-value
          className="timer-result-value font-mono text-[clamp(64px,12vw,156px)] font-extrabold leading-none text-[var(--ilt-text-primary)]"
        >
          {totalMoney}
        </div>
        <div className="timer-result-label ilt-content-label">
          Total amount
        </div>
        {result.ok ? (
          <div className="timer-result-context mt-2 text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {currency} {result.rate.toFixed(2)}/hr · {billableDec} hrs
          </div>
        ) : (
          <div className="timer-result-context mt-2 text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {result.error}
          </div>
        )}

        <div className="timer-result-detail-grid mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Billable time", billableHHMM],
            ["Before rounding", rawHHMM],
            ["Overnight", result.ok ? (result.overnight ? "Yes" : "No") : "-"],
          ].map(([label, value]) => (
            <div key={label} className="timer-result-panel ilt-surface-muted px-3 py-2">
              <div className="ilt-content-label">{label}</div>
              <div className="mt-1 text-xl font-extrabold text-[var(--ilt-text-primary)]">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {summaryLine ? (
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--ilt-text-secondary)]">
              <span className="ilt-inline-pill px-3 py-1">
                {summaryLine}
              </span>
              {result.ok && result.overnight ? (
                <span className="ilt-inline-pill px-3 py-1">
                  Overnight
                </span>
              ) : null}
              {roundingMin > 0 ? (
                <span className="ilt-inline-pill px-3 py-1">
                  Rounded up: {roundingMin} min
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <SecondaryActionRow className="timer-result-actions sm:justify-end">
          <StatusChip className="normal-case tracking-normal">
            {statusLabel}
          </StatusChip>
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
        </SecondaryActionRow>
      </div>

      <div className="no-print mt-6 grid gap-4 lg:grid-cols-3">
        <div className="timer-result-panel ilt-surface-muted p-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                Inputs
              </div>
              <div className="mt-1 text-xs text-[var(--ilt-text-secondary)]">
                Shortcuts: S start now | E end now | C copy | P print | R reset
              </div>
            </div>
            <StatusChip className="normal-case tracking-normal">
              {statusLabel}
            </StatusChip>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <Field
                  label="Start time"
                  hint="Uses your local time on this device."
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
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
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <Field
                  label="End time"
                  hint="Overnight is supported."
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
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
              <Field
                label="Break minutes"
                type="number"
                min={0}
                max={24 * 60}
                value={breakMin}
                onChange={(e) =>
                  setBreakMin(clamp(Number(e.target.value || 0), 0, 24 * 60))
                }
                hint="Deducted from the shift."
              />
              <PresetGroup className="mt-3" title="Break presets">
                {[0, 15, 30, 45, 60].map((b) => (
                  <Chip
                    key={b}
                    active={b === breakMin}
                    onClick={() => setBreakMin(b)}
                  >
                    {b}m
                  </Chip>
                ))}
              </PresetGroup>
            </div>

            <div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <Field
                  label="Hourly rate"
                  type="number"
                  min={0}
                  step={0.01}
                  value={rate}
                  onChange={(e) =>
                    setRate(clamp(Number(e.target.value || 0), 0, 1_000_000))
                  }
                />

                <Select
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <PresetGroup className="mt-3" title="Rate presets">
                {[75, 100, 150, 200, 300].map((r) => (
                  <Chip key={r} active={r === rate} onClick={() => setRate(r)}>
                    {currency} {r}
                  </Chip>
                ))}
              </PresetGroup>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="timer-result-panel ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
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
              <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                Rounds billable time up to the next increment.
              </div>
            </div>

            <div className="timer-result-panel ilt-surface-card p-4">
              <Select
                label="Decimal places"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
              <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                Controls the displayed billable hours. Total is based on
                billable minutes.
              </div>
            </div>
          </div>
        </div>

        <div className="timer-result-panel ilt-surface-muted p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                Results
              </div>
              <div className="mt-1 text-xs text-[var(--ilt-text-secondary)]">
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

          <div className="mt-3 grid gap-3">
            <div className="timer-result-panel ilt-surface-card p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--ilt-text-muted)]">
                Total amount
              </div>
              <div className="mt-1 text-4xl font-extrabold text-[var(--ilt-text-primary)]">
                {totalMoney}
              </div>
              {result.ok ? (
                <div className="mt-1 text-sm font-semibold text-[var(--ilt-text-secondary)]">
                  {currency} {result.rate.toFixed(2)}/hr · {billableDec} hrs
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Billable time", billableHHMM],
                ["Before rounding", rawHHMM],
                [
                  "Overnight",
                  result.ok ? (result.overnight ? "Yes" : "No") : "-",
                ],
              ].map(([label, value]) => (
                <div key={label} className="timer-result-panel ilt-surface-card p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-[var(--ilt-text-muted)]">
                    {label}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-[var(--ilt-text-primary)]">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="timer-result-panel ilt-surface-card p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--ilt-text-muted)]">
                Inputs used
              </div>
              <div className="mt-2 grid gap-2 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:grid-cols-2">
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
              <div className="ilt-surface-accent p-3 text-sm font-semibold text-[var(--ilt-text-primary)]">
                {result.error}
              </div>
            ) : null}
          </div>

          <UtilityResultRow className="mt-4">
            <div className="text-xs text-[var(--ilt-text-secondary)]">
              Break: {result.ok ? `${result.breakMin} min` : "-"}
              {result.ok && result.roundingMin
                ? ` · Rounded up: ${result.roundingMin} min`
                : ""}
            </div>

            {toast ? (
              <span className="ilt-inline-pill px-2 py-1 text-xs font-semibold text-[var(--ilt-text-primary)]">
                {toast}
              </span>
            ) : (
              <span className="text-xs text-[var(--ilt-text-muted)]">
                Tip: click the card once so shortcuts work.
              </span>
            )}
          </UtilityResultRow>
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
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
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
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Billable time
              </div>
              <div className="mt-1 text-lg font-extrabold">{billableHHMM}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Before rounding
              </div>
              <div className="mt-1 text-lg font-extrabold">{rawHHMM}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Overnight
              </div>
              <div className="mt-1 text-lg font-extrabold">
                {result.ok ? (result.overnight ? "Yes" : "No") : "-"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 p-4">
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
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="print-wrap">
        <ToolHero
          display={<BillableHoursCalculatorCard />}
          title="Billable Hours Calculator"
          description="Enter start and end times, subtract breaks, choose rounding, and calculate billable time plus total pay."
        />
      </div>

      <SeoBand className="no-print">
        <HowItWorks />
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}
