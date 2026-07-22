// app/routes/military-time-clock.tsx
import type { Route } from "./+types/military-time-clock";
import { data as json } from "react-router";
import {
  useCallback,
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
  Select,
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

type ClockMode = "local" | "utc";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/military-time-clock";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export function meta({}: Route.MetaArgs) {
  const title = "Military Time Clock | Current 24-Hour Time";
  const description =
    "View the current local time in military-style 24-hour format with hours, minutes, and supported second-level display options.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "military time clock",
        "military time now",
        "24 hour clock",
        "army time clock",
        "current military time",
        "zulu time clock",
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

export async function loader() {
  return json({ nowISO: new Date().toISOString() });
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getParts(date: Date, mode: ClockMode) {
  return mode === "utc"
    ? {
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds(),
      }
    : {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      };
}

function formatMilitaryTime(date: Date, mode: ClockMode, showSeconds: boolean) {
  const parts = getParts(date, mode);
  const compact = `${pad(parts.hours)}${pad(parts.minutes)}${showSeconds ? pad(parts.seconds) : ""}`;
  const readable = `${pad(parts.hours)}:${pad(parts.minutes)}${showSeconds ? `:${pad(parts.seconds)}` : ""}`;
  return { compact, readable };
}

function formatStandardTime(date: Date, mode: ClockMode, showSeconds: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: true,
    timeZone: mode === "utc" ? "UTC" : undefined,
    timeZoneName: "short",
  }).format(date);
}

function formatDate(date: Date, mode: ClockMode) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: mode === "utc" ? "UTC" : undefined,
  }).format(date);
}

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

