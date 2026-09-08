import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Button,
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
  ToolFrame,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

const SITE_URL = "https://www.ilovetimers.com";
const REVIEW_DATE = { iso: "2026-07-15", label: "July 15, 2026" } as const;

type FaqItem = {
  question: string;
  answer: string;
};

type ZoneOption = {
  id: string;
  name: string;
  timeZone: string;
  note?: string;
};

const ZONE_OPTIONS: ZoneOption[] = [
  { id: "utc", name: "UTC", timeZone: "UTC" },
  { id: "new_york", name: "New York", timeZone: "America/New_York" },
  { id: "los_angeles", name: "Los Angeles", timeZone: "America/Los_Angeles" },
  { id: "chicago", name: "Chicago", timeZone: "America/Chicago" },
  { id: "london", name: "London", timeZone: "Europe/London" },
  { id: "paris", name: "Paris", timeZone: "Europe/Paris" },
  { id: "berlin", name: "Berlin", timeZone: "Europe/Berlin" },
  { id: "dubai", name: "Dubai", timeZone: "Asia/Dubai" },
  { id: "mumbai", name: "Mumbai", timeZone: "Asia/Kolkata", note: "India" },
  { id: "singapore", name: "Singapore", timeZone: "Asia/Singapore" },
  { id: "tokyo", name: "Tokyo", timeZone: "Asia/Tokyo" },
  { id: "sydney", name: "Sydney", timeZone: "Australia/Sydney" },
  { id: "auckland", name: "Auckland", timeZone: "Pacific/Auckland" },
];

const FULL_SCREEN_CLOCK_FAQ: FaqItem[] = [
  {
    question: "Does the full screen clock enter fullscreen automatically?",
    answer:
      "No. Browsers require a user action before entering fullscreen, so the page gives you a prominent fullscreen control below the clock.",
  },
  {
    question: "Can the full screen clock show seconds?",
    answer:
      "Yes. Seconds are visible by default and can be hidden when you want a calmer room clock.",
  },
  {
    question: "Is this clock an official time source?",
    answer:
      "No. It uses your browser and device clock, so device settings, browser scheduling, and display refresh rate can affect what you see.",
  },
];

const WORLD_SECONDS_FAQ: FaqItem[] = [
  {
    question: "Does this world clock show seconds for every city?",
    answer:
      "Yes. Seconds are visible by default on the local display and each selected city or timezone row.",
  },
  {
    question: "Can I add and remove cities?",
    answer:
      "Yes. Choose a city or timezone from the add menu, remove rows you do not need, or reset to the default set.",
  },
  {
    question: "Are timezone rules official here?",
    answer:
      "No. The page uses your browser Intl timezone behavior and device clock. It is a practical display, not an official timezone authority.",
  },
];

const WORLD_MILLISECONDS_FAQ: FaqItem[] = [
  {
    question: "Does this world clock show milliseconds?",
    answer:
      "Yes. The local time and selected world time rows show live milliseconds after the seconds value.",
  },
  {
    question: "Is it guaranteed to be millisecond accurate?",
    answer:
      "No. The display depends on your device clock, JavaScript update cadence, browser scheduling, and screen refresh rate.",
  },
  {
    question: "Why are there only a few default rows?",
    answer:
      "A modest default set keeps the page responsive while milliseconds update frequently. You can add or remove rows as needed.",
  },
];

const ANALOG_SECOND_HAND_FAQ: FaqItem[] = [
  {
    question: "Is the second hand visible by default?",
    answer:
      "Yes. This page opens with the second hand visible so it is easy to use as a live analog clock face.",
  },
  {
    question: "Can I switch between ticking and smooth movement?",
    answer:
      "Yes. Ticking mode moves in one-second steps, while smooth mode sweeps continuously using browser animation frames.",
  },
  {
    question: "Can I use the analog clock fullscreen?",
    answer:
      "Yes. Fullscreen keeps the clock face large and does not place ad placeholders inside the fullscreen target.",
  },
];

const FULL_SCREEN_ANALOG_FAQ: FaqItem[] = [
  {
    question: "Does the full screen analog clock open fullscreen automatically?",
    answer:
      "No. Browsers require a user action before entering fullscreen, so the fullscreen control stays below the analog face.",
  },
  {
    question: "Is the second hand visible in fullscreen?",
    answer:
      "Yes. The second hand is visible by default, and you can hide it or switch between ticking and smooth movement.",
  },
  {
    question: "Is this an official clock source?",
    answer:
      "No. It uses your browser and device clock, so device settings, browser scheduling, and display refresh rate can affect the display.",
  },
];

const BIG_DIGITAL_CLOCK_FAQ: FaqItem[] = [
  {
    question: "How is this different from the regular digital clock?",
    answer:
      "This page keeps the digital time as large and room-readable as possible, with fewer settings around the display.",
  },
  {
    question: "Can the big digital clock show seconds?",
    answer:
      "Yes. Seconds are visible by default and can be hidden when you want a calmer large display.",
  },
  {
    question: "Does the big digital clock use an official time source?",
    answer:
      "No. The display uses your browser and device clock. It is useful as a large display, not a certified time source.",
  },
];

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

function cleanText(value: string) {
  return value.replace(/\u200e/g, "").trim();
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function pad3(value: number) {
  return String(value).padStart(3, "0");
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(options: {
  timeZone?: string;
  use24: boolean;
  showSeconds: boolean;
}) {
  const key = `${options.timeZone ?? "local"}|${options.use24 ? "24" : "12"}|${
    options.showSeconds ? "sec" : "min"
  }`;
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: options.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: options.showSeconds ? "2-digit" : undefined,
    hour12: !options.use24,
  });
  formatterCache.set(key, formatter);
  return formatter;
}

