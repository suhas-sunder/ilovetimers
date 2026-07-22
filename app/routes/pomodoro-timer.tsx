import Stage4RouteContent from "~/clients/components/content/Stage4RouteContent";
// app/routes/pomodoro-timer.tsx
import type { Route } from "./+types/pomodoro-timer";
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
  ControlGroup,
  DisplayStage,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SeoBand,
  SecondaryActionRow,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import { SharePresetPanel } from "~/clients/components/share/SharePresetPanel";
import {
  pomodoroShareSchema,
  type PomodoroShareConfig,
} from "~/clients/lib/shareConfigurations";
/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Pomodoro Timer Online | Custom Work and Break Cycles";
  const description =
    "Run repeated work and break cycles with a customizable Pomodoro timer, clear phase controls, cycle tracking, optional sound, and fullscreen mode.";

  const url = "https://www.ilovetimers.com/pomodoro-timer";

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

// WebAudio beep
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 160) => {
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
      g.gain.value = 0.1;

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
   POMODORO
========================================================= */
type Phase = "work" | "shortBreak" | "longBreak" | "done";

function PomodoroCard() {
  const beep = useBeep();

  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [cycles, setCycles] = useState(4);

  const [useLongBreak, setUseLongBreak] = useState(true);
  const [longBreakMin, setLongBreakMin] = useState(15);

  const [autoAdvance, setAutoAdvance] = useState(true);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [phase, setPhase] = useState<Phase>("work");
  const [cycleIdx, setCycleIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(workMin * 60 * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const phaseRef = useRef<Phase>(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const runningRef = useRef<boolean>(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const workMs = useMemo(() => workMin * 60 * 1000, [workMin]);
  const shortBreakMs = useMemo(
    () => shortBreakMin * 60 * 1000,
    [shortBreakMin],
  );
  const longBreakMs = useMemo(() => longBreakMin * 60 * 1000, [longBreakMin]);

  function durFor(p: Phase) {
    if (p === "work") return workMs;
    if (p === "shortBreak") return shortBreakMs;
    if (p === "longBreak") return longBreakMs;
    return 0;
  }

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function applyDurationsReset() {
    setRunning(false);
    setPhase("work");
    setCycleIdx(0);
    setRemaining(durFor("work"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }

  function applyReusableSetup(config: PomodoroShareConfig) {
    setWorkMin(config.workMinutes);
    setShortBreakMin(config.breakMinutes);
    setCycles(config.cycles);
    setUseLongBreak(config.longBreakEnabled);
    setLongBreakMin(config.longBreakMinutes);
    setAutoAdvance(config.autoAdvance);
    setSound(config.sound);
    setFinalCountdownBeeps(config.finalCountdownBeeps);
    setRunning(false);
    setPhase("work");
    setCycleIdx(0);
    setRemaining(config.workMinutes * 60 * 1000);
    remainingRef.current = config.workMinutes * 60 * 1000;
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }

  const reusableConfig = useMemo<PomodoroShareConfig>(
    () => ({
      workMinutes: workMin,
      breakMinutes: shortBreakMin,
      cycles,
      longBreakEnabled: useLongBreak,
      longBreakMinutes: longBreakMin,
      autoAdvance,
      sound,
      finalCountdownBeeps,
    }),
    [autoAdvance, cycles, finalCountdownBeeps, longBreakMin, shortBreakMin, sound, useLongBreak, workMin],
  );

  useEffect(() => {
    applyDurationsReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMs, shortBreakMs, longBreakMs, cycles]);

  // If long break is disabled while currently in long break, end the routine cleanly.
  useEffect(() => {
    if (!useLongBreak && phaseRef.current === "longBreak") {
      setPhase("done");
      setRemaining(0);
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLongBreak]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 3_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 120);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        stopRaf();
        setRunning(false);
        lastBeepSecondRef.current = null;

        if (sound) {
          const freq = phaseRef.current === "work" ? 660 : 980;
          beep(freq, 180);
        }

        if (autoAdvance) {
          window.setTimeout(() => {
            advancePhase();
          }, 20);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, autoAdvance, beep]);

  function startPhase(next: Phase) {
    const d = durFor(next);
    setPhase(next);
    setRemaining(d);
    endRef.current = performance.now() + d;
    lastBeepSecondRef.current = null;
    setRunning(true);
  }

  function resetAll() {
    applyDurationsReset();
  }

  function startPause() {
    if (phaseRef.current === "done") {
      // Restart fresh
      setPhase("work");
      setCycleIdx(0);
      setRemaining(durFor("work"));
      endRef.current = performance.now() + durFor("work");
      lastBeepSecondRef.current = null;
      setRunning(true);
      return;
    }

    setRunning((r) => {
      const next = !r;
      if (next) {
        endRef.current = performance.now() + remainingRef.current;
      } else {
        endRef.current = null;
      }
      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function advancePhase() {
    const p = phaseRef.current;

    if (p === "work") {
      const isLastWorkSession = cycleIdx + 1 >= cycles;

      if (isLastWorkSession) {
        if (useLongBreak) {
          startPhase("longBreak");
        } else {
          setPhase("done");
          setRemaining(0);
          setRunning(false);
          endRef.current = null;
          lastBeepSecondRef.current = null;
          stopRaf();
        }
        return;
      }

      startPhase("shortBreak");
      return;
    }

    if (p === "shortBreak" || p === "longBreak") {
      setCycleIdx((i) => i + 1);
      startPhase("work");
      return;
    }

    resetAll();
  }

  function skipNext() {
    stopRaf();
    endRef.current = null;
    lastBeepSecondRef.current = null;
    setRunning(false);
    advancePhase();
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "n") {
      skipNext();
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const phaseLabel =
    phase === "work"
      ? `Work ${Math.min(cycleIdx + 1, cycles)}/${cycles}`
      : phase === "shortBreak"
        ? `Short break ${Math.min(cycleIdx + 1, cycles)}/${cycles}`
        : phase === "longBreak"
          ? `Long break ${cycles}/${cycles}`
          : "Complete";

  const statusLabel = running ? "Running" : remaining > 0 ? "Paused" : "Ready";

  const displayTone =
    phase === "work"
      ? "bg-white"
      : phase === "shortBreak"
        ? "bg-white"
        : phase === "longBreak"
          ? "bg-white"
          : "border-slate-200 bg-slate-50";

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase, cycleIdx, cycles],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const urgent =
    running && remaining > 0 && remaining <= 10_000 && phase === "work";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Pomodoro Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : phase === "done" ? "Restart" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={skipNext} className="py-1 text-sm">
              Next
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-session-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
            "p-3 sm:p-6",
            displayTone,
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
              urgent ? "text-[var(--ilt-text-primary)]" : "",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>

          <div className="mt-4 flex w-full max-w-3xl flex-wrap items-baseline justify-center gap-x-6 gap-y-2 text-center">
            <div className="ilt-content-label">
              {phase === "done" ? "Done" : phase === "work" ? "Work" : "Break"}
            </div>
            <div className="ilt-helper-text font-semibold">
              {phaseLabel}
            </div>
            <div className="ilt-content-label">
              {statusLabel}
            </div>
          </div>

        </DisplayStage>

        {/* Controls, settings, and shortcuts (normal only) */}
        {!isFs && (
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : phase === "done" ? "Restart" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={skipNext}>
                Next
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </ControlGroup>

            <SettingGroup
              title="Pomodoro settings"
              description="Set the work block, break length, cycle count, and optional cues."
            >
              <SettingRow className="lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="grid gap-3 sm:grid-cols-3">
                  <LabeledNumberStrong
                    label="Work (minutes)"
                    value={workMin}
                    set={setWorkMin}
                    min={1}
                    max={180}
                  />
                  <LabeledNumberStrong
                    label="Break (minutes)"
                    value={shortBreakMin}
                    set={setShortBreakMin}
                    min={1}
                    max={60}
                  />
                  <LabeledNumberStrong
                    label="Cycles"
                    value={cycles}
                    set={setCycles}
                    min={1}
                    max={12}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                  <Toggle
                    label="Auto"
                    checked={autoAdvance}
                    onCheckedChange={setAutoAdvance}
                  />
                  <Toggle
                    label="Final 3-2-1 beeps"
                    checked={finalCountdownBeeps}
                    onCheckedChange={setFinalCountdownBeeps}
                    disabled={!sound}
                  />
                </div>
              </SettingRow>

              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
                <Toggle
                  label="Long break after last cycle"
                  checked={useLongBreak}
                  onCheckedChange={setUseLongBreak}
                />
                <Field
                  label="Long break (minutes)"
                  hint="Typical: 10 to 20"
                  type="number"
                  min={1}
                  max={90}
                  value={longBreakMin}
                  onChange={(e) =>
                    setLongBreakMin(clamp(Number(e.target.value || 0), 1, 90))
                  }
                  disabled={!useLongBreak}
                />
              </SettingRow>
            </SettingGroup>

            <SharePresetPanel
              schema={pomodoroShareSchema}
              currentConfig={reusableConfig}
              onApply={applyReusableSetup}
              loadDisabled={running}
            />

            <SecondaryActionRow>
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
                className="py-2"
              >
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N next / R reset / F fullscreen
            </ShortcutHint>

            {!autoAdvance && remaining === 0 && phase !== "done" && (
              <div className="ilt-helper-text text-center font-semibold">
                Phase finished. Press <strong>Next</strong> to continue.
              </div>
            )}
          </div>
        )}

        {/* Fullscreen bottom info */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              Tap time to start/pause / Space start/pause / N next / R reset / F
              fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

function LabeledNumberStrong({
  label,
  value,
  set,
  min,
  max,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <Field
      label={label}
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => set(clamp(Number(e.target.value || 0), min, max))}
    />
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function PomodoroTimerPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/pomodoro-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Pomodoro Timer",
        url,
        description:
          "Free Pomodoro timer (25/5) with customizable work/break times, cycles, skip/next, sound alerts, fullscreen, and keyboard shortcuts.",
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
            name: "Pomodoro Timer",
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
        display={<PomodoroCard />}
        title="Pomodoro Timer"
        description="Run repeated work and break cycles, starting with the familiar 25-minute work and 5-minute break pattern or your own durations."
      />

      <SeoBand>
        <ContentSection title="Repeated work and break cycles">
          <p>
            The standard starting pattern is 25 minutes of work followed by a
            5-minute break. You can change work, break, long-break, and cycle
            settings while keeping the current phase and cycle count visible.
            The method structures time but does not guarantee productivity.
          </p>
          <p>
            Use the <a className="ilt-content-link" href="/focus-session-timer">Focus Session Timer</a>{" "}
            for one planned block, the <a className="ilt-content-link" href="/study-timer">Study Timer</a>{" "}
            for a fixed study countdown, the <a className="ilt-content-link" href="/study-stopwatch">Study Stopwatch</a>{" "}
            for open-ended tracking, or the <a className="ilt-content-link" href="/break-timer">Break Timer</a>{" "}
            for a standalone rest.
          </p>
        </ContentSection>
        <Stage4RouteContent routePath="/pomodoro-timer" />
        <ContentSection title="Related single-block timer">
          <p>
            If you want one half-hour countdown without Pomodoro cycles, use
            the{" "}
            <a className="ilt-content-link" href="/30-minute-timer">
              30 minute timer
            </a>
            . This Pomodoro timer stays focused on repeated work and break
            phases.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
