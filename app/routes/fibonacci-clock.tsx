// app/routes/fibonacci-clock.tsx
import type { Route } from "./+types/fibonacci-clock";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/fibonacci-clock/HowItWorks";
import Disclaimer from "~/clients/components/fibonacci-clock/Disclaimer";
import FAQ from "~/clients/components/fibonacci-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/fibonacci-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/fibonacci-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Fibonacci Clock (Live Time Using Fibonacci Squares + Time Zones)";
  const description =
    "Free Fibonacci clock that shows the time using Fibonacci squares (1, 1, 2, 3, 5). View live local time, switch time zones, explore manually, go fullscreen, and copy the output.";

  const url = "https://www.ilovetimers.com/fibonacci-clock";

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
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

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

function useIsFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const el = targetRef.current;
      setIsFs(!!el && document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  return isFs;
}

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
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;

  const hour24 = Number(map.hour ?? "0");
  const minute = Number(map.minute ?? "0");
  const second = Number(map.second ?? "0");
  return { hour24, minute, second };
}

function formatHHMMSS(h24: number, m: number, s: number) {
  return `${pad2(h24)}:${pad2(m)}:${pad2(s)}`;
}

/**
 * Fit a single-line string into its container by adjusting font size.
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
  const initialFontPx = (() => {
    const sample = deps.find(
      (dep) => typeof dep === "string" || typeof dep === "number",
    );
    const charCount = Math.max(
      1,
      String(sample ?? "00:00").replace(/\s/g, "").length,
    );
    const preferredVw = Math.min(34, Math.max(8, 84 / (charCount * 0.62)));
    return `clamp(${minPx}px, ${preferredVw.toFixed(2)}vw, ${maxPx}px)`;
  })();

  const [fontPx, setFontPx] = useState<number | string>(initialFontPx);

  useLayoutEffect(() => {
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
      setFontPx(`${best}px`);
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

    compute();

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
   FIBONACCI CLOCK LOGIC
========================================================= */
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
  return Math.round(min / 5) * 5; // 0..60
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
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
  cardRef,
  isFullscreen,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      isFullscreen
        ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
        : "timer-tool-card h-full rounded-2xl bg-white p-4 sm:p-6",
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

function FullscreenTopBar({
  show,
  title,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  right?: React.ReactNode;
  onExit: () => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Btn kind="ghost" onClick={onExit} className="py-1 text-sm">
            Exit (Esc)
          </Btn>
        </div>
      </div>
    </div>
  );
}

