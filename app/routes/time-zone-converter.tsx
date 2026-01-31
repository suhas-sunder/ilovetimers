// app/routes/time-zone-converter.tsx
import type { Route } from "./+types/time-zone-converter";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Time Zone Converter (World Time)";
  const description =
    "Convert time between time zones instantly. Pick a date and time and see the exact local time anywhere in the world with a clear, simple layout.";

  const url = "https://ilovetimers.com/time-zone-converter";

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
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
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

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const pad2 = (n: number) => n.toString().padStart(2, "0");

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

function formatInTimeZone(
  date: Date,
  timeZone: string,
  opts?: Intl.DateTimeFormatOptions,
) {
  const base: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...opts,
    timeZone,
  };
  return new Intl.DateTimeFormat(undefined, base).format(date);
}

function tzAbbr(date: Date, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/**
 * Convert a local date/time (YYYY-MM-DD + HH:mm[:ss]) that the user intends in `fromTz`
 * into an absolute Date (UTC instant), DST-aware.
 *
 * Approach:
 * - Take the components as if they were UTC (Date.UTC).
 * - Find the offset between that "guess instant" and how that instant renders in `fromTz`.
 * - Adjust by that offset.
 * - Run a couple iterations to converge.
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
    const offsetMs = renderedAsUtcMs - guessUtcMs; // tz offset at that instant
    // If we want desired local components, we adjust guess by the offset between desired and rendered.
    // This essentially solves: local(desired) == format(fromTz, guessInstant)
    const next = desiredUtcMs - offsetMs;
    if (Math.abs(next - guessUtcMs) < 1000) {
      guessUtcMs = next;
      break;
    }
    guessUtcMs = next;
  }

  return new Date(guessUtcMs);
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

function buildShareUrl(args: {
  fromTz: string;
  toTz: string;
  date: string;
  time: string;
  showSeconds: boolean;
}) {
  try {
    const u = new URL("https://ilovetimers.com/time-zone-converter");
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
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
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
    }`}
  >
    {children}
  </button>
);

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

function isValidTz(id: string) {
  if (id === "UTC") return true;
  try {
    // throws if invalid
    new Intl.DateTimeFormat(undefined, { timeZone: id }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function normalizeTz(id: string) {
  return isValidTz(id) ? id : "UTC";
}

function getOptLabel(id: string) {
  const hit = TZ_OPTS.find((x) => x.id === id);
  return hit?.label ?? id;
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

function TimeZoneConverterCard() {
  const fsRef = useRef<HTMLDivElement>(null);

  const [hydrated, setHydrated] = useState(false);

  const [fromTz, setFromTz] = useState<string>("UTC");
  const [toTz, setToTz] = useState<string>("America/New_York");

  const [dateStr, setDateStr] = useState<string>(""); // YYYY-MM-DD
  const [timeStr, setTimeStr] = useState<string>("09:00"); // HH:mm[:ss]
  const [showSeconds, setShowSeconds] = useState<boolean>(false);

  const [copied, setCopied] = useState<string | null>(null);

  // Hydrate: URL params first, then localStorage, then defaults
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const mo = pad2(now.getMonth() + 1);
    const da = pad2(now.getDate());
    const hh = pad2(now.getHours());
    const mi = pad2(now.getMinutes());
    const ss = pad2(now.getSeconds());

    const defaultDate = `${y}-${mo}-${da}`;
    const defaultTime = `${hh}:${mi}`;

    let next: PersistedV1 = {
      v: 1,
      fromTz: normalizeTz(tryGuessUserTimeZone()),
      toTz: "UTC",
      date: defaultDate,
      time: defaultTime,
      showSeconds: false,
    };

    // localStorage
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

    // URL params override
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

    // If showSeconds but time is missing seconds, add from "now"
    if (next.showSeconds && /^\d{2}:\d{2}$/.test(next.time)) {
      next.time = `${next.time}:${ss}`;
    }
    // If not showing seconds but time has seconds, drop them
    if (!next.showSeconds && /^\d{2}:\d{2}:\d{2}$/.test(next.time)) {
      next.time = next.time.slice(0, 5);
    }

    setFromTz(next.fromTz);
    setToTz(next.toTz);
    setDateStr(next.date);
    setTimeStr(
      next.time || (next.showSeconds ? `${defaultTime}:${ss}` : defaultTime),
    );
    setShowSeconds(next.showSeconds);
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
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

  // Copied toast
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const parsed = useMemo(
    () => parseLocalDateTime(dateStr, timeStr),
    [dateStr, timeStr],
  );

  const fromInstant = useMemo(() => {
    if (!parsed) return null;
    try {
      const d = dateFromZonedComponents({
        ...parsed,
        fromTz: normalizeTz(fromTz),
      });
      return d;
    } catch {
      return null;
    }
  }, [parsed, fromTz]);

  const preview = useMemo(() => {
    if (!fromInstant) return null;
    const fromId = normalizeTz(fromTz);
    const toId = normalizeTz(toTz);

    const baseOpts: Intl.DateTimeFormatOptions = showSeconds
      ? {}
      : { second: undefined as any };

    const fromText = formatInTimeZone(fromInstant, fromId, baseOpts);
    const toText = formatInTimeZone(fromInstant, toId, baseOpts);

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

  const swap = () => {
    setFromTz((a) => {
      setToTz(a);
      return toTz;
    });
  };

  const setNow = () => {
    const now = new Date();
    const y = now.getFullYear();
    const mo = pad2(now.getMonth() + 1);
    const da = pad2(now.getDate());
    const hh = pad2(now.getHours());
    const mi = pad2(now.getMinutes());
    const ss = pad2(now.getSeconds());
    setDateStr(`${y}-${mo}-${da}`);
    setTimeStr(showSeconds ? `${hh}:${mi}:${ss}` : `${hh}:${mi}`);
  };

  const onCopy = async () => {
    if (!preview || !fromInstant) return;

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

    if (e.key.toLowerCase() === "f" && fsRef.current) {
      toggleFullscreen(fsRef.current);
    } else if (e.key.toLowerCase() === "s") {
      swap();
    } else if (e.key.toLowerCase() === "n") {
      setNow();
    } else if (e.key.toLowerCase() === "c") {
      void onCopy();
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

  const invalidInput = hydrated && (!parsed || !fromInstant);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Time Zone Converter
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Convert a date and time between time zones with DST awareness. Copy
            results, swap zones, and go fullscreen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => {
                const next = e.target.checked;
                setShowSeconds(next);
                setTimeStr((cur) => {
                  const now = new Date();
                  const ss = pad2(now.getSeconds());
                  if (next) {
                    if (/^\d{2}:\d{2}$/.test(cur)) return `${cur}:${ss}`;
                    return cur;
                  } else {
                    if (/^\d{2}:\d{2}:\d{2}$/.test(cur)) return cur.slice(0, 5);
                    return cur;
                  }
                });
              }}
            />
            Seconds
          </label>

          <Btn kind="ghost" onClick={swap} title="Swap zones (S)">
            Swap
          </Btn>
          <Btn kind="ghost" onClick={setNow} title="Set to now (N)">
            Now
          </Btn>
          <Btn
            kind="ghost"
            onClick={onCopy}
            disabled={!preview}
            title="Copy (C)"
          >
            Copy
          </Btn>
          <Btn
            kind="ghost"
            onClick={onCopyLink}
            disabled={!shareUrl}
            title="Copy share link"
          >
            Share
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => fsRef.current && toggleFullscreen(fsRef.current)}
            title="Fullscreen (F)"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Quick pairs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
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

      {/* Inputs */}
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <label className="block text-sm font-semibold text-amber-950">
          Date
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Time {showSeconds ? "(HH:MM:SS)" : "(HH:MM)"}
          <input
            inputMode="numeric"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            placeholder={showSeconds ? "09:30:00" : "09:30"}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          From time zone
          <select
            value={fromTz}
            onChange={(e) => setFromTz(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
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

        <label className="block text-sm font-semibold text-amber-950">
          To time zone
          <select
            value={toTz}
            onChange={(e) => setToTz(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
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

      {/* Display */}
      <div
        ref={fsRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${
          invalidInput
            ? "border-rose-300 bg-rose-50 text-rose-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 280 }}
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
                width:min(1400px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 900 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.14em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(56px, 7.8vw, 120px)/1.05 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.04em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 clamp(14px, 2.2vw, 24px)/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.06em;
                text-transform:uppercase;
                opacity:.86;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.78;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full flex-col gap-4 p-6"
          style={{ minHeight: 280 }}
        >
          {!preview ? (
            <div className="rounded-2xl border border-rose-200 bg-white p-4 text-sm text-rose-900">
              Enter a valid date and time (for example 2026-01-18 and{" "}
              {showSeconds ? "09:30:00" : "09:30"}).
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-amber-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    From
                  </div>
                  <div className="mt-1 text-sm font-bold text-amber-950">
                    {getOptLabel(normalizeTz(fromTz))}
                  </div>
                  <div className="mt-3 font-mono text-3xl font-extrabold tracking-wider text-amber-950">
                    {preview.fromText}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    {preview.fromAb ? `Abbr: ${preview.fromAb}` : " "}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    To
                  </div>
                  <div className="mt-1 text-sm font-bold text-amber-950">
                    {getOptLabel(normalizeTz(toTz))}
                  </div>
                  <div className="mt-3 font-mono text-3xl font-extrabold tracking-wider text-amber-950">
                    {preview.toText}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    {preview.toAb ? `Abbr: ${preview.toAb}` : " "}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Details
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                      Same instant
                    </div>
                    <div className="mt-1 text-sm font-semibold text-amber-950">
                      {preview.iso}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                      Shortcuts
                    </div>
                    <div className="mt-1 text-sm font-semibold text-amber-950">
                      S swap · N now · C copy · F fullscreen
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                      Share
                    </div>
                    <div className="mt-1 text-sm font-semibold text-amber-950">
                      Copy link to reuse settings
                    </div>
                  </div>
                </div>
              </div>

              {copied && (
                <div className="text-center text-xs font-bold text-amber-900">
                  {copied}
                </div>
              )}
            </>
          )}
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Time Zone Conversion</div>
            <div className="fs-time">
              {preview ? (
                <>
                  <div>{getOptLabel(normalizeTz(fromTz))}</div>
                  <div className="opacity-90">{preview.fromText}</div>
                  <div className="mt-3">{getOptLabel(normalizeTz(toTz))}</div>
                  <div className="opacity-90">{preview.toText}</div>
                </>
              ) : (
                "Enter date and time"
              )}
            </div>
            <div className="fs-sub">{preview ? `ISO ${preview.iso}` : " "}</div>
            <div className="fs-help">
              S swap · N now · C copy · F fullscreen
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Saved to this browser (local storage). Share creates a link with your
          settings.
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>

      {/* Small note on DST */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold text-amber-950">DST note</div>
        <p className="mt-2 leading-relaxed">
          Daylight saving can make some local times ambiguous or invalid on
          transition days. This converter uses the browser’s time zone data and
          resolves conversions to an absolute instant.
        </p>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function TimeZoneConverterPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/time-zone-converter";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Time Zone Converter",
        url,
        description:
          "Convert a date and time between time zones with DST-aware results, copy-friendly output, share links, and fullscreen display.",
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
            name: "Time Zone Converter",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does this time zone converter handle DST?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It uses the browser’s time zone database to convert your input into an absolute instant, then formats that instant in the destination time zone. DST changes are applied automatically.",
            },
          },
          {
            "@type": "Question",
            name: "What does “From” mean?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "“From” is the time zone you intended the input date and time to be in. The converter interprets your input as a local time in that zone.",
            },
          },
          {
            "@type": "Question",
            name: "Can I share a conversion?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use Share to copy a link that includes your zones, date, time, and seconds setting.",
            },
          },
          {
            "@type": "Question",
            name: "Does this save my settings?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Your selected zones and input time are saved to local storage in this browser on this device.",
            },
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
            / <span className="text-amber-950">Time Zone Converter</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Time Zone Converter
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Convert time between time zones with DST handling. Copy results,
            swap zones, and share a link that preserves your settings.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <TimeZoneConverterCard />

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Fast workflow</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Pick zones, set date and time, then copy the result or share a
              link. Use <strong>Swap</strong> when you just want the reverse.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">DST-aware</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Daylight saving is applied automatically based on the selected
              time zones and the chosen date.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>S</strong> = Swap zones
              </li>
              <li>
                <strong>N</strong> = Set to now
              </li>
              <li>
                <strong>C</strong> = Copy results
              </li>
              <li>
                <strong>F</strong> = Fullscreen
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free time zone converter for scheduling across regions
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>time zone converter</strong> helps you convert a{" "}
              <strong>specific date and time</strong> between time zones. Choose
              the zone you mean for the input time (From), then select the zone
              you want to convert to (To). The result is calculated using your
              browser’s time zone data, so <strong>DST changes</strong> are
              applied automatically.
            </p>

            <p>
              If you coordinate meetings across teams, the most common mistake
              is converting “today at 9” without considering daylight saving or
              a future date where DST rules differ. This tool keeps the date
              attached to the conversion so you get the right answer for the day
              you care about.
            </p>

            <p>
              Want a live clock instead? Try{" "}
              <Link to="/world-clock" className="font-semibold hover:underline">
                World Clock
              </Link>{" "}
              or a{" "}
              <Link
                to="/atomic-clock"
                className="font-semibold hover:underline"
              >
                Clock
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                DST-aware conversion
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Automatically applies daylight saving for the selected date.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Copy and share
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Copy results or a shareable link that preserves settings.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Saved settings
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Remembers your zones and input time in local storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (BOTTOM, always rendered) */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Time Zone Converter FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How does this time zone converter handle DST?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It converts your input into an absolute instant and then formats
              that instant in the destination time zone. Daylight saving is
              applied automatically based on the date and time zone rules.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What does “From” mean?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              “From” is the time zone you intended your input date and time to
              be in. The converter treats your input as a local time in that
              zone.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I share a conversion?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click <strong>Share</strong> to copy a link that includes the
              zones, date, time, and seconds setting so someone else sees the
              same conversion.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does it save my settings?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Your inputs are saved to local storage in this browser on
              this device.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
