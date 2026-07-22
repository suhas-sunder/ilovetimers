import Stage4RouteContent from "~/clients/components/content/Stage4RouteContent";
// app/routes/meeting-count-up-timer.tsx
import type { Route } from "./+types/meeting-count-up-timer";
import { data as json } from "react-router";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent
} from "react";
import {
  Button as Btn,
  ContentSection,
  ControlGroup,
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
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Meeting Count-Up Timer (Elapsed Time, Fullscreen)";
  const description =
    "Track how long your meeting has been running with a simple count-up timer. Clear elapsed time display for meetings, standups, and presentations.";

  const url = "https://www.ilovetimers.com/meeting-count-up-timer";

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

function msToClockUp(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

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

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

/* =========================================================
   MEETING COUNTUP CARD
========================================================= */
type Split = { n: number; base: string; ms: number; splitMs: number };

function MeetingCountupCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const elapsedRef = useRef<number>(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const [topicLabel, setTopicLabel] = useState("Topic");
  // 0 means infinite (no numbering)
  const [topicsPlanned, setTopicsPlanned] = useState(0);

  const [splits, setSplits] = useState<Split[]>([]);
  const lastSplitElapsedRef = useRef<number>(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const isCapped = topicsPlanned > 0;
  const canTopic = running && (!isCapped || splits.length < topicsPlanned);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      startRef.current = null;
      return;
    }

    startRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = now - (startRef.current ?? now);
      const next = baseRef.current + delta;
      setElapsed(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      baseRef.current = elapsedRef.current;
      return next;
    });
  }

  function resetAll() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setSplits([]);
    lastSplitElapsedRef.current = 0;
    stopRaf();
    startRef.current = null;
  }

  function markTopic(labelOverride?: string) {
    if (!canTopic) return;

    const nowElapsed = elapsedRef.current;
    const split = nowElapsed - lastSplitElapsedRef.current;
    lastSplitElapsedRef.current = nowElapsed;

    const baseNameRaw = (labelOverride ?? topicLabel ?? "Topic").trim();
    const baseName = baseNameRaw.length ? baseNameRaw : "Topic";

    setSplits((prev) => {
      const nextN = prev.length + 1;
      return [
        {
          n: nextN,
          base: baseName,
          ms: nowElapsed,
          splitMs: split,
        },
        ...prev,
      ];
    });
  }

  const shownTime = msToClockUp(Math.ceil(elapsed / 1000) * 1000);
  const statusLabel = running ? "Running" : elapsed > 0 ? "Paused" : "Ready";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, splits.length],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const formatSplitLabel = (s: Split) => {
    if (!isCapped) return s.base;
    return `${s.base} ${s.n}/${topicsPlanned}`;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "t") {
      markTopic();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const fsSplits = splits.slice(0, 6);
  const hasSplits = fsSplits.length > 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Meeting Count Up Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => markTopic()}
              className="py-1 text-sm"
              disabled={!canTopic}
            >
              Topic
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-history-stack flex h-full flex-col"}>
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "order-1 timer-display-surface relative mt-4 flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
            "border-[var(--ilt-border-subtle)] p-3 sm:p-6",
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
            if (isFs) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <span
            ref={timeTextRef}
            className={[
              "inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              willChange: "font-size",
            }}
          >
            {shownTime}
          </span>

          <div className="mt-4 ilt-content-label">
            {statusLabel}
          </div>

          {isFs && (
            <div
              className={[
                "pointer-events-none absolute left-3 right-3 top-3",
                "sm:left-6 sm:right-6 sm:top-5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
                    Topics
                  </div>

                  {!hasSplits ? (
                    <div className="ilt-helper-text font-semibold">
                      Press Topic (T) to record agenda splits
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsSplits.map((s) => (
                        <div
                          key={s.n}
                          className="flex items-center justify-between gap-3 ilt-surface-card px-2 py-1 backdrop-blur"
                        >
                          <div className="min-w-0 text-xs font-semibold text-[var(--ilt-text-primary)]">
                            {formatSplitLabel(s)}
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <div className="text-xs font-extrabold text-[var(--ilt-text-primary)]">
                              {msToClockUp(s.ms)}
                            </div>
                            <div className="text-[11px] font-semibold text-[var(--ilt-text-secondary)]">
                              +{msToClockUp(s.splitMs)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)] backdrop-blur">
                  T = Topic
                </div>
              </div>
            </div>
          )}
        </div>

        {!isFs && (
          <>
            <ControlGroup className="order-2">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => markTopic()}
                disabled={!canTopic}
              >
                Topic
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </ControlGroup>

            <SettingGroup
              title="Agenda helper"
              description="Optional topic label and cap for agenda splits."
              className="order-3"
            >
              <SettingRow className="lg:grid-cols-2">
                <Field
                  label="Button label"
                  type="text"
                  value={topicLabel}
                  onChange={(e) => setTopicLabel(e.target.value)}
                  placeholder="Topic"
                />

                <Field
                  label="# of agenda topics"
                  type="number"
                  min={0}
                  max={50}
                  value={topicsPlanned === 0 ? "" : String(topicsPlanned)}
                  placeholder="∞"
                  onChange={(e) => {
                      const raw = e.target.value;

                      // Empty means infinite (0).
                      if (raw === "") {
                        setTopicsPlanned(0);
                        return;
                      }

                      const n = Number(raw);
                      if (!Number.isFinite(n)) return;

                      // User intent:
                      // - If they set a cap, enforce it as a hard cap, and never allow it below existing splits.
                      // - 0 means infinite.
                      const clamped = clamp(Math.trunc(n), 0, 50);
                      if (clamped <= 0) {
                        setTopicsPlanned(0);
                        return;
                      }

                      const hardCapped = Math.max(clamped, splits.length);
                      setTopicsPlanned(hardCapped);
                  }}
                />
              </SettingRow>

              <p className="ilt-helper-text">
                Press <strong>Topic</strong> (or <strong>T</strong>) while
                running to record time spent on each agenda item.
              </p>
            </SettingGroup>

            <SecondaryActionRow className="timer-history-actions order-4">
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-history-shortcut order-5">
              Shortcuts: Space start/pause / T topic / R reset / F fullscreen
            </ShortcutHint>

            <div className="timer-history-panel order-6 space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                  Topic splits
                </div>
                <div className="ilt-helper-text font-semibold">
                  Most recent first
                </div>
              </div>

              {splits.length === 0 ? (
                <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                  Start the timer, then press <strong>Topic</strong> to record
                  splits.
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {splits.slice(0, 12).map((s) => (
                    <UtilityResultRow key={s.n}>
                      <div className="min-w-0 text-sm font-semibold text-[var(--ilt-text-primary)]">
                        {formatSplitLabel(s)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                          Total {msToClockUp(s.ms)}
                        </div>
                        <div className="ilt-helper-text font-semibold">
                          Split {msToClockUp(s.splitMs)}
                        </div>
                      </div>
                    </UtilityResultRow>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="ilt-helper-text text-center sm:text-sm">
            Tap time to start/pause / Space start/pause / T topic / R reset / F fullscreen
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MeetingCountupTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/meeting-count-up-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Meeting Count Up Timer",
        url,
        description:
          "Meeting count up timer for meeting running time and elapsed time with topic splits and fullscreen.",
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
            name: "Meeting Count Up Timer",
            item: url,
          },
        ],
      },
    ],
  };

  void nowISO;

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<MeetingCountupCard />}
        title="Meeting Count Up Timer (Elapsed Time)"
        description="Track meeting running time with topic splits, reset, and a big fullscreen display."
      />

      <SeoBand>
        <Stage4RouteContent routePath="/meeting-count-up-timer" />
        <ContentSection>
          <p>
            If the meeting needs planned topic durations instead of elapsed
            discussion time, use the{" "}
            <a className="ilt-content-link" href="/meeting-agenda-timer">
              meeting agenda timer
            </a>{" "}
            for item-by-item countdowns and agenda overrun visibility.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
