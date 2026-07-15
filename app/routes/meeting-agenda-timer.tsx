// app/routes/meeting-agenda-timer.tsx
import type { Route } from "./+types/meeting-agenda-timer";
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
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

type AgendaItem = {
  id: string;
  title: string;
  minutes: number;
};

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/meeting-agenda-timer";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const STORAGE_KEY = "ilt-meeting-agenda-timer-items";
const DEFAULT_AGENDA: AgendaItem[] = [
  { id: "opening", title: "Opening and goals", minutes: 5 },
  { id: "discussion", title: "Main discussion", minutes: 15 },
  { id: "decisions", title: "Decisions and next steps", minutes: 5 },
];

export function meta({}: Route.MetaArgs) {
  const title = "Meeting Agenda Timer (Timed Agenda Items)";
  const description =
    "Run a meeting by agenda item with active item timing, total remaining time, next and previous controls, editable items, fullscreen, and copy summary.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "meeting agenda timer",
        "agenda timer",
        "meeting timer with agenda",
        "timed agenda",
        "meeting timeboxing",
        "run of show timer",
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function minutesToMs(minutes: number) {
  return Math.round(clamp(minutes, 0.01, 240) * 60 * 1000);
}

function formatTime(ms: number) {
  const sign = ms < 0 ? "+" : "";
  const totalSeconds = Math.ceil(Math.abs(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${sign}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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

function readStoredAgenda() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AgendaItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const cleaned = parsed
      .map((item, index) => ({
        id: typeof item.id === "string" && item.id ? item.id : `stored-${index}`,
        title:
          typeof item.title === "string" && item.title.trim()
            ? item.title.trim()
            : `Agenda item ${index + 1}`,
        minutes: clamp(Number(item.minutes) || 5, 0.01, 240),
      }))
      .slice(0, 20);
    return cleaned.length ? cleaned : null;
  } catch {
    return null;
  }
}

function makeItem(title = "New agenda item", minutes = 5): AgendaItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    minutes,
  };
}

