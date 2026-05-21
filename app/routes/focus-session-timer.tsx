// app/routes/focus-session-timer.tsx
import type { Route } from "./+types/focus-session-timer";
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
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/focus-session-timer/HowItWorks";
import Disclaimer from "~/clients/components/focus-session-timer/Disclaimer";
import FAQ from "~/clients/components/focus-session-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/focus-session-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/focus-session-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Focus Session Timer (Single Deep Work Countdown, Fullscreen)";
  const description =
    "Free focus session timer for deep work. Choose one session length, start a distraction-free countdown, use fullscreen mode, and get a short break suggestion when you finish.";

  const url = "https://www.ilovetimers.com/focus-session-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "focus session timer",
        "deep work timer",
        "focus timer",
        "study focus timer",
        "work session timer",
        "single session timer",
        "fullscreen focus timer",
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
   FOCUS SESSION CARD
========================================================= */
function FocusSessionCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90],
    [],
  );

  const [minutes, setMinutes] = useState(45);

  // Accuracy fix: anchor to absolute end time.
  const [running, setRunning] = useState(false);
  const [endAtEpochMs, setEndAtEpochMs] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(() => 45 * 60 * 1000);

  const remainingRef = useRef<number>(45 * 60 * 1000);
  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const rafRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const [completed, setCompleted] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function setRemainingHard(ms: number) {
    const v = Math.max(0, Math.floor(ms));
    remainingRef.current = v;
    setRemainingMs(v);
  }

  // When minutes changes, reset session.
  useEffect(() => {
    const ms = minutes * 60 * 1000;
    setRunning(false);
    setEndAtEpochMs(null);
    setCompleted(false);
    lastBeepSecondRef.current = null;
    stopRaf();
    setRemainingHard(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  // Main tick loop (no dependency on remainingMs).
  useEffect(() => {
    if (!running || !endAtEpochMs) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = Date.now();
      const rem = Math.max(0, endAtEpochMs - now);

      remainingRef.current = rem;
      setRemainingMs(rem);

      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110, 0.05);
        }
      }

      if (rem <= 0) {
        setRunning(false);
        setEndAtEpochMs(null);
        lastBeepSecondRef.current = null;
        setCompleted(true);
        if (sound) beep(660, 220, 0.07);
        stopRaf();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, endAtEpochMs, sound, finalBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    setEndAtEpochMs(null);
    setCompleted(false);
    lastBeepSecondRef.current = null;
    stopRaf();
    setRemainingHard(minutes * 60 * 1000);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;

      if (next) {
        const now = Date.now();
        setEndAtEpochMs(now + remainingRef.current);
      } else {
        setEndAtEpochMs(null);
      }

      lastBeepSecondRef.current = null;
      setCompleted(false);
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const urgent = running && remainingMs > 0 && remainingMs <= 10_000;
  const shownTime = msToClock(Math.ceil(remainingMs / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, urgent, running, completed],
    minPx: 58,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 72 : 84,
  });

  const durationMs = minutes * 60 * 1000;
  const statusLabel = running
    ? "Running"
    : completed || remainingMs <= 0
      ? "Complete"
      : remainingMs < durationMs
        ? "Paused"
        : "Ready";
  const canEditDuration = !running;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Focus Session Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>

            <Toggle
              label="Sound"
              checked={sound}
              onCheckedChange={setSound}
              className="hidden py-1 text-sm sm:inline-flex"
            />
            <Toggle
              label="Final beeps"
              checked={finalBeeps}
              onCheckedChange={setFinalBeeps}
              disabled={!sound}
              className="hidden py-1 text-sm sm:inline-flex"
            />
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-session-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          className={[
            "timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            urgent ? "border-amber-200" : "border-slate-200",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 380,
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
              whiteSpace: "nowrap",
            }}
          >
            {shownTime}
          </span>

          {completed ? (
            <div className="mt-5 w-full max-w-[980px]">
              <div className="text-center">
                <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                  Break time
                </div>
                <div className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">
                  Session complete.
                </div>
                <div className="mt-2 text-base font-semibold text-slate-700 sm:text-lg">
                  Stand up, drink water, and take a 2 to 5 minute break.
                </div>
              </div>
            </div>
          ) : null}

          {/* Fullscreen hint chip */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Session
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {minutes} minutes{urgent ? " · final seconds" : ""}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Tap timer to start or pause
                </div>
              </div>
            </div>
          )}
        </DisplayStage>

        {/* Controls + settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Focus presets">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === minutes}
                  onClick={() => setPreset(m)}
                  disabled={!canEditDuration}
                >
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup title="Settings">
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_auto]">
                <Field
                  label="Session length (minutes)"
                  type="number"
                  min={1}
                  max={240}
                  value={minutes}
                  disabled={!canEditDuration}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 240))
                  }
                />
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                  <Toggle
                    label="Final beeps"
                    checked={finalBeeps}
                    onCheckedChange={setFinalBeeps}
                    disabled={!sound}
                  />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause · R reset · F fullscreen · S sound
            </ShortcutHint>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap timer to start/pause · Space start/pause · R reset · F
              fullscreen · S sound
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
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
export default function FocusSessionTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/focus-session-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Focus Session Timer",
        url,
        description:
          "Focus session timer for deep work. Set a single session length, use fullscreen, optional sound, and a clean countdown.",
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
            name: "Focus Session Timer",
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
        display={<FocusSessionCard />}
        title="Focus Session Timer"
        description="Choose a focus session length, start the countdown, and keep deep-work controls secondary to the active timer."
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
