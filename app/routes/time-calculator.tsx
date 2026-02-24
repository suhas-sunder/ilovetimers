// app/routes/time-calculator.tsx
import type { Route } from "./+types/time-calculator";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Time Calculator (Add & Subtract Time, Instant Results)";
  const description =
    "Add or subtract time in seconds. Calculate time durations between two times with a simple, accurate time calculator.";

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

/**
 * Fit a single-line time string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const [fontPx, setFontPx] = useState<number>(minPx);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf: number | null = null;

    const compute = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;

      const rect = c.getBoundingClientRect();
      const availW = Math.max(0, rect.width - paddingAllowancePx);
      const availH = Math.max(0, rect.height - paddingAllowancePx);

      if (availW <= 0 || availH <= 0) return;

      const originalFontSize = (t as HTMLElement).style.fontSize;

      const fits = (px: number) => {
        (t as HTMLElement).style.fontSize = `${px}px`;
        const tr = t.getBoundingClientRect();
        return tr.width <= availW && tr.height <= availH;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      (t as HTMLElement).style.fontSize = originalFontSize;
      setFontPx(best);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontPx;
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
        : `cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
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
    className={[
      "cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold transition",
      active
        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ].join(" ")}
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
    maxPx: 360,
    paddingAllowancePx: 72,
  });

  return (
    <div
      ref={boxRef}
      className={[
        "relative mt-4 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-6 text-slate-950",
      ].join(" ")}
      style={{ minHeight: 280, userSelect: "none" }}
      aria-live="polite"
    >
      <div className="absolute left-3 top-3 flex items-center gap-2 sm:left-5 sm:top-5">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
          {label}
        </div>
        {status ? (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {status}
          </span>
        ) : null}
      </div>

      {right ? (
        <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
          {right}
        </div>
      ) : null}

      <span
        ref={textRef}
        className="mt-6 inline-block text-center font-mono font-extrabold tracking-widest"
        style={{
          fontSize: `${fitPx}px`,
          lineHeight: "1",
          transform: "translateZ(0)",
        }}
      >
        {bigText}
      </span>

      {subText ? (
        <div className="mt-3 text-center text-sm font-semibold text-slate-700">
          {subText}
        </div>
      ) : null}
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
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-sky-700">
            {mode === "add" ? "Add time" : "Subtract time"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use days, hours, minutes, and seconds. Subtract can go negative.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Btn kind="ghost" onClick={reset} className="py-2">
            Reset
          </Btn>
          <Btn kind="ghost" onClick={() => copy(resultText)} className="py-2">
            Copy result
          </Btn>
        </div>
      </div>

      <BigResultDisplay
        label="Result"
        bigText={big}
        subText={words}
        status={mode === "add" ? "Add" : "Subtract"}
      />

      {lastCopied ? (
        <div className="mt-3 text-xs font-semibold text-slate-600">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
            {lastCopied}
          </span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-extrabold text-slate-900">Time A</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["d", "h", "m", "s"] as const).map((k) => (
              <label key={`a-${k}`} className="block">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  {k === "d"
                    ? "Days"
                    : k === "h"
                      ? "Hours"
                      : k === "m"
                        ? "Minutes"
                        : "Seconds"}
                </div>
                <input
                  type="number"
                  min={0}
                  max={k === "d" ? 9999 : k === "h" ? 23 : 59}
                  value={a[k]}
                  onChange={(e) => setField("a", k)(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  inputMode="numeric"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-extrabold text-slate-900">Time B</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["d", "h", "m", "s"] as const).map((k) => (
              <label key={`b-${k}`} className="block">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  {k === "d"
                    ? "Days"
                    : k === "h"
                      ? "Hours"
                      : k === "m"
                        ? "Minutes"
                        : "Seconds"}
                </div>
                <input
                  type="number"
                  min={0}
                  max={k === "d" ? 9999 : k === "h" ? 23 : 59}
                  value={b[k]}
                  onChange={(e) => setField("b", k)(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  inputMode="numeric"
                />
              </label>
            ))}
          </div>
        </div>
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
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-sky-700">Duration</h2>
          <p className="mt-1 text-sm text-slate-600">
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

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includeSeconds}
              onChange={(e) => {
                const on = e.target.checked;
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

      <BigResultDisplay
        label={res.ok ? "Duration" : "Duration"}
        bigText={res.ok ? big : "—"}
        subText={res.ok ? words : res.error}
        status={
          res.ok && res.overnight ? "Overnight" : res.ok ? "OK" : "Invalid"
        }
      />

      {lastCopied ? (
        <div className="mt-3 text-xs font-semibold text-slate-600">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
            {lastCopied}
          </span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <div className="text-sm font-extrabold text-slate-900">
            Start time
          </div>
          <input
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder={includeSeconds ? "09:00:00" : "09:00"}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            inputMode="numeric"
          />
          <div className="mt-1 text-xs text-slate-600">
            Format: {includeSeconds ? "HH:MM:SS" : "HH:MM"} (24-hour)
          </div>
        </label>

        <label className="block">
          <div className="text-sm font-extrabold text-slate-900">End time</div>
          <input
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder={includeSeconds ? "17:00:00" : "17:00"}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            inputMode="numeric"
          />
          <div className="mt-1 text-xs text-slate-600">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-sky-700">
            Time Calculator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add durations, subtract durations, or find the duration between two
            times.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
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
          <div className="ml-1 text-xs font-semibold text-slate-600">
            Keyboard: 1 Add · 2 Subtract · 3 Duration
          </div>
        </div>
      </div>

      <div className="mt-4">
        {tab === "add" ? (
          <AddSubtractCard mode="add" />
        ) : tab === "subtract" ? (
          <AddSubtractCard mode="subtract" />
        ) : (
          <DurationCard />
        )}
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
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <TimeCalculatorCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Time Calculator</span>
        </p>
      </section>
    </main>
  );
}
