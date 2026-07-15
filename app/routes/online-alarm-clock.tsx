import type { Route } from "./+types/online-alarm-clock";
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
  ControlGroup,
  DisplayStage,
  Field,
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
const ROUTE_PATH = "/online-alarm-clock";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const FAQ_ITEMS = [
  {
    question: "What happens if the alarm time already passed today?",
    answer:
      "The alarm is scheduled for the next occurrence, which means tomorrow at that same clock time.",
  },
  {
    question: "Does the browser need to stay open?",
    answer:
      "Yes. Keep this page open, keep the device awake, and make sure volume or mute settings allow the alarm sound.",
  },
  {
    question: "How is this different from an alarm timer?",
    answer:
      "This page schedules an alarm for a time of day. The alarm timer counts down for a chosen duration.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "Online Alarm Clock (Set an Alarm Time Online)";
  const description =
    "Set an online alarm clock for a time of day with current time, next occurrence, optional sound, test sound, stop, reset, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "online alarm clock",
        "alarm clock online",
        "set alarm online",
        "web alarm clock",
        "alarm for time of day",
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

function formatTime(date: Date, showSeconds = true) {
  try {
    return cleanText(
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: showSeconds ? "2-digit" : undefined,
        hour12: true,
      }).format(date),
    );
  } catch {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hourText = String(hours % 12 || 12).padStart(2, "0");
    return showSeconds
      ? `${hourText}:${minutes}:${seconds} ${ampm}`
      : `${hourText}:${minutes} ${ampm}`;
  }
}

function formatDateTime(date: Date) {
  try {
    return cleanText(
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date),
    );
  } catch {
    return date.toLocaleString();
  }
}

function formatTimeInput(date: Date) {
  const next = new Date(date.getTime() + 5 * 60 * 1000);
  return `${String(next.getHours()).padStart(2, "0")}:${String(next.getMinutes()).padStart(2, "0")}`;
}

function nextAlarmOccurrence(now: Date, alarmTime: string) {
  const [hoursRaw, minutesRaw] = alarmTime.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const target = new Date(now);
  target.setHours(
    Number.isFinite(hours) ? hours : now.getHours(),
    Number.isFinite(minutes) ? minutes : now.getMinutes(),
    0,
    0,
  );
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function isTomorrow(now: Date, target: Date) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);
  return targetDay.getTime() > today.getTime();
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

function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((frequency = 880, duration = 160, gain = 0.1) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.value = gain;
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      window.setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
      }, duration);
    } catch {
      // Browser audio can be blocked until user interaction.
    }
  }, []);
}

