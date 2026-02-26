// app/routes/time-zone-converter.tsx
import type { Route } from "./+types/time-zone-converter";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/time-zone-converter/HowItWorks";
import Disclaimer from "~/clients/components/time-zone-converter/Disclaimer";
import FAQ from "~/clients/components/time-zone-converter/FAQ";
import KeyboardShortcuts from "~/clients/components/time-zone-converter/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/time-zone-converter/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Time Zone Converter (World Time, Instant Conversion)";
  const description =
    "Convert time between time zones instantly. Pick a date and time and see the exact local time anywhere in the world with a clear, simple layout.";

  const url = "https://www.ilovetimers.com/time-zone-converter";

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
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
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

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function tryGuessUserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function parseLocalDateTime(dateStr: string, timeStr: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;

  const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timeStr.trim());
  if (!t) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(t[1]);
  const minute = Number(t[2]);
  const second = Number(t[3] ?? "0");

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  )
    return null;

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  if (second < 0 || second > 59) return null;

  return { year, month, day, hour, minute, second };
}

function isValidTz(id: string) {
  if (id === "UTC") return true;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: id }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function normalizeTz(id: string) {
  return isValidTz(id) ? id : "UTC";
}

/**
 * Convert a local date/time that the user intends in `fromTz` into an absolute Date (UTC instant), DST-aware.
 * Iterative approach to resolve offset changes around DST boundaries.
 */
function dateFromZonedComponents(args: {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  fromTz: string;
}) {
  const { year, month, day, hour, minute, second, fromTz } = args;

  // initial guess: treat the local components as UTC
  let guessUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  const getZonedParts = (utcMs: number) => {
    const d = new Date(utcMs);
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone: fromTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const map = Object.fromEntries(
      parts
        .filter((p) =>
          ["year", "month", "day", "hour", "minute", "second"].includes(p.type),
        )
        .map((p) => [p.type, p.value]),
    ) as Record<string, string>;

    return {
      y: Number(map.year),
      mo: Number(map.month),
      da: Number(map.day),
      h: Number(map.hour),
      mi: Number(map.minute),
      s: Number(map.second),
    };
  };

  const desiredUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let i = 0; i < 3; i++) {
    const zp = getZonedParts(guessUtcMs);
    const renderedAsUtcMs = Date.UTC(zp.y, zp.mo - 1, zp.da, zp.h, zp.mi, zp.s);
    const offsetMs = renderedAsUtcMs - guessUtcMs;
    const next = desiredUtcMs - offsetMs;

    if (Math.abs(next - guessUtcMs) < 1000) {
      guessUtcMs = next;
      break;
    }
    guessUtcMs = next;
  }

  return new Date(guessUtcMs);
}

function buildShareUrl(args: {
  fromTz: string;
  toTz: string;
  date: string;
  time: string;
  showSeconds: boolean;
}) {
  try {
    const u = new URL("https://www.ilovetimers.com/time-zone-converter");
    u.searchParams.set("from", args.fromTz);
    u.searchParams.set("to", args.toTz);
    u.searchParams.set("date", args.date);
    u.searchParams.set("time", args.time);
    u.searchParams.set("sec", args.showSeconds ? "1" : "0");
    return u.toString();
  } catch {
    return "";
  }
}