function MeetingAgendaTimerTool() {
  const [agenda, setAgenda] = useState<AgendaItem[]>(DEFAULT_AGENDA);
  const [storageReady, setStorageReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(() =>
    minutesToMs(DEFAULT_AGENDA[0].minutes),
  );
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const endRef = useRef<number | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    const storedAgenda = readStoredAgenda();
    if (storedAgenda) {
      setAgenda(storedAgenda);
      setRemainingMs(minutesToMs(storedAgenda[0].minutes));
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(agenda));
    } catch {
      // localStorage may be unavailable in private or restricted browser modes.
    }
  }, [agenda, storageReady]);

  useEffect(() => {
    if (activeIndex <= agenda.length - 1) return;
    setActiveIndex(Math.max(0, agenda.length - 1));
  }, [activeIndex, agenda.length]);

  const activeItem = agenda[activeIndex] ?? agenda[0];
  const activeDurationMs = activeItem ? minutesToMs(activeItem.minutes) : 0;
  const totalRemainingMs = useMemo(() => {
    return agenda.slice(activeIndex).reduce((total, item, index) => {
      if (index === 0) return total + Math.max(0, remainingMs);
      return total + minutesToMs(item.minutes);
    }, 0);
  }, [activeIndex, agenda, remainingMs]);
  const totalAgendaMs = useMemo(
    () => agenda.reduce((total, item) => total + minutesToMs(item.minutes), 0),
    [agenda],
  );

  useEffect(() => {
    if (running || !activeItem) return;
    setRemainingMs((current) => {
      if (current <= 0 || current > activeDurationMs) return activeDurationMs;
      return current;
    });
  }, [activeDurationMs, activeItem, running]);

  useEffect(() => {
    if (!running) return;

    endRef.current = Date.now() + remainingMs;
    let frame = 0;

    const tick = () => {
      if (endRef.current == null) return;
      setRemainingMs(endRef.current - Date.now());
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running]);

  const shownTime = formatTime(remainingMs);
  const status = running
    ? remainingMs < 0
      ? "Overrun"
      : "Running"
    : remainingMs < 0
      ? "Overrun paused"
      : remainingMs < activeDurationMs
        ? "Paused"
        : "Ready";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, activeItem?.title ?? ""],
    minPx: 54,
    maxPx: isFs ? 540 : 500,
    paddingAllowancePx: isFs ? 64 : 72,
    initialScale: isFs ? 1 : 1.03,
    initialMobileScale: isFs ? 1 : 0.91,
  });

  const startPause = useCallback(() => {
    if (!activeItem) return;
    if (running) {
      setRunning(false);
      endRef.current = null;
      return;
    }
    setRunning(true);
  }, [activeItem, running]);

  const goToItem = useCallback(
    (index: number) => {
      const nextIndex = clamp(index, 0, agenda.length - 1);
      setRunning(false);
      endRef.current = null;
      setActiveIndex(nextIndex);
      setRemainingMs(minutesToMs(agenda[nextIndex].minutes));
    },
    [agenda],
  );

  function reset() {
    setRunning(false);
    endRef.current = null;
    setActiveIndex(0);
    setRemainingMs(minutesToMs(agenda[0].minutes));
  }

  function addItem() {
    setAgenda((items) => [...items, makeItem()]);
  }

  function updateItem(id: string, updates: Partial<AgendaItem>) {
    setAgenda((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              minutes:
                updates.minutes == null
                  ? item.minutes
                  : clamp(Number(updates.minutes) || 0.01, 0.01, 240),
            }
          : item,
      ),
    );
  }

  function deleteItem(id: string) {
    setAgenda((items) => {
      if (items.length <= 1) return items;
      const next = items.filter((item) => item.id !== id);
      const nextIndex = Math.min(activeIndex, next.length - 1);
      setRunning(false);
      endRef.current = null;
      setActiveIndex(nextIndex);
      setRemainingMs(minutesToMs(next[nextIndex].minutes));
      return next;
    });
  }

  function moveItem(id: string, direction: -1 | 1) {
    setAgenda((items) => {
      const currentIndex = items.findIndex((item) => item.id === id);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return items;

      const activeId = items[activeIndex]?.id;
      const next = [...items];
      const [item] = next.splice(currentIndex, 1);
      next.splice(nextIndex, 0, item);
      if (activeId) {
        const newActiveIndex = next.findIndex((entry) => entry.id === activeId);
        if (newActiveIndex >= 0) setActiveIndex(newActiveIndex);
      }
      return next;
    });
  }

  function restoreDefaultAgenda() {
    setRunning(false);
    endRef.current = null;
    setAgenda(DEFAULT_AGENDA);
    setActiveIndex(0);
    setRemainingMs(minutesToMs(DEFAULT_AGENDA[0].minutes));
  }

  async function copySummary() {
    const lines = [
      "Meeting agenda",
      ...agenda.map((item, index) => `${index + 1}. ${item.title} - ${item.minutes} min`),
      `Total planned time: ${formatTime(totalAgendaMs)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      startPause();
    } else if (key === "r") {
      reset();
    } else if (key === "n" || event.key === "ArrowRight") {
      goToItem(activeIndex + 1);
    } else if (key === "p" || event.key === "ArrowLeft") {
      goToItem(activeIndex - 1);
    } else if (key === "f") {
      void fullscreen.toggle();
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
        title="Meeting Agenda Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" size="sm" onClick={() => goToItem(activeIndex - 1)} disabled={activeIndex === 0}>
              Previous
            </Btn>
            <Btn kind="solid" size="sm" onClick={startPause}>
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={reset}>
              Reset
            </Btn>
            <Btn kind="ghost" size="sm" onClick={() => goToItem(activeIndex + 1)} disabled={activeIndex >= agenda.length - 1}>
              Next
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-list-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : 360,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            Item {activeIndex + 1} of {agenda.length} / {status}
          </div>
          <div className="mt-3 max-w-4xl text-center text-xl font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-3xl">
            {activeItem?.title || "Agenda item"}
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="mt-3 inline-block whitespace-nowrap text-center font-mono font-extrabold tracking-widest"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            Total remaining: {formatTime(totalRemainingMs)} / Planned agenda:{" "}
            {formatTime(totalAgendaMs)}
          </div>
          {remainingMs < 0 ? (
            <div className="mt-2 text-sm font-bold uppercase tracking-widest text-[var(--ilt-text-primary)]">
              Current item is over its planned time
            </div>
          ) : null}
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => goToItem(activeIndex - 1)}
                disabled={activeIndex === 0}
              >
                Previous item
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => goToItem(activeIndex + 1)}
                disabled={activeIndex >= agenda.length - 1}
              >
                Next item
              </Btn>
            </ControlGroup>

            <SettingGroup
              title="Agenda items"
              description="Edit the agenda in order. Durations can use decimals for short test items or quick agenda buffers."
            >
              <div className="grid gap-3">
                {agenda.map((item, index) => (
                  <div
                    key={item.id}
                    className="timer-list-row grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,2fr)_minmax(8rem,0.7fr)_auto]"
                  >
                    <Field
                      label={`Item ${index + 1} title`}
                      value={item.title}
                      onChange={(event) =>
                        updateItem(item.id, { title: event.currentTarget.value })
                      }
                    />
                    <Field
                      label={`Item ${index + 1} minutes`}
                      type="number"
                      min={0.01}
                      max={240}
                      step={0.5}
                      value={item.minutes}
                      onChange={(event) =>
                        updateItem(item.id, {
                          minutes: Number(event.currentTarget.value || 0.01),
                        })
                      }
                    />
                    <div className="flex flex-wrap items-end gap-2">
                      <Btn
                        kind="ghost"
                        size="sm"
                        onClick={() => goToItem(index)}
                        disabled={index === activeIndex}
                        aria-label={`Set item ${index + 1} active`}
                      >
                        Use
                      </Btn>
                      <Btn
                        kind="ghost"
                        size="sm"
                        onClick={() => moveItem(item.id, -1)}
                        disabled={index === 0}
                        aria-label={`Move item ${index + 1} up`}
                      >
                        Up
                      </Btn>
                      <Btn
                        kind="ghost"
                        size="sm"
                        onClick={() => moveItem(item.id, 1)}
                        disabled={index === agenda.length - 1}
                        aria-label={`Move item ${index + 1} down`}
                      >
                        Down
                      </Btn>
                      <Btn
                        variant="danger"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        disabled={agenda.length <= 1}
                        aria-label={`Delete item ${index + 1}`}
                      >
                        Delete
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={addItem}>
                Add agenda item
              </Btn>
              <Btn kind="ghost" onClick={restoreDefaultAgenda}>
                Restore default agenda
              </Btn>
              <Btn kind="ghost" onClick={() => void copySummary()}>
                {copied ? "Copied" : "Copy agenda summary"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / N or right next / P or
              left previous / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap display to start or pause / Space start-pause / N next / P previous
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function MeetingAgendaTimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Meeting Agenda Timer",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based meeting agenda timer with editable agenda items, item timing, total remaining time, and fullscreen display.",
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
            name: "Meeting Agenda Timer",
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
        display={<MeetingAgendaTimerTool />}
        title="Meeting Agenda Timer"
        description="Run a meeting by agenda item with editable durations, active item timing, total remaining time, next and previous controls, and fullscreen mode."
      />

      <SeoBand>
        <ContentSection title="How this meeting agenda timer works">
          <p>
            A meeting agenda timer breaks one meeting into timed items. Add each
            agenda topic, give it a duration, start the timer, and move through
            the list with next and previous controls.
          </p>
          <p>
            The main display shows the active item, the time left for that
            item, and the total planned time remaining in the agenda. If an item
            runs past zero, the display switches into an overrun state instead
            of quietly hiding the extra time.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            Use it for standups, interviews, workshops, class discussions,
            office hours, client meetings, planning calls, retrospectives, and
            event run-of-show timing where each segment has its own planned
            duration.
          </p>
          <p>
            Agenda items are saved in your browser so a recurring meeting can
            reopen with the same starter list. The saved agenda is local to
            this device and browser.
          </p>
        </ContentSection>

        <ContentSection title="Meeting timer, count-up timer, or agenda timer">
          <p>
            Use the{" "}
            <a className="ilt-content-link" href="/meeting-timer">
              meeting timer
            </a>{" "}
            for one simple countdown. Use the{" "}
            <a className="ilt-content-link" href="/meeting-count-up-timer">
              meeting count-up timer
            </a>{" "}
            when you want to show elapsed discussion time instead of remaining
            time.
          </p>
          <p>
            Use this agenda timer when the useful unit is the agenda item:
            topic one, topic two, break, recap, next steps. For speaker-focused
            timing, try the{" "}
            <a className="ilt-content-link" href="/presentation-timer">
              presentation timer
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/speech-timer">
              speech timer
            </a>
            .
          </p>
          <p>
            If the meeting time itself still needs to work across locations,
            use the{" "}
            <a className="ilt-content-link" href="/time-zone-meeting-planner">
              time zone meeting planner
            </a>{" "}
            before running the agenda.
          </p>
        </ContentSection>

        <ContentSection title="Practical limitations">
          <p>
            This browser timer can help keep agenda timing visible, but it does
            not make a meeting productive by itself and is not a compliance or
            official scheduling system. Device sleep, background tab throttling,
            and browser performance can affect visible timing, so keep the page
            open and visible for room use.
          </p>
        </ContentSection>

        <ContentSection title="Meeting agenda timer FAQ">
          <h3>Can I edit agenda items?</h3>
          <p>
            Yes. Edit item titles and minutes directly in the agenda list. You
            can add, delete, move, or set an item active from the same editor.
          </p>
          <h3>Does the agenda persist?</h3>
          <p>
            The agenda is saved in localStorage in your browser when storage is
            available. It is not synced across devices or accounts.
          </p>
          <h3>What happens when an item runs over?</h3>
          <p>
            The active item keeps counting past zero and shows an overrun state
            so the room can see how far past the planned item time it is.
          </p>
          <h3>Can I use this for time blocking?</h3>
          <p>
            For a day plan or schedule blocks outside a meeting, the{" "}
            <a className="ilt-content-link" href="/time-blocking-clock">
              time blocking clock
            </a>{" "}
            is a better fit.
          </p>
          <h3>Can I count down to a meeting date?</h3>
          <p>
            Use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>{" "}
            for a specific date and time.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
