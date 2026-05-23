import type { Route } from "./+types/boxing-timer";
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
  PresetChip as Chip,
  PresetGroup,
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

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/boxing-timer";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

type Phase = "idle" | "prep" | "round" | "rest" | "done";
type PresetId = "boxing-3x3" | "boxing-3x2" | "boxing-5x3" | "custom";
type Preset = {
  id: PresetId;
  label: string;
  rounds: number;
  roundSec: number;
  restSec: number;
  prepSec: number;
};

const PRESETS: Preset[] = [
  {
    id: "boxing-3x3",
    label: "3 min rounds / 1 min rest",
    rounds: 3,
    roundSec: 180,
    restSec: 60,
    prepSec: 10,
  },
  {
    id: "boxing-3x2",
    label: "2 min rounds / 1 min rest",
    rounds: 3,
    roundSec: 120,
    restSec: 60,
    prepSec: 10,
  },
  {
    id: "boxing-5x3",
    label: "5 x 3 min",
    rounds: 5,
    roundSec: 180,
    restSec: 60,
    prepSec: 10,
  },
];

const FAQ_ITEMS = [
  {
    question: "Is this an official boxing competition timer?",
    answer:
      "No. It is a practice and casual training timer. Follow the rules and timing requirements for any class, gym, event, or competition you are part of.",
  },
  {
    question: "Can I change the round length and rest length?",
    answer:
      "Yes. Choose a boxing-style preset or use custom rounds, round length, rest length, and prep time.",
  },
  {
    question: "How is this different from the round timer?",
    answer:
      "The boxing timer uses boxing-style presets and terminology. The round timer is a more general round/rest tool for many formats.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "Boxing Timer (Online Boxing Round Timer)";
  const description =
    "Run a boxing-style round timer with work rounds, rest periods, prep time, sound cues, presets, next phase, reset, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "boxing timer",
        "boxing round timer",
        "online boxing timer",
        "round timer boxing",
        "boxing interval timer",
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const pad2 = (value: number) => String(value).padStart(2, "0");

function formatClock(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${pad2(seconds)}`;
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

function useBell() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((frequency = 660, duration = 180, gain = 0.11) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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
      // Sound support varies by browser and user gesture state.
    }
  }, []);
}

function BoxingTimerTool() {
  const bell = useBell();
  const [presetId, setPresetId] = useState<PresetId>("boxing-3x3");
  const [rounds, setRounds] = useState(3);
  const [roundSec, setRoundSec] = useState(180);
  const [restSec, setRestSec] = useState(60);
  const [prepSec, setPrepSec] = useState(10);
  const [sound, setSound] = useState(true);
  const [warningBeeps, setWarningBeeps] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [paused, setPaused] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastWarningSecondRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const pausedRef = useRef(false);
  const remainingRef = useRef(0);
  const roundIndexRef = useRef(0);
  const roundsRef = useRef(rounds);
  const roundSecRef = useRef(roundSec);
  const restSecRef = useRef(restSec);
  const prepSecRef = useRef(prepSec);
  const soundRef = useRef(sound);
  const warningBeepsRef = useRef(warningBeeps);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    phaseRef.current = phase;
    pausedRef.current = paused;
    remainingRef.current = remainingMs;
    roundIndexRef.current = roundIndex;
    roundsRef.current = rounds;
    roundSecRef.current = roundSec;
    restSecRef.current = restSec;
    prepSecRef.current = prepSec;
    soundRef.current = sound;
    warningBeepsRef.current = warningBeeps;
  }, [
    phase,
    paused,
    remainingMs,
    roundIndex,
    rounds,
    roundSec,
    restSec,
    prepSec,
    sound,
    warningBeeps,
  ]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function ringStart() {
    if (!soundRef.current) return;
    bell(660, 170, 0.12);
  }

  function ringRest() {
    if (!soundRef.current) return;
    bell(360, 190, 0.11);
  }

  function ringDone() {
    if (!soundRef.current) return;
    bell(660, 160, 0.12);
    window.setTimeout(() => bell(880, 160, 0.1), 220);
  }

  function beginPhase(nextPhase: Phase, nextRound: number, durationSec: number) {
    setPhase(nextPhase);
    setPaused(false);
    setRoundIndex(nextRound);
    const durationMs = Math.max(0, durationSec * 1000);
    setRemainingMs(durationMs);
    endRef.current = durationMs > 0 ? performance.now() + durationMs : null;
    lastWarningSecondRef.current = null;
  }

  function advancePhase() {
    stopRaf();
    lastWarningSecondRef.current = null;
    const current = phaseRef.current;
    const currentRound = roundIndexRef.current;

    if (current === "prep") {
      beginPhase("round", 1, roundSecRef.current);
      ringStart();
      return;
    }

    if (current === "round") {
      if (currentRound >= roundsRef.current) {
        setPhase("done");
        setPaused(false);
        setRemainingMs(0);
        endRef.current = null;
        ringDone();
        return;
      }
      beginPhase("rest", currentRound, restSecRef.current);
      ringRest();
      return;
    }

    if (current === "rest") {
      beginPhase("round", Math.min(roundsRef.current, currentRound + 1), roundSecRef.current);
      ringStart();
    }
  }

  function startNewRun() {
    stopRaf();
    lastWarningSecondRef.current = null;
    if (prepSecRef.current > 0) {
      beginPhase("prep", 0, prepSecRef.current);
      return;
    }
    beginPhase("round", 1, roundSecRef.current);
    ringStart();
  }

  function pause() {
    if (phaseRef.current === "idle" || phaseRef.current === "done" || pausedRef.current) return;
    const now = performance.now();
    setRemainingMs(Math.max(0, (endRef.current ?? now) - now));
    setPaused(true);
    endRef.current = null;
    stopRaf();
    lastWarningSecondRef.current = null;
  }

  function resume() {
    if (phaseRef.current === "idle" || phaseRef.current === "done" || !pausedRef.current) return;
    setPaused(false);
    endRef.current = performance.now() + Math.max(0, remainingRef.current);
    lastWarningSecondRef.current = null;
  }

  function startPause() {
    if (phaseRef.current === "idle" || phaseRef.current === "done") {
      startNewRun();
      return;
    }
    if (pausedRef.current) resume();
    else pause();
  }

  function reset() {
    stopRaf();
    setPhase("idle");
    setPaused(false);
    setRoundIndex(0);
    setRemainingMs(0);
    endRef.current = null;
    lastWarningSecondRef.current = null;
  }

  function applyPreset(preset: Preset) {
    if (phaseRef.current !== "idle" && phaseRef.current !== "done") return;
    setPresetId(preset.id);
    setRounds(preset.rounds);
    setRoundSec(preset.roundSec);
    setRestSec(preset.restSec);
    setPrepSec(preset.prepSec);
    reset();
  }

  function markCustom() {
    setPresetId("custom");
  }

  const isRunning = phase !== "idle" && phase !== "done";
  const isActive = isRunning && !paused;
  const canEdit = !isRunning;

  useEffect(() => {
    if (!isActive) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const remaining = Math.max(0, (endRef.current ?? now) - now);
      setRemainingMs(remaining);

      if (
        soundRef.current &&
        warningBeepsRef.current &&
        remaining > 0 &&
        remaining <= 5_000
      ) {
        const second = Math.ceil(remaining / 1000);
        if (lastWarningSecondRef.current !== second) {
          lastWarningSecondRef.current = second;
          bell(880, 85, 0.06);
        }
      }

      if (remaining <= 0) {
        advancePhase();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [isActive, bell]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const shownTime =
    phase === "idle" ? formatClock(roundSec * 1000) : formatClock(remainingMs);
  const phaseLabel =
    phase === "idle"
      ? "Ready"
      : phase === "done"
        ? "Complete"
        : paused
          ? "Paused"
          : phase === "prep"
            ? "Prep"
            : phase === "round"
              ? `Round ${roundIndex} of ${rounds}`
              : "Rest";
  const phaseName =
    phase === "round"
      ? "Round"
      : phase === "rest"
        ? "Rest"
        : phase === "prep"
          ? "Prep"
          : phase === "done"
            ? "Complete"
            : "Ready";
  const currentDurationSec =
    phase === "prep"
      ? prepSec
      : phase === "round"
        ? roundSec
        : phase === "rest"
          ? restSec
          : roundSec;
  const progress =
    currentDurationSec > 0 && phase !== "idle" && phase !== "done"
      ? clamp(1 - remainingMs / (currentDurationSec * 1000), 0, 1)
      : 0;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, phaseLabel],
    minPx: 54,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 56 : 72,
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      startPause();
    } else if (key === "n") {
      advancePhase();
    } else if (key === "r") {
      reset();
    } else if (key === "s") {
      setSound((value) => !value);
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
        title="Boxing Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={startPause}>
              {phase === "idle" || phase === "done" ? "Start" : paused ? "Resume" : "Pause"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={advancePhase} disabled={!isRunning}>
              Next
            </Btn>
            <Btn kind="ghost" size="sm" onClick={reset}>
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface relative mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
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
          title={isFs ? "Tap or click to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {phaseLabel}
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
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              {phaseName}
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              {Math.max(0, roundIndex)} / {rounds} rounds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              {Math.round(roundSec / 60)}m round / {Math.round(restSec / 60)}m rest
            </span>
          </div>
          <div className="mt-4 h-2 w-full max-w-3xl bg-[var(--ilt-bg-panel)]">
            <div
              className="h-full bg-[var(--ilt-accent)]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {phase === "idle" || phase === "done" ? "Start" : paused ? "Resume" : "Pause"}
              </Btn>
              <Btn kind="ghost" onClick={advancePhase} disabled={!isRunning}>
                Next
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Boxing presets"
              description="Choose a boxing-style setup, then customize before starting if needed."
            >
              {PRESETS.map((preset) => (
                <Chip
                  key={preset.id}
                  active={presetId === preset.id}
                  disabled={!canEdit}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </Chip>
              ))}
              <Chip active={presetId === "custom"} disabled={!canEdit} onClick={markCustom}>
                Custom
              </Chip>
            </PresetGroup>

            <SettingGroup
              title="Round settings"
              description="Settings lock while a boxing timer session is active."
            >
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Rounds"
                  type="number"
                  min={1}
                  max={30}
                  value={rounds}
                  disabled={!canEdit}
                  onChange={(event) => {
                    markCustom();
                    setRounds(clamp(Number(event.currentTarget.value || 1), 1, 30));
                  }}
                />
                <Field
                  label="Round length (sec)"
                  type="number"
                  min={5}
                  max={3600}
                  value={roundSec}
                  disabled={!canEdit}
                  onChange={(event) => {
                    markCustom();
                    setRoundSec(clamp(Number(event.currentTarget.value || 5), 5, 3600));
                  }}
                />
                <Field
                  label="Rest (sec)"
                  type="number"
                  min={0}
                  max={1800}
                  value={restSec}
                  disabled={!canEdit}
                  onChange={(event) => {
                    markCustom();
                    setRestSec(clamp(Number(event.currentTarget.value || 0), 0, 1800));
                  }}
                />
                <Field
                  label="Prep (sec)"
                  type="number"
                  min={0}
                  max={300}
                  value={prepSec}
                  disabled={!canEdit}
                  onChange={(event) => {
                    markCustom();
                    setPrepSec(clamp(Number(event.currentTarget.value || 0), 0, 300));
                  }}
                />
              </SettingRow>
              <div className="flex flex-wrap gap-2">
                <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                <Toggle
                  label="Final beeps"
                  checked={warningBeeps}
                  onCheckedChange={setWarningBeeps}
                  disabled={!sound}
                />
              </div>
            </SettingGroup>

            <UtilityResultRow>
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Current setup
              </span>
              <span>
                {rounds} rounds / {roundSec}s round / {restSec}s rest / {prepSec}s prep
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => bell(660, 150, 0.1)} disabled={!sound}>
                Test sound
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N next / R reset / S sound / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap time to start or pause / Space start/pause / N next / R reset
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function BoxingTimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Boxing Timer",
        url: ROUTE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description:
          "A browser-based boxing round timer with boxing-style presets, round/rest timing, prep time, sound cues, next phase, reset, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Boxing Timer", item: ROUTE_URL },
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
        display={<BoxingTimerTool />}
        title="Boxing Timer"
        description="Run boxing-style rounds with rest periods, prep time, bell-like sound cues, presets, next phase, reset, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How this boxing timer works">
          <p>
            This boxing timer alternates timed rounds and timed rest periods.
            Choose a preset such as 3 minute rounds with 1 minute rest, add prep
            time if you want a short lead-in, then start the session.
          </p>
          <p>
            The main display keeps the current round, rest, or prep phase
            dominant. The Next control moves to the next phase, and optional
            bell-like cues can mark round starts, rest starts, final seconds,
            and completion.
          </p>
        </ContentSection>

        <ContentSection title="Practice uses">
          <p>
            Use this online boxing timer for boxing practice, bag rounds,
            martial arts drills, circuit rounds, coach-led timing, and home
            practice. It is built for clear practice timing and casual training
            setups, not for official competition compliance.
          </p>
          <p>
            For broader round/rest formats, use the{" "}
            <a className="ilt-content-link" href="/round-timer">
              round timer
            </a>
            . For circuit-style sessions, try the{" "}
            <a className="ilt-content-link" href="/workout-timer">
              workout timer
            </a>
            ,{" "}
            <a className="ilt-content-link" href="/hiit-timer">
              HIIT timer
            </a>
            ,{" "}
            <a className="ilt-content-link" href="/tabata-timer">
              Tabata timer
            </a>
            , or{" "}
            <a className="ilt-content-link" href="/interval-timer">
              interval timer
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Boxing presets, rest, and cues">
          <p>
            Boxing-style presets provide quick starting points, while the custom
            settings let you choose your own round length, rest length, number
            of rounds, and prep time. Sound cues can be turned off when a visual
            display is enough.
          </p>
          <p>
            The settings are intentionally locked while a session is active so
            the current phase flow stays predictable. Reset the timer to edit
            the setup before starting another run.
          </p>
        </ContentSection>

        <ContentSection title="Boxing timer FAQ">
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