/* =========================================================
   UI PRIMITIVES (site style)
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
        : "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
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
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
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
  title,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={[
      "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
      active
        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ].join(" ")}
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
type TzOpt = { id: string; label: string; region: string };

const TZ_OPTS: TzOpt[] = [
  // North America
  { id: "America/New_York", label: "New York (ET)", region: "North America" },
  { id: "America/Chicago", label: "Chicago (CT)", region: "North America" },
  { id: "America/Denver", label: "Denver (MT)", region: "North America" },
  {
    id: "America/Los_Angeles",
    label: "Los Angeles (PT)",
    region: "North America",
  },
  { id: "America/Phoenix", label: "Phoenix (MST)", region: "North America" },
  { id: "America/Anchorage", label: "Anchorage (AK)", region: "North America" },
  { id: "Pacific/Honolulu", label: "Honolulu (HST)", region: "North America" },
  { id: "America/Toronto", label: "Toronto", region: "North America" },
  { id: "America/Vancouver", label: "Vancouver", region: "North America" },
  { id: "America/Mexico_City", label: "Mexico City", region: "North America" },

  // South America
  { id: "America/Sao_Paulo", label: "Sao Paulo", region: "South America" },
  {
    id: "America/Buenos_Aires",
    label: "Buenos Aires",
    region: "South America",
  },
  { id: "America/Santiago", label: "Santiago", region: "South America" },

  // Europe
  { id: "Europe/London", label: "London (UK)", region: "Europe" },
  { id: "Europe/Dublin", label: "Dublin", region: "Europe" },
  { id: "Europe/Paris", label: "Paris", region: "Europe" },
  { id: "Europe/Berlin", label: "Berlin", region: "Europe" },
  { id: "Europe/Madrid", label: "Madrid", region: "Europe" },
  { id: "Europe/Rome", label: "Rome", region: "Europe" },
  { id: "Europe/Amsterdam", label: "Amsterdam", region: "Europe" },
  { id: "Europe/Warsaw", label: "Warsaw", region: "Europe" },
  { id: "Europe/Zurich", label: "Zurich", region: "Europe" },
  { id: "Europe/Stockholm", label: "Stockholm", region: "Europe" },
  { id: "Europe/Athens", label: "Athens", region: "Europe" },
  { id: "Europe/Istanbul", label: "Istanbul", region: "Europe" },
  { id: "Europe/Moscow", label: "Moscow", region: "Europe" },

  // Africa
  { id: "Africa/Cairo", label: "Cairo", region: "Africa" },
  { id: "Africa/Johannesburg", label: "Johannesburg", region: "Africa" },
  { id: "Africa/Lagos", label: "Lagos", region: "Africa" },
  { id: "Africa/Nairobi", label: "Nairobi", region: "Africa" },

  // Asia
  { id: "Asia/Dubai", label: "Dubai", region: "Asia" },
  { id: "Asia/Riyadh", label: "Riyadh", region: "Asia" },
  { id: "Asia/Tehran", label: "Tehran", region: "Asia" },
  { id: "Asia/Karachi", label: "Karachi", region: "Asia" },
  { id: "Asia/Kolkata", label: "India (IST)", region: "Asia" },
  { id: "Asia/Dhaka", label: "Dhaka", region: "Asia" },
  { id: "Asia/Bangkok", label: "Bangkok", region: "Asia" },
  { id: "Asia/Singapore", label: "Singapore", region: "Asia" },
  { id: "Asia/Hong_Kong", label: "Hong Kong", region: "Asia" },
  { id: "Asia/Shanghai", label: "Shanghai", region: "Asia" },
  { id: "Asia/Tokyo", label: "Tokyo", region: "Asia" },
  { id: "Asia/Seoul", label: "Seoul", region: "Asia" },
  { id: "Asia/Taipei", label: "Taipei", region: "Asia" },

  // Oceania
  { id: "Australia/Sydney", label: "Sydney", region: "Oceania" },
  { id: "Australia/Melbourne", label: "Melbourne", region: "Oceania" },
  { id: "Australia/Perth", label: "Perth", region: "Oceania" },
  { id: "Pacific/Auckland", label: "Auckland", region: "Oceania" },

  // UTC
  { id: "UTC", label: "UTC", region: "UTC" },
];

function getOptLabel(id: string) {
  const hit = TZ_OPTS.find((x) => x.id === id);
  return hit?.label ?? id;
}

/* =========================================================
   FORMATTER CACHE (keeps UI snappy)
========================================================= */
type FormatKey = string;
type FormatBundle = {
  main: Intl.DateTimeFormat;
  tzName: Intl.DateTimeFormat;
};

const formatterCache = new Map<FormatKey, FormatBundle>();

