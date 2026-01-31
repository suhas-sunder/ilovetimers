// app/routes/fibonacci-clock.tsx
import type { Route } from "./+types/fibonacci-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Fibonacci Clock | A Live Clock Made of Fibonacci Squares (Time Zones)";
  const description =
    "Free Fibonacci clock that shows the time using Fibonacci squares (1, 1, 2, 3, 5). View live local time, switch time zones, explore manually, go fullscreen, and copy the output.";
  const url = "https://ilovetimers.com/fibonacci-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "fibonacci clock",
        "fibonacci time",
        "fibonacci squares clock",
        "clock fibonacci",
        "fibonacci clock time zone",
        "fibonacci clock fullscreen",
      ].join(", "),
    },
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
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
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

const pad2 = (n: number) => String(n).padStart(2, "0");

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function formatDateLine(d: Date, timeZone?: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      ...(timeZone ? { timeZone } : {}),
    })
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return d.toDateString();
  }
}

function getTimePartsForZone(date: Date, timeZone: string) {
  // Use formatToParts to reliably get hour/min/sec for a target time zone.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const hour24 = Number(map.hour ?? "0");
  const minute = Number(map.minute ?? "0");
  const second = Number(map.second ?? "0");
  return { hour24, minute, second };
}

function formatHHMMSS(h24: number, m: number, s: number) {
  return `${pad2(h24)}:${pad2(m)}:${pad2(s)}`;
}

/* =========================================================
   FIBONACCI CLOCK LOGIC
========================================================= */
// Tiles: 1, 1, 2, 3, 5 (sum = 12)
// State per tile:
//  - white: counts for neither
//  - hour: counts toward hours
//  - minute: counts toward minutes
//  - both: counts toward both
//
// Hours: sum(hour + both) -> 1..12
// Minutes: sum(minute + both) * 5 -> 0..55 (rounded to nearest 5)
type TileId = "a1" | "b1" | "t2" | "t3" | "t5";
type TileState = "white" | "hour" | "minute" | "both";

type Tile = {
  id: TileId;
  size: number;
  state: TileState;
};

const TILE_SIZES: Record<TileId, number> = {
  a1: 1,
  b1: 1,
  t2: 2,
  t3: 3,
  t5: 5,
};

function roundMinutesToNearest5(min: number) {
  // 0..59 -> nearest multiple of 5 (0..60)
  return Math.round(min / 5) * 5;
}

function chooseSubsetForSum(sum: number, idsInOrder: TileId[]) {
  let remaining = sum;
  const chosen = new Set<TileId>();
  for (const id of idsInOrder) {
    const v = TILE_SIZES[id];
    if (v <= remaining) {
      chosen.add(id);
      remaining -= v;
    }
    if (remaining === 0) break;
  }
  return { chosen, remaining };
}

function buildFibonacciStates(opts: { hour12: number; minute5: number }) {
  const H = clamp(opts.hour12, 1, 12);
  const M = clamp(Math.floor(opts.minute5 / 5), 0, 11); // 0..11

  const order: TileId[] = ["t5", "t3", "t2", "a1", "b1"];

  // Try to maximize overlap (both tiles) to make patterns look "balanced".
  let overlapTarget = Math.min(H, M);
  while (overlapTarget >= 0) {
    const tryBoth = chooseSubsetForSum(overlapTarget, order);
    if (tryBoth.remaining !== 0) {
      overlapTarget--;
      continue;
    }

    const usedSum = overlapTarget;
    const hLeft = H - usedSum;
    const mLeft = M - usedSum;

    const remainingIds = order.filter((id) => !tryBoth.chosen.has(id));
    const tryHour = chooseSubsetForSum(hLeft, remainingIds);
    if (tryHour.remaining !== 0) {
      overlapTarget--;
      continue;
    }

    const remaining2 = remainingIds.filter((id) => !tryHour.chosen.has(id));
    const tryMin = chooseSubsetForSum(mLeft, remaining2);
    if (tryMin.remaining !== 0) {
      overlapTarget--;
      continue;
    }

    const tiles: Tile[] = order.map((id) => {
      let state: TileState = "white";
      if (tryBoth.chosen.has(id)) state = "both";
      else if (tryHour.chosen.has(id)) state = "hour";
      else if (tryMin.chosen.has(id)) state = "minute";
      return { id, size: TILE_SIZES[id], state };
    });

    return { tiles, hour12: H, minute5: M * 5 };
  }

  // Fallback: no overlap
  const hourPick = chooseSubsetForSum(H, order);
  const remainingIds = order.filter((id) => !hourPick.chosen.has(id));
  const minPick = chooseSubsetForSum(M, remainingIds);

  const tiles: Tile[] = order.map((id) => {
    let state: TileState = "white";
    if (hourPick.chosen.has(id)) state = "hour";
    else if (minPick.chosen.has(id)) state = "minute";
    return { id, size: TILE_SIZES[id], state };
  });

  return { tiles, hour12: H, minute5: M * 5 };
}

