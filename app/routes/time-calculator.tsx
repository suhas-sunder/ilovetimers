// app/routes/time-calculator.tsx
import type { Route } from "./+types/time-calculator";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button as Btn,
  Field,
  PageShell,
  PresetGroup,
  PresetChip as TabBtn,
  SecondaryActionRow,
  SeoBand,
  ShortcutHint,
  StatusChip as MiniPill,
  Toggle,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Time Calculator (Add & Subtract Time, Instant Results)";
  const description =
    "Add or subtract time in seconds. Calculate durations between two times with a simple time calculator for planning and checking intervals.";

  const url = "https://www.ilovetimers.com/time-calculator";

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

type HMSD = { d: number; h: number; m: number; s: number };

function toSeconds(x: HMSD) {
  const d = Math.floor(x.d || 0);
  const h = Math.floor(x.h || 0);
  const m = Math.floor(x.m || 0);
  const s = Math.floor(x.s || 0);
  return d * 86400 + h * 3600 + m * 60 + s;
}

function fromSeconds(total: number): { sign: 1 | -1; v: HMSD } {
  const sign: 1 | -1 = total < 0 ? -1 : 1;
  let t = Math.abs(Math.floor(total));

  const d = Math.floor(t / 86400);
  t %= 86400;
  const h = Math.floor(t / 3600);
  t %= 3600;
  const m = Math.floor(t / 60);
  const s = t % 60;

  return { sign, v: { d, h, m, s } };
}

// "Clock-like" display string.
// - If days exist: "2d 03:04:05"
// - Else: "3:04:05"
// - Negative: prefixed with "-"
function formatHMSD(sign: 1 | -1, v: HMSD) {
  const prefix = sign < 0 ? "-" : "";
  if (v.d > 0) {
    return `${prefix}${v.d}d ${pad2(v.h)}:${pad2(v.m)}:${pad2(v.s)}`;
  }
  return `${prefix}${v.h}:${pad2(v.m)}:${pad2(v.s)}`;
}

function formatWords(sign: 1 | -1, v: HMSD) {
  const parts: string[] = [];
  if (v.d) parts.push(`${v.d} day${v.d === 1 ? "" : "s"}`);
  if (v.h) parts.push(`${v.h} hour${v.h === 1 ? "" : "s"}`);
  if (v.m) parts.push(`${v.m} minute${v.m === 1 ? "" : "s"}`);
  if (v.s || parts.length === 0)
    parts.push(`${v.s} second${v.s === 1 ? "" : "s"}`);

  const prefix = sign < 0 ? "− " : "";
  return prefix + parts.join(", ");
}

function parseTimeValueHHMMSS(v: string) {
  const s = (v || "").trim();
  // Accept "HH:MM" or "HH:MM:SS"
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  const ss = m[3] ? Number(m[3]) : 0;
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;
  if (ss < 0 || ss > 59) return null;
  return hh * 3600 + mm * 60 + ss;
}

