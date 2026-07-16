// app/routes/current-local-time.tsx
import type { Route } from "./+types/current-local-time";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  ContentSection,
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
import HowItWorks from "~/clients/components/current-local-time/HowItWorks";
import Disclaimer from "~/clients/components/current-local-time/Disclaimer";
import FAQ from "~/clients/components/current-local-time/FAQ";
import KeyboardShortcuts from "~/clients/components/current-local-time/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/current-local-time/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Current Local Time | Device Clock with Fullscreen";
  const description =
    "View the current local time from your device clock with seconds, 12- or 24-hour formatting, copy, and fullscreen options.";

  const url = "https://www.ilovetimers.com/current-local-time";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "current local time",
        "local time now",
        "current time now",
        "time right now",
        "current time",
        "local time",
        "current time in my location",
      ].join(", "),
    },
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function formatClock(d: Date, opts: { use24: boolean; showSeconds: boolean }) {
  const { use24, showSeconds } = opts;

  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
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
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();

    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    if (use24) {
      const hh = String(h).padStart(2, "0");
      return showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    }

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const hh = String(h12).padStart(2, "0");
    return showSeconds ? `${hh}:${mm}:${ss} ${ampm}` : `${hh}:${mm} ${ampm}`;
  }
}

function formatDateLine(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return d.toDateString();
  }
}

// ISO week number (week starts Monday)
function isoWeekNumber(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Thursday in current week decides the year
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - day + 3);

  const firstThursday = new Date(d.getFullYear(), 0, 4);
  firstThursday.setHours(0, 0, 0, 0);

  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);

  const diffMs = d.getTime() - firstThursday.getTime();
  return 1 + Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
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
   CURRENT LOCAL TIME CARD
========================================================= */
function CurrentLocalTimeCard({ initialNowISO }: { initialNowISO: string }) {
  const tz = useMemo(() => safeTimeZone(), []);

  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(false);
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

  const [activeZoneKey, setActiveZoneKey] = useState<string>("local");

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

  const activeTimeText = useMemo(() => {
    if (activeZone.tz === "local") {
      return formatClock(now, { use24, showSeconds });
    }
    return formatTimeInZone(now, activeZone.tz, { use24, showSeconds });
  }, [now, activeZone.tz, use24, showSeconds]);

  const dateText = useMemo(() => formatDateLine(now), [now]);
  const weekNo = useMemo(() => isoWeekNumber(now), [now]);

  const zoneTiles = useMemo(() => {
    // Tiles don’t need seconds even if main display shows them.
    const tileOpts = { use24, showSeconds: false };
    return zones
      .filter((z) => z.key !== "local")
      .map((z) => ({
        ...z,
        time: formatTimeInZone(now, z.tz, tileOpts),
      }));
  }, [zones, now, use24]);

  const copyText = useMemo(() => {
    const zoneLabel = activeZone.tz === "local" ? tz : activeZone.label;
    return `${activeTimeText} (${zoneLabel}) - ${dateText} (week ${weekNo})`;
  }, [activeTimeText, activeZone, tz, dateText, weekNo]);

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
    initialScale: isFs ? 1 : 0.95,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
    }

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
    }
  };

  const topLabel = useMemo(() => {
    if (activeZone.tz === "local") return `Local time now · ${tz}`;
    return `Time in ${activeZone.label} now`;
  }, [activeZone, tz]);

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Current Local Time"
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
          </span>

          <div className="timer-clock-context mt-3 text-center text-sm font-semibold text-slate-700">
            <div className="text-2xl font-semibold text-slate-700 sm:text-3xl">
              {dateText}, week {weekNo}
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

          </>
        )}

        {/* Quick compare (normal only) */}
        {!isFs && (
          <div className="timer-clock-comparison mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">
                Quick compare
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
          </div>
        )}

        {!isFs && (
          <ShortcutHint className="timer-clock-shortcut">
            Shortcuts: F fullscreen, C copy, S seconds, 1 12-hour, 2 24-hour
          </ShortcutHint>
        )}

        {/* Fullscreen bottom bar */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to copy · F fullscreen · C copy · S seconds · 1 (12h) · 2
              (24h)
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
export default function CurrentLocalTimePage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/current-local-time";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Current Local Time",
        url,
        description:
          "See your current local time instantly with a big readable clock, optional seconds, 12/24-hour toggle, copy, and fullscreen.",
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
            name: "Current Local Time",
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
        display={<CurrentLocalTimeCard initialNowISO={nowISO} />}
        title="Current Local Time"
        description="A large local time display with date, timezone, seconds, copy, fullscreen, and compact comparison controls."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            If you need the current time with milliseconds visible, use the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>
            . It shows local or UTC time in a larger millisecond-focused
            display while still using browser/device time.
            For a seconds-focused clock, use the{" "}
            <a className="ilt-content-link" href="/clock-with-seconds">
              clock with seconds
            </a>
            . For AM/PM as the main display, use the{" "}
            <a className="ilt-content-link" href="/12-hour-clock">
              12 hour clock
            </a>
            .
          </p>
        </ContentSection>
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>

    </PageShell>
  );
}