function OnlineAlarmClockTool({ initialNowISO }: { initialNowISO: string }) {
  const initialNow = useMemo(() => new Date(initialNowISO), [initialNowISO]);
  const [now, setNow] = useState(initialNow);
  const [alarmTime, setAlarmTime] = useState(() => formatTimeInput(initialNow));
  const [targetMs, setTargetMs] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [sound, setSound] = useState(true);
  const [tested, setTested] = useState(false);
  const timeZone = useMemo(() => safeTimeZone(), []);
  const beep = useBeep();
  const alarmIntervalRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(interval);
  }, []);

  const plannedTarget = useMemo(
    () => nextAlarmOccurrence(now, alarmTime),
    [now, alarmTime],
  );
  const activeTarget = useMemo(
    () => (targetMs ? new Date(targetMs) : plannedTarget),
    [plannedTarget, targetMs],
  );
  const targetLabel = isTomorrow(now, activeTarget) ? "Tomorrow" : "Today";
  const remainingMs = Math.max(0, activeTarget.getTime() - now.getTime());
  const displayText = ringing
    ? "Alarm"
    : enabled
      ? formatDuration(remainingMs)
      : formatTime(now, true);
  const statusLabel = ringing
    ? "Alarm ringing"
    : enabled
      ? "Alarm set"
      : "Current time";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [displayText, isFs, statusLabel],
    minPx: 38,
    maxPx: isFs ? 520 : 500,
    paddingAllowancePx: isFs ? 84 : 92,
    initialScale: isFs ? 1 : 1.34,
    initialMobileScale: isFs ? 1 : 1.16,
  });

  const stopRinging = useCallback(
    (silent = false) => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      setRinging(false);
      if (!silent && sound) beep(520, 90, 0.08);
    },
    [beep, sound],
  );

  useEffect(() => {
    if (!enabled || targetMs === null || ringing) return;
    if (now.getTime() < targetMs) return;
    setEnabled(false);
    setRinging(true);
  }, [enabled, now, ringing, targetMs]);

  useEffect(() => {
    if (!ringing) return;
    if (!sound) return;
    if (alarmIntervalRef.current) window.clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = window.setInterval(() => {
      beep(880, 170, 0.12);
      window.setTimeout(() => beep(660, 180, 0.12), 190);
    }, 800);
    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [beep, ringing, sound]);

  useEffect(() => () => stopRinging(true), [stopRinging]);

  function enableAlarm() {
    const target = nextAlarmOccurrence(now, alarmTime);
    setTargetMs(target.getTime());
    setEnabled(true);
    setRinging(false);
    stopRinging(true);
    if (sound) beep(660, 90, 0.08);
  }

  function cancelAlarm() {
    setEnabled(false);
    setTargetMs(null);
    stopRinging(false);
  }

  function resetAlarm() {
    setEnabled(false);
    setTargetMs(null);
    stopRinging(true);
    setAlarmTime(formatTimeInput(new Date()));
  }

  function testSound() {
    if (!sound) return;
    beep(880, 140, 0.11);
    window.setTimeout(() => beep(660, 150, 0.1), 170);
    setTested(true);
    window.setTimeout(() => setTested(false), 1200);
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      if (enabled || ringing) cancelAlarm();
      else enableAlarm();
    } else if (key === "r") {
      resetAlarm();
    } else if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "s") {
      setSound((value) => !value);
    } else if (key === "t") {
      testSound();
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
        title="Online Alarm Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={enabled || ringing ? cancelAlarm : enableAlarm}>
              {ringing ? "Stop" : enabled ? "Cancel" : "Set"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={resetAlarm}>
              Reset
            </Btn>
          </div>
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
            if (isFs && (enabled || ringing)) cancelAlarm();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to stop or cancel the alarm" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest">
            {statusLabel}
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
            {displayText}
          </span>
          <div className="timer-clock-context mt-4 text-sm font-semibold sm:text-base">
            Alarm time: {formatTime(activeTarget, false)} / {targetLabel}
          </div>
          <div className="timer-clock-context mt-2 text-sm font-semibold sm:text-base">
            Next occurrence: {formatDateTime(activeTarget)} / {timeZone}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={enabled || ringing ? cancelAlarm : enableAlarm}>
                {ringing ? "Stop alarm" : enabled ? "Cancel alarm" : "Set alarm"}
              </Btn>
              <Btn kind="ghost" onClick={resetAlarm}>
                Reset
              </Btn>
            </ControlGroup>

            <SettingGroup
              title="Alarm settings"
              description="Choose a clock time. If that time has already passed today, the next occurrence is tomorrow."
            >
              <SettingRow className="sm:grid-cols-3">
                <Field
                  label="Alarm time"
                  type="time"
                  value={alarmTime}
                  disabled={enabled || ringing}
                  onChange={(event) => setAlarmTime(event.currentTarget.value)}
                />
                <Toggle
                  label="Sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
                <div className="ilt-helper-text flex items-end">
                  Browser audio may require interaction before it can play.
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={testSound} disabled={!sound}>
                {tested ? "Sound tested" : "Test sound"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space set/cancel / R reset / S sound / T test sound / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ControlGroup className="mx-0 justify-start">
              <Btn kind="solid" onClick={enabled || ringing ? cancelAlarm : enableAlarm}>
                {ringing ? "Stop alarm" : enabled ? "Cancel alarm" : "Set alarm"}
              </Btn>
              <Btn kind="ghost" onClick={resetAlarm}>
                Reset
              </Btn>
            </ControlGroup>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Space set or cancel / S sound / No ads appear in fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function OnlineAlarmClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Online Alarm Clock",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based alarm clock for setting an alarm at a time of day, with next occurrence labels, sound toggle, test sound, stop, reset, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Online Alarm Clock", item: ROUTE_URL },
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
        display={<OnlineAlarmClockTool initialNowISO={nowISO} />}
        title="Online Alarm Clock"
        description="Set a browser alarm for a time of day, see the next occurrence clearly, test the sound, and keep the alarm clock fullscreen when useful."
      />

      <SeoBand>
        <ContentSection title="How this online alarm clock works">
          <p>
            Choose a clock time, then set the alarm. If the selected time has
            already passed today, the alarm is scheduled for tomorrow at that
            same local time so the next occurrence is always in the future.
          </p>
          <p>
            The alarm runs in your browser and uses your device clock. Keep the
            page open, keep the device awake, and check volume, mute, and audio
            permission settings before relying on the sound.
          </p>
        </ContentSection>

        <ContentSection title="Alarm clock vs alarm timer">
          <p>
            An online alarm clock is for a time of day, such as 3:30 PM. The{" "}
            <a className="ilt-content-link" href="/alarm-timer">
              alarm timer
            </a>{" "}
            is for a countdown duration, such as 15 minutes from now.
          </p>
          <p>
            For quick duration-based reminders, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/online-timer">
              online timer
            </a>
            . For a simple clock display, use the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Common uses and limitations">
          <p>
            Use this web alarm clock for reminders, study breaks, cooking
            checks, meeting start reminders, and desk alarms. Browser alarms can
            be affected by sleeping devices, closed tabs, audio permissions,
            volume settings, and muted speakers.
          </p>
          <p>
            For break reminders, try the{" "}
            <a className="ilt-content-link" href="/break-timer">
              break timer
            </a>
            . This page does not use notifications or claim guaranteed alarm
            delivery.
          </p>
        </ContentSection>

        <ContentSection title="Online alarm clock FAQ">
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
