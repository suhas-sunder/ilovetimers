// app/routes/utc-clock.tsx
import type { Route } from "./+types/utc-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetChip as Chip,
  SecondaryActionRow,
  SeoBand,
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Current UTC Time (Live Clock, Fullscreen)";
  const description =
    "See the current UTC time instantly. A clean, live UTC clock with a big, readable display for coordination, logging, and schedules.";

  const url = "https://www.ilovetimers.com/utc-clock";

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
  return json(
    { nowISO: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
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

function formatClockUTC(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean },
) {
  const { use24, showSeconds } = opts;

  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: !use24,
    });

    return fmt
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    const h = d.getUTCHours();
    const m = d.getUTCMinutes();
    const s = d.getUTCSeconds();
    const pad2 = (n: number) => String(n).padStart(2, "0");

    if (use24) {
      return showSeconds
        ? `${pad2(h)}:${pad2(m)}:${pad2(s)}`
        : `${pad2(h)}:${pad2(m)}`;
    }

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const hh = String(h12).padStart(2, "0");
    return showSeconds
      ? `${hh}:${pad2(m)}:${pad2(s)} ${ampm}`
      : `${hh}:${pad2(m)} ${ampm}`;
  }
}

function formatDateLineUTC(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: "UTC",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return d.toUTCString().replace(/\s\d\d:\d\d:\d\d\sGMT$/, "");
  }
}

// ISO week number for a UTC date (week starts Monday)
function isoWeekNumberUTC(date: Date) {
  const d = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  const day = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - day + 3); // Thursday

  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);

  const diffMs = d.getTime() - firstThursday.getTime();
  return 1 + Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function formatTimeInZone(
  d: Date,
  timeZone: string,
  opts: { use24: boolean; showSeconds: boolean },
) {
  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: opts.showSeconds ? "2-digit" : undefined,
      hour12: !opts.use24,
    });
    return fmt
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return "—";
  }
}

const ZoneTile = ({
  label,
  time,
  active,
  onClick,
}: {
  label: string;
  time: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "ilt-focus-ring cursor-pointer rounded-[var(--ilt-radius-control)] px-4 py-3 text-left transition",
      active ? "ilt-surface-accent" : "ilt-surface-muted hover:bg-[var(--ilt-bg-hover)]",
    ].join(" ")}
  >
    <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
      {label}
    </div>
    <div className="mt-1 font-mono text-2xl font-extrabold text-[var(--ilt-text-primary)]">
      {time}
    </div>
  </button>
);