function formatClockTime(
  date: Date,
  options: {
    timeZone?: string;
    use24: boolean;
    showSeconds: boolean;
    showMilliseconds?: boolean;
  },
) {
  try {
    const formatter = getFormatter(options);
    if (!options.showMilliseconds) return cleanText(formatter.format(date));

    const parts = formatter.formatToParts(date);
    const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value;
    const timeBody = parts
      .filter((part) => part.type !== "dayPeriod")
      .map((part) => part.value)
      .join("")
      .trim();
    return cleanText(
      `${timeBody}.${pad3(date.getMilliseconds())}${
        dayPeriod ? ` ${dayPeriod}` : ""
      }`,
    );
  } catch {
    const hours = options.timeZone === "UTC" ? date.getUTCHours() : date.getHours();
    const minutes =
      options.timeZone === "UTC" ? date.getUTCMinutes() : date.getMinutes();
    const seconds =
      options.timeZone === "UTC" ? date.getUTCSeconds() : date.getSeconds();
    const suffix = options.showMilliseconds ? `.${pad3(date.getMilliseconds())}` : "";
    const minuteText = String(minutes).padStart(2, "0");
    const secondText = String(seconds).padStart(2, "0");

    if (options.use24) {
      return options.showSeconds
        ? `${String(hours).padStart(2, "0")}:${minuteText}:${secondText}${suffix}`
        : `${String(hours).padStart(2, "0")}:${minuteText}`;
    }

    const ampm = hours >= 12 ? "PM" : "AM";
    const hourText = String(hours % 12 || 12).padStart(2, "0");
    return options.showSeconds
      ? `${hourText}:${minuteText}:${secondText}${suffix} ${ampm}`
      : `${hourText}:${minuteText} ${ampm}`;
  }
}

