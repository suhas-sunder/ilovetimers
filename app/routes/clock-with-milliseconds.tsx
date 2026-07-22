// app/routes/clock-with-milliseconds.tsx
import type { Route } from "./+types/clock-with-milliseconds";
import { data as json } from "react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
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
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/clock-with-milliseconds";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const REVIEW_DATE = { iso: "2026-07-15", label: "July 15, 2026" } as const;

export function meta({}: Route.MetaArgs) {
  const title = "Clock with Milliseconds | Local Time Display";
  const description =
    "View your device's local time with a millisecond display. Browser refresh rate, rendering, and system-clock accuracy affect what appears on screen.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "clock with milliseconds",
        "live clock with milliseconds",
        "online clock milliseconds",
        "millisecond clock",
        "time with milliseconds",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: ROUTE_URL },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    { tagName: "link", rel: "canonical", href: ROUTE_URL },
  ];
}

export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

const pad2 = (value: number) => String(value).padStart(2, "0");
const pad3 = (value: number) => String(value).padStart(3, "0");

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return (
    !!element &&
    (element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      element.isContentEditable)
  );
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function getParts(date: Date, mode: "local" | "utc") {
  return {
    hours: mode === "utc" ? date.getUTCHours() : date.getHours(),
    minutes: mode === "utc" ? date.getUTCMinutes() : date.getMinutes(),
    seconds: mode === "utc" ? date.getUTCSeconds() : date.getSeconds(),
    milliseconds: mode === "utc" ? date.getUTCMilliseconds() : date.getMilliseconds(),
  };
}

function formatTime(
  date: Date,
  options: { use24: boolean; showMilliseconds: boolean; mode: "local" | "utc" },
) {
  const parts = getParts(date, options.mode);
  const suffix = options.showMilliseconds ? `.${pad3(parts.milliseconds)}` : "";
  if (options.use24) {
    return `${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}${suffix}`;
  }

  const ampm = parts.hours >= 12 ? "PM" : "AM";
  const hour12 = parts.hours % 12 || 12;
  return `${pad2(hour12)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}${suffix} ${ampm}`;
}

function formatDateLine(date: Date, mode: "local" | "utc") {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: mode === "utc" ? "UTC" : undefined,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(date)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return mode === "utc" ? date.toUTCString().slice(0, 16) : date.toDateString();
  }
}

function ClockWithMillisecondsTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(true);
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [mode, setMode] = useState<"local" | "utc">("local");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;
  const localZone = useMemo(() => safeTimeZone(), []);

  useEffect(() => {
    let raf = 0;
    let timeout = 0;
    let interval = 0;

    if (showMilliseconds) {
      const tick = () => {
        setNow(new Date());
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(raf);
    }

    const update = () => setNow(new Date());
    update();
    timeout = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 1000);
    }, 1000 - new Date().getMilliseconds());

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [showMilliseconds]);

  const timeText = useMemo(
    () => formatTime(now, { use24, showMilliseconds, mode }),
    [mode, now, showMilliseconds, use24],
  );
  const dateText = useMemo(() => formatDateLine(now, mode), [mode, now]);
  const contextText =
    mode === "utc" ? "UTC / Zulu display" : `Local device time / ${localZone}`;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, showMilliseconds, mode],
    minPx: 36,
    maxPx: isFs ? 520 : 500,
    paddingAllowancePx: isFs ? 64 : 72,
  });

  async function copyTime() {
    try {
      await navigator.clipboard.writeText(`${timeText} - ${contextText} - ${dateText}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "c") {
      void copyTime();
    } else if (key === "h") {
      setUse24((value) => !value);
    } else if (key === "m") {
      setShowMilliseconds((value) => !value);
    } else if (key === "u") {
      setMode((value) => (value === "local" ? "utc" : "local"));
    } else if (key === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  return (
    <Card
      cardRef={cardRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={isFs ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFs}
        title="Clock With Milliseconds"
        onExit={() => void fullscreen.exit()}
        right={
          <Btn kind="ghost" size="sm" onClick={() => void copyTime()}>
            {copied ? "Copied" : "Copy"}
          </Btn>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : 360,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="off"
          onClick={() => {
            if (isFs) void copyTime();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to copy the current time" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {showMilliseconds ? "Milliseconds visible" : "Seconds visible"} / {mode === "utc" ? "UTC" : "Local"}
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="mt-3 inline-block max-w-full whitespace-nowrap text-center font-mono font-extrabold"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            {contextText}
          </div>
          {showDate ? (
            <div className="mt-2 text-sm text-[var(--ilt-text-muted)] sm:text-base">
              {dateText}
            </div>
          ) : null}
        </DisplayStage>

        {!isFs ? (
          <>
            <SettingGroup
              title="Clock settings"
              description="The display uses your browser and device clock. UTC mode formats the same instant against UTC."
            >
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-4">
                <Toggle
                  label="24-hour time"
                  checked={use24}
                  onCheckedChange={setUse24}
                />
                <Toggle
                  label="Milliseconds"
                  checked={showMilliseconds}
                  onCheckedChange={setShowMilliseconds}
                />
                <Toggle
                  label="UTC mode"
                  checked={mode === "utc"}
                  onCheckedChange={(checked) => setMode(checked ? "utc" : "local")}
                />
                <Toggle
                  label="Date"
                  checked={showDate}
                  onCheckedChange={setShowDate}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void copyTime()}>
                {copied ? "Copied" : "Copy current time"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: F fullscreen / C copy / H 12-24 hour / M milliseconds / U UTC
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="Milliseconds"
                checked={showMilliseconds}
                onCheckedChange={setShowMilliseconds}
              />
              <Toggle label="UTC" checked={mode === "utc"} onCheckedChange={(checked) => setMode(checked ? "utc" : "local")} />
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap time to copy / M milliseconds / U UTC mode
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function ClockWithMillisecondsPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Clock With Milliseconds",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        dateModified: REVIEW_DATE.iso,
        description:
          "A browser-based local and UTC clock with millisecond digits, copy, fullscreen, and clear device-clock and rendering limitations.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Clock With Milliseconds", item: ROUTE_URL },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ToolHero
        display={<ClockWithMillisecondsTool initialNowISO={nowISO} />}
        title="Clock With Milliseconds"
        description="View device-based local or UTC time with live millisecond digits, copy, and fullscreen controls, with display and clock-accuracy limits explained below."
      />

      <SeoBand>
        <ContentSection title="How this millisecond clock works">
          <p>
            This page shows the current time with milliseconds in a large live
            display. It reads the time from your browser and device clock, then
            formats it as local time or UTC depending on the mode you choose.
          </p>
          <p>
            Milliseconds are the three digits after the decimal point. They
            make the clock useful when you need a precise-looking current-time
            reference, but they do not turn the browser into a calibrated
            timing instrument.
          </p>
        </ContentSection>

        <ContentSection title="When to use a clock with milliseconds">
          <p>
            Use it for timing screenshots, comparing log entries, checking
            video or audio sync moments, developer debugging, quick event
            records, or a fullscreen clock where milliseconds need to be easy
            to see.
          </p>
          <p>
            For a broader clock display, try the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            . For a seconds-first live display without milliseconds, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              clock with seconds
            </a>
            . For an atomic-style page with freeze controls, use the{" "}
            <a className="ilt-content-link" href="/atomic-clock">
              atomic clock
            </a>
            . To compare millisecond-style time across a few zones, open the{" "}
            <a className="ilt-content-link" href="/world-clock-with-milliseconds">
              world clock with milliseconds
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Local time and UTC">
          <p>
            Local mode follows your device timezone. UTC mode displays the same
            moment as Coordinated Universal Time. Both modes depend on the
            device clock and browser update behavior.
          </p>
          <p>
            If you need Unix timestamps, use the{" "}
            <a className="ilt-content-link" href="/epoch-unix-time-clock">
              epoch Unix time clock
            </a>
            . If you need to convert millisecond values into seconds, minutes,
            or hours, use the{" "}
            <a className="ilt-content-link" href="/milliseconds-converter">
              milliseconds converter
            </a>
            . For a dedicated UTC display, use the{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>
            .
          </p>
        </ContentSection>

        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            The displayed time comes from your device's system clock.
            Millisecond digits are refreshed by the browser, so display refresh
            rate, rendering workload, browser scheduling, and device performance
            can affect what appears on screen.
          </p>
          <p>
            Visible millisecond digits do not create a certified precision
            source. Display precision describes the digits shown; clock accuracy
            depends on the device clock and is a different concept.
          </p>
        </ToolTrustNote>

        <ContentSection title="Clock with milliseconds FAQ">
          <h3>Is this exact atomic time?</h3>
          <p>
            No. The display is based on your browser and device clock. It is
            useful as a visible millisecond clock, not as a calibrated timing
            instrument.
          </p>
          <h3>Can I use it fullscreen?</h3>
          <p>
            Yes. Fullscreen mode keeps the time display and controls visible
            without placing ads inside the fullscreen target.
          </p>
          <h3>Can I hide milliseconds?</h3>
          <p>
            Yes. Turn off the Milliseconds toggle when you want a seconds-only
            live clock.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
