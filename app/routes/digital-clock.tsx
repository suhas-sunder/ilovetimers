// app/routes/digital-clock.tsx
import type { Route } from "./+types/digital-clock";
import { json } from "@remix-run/node";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button as Btn,
  ContentSection,
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import Disclaimer from "~/clients/components/digital-clock/Disclaimer";
import FAQ from "~/clients/components/digital-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/digital-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/digital-clock/PopularUseCases";
import HowItWorks from "~/clients/components/digital-clock/HowItWorks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Digital Clock (Big Fullscreen Clock With Seconds)";
  const description =
    "Free digital clock showing your local time with big, readable digits. Toggle seconds and 12 or 24-hour time, go fullscreen, and copy the time for classrooms or offices.";

  const url = "https://www.ilovetimers.com/digital-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "digital clock",
        "digital clock online",
        "big digital clock",
        "fullscreen digital clock",
        "current local time",
        "time now",
        "clock online",
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

function formatLocalTime(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean },
) {
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
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();

    if (use24) {
      return showSeconds
        ? `${pad2(h)}:${pad2(m)}:${pad2(s)}`
        : `${pad2(h)}:${pad2(m)}`;
    }

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return showSeconds
      ? `${pad2(h12)}:${pad2(m)}:${pad2(s)} ${ampm}`
      : `${pad2(h12)}:${pad2(m)} ${ampm}`;
  }
}

function formatLocalDateLine(d: Date) {
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

/* =========================================================
   DIGITAL CLOCK CARD
========================================================= */
function DigitalClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  // Keep time accurate to boundaries (no drift)
  useEffect(() => {
    let t: number | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const d = new Date();
      setNow(d);

      const ms = d.getMilliseconds();
      const untilNext = showSeconds
        ? 1000 - ms
        : // update near the start of the next minute for "no seconds"
          (60 - d.getSeconds()) * 1000 - ms;

      t = window.setTimeout(schedule, Math.max(50, untilNext));
    };

    schedule();

    return () => {
      cancelled = true;
      if (t) window.clearTimeout(t);
    };
  }, [showSeconds]);

  const timeText = useMemo(
    () => formatLocalTime(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const dateText = useMemo(() => formatLocalDateLine(now), [now]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `${timeText} (${tz}) - ${dateText} (ISO: ${iso})`;
  }, [timeText, tz, dateText, now]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, use24, showSeconds],
    minPx: 64,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 92 : 92,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

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
    } else if (e.key === "escape" && document.fullscreenElement) {
      void fullscreen.exit();
    }
  };

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Digital Clock"
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
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center p-3 sm:p-6",
            "font-mono font-extrabold text-slate-950",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
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
          title={isFs ? "Tap/click to copy time" : undefined}
        >
          <span
            ref={timeTextRef}
            data-primary-display-value
            className={[
              "timer-clock-value inline-block text-center whitespace-nowrap",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>

          <div className="timer-clock-label mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-700 text-center">
            Local time · {tz}
          </div>

          <div className="timer-clock-context mt-4 text-sm font-semibold text-slate-700 text-center">
            {dateText}
          </div>

        </DisplayStage>

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
              Shortcuts: F fullscreen, C copy, S seconds, 1 12-hour, 2 24-hour
            </ShortcutHint>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                  className="accent-amber-500"
                />
                Seconds
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={use24}
                  onChange={(e) => setUse24(e.target.checked)}
                  className="accent-amber-500"
                />
                24-hour
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind="ghost" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to copy · F fullscreen · S seconds · 1/2 12/24-hour
              </div>
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
export default function DigitalClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/digital-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Digital Clock",
        url,
        description:
          "Big digital clock showing your current local time with fullscreen, seconds toggle, 12/24-hour mode, and copy.",
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
            name: "Digital Clock",
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
        display={<DigitalClockCard initialNowISO={nowISO} />}
        title="Digital Clock (Big Fullscreen Clock)"
        description="Big, readable local time. Toggle seconds and 12/24-hour, go fullscreen, and copy the current time."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Need milliseconds as the main focus? Open the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>
            . Need a dedicated 24-hour display? Use the{" "}
            <a className="ilt-content-link" href="/24-hour-clock">
              24 hour clock
            </a>
            . Prefer AM/PM as the main view? Use the{" "}
            <a className="ilt-content-link" href="/12-hour-clock">
              12 hour clock
            </a>
            . Need seconds called out directly? Open the{" "}
            <a className="ilt-content-link" href="/clock-with-seconds">
              clock with seconds
            </a>
            . Prefer an analog face with continuous motion? Try the{" "}
            <a className="ilt-content-link" href="/smooth-second-hand-clock">
              smooth second hand clock
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
