// app/routes/drink-water-reminder-timer.tsx
import type { Route } from "./+types/drink-water-reminder-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  ControlGroup,
  DisplayStage,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/drink-water-reminder-timer/HowItWorks";
import Disclaimer from "~/clients/components/drink-water-reminder-timer/Disclaimer";
import FAQ from "~/clients/components/drink-water-reminder-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/drink-water-reminder-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/drink-water-reminder-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Drink Water Reminder (Hydration Timer + Repeating Alerts)";
  const description =
    "Free drink water reminder and hydration timer. Set repeating intervals with optional sound alerts and use a clean fullscreen display for a visible reminder cycle.";

  const url = "https://www.ilovetimers.com/drink-water-reminder-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "drink water reminder",
        "drink water timer",
        "water reminder timer",
        "hydration reminder",
        "hydration timer",
        "water reminder online",
        "drink water reminder online",
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
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClock(ms: number) {
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


/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 740, duration = 120, gain = 0.08) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = gain;

      o.connect(g);
      g.connect(ctx.destination);

      o.start();
      window.setTimeout(() => {
        o.stop();
        o.disconnect();
        g.disconnect();
      }, duration);
    } catch {
      // ignore
    }
  }, []);
}


/* =========================================================
   WATER REMINDER TIMER CARD
========================================================= */
function WaterReminderTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [15, 20, 30, 45, 60, 90, 120], []);

  const [intervalMin, setIntervalMin] = useState(60);
  const [sound, setSound] = useState(true);

  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(intervalMin * 60 * 1000);

  const remainingRef = useRef<number>(intervalMin * 60 * 1000);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const intervalMsRef = useRef<number>(intervalMin * 60 * 1000);
  useEffect(() => {
    intervalMsRef.current = intervalMin * 60 * 1000;
  }, [intervalMin]);

  const [remindersFired, setRemindersFired] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function resetAll() {
    setRunning(false);
    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;
    endRef.current = null;
    hasStartedRef.current = false;
    setRemindersFired(0);
    stopRaf();
  }

  function resetCycleOnly() {
    setRunning(false);
    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;
    endRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
  }

  useEffect(() => {
    // Changing interval resets the cycle and counters
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMin]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startNew() {
    stopRaf();
    hasStartedRef.current = true;

    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;

    endRef.current = performance.now() + next;
    setRunning(true);
  }

  function resume() {
    stopRaf();
    const rem = Math.max(0, remainingRef.current);
    endRef.current = performance.now() + rem;
    setRunning(true);
  }

  function pause() {
    const now = performance.now();
    const rem = Math.max(0, (endRef.current ?? now) - now);

    setRunning(false);
    setRemaining(rem);
    remainingRef.current = rem;

    endRef.current = null;
    stopRaf();
  }

  function startPause() {
    if (running) {
      pause();
      return;
    }

    if (!hasStartedRef.current) {
      startNew();
      return;
    }

    if (remainingRef.current <= 0) {
      startNew();
      return;
    }

    resume();
  }

  function fireNow() {
    // Fire immediately and start a fresh cycle from now
    setRemindersFired((n) => n + 1);

    if (sound) {
      beep(784, 110, 0.08);
      window.setTimeout(() => beep(659, 110, 0.08), 160);
    }

    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;

    endRef.current = performance.now() + next;
    hasStartedRef.current = true;

    if (!running) setRunning(true);
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + Math.max(0, remainingRef.current);
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      setRemaining(rem);
      remainingRef.current = rem;

      if (rem <= 0) {
        setRemindersFired((n) => n + 1);

        if (sound) {
          beep(784, 110, 0.08);
          window.setTimeout(() => beep(659, 110, 0.08), 160);
        }

        const next = intervalMsRef.current;
        setRemaining(next);
        remainingRef.current = next;

        endRef.current = performance.now() + next;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, beep]);

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const readyTime = msToClock(intervalMin * 60 * 1000);

  const statusLabel = !running
    ? hasStartedRef.current
      ? "Paused"
      : "Ready"
    : "Next reminder in";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, readyTime, statusLabel, isFs, running, intervalMin],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "n") {
      if (running) fireNow();
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "escape" && isFs) {
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
        title="Water Reminder"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-2 sm:flex">
            <Toggle
              label="Sound"
              checked={sound}
              onCheckedChange={setSound}
              className="py-1 text-sm"
            />
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset all
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-session-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          className={[
            "timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {running || hasStartedRef.current ? shownTime : readyTime}
          </span>

        </DisplayStage>

        {/* Settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={resetCycleOnly}>
                Reset cycle
              </Btn>
            </ControlGroup>

            <PresetGroup title="Reminder interval">
              {presetsMin.map((m) => (
                <Chip key={m} active={m === intervalMin} onClick={() => setIntervalMin(m)} disabled={running}>
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Settings"
              description="This reminder cycle runs while the page is open. Background tabs may update less often."
            >
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_auto]">
                <Field
                  label="Interval minutes"
                  type="number"
                  min={5}
                  max={360}
                  value={intervalMin}
                  disabled={running}
                  onChange={(e) =>
                    setIntervalMin(clamp(Number(e.target.value || 5), 5, 360))
                  }
                />
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle checked={sound} onCheckedChange={setSound} label="Sound" />
                </div>
              </SettingRow>
            </SettingGroup>

            <UtilityResultRow>
              <span className="ilt-content-label">Progress</span>
              <span className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Reminders {remindersFired} / {statusLabel}
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={fireNow} disabled={!running}>
                Remind now
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset all
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N remind now / R reset all / F fullscreen / S sound
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === intervalMin}
                  onClick={() => setIntervalMin(m)}
                  disabled={running}
                >
                  {m}m
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={resetAll}>
                  Reset
                </Btn>
                <Btn kind="ghost" onClick={fireNow} disabled={!running}>
                  Remind now
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause · N remind now · R reset · S sound
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
export default function WaterReminderTimerPage(_: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/drink-water-reminder-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Water Reminder Timer",
        url,
        description:
          "Drink water reminder timer with repeating intervals, optional sound, and fullscreen display.",
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
            name: "Water Reminder Timer",
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
        display={<WaterReminderTimerCard />}
        title="Drink Water Reminder Timer"
        description="Track drink-water reminder intervals with the next reminder countdown first and settings kept compact below it."
      />

      <SeoBand>
        <HowItWorks />
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}