function MilitaryTimeClockTool({
  nowISO,
}: {
  nowISO: string;
}) {
  const initialDate = useMemo(() => new Date(nowISO), [nowISO]);
  const [now, setNow] = useState(initialDate);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [mode, setMode] = useState<ClockMode>("local");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(new Date()),
      showSeconds ? 250 : 1000,
    );
    return () => window.clearInterval(interval);
  }, [showSeconds]);

  const military = formatMilitaryTime(now, mode, showSeconds);
  const standardTime = formatStandardTime(now, mode, showSeconds);
  const dateText = formatDate(now, mode);
  const modeLabel = mode === "utc" ? "UTC / Zulu time" : "Local device time";
  const zoneLabel =
    mode === "utc"
      ? "Zulu"
      : Intl.DateTimeFormat().resolvedOptions().timeZone || "local timezone";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [military.readable, isFs, showSeconds, mode],
    minPx: 56,
    maxPx: isFs ? 560 : 500,
    paddingAllowancePx: isFs ? 64 : 72,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(military.compact);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [military.compact]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "s") {
      setShowSeconds((value) => !value);
    } else if (key === "u") {
      setMode((value) => (value === "utc" ? "local" : "utc"));
    } else if (key === "d") {
      setShowDate((value) => !value);
    } else if (key === "c") {
      void copy();
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
        title="Military Time Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <Btn kind="ghost" onClick={() => void copy()} size="sm">
            {copied ? "Copied" : "Copy"}
          </Btn>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 font-mono sm:p-6"
          style={{
            minHeight: isFs ? 0 : 340,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="off"
          onClick={() => {
            if (isFs) void copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to copy military time" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest">
            {modeLabel}
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="timer-clock-value mt-3 inline-block whitespace-nowrap text-center font-extrabold tracking-widest"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {military.readable}
          </span>
          <div className="timer-clock-context mt-4 text-sm font-semibold sm:text-base">
            Military format: {military.compact}
          </div>
          <div className="timer-clock-context mt-2 text-sm font-semibold sm:text-base">
            Standard time: {standardTime}
          </div>
          {showDate ? (
            <div className="timer-clock-context mt-2 text-sm font-semibold sm:text-base">
              {dateText} / {zoneLabel}
            </div>
          ) : null}
        </DisplayStage>

        {!isFs ? (
          <>
            <SettingGroup title="Clock settings">
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-4">
                <Toggle
                  label="Seconds"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
                <Toggle
                  label="Date"
                  checked={showDate}
                  onCheckedChange={setShowDate}
                />
                <Select
                  label="Time source"
                  value={mode}
                  onChange={(event) => setMode(event.currentTarget.value as ClockMode)}
                >
                  <option value="local">Local</option>
                  <option value="utc">UTC / Zulu</option>
                </Select>
                <div className="ilt-helper-text flex items-end">
                  {mode === "utc"
                    ? "Zulu mode shows UTC, not your local time."
                    : "Local mode uses your device clock and timezone."}
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void copy()}>
                {copied ? "Copied" : "Copy military time"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: F fullscreen / C copy / S seconds / U UTC or local / D
              date
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="Seconds"
                checked={showSeconds}
                onCheckedChange={setShowSeconds}
              />
              <Toggle
                label="Date"
                checked={showDate}
                onCheckedChange={setShowDate}
              />
              <Select
                label="Mode"
                value={mode}
                onChange={(event) => setMode(event.currentTarget.value as ClockMode)}
                className="min-w-[10rem]"
              >
                <option value="local">Local</option>
                <option value="utc">UTC / Zulu</option>
              </Select>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap time to copy / F fullscreen / U UTC or local
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function MilitaryTimeClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Military Time Clock",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "Show the current time as a live military-style 24-hour clock with local and UTC display options.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Military Time Clock",
            item: ROUTE_URL,
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
        display={<MilitaryTimeClockTool nowISO={nowISO} />}
        title="Military Time Clock"
        description="See the current time in live 24-hour military format, copy the HHMM value, and switch between local time and UTC/Zulu display."
      />

      <SeoBand>
        <ContentSection title="How this military time clock works">
          <p>
            This clock shows the current time in 24-hour military-style format.
            It uses your browser and device clock, then formats the hour from
            00 through 23 instead of using AM and PM.
          </p>
          <p>
            Local mode follows your device timezone. UTC / Zulu mode shows the
            same instant against Coordinated Universal Time, which is useful
            when schedules use Z time. It does not convert a written time
            between zones; for that, use the{" "}
            <a className="ilt-content-link" href="/time-zone-converter">
              time zone converter
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Reading 0000, 1200, 2359, and 2400">
          <p>
            Military time starts at 0000, which means 12:00 AM at the start of
            the day. Noon is 1200. One minute before midnight is 2359.
          </p>
          <p>
            You may see 2400 in schedules as an end-of-day notation, especially
            when a shift or service period ends at midnight. This live clock
            rolls from 2359 to 0000 because 0000 is the actual start of the next
            day.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            A live military time clock is useful for work shifts, logistics,
            travel, healthcare-style schedules, international coordination,
            operations rooms, classrooms, and any situation where AM/PM wording
            can cause confusion.
          </p>
          <p>
            If you need to convert a specific written time, use the{" "}
            <a className="ilt-content-link" href="/military-time-converter">
              military time converter
            </a>
            . For a general large clock, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/24-hour-clock">
              24 hour clock
            </a>{" "}
            for colon-formatted 24-hour time, or the{" "}
            <a className="ilt-content-link" href="/current-local-time">
              current local time
            </a>
            . Prefer AM/PM? Use the{" "}
            <a className="ilt-content-link" href="/12-hour-clock">
              12 hour clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Military time clock FAQ">
          <h3>Is military time the same as timezone conversion?</h3>
          <p>
            No. Military time is a 24-hour display format. Timezone conversion
            changes the location or UTC offset used to interpret a time.
          </p>
          <h3>Does this clock use an official military time source?</h3>
          <p>
            No. It runs in your browser and depends on your device clock. UTC /
            Zulu mode formats the browser time as UTC.
          </p>
          <h3>Can I show seconds?</h3>
          <p>
            Yes. Use the Seconds toggle to include or hide seconds in the live
            display and copied value.
          </p>
          <h3>How is this related to UTC?</h3>
          <p>
            UTC is a shared time reference. Military schedules often use Zulu
            time for UTC, and the{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>{" "}
            shows that reference in a dedicated display.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