/* =========================================================
   UI PRIMITIVES (same style as Home/Pomodoro)
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
   TIME ZONE LIST
========================================================= */
type ZoneOpt = { id: string; label: string };

const COMMON_ZONES: ZoneOpt[] = [
  { id: "local", label: "Local (device)" },
  { id: "UTC", label: "UTC" },
  { id: "America/New_York", label: "America/New_York" },
  { id: "America/Chicago", label: "America/Chicago" },
  { id: "America/Denver", label: "America/Denver" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles" },
  { id: "America/Toronto", label: "America/Toronto" },
  { id: "America/Vancouver", label: "America/Vancouver" },
  { id: "Europe/London", label: "Europe/London" },
  { id: "Europe/Paris", label: "Europe/Paris" },
  { id: "Europe/Berlin", label: "Europe/Berlin" },
  { id: "Asia/Kolkata", label: "Asia/Kolkata" },
  { id: "Asia/Dubai", label: "Asia/Dubai" },
  { id: "Asia/Singapore", label: "Asia/Singapore" },
  { id: "Asia/Tokyo", label: "Asia/Tokyo" },
  { id: "Australia/Sydney", label: "Australia/Sydney" },
];

/* =========================================================
   FIBONACCI CLOCK CARD
========================================================= */
type Mode = "live" | "manual";

function FibonacciClockCard() {
  const deviceTz = useMemo(() => safeTimeZone(), []);
  const [zoneId, setZoneId] = useState<string>("local");
  const zone = zoneId === "local" ? deviceTz : zoneId;

  const [mode, setMode] = useState<Mode>("live");

  // Manual controls are in the selected time zone context (user intent: "show fibonacci values for a time").
  const [manualHour24, setManualHour24] = useState<number>(12);
  const [manualMinute, setManualMinute] = useState<number>(0);

  const [now, setNow] = useState<Date>(() => new Date());
  const [copied, setCopied] = useState(false);

  // Live tick: update each second (users expect a clock).
  useEffect(() => {
    if (mode !== "live") return;
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, [mode]);

  // When switching to manual, seed manual time from the current selected zone.
  useEffect(() => {
    if (mode !== "manual") return;
    const base = new Date();
    try {
      const parts = getTimePartsForZone(base, zone);
      setManualHour24(parts.hour24);
      setManualMinute(parts.minute);
    } catch {
      // If zone fails, fall back to device time.
      setManualHour24(base.getHours());
      setManualMinute(base.getMinutes());
    }
  }, [mode, zone]);

  // Selected time parts (source of truth for rendering).
  const timeParts = useMemo(() => {
    if (mode === "manual") {
      return {
        hour24: clamp(manualHour24, 0, 23),
        minute: clamp(manualMinute, 0, 59),
        second: 0,
      };
    }
    try {
      return getTimePartsForZone(now, zone);
    } catch {
      // Fallback to device time if Intl fails.
      return {
        hour24: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
      };
    }
  }, [mode, manualHour24, manualMinute, now, zone]);

  const minuteRoundedTo5 = useMemo(() => {
    const rounded = roundMinutesToNearest5(timeParts.minute); // 0..60
    return rounded;
  }, [timeParts.minute]);

  const carriedHour24 = useMemo(() => {
    // If minutes round to 60, display 00 and carry hour +1.
    if (minuteRoundedTo5 === 60) return (timeParts.hour24 + 1) % 24;
    return timeParts.hour24;
  }, [minuteRoundedTo5, timeParts.hour24]);

  const displayMinute5 = useMemo(
    () => (minuteRoundedTo5 === 60 ? 0 : minuteRoundedTo5),
    [minuteRoundedTo5],
  );

  const hour12ForFib = useMemo(() => {
    // Fibonacci clock hours are 1..12.
    const h12 = carriedHour24 % 12 || 12;
    return h12;
  }, [carriedHour24]);

  const fib = useMemo(() => {
    return buildFibonacciStates({
      hour12: hour12ForFib,
      minute5: displayMinute5,
    });
  }, [hour12ForFib, displayMinute5]);

  const decHHMMSS = useMemo(
    () => formatHHMMSS(timeParts.hour24, timeParts.minute, timeParts.second),
    [timeParts],
  );
  const fibHHMM = useMemo(
    () => `${hour12ForFib}:${pad2(displayMinute5)}`,
    [hour12ForFib, displayMinute5],
  );

  const dateText = useMemo(() => {
    // For manual mode, date isn't meaningful unless we also choose a date.
    // Still show today's date in the chosen zone as a helpful context.
    try {
      return formatDateLine(new Date(), zone);
    } catch {
      return formatDateLine(new Date());
    }
  }, [zone, mode]);

  const roundingText = useMemo(() => {
    const r = minuteRoundedTo5;
    if (r === timeParts.minute)
      return "Minutes are exactly on a 5-minute step.";
    if (r === 60) return "Minutes round up to :00 (hour carries +1).";
    return `Minutes rounded to nearest 5 → ${pad2(r)}.`;
  }, [minuteRoundedTo5, timeParts.minute]);

  const copyText = useMemo(() => {
    const hourTiles =
      fib.tiles
        .filter((t) => t.state === "hour" || t.state === "both")
        .map((t) => t.size)
        .join("+") || "0";
    const minTiles =
      fib.tiles
        .filter((t) => t.state === "minute" || t.state === "both")
        .map((t) => t.size)
        .join("+") || "0";

    return [
      `Fibonacci time: ${fibHHMM} (minutes in 5s)`,
      `Decimal time: ${decHHMMSS} (${zoneId === "local" ? deviceTz : zoneId})`,
      `Rounding: ${roundingText}`,
      `Hours tiles: ${hourTiles} = ${hour12ForFib}`,
      `Minutes tiles: ${minTiles} × 5 = ${displayMinute5}`,
      `Date: ${dateText}`,
    ].join("\n");
  }, [
    fib,
    fibHHMM,
    decHHMMSS,
    zoneId,
    deviceTz,
    roundingText,
    hour12ForFib,
    displayMinute5,
    dateText,
  ]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const displayWrapRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && displayWrapRef.current)
      toggleFullscreen(displayWrapRef.current);
    else if (k === "c") copy();
    else if (k === "l") setMode("live");
    else if (k === "e") setMode("manual");
  };

  const legend = useMemo(
    () => [
      { key: "hour", label: "Hours", desc: "Red tiles" },
      { key: "minute", label: "Minutes", desc: "Green tiles × 5" },
      { key: "both", label: "Both", desc: "Blue tiles count for both" },
      { key: "white", label: "None", desc: "White tiles count for neither" },
    ],
    [],
  );

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Fibonacci Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Live Fibonacci time (1,1,2,3,5 squares). Switch time zones or
            explore manually.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <span className="text-amber-900">Zone</span>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-amber-950"
            >
              {COMMON_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <span className="text-amber-900">Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-amber-950"
            >
              <option value="live">Live</option>
              <option value="manual">Explore</option>
            </select>
          </label>

          <Btn kind="ghost" onClick={copy} className="py-2">
            {copied ? "Copied" : "Copy"}
          </Btn>

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
      </div>

      {/* Manual controls */}
      {mode === "manual" ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="block text-sm font-semibold text-amber-950">
            Hour (0–23)
            <input
              type="number"
              min={0}
              max={23}
              value={manualHour24}
              onChange={(e) =>
                setManualHour24(clamp(Number(e.target.value || 0), 0, 23))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="mt-1 text-xs text-amber-800">
              Used as the time in the selected zone.
            </div>
          </label>

          <label className="block text-sm font-semibold text-amber-950">
            Minute (0–59)
            <input
              type="number"
              min={0}
              max={59}
              value={manualMinute}
              onChange={(e) =>
                setManualMinute(clamp(Number(e.target.value || 0), 0, 59))
              }
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="mt-1 text-xs text-amber-800">
              Minutes are rounded to the nearest 5.
            </div>
          </label>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Explore tips
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Try minutes like 12, 13, 14 to see rounding.</li>
              <li>Try 58–59 minutes to see hour carry behavior.</li>
              <li>Switch zones to compare Fibonacci patterns.</li>
            </ul>
          </div>
        </div>
      ) : null}

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 520 }}
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
                width:min(1200px, 100%);
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(64px, 12vw, 160px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
                white-space:nowrap;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 520 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 text-center">
              {mode === "live" ? "Live" : "Explore"} ·{" "}
              {zoneId === "local" ? deviceTz : zoneId} · Fibonacci clock
            </div>

            <div className="grid w-full max-w-[980px] gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Decimal time
                </div>
                <div className="mt-2 font-mono text-4xl font-extrabold tracking-widest text-amber-950 sm:text-5xl">
                  {decHHMMSS}
                </div>
                <div className="mt-2 text-xs font-semibold text-amber-800">
                  {dateText}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Fibonacci time
                </div>
                <div className="mt-2 font-mono text-4xl font-extrabold tracking-widest text-amber-950 sm:text-5xl">
                  {fibHHMM}
                </div>
                <div className="mt-2 text-sm font-semibold text-amber-900">
                  {roundingText}
                </div>
              </div>
            </div>

            <div className="w-full max-w-[980px]">
              <FibonacciBoard tiles={fib.tiles} dark={false} />
            </div>

            <div className="grid w-full max-w-[980px] gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Legend
                </div>
                <div className="mt-3 grid gap-2">
                  {legend.map((l) => (
                    <div
                      key={l.key}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Swatch state={l.key as TileState} />
                        <span className="font-semibold text-amber-950">
                          {l.label}
                        </span>
                      </div>
                      <span className="text-amber-800">{l.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  How to read
                </div>
                <div className="mt-2 text-sm leading-relaxed text-amber-900">
                  Add the sizes of <strong>red</strong> + <strong>blue</strong>{" "}
                  tiles for the hour (1–12). Add the sizes of{" "}
                  <strong>green</strong> + <strong>blue</strong> tiles, then
                  multiply by 5 for minutes (0–55).
                </div>
                <div className="mt-3 text-xs font-semibold text-amber-800">
                  Shortcuts: F fullscreen · C copy · L live · E explore
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Fibonacci Clock</div>

            <div className="fs-time">{fibHHMM}</div>
            <div className="fs-sub">
              {zoneId === "local" ? deviceTz : zoneId} ·{" "}
              {mode === "live" ? "Live" : "Explore"} · {roundingText}
            </div>

            <div className="w-full" style={{ maxWidth: 980 }}>
              <FibonacciBoard tiles={fib.tiles} dark />
            </div>

            <div className="fs-help">
              F fullscreen · C copy · L live · E explore
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: F fullscreen · C copy · L live · E explore
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   FIBONACCI BOARD LAYOUT
========================================================= */
// Layout (8x5 grid):
// 5 tile: columns 1-5, rows 1-5
// 3 tile: columns 6-8, rows 1-3
// 2 tile: columns 6-7, rows 4-5
// 1 tile: column 8 row 4
// 1 tile: column 8 row 5
function FibonacciBoard({ tiles, dark }: { tiles: Tile[]; dark: boolean }) {
  const byId = useMemo(() => {
    const m = new Map<TileId, Tile>();
    for (const t of tiles) m.set(t.id, t);
    return m;
  }, [tiles]);

  const palette = useMemo(() => {
    // Crisp, readable colors. In dark mode, use higher saturation.
    return dark
      ? {
          white: "rgba(255,255,255,.06)",
          hour: "rgba(244,63,94,.88)", // rose
          minute: "rgba(34,197,94,.85)", // green
          both: "rgba(59,130,246,.88)", // blue
          border: "rgba(255,255,255,.18)",
          text: "rgba(255,255,255,.92)",
          sub: "rgba(255,255,255,.78)",
          wrapBg: "rgba(255,255,255,.04)",
          wrapBorder: "rgba(255,255,255,.10)",
          innerShadow: "0 0 0 1px rgba(255,255,255,.06) inset",
        }
      : {
          white: "rgba(255,255,255,.85)",
          hour: "rgba(244,63,94,.70)",
          minute: "rgba(34,197,94,.66)",
          both: "rgba(59,130,246,.68)",
          border: "rgba(180,83,9,.25)",
          text: "rgba(69,26,3,.92)",
          sub: "rgba(120,53,15,.75)",
          wrapBg: "rgba(255,255,255,.45)",
          wrapBorder: "rgba(180,83,9,.22)",
          innerShadow: "0 0 0 1px rgba(180,83,9,.12) inset",
        };
  }, [dark]);

  const stateBg = (state: TileState) => {
    if (state === "hour") return palette.hour;
    if (state === "minute") return palette.minute;
    if (state === "both") return palette.both;
    return palette.white;
  };

  const TileBox = ({ id }: { id: TileId }) => {
    const t = byId.get(id)!;
    const bg = stateBg(t.state);

    const label =
      t.state === "hour"
        ? "H"
        : t.state === "minute"
          ? "M"
          : t.state === "both"
            ? "H+M"
            : "";

    return (
      <div
        className="relative rounded-2xl border shadow-sm"
        style={{
          background: bg,
          borderColor: palette.border,
          boxShadow: palette.innerShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
        aria-label={`Tile ${t.size} ${t.state}`}
        title={`Tile ${t.size} · ${t.state}`}
      >
        {/* Size badge */}
        <div
          className="absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-black"
          style={{
            background: dark ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.65)",
            color: palette.text,
            border: `1px solid ${palette.border}`,
          }}
        >
          {t.size}
        </div>

        {/* State marker */}
        <div
          className="text-center"
          style={{
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          }}
        >
          <div
            className="text-3xl font-black tracking-wider"
            style={{
              color: palette.text,
              opacity: t.state === "white" ? 0.25 : 0.95,
            }}
          >
            {label || "·"}
          </div>
          <div
            className="mt-1 text-xs font-semibold"
            style={{ color: palette.sub }}
          >
            {t.state === "hour"
              ? "Hours"
              : t.state === "minute"
                ? "Minutes"
                : t.state === "both"
                  ? "Both"
                  : "None"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: palette.wrapBg,
        borderColor: palette.wrapBorder,
      }}
    >
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
          gridTemplateRows: "repeat(5, minmax(0, 1fr))",
          aspectRatio: "8 / 5",
        }}
      >
        <div style={{ gridColumn: "1 / span 5", gridRow: "1 / span 5" }}>
          <TileBox id="t5" />
        </div>

        <div style={{ gridColumn: "6 / span 3", gridRow: "1 / span 3" }}>
          <TileBox id="t3" />
        </div>

        <div style={{ gridColumn: "6 / span 2", gridRow: "4 / span 2" }}>
          <TileBox id="t2" />
        </div>

        <div style={{ gridColumn: "8 / span 1", gridRow: "4 / span 1" }}>
          <TileBox id="a1" />
        </div>

        <div style={{ gridColumn: "8 / span 1", gridRow: "5 / span 1" }}>
          <TileBox id="b1" />
        </div>
      </div>
    </div>
  );
}

function Swatch({ state }: { state: TileState }) {
  const style =
    state === "hour"
      ? "bg-rose-500"
      : state === "minute"
        ? "bg-green-500"
        : state === "both"
          ? "bg-blue-500"
          : "bg-white";
  const border = state === "white" ? "border-amber-200" : "border-transparent";
  return (
    <span
      className={`inline-block h-4 w-4 rounded-md border ${style} ${border}`}
    />
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function FibonacciClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/fibonacci-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Fibonacci Clock",
        url,
        description:
          "Fibonacci clock showing time using Fibonacci-sized squares (1,1,2,3,5). Live time, time zone switching, explore mode, fullscreen, and copy output.",
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
            name: "Fibonacci Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a Fibonacci clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A Fibonacci clock represents time using five tiles sized 1, 1, 2, 3, and 5. Tile colors indicate whether they count toward hours, minutes, or both.",
            },
          },
          {
            "@type": "Question",
            name: "Why are minutes shown in 5-minute steps?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Most Fibonacci clocks display minutes in 5-minute increments because the tile sums map naturally to 0 through 55 by fives.",
            },
          },
          {
            "@type": "Question",
            name: "Can I switch time zones?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Choose a time zone and the Fibonacci tiles update to reflect that time.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the card is focused to show a clean fullscreen display.",
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
            / <span className="text-amber-950">Fibonacci Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Fibonacci Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>Fibonacci clock</strong> that shows time using Fibonacci
            squares (1, 1, 2, 3, 5). Switch time zones or explore manually.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <FibonacciClockCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Live time + time zones
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Switch zones to see how the Fibonacci tile values change around
              the world.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Explore mode</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Set an hour and minute manually to learn the rounding rule and
              tile mapping.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>F</strong> = Fullscreen
              </li>
              <li>
                <strong>C</strong> = Copy
              </li>
              <li>
                <strong>L</strong> = Live mode
              </li>
              <li>
                <strong>E</strong> = Explore mode
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free Fibonacci clock (Fibonacci time)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>Fibonacci clock</strong> shows time using five tiles
              sized <strong>1, 1, 2, 3, 5</strong>. Red tiles count toward
              hours, green tiles count toward minutes (times 5), and blue tiles
              count for both. Minutes are rounded to the nearest five.
            </p>

            <p>
              Want another novelty clock? Try{" "}
              <Link
                to="/binary-clock"
                className="font-semibold hover:underline"
              >
                Binary Clock
              </Link>{" "}
              or{" "}
              <Link
                to="/hexadecimal-clock"
                className="font-semibold hover:underline"
              >
                Hexadecimal Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Fibonacci Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this show exact minutes?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. It rounds minutes to the nearest 5 minutes because the
              Fibonacci tile sums map naturally to 0–55 by fives.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why does the hour sometimes carry?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              If minutes round up to 60, the Fibonacci minutes become :00 and
              the hour increases by 1.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the clock card is focused.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