function getFormatters(timeZone: string, showSeconds: boolean) {
  const key = `${timeZone}::${showSeconds ? "1" : "0"}`;
  const hit = formatterCache.get(key);
  if (hit) return hit;

  const base: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  };

  const main = new Intl.DateTimeFormat(undefined, {
    ...base,
    ...(showSeconds ? { second: "2-digit" } : {}),
  });

  const tzName = new Intl.DateTimeFormat(undefined, {
    timeZone,
    timeZoneName: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const bundle = { main, tzName };
  formatterCache.set(key, bundle);
  return bundle;
}

function formatInTimeZone(date: Date, timeZone: string, showSeconds: boolean) {
  return getFormatters(timeZone, showSeconds).main.format(date);
}

function tzAbbr(date: Date, timeZone: string) {
  try {
    const parts = getFormatters(timeZone, true).tzName.formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/* =========================================================
   CONVERTER CARD
========================================================= */
type PersistedV1 = {
  v: 1;
  fromTz: string;
  toTz: string;
  date: string;
  time: string;
  showSeconds: boolean;
};

const LS_KEY = "ilovetimers:time-zone-converter:v1";

function deriveDefaultLocalStrings(nowISO: string) {
  const now = new Date(nowISO);
  const y = now.getFullYear();
  const mo = pad2(now.getMonth() + 1);
  const da = pad2(now.getDate());
  const hh = pad2(now.getHours());
  const mi = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());
  return {
    date: `${y}-${mo}-${da}`,
    timeNoSec: `${hh}:${mi}`,
    timeWithSec: `${hh}:${mi}:${ss}`,
  };
}

function TimeZoneConverterCard({ nowISO }: { nowISO: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const toTzRef = useRef<string>("UTC");

  const defaults = useMemo(() => deriveDefaultLocalStrings(nowISO), [nowISO]);

  // Initialize state synchronously (snappy first paint).
  const [fromTz, setFromTz] = useState<string>(() => {
    if (typeof window === "undefined") return "UTC";
    return normalizeTz(tryGuessUserTimeZone());
  });
  const [toTz, setToTz] = useState<string>(() => "UTC");

  const [dateStr, setDateStr] = useState<string>(() => defaults.date);
  const [timeStr, setTimeStr] = useState<string>(() => defaults.timeNoSec);
  const [showSeconds, setShowSeconds] = useState<boolean>(() => false);

  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Keep ref in sync (fixes swap correctness).
  useEffect(() => {
    toTzRef.current = toTz;
  }, [toTz]);

  // Hydrate from URL + localStorage once on mount, but do not block first paint.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let next: PersistedV1 = {
      v: 1,
      fromTz: normalizeTz(tryGuessUserTimeZone()),
      toTz: "UTC",
      date: defaults.date,
      time: defaults.timeNoSec,
      showSeconds: false,
    };

    const saved = safeParseJSON<PersistedV1>(
      window.localStorage.getItem(LS_KEY),
    );
    if (saved && saved.v === 1) {
      next = {
        v: 1,
        fromTz: normalizeTz(String(saved.fromTz ?? next.fromTz)),
        toTz: normalizeTz(String(saved.toTz ?? next.toTz)),
        date: String(saved.date ?? next.date),
        time: String(saved.time ?? next.time),
        showSeconds: Boolean(saved.showSeconds),
      };
    }

    try {
      const u = new URL(window.location.href);
      const pFrom = u.searchParams.get("from");
      const pTo = u.searchParams.get("to");
      const pDate = u.searchParams.get("date");
      const pTime = u.searchParams.get("time");
      const pSec = u.searchParams.get("sec");

      if (pFrom) next.fromTz = normalizeTz(pFrom);
      if (pTo) next.toTz = normalizeTz(pTo);
      if (pDate && /^\d{4}-\d{2}-\d{2}$/.test(pDate)) next.date = pDate;
      if (pTime && /^\d{2}:\d{2}(:\d{2})?$/.test(pTime)) next.time = pTime;
      if (pSec === "1" || pSec === "0") next.showSeconds = pSec === "1";
    } catch {
      // ignore
    }

    // Normalize time format based on showSeconds.
    const currentSs = pad2(new Date().getSeconds());
    if (next.showSeconds && /^\d{2}:\d{2}$/.test(next.time)) {
      next.time = `${next.time}:${currentSs}`;
    }
    if (!next.showSeconds && /^\d{2}:\d{2}:\d{2}$/.test(next.time)) {
      next.time = next.time.slice(0, 5);
    }

    // Apply.
    setFromTz(next.fromTz);
    setToTz(next.toTz);
    setDateStr(next.date);
    setShowSeconds(next.showSeconds);
    setTimeStr(
      next.time ||
        (next.showSeconds ? defaults.timeWithSec : defaults.timeNoSec),
    );

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist changes.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const toSave: PersistedV1 = {
      v: 1,
      fromTz,
      toTz,
      date: dateStr,
      time: timeStr,
      showSeconds,
    };
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [hydrated, fromTz, toTz, dateStr, timeStr, showSeconds]);

  // Copied toast.
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const tzGroups = useMemo(() => {
    const groups = new Map<string, TzOpt[]>();
    for (const o of TZ_OPTS) {
      if (!groups.has(o.region)) groups.set(o.region, []);
      groups.get(o.region)!.push(o);
    }
    return Array.from(groups.entries()).map(([region, list]) => ({
      region,
      list,
    }));
  }, []);

  const parsed = useMemo(
    () => parseLocalDateTime(dateStr, timeStr),
    [dateStr, timeStr],
  );

  const fromInstant = useMemo(() => {
    if (!parsed) return null;
    try {
      return dateFromZonedComponents({
        ...parsed,
        fromTz: normalizeTz(fromTz),
      });
    } catch {
      return null;
    }
  }, [parsed, fromTz]);

  const preview = useMemo(() => {
    if (!fromInstant) return null;
    const fromId = normalizeTz(fromTz);
    const toId = normalizeTz(toTz);

    const fromText = formatInTimeZone(fromInstant, fromId, showSeconds);
    const toText = formatInTimeZone(fromInstant, toId, showSeconds);

    const fromAb = tzAbbr(fromInstant, fromId);
    const toAb = tzAbbr(fromInstant, toId);

    return {
      fromText,
      toText,
      fromAb,
      toAb,
      iso: fromInstant.toISOString(),
    };
  }, [fromInstant, fromTz, toTz, showSeconds]);

  const invalidInput = hydrated && (!parsed || !fromInstant);

  const swap = () => {
    setFromTz((curFrom) => {
      const curTo = toTzRef.current;
      setToTz(curFrom);
      return curTo;
    });
  };

  const setNow = () => {
    const d = deriveDefaultLocalStrings(new Date().toISOString());
    setDateStr(d.date);
    setTimeStr(showSeconds ? d.timeWithSec : d.timeNoSec);
  };

  const onCopy = async () => {
    if (!preview) return;

    const fromLabel = getOptLabel(normalizeTz(fromTz));
    const toLabel = getOptLabel(normalizeTz(toTz));

    const lines = [
      "Time Zone Conversion",
      `From: ${fromLabel}`,
      `To: ${toLabel}`,
      `Input: ${dateStr} ${timeStr}`,
      `From time: ${preview.fromText}${preview.fromAb ? ` (${preview.fromAb})` : ""}`,
      `To time: ${preview.toText}${preview.toAb ? ` (${preview.toAb})` : ""}`,
      `ISO: ${preview.iso}`,
    ].join("\n");

    const ok = await copyToClipboard(lines);
    if (ok) setCopied("Copied");
  };

  const shareUrl = useMemo(() => {
    if (!hydrated) return "";
    return buildShareUrl({
      fromTz: normalizeTz(fromTz),
      toTz: normalizeTz(toTz),
      date: dateStr,
      time: timeStr,
      showSeconds,
    });
  }, [hydrated, fromTz, toTz, dateStr, timeStr, showSeconds]);

  const onCopyLink = async () => {
    if (!shareUrl) return;
    const ok = await copyToClipboard(shareUrl);
    if (ok) setCopied("Link copied");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "s") {
      swap();
    } else if (k === "n") {
      setNow();
    } else if (k === "c") {
      void onCopy();
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const quickPairs = useMemo(
    () => [
      { a: "America/Los_Angeles", b: "America/New_York", label: "PT → ET" },
      { a: "America/New_York", b: "Europe/London", label: "ET → London" },
      { a: "Europe/London", b: "Europe/Paris", label: "London → Paris" },
      { a: "Europe/London", b: "Asia/Tokyo", label: "London → Tokyo" },
      { a: "America/New_York", b: "Asia/Kolkata", label: "ET → India" },
      { a: "America/Los_Angeles", b: "Asia/Tokyo", label: "PT → Tokyo" },
      { a: "UTC", b: "America/New_York", label: "UTC → ET" },
      { a: "UTC", b: "Asia/Tokyo", label: "UTC → Tokyo" },
    ],
    [],
  );

  const statusLabel = preview
    ? invalidInput
      ? "Invalid input"
      : "Ready"
    : "Enter date and time";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Time Zone Converter"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => {
                  const next = e.target.checked;
                  setShowSeconds(next);
                  setTimeStr((cur) => {
                    const ss = pad2(new Date().getSeconds());
                    if (next) {
                      if (/^\d{2}:\d{2}$/.test(cur)) return `${cur}:${ss}`;
                      return cur;
                    }
                    if (/^\d{2}:\d{2}:\d{2}$/.test(cur)) return cur.slice(0, 5);
                    return cur;
                  });
                }}
              />
              Seconds
            </label>

            <Btn
              kind="ghost"
              onClick={swap}
              className="py-1 text-sm"
              title="Swap (S)"
            >
              Swap
            </Btn>
            <Btn
              kind="ghost"
              onClick={setNow}
              className="py-1 text-sm"
              title="Now (N)"
            >
              Now
            </Btn>
            <Btn
              kind="ghost"
              onClick={onCopy}
              className="py-1 text-sm"
              disabled={!preview}
              title="Copy (C)"
            >
              Copy
            </Btn>
            <Btn
              kind="ghost"
              onClick={onCopyLink}
              className="py-1 text-sm"
              disabled={!shareUrl}
              title="Share link"
            >
              Share
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Time Zone Converter
              </h1>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setShowSeconds(next);
                    setTimeStr((cur) => {
                      const ss = pad2(new Date().getSeconds());
                      if (next) {
                        if (/^\d{2}:\d{2}$/.test(cur)) return `${cur}:${ss}`;
                        return cur;
                      }
                      if (/^\d{2}:\d{2}:\d{2}$/.test(cur))
                        return cur.slice(0, 5);
                      return cur;
                    });
                  }}
                />
                Seconds
              </label>

              <Btn
                kind="ghost"
                onClick={swap}
                className="py-2"
                title="Swap (S)"
              >
                Swap
              </Btn>
              <Btn
                kind="ghost"
                onClick={setNow}
                className="py-2"
                title="Now (N)"
              >
                Now
              </Btn>
              <Btn
                kind="ghost"
                onClick={onCopy}
                className="py-2"
                disabled={!preview}
                title="Copy (C)"
              >
                Copy
              </Btn>
              <Btn
                kind="ghost"
                onClick={onCopyLink}
                className="py-2"
                disabled={!shareUrl}
                title="Share link"
              >
                Share
              </Btn>
              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
                title="Fullscreen (F)"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {!isFs && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {quickPairs.map((p) => (
              <Chip
                key={p.label}
                onClick={() => {
                  setFromTz(p.a);
                  setToTz(p.b);
                }}
                title={`${p.a} → ${p.b}`}
              >
                {p.label}
              </Chip>
            ))}
          </div>
        )}

        {/* Inputs */}
        <div className={isFs ? "mx-2 mt-3 sm:mx-4" : "mt-4"}>
          <div className="grid gap-3 lg:grid-cols-4">
            <label className="block text-sm font-semibold text-slate-900">
              Date
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Time {showSeconds ? "(HH:MM:SS)" : "(HH:MM)"}
              <input
                inputMode="numeric"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                placeholder={showSeconds ? "09:30:00" : "09:30"}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              From time zone
              <select
                value={fromTz}
                onChange={(e) => setFromTz(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                {tzGroups.map((g) => (
                  <optgroup key={g.region} label={g.region}>
                    {g.list.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              To time zone
              <select
                value={toTz}
                onChange={(e) => setToTz(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                {tzGroups.map((g) => (
                  <optgroup key={g.region} label={g.region}>
                    {g.list.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Display */}
        <div
          className={[
            "relative mt-4 rounded-2xl border bg-slate-50 text-slate-950",
            invalidInput ? "border-rose-200 bg-rose-50" : "border-slate-200",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            overflow: "hidden",
          }}
          aria-live="polite"
        >
          <div className="p-3 sm:p-6">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {statusLabel}
            </div>

            {!preview ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                Enter a valid date and time.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    From
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {getOptLabel(normalizeTz(fromTz))}
                  </div>
                  <div
                    className={[
                      "mt-3 font-mono font-extrabold tracking-wider text-slate-900",
                      isFs ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl",
                    ].join(" ")}
                  >
                    {preview.fromText}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    {preview.fromAb ? `Abbr: ${preview.fromAb}` : " "}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    To
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {getOptLabel(normalizeTz(toTz))}
                  </div>
                  <div
                    className={[
                      "mt-3 font-mono font-extrabold tracking-wider text-slate-900",
                      isFs ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl",
                    ].join(" ")}
                  >
                    {preview.toText}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    {preview.toAb ? `Abbr: ${preview.toAb}` : " "}
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    ISO
                  </div>
                  <div className="mt-2 break-all font-mono text-sm font-semibold text-slate-900">
                    {preview.iso}
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-semibold text-slate-600">
                      Shortcuts: S swap · N now · C copy · F fullscreen
                    </div>
                    {copied && (
                      <div className="text-xs font-extrabold text-slate-900">
                        {copied}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <FullscreenBottomBar show={isFs}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-600 sm:text-sm">
                S swap · N now · C copy · F fullscreen · Esc exit
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {copied ? copied : statusLabel}
              </div>
            </div>
          </FullscreenBottomBar>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function TimeZoneConverterPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/time-zone-converter";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Time Zone Converter",
        url,
        description:
          "Convert time between time zones instantly with DST-aware results, copy-friendly output, share links, and fullscreen display.",
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
            name: "Time Zone Converter",
            item: url,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Time Zone Converter",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <TimeZoneConverterCard nowISO={nowISO} />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Time Zone Converter</span>
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
