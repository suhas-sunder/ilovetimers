// app/routes/time-zone-converter.tsx
import type { Route } from "./+types/time-zone-converter";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Button as Btn,
  ContentSection,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SeoBand,
  SecondaryActionRow,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
  Field,
  Select,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import { trackEvent } from "~/clients/lib/analytics";
import HowItWorks from "~/clients/components/time-zone-converter/HowItWorks";
import FAQ from "~/clients/components/time-zone-converter/FAQ";
import KeyboardShortcuts from "~/clients/components/time-zone-converter/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/time-zone-converter/PopularUseCases";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

const REVIEW_DATE = { iso: "2026-07-14", label: "July 14, 2026" } as const;

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Time Zone Converter (World Time, Instant Conversion)";
  const description =
    "Convert time between time zones instantly. Pick a date and time and see the matching local time in another zone with a clear, simple layout.";

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
      content: "https://www.ilovetimers.com/og-image.png",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    { tagName: "link", rel: "canonical", href: url },
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
  const analyticsBase = useMemo(() => ({ tool: "time_zone_converter" }), []);
  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const toTzRef = useRef<string>("UTC");

  const defaults = useMemo(() => deriveDefaultLocalStrings(nowISO), [nowISO]);

  // Initialize state synchronously (snappy first paint).
  const [fromTz, setFromTz] = useState<string>(() => "UTC");
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
    trackEvent("timezone_selected", {
      ...analyticsBase,
      source: "swap",
    });
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
    trackEvent("conversion_completed", {
      ...analyticsBase,
      source: "now",
      result_status: "valid",
    });
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
    if (ok) {
      setCopied("Copied");
      trackEvent("copy_result", {
        ...analyticsBase,
        result_type: "conversion",
      });
      trackEvent("conversion_completed", {
        ...analyticsBase,
        source: "copy",
        result_status: "valid",
      });
    }
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
    if (ok) {
      setCopied("Link copied");
      trackEvent("copy_result", {
        ...analyticsBase,
        result_type: "share_link",
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f") {
      if (!isFs) trackEvent("fullscreen_opened", analyticsBase);
      void fullscreen.toggle();
    } else if (k === "s") {
      swap();
    } else if (k === "n") {
      setNow();
    } else if (k === "c") {
      void onCopy();
    } else if (k === "escape" && isFs) {
      fullscreen.exit();
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
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 ilt-inline-pill px-3 py-1 text-sm font-semibold text-[var(--ilt-text-primary)]">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => {
                  const next = e.target.checked;
                  setShowSeconds(next);
                  trackEvent("format_changed", {
                    ...analyticsBase,
                    setting: "seconds",
                    enabled: next,
                  });
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

      <div className={isFs ? "flex h-full flex-col" : "timer-result-stack flex h-full flex-col"}>
        {!isFs && (
          <PresetGroup title="Common timezone pairs">
            {quickPairs.map((p) => (
              <Chip
                key={p.label}
                onClick={() => {
                  setFromTz(p.a);
                  setToTz(p.b);
                  trackEvent("timezone_selected", {
                    ...analyticsBase,
                    source: "preset_pair",
                  });
                }}
                title={`${p.a} → ${p.b}`}
              >
                {p.label}
              </Chip>
            ))}
          </PresetGroup>
        )}

        {/* Inputs */}
        {!isFs && (
          <SettingGroup className="mt-4">
            <SettingRow className="lg:grid-cols-4">
              <Field
                label="Date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                onBlur={() =>
                  trackEvent("conversion_completed", {
                    ...analyticsBase,
                    source: "date",
                    result_status: preview ? "valid" : "invalid",
                  })
                }
              />

              <Field
                label={`Time ${showSeconds ? "(HH:MM:SS)" : "(HH:MM)"}`}
                inputMode="numeric"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                onBlur={() =>
                  trackEvent("conversion_completed", {
                    ...analyticsBase,
                    source: "time",
                    result_status: preview ? "valid" : "invalid",
                  })
                }
                placeholder={showSeconds ? "09:30:00" : "09:30"}
              />

              <Select
                label="From time zone"
                value={fromTz}
                onChange={(e) => {
                  setFromTz(e.target.value);
                  trackEvent("timezone_selected", {
                    ...analyticsBase,
                    zone_role: "from",
                  });
                }}
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
              </Select>

              <Select
                label="To time zone"
                value={toTz}
                onChange={(e) => {
                  setToTz(e.target.value);
                  trackEvent("timezone_selected", {
                    ...analyticsBase,
                    zone_role: "to",
                  });
                }}
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
              </Select>
            </SettingRow>
          </SettingGroup>
        )}

        {!isFs && (
          <>
            <SecondaryActionRow className="timer-result-actions">
              <Toggle
                label="Seconds"
                checked={showSeconds}
                onCheckedChange={(next) => {
                  setShowSeconds(next);
                  trackEvent("format_changed", {
                    ...analyticsBase,
                    setting: "seconds",
                    enabled: next,
                  });
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

              <Btn kind="ghost" onClick={swap} className="py-2" title="Swap (S)">
                Swap
              </Btn>
              <Btn kind="ghost" onClick={setNow} className="py-2" title="Now (N)">
                Now
              </Btn>
              <Btn
                kind="ghost"
                onClick={onCopy}
                className="py-2"
                disabled={!preview}
                title="Copy (C)"
              >
                {copied === "Copied" ? "Copied" : "Copy"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={onCopyLink}
                className="py-2"
                disabled={!shareUrl}
                title="Share link"
              >
                {copied === "Link copied" ? "Link copied" : "Share"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => {
                  trackEvent("fullscreen_opened", analyticsBase);
                  void fullscreen.toggle();
                }}
                className="py-2"
                title="Fullscreen (F)"
              >
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-result-shortcut">
              Shortcuts: S swap / N now / C copy / F fullscreen
            </ShortcutHint>
          </>
        )}

        {/* Display */}
        <div
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-start text-[var(--ilt-text-primary)]",
            invalidInput ? "bg-[var(--ilt-bg-subtle)]" : "",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
        >
          <div className="flex w-full flex-col items-center p-3 text-center sm:p-6">
            {!preview ? (
              <div className="mt-4 ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
                Enter a valid date and time.
              </div>
            ) : (
              <div className="grid w-full max-w-7xl gap-4 lg:grid-cols-2">
                <div className="timer-result-panel flex flex-col items-center ilt-surface-card p-4">
                  <div
                    data-primary-display-value
                    className={[
                      "timer-result-value",
                      "font-mono font-extrabold tracking-wider text-[var(--ilt-text-primary)]",
                      isFs
                        ? "text-4xl sm:text-6xl"
                        : "text-[clamp(34px,4vw,64px)]",
                    ].join(" ")}
                  >
                    {preview.fromText}
                  </div>
                  <div className="timer-result-label ilt-content-label">
                    From
                  </div>
                  <div className="timer-result-context mt-1 text-sm font-bold text-[var(--ilt-text-primary)]">
                    {getOptLabel(normalizeTz(fromTz))}
                  </div>
                  <div className="timer-result-context mt-2 ilt-helper-text font-semibold">
                    {preview.fromAb ? `Abbr: ${preview.fromAb}` : " "}
                  </div>
                </div>

                <div className="timer-result-panel flex flex-col items-center ilt-surface-card p-4">
                  <div
                    data-primary-display-value
                    className={[
                      "timer-result-value",
                      "font-mono font-extrabold tracking-wider text-[var(--ilt-text-primary)]",
                      isFs
                        ? "text-4xl sm:text-6xl"
                        : "text-[clamp(34px,4vw,64px)]",
                    ].join(" ")}
                  >
                    {preview.toText}
                  </div>
                  <div className="timer-result-label ilt-content-label">
                    To
                  </div>
                  <div className="timer-result-context mt-1 text-sm font-bold text-[var(--ilt-text-primary)]">
                    {getOptLabel(normalizeTz(toTz))}
                  </div>
                  <div className="timer-result-context mt-2 ilt-helper-text font-semibold">
                    {preview.toAb ? `Abbr: ${preview.toAb}` : " "}
                  </div>
                </div>

                <div className="timer-result-panel ilt-surface-card p-4 lg:col-span-2">
                  <div className="ilt-content-label">
                    ISO
                  </div>
                  <div className="mt-2 break-all font-mono text-sm font-semibold text-[var(--ilt-text-primary)]">
                    {preview.iso}
                  </div>

                </div>
              </div>
            )}

            <div className="mt-4 ilt-content-label">
              {statusLabel}
            </div>
          </div>

          <FullscreenBottomBar show={isFs}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="ilt-helper-text sm:text-sm">
                S swap / N now / C copy / F fullscreen / Esc exit
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
        dateModified: REVIEW_DATE.iso,
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
        operatingSystem: "Web browser",
        url,
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
        display={<TimeZoneConverterCard nowISO={nowISO} />}
        title="Time Zone Converter"
        description="Convert a chosen date and time between time zones with DST-aware results, share links, copy output, and saved state."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Need to compare several people or cities before choosing a meeting
            slot? Use the{" "}
            <a className="ilt-content-link" href="/time-zone-meeting-planner">
              time zone meeting planner
            </a>{" "}
            for multi-zone work windows and candidate meeting times.
          </p>
        </ContentSection>
        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            Timezone conversion uses browser-supported IANA timezone data.
            Daylight-saving transitions can create local times that occur twice
            or do not occur at all. When an entered wall time is ambiguous,
            verify important appointments against the participating locations.
          </p>
          <p>
            The page formats the selected date and time using the timezone data
            available to the browser. It does not guarantee that every DST
            ambiguity is resolved the way a particular calendar service will
            resolve it.
          </p>
        </ToolTrustNote>
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
      </SeoBand>

    </PageShell>
  );
}