/* =========================================================
   UTC CLOCK CARD
========================================================= */
function UtcClockCard({ initialNowISO }: { initialNowISO: string }) {
  const tzLocal = useMemo(() => safeTimeZone(), []);

  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const zones = useMemo(
    () => [
      { key: "utc", label: "UTC", tz: "UTC" },
      { key: "local", label: "Local", tz: "local" },
      { key: "vancouver", label: "Vancouver", tz: "America/Vancouver" },
      { key: "toronto", label: "Toronto", tz: "America/Toronto" },
      { key: "newyork", label: "New York", tz: "America/New_York" },
      { key: "london", label: "London", tz: "Europe/London" },
      { key: "milan", label: "Milan", tz: "Europe/Rome" },
      { key: "beijing", label: "Beijing", tz: "Asia/Shanghai" },
    ],
    [],
  );

  const [activeZoneKey, setActiveZoneKey] = useState<string>("utc");

  // Keep time accurate
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();

    if (showSeconds) {
      const t = window.setInterval(tick, 250);
      return () => window.clearInterval(t);
    }

    const d = new Date();
    const msToNextMinute = (60 - d.getSeconds()) * 1000 - d.getMilliseconds();

    const timeout = window.setTimeout(
      () => {
        tick();
        const t = window.setInterval(tick, 10_000);
        (tick as any).__interval = t;
      },
      Math.max(0, msToNextMinute),
    );

    return () => {
      window.clearTimeout(timeout);
      const t = (tick as any).__interval as number | undefined;
      if (t) window.clearInterval(t);
    };
  }, [showSeconds]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const activeZone = useMemo(() => {
    return zones.find((z) => z.key === activeZoneKey) ?? zones[0];
  }, [zones, activeZoneKey]);

  const utcTimeText = useMemo(
    () => formatClockUTC(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const utcDateText = useMemo(() => formatDateLineUTC(now), [now]);
  const utcWeekNo = useMemo(() => isoWeekNumberUTC(now), [now]);

  const activeTimeText = useMemo(() => {
    if (activeZone.tz === "UTC") return utcTimeText;
    if (activeZone.tz === "local")
      return formatTimeInZone(now, tzLocal, { use24, showSeconds });
    return formatTimeInZone(now, activeZone.tz, { use24, showSeconds });
  }, [activeZone.tz, now, tzLocal, use24, showSeconds, utcTimeText]);

  const activeSubLabel = useMemo(() => {
    if (activeZone.tz === "UTC") return "UTC";
    if (activeZone.tz === "local") return tzLocal || "Local";
    return activeZone.tz;
  }, [activeZone, tzLocal]);

  const zoneTiles = useMemo(() => {
    const tileOpts = { use24, showSeconds: false };
    return zones
      .filter((z) => z.key !== "utc")
      .filter((z) => z.key !== "local")
      .map((z) => ({
        ...z,
        time: formatTimeInZone(now, z.tz, tileOpts),
      }));
  }, [zones, now, use24]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    if (activeZone.tz === "UTC") {
      return `${utcTimeText} UTC - ${utcDateText} (week ${utcWeekNo}) (ISO: ${iso})`;
    }
    const label = activeZone.tz === "local" ? tzLocal : activeZone.label;
    return `${activeTimeText} (${label}) - ${utcDateText} (UTC week ${utcWeekNo}) (ISO: ${iso})`;
  }, [
    now,
    utcTimeText,
    utcDateText,
    utcWeekNo,
    activeTimeText,
    activeZone,
    tzLocal,
  ]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [activeTimeText, isFs, use24, showSeconds, activeZoneKey],
    minPx: 54,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 64 : 72,
    initialScale: isFs ? 1 : 0.92,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") e.preventDefault();

    if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    } else if (k === "u") {
      setActiveZoneKey("utc");
    } else if (k === "l") {
      setActiveZoneKey("local");
    }
  };

  const topLabel = useMemo(() => {
    if (activeZone.tz === "UTC") return "UTC time now";
    if (activeZone.tz === "local") return `Local time now · ${tzLocal}`;
    return `Time in ${activeZone.label} now`;
  }, [activeZone, tzLocal]);

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="UTC Clock"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
                className="accent-amber-500"
              />
              Seconds
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={use24}
                onChange={(e) => setUse24(e.target.checked)}
                className="accent-amber-500"
              />
              24-hour
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to copy" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {topLabel}
          </div>

          <span
            ref={timeTextRef}
            data-primary-display-value
            className={[
              "timer-clock-value mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {activeTimeText}
            <span className="ml-3 align-top text-base font-extrabold tracking-widest text-slate-600 sm:text-xl">
              {activeZone.tz === "UTC" ? "UTC" : ""}
            </span>
          </span>

          <div className="timer-clock-context mt-3 text-center text-sm font-semibold text-slate-700">
            <div className="text-2xl font-semibold text-slate-700 sm:text-3xl">
              {utcDateText}, week {utcWeekNo}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-600">
              ISO timestamp: {now.toISOString()}
            </div>
          </div>

        </div>

        {!isFs && (
          <>
            <SettingGroup title="Clock settings">
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
                <Toggle
                  label="Seconds"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
                <Toggle
                  label="24-hour"
                  checked={use24}
                  onCheckedChange={setUse24}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="ghost" onClick={copy} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
                className="py-2"
              >
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: F fullscreen, C copy, S seconds, 1 12-hour, 2 24-hour,
              U UTC, L local
            </ShortcutHint>
          </>
        )}

        {/* Quick compare (normal only) */}
        {!isFs && (
          <div className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">
                Quick compare
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  active={activeZoneKey === "utc"}
                  onClick={() => setActiveZoneKey("utc")}
                >
                  UTC
                </Chip>
                <Chip
                  active={activeZoneKey === "local"}
                  onClick={() => setActiveZoneKey("local")}
                >
                  Local
                </Chip>
                <Chip
                  active={activeZoneKey === "toronto"}
                  onClick={() => setActiveZoneKey("toronto")}
                >
                  Toronto
                </Chip>
                <Chip
                  active={activeZoneKey === "newyork"}
                  onClick={() => setActiveZoneKey("newyork")}
                >
                  New York
                </Chip>
                <Chip
                  active={activeZoneKey === "london"}
                  onClick={() => setActiveZoneKey("london")}
                >
                  London
                </Chip>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ZoneTile
                label={`Local (${tzLocal})`}
                time={formatTimeInZone(now, tzLocal, {
                  use24,
                  showSeconds: false,
                })}
                active={activeZoneKey === "local"}
                onClick={() => setActiveZoneKey("local")}
              />
              <ZoneTile
                label="UTC"
                time={formatClockUTC(now, { use24, showSeconds: false })}
                active={activeZoneKey === "utc"}
                onClick={() => setActiveZoneKey("utc")}
              />
              {zoneTiles.map((z) => (
                <ZoneTile
                  key={z.key}
                  label={z.label}
                  time={z.time}
                  active={activeZoneKey === z.key}
                  onClick={() => setActiveZoneKey(z.key)}
                />
              ))}
            </div>

            <div className="mt-2 text-xs text-slate-600">
              Selected zone:{" "}
              <span className="font-semibold text-slate-700">
                {activeZone.label}
              </span>{" "}
              <span className="text-slate-500">({activeSubLabel})</span>
            </div>
          </div>
        )}

        {/* Fullscreen bottom bar */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to copy · F fullscreen · C copy · S seconds · 1 (12h) · 2
              (24h) · U UTC · L local
            </div>
            <div className="flex items-center gap-2">
              <Btn kind="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
              >
                Exit fullscreen
              </Btn>
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
export default function UtcClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/utc-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "UTC Clock",
        url,
        description:
          "See the current UTC time instantly. A clean, live UTC clock with a big, readable display for coordination, logging, and schedules.",
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
          { "@type": "ListItem", position: 2, name: "UTC Clock", item: url },
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
        display={<UtcClockCard initialNowISO={nowISO} />}
        title="UTC Clock"
        description="A large UTC time display with seconds, ISO timestamp, week number, copy, fullscreen, and quick timezone comparison."
      />

      <SeoBand title="How this clock works">
        <p>
          UTC Clock shows the current Coordinated Universal Time as the primary
          display, with ISO timestamp and comparison controls kept below the main
          time. UTC is a shared reference time, so it is useful when local time
          zones would make a schedule or log harder to read.
        </p>
        <h3>When UTC helps</h3>
        <p>
          Use UTC for remote team coordination, server logs, release notes,
          incident timelines, aviation-style planning notes, or messages where
          everyone needs the same time reference. The display is based on your
          device and browser clock, so keep the device clock accurate for best
          results.
        </p>
        <h3>Useful details</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Seconds make the clock useful for live coordination and timestamp
            checks.
          </li>
          <li>
            ISO timestamp output is helpful when copying a machine-readable time
            format.
          </li>
          <li>
            Local comparison rows help confirm how UTC maps to the time shown on
            your device.
          </li>
        </ul>
        <h3>Related time tools</h3>
        <p>
          For your browser's local time, use{" "}
          <a className="ilt-content-link" href="/current-local-time">
            current local time
          </a>
          . For multiple cities, try the{" "}
          <a className="ilt-content-link" href="/world-clock">
            world clock
          </a>
          . For converting a meeting time between zones, use the{" "}
          <a className="ilt-content-link" href="/time-zone-converter">
            time zone converter
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}
