// app/routes/productivity-timer.tsx
import type { Route } from "./+types/productivity-timer";
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
  ControlGroup,
  ContentSection,
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Productivity Timer | Flexible Work and Break Sessions";
  const description =
    "Run configurable work, short-break, and long-break sessions with flexible presets, optional auto-advance, sound, cycle tracking, and fullscreen mode.";

  const url = "https://www.ilovetimers.com/productivity-timer";

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


// WebAudio beep (same style as other pages)
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
   PRODUCTIVITY TIMER CARD
========================================================= */
type Phase = "work" | "break" | "longBreak";

function ProductivityTimerCard() {
  const beep = useBeep();

  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [longBreakEvery, setLongBreakEvery] = useState(4);

  const [loop, setLoop] = useState(true);
  const [sound, setSound] = useState(true);

  const [phase, setPhase] = useState<Phase>("work");
  const [cycleCount, setCycleCount] = useState(0);
  const [running, setRunning] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const totalMs = useMemo(() => {
    if (phase === "work") return workMin * 60 * 1000;
    if (phase === "longBreak") return longBreakMin * 60 * 1000;
    return breakMin * 60 * 1000;
  }, [phase, workMin, breakMin, longBreakMin]);

  const [remaining, setRemaining] = useState(totalMs);

  // Refs to avoid stale closures
  const rafRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);

  const phaseRef = useRef<Phase>(phase);
  const runningRef = useRef<boolean>(running);
  const remainingRef = useRef<number>(remaining);
  const cycleCountRef = useRef<number>(cycleCount);

  const workMinRef = useRef<number>(workMin);
  const breakMinRef = useRef<number>(breakMin);
  const longBreakMinRef = useRef<number>(longBreakMin);
  const longBreakEveryRef = useRef<number>(longBreakEvery);

  const loopRef = useRef<boolean>(loop);
  const soundRef = useRef<boolean>(sound);

  // Only update UI when the displayed second changes
  const lastShownSecRef = useRef<number>(-1);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);
  useEffect(() => {
    cycleCountRef.current = cycleCount;
  }, [cycleCount]);

  useEffect(() => {
    workMinRef.current = workMin;
  }, [workMin]);
  useEffect(() => {
    breakMinRef.current = breakMin;
  }, [breakMin]);
  useEffect(() => {
    longBreakMinRef.current = longBreakMin;
  }, [longBreakMin]);
  useEffect(() => {
    longBreakEveryRef.current = longBreakEvery;
  }, [longBreakEvery]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const getDurationMsFor = useCallback((p: Phase) => {
    if (p === "work") return workMinRef.current * 60 * 1000;
    if (p === "longBreak") return longBreakMinRef.current * 60 * 1000;
    return breakMinRef.current * 60 * 1000;
  }, []);

  const applyState = useCallback(
    (next: { phase: Phase; remainingMs: number; cycleCount?: number }) => {
      phaseRef.current = next.phase;
      remainingRef.current = next.remainingMs;

      setPhase(next.phase);
      setRemaining(next.remainingMs);

      lastShownSecRef.current = Math.ceil(next.remainingMs / 1000);

      if (typeof next.cycleCount === "number") {
        cycleCountRef.current = next.cycleCount;
        setCycleCount(next.cycleCount);
      }
    },
    [],
  );

  const completePhase = useCallback(() => {
    const p = phaseRef.current;
    const loops = loopRef.current;

    endAtRef.current = null;
    runningRef.current = false;
    setRunning(false);

    if (soundRef.current) beep(660, 220);

    if (p === "work") {
      const nextCount = cycleCountRef.current + 1;
      const every = longBreakEveryRef.current;

      const shouldLong = every > 0 && nextCount % every === 0;
      const nextPhase: Phase = shouldLong ? "longBreak" : "break";
      const nextRemaining = getDurationMsFor(nextPhase);

      applyState({
        phase: nextPhase,
        remainingMs: nextRemaining,
        cycleCount: nextCount,
      });

      if (loops) {
        runningRef.current = true;
        setRunning(true);
      }
      return;
    }

    const nextPhase: Phase = "work";
    const nextRemaining = getDurationMsFor(nextPhase);
    applyState({ phase: nextPhase, remainingMs: nextRemaining });

    if (loops) {
      runningRef.current = true;
      setRunning(true);
    }
  }, [applyState, beep, getDurationMsFor]);

  // Keep remaining aligned when phase or durations change (only when not running)
  useEffect(() => {
    if (running) return;
    const next = totalMs;
    remainingRef.current = next;
    setRemaining(next);
    endAtRef.current = null;
    lastShownSecRef.current = Math.ceil(next / 1000);
  }, [totalMs, running]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endAtRef.current = null;
      return;
    }

    const now = performance.now();
    endAtRef.current = now + remainingRef.current;
    lastShownSecRef.current = Math.ceil(remainingRef.current / 1000);

    const tick = () => {
      const tNow = performance.now();
      const endAt = endAtRef.current ?? tNow;
      const rem = Math.max(0, endAt - tNow);

      if (rem <= 0) {
        remainingRef.current = 0;
        lastShownSecRef.current = 0;
        setRemaining(0);
        stopRaf();
        completePhase();
        return;
      }

      const shownSec = Math.ceil(rem / 1000);
      if (shownSec !== lastShownSecRef.current) {
        lastShownSecRef.current = shownSec;
        const snappedMs = shownSec * 1000;
        remainingRef.current = snappedMs;
        setRemaining(snappedMs);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopRaf();
    };
  }, [running, completePhase]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => !r);
  }

  function reset() {
    stopRaf();
    endAtRef.current = null;

    runningRef.current = false;
    setRunning(false);

    cycleCountRef.current = 0;
    setCycleCount(0);

    phaseRef.current = "work";
    setPhase("work");

    const next = workMinRef.current * 60 * 1000;
    remainingRef.current = next;
    lastShownSecRef.current = Math.ceil(next / 1000);
    setRemaining(next);
  }

  function skip() {
    stopRaf();
    endAtRef.current = null;

    runningRef.current = false;
    setRunning(false);

    const p = phaseRef.current;

    if (p === "work") {
      const nextCount = cycleCountRef.current + 1;
      const every = longBreakEveryRef.current;
      const shouldLong = every > 0 && nextCount % every === 0;
      const nextPhase: Phase = shouldLong ? "longBreak" : "break";
      const nextRemaining = getDurationMsFor(nextPhase);

      applyState({
        phase: nextPhase,
        remainingMs: nextRemaining,
        cycleCount: nextCount,
      });
      return;
    }

    const nextPhase: Phase = "work";
    const nextRemaining = getDurationMsFor(nextPhase);
    applyState({ phase: nextPhase, remainingMs: nextRemaining });
  }

  const label =
    phase === "work" ? "Focus" : phase === "longBreak" ? "Long break" : "Break";

  const statusLabel = running
    ? "Running"
    : remaining < totalMs
      ? "Paused"
      : "Ready";

  const shownTime = msToClock(remaining);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "n") {
      skip();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const settingsDisabled = running;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Productivity Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={skip} className="py-1 text-sm">
              Next
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-session-stack flex h-full flex-col"}>
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
            {label} /{" "}
            {running ? "Running" : remaining < totalMs ? "Paused" : "Ready"}
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
            {shownTime}
          </span>

        </DisplayStage>

        {!isFs && (
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={skip}>
                Next
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Productivity modes"
              description="Switch between common focus and break patterns."
            >
              <Chip
                onClick={() => {
                  setWorkMin(25);
                  setBreakMin(5);
                  setLongBreakMin(15);
                  setLongBreakEvery(4);
                  reset();
                }}
                disabled={settingsDisabled}
                title={settingsDisabled ? "Pause to change presets" : undefined}
              >
                Classic 25/5
              </Chip>

              <Chip
                onClick={() => {
                  setWorkMin(50);
                  setBreakMin(10);
                  setLongBreakMin(20);
                  setLongBreakEvery(3);
                  reset();
                }}
                disabled={settingsDisabled}
                title={settingsDisabled ? "Pause to change presets" : undefined}
              >
                Deep work 50/10
              </Chip>

              <Chip
                onClick={() => {
                  setWorkMin(90);
                  setBreakMin(15);
                  setLongBreakMin(30);
                  setLongBreakEvery(2);
                  reset();
                }}
                disabled={settingsDisabled}
                title={settingsDisabled ? "Pause to change presets" : undefined}
              >
                Sprint 90/15
              </Chip>
            </PresetGroup>

            <SettingGroup
              title="Session settings"
              description="Set focus blocks, short breaks, and long-break cadence."
            >
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Focus (min)"
                  type="number"
                  min={1}
                  max={240}
                  value={workMin}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setWorkMin(clamp(Number(e.target.value || 1), 1, 240))
                  }
                />


                <Field
                  label="Break (min)"
                  type="number"
                  min={1}
                  max={120}
                  value={breakMin}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setBreakMin(clamp(Number(e.target.value || 1), 1, 120))
                  }
                />


                <Field
                  label="Long break (min)"
                  type="number"
                  min={1}
                  max={180}
                  value={longBreakMin}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setLongBreakMin(clamp(Number(e.target.value || 1), 1, 180))
                  }
                />


                <Field
                  label="Long break every"
                  hint="0 = never use long breaks"
                  type="number"
                  min={0}
                  max={12}
                  value={longBreakEvery}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setLongBreakEvery(clamp(Number(e.target.value || 0), 0, 12))
                  }
                />
              </SettingRow>

              <SettingRow className="justify-items-center lg:grid-cols-[auto]">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Toggle checked={sound} onCheckedChange={setSound} label="Sound" />
                  <Toggle checked={loop} onCheckedChange={setLoop} label="Auto-advance" />
                </div>
              </SettingRow>
            </SettingGroup>

            <UtilityResultRow>
              <span className="ilt-content-label">Phase</span>
              <span className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                {label} / Completed focus sessions: {cycleCount}
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N next / R reset / F fullscreen
            </ShortcutHint>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / N next / R reset / F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {label} /{" "}
              {running ? "Running" : remaining < totalMs ? "Paused" : "Ready"} /
              Completed focus sessions:{" "}
              <span className="font-extrabold">{cycleCount}</span>
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
export default function ProductivityTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/productivity-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Productivity Timer",
        url,
        description:
          "Productivity timer and focus timer online with customizable work/break cycles and fullscreen display.",
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
            name: "Productivity Timer",
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
        display={<ProductivityTimerCard />}
        title="Productivity Timer"
        description="Run structured productivity sessions with a large active phase timer and compact controls below it."
      />

      <SeoBand>
        <ContentSection title="How this productivity timer works">
          <p>
            Productivity Timer runs a visible work or break session based on the
            mode and preset you choose. The active phase, remaining time,
            session count, and controls stay in the utility area, while settings
            such as auto-advance, sound, fullscreen, and keyboard shortcuts
            remain close enough to adjust without turning the page into a setup
            form.
          </p>
          <p>
            Use it when you want configurable work, short-break, and long-break
            phases with presets such as 25/5, 50/10, or 90/15. It can structure
            task batching, admin work, writing blocks, code review, planning,
            or inbox cleanup without promising a productivity outcome.
          </p>
        </ContentSection>
        <ContentSection title="Productivity timer, Pomodoro, and time blocking">
          <p>
            A{" "}
            <a className="ilt-content-link" href="/pomodoro-timer">
              Pomodoro timer
            </a>{" "}
            is the clearer choice when you want a defined number of repeated
            work and break cycles. A{" "}
            <a className="ilt-content-link" href="/focus-session-timer">
              focus session timer
            </a>{" "}
            is simpler when you only need one focused countdown. This page sits
            alongside them: it provides flexible preset patterns, short and
            long-break cadence, optional auto-advance, and completed-focus
            session tracking without requiring a full daily schedule. Its
            workflow overlaps Pomodoro, but is not limited to the standard
            25-minute and 5-minute pattern.
          </p>
          <p>
            If you are planning a whole day by named blocks, the{" "}
            <a className="ilt-content-link" href="/time-blocking-clock">
              time-blocking clock
            </a>{" "}
            is a better fit. Use this page for the active block you are timing
            right now.
          </p>
        </ContentSection>
        <ContentSection title="Settings and examples">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Use work presets for a task batch such as 20 minutes of email,
              45 minutes of writing, or 60 minutes of focused project work.
            </li>
            <li>
              Use break presets when you want a bounded pause between sessions
              without opening a separate page.
            </li>
            <li>
              Turn on auto-advance only when you want the next phase to begin
              automatically; leave it off when you prefer to decide manually.
            </li>
            <li>
              Keep sound off in shared spaces, or turn it on when an audible
              transition cue fits your workspace.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Limitations and related tools">
          <p>
            This is a browser timer for structuring time; it does not guarantee
            productivity or decide what you should work on. Background tabs,
            sleeping devices, muted audio, and browser power-saving behavior can
            affect cues and animation smoothness.
          </p>
          <p>
            For a dedicated pause, use the{" "}
            <a className="ilt-content-link" href="/break-timer">
              break timer
            </a>
            . For keeping a group agenda visible, use the{" "}
            <a className="ilt-content-link" href="/meeting-timer">
              meeting timer
            </a>
            .
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