function formatDateLine(date: Date, timeZone?: string) {
  try {
    return cleanText(
      new Intl.DateTimeFormat(undefined, {
        timeZone,
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

function formatShortDate(date: Date, timeZone?: string) {
  try {
    return cleanText(
      new Intl.DateTimeFormat(undefined, {
        timeZone,
        weekday: "short",
        month: "short",
        day: "2-digit",
      }).format(date),
    );
  } catch {
    return date.toDateString();
  }
}

function zoneLabel(zone: string) {
  if (zone === "UTC") return "UTC";
  return zone.split("/").pop()?.replace(/_/g, " ") ?? zone;
}

function JsonLd({
  name,
  routePath,
  description,
  faqItems,
  dateModified,
}: {
  name: string;
  routePath: string;
  description: string;
  faqItems: FaqItem[];
  dateModified?: string;
}) {
  const url = `${SITE_URL}${routePath}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name,
        url,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description,
        ...(dateModified ? { dateModified } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function FaqContent({
  title,
  items,
}: {
  title: string;
  items: FaqItem[];
}) {
  return (
    <ContentSection title={title}>
      {items.map((item) => (
        <div key={item.question}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
    </ContentSection>
  );
}

function FullScreenClockTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [minimal, setMinimal] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeZone = useMemo(() => safeTimeZone(), []);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const isFullscreen = fullscreen.isFullscreen;

  useEffect(() => {
    let timeout = 0;
    let cancelled = false;

    const sync = () => {
      if (cancelled) return;
      const next = new Date();
      setNow(next);
      const delay = showSeconds
        ? 1000 - next.getMilliseconds()
        : (60 - next.getSeconds()) * 1000 - next.getMilliseconds();
      timeout = window.setTimeout(sync, Math.max(50, delay));
    };

    sync();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [showSeconds]);

  const timeText = formatClockTime(now, { use24, showSeconds });
  const dateText = formatDateLine(now);
  const comparisonText = formatClockTime(now, {
    use24: !use24,
    showSeconds,
  });
  const copyText = `${timeText} (${timeZone})${showDate ? ` - ${dateText}` : ""}`;

  const fitFontPx = useFitDisplayText({
    containerRef: displayRef,
    textRef,
    deps: [timeText, isFullscreen, showSeconds, use24, minimal],
    minPx: 42,
    maxPx: isFullscreen ? 600 : 540,
    paddingAllowancePx: isFullscreen ? 88 : 96,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
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
    } else if (key === "m") {
      setMinimal((value) => !value);
    } else if (event.key === "1") {
      setUse24(false);
    } else if (event.key === "2") {
      setUse24(true);
    } else if (key === "escape" && isFullscreen) {
      void fullscreen.exit();
    }
  };

  return (
    <ToolFrame
      frameRef={frameRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFullscreen}
      className={isFullscreen ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFullscreen}
        title="Full Screen Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <Button variant="ghost" size="sm" onClick={() => void copy()}>
            {copied ? "Copied" : "Copy"}
          </Button>
        }
      />

      <div className={isFullscreen ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayRef}
          isFullscreen={isFullscreen}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 font-mono sm:p-6"
          style={{
            minHeight: isFullscreen ? 0 : "clamp(340px, 42vw, 480px)",
            marginTop: isFullscreen ? "3.6rem" : undefined,
            marginBottom: isFullscreen ? "3.6rem" : undefined,
            overflow: isFullscreen ? "hidden" : "visible",
            userSelect: "none",
          }}
          aria-live="off"
          onClick={() => {
            if (isFullscreen) void copy();
          }}
          role={isFullscreen ? "button" : undefined}
          title={isFullscreen ? "Tap or click to copy the current time" : undefined}
        >
          {!minimal ? (
            <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest">
              Local full screen clock
            </div>
          ) : null}
          <span
            ref={textRef}
            data-primary-display-value
            className="timer-clock-value mt-3 inline-block max-w-full text-center font-extrabold"
            style={{
              fontSize: fitFontPx,
              lineHeight: "0.9",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>
          {!minimal ? (
            <>
              <div className="timer-clock-context mt-4 text-sm font-semibold sm:text-base">
                {showDate ? `${dateText} / ` : ""}
                {timeZone}
              </div>
              <div className="timer-clock-context mt-2 text-sm text-[var(--ilt-text-muted)] sm:text-base">
                {use24 ? "12-hour comparison" : "24-hour comparison"}:{" "}
                {comparisonText}
              </div>
            </>
          ) : null}
        </DisplayStage>

        {!isFullscreen ? (
          <>
            <SettingGroup
              title="Clock settings"
              description="The clock uses your browser and device time. Fullscreen requires a click or keyboard action."
            >
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-4">
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
                <Toggle
                  label="Minimal"
                  checked={minimal}
                  onCheckedChange={setMinimal}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Button variant="ghost" onClick={() => void copy()}>
                {copied ? "Copied" : "Copy current time"}
              </Button>
              <Button variant="primary" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: F fullscreen / C copy / S seconds / D date / M minimal / 1 12-hour / 2 24-hour
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFullscreen}>
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
                label="Minimal"
                checked={minimal}
                onCheckedChange={setMinimal}
              />
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap time to copy / S seconds / M minimal / 1 or 2 for hour mode
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

function WorldClockDiscoveryTool({
  initialNowISO,
  precision,
}: {
  initialNowISO: string;
  precision: "seconds" | "milliseconds";
}) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() =>
    precision === "milliseconds"
      ? ["utc", "new_york", "london", "tokyo"]
      : ["new_york", "los_angeles", "london", "tokyo"],
  );
  const [pendingId, setPendingId] = useState("utc");
  const [copied, setCopied] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const isFullscreen = fullscreen.isFullscreen;
  const localZone = useMemo(() => safeTimeZone(), []);
  const showMilliseconds = precision === "milliseconds";

  useEffect(() => {
    let raf = 0;
    let timeout = 0;

    if (showMilliseconds) {
      const tick = () => {
        setNow(new Date());
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(raf);
    }

    const sync = () => {
      const next = new Date();
      setNow(next);
      timeout = window.setTimeout(sync, Math.max(50, 1000 - next.getMilliseconds()));
    };
    sync();
    return () => window.clearTimeout(timeout);
  }, [showMilliseconds]);

  const availableOptions = useMemo(
    () => ZONE_OPTIONS.filter((option) => !selectedIds.includes(option.id)),
    [selectedIds],
  );

  useEffect(() => {
    if (availableOptions.length === 0) {
      setPendingId("");
      return;
    }
    if (!availableOptions.some((option) => option.id === pendingId)) {
      setPendingId(availableOptions[0].id);
    }
  }, [availableOptions, pendingId]);

  const selectedZones = useMemo(() => {
    const selected = new Set(selectedIds);
    return ZONE_OPTIONS.filter((option) => selected.has(option.id));
  }, [selectedIds]);

  const localTime = formatClockTime(now, {
    timeZone: localZone === "Local" ? undefined : localZone,
    use24,
    showSeconds: true,
    showMilliseconds,
  });

  const rows = selectedZones.map((zone) => ({
    ...zone,
    timeText: formatClockTime(now, {
      timeZone: zone.timeZone,
      use24,
      showSeconds: true,
      showMilliseconds,
    }),
    dateText: formatShortDate(now, zone.timeZone),
  }));

  const title =
    precision === "milliseconds"
      ? "World Clock With Milliseconds"
      : "World Clock With Seconds";
  const statusLabel = `${rows.length} selected`;

  const addZone = () => {
    if (!pendingId || selectedIds.includes(pendingId)) return;
    setSelectedIds((current) => [...current, pendingId]);
  };

  const removeZone = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const resetDefaults = () => {
    setSelectedIds(
      precision === "milliseconds"
        ? ["utc", "new_york", "london", "tokyo"]
        : ["new_york", "los_angeles", "london", "tokyo"],
    );
  };

  const copySummary = useCallback(async () => {
    try {
      const payload = [
        `Local (${localZone}): ${localTime}`,
        ...rows.map((row) => `${row.name} (${row.timeZone}): ${row.timeText}`),
      ].join("\n");
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [localTime, localZone, rows]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "c") {
      void copySummary();
    } else if (key === "h") {
      setUse24((value) => !value);
    } else if (key === "r") {
      resetDefaults();
    } else if (key === "escape" && isFullscreen) {
      void fullscreen.exit();
    }
  };

  return (
    <ToolFrame
      frameRef={frameRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFullscreen}
      className={isFullscreen ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFullscreen}
        title={title}
        onExit={() => void fullscreen.exit()}
        right={
          <Button variant="ghost" size="sm" onClick={() => void copySummary()}>
            {copied ? "Copied" : "Copy"}
          </Button>
        }
      />

      <div className={isFullscreen ? "flex h-full flex-col" : "timer-list-stack flex h-full flex-col"}>
        <div
          className={[
            "timer-display-surface relative mt-4 flex flex-col text-[var(--ilt-text-primary)]",
            isFullscreen ? "mx-2 flex-1 overflow-hidden sm:mx-4" : "p-4 sm:p-6",
          ].join(" ")}
          style={{
            minHeight: isFullscreen ? 0 : "clamp(340px, 42vw, 500px)",
            marginTop: isFullscreen ? "3.6rem" : undefined,
            marginBottom: isFullscreen ? "3.6rem" : undefined,
          }}
          aria-live="off"
        >
          <div className="timer-list-grid grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="timer-list-row p-4">
              <div
                data-primary-display-value
                className="timer-list-value max-w-full break-words font-mono font-extrabold tracking-[0.02em] text-[var(--ilt-text-primary)]"
                style={{
                  fontSize: showMilliseconds
                    ? "clamp(1.65rem, 7vw, 3.55rem)"
                    : "clamp(2rem, 8vw, 4.25rem)",
                }}
              >
                {localTime}
              </div>
              <div className="timer-list-label mt-3 text-lg font-extrabold text-[var(--ilt-text-primary)]">
                Local time
              </div>
              <div className="timer-list-context mt-1 text-sm font-semibold text-[var(--ilt-text-secondary)]">
                {localZone} / {formatShortDate(now)}
              </div>
            </div>

            {rows.map((row) => (
              <div key={row.id} className="timer-list-row p-4">
                <div
                  className="timer-list-value max-w-full break-words font-mono font-extrabold tracking-[0.02em] text-[var(--ilt-text-primary)]"
                  style={{
                    fontSize: showMilliseconds
                      ? "clamp(1.4rem, 6vw, 2.65rem)"
                      : "clamp(1.75rem, 7vw, 3.25rem)",
                  }}
                >
                  {row.timeText}
                </div>
                <div className="timer-list-label mt-3 flex flex-col gap-2 text-lg font-extrabold text-[var(--ilt-text-primary)] sm:flex-row sm:items-center sm:justify-between">
                  <span>{row.name}</span>
                  {!isFullscreen ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeZone(row.id)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="timer-list-context mt-1 text-sm font-semibold text-[var(--ilt-text-secondary)]">
                  {row.timeZone} / {row.dateText}
                  {row.note ? ` / ${row.note}` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isFullscreen ? (
          <>
            <SettingGroup
              title="World clock settings"
              description={
                showMilliseconds
                  ? "Milliseconds update frequently, so the default city set stays modest for responsiveness."
                  : "Seconds are visible on every selected city row by default."
              }
            >
              <SettingRow className="sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <Select
                  label="Add city or timezone"
                  value={pendingId}
                  onChange={(event) => setPendingId(event.currentTarget.value)}
                  onInput={(event) => setPendingId(event.currentTarget.value)}
                  disabled={availableOptions.length === 0}
                >
                  {availableOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} - {option.timeZone}
                    </option>
                  ))}
                </Select>
                <Button
                  className="self-end"
                  variant="secondary"
                  onClick={addZone}
                  disabled={!pendingId}
                >
                  Add city
                </Button>
                <Toggle
                  className="self-end"
                  label="24-hour"
                  checked={use24}
                  onCheckedChange={setUse24}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-list-actions">
              <Button variant="ghost" onClick={resetDefaults}>
                Reset defaults
              </Button>
              <Button variant="ghost" onClick={() => void copySummary()}>
                {copied ? "Copied" : "Copy summary"}
              </Button>
              <Button variant="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <ShortcutHint className="timer-list-shortcut">
              Shortcuts: F fullscreen / C copy / H 12-24 hour / R reset
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFullscreen}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="24-hour"
                checked={use24}
                onCheckedChange={setUse24}
              />
              <Button variant="ghost" size="sm" onClick={resetDefaults}>
                Reset
              </Button>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              F fullscreen / C copy / H 12-24 hour / R reset / {statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

function calcAnalogAngles(date: Date, smooth: boolean) {
  const seconds = date.getSeconds() + (smooth ? date.getMilliseconds() / 1000 : 0);
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;
  return {
    hour: hours * 30,
    minute: minutes * 6,
    second: seconds * 6,
  };
}

function AnalogClockWithSecondHandTool({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [smooth, setSmooth] = useState(false);
  const [showSecondHand, setShowSecondHand] = useState(true);
  const [copied, setCopied] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const isFullscreen = fullscreen.isFullscreen;
  const timeZone = useMemo(() => safeTimeZone(), []);

  useEffect(() => {
    let raf = 0;
    let timeout = 0;
    let interval = 0;

    if (smooth && showSecondHand) {
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
    }, Math.max(50, 1000 - new Date().getMilliseconds()));

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [smooth, showSecondHand]);

  const angles = useMemo(
    () => calcAnalogAngles(now, smooth && showSecondHand),
    [now, showSecondHand, smooth],
  );
  const digitalText = formatClockTime(now, {
    use24: false,
    showSeconds: true,
  });
  const modeText = showSecondHand
    ? smooth
      ? "Smooth second hand"
      : "Ticking second hand"
    : "Second hand hidden";

  const copyTime = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${digitalText} - ${modeText} - ${timeZone}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [digitalText, modeText, timeZone]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "c") {
      void copyTime();
    } else if (key === "s") {
      setShowSecondHand((value) => !value);
    } else if (key === "m") {
      setSmooth((value) => !value);
    } else if (key === "escape" && isFullscreen) {
      void fullscreen.exit();
    }
  };

  const marks = Array.from({ length: 60 }, (_, index) => {
    const major = index % 5 === 0;
    return (
      <line
        key={index}
        x1="0"
        y1={major ? "-128" : "-134"}
        x2="0"
        y2="-144"
        stroke="currentColor"
        strokeWidth={major ? 3 : 1.5}
        opacity={major ? 0.76 : 0.32}
        transform={`rotate(${index * 6})`}
      />
    );
  });

  return (
    <ToolFrame
      frameRef={frameRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFullscreen}
      className={isFullscreen ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFullscreen}
        title="Analog Clock With Second Hand"
        onExit={() => void fullscreen.exit()}
        right={
          <Button variant="ghost" size="sm" onClick={() => void copyTime()}>
            {copied ? "Copied" : "Copy"}
          </Button>
        }
      />

      <div className={isFullscreen ? "flex h-full flex-col" : "timer-specialty-clock-stack flex h-full flex-col"}>
        <DisplayStage
          isFullscreen={isFullscreen}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFullscreen ? 0 : 460,
            marginTop: isFullscreen ? "3.6rem" : undefined,
            marginBottom: isFullscreen ? "3.6rem" : undefined,
            overflow: "hidden",
          }}
          aria-live="off"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {modeText}
          </div>
          <div className="mt-4 aspect-square w-[min(82vw,29rem)] max-w-full text-[var(--ilt-text-primary)] sm:w-[min(64vw,42rem)]">
            <svg
              viewBox="-160 -160 320 320"
              role="img"
              aria-label="Analog clock face with visible second hand"
              className="h-full w-full"
            >
              <circle
                cx="0"
                cy="0"
                r="150"
                fill="var(--ilt-bg-panel)"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.98"
              />
              <g>{marks}</g>
              {[12, 3, 6, 9].map((number) => {
                const positions: Record<number, [number, number]> = {
                  12: [0, -106],
                  3: [106, 8],
                  6: [0, 118],
                  9: [-106, 8],
                };
                const [x, y] = positions[number];
                return (
                  <text
                    key={number}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="800"
                    fill="currentColor"
                  >
                    {number}
                  </text>
                );
              })}
              <line
                x1="0"
                y1="16"
                x2="0"
                y2="-70"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                transform={`rotate(${angles.hour})`}
              />
              <line
                x1="0"
                y1="20"
                x2="0"
                y2="-104"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.86"
                transform={`rotate(${angles.minute})`}
              />
              {showSecondHand ? (
                <line
                  data-second-hand
                  x1="0"
                  y1="26"
                  x2="0"
                  y2="-124"
                  stroke="var(--ilt-accent)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  transform={`rotate(${angles.second})`}
                />
              ) : null}
              <circle cx="0" cy="0" r="8" fill="var(--ilt-accent)" />
            </svg>
          </div>
          <div className="mt-4 text-center font-mono text-2xl font-extrabold tracking-widest text-[var(--ilt-text-primary)] sm:text-3xl">
            {digitalText}
          </div>
          <div className="mt-2 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            {timeZone}
          </div>
        </DisplayStage>

        {!isFullscreen ? (
          <>
            <SettingGroup
              title="Analog clock settings"
              description="The second hand is visible by default. Ticking mode is the default for one-second steps."
            >
              <SettingRow className="sm:grid-cols-2">
                <Toggle
                  label="Show second hand"
                  checked={showSecondHand}
                  onCheckedChange={setShowSecondHand}
                />
                <Toggle
                  label="Smooth movement"
                  checked={smooth}
                  disabled={!showSecondHand}
                  onCheckedChange={setSmooth}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Button variant="ghost" onClick={() => void copyTime()}>
                {copied ? "Copied" : "Copy current time"}
              </Button>
              <Button variant="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: F fullscreen / C copy / S second hand / M smooth-tick
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFullscreen}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="Second hand"
                checked={showSecondHand}
                onCheckedChange={setShowSecondHand}
              />
              <Toggle
                label="Smooth"
                checked={smooth}
                disabled={!showSecondHand}
                onCheckedChange={setSmooth}
              />
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              F fullscreen / C copy / S second hand / M smooth-tick
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

function FullScreenAnalogClockTool({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [smooth, setSmooth] = useState(false);
  const [showSecondHand, setShowSecondHand] = useState(true);
  const [copied, setCopied] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const isFullscreen = fullscreen.isFullscreen;
  const timeZone = useMemo(() => safeTimeZone(), []);

  useEffect(() => {
    let raf = 0;
    let timeout = 0;
    let interval = 0;

    if (smooth && showSecondHand) {
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
    }, Math.max(50, 1000 - new Date().getMilliseconds()));

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [smooth, showSecondHand]);

  const angles = useMemo(
    () => calcAnalogAngles(now, smooth && showSecondHand),
    [now, showSecondHand, smooth],
  );
  const digitalText = formatClockTime(now, {
    use24: false,
    showSeconds: true,
  });
  const modeText = showSecondHand
    ? smooth
      ? "Smooth second hand"
      : "Ticking second hand"
    : "Second hand hidden";

  const copyTime = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${digitalText} - ${modeText} - ${timeZone}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [digitalText, modeText, timeZone]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "c") {
      void copyTime();
    } else if (key === "s") {
      setShowSecondHand((value) => !value);
    } else if (key === "m") {
      setSmooth((value) => !value);
    } else if (key === "escape" && isFullscreen) {
      void fullscreen.exit();
    }
  };

  const marks = Array.from({ length: 60 }, (_, index) => {
    const major = index % 5 === 0;
    return (
      <line
        key={index}
        x1="0"
        y1={major ? "-128" : "-134"}
        x2="0"
        y2="-144"
        stroke="currentColor"
        strokeWidth={major ? 3 : 1.5}
        opacity={major ? 0.76 : 0.32}
        transform={`rotate(${index * 6})`}
      />
    );
  });

  return (
    <ToolFrame
      frameRef={frameRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFullscreen}
      className={isFullscreen ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFullscreen}
        title="Full Screen Analog Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <Button variant="ghost" size="sm" onClick={() => void copyTime()}>
            {copied ? "Copied" : "Copy"}
          </Button>
        }
      />

      <div className={isFullscreen ? "flex h-full flex-col" : "timer-specialty-clock-stack flex h-full flex-col"}>
        <DisplayStage
          isFullscreen={isFullscreen}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFullscreen ? 0 : "clamp(420px, 54vw, 620px)",
            marginTop: isFullscreen ? "3.6rem" : undefined,
            marginBottom: isFullscreen ? "3.6rem" : undefined,
            overflow: "hidden",
          }}
          aria-live="off"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            Fullscreen-ready analog face
          </div>
          <div className="mt-4 aspect-square w-[min(86vw,36rem)] max-w-full text-[var(--ilt-text-primary)] sm:w-[min(72vw,48rem)]">
            <svg
              viewBox="-160 -160 320 320"
              role="img"
              aria-label="Large analog clock face with visible second hand"
              className="h-full w-full"
            >
              <circle
                cx="0"
                cy="0"
                r="150"
                fill="var(--ilt-bg-panel)"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.98"
              />
              <g>{marks}</g>
              {[12, 3, 6, 9].map((number) => {
                const positions: Record<number, [number, number]> = {
                  12: [0, -106],
                  3: [106, 8],
                  6: [0, 118],
                  9: [-106, 8],
                };
                const [x, y] = positions[number];
                return (
                  <text
                    key={number}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="800"
                    fill="currentColor"
                  >
                    {number}
                  </text>
                );
              })}
              <line
                x1="0"
                y1="16"
                x2="0"
                y2="-70"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                transform={`rotate(${angles.hour})`}
              />
              <line
                x1="0"
                y1="20"
                x2="0"
                y2="-104"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.86"
                transform={`rotate(${angles.minute})`}
              />
              {showSecondHand ? (
                <line
                  data-second-hand
                  x1="0"
                  y1="26"
                  x2="0"
                  y2="-124"
                  stroke="var(--ilt-accent)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  transform={`rotate(${angles.second})`}
                />
              ) : null}
              <circle cx="0" cy="0" r="8" fill="var(--ilt-accent)" />
            </svg>
          </div>
          <div className="mt-4 text-center font-mono text-2xl font-extrabold tracking-widest text-[var(--ilt-text-primary)] sm:text-3xl">
            {digitalText}
          </div>
          <div className="mt-2 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            {modeText} / {timeZone}
          </div>
        </DisplayStage>

        {!isFullscreen ? (
          <>
            <SettingGroup
              title="Fullscreen analog settings"
              description="The analog face is kept large for room display. Fullscreen starts only after you choose it."
            >
              <SettingRow className="sm:grid-cols-2">
                <Toggle
                  label="Show second hand"
                  checked={showSecondHand}
                  onCheckedChange={setShowSecondHand}
                />
                <Toggle
                  label="Smooth movement"
                  checked={smooth}
                  disabled={!showSecondHand}
                  onCheckedChange={setSmooth}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Button variant="secondary" onClick={() => void copyTime()}>
                {copied ? "Copied" : "Copy current time"}
              </Button>
              <Button variant="primary" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: F fullscreen / C copy / S second hand / M smooth-tick
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFullscreen}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="Second hand"
                checked={showSecondHand}
                onCheckedChange={setShowSecondHand}
              />
              <Toggle
                label="Smooth"
                checked={smooth}
                disabled={!showSecondHand}
                onCheckedChange={setSmooth}
              />
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              F fullscreen / C copy / S second hand / M smooth-tick
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

function BigDigitalClockTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeZone = useMemo(() => safeTimeZone(), []);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const isFullscreen = fullscreen.isFullscreen;

  useEffect(() => {
    let timeout = 0;
    let cancelled = false;

    const sync = () => {
      if (cancelled) return;
      const next = new Date();
      setNow(next);
      const delay = showSeconds
        ? 1000 - next.getMilliseconds()
        : (60 - next.getSeconds()) * 1000 - next.getMilliseconds();
      timeout = window.setTimeout(sync, Math.max(50, delay));
    };

    sync();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [showSeconds]);

  const timeText = formatClockTime(now, { use24, showSeconds });
  const dateText = formatDateLine(now);
  const copyText = `${timeText} (${timeZone})${showDate ? ` - ${dateText}` : ""}`;
  const fitFontPx = useFitDisplayText({
    containerRef: displayRef,
    textRef,
    deps: [timeText, isFullscreen, showSeconds, use24, showDate],
    minPx: 50,
    maxPx: isFullscreen ? 700 : 640,
    paddingAllowancePx: isFullscreen ? 72 : 84,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
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
    } else if (key === "escape" && isFullscreen) {
      void fullscreen.exit();
    }
  };

  return (
    <ToolFrame
      frameRef={frameRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFullscreen}
      className={isFullscreen ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFullscreen}
        title="Big Digital Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <Button variant="ghost" size="sm" onClick={() => void copy()}>
            {copied ? "Copied" : "Copy"}
          </Button>
        }
      />

      <div className={isFullscreen ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayRef}
          isFullscreen={isFullscreen}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 font-mono sm:p-6"
          style={{
            minHeight: isFullscreen ? 0 : "clamp(380px, 48vw, 560px)",
            marginTop: isFullscreen ? "3.6rem" : undefined,
            marginBottom: isFullscreen ? "3.6rem" : undefined,
            overflow: isFullscreen ? "hidden" : "visible",
            userSelect: "none",
          }}
          aria-live="off"
          onClick={() => {
            if (isFullscreen) void copy();
          }}
          role={isFullscreen ? "button" : undefined}
          title={isFullscreen ? "Tap or click to copy the current time" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest">
            Large local display
          </div>
          <span
            ref={textRef}
            data-primary-display-value
            className="timer-clock-value mt-3 inline-block max-w-full text-center font-extrabold"
            style={{
              fontSize: fitFontPx,
              lineHeight: "0.86",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>
          <div className="timer-clock-context mt-4 text-center text-sm font-semibold sm:text-base">
            {showDate ? `${dateText} / ` : ""}
            {timeZone}
          </div>
        </DisplayStage>

        {!isFullscreen ? (
          <>
            <SettingGroup
              title="Display settings"
              description="Keep the display large for distance viewing. The clock uses your browser and device time."
            >
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
              <Button variant="secondary" onClick={() => void copy()}>
                {copied ? "Copied" : "Copy current time"}
              </Button>
              <Button variant="primary" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: F fullscreen / C copy / S seconds / D date / 1 12-hour / 2 24-hour
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFullscreen}>
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
    </ToolFrame>
  );
}

export function FullScreenClockPage({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  return (
    <PageShell>
      <JsonLd
        name="Full Screen Clock"
        routePath="/digital-clock"
        description="A browser-based full screen clock with large live digits, seconds, 12 and 24-hour modes, date display, copy, and fullscreen support."
        faqItems={FULL_SCREEN_CLOCK_FAQ}
      />

      <ToolHero
        display={<FullScreenClockTool initialNowISO={initialNowISO} />}
        title="Full Screen Clock"
        description="Use a large live clock for a room, second monitor, class, meeting, stream, or presentation display with seconds, date, copy, and fullscreen controls."
      />

      <SeoBand>
        <ContentSection title="How this full screen clock works">
          <p>
            This page opens directly on a large current-time display and keeps
            the fullscreen action close to the clock controls. It uses your
            browser and device time, then formats the display with seconds,
            12-hour or 24-hour mode, and an optional date line.
          </p>
          <p>
            The page does not enter fullscreen automatically because browsers
            require a user action. Once fullscreen is active, the fullscreen
            frame contains only the clock and controls, with no ad placeholders
            inside it.
          </p>
        </ContentSection>

        <ContentSection title="When fullscreen is useful">
          <p>
            A full screen clock is useful for classroom displays, meeting room
            clocks, second monitors, livestream references, desk clocks, and
            presentation rooms where the current time needs to be readable from
            a distance.
          </p>
          <p>
            For a display tuned for the largest possible digits, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              big digital clock
            </a>
            . For a general digital clock, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            . For a quieter layout, try the{" "}
            <a className="ilt-content-link" href="/minimalist-clock">
              minimalist clock
            </a>
            . For seconds-first display, open the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              clock with seconds
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related clocks">
          <p>
            Use the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>{" "}
            when smaller fractions are important, or the{" "}
            <a className="ilt-content-link" href="/current-local-time">
              current local time
            </a>{" "}
            page when you want local timezone context.
          </p>
        </ContentSection>

        <FaqContent title="Full screen clock FAQ" items={FULL_SCREEN_CLOCK_FAQ} />
      </SeoBand>
    </PageShell>
  );
}

export function WorldClockWithSecondsPage({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  return (
    <PageShell>
      <JsonLd
        name="World Clock With Seconds"
        routePath="/world-clock"
        description="A browser-based world clock with live seconds visible for local time and selected city or timezone rows."
        faqItems={WORLD_SECONDS_FAQ}
      />

      <ToolHero
        display={
          <WorldClockDiscoveryTool
            initialNowISO={initialNowISO}
            precision="seconds"
          />
        }
        title="World Clock With Seconds"
        description="Compare live world times with seconds visible by default, add or remove cities, copy the summary, and use fullscreen when you need a larger display."
      />

      <SeoBand>
        <ContentSection title="How this world clock with seconds works">
          <p>
            This page shows your local time and selected world times with live
            seconds visible in every row. Add the cities you coordinate with,
            remove rows you do not need, or reset to a practical default set.
          </p>
          <p>
            Timezone formatting comes from browser Intl support and the clock
            uses your device time. It is useful for live comparison, but it is
            not an official timezone or precision source.
          </p>
        </ContentSection>

        <ContentSection title="When seconds matter across time zones">
          <p>
            Seconds can help with remote meetings, livestream starts, online
            events, travel coordination, and exact minute rollover checks across
            multiple locations.
          </p>
          <p>
            For a broader world clock, use{" "}
            <a className="ilt-content-link" href="/world-clock">
              world clock
            </a>
            . To convert a planned meeting time, use the{" "}
            <a className="ilt-content-link" href="/time-zone-converter">
              time zone converter
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/time-zone-meeting-planner">
              time zone meeting planner
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related time displays">
          <p>
            Open the{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>{" "}
            for a dedicated UTC display, or the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              clock with seconds
            </a>{" "}
            for one large local seconds clock.
          </p>
        </ContentSection>

        <FaqContent
          title="World clock with seconds FAQ"
          items={WORLD_SECONDS_FAQ}
        />
      </SeoBand>
    </PageShell>
  );
}

export function WorldClockWithMillisecondsPage({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  return (
    <PageShell>
      <JsonLd
        name="World Clock With Milliseconds"
        routePath="/world-clock-with-milliseconds"
        description="A browser-based world clock with live milliseconds for local time and a modest set of selected timezone rows."
        faqItems={WORLD_MILLISECONDS_FAQ}
        dateModified={`${REVIEW_DATE.iso}T00:00:00Z`}
      />

      <ToolHero
        display={
          <WorldClockDiscoveryTool
            initialNowISO={initialNowISO}
            precision="milliseconds"
          />
        }
        title="World Clock With Milliseconds"
        description="Compare local and selected world times with live milliseconds, a modest default city set, copy output, and ad-free fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How this world clock with milliseconds works">
          <p>
            This page shows local time prominently with milliseconds, then lists
            selected world cities and time zones with the same millisecond
            display. The default list stays small so frequent updates remain
            responsive.
          </p>
          <p>
            Milliseconds are formatted from your browser and device clock. The
            display is affected by device clock settings, JavaScript update
            cadence, browser scheduling, screen refresh rate, and timezone
            formatting.
          </p>
        </ContentSection>

        <ContentSection title="When to use world time with milliseconds">
          <p>
            A world clock with milliseconds can be handy for comparing logs
            across time zones, debugging timestamp displays, preparing online
            event timing, or showing a developer demo where small fractions are
            visible.
          </p>
          <p>
            For a broader city list, use the{" "}
            <a className="ilt-content-link" href="/world-clock">
              world clock
            </a>
            . For one large local display, use the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>
            . For Unix time, use the{" "}
            <a className="ilt-content-link" href="/epoch-unix-time-clock">
              epoch Unix time clock
            </a>
            .
          </p>
        </ContentSection>

        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            City and timezone displays are formatted using browser-supported
            timezone data, while the current instant comes from the device's
            system clock. Millisecond rendering is also affected by browser and
            display performance.
          </p>
          <p>
            The page formats one device-reported instant for each selected
            timezone. It does not synchronize separately with the listed cities
            or provide a certified time source.
          </p>
        </ToolTrustNote>

        <ContentSection title="Related precise-looking clocks">
          <p>
            The{" "}
            <a className="ilt-content-link" href="/atomic-clock">
              atomic clock
            </a>{" "}
            page gives an atomic-style browser display, while the{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>{" "}
            shows a dedicated Coordinated Universal Time display.
          </p>
        </ContentSection>

        <FaqContent
          title="World clock with milliseconds FAQ"
          items={WORLD_MILLISECONDS_FAQ}
        />
      </SeoBand>
    </PageShell>
  );
}

export function AnalogClockWithSecondHandPage({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  return (
    <PageShell>
      <JsonLd
        name="Analog Clock With Second Hand"
        routePath="/analog-clock"
        description="A browser-based analog clock face with a second hand visible by default, ticking or smooth movement, copy, and fullscreen support."
        faqItems={ANALOG_SECOND_HAND_FAQ}
      />

      <ToolHero
        display={<AnalogClockWithSecondHandTool initialNowISO={initialNowISO} />}
        title="Analog Clock With Second Hand"
        description="Use a live analog clock face with the second hand visible by default, ticking or smooth movement, a digital readout, copy, and fullscreen controls."
      />

      <SeoBand>
        <ContentSection title="How this analog clock with second hand works">
          <p>
            This clock uses a classic analog face and opens with the second hand
            visible. Ticking mode moves in one-second steps, while smooth mode
            sweeps continuously using browser animation frames.
          </p>
          <p>
            The time comes from your browser and device clock. It is a readable
            visual clock face, not an official timekeeping source.
          </p>
        </ContentSection>

        <ContentSection title="When to use a visible second hand">
          <p>
            A visible second hand is useful for teaching analog time, classroom
            clocks, second-screen displays, fullscreen analog displays, visual
            time practice, and anyone who prefers a clock face over digits.
          </p>
          <p>
            For a general analog display, use the{" "}
            <a className="ilt-content-link" href="/analog-clock">
              analog clock
            </a>
            . For smooth sweeping motion as the main focus, use the{" "}
            <a className="ilt-content-link" href="/analog-clock">
              smooth second hand clock
            </a>
            . For a room display, use the{" "}
            <a className="ilt-content-link" href="/analog-clock">
              full screen analog clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related clocks">
          <p>
            Try the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              clock with seconds
            </a>{" "}
            for a digital seconds display, the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>{" "}
            for large digits, or the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              full screen clock
            </a>{" "}
            for an immediate room-display clock.
          </p>
        </ContentSection>

        <FaqContent
          title="Analog clock with second hand FAQ"
          items={ANALOG_SECOND_HAND_FAQ}
        />
      </SeoBand>
    </PageShell>
  );
}

export function FullScreenAnalogClockPage({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  return (
    <PageShell>
      <JsonLd
        name="Full Screen Analog Clock"
        routePath="/analog-clock"
        description="A browser-based full screen analog clock with a large clock face, visible second hand, ticking or smooth movement, copy, and fullscreen support."
        faqItems={FULL_SCREEN_ANALOG_FAQ}
      />

      <ToolHero
        display={<FullScreenAnalogClockTool initialNowISO={initialNowISO} />}
        title="Full Screen Analog Clock"
        description="Use a large analog clock face for classroom, room, second-screen, or teaching display with a visible second hand and ad-free fullscreen mode."
      />

      <SeoBand>
        <ContentSection title="How this full screen analog clock works">
          <p>
            This page opens with a large analog clock face as the main display.
            The second hand is visible by default, and the fullscreen control is
            kept close to the clock so you can turn it into a room display after
            a click or keyboard action.
          </p>
          <p>
            Ticking mode moves the second hand once per second. Smooth mode uses
            browser animation frames for a sweeping motion. The time comes from
            your browser and device clock, so it is not a certified time source.
          </p>
        </ContentSection>

        <ContentSection title="When to use a fullscreen analog clock">
          <p>
            A full screen analog clock can be useful as a classroom display,
            wall-clock substitute, meeting room clock, second-screen clock, or
            visual clock face for teaching analog time.
          </p>
          <p>
            For a general analog display, use the{" "}
            <a className="ilt-content-link" href="/analog-clock">
              analog clock
            </a>
            . For a second-hand-first face, open the{" "}
            <a className="ilt-content-link" href="/analog-clock">
              analog clock with second hand
            </a>
            . For smooth motion as the main focus, try the{" "}
            <a className="ilt-content-link" href="/analog-clock">
              smooth second hand clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related clocks">
          <p>
            Use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              full screen clock
            </a>{" "}
            for a digital room clock, or the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>{" "}
            when digits are a better fit than a clock face.
          </p>
        </ContentSection>

        <FaqContent
          title="Full screen analog clock FAQ"
          items={FULL_SCREEN_ANALOG_FAQ}
        />
      </SeoBand>
    </PageShell>
  );
}

export function BigDigitalClockPage({
  initialNowISO,
}: {
  initialNowISO: string;
}) {
  return (
    <PageShell>
      <JsonLd
        name="Big Digital Clock"
        routePath="/digital-clock"
        description="A browser-based big digital clock optimized for large, room-readable current time display with seconds, 12/24-hour mode, date, copy, and fullscreen support."
        faqItems={BIG_DIGITAL_CLOCK_FAQ}
      />

      <ToolHero
        display={<BigDigitalClockTool initialNowISO={initialNowISO} />}
        title="Big Digital Clock"
        description="Use a large room-readable digital clock for classrooms, meetings, second screens, desk monitors, gym displays, or livestream timing reference."
      />

      <SeoBand>
        <ContentSection title="How this big digital clock works">
          <p>
            This page prioritizes one large current-time display with seconds
            visible by default. The controls stay simple: show or hide seconds,
            switch between 12-hour and 24-hour time, show the date, copy the
            current time, or enter fullscreen.
          </p>
          <p>
            The display uses your browser and device clock. Browser scheduling,
            device settings, and screen refresh rate can affect what you see, so
            this is a practical clock display rather than an official time
            source.
          </p>
        </ContentSection>

        <ContentSection title="When a large clock display helps">
          <p>
            A big digital clock is useful in classrooms, meeting rooms, gyms,
            desk-monitor setups, livestream reference screens, and second-screen
            displays where the current time needs to be readable at a distance.
          </p>
          <p>
            For a more general digital clock, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            . For fullscreen-first display, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              full screen clock
            </a>
            . For a quieter face, try the{" "}
            <a className="ilt-content-link" href="/minimalist-clock">
              minimalist clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related digital clocks">
          <p>
            Open the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              clock with seconds
            </a>{" "}
            when seconds are the main detail, or the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>{" "}
            when you want smaller fractions visible.
          </p>
        </ContentSection>

        <FaqContent
          title="Big digital clock FAQ"
          items={BIG_DIGITAL_CLOCK_FAQ}
        />
      </SeoBand>
    </PageShell>
  );
}