function FullscreenBottomBar({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

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

function Swatch({ state }: { state: TileState }) {
  const style =
    state === "hour"
      ? "bg-rose-500"
      : state === "minute"
        ? "bg-green-500"
        : state === "both"
          ? "bg-blue-500"
          : "bg-white";
  const border = state === "white" ? "border-slate-200" : "border-transparent";
  return (
    <span
      className={`inline-block h-4 w-4 rounded-md border ${style} ${border}`}
    />
  );
}

/* =========================================================
   FIBONACCI BOARD
========================================================= */
function FibonacciBoard({ tiles, dark }: { tiles: Tile[]; dark: boolean }) {
  const byId = useMemo(() => {
    const m = new Map<TileId, Tile>();
    for (const t of tiles) m.set(t.id, t);
    return m;
  }, [tiles]);

  const palette = useMemo(() => {
    return dark
      ? {
          white: "rgba(255,255,255,.06)",
          hour: "rgba(244,63,94,.88)",
          minute: "rgba(34,197,94,.85)",
          both: "rgba(59,130,246,.88)",
          border: "rgba(255,255,255,.18)",
          text: "rgba(255,255,255,.92)",
          sub: "rgba(255,255,255,.78)",
          wrapBg: "rgba(255,255,255,.04)",
          wrapBorder: "rgba(255,255,255,.10)",
          innerShadow: "0 0 0 1px rgba(255,255,255,.06) inset",
        }
      : {
          white: "rgba(255,255,255,.9)",
          hour: "rgba(244,63,94,.68)",
          minute: "rgba(34,197,94,.62)",
          both: "rgba(59,130,246,.64)",
          border: "rgba(15,23,42,.14)",
          text: "rgba(15,23,42,.92)",
          sub: "rgba(51,65,85,.80)",
          wrapBg: "rgba(255,255,255,.55)",
          wrapBorder: "rgba(15,23,42,.12)",
          innerShadow: "0 0 0 1px rgba(15,23,42,.08) inset",
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
        <div
          className="absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-black"
          style={{
            background: dark ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.70)",
            color: palette.text,
            border: `1px solid ${palette.border}`,
          }}
        >
          {t.size}
        </div>

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

/* =========================================================
   CARD
========================================================= */
type Mode = "live" | "manual";

function FibonacciClockCard() {
  const deviceTz = useMemo(() => safeTimeZone(), []);
  const [zoneId, setZoneId] = useState<string>("local");
  const zone = zoneId === "local" ? deviceTz : zoneId;

  const [mode, setMode] = useState<Mode>("live");

  const [manualHour24, setManualHour24] = useState<number>(12);
  const [manualMinute, setManualMinute] = useState<number>(0);

  const [now, setNow] = useState<Date>(() => new Date());
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  useEffect(() => {
    if (mode !== "live") return;
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, [mode]);

  useEffect(() => {
    if (mode !== "manual") return;
    const base = new Date();
    try {
      const parts = getTimePartsForZone(base, zone);
      setManualHour24(parts.hour24);
      setManualMinute(parts.minute);
    } catch {
      setManualHour24(base.getHours());
      setManualMinute(base.getMinutes());
    }
  }, [mode, zone]);

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
      return {
        hour24: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
      };
    }
  }, [mode, manualHour24, manualMinute, now, zone]);

  const minuteRoundedTo5 = useMemo(
    () => roundMinutesToNearest5(timeParts.minute),
    [timeParts.minute],
  );

  const carriedHour24 = useMemo(() => {
    if (minuteRoundedTo5 === 60) return (timeParts.hour24 + 1) % 24;
    return timeParts.hour24;
  }, [minuteRoundedTo5, timeParts.hour24]);

  const displayMinute5 = useMemo(
    () => (minuteRoundedTo5 === 60 ? 0 : minuteRoundedTo5),
    [minuteRoundedTo5],
  );

  const hour12ForFib = useMemo(() => carriedHour24 % 12 || 12, [carriedHour24]);

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

  const roundingText = useMemo(() => {
    const r = minuteRoundedTo5;
    if (r === timeParts.minute)
      return "Minutes are exactly on a 5-minute step.";
    if (r === 60) return "Minutes round up to :00 (hour carries +1).";
    return `Minutes rounded to nearest 5 → ${pad2(r)}.`;
  }, [minuteRoundedTo5, timeParts.minute]);

  const dateText = useMemo(() => {
    try {
      return formatDateLine(new Date(), zone);
    } catch {
      return formatDateLine(new Date());
    }
  }, [zone]);

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
    fib.tiles,
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

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const fibTimeRef = useRef<HTMLSpanElement>(null);

  const fitFibPx = useFitText({
    containerRef: displayBoxRef,
    textRef: fibTimeRef,
    deps: [fibHHMM, isFs, mode, zoneId],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 84 : 84,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && cardRef.current) toggleFullscreen(cardRef.current);
    else if (k === "c") copy();
    else if (k === "l") setMode("live");
    else if (k === "e") setMode("manual");
    else if (k === "escape" && isFs) document.exitFullscreen().catch(() => {});
  };

  const statusChip = `${mode === "live" ? "Live" : "Explore"} · ${
    zoneId === "local" ? deviceTz : zoneId
  }`;

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
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Fibonacci Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="ghost"
              onClick={() => setMode("live")}
              className="py-1 text-sm"
            >
              Live (L)
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setMode("manual")}
              className="py-1 text-sm"
            >
              Explore (E)
            </Btn>
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy (C)"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header + controls (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-slate-900">
                Fibonacci Clock
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Live time with zones, or manual explore (minutes round to
                nearest 5).
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <span className="text-slate-700">Zone</span>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900"
                >
                  {COMMON_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <span className="text-slate-700">Mode</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900"
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
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Manual controls (normal only) */}
        {!isFs && mode === "manual" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-900">
              Hour (0–23)
              <input
                type="number"
                min={0}
                max={23}
                value={manualHour24}
                onChange={(e) =>
                  setManualHour24(clamp(Number(e.target.value || 0), 0, 23))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Minute (0–59)
              <input
                type="number"
                min={0}
                max={59}
                value={manualMinute}
                onChange={(e) =>
                  setManualMinute(clamp(Number(e.target.value || 0), 0, 59))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>
          </div>
        ) : null}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 560,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusChip}
          </div>

          <span
            ref={fibTimeRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFibPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              whiteSpace: "nowrap",
            }}
            title="Fibonacci time (minutes in 5s)"
          >
            {fibHHMM}
          </span>

          <div className="mt-3 flex w-full max-w-[980px] flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Decimal time
              </div>
              <div className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-slate-900 sm:text-4xl">
                {decHHMMSS}
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-600">
                {dateText}
              </div>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Rounding
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-700">
                {roundingText}
              </div>

              {isFs ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Btn kind="solid" onClick={copy} className="py-2 text-sm">
                    {copied ? "Copied" : "Copy (C)"}
                  </Btn>
                  <Btn
                    kind="ghost"
                    onClick={() => setMode("live")}
                    className="py-2 text-sm"
                  >
                    Live (L)
                  </Btn>
                  <Btn
                    kind="ghost"
                    onClick={() => setMode("manual")}
                    className="py-2 text-sm"
                  >
                    Explore (E)
                  </Btn>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 w-full max-w-[980px]">
            <FibonacciBoard tiles={fib.tiles} dark={false} />
          </div>

          {/* Legend (kept integral and visible; compact in fullscreen) */}
          <div className="mt-4 w-full max-w-[980px]">
            <div
              className={[
                "rounded-2xl border bg-white p-4",
                isFs
                  ? "border-slate-200 bg-white text-slate-900"
                  : "border-slate-200",
              ].join(" ")}
            >
              <div
                className={[
                  "text-xs font-extrabold uppercase tracking-widest",
                  "text-slate-600",
                ].join(" ")}
              >
                Legend
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {legend.map((l) => (
                  <div
                    key={l.key}
                    className={[
                      "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
                      isFs
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <Swatch state={l.key as TileState} />
                      <span
                        className={
                          "font-semibold text-slate-900"
                        }
                      >
                        {l.label}
                      </span>
                    </div>
                    <span
                      className={
                        "text-slate-600 text-sm"
                      }
                    >
                      {l.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!isFs && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: F fullscreen · C copy · L live · E explore
            </div>
            <div className="text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Shortcuts: F fullscreen · C copy · L live · E explore
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusChip}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function FibonacciClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/fibonacci-clock";

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
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Fibonacci Clock",
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

      {/* Minimal header */}
      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Fibonacci Clock (Time Zones + Explore)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Live Fibonacci time using 1, 1, 2, 3, 5 squares. Switch zones,
            explore manually, copy output, and go fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <FibonacciClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Fibonacci Clock</span>
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
