import type { Route } from "./+types/clock-with-seconds";
import { json } from "@remix-run/node";
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

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/clock-with-seconds";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const FAQ_ITEMS = [
  {
    question: "Does this clock show seconds by default?",
    answer:
      "Yes. The main display includes live seconds by default, with a toggle to hide them when you want a quieter clock.",
  },
  {
    question: "Is this an official time source?",
    answer:
      "No. The clock formats the time from your browser and device clock, so device settings and drift can affect what you see.",
  },
  {
    question: "Can I use it fullscreen?",
    answer:
      "Yes. The fullscreen view keeps the current time large and readable, and no ad placeholders are rendered inside the fullscreen clock frame.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "Clock with Seconds | Live Local Time Display";
  const description =
    "View the current local time with seconds in a clear browser clock. Use it for classrooms, meetings, presentations, and everyday time checks.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "clock with seconds",
        "live clock with seconds",
        "online clock with seconds",
        "full screen clock with seconds",
        "time clock with seconds live",
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
    { name: "theme-color", content: "#ffffff" },
  ];
}

export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function cleanTime(value: string) {
  return value.replace(/\u200e/g, "").trim();
}

function formatTime(
  date: Date,
  options: { use24: boolean; showSeconds: boolean },
) {
  try {
    return cleanTime(
      new Intl.DateTimeFormat(undefined, {
        hour: options.use24 ? "2-digit" : "numeric",
        minute: "2-digit",
        second: options.showSeconds ? "2-digit" : undefined,
        hour12: !options.use24,
      }).format(date),
    );
  } catch {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    if (options.use24) {
      const hourText = String(hours).padStart(2, "0");
      return options.showSeconds
        ? `${hourText}:${minutes}:${seconds}`
        : `${hourText}:${minutes}`;
    }
    const ampm = hours >= 12 ? "PM" : "AM";
    const hourText = String(hours % 12 || 12).padStart(2, "0");
    return options.showSeconds
      ? `${hourText}:${minutes}:${seconds} ${ampm}`
      : `${hourText}:${minutes} ${ampm}`;
  }
}

function formatDateLine(date: Date) {
  try {
    return cleanTime(
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(date),
    );
  } catch {
    return date.toDateString();
  }
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

function ClockWithSecondsTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [copied, setCopied] = useState(false);
  const timeZone = useMemo(() => safeTimeZone(), []);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    let timeout: number | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const next = new Date();
      setNow(next);
      const untilNext = showSeconds
        ? 1000 - next.getMilliseconds()
        : (60 - next.getSeconds()) * 1000 - next.getMilliseconds();
      timeout = window.setTimeout(schedule, Math.max(50, untilNext));
    };

    schedule();
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [showSeconds]);

  const timeText = formatTime(now, { use24, showSeconds });
  const dateText = formatDateLine(now);
  const comparisonText = formatTime(now, { use24: !use24, showSeconds });
  const copyText = `${timeText} (${timeZone})${showDate ? ` - ${dateText}` : ""}`;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, use24, showSeconds],
    minPx: 38,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 80 : 88,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  }, [copyText]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "c") {
      void copy();
    } else if (key === "s") {
      setShowSeconds((value) => !value);
    } else if (key === "d") {
      setShowDate((value) => !value);
    } else if (event.key === "1") {
      setUse24(false);
    } else if (event.key === "2") {
      setUse24(true);
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
        title="Clock With Seconds"
        onExit={() => void fullscreen.exit()}
        right={
          <Btn kind="ghost" size="sm" onClick={() => void copy()}>
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
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 430px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) void copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to copy the current time" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest">
            Local device time
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="timer-clock-value mt-3 inline-block max-w-full whitespace-nowrap text-center font-extrabold"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>
          <div className="timer-clock-context mt-4 text-sm font-semibold sm:text-base">
            {use24 ? "12-hour comparison" : "24-hour comparison"}: {comparisonText}
          </div>
          <div className="timer-clock-context mt-2 text-sm font-semibold sm:text-base">
            {showDate ? `${dateText} / ` : ""}{timeZone}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <SettingGroup title="Clock settings">
              <SettingRow className="sm:grid-cols-3">
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
                <Toggle
                  label="Date"
                  checked={showDate}
                  onCheckedChange={setShowDate}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="ghost" onClick={() => void copy()}>
                {copied ? "Copied" : "Copy current time"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: F fullscreen / C copy / S seconds / D date / 1 12-hour / 2 24-hour
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
                label="24-hour"
                checked={use24}
                onCheckedChange={setUse24}
              />
              <Toggle
                label="Date"
                checked={showDate}
                onCheckedChange={setShowDate}
              />
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap time to copy / S seconds / D date / 1 or 2 for hour mode
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function ClockWithSecondsPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Clock With Seconds",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based live clock with seconds, 12 and 24-hour modes, date toggle, copy, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Clock With Seconds", item: ROUTE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
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
        display={<ClockWithSecondsTool initialNowISO={nowISO} />}
        title="Clock With Seconds"
        description="See a large live clock with seconds visible by default, plus 12/24-hour mode, date, copy, and fullscreen controls."
      />

      <SeoBand>
        <ContentSection title="How this clock with seconds works">
          <p>
            This page shows the current time from your browser and device clock
            with seconds included in the main display. It is designed for quick
            checks, room displays, and fullscreen use when a minute-only clock
            is not detailed enough.
          </p>
          <p>
            The clock updates to the next second boundary while seconds are
            visible. Browser scheduling, device clock settings, inactive tabs,
            and display refresh rate can affect what you see, so this is not an
            official or guaranteed time source.
          </p>
        </ContentSection>

        <ContentSection title="When seconds are useful">
          <p>
            A live clock with seconds helps with shared room displays,
            classroom timing, meeting rooms, live stream timing, minute rollover
            checks, and second-screen clocks. Hide seconds when you want a
            quieter display.
          </p>
          <p>
            For a general digital clock, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            . For a room-sized display, use the{" "}
            <a className="ilt-content-link" href="/full-screen-clock">
              full screen clock
            </a>
            . For smaller fractions of a second, use the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>
            . For a clock face with a visible second hand, open the{" "}
            <a className="ilt-content-link" href="/analog-clock-with-second-hand">
              analog clock with second hand
            </a>
            . For a smooth analog display, try the{" "}
            <a className="ilt-content-link" href="/smooth-second-hand-clock">
              smooth second hand clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related clocks">
          <p>
            Open the{" "}
            <a className="ilt-content-link" href="/current-local-time">
              current local time
            </a>{" "}
            page for a local-time overview, the{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>{" "}
            for Coordinated Universal Time, or the{" "}
            <a className="ilt-content-link" href="/24-hour-clock">
              24 hour clock
            </a>{" "}
            for a dedicated 24-hour format display.
          </p>
        </ContentSection>

        <ContentSection title="Clock with seconds FAQ">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
