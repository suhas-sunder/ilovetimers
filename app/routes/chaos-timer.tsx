// app/routes/chaos-timer.tsx
import type { Route } from "./+types/chaos-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  ControlGroup,
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
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/chaos-timer/HowItWorks";
import Disclaimer from "~/clients/components/chaos-timer/Disclaimer";
import FAQ from "~/clients/components/chaos-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/chaos-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/chaos-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Random Interval Timer (Unpredictable Countdown, Fullscreen)";
  const description =
    "Free random interval timer that generates unpredictable countdowns for training, games, classrooms, and focus sessions. Optional beep each interval with a clean fullscreen display.";

  const url = "https://www.ilovetimers.com/chaos-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "random interval timer",
        "random timer",
        "random countdown timer",
        "random duration timer",
        "interval timer random",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.jpg",
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

function randInt(min: number, max: number) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}


/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 120, gain = 0.1) => {
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
   CHAOS TIMER CARD
========================================================= */
type Mode = "single" | "intervals";

function ChaosTimerTool() {
  const beep = useBeep();

  const [mode, setMode] = useState<Mode>("intervals");

  // Random range
  const [minSec, setMinSec] = useState(10);
  const [maxSec, setMaxSec] = useState(45);

  // Intervals
  const [intervalCount, setIntervalCount] = useState(10);

  // Options
  const [sound, setSound] = useState(true);
  const [beepEachInterval, setBeepEachInterval] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  // Timer state
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const remainingRef = useRef<number>(0);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  // Session state
  const [currentInterval, setCurrentInterval] = useState(1);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [nextDurationSec, setNextDurationSec] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Refs to avoid stale state inside rAF tick
  const modeRef = useRef<Mode>(mode);
  const intervalCountRef = useRef<number>(intervalCount);
  const currentIntervalRef = useRef<number>(currentInterval);
  const nextDurationRef = useRef<number>(nextDurationSec);
  const rangeRef = useRef<{ min: number; max: number }>({
    min: minSec,
    max: maxSec,
  });
  const soundRef = useRef<boolean>(sound);
  const beepEachIntervalRef = useRef<boolean>(beepEachInterval);
  const finalCountdownBeepsRef = useRef<boolean>(finalCountdownBeeps);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    intervalCountRef.current = intervalCount;
  }, [intervalCount]);

  useEffect(() => {
    currentIntervalRef.current = currentInterval;
  }, [currentInterval]);

  useEffect(() => {
    nextDurationRef.current = nextDurationSec;
  }, [nextDurationSec]);

  useEffect(() => {
    rangeRef.current = { min: minSec, max: maxSec };
  }, [minSec, maxSec]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    beepEachIntervalRef.current = beepEachInterval;
  }, [beepEachInterval]);

  useEffect(() => {
    finalCountdownBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function normalizeRange() {
    const min = clamp(rangeRef.current.min, 1, 3600);
    const max = clamp(rangeRef.current.max, 1, 3600);
    return min <= max ? { min, max } : { min: max, max: min };
  }

  function rollDuration() {
    const { min, max } = normalizeRange();
    return randInt(min, max);
  }

  function primeFromSettings() {
    stopRaf();
    setRunning(false);
    hasStartedRef.current = false;

    const d = rollDuration();
    const preview = rollDuration();

    currentIntervalRef.current = 1;
    nextDurationRef.current = preview;

    setCurrentInterval(1);
    setCurrentDurationSec(d);
    setRemaining(d * 1000);
    setNextDurationSec(preview);

    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function resetSession() {
    primeFromSettings();
  }

  // Re-prime when core settings change
  useEffect(() => {
    primeFromSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minSec, maxSec, mode, intervalCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startNew() {
    stopRaf();
    lastBeepSecondRef.current = null;
    hasStartedRef.current = true;

    // If we are at 0 (or finished), reroll fresh session first
    if (remainingRef.current <= 0) {
      const d = rollDuration();
      const preview = rollDuration();

      currentIntervalRef.current = 1;
      nextDurationRef.current = preview;

      setCurrentInterval(1);
      setCurrentDurationSec(d);
      setRemaining(d * 1000);
      setNextDurationSec(preview);
    }

    const remNow = Math.max(0, remainingRef.current);
    endRef.current = performance.now() + remNow;
    setRunning(true);
  }

  function resume() {
    stopRaf();
    lastBeepSecondRef.current = null;
    endRef.current = performance.now() + Math.max(0, remainingRef.current);
    setRunning(true);
  }

  function startPause() {
    // Prime audio context on gesture
    if (!running && soundRef.current) beep(0, 1, 0);

    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    // If never started, start fresh
    if (!hasStartedRef.current) {
      startNew();
      return;
    }

    // If completed in intervals mode, reset to a fresh session
    if (
      modeRef.current === "intervals" &&
      currentIntervalRef.current > intervalCountRef.current
    ) {
      resetSession();
      return;
    }

    // If remaining is 0, reset and start
    if (remainingRef.current <= 0) {
      resetSession();
      startNew();
      return;
    }

    resume();
  }

  // Timer loop
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (
        soundRef.current &&
        finalCountdownBeepsRef.current &&
        rem > 0 &&
        rem <= 5_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 90, 0.07);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (
          soundRef.current &&
          (beepEachIntervalRef.current || modeRef.current === "single")
        ) {
          beep(660, 160, 0.1);
        }

        if (modeRef.current === "single") {
          setRunning(false);
          hasStartedRef.current = false;
          stopRaf();
          return;
        }

        // intervals mode: advance or stop exactly at count
        const iNow = currentIntervalRef.current;
        const count = intervalCountRef.current;

        if (iNow >= count) {
          // Finished last interval
          setCurrentInterval(count + 1);
          setRunning(false);
          hasStartedRef.current = false;
          stopRaf();
          return;
        }

        const nextI = iNow + 1;
        const d =
          nextDurationRef.current > 0
            ? nextDurationRef.current
            : rollDuration();
        const preview = rollDuration();

        currentIntervalRef.current = nextI;
        nextDurationRef.current = preview;

        setCurrentInterval(nextI);
        setCurrentDurationSec(d);
        setRemaining(d * 1000);
        setNextDurationSec(preview);

        endRef.current = performance.now() + d * 1000;

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, beep]);

  const { min: normMin, max: normMax } = useMemo(() => {
    const min = clamp(minSec, 1, 3600);
    const max = clamp(maxSec, 1, 3600);
    return min <= max ? { min, max } : { min: max, max: min };
  }, [minSec, maxSec]);

  const rangeText = `${normMin}s–${normMax}s`;

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const urgent = running && remaining > 0 && remaining <= 10_000;

  const completedIntervals =
    mode === "intervals" && currentInterval > intervalCount;

  const statusLabel = !running
    ? completedIntervals
      ? "Done"
      : hasStartedRef.current
        ? "Paused"
        : "Ready"
    : mode === "intervals"
      ? "Intervals running"
      : "Random timer running";

  const displayTone = urgent
    ? "border-amber-200 bg-amber-50 text-slate-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      statusLabel,
      isFs,
      running,
      mode,
      currentInterval,
      intervalCount,
      urgent,
    ],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const progressText =
    mode === "intervals"
      ? `${Math.min(currentInterval, intervalCount)}/${intervalCount}`
      : "Single";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetSession();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
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
        title="Chaos Timer"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
                className="accent-amber-500"
              />
              Sound
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={beepEachInterval}
                onChange={(e) => setBeepEachInterval(e.target.checked)}
                disabled={!sound || mode !== "intervals"}
                className="accent-amber-500"
              />
              Beep each interval
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={finalCountdownBeeps}
                onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                disabled={!sound}
                className="accent-amber-500"
              />
              Final beeps
            </label>
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
            <Btn kind="ghost" onClick={resetSession} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interaction-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center",
            displayTone,
            "p-3 sm:p-6",
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
          aria-label={isFs ? "Chaos timer display. Tap or click to start or pause." : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <span
            ref={timeTextRef}
            className={[
              "timer-interaction-stage-value inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>

          <div className="timer-interaction-status text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <div className="timer-interaction-meta-grid grid gap-3 sm:grid-cols-2">
            <div className="timer-interaction-panel p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Session
              </div>
              <div className="mt-1 text-base font-extrabold text-slate-950">
                {mode === "intervals"
                  ? "Random interval timer"
                  : "Random timer"}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-700">
                Range {rangeText}
                {mode === "intervals" ? ` · Progress ${progressText}` : ""}
              </div>
            </div>

            <div className="timer-interaction-panel p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Interval details
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                This interval:{" "}
                <span className="font-mono font-extrabold text-slate-950">
                  {currentDurationSec}s
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Next preview:{" "}
                <span className="font-mono font-extrabold text-slate-950">
                  {nextDurationSec}s
                </span>
              </div>
              <div className="hidden">
                Tap time to start/pause in fullscreen
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="hidden">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="timer-control-stack mt-4">
            <ControlGroup className="timer-interaction-actions">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={resetSession}>
                Reset
              </Btn>
            </ControlGroup>

            <SecondaryActionRow className="timer-interaction-actions">
              <Btn
                kind="ghost"
                onClick={() => sound && beep(880, 140, 0.08)}
                disabled={!sound}
              >
                Test beep
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <PresetGroup title="Mode">
              <Chip
                active={mode === "single"}
                onClick={() => setMode("single")}
                disabled={running}
              >
                Random timer
              </Chip>
              <Chip
                active={mode === "intervals"}
                onClick={() => setMode("intervals")}
                disabled={running}
              >
                Random interval timer
              </Chip>
            </PresetGroup>

            <SettingGroup
              title="Random interval settings"
              description="Set the possible duration range and interval behavior."
            >
              <SettingRow>
                <Field
                  label="Min seconds"
                  type="number"
                  min={1}
                  max={3600}
                  value={minSec}
                  disabled={running}
                  onChange={(e) =>
                    setMinSec(clamp(Number(e.target.value || 1), 1, 3600))
                  }
                  hint="If min is greater than max, the tool swaps them automatically."
                />

                <Field
                  label="Max seconds"
                  type="number"
                  min={1}
                  max={3600}
                  value={maxSec}
                  disabled={running}
                  onChange={(e) =>
                    setMaxSec(clamp(Number(e.target.value || 45), 1, 3600))
                  }
                />

                <Field
                  label="Intervals"
                  type="number"
                  min={1}
                  max={500}
                  value={intervalCount}
                  disabled={running || mode !== "intervals"}
                  onChange={(e) =>
                    setIntervalCount(
                      clamp(Number(e.target.value || 10), 1, 500),
                    )
                  }
                  hint="Used only in random interval mode."
                />
              </SettingRow>

              <div className="flex flex-wrap gap-2">
                <Toggle
                  label="Sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
                <Toggle
                  label="Beep each interval"
                  checked={beepEachInterval}
                  onCheckedChange={setBeepEachInterval}
                  disabled={!sound || mode !== "intervals"}
                />
                <Toggle
                  label="Final beeps"
                  checked={finalCountdownBeeps}
                  onCheckedChange={setFinalCountdownBeeps}
                  disabled={!sound}
                />
              </div>
            </SettingGroup>

            <ShortcutHint className="timer-interaction-shortcut">
              <span className="ilt-keycap">Space</span> start/pause ·{" "}
              <span className="ilt-keycap">R</span> reset ·{" "}
              <span className="ilt-keycap">F</span> fullscreen ·{" "}
              <span className="ilt-keycap">S</span> sound
            </ShortcutHint>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                active={mode === "single"}
                onClick={() => !running && setMode("single")}
                disabled={running}
              >
                Random timer
              </Chip>
              <Chip
                active={mode === "intervals"}
                onClick={() => !running && setMode("intervals")}
                disabled={running}
              >
                Random intervals
              </Chip>
              <div className="text-xs font-semibold text-slate-600">
                Range {rangeText}
                {mode === "intervals" ? ` · ${progressText}` : ""}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={resetSession}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause · Space · R · F · S
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
export default function ChaosTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/chaos-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Chaos Timer",
        url,
        description:
          "A random timer and random interval timer that generates random countdown durations for training and games, with fullscreen and optional sound.",
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
            name: "Chaos Timer",
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
        display={<ChaosTimerTool />}
        title="Chaos Timer (Random Interval Timer)"
        description="Set a random range, then run a single random countdown or a sequence of random intervals. Fullscreen keeps the active interval large and readable."
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