function formatClockFromSeconds(secSinceMidnight: number) {
  let t = ((secSinceMidnight % 86400) + 86400) % 86400;
  const hh = Math.floor(t / 3600);
  t %= 3600;
  const mm = Math.floor(t / 60);
  const ss = t % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

/* =========================================================
   BIG RESULT DISPLAY (CLOCK-LIKE)
========================================================= */
function BigResultDisplay({
  label,
  bigText,
  subText,
  right,
  status,
}: {
  label: string;
  bigText: string;
  subText?: string;
  right?: React.ReactNode;
  status?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const fitPx = useFitText({
    containerRef: boxRef,
    textRef,
    deps: [bigText, status, label],
    minPx: 52,
    maxPx: 520,
    paddingAllowancePx: 72,
  });

  return (
    <div
      data-display-stage
      ref={boxRef}
      className="timer-display-surface relative flex flex-col items-center justify-start overflow-hidden ilt-surface-muted px-3 pb-3 pt-[clamp(0.25rem,0.8svh,0.625rem)] text-[var(--ilt-text-primary)] sm:px-6 sm:pb-6"
      style={{ minHeight: "clamp(320px, 42svh, 560px)", userSelect: "none" }}
      aria-live="polite"
    >
      <span
        ref={textRef}
        data-primary-display-value
        className="timer-result-value inline-block text-center font-mono font-extrabold tracking-widest"
        style={{
          fontSize: fitPx,
          lineHeight: "1",
          transform: "translateZ(0)",
        }}
      >
        {bigText}
      </span>

      {subText ? (
        <div className="timer-result-context mt-3 text-center text-sm font-semibold text-[var(--ilt-text-secondary)]">
          {subText}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="timer-result-label text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
          {label}
        </div>
        {status ? (
          <MiniPill className="normal-case tracking-normal">
            {status}
          </MiniPill>
        ) : null}
        {right}
      </div>
    </div>
  );
}

/* =========================================================
   ADD/SUBTRACT CARD (D/H/M/S)
========================================================= */
function AddSubtractCard({ mode }: { mode: "add" | "subtract" }) {
  const [a, setA] = useState<HMSD>({ d: 0, h: 1, m: 30, s: 0 });
  const [b, setB] = useState<HMSD>({ d: 0, h: 0, m: 45, s: 0 });
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const totalSeconds = useMemo(() => {
    const A = toSeconds(a);
    const B = toSeconds(b);
    return mode === "add" ? A + B : A - B;
  }, [a, b, mode]);

  const out = useMemo(() => fromSeconds(totalSeconds), [totalSeconds]);

  const reset = useCallback(() => {
    setA({ d: 0, h: 1, m: 30, s: 0 });
    setB({ d: 0, h: 0, m: 45, s: 0 });
  }, []);

  const copy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    setLastCopied(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setLastCopied(null), 900);
  }, []);

  const setField = useCallback(
    (which: "a" | "b", key: keyof HMSD) => (v: string) => {
      const max = key === "h" ? 23 : key === "m" || key === "s" ? 59 : 9999;
      const n = clamp(Number(v || 0), 0, max);
      const val = clamp(Math.floor(n), 0, max);
      if (which === "a") setA((x) => ({ ...x, [key]: val }));
      else setB((x) => ({ ...x, [key]: val }));
    },
    [],
  );

  const big = formatHMSD(out.sign, out.v);
  const words = formatWords(out.sign, out.v);

  const resultText = `${big} (${words})`;

  return (
    <Card className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0">
      <BigResultDisplay
        label="Result"
        bigText={big}
        subText={words}
        status={mode === "add" ? "Add" : "Subtract"}
      />

      <SecondaryActionRow className="timer-result-actions mt-4">
        <Btn kind="ghost" onClick={reset} className="py-2">
          Reset
        </Btn>
        <Btn kind="ghost" onClick={() => copy(resultText)} className="py-2">
          Copy result
        </Btn>
      </SecondaryActionRow>

      {lastCopied ? (
        <div className="mt-3 ilt-helper-text font-semibold">
          <span className="ilt-inline-pill px-2 py-1">
            {lastCopied}
          </span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="timer-result-panel ilt-surface-muted p-4">
          <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">Time A</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["d", "h", "m", "s"] as const).map((k) => (
              <Field
                key={`a-${k}`}
                label={
                  k === "d"
                    ? "Days"
                    : k === "h"
                      ? "Hours"
                      : k === "m"
                        ? "Minutes"
                        : "Seconds"
                }
                  type="number"
                  min={0}
                  max={k === "d" ? 9999 : k === "h" ? 23 : 59}
                  value={a[k]}
                  onChange={(e) => setField("a", k)(e.target.value)}
                  inputMode="numeric"
                />
            ))}
          </div>
        </div>

        <div className="timer-result-panel ilt-surface-muted p-4">
          <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">Time B</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["d", "h", "m", "s"] as const).map((k) => (
              <Field
                key={`b-${k}`}
                label={
                  k === "d"
                    ? "Days"
                    : k === "h"
                      ? "Hours"
                      : k === "m"
                        ? "Minutes"
                        : "Seconds"
                }
                  type="number"
                  min={0}
                  max={k === "d" ? 9999 : k === "h" ? 23 : 59}
                  value={b[k]}
                  onChange={(e) => setField("b", k)(e.target.value)}
                  inputMode="numeric"
                />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-3xl">
        <h2 className="text-xl font-extrabold text-[var(--ilt-text-primary)]">
          {mode === "add" ? "Add time" : "Subtract time"}
        </h2>
        <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
          Use days, hours, minutes, and seconds. Subtract can go negative.
        </p>
      </div>
    </Card>
  );
}

/* =========================================================
   DURATION CARD (START/END CLOCK TIMES)
========================================================= */
function DurationCard() {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [includeSeconds, setIncludeSeconds] = useState(false);

  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const startSec = useMemo(() => parseTimeValueHHMMSS(start), [start]);
  const endSec = useMemo(() => parseTimeValueHHMMSS(end), [end]);

  const res = useMemo(() => {
    if (startSec == null)
      return { ok: false as const, error: "Enter a valid start time." };
    if (endSec == null)
      return { ok: false as const, error: "Enter a valid end time." };

    const overnight = endSec < startSec;
    const diff = overnight ? endSec + 86400 - startSec : endSec - startSec;

    const out = fromSeconds(diff);

    return {
      ok: true as const,
      diffSeconds: diff,
      overnight,
      out,
      startNorm: formatClockFromSeconds(startSec),
      endNorm: formatClockFromSeconds(endSec),
    };
  }, [startSec, endSec]);

  const copy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    setLastCopied(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setLastCopied(null), 900);
  }, []);

  const now = useCallback(() => {
    const d = new Date();
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    setStart(includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`);
    setEnd(includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`);
  }, [includeSeconds]);

  const big = useMemo(() => {
    if (!res.ok) return "—";
    const v = res.out.v;
    if (!includeSeconds) {
      return v.d > 0
        ? `${v.d}d ${pad2(v.h)}:${pad2(v.m)}`
        : `${v.h}:${pad2(v.m)}`;
    }
    return v.d > 0
      ? `${v.d}d ${pad2(v.h)}:${pad2(v.m)}:${pad2(v.s)}`
      : `${v.h}:${pad2(v.m)}:${pad2(v.s)}`;
  }, [res, includeSeconds]);

  const words = useMemo(() => {
    if (!res.ok) return "";
    return (
      formatWords(res.out.sign, res.out.v) +
      (res.overnight ? " (crosses midnight)" : "")
    );
  }, [res]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    const k = e.key.toLowerCase();
    if (k === "n") {
      e.preventDefault();
      now();
    } else if (k === "c") {
      e.preventDefault();
      if (res.ok) {
        const copyText = `Duration: ${big}${res.overnight ? " (overnight)" : ""}`;
        copy(copyText);
      }
    }
  };

  const copyText = res.ok
    ? `Duration: ${big}${res.overnight ? " (overnight)" : ""}`
    : "";

  return (
    <Card
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-[var(--ilt-text-primary)]">Duration</h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
            Duration between two times. If End is earlier than Start, it crosses
            midnight.
          </p>
          {res.ok ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MiniPill>
                {res.startNorm} → {res.endNorm}
              </MiniPill>
              {res.overnight ? <MiniPill>Overnight</MiniPill> : null}
            </div>
          ) : null}
        </div>

        <SecondaryActionRow className="timer-result-actions sm:justify-end">
          <Toggle
            label="Seconds"
            checked={includeSeconds}
            onCheckedChange={(on) => {
              setIncludeSeconds(on);

              if (!on) {
                setStart((v) => v.slice(0, 5));
                setEnd((v) => v.slice(0, 5));
              } else {
                setStart((v) => (v.length === 5 ? `${v}:00` : v));
                setEnd((v) => (v.length === 5 ? `${v}:00` : v));
              }
            }}
          />

          <Btn kind="ghost" onClick={now} className="py-2">
            Use now
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => res.ok && copy(copyText)}
            disabled={!res.ok}
            className="py-2"
          >
            Copy
          </Btn>
        </SecondaryActionRow>
      </div>

      <BigResultDisplay
        label={res.ok ? "Duration" : "Duration"}
        bigText={res.ok ? big : "—"}
        subText={res.ok ? words : res.error}
        status={
          res.ok && res.overnight ? "Overnight" : res.ok ? "OK" : "Invalid"
        }
      />

      {lastCopied ? (
        <div className="mt-3 ilt-helper-text font-semibold">
          <span className="ilt-inline-pill px-2 py-1">
            {lastCopied}
          </span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Field
            label="Start time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder={includeSeconds ? "09:00:00" : "09:00"}
            inputMode="numeric"
            hint={`Format: ${includeSeconds ? "HH:MM:SS" : "HH:MM"} (24-hour)`}
          />

        <label className="block">
          <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">End time</div>
          <input
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder={includeSeconds ? "17:00:00" : "17:00"}
            className="mt-1 w-full ilt-input-control px-3 py-2 text-lg font-bold"
            inputMode="numeric"
          />
          <div className="mt-1 ilt-helper-text">
            Shortcut: N now · C copy duration
          </div>
        </label>
      </div>
    </Card>
  );
}

