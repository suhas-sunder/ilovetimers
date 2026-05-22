// app/routes/work-hours-calculator.tsx
import type { Route } from "./+types/work-hours-calculator";
import { json } from "@remix-run/node";
import { useCallback, useMemo, useState } from "react";
import {
  Button as Btn,
  Field,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  Select,
  SeoBand,
  SettingsPanel,
  ShortcutHint,
  StatusChip as MiniPill,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
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
    "Calculate hours worked from start and end times. Subtract breaks and get total work hours instantly with a simple planning calculator.";

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
      content: "https://www.ilovetimers.com/og-image.png",
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
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-4 sm:p-6">
      <div className="timer-result-stack flex h-full flex-col">

      {/* Big Result Display */}
      <div
        data-display-stage
        className={[
          "timer-display-surface mt-4 flex flex-col items-center justify-start ilt-surface-muted p-4 text-center sm:p-6",
          "text-[var(--ilt-text-primary)]",
        ].join(" ")}
        style={{ minHeight: "clamp(320px, 42svh, 560px)" }}
        aria-live="polite"
      >
        {result.ok ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div>
              <div className="mt-2 flex flex-wrap items-baseline justify-center gap-4">
                <div
                  data-primary-display-value
                  className="timer-result-value font-mono font-extrabold leading-none text-[76px] sm:text-[144px]"
                >
                  {paidHHMM}
                </div>
                <div className="text-lg font-bold text-[var(--ilt-text-secondary)] sm:text-xl">
                  {paidDec} hrs
                </div>
              </div>
              <div className="timer-result-label ilt-content-label">
                Paid time (after break)
              </div>
            </div>

            <div className="grid w-full max-w-5xl gap-2 sm:grid-cols-3">
              <div className="timer-result-panel ilt-surface-muted px-3 py-2">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
                  Total shift
                </div>
                <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                  {shiftHHMM}
                </div>
              </div>

              <div className="timer-result-panel ilt-surface-muted px-3 py-2">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
                  Break
                </div>
                <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                  {result.breakMin} min
                </div>
              </div>

              <div className="timer-result-panel ilt-surface-muted px-3 py-2">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
                  Overnight?
                </div>
                <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                  {result.overnight ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {result.error}
          </div>
        )}
      </div>

      {/* Inputs */}
      <SettingsPanel className="mt-4 grid gap-4 lg:grid-cols-3">
        <label className="block">
          <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
            Start time
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full ilt-input-control px-3 py-2 text-lg font-bold"
            />
            <Btn kind="ghost" onClick={setNowStart} className="px-3 py-2">
              Now
            </Btn>
          </div>
          <div className="mt-1 ilt-helper-text">
            Shortcut: <span className="font-semibold">S</span> sets Start to now
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">End time</div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full ilt-input-control px-3 py-2 text-lg font-bold"
            />
            <Btn kind="ghost" onClick={setNowEnd} className="px-3 py-2">
              Now
            </Btn>
          </div>
          <div className="mt-1 ilt-helper-text">
            Shortcut: <span className="font-semibold">E</span> sets End to now
          </div>
        </label>

        <div className="block">
          <Field
            label="Subtract break (minutes)"
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
          />
          <PresetGroup className="mt-2" title="Break presets">
            {[0, 15, 30, 45, 60].map((b) => (
              <Chip
                key={b}
                onClick={() => setBreakMin(b)}
                active={b === breakMin}
              >
                {b}m
              </Chip>
            ))}
          </PresetGroup>
        </div>
      </SettingsPanel>

      {/* Options */}
      <SettingsPanel className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="timer-result-panel ilt-surface-muted p-4">
          <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">Options</div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

            <Select
                label="Round paid time"
                value={roundTo}
                onChange={(e) => setRoundTo(Number(e.target.value) as any)}
              >
                <option value={0}>No rounding</option>
                <option value={5}>Nearest 5 min</option>
                <option value={10}>Nearest 10 min</option>
                <option value={15}>Nearest 15 min</option>
              </Select>
          </div>

          <ShortcutHint className="mt-4 text-left sm:text-left">
            S start now / E end now / C copy paid time / R reset
          </ShortcutHint>
        </div>

        <div className="timer-result-panel ilt-surface-muted p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">Copy</div>
              <div className="mt-1 ilt-helper-text">
                Copy a compact work-hours summary
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

          <div className="timer-result-panel mt-3 ilt-surface-card p-3 text-sm text-[var(--ilt-text-secondary)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="ilt-helper-text font-semibold">
                Tip: click the card once so shortcuts work.
              </div>
              <div className="ilt-helper-text">
                {lastCopied ? (
                  <span className="ilt-surface-card px-2 py-1 font-semibold text-[var(--ilt-text-primary)]">
                    {lastCopied}
                  </span>
                ) : (
                  <span>Shortcuts: S, E, C, R</span>
                )}
              </div>
            </div>
          </div>

          <SecondaryActionRow className="timer-result-actions mt-3 sm:justify-start">
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
          </SecondaryActionRow>
        </div>
      </SettingsPanel>
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
          "Calculate hours worked from start time, end time, and break deduction for planning and checking time. Supports overnight shifts and decimal hours.",
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
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<WorkHoursCalculatorCard />}
        title="Work Hours Calculator"
        description="Calculate paid work time from start and end times, subtract breaks, support overnight shifts, and copy planning-friendly totals."
      />

      <SeoBand>
        <HowItWorks />
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}
