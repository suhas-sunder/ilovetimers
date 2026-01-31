// app/routes/time-calculator.tsx
import type { Route } from "./+types/time-calculator";
import { json } from "@remix-run/node";
import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Time Calculator (Add and Subtract Time)";
  const description =
    "Add or subtract time in seconds. Calculate time durations between two times with a simple, accurate time calculator.";

  const url = "https://ilovetimers.com/time-calculator";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://ilovetimers.com/og-image.jpg" },
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

function formatHMSD(sign: 1 | -1, v: HMSD) {
  const prefix = sign < 0 ? "-" : "";
  // Show days only if nonzero
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
   ADD/SUBTRACT CARD (D/H/M/S)
========================================================= */
function AddSubtractCard({
  mode,
}: {
  mode: "add" | "subtract";
}) {
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

  const setField =
    (which: "a" | "b", key: keyof HMSD) =>
    (v: string) => {
      const n = clamp(Number(v || 0), 0, key === "d" ? 9999 : 59);
      const max = key === "h" ? 23 : key === "m" || key === "s" ? 59 : 9999;
      const val = clamp(Math.floor(n), 0, max);
      if (which === "a") setA((x) => ({ ...x, [key]: val }));
      else setB((x) => ({ ...x, [key]: val }));
    };

  const resultText = `${formatHMSD(out.sign, out.v)} (${formatWords(
    out.sign,
    out.v
  )})`;

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-amber-950">
            {mode === "add" ? "Add Time Calculator" : "Subtract Time Calculator"}
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Add or subtract durations using days, hours, minutes, and seconds.
            Supports negative results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Btn kind="ghost" onClick={reset} className="py-2">
            Reset
          </Btn>
          <Btn kind="ghost" onClick={() => copy(resultText)} className="py-2">
            Copy result
          </Btn>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* A */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-extrabold text-amber-950">Time A</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["d", "h", "m", "s"] as const).map((k) => (
              <label key={`a-${k}`} className="block">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  {k === "d" ? "Days" : k === "h" ? "Hours" : k === "m" ? "Minutes" : "Seconds"}
                </div>
                <input
                  type="number"
                  min={0}
                  max={k === "d" ? 9999 : k === "h" ? 23 : 59}
                  value={a[k]}
                  onChange={(e) => setField("a", k)(e.target.value)}
                  className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </label>
            ))}
          </div>
        </div>

        {/* B */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-extrabold text-amber-950">Time B</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["d", "h", "m", "s"] as const).map((k) => (
              <label key={`b-${k}`} className="block">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  {k === "d" ? "Days" : k === "h" ? "Hours" : k === "m" ? "Minutes" : "Seconds"}
                </div>
                <input
                  type="number"
                  min={0}
                  max={k === "d" ? 9999 : k === "h" ? 23 : 59}
                  value={b[k]}
                  onChange={(e) => setField("b", k)(e.target.value)}
                  className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-4">
        <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
          Result
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <div className="text-4xl font-extrabold text-amber-950">
            {formatHMSD(out.sign, out.v)}
          </div>
          <div className="text-sm font-semibold text-amber-900">
            {formatWords(out.sign, out.v)}
          </div>
        </div>
        {lastCopied ? (
          <div className="mt-3 text-xs font-semibold text-slate-600">
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1">
              {lastCopied}
            </span>
          </div>
        ) : null}
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
    if (startSec == null) return { ok: false as const, error: "Enter a valid start time." };
    if (endSec == null) return { ok: false as const, error: "Enter a valid end time." };

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
    setStart(`${hh}:${mm}`);
    setEnd(includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`);
  }, [includeSeconds]);

  const shown = useMemo(() => {
    if (!res.ok) return "";
    const v = res.out.v;
    const sign = res.out.sign;
    // duration is always non-negative here, but keep format stable
    const base =
      v.d > 0
        ? `${v.d}d ${pad2(v.h)}:${pad2(v.m)}:${pad2(v.s)}`
        : `${v.h}:${pad2(v.m)}:${pad2(v.s)}`;

    if (!includeSeconds) {
      // hide seconds by zeroing in display
      const h = v.d > 0 ? `${v.d}d ${pad2(v.h)}:${pad2(v.m)}` : `${v.h}:${pad2(v.m)}`;
      return sign < 0 ? `-${h}` : h;
    }

    return sign < 0 ? `-${base}` : base;
  }, [res, includeSeconds]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    const k = e.key.toLowerCase();
    if (k === "n") {
      e.preventDefault();
      now();
    } else if (k === "c") {
      e.preventDefault();
      if (res.ok) {
        const copyText = `Duration: ${shown}${res.overnight ? " (overnight)" : ""}`;
        copy(copyText);
      }
    }
  };

  const copyText =
    res.ok ? `Duration: ${shown}${res.overnight ? " (overnight)" : ""}` : "";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-amber-950">
            Time Duration Calculator
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Find the duration between two times. If End is earlier than Start,
            it assumes the duration crosses midnight.
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

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={includeSeconds}
              onChange={(e) => {
                const on = e.target.checked;
                setIncludeSeconds(on);
                // normalize input to match mode
                if (!on) {
                  setStart((v) => v.slice(0, 5));
                  setEnd((v) => v.slice(0, 5));
                } else {
                  // keep seconds at :00 if missing
                  setStart((v) => (v.length === 5 ? `${v}:00` : v));
                  setEnd((v) => (v.length === 5 ? `${v}:00` : v));
                }
              }}
            />
            Seconds
          </label>

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
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <div className="text-sm font-extrabold text-amber-950">Start time</div>
          <input
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder={includeSeconds ? "09:00:00" : "09:00"}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-amber-900">
            Format: {includeSeconds ? "HH:MM:SS" : "HH:MM"} (24-hour)
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-amber-950">End time</div>
          <input
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder={includeSeconds ? "17:00:00" : "17:00"}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-amber-900">
            Shortcut: N now · C copy duration
          </div>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-4">
        <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
          Duration
        </div>
        {res.ok ? (
          <div className="mt-2 flex flex-col gap-1">
            <div className="text-4xl font-extrabold text-amber-950">{shown}</div>
            <div className="text-sm font-semibold text-amber-900">
              {formatWords(res.out.sign, res.out.v)}
              {res.overnight ? " (crosses midnight)" : ""}
            </div>
          </div>
        ) : (
          <div className="mt-2 text-sm font-semibold text-amber-900">
            {res.error}
          </div>
        )}

        {lastCopied ? (
          <div className="mt-3 text-xs font-semibold text-slate-600">
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1">
              {lastCopied}
            </span>
          </div>
        ) : null}
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
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabBtn active={tab === "add"} onClick={() => setTab("add")}>
          Add time
        </TabBtn>
        <TabBtn active={tab === "subtract"} onClick={() => setTab("subtract")}>
          Subtract time
        </TabBtn>
        <TabBtn active={tab === "duration"} onClick={() => setTab("duration")}>
          Duration
        </TabBtn>
        <div className="ml-1 text-xs font-semibold text-slate-600">
          Keyboard: 1 Add · 2 Subtract · 3 Duration
        </div>
      </div>

      {tab === "add" ? (
        <AddSubtractCard mode="add" />
      ) : tab === "subtract" ? (
        <AddSubtractCard mode="subtract" />
      ) : (
        <DurationCard />
      )}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function TimeCalculatorPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/time-calculator";

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
          { "@type": "ListItem", position: 1, name: "Home", item: "https://ilovetimers.com/" },
          { "@type": "ListItem", position: 2, name: "Time Calculator", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I add time (hours, minutes, seconds)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Enter Time A and Time B as durations, then the calculator adds them and shows the result in HH:MM:SS (and days when needed).",
            },
          },
          {
            "@type": "Question",
            name: "How do I subtract time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Enter Time A and Time B as durations. The calculator computes A minus B and can display negative results if B is larger.",
            },
          },
          {
            "@type": "Question",
            name: "How do I calculate time duration between two times?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use the Duration tab, enter a start time and end time. If the end time is earlier, it assumes the duration crosses midnight.",
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
            / <span className="text-amber-950">Time Calculator</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Time Calculator
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            One page for <strong>add time</strong>, <strong>subtract time</strong>,
            and <strong>time duration</strong>. Instant results, copy buttons,
            and sane handling of midnight.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <TimeCalculatorCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Add time, subtract time, or calculate a duration
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>time calculator</strong> covers three common use cases:
              adding durations (like 1h 20m + 45m), subtracting durations, and
              calculating the time between a <strong>start time</strong> and an{" "}
              <strong>end time</strong>.
            </p>

            <p>
              The Duration tab uses a practical rule: if the end time is earlier
              than the start time, it assumes the interval crosses midnight.
            </p>

            <p>
              If you need payroll style hours, use{" "}
              <Link to="/work-hours-calculator" className="font-semibold hover:underline">
                Work Hours Calculator
              </Link>
              . If you need a 24-hour converter, use{" "}
              <Link to="/military-time-converter" className="font-semibold hover:underline">
                Military Time Converter
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Time Calculator FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can this add and subtract days too?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. The Add and Subtract tabs include a Days field. Results show
              days when the total exceeds 24 hours.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Will it show negative results when subtracting?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. If Time B is larger than Time A, the result is negative.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does Duration handle overnight time differences?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. If End is earlier than Start, it assumes the duration crosses
              midnight and labels it as overnight.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a stopwatch?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. This is for calculations with known inputs. For live timing,
              use a stopwatch or countdown.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