/* =========================================================
   MAIN TOOL CARD (TABS)
========================================================= */
function TimeCalculatorCard() {
  const [tab, setTab] = useState<"add" | "subtract" | "duration">("add");

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    if (e.key === "1") setTab("add");
    else if (e.key === "2") setTab("subtract");
    else if (e.key === "3") setTab("duration");
  };

  return (
    <div onKeyDown={onKeyDown} tabIndex={0} className="focus:outline-none">
      <div className="mt-4">
        {tab === "add" ? (
          <AddSubtractCard mode="add" />
        ) : tab === "subtract" ? (
          <AddSubtractCard mode="subtract" />
        ) : (
          <DurationCard />
        )}
      </div>

      <PresetGroup className="mt-4" title="Calculation mode">
          <TabBtn active={tab === "add"} onClick={() => setTab("add")}>
            Add
          </TabBtn>
          <TabBtn
            active={tab === "subtract"}
            onClick={() => setTab("subtract")}
          >
            Subtract
          </TabBtn>
          <TabBtn
            active={tab === "duration"}
            onClick={() => setTab("duration")}
          >
            Duration
          </TabBtn>
          <ShortcutHint className="ml-1 text-left sm:text-left">
            Keyboard: 1 Add · 2 Subtract · 3 Duration
          </ShortcutHint>
      </PresetGroup>

      <div className="mt-6 max-w-3xl">
        <div className="text-xl font-extrabold text-[var(--ilt-text-primary)]">
          Calculation modes
        </div>
        <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
          Add durations, subtract durations, or find the duration between two
          times.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function TimeCalculatorPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/time-calculator";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Time Calculator",
        url,
        description:
          "Add time, subtract time, and calculate time duration between two times. Supports days, hours, minutes, seconds, and overnight durations.",
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
            name: "Time Calculator",
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
        display={<TimeCalculatorCard />}
        title="Time Calculator"
        description="Add durations, subtract durations, or calculate the duration between two clock times with copy-ready results."
      />

      <SeoBand title="How this calculator works">
        <p>
          Use this time calculator for quick duration math: add time, subtract
          time, or compare two clock times. The result stays prominent while the
          inputs remain compact underneath for fast correction.
        </p>
        <p>
          Duration mode supports overnight time ranges, so an end time earlier
          than the start time is treated as crossing midnight. Add and subtract
          modes are useful when you already know the amount of time you want to
          apply to a starting value. Invalid entries show validation text instead
          of a misleading zero result.
        </p>
        <h3>Practical examples</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Add several durations to total lesson time, cooking steps, practice
            segments, or media lengths.
          </li>
          <li>
            Subtract a break or delay from a planned block when you need the
            remaining duration.
          </li>
          <li>
            Compare two clock times when you need the elapsed time between a
            start and end.
          </li>
          <li>
            Check a planned shift, call, study block, or countdown length before
            copying the final duration into another note or tool.
          </li>
        </ul>
        <h3>Add, subtract, and duration modes</h3>
        <p>
          Add mode answers questions like "what time is it 2 hours and 15
          minutes from now?" Subtract mode works the other direction. Duration
          mode compares two clock times and can handle a range that crosses
          midnight, which is common for late shifts, travel, events, and
          overnight tasks.
        </p>
        <h3>Notes and limitations</h3>
        <p>
          This calculator is intended for ordinary time math and planning. For
          payroll, legal, billing, or compliance records, verify the result
          against the system or rules that apply to that work.
        </p>
        <h3>Related calculators</h3>
        <p>
          For a focused start-time to end-time result, use the{" "}
          <a className="ilt-content-link" href="/time-duration-calculator">
            time duration calculator
          </a>
          . For hours remaining until a specific date and time, use the{" "}
          <a className="ilt-content-link" href="/hours-until-calculator">
            hours until calculator
          </a>
          . For calendar dates, use the{" "}
          <a className="ilt-content-link" href="/date-duration-calculator">
            date duration calculator
          </a>{" "}
          to count days between dates or the{" "}
          <a className="ilt-content-link" href="/date-calculator">
            date calculator
          </a>{" "}
          to add and subtract days, weeks, months, or years.
        </p>
        <p>
          For unit conversions, use the{" "}
          <a className="ilt-content-link" href="/milliseconds-converter">
            milliseconds converter
          </a>
          . For shift-style totals, try the{" "}
          <a className="ilt-content-link" href="/work-hours-calculator">
            work hours calculator
          </a>
          . For time zone date boundaries, use the{" "}
          <a className="ilt-content-link" href="/time-zone-converter">
            time zone converter
          </a>
          . For timing something live instead of calculating it ahead of time,
          open the{" "}
          <a className="ilt-content-link" href="/stopwatch">
            stopwatch
          </a>{" "}
          or a{" "}
          <a className="ilt-content-link" href="/countdown-timer">
            countdown timer
          </a>
          .
        </p>
        <h3>FAQ</h3>
        <p>
          <strong>Does this replace a timesheet or billing system?</strong> No.
          It is a planning and checking tool for time math. Use the rules,
          records, or systems that apply to formal work, billing, payroll, tax,
          legal, or compliance needs.
        </p>
        <p>
          <strong>Why does the duration cross midnight?</strong> If the end time
          is earlier than the start time, the calculator treats the end as the
          next day so late-night ranges can be checked without manual date math.
        </p>
      </SeoBand>
    </PageShell>
  );
}
