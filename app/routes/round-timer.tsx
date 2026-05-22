// app/routes/round-timer.tsx
import type { Route } from "./+types/round-timer";
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
  const title = "Round Timer (Boxing & MMA Rounds, Fullscreen)";
  const description =
    "Run boxing and MMA rounds with a clear round timer. Set rounds and rest periods and follow a big, easy-to-read countdown built for training.";

  const url = "https://www.ilovetimers.com/round-timer";

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

  return useCallback((freq = 880, duration = 140, gain = 0.12) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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
   ROUND TIMER CARD
========================================================= */
type Phase = "idle" | "warmup" | "work" | "rest" | "done";

type Preset = {
  label: string;
  rounds: number;
  workSec: number;
  restSec: number;
  warmupSec?: number;
};

function RoundTimerCard() {
  const beep = useBeep();

  const presets: Preset[] = useMemo(
    () => [
      {
        label: "Boxing 3×3 (1m rest)",
        rounds: 3,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Boxing 6×3 (1m rest)",
        rounds: 6,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Boxing 12×3 (1m rest)",
        rounds: 12,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "MMA 3×5 (1m rest)",
        rounds: 3,
        workSec: 300,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "MMA 5×5 (1m rest)",
        rounds: 5,
        workSec: 300,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Tabata-ish 8×(20/10)",
        rounds: 8,
        workSec: 20,
        restSec: 10,
        warmupSec: 10,
      },
      {
        label: "Sprints 10×(30/30)",
        rounds: 10,
        workSec: 30,
        restSec: 30,
        warmupSec: 10,
      },
    ],
    [],
  );

  const [rounds, setRounds] = useState(3);
  const [workSec, setWorkSec] = useState(180);
  const [restSec, setRestSec] = useState(60);
  const [warmupSec, setWarmupSec] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [paused, setPaused] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0); // 1..rounds for work phases
  const [remainingMs, setRemainingMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(0);
  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  const phaseRef = useRef<Phase>("idle");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const pausedRef = useRef<boolean>(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const roundsRef = useRef<number>(rounds);
  const workRef = useRef<number>(workSec);
  const restRef = useRef<number>(restSec);
  useEffect(() => {
    roundsRef.current = rounds;
    workRef.current = workSec;
    restRef.current = restSec;
  }, [rounds, workSec, restSec]);

  const isRunning = phase !== "idle" && phase !== "done";
  const isActive = isRunning && !paused;

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function hardReset() {
    stopRaf();
    setPhase("idle");
    setPaused(false);
    setRoundIndex(0);
    setRemainingMs(0);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function applyPreset(p: Preset) {
    if (isRunning) return;
    setRounds(p.rounds);
    setWorkSec(p.workSec);
    setRestSec(p.restSec);
    setWarmupSec(p.warmupSec ?? 0);
  }

  function startNewRun() {
    stopRaf();
    lastBeepSecondRef.current = null;

    if (warmupSec > 0) {
      setPhase("warmup");
      setPaused(false);
      setRoundIndex(0);
      setRemainingMs(warmupSec * 1000);
      endRef.current = performance.now() + warmupSec * 1000;
      return;
    }

    setPhase("work");
    setPaused(false);
    setRoundIndex(1);
    setRemainingMs(workSec * 1000);
    endRef.current = performance.now() + workSec * 1000;
    if (sound) beep(520, 160, 0.12);
  }

  function pauseNow() {
    if (!isRunning || pausedRef.current) return;
    const now = performance.now();
    const rem = Math.max(0, (endRef.current ?? now) - now);
    setRemainingMs(rem);
    endRef.current = null;
    setPaused(true);
    stopRaf();
    lastBeepSecondRef.current = null;
  }

  function resumeNow() {
    if (!isRunning || !pausedRef.current) return;
    const rem = Math.max(0, remainingRef.current);
    setPaused(false);
    endRef.current = performance.now() + rem;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    if (phaseRef.current === "idle" || phaseRef.current === "done") {
      startNewRun();
      return;
    }
    if (pausedRef.current) resumeNow();
    else pauseNow();
  }

  function skip() {
    // Move to the next logical phase, respecting bounds.
    if (!isRunning) return;

    stopRaf();
    lastBeepSecondRef.current = null;
    setPaused(false);

    if (phaseRef.current === "warmup") {
      setPhase("work");
      setRoundIndex(1);
      setRemainingMs(workRef.current * 1000);
      endRef.current = performance.now() + workRef.current * 1000;
      if (sound) beep(520, 160, 0.12);
      return;
    }

    if (phaseRef.current === "work") {
      if (roundIndex >= roundsRef.current) {
        setPhase("done");
        setRemainingMs(0);
        endRef.current = null;
        if (sound) {
          beep(660, 160, 0.12);
          window.setTimeout(() => beep(880, 160, 0.12), 220);
        }
        return;
      }

      setPhase("rest");
      setRemainingMs(restRef.current * 1000);
      endRef.current = performance.now() + restRef.current * 1000;
      if (sound) beep(330, 180, 0.12);
      return;
    }

    if (phaseRef.current === "rest") {
      setPhase("work");
      setRoundIndex((r) => Math.min(roundsRef.current, r + 1));
      setRemainingMs(workRef.current * 1000);
      endRef.current = performance.now() + workRef.current * 1000;
      if (sound) beep(520, 160, 0.12);
      return;
    }
  }

  useEffect(() => {
    if (!isRunning || paused) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemainingMs(rem);

      // Final beeps (last 5s)
      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 85, 0.06);
        }
      } else if (rem > 5_000) {
        lastBeepSecondRef.current = null;
      }

      if (rem <= 0) {
        lastBeepSecondRef.current = null;

        // Phase transitions
        if (phaseRef.current === "warmup") {
          setPhase("work");
          setRoundIndex(1);
          setRemainingMs(workRef.current * 1000);
          endRef.current = performance.now() + workRef.current * 1000;
          if (sound) beep(520, 160, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (phaseRef.current === "work") {
          if (roundIndex >= roundsRef.current) {
            setPhase("done");
            setRemainingMs(0);
            endRef.current = null;
            stopRaf();
            if (sound) {
              beep(660, 160, 0.12);
              window.setTimeout(() => beep(880, 160, 0.12), 220);
            }
            return;
          }

          setPhase("rest");
          setRemainingMs(restRef.current * 1000);
          endRef.current = performance.now() + restRef.current * 1000;
          if (sound) beep(330, 180, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (phaseRef.current === "rest") {
          setPhase("work");
          setRoundIndex((r) => Math.min(roundsRef.current, r + 1));
          setRemainingMs(workRef.current * 1000);
          endRef.current = performance.now() + workRef.current * 1000;
          if (sound) beep(520, 160, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [isRunning, paused, roundIndex, sound, finalBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const shownTime =
    phase === "idle"
      ? msToClock(workSec * 1000)
      : msToClock(Math.ceil(remainingMs / 1000) * 1000);

  const statusLabel =
    phase === "idle"
      ? "Ready"
      : phase === "done"
        ? "Complete"
        : paused
          ? "Paused"
          : phase === "warmup"
            ? "Warmup"
            : phase === "work"
              ? `Round ${roundIndex} of ${rounds}`
              : "Rest";

  const phaseChip =
    phase === "work"
      ? "Work"
      : phase === "rest"
        ? "Rest"
        : phase === "warmup"
          ? "Warmup"
          : phase === "done"
            ? "Done"
            : "Ready";

  const shellClass =
    phase === "work"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : phase === "rest"
        ? "border-slate-200 bg-slate-50 text-slate-950"
        : phase === "warmup"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, phase, paused],
    minPx: 52,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const canEditSettings = !isRunning; // keep settings safe: no mid-run edits

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "n") {
      skip();
    } else if (k === "r") {
      hardReset();
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
        title="Round Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {phase === "idle" || phase === "done"
                ? "Start"
                : paused
                  ? "Resume"
                  : "Pause"}
            </Btn>

            <Btn
              kind="ghost"
              onClick={skip}
              className="py-1 text-sm"
              disabled={!isRunning}
            >
              Next
            </Btn>

            <Btn kind="ghost" onClick={hardReset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "relative timer-display-surface order-first mt-0 flex flex-col items-center justify-center p-3 sm:p-6",
            shellClass,
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
            {shownTime}
          </span>

          {/* Small status strip */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <div className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              {phaseChip}
            </div>

            <div className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              {Math.min(rounds, Math.max(phase === "idle" ? 0 : 1, roundIndex))}{" "}
              / {rounds} rounds
            </div>

            <div className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              {Math.round(workSec / 60)}m work / {Math.round(restSec / 60)}m
              rest
            </div>
          </div>

          {/* Fullscreen helper overlay */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Round Timer
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    Tap time to start/pause / N = Next
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </DisplayStage>

        {/* Presets + settings + controls (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {phase === "idle" || phase === "done"
                  ? "Start"
                  : paused
                    ? "Resume"
                    : "Pause"}
              </Btn>

              <Btn kind="ghost" onClick={skip} disabled={!isRunning}>
                Next
              </Btn>

              <Btn kind="ghost" onClick={hardReset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Round presets">
                {presets.map((p) => {
                  const active =
                    p.rounds === rounds &&
                    p.workSec === workSec &&
                    p.restSec === restSec &&
                    (p.warmupSec ?? 0) === warmupSec;

                  return (
                    <Chip
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      disabled={!canEditSettings}
                      active={active}
                    >
                      {p.label}
                    </Chip>
                  );
                })}
            </PresetGroup>

            <SettingGroup
              title="Round settings"
              description="Settings lock while a round is active."
            >
              <SettingRow className="lg:grid-cols-4">
                <Field
                  label="Rounds"
                  type="number"
                  min={1}
                  max={60}
                  value={rounds}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 60))
                  }
                />
                <Field
                  label="Round length (sec)"
                  type="number"
                  min={10}
                  max={3600}
                  value={workSec}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setWorkSec(clamp(Number(e.target.value || 10), 10, 3600))
                  }
                />
                <Field
                  label="Rest (sec)"
                  type="number"
                  min={0}
                  max={3600}
                  value={restSec}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setRestSec(clamp(Number(e.target.value || 0), 0, 3600))
                  }
                />
                <Field
                  label="Warmup (sec)"
                  type="number"
                  min={0}
                  max={600}
                  value={warmupSec}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setWarmupSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                />
              </SettingRow>
              <div className="flex flex-wrap gap-2">
                <Toggle
                  label="Sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
                <Toggle
                  label="Final beeps"
                  checked={finalBeeps}
                  onCheckedChange={setFinalBeeps}
                  disabled={!sound}
                />
              </div>
            </SettingGroup>

            <UtilityResultRow>
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Current setup
              </span>
              <span>
                {rounds} rounds / {Math.round(workSec / 60)}m work / {Math.round(restSec / 60)}m rest
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N next / R reset / F fullscreen / S sound
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / N next / R reset / F fullscreen / S sound
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
export default function RoundTimerPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/round-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Round Timer",
        url,
        description:
          "Round timer for boxing and MMA with rounds + rest, presets, sound cues, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "Round Timer", item: url },
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
        display={<RoundTimerCard />}
        title="Round Timer (Boxing & MMA)"
        description="Run boxing or MMA-style work and rest rounds with warmup, sound cues, presets, and fullscreen display."
      />

      <SeoBand>
        <ContentSection title="How this round timer works">
          <p>
            This round timer is built for formats that alternate a timed round
            with a timed rest. Boxing-style, martial-arts-style, debate,
            rehearsal, bag work, sparring drills, and general interval sessions
            can use presets or custom round, rest, and warmup values.
          </p>
          <p>
            The current round or rest phase stays dominant, while total round
            status, warning cues, sound controls, and fullscreen mode remain
            secondary. Keep settings fixed during active sessions so the phase
            flow and cue timing stay easy to follow.
          </p>
        </ContentSection>
        <ContentSection title="Common round setups">
          <p>
            Use longer rounds for boxing-style bag work or practice rounds,
            shorter rounds for quick conditioning drills, and custom rest periods
            when equipment changes, notes, partner rotations, or room resets need
            more time. Warmup time can give everyone a clear countdown before the
            first active round starts.
          </p>
        </ContentSection>
        <ContentSection title="Warnings, sound cues, and limits">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Warning cues can mark the final seconds of a round or rest period
              without changing the timer length.
            </li>
            <li>
              Sound controls are useful in noisy spaces, but can stay off when a
              visual display is enough.
            </li>
            <li>
              Presets are timing conveniences, not sport rule definitions or
              compliance guidance.
            </li>
            <li>
              Choose round and rest lengths that match your own plan or the
              format you are following.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Related interval tools">
          <p>
            For general circuits, use the{" "}
            <a className="ilt-content-link" href="/workout-timer">
              workout timer
            </a>
            . For work/rest conditioning, use the{" "}
            <a className="ilt-content-link" href="/hiit-timer">
              HIIT timer
            </a>
            . For classic 20/10 intervals, use the{" "}
            <a className="ilt-content-link" href="/tabata-timer">
              Tabata timer
            </a>
            . For a standalone break between sets or rounds, use the{" "}
            <a className="ilt-content-link" href="/rest-timer">
              rest timer
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Round timer FAQ">
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              Is this a sport-rule timer?
            </strong>{" "}
            No. It is a practical round/rest countdown. Follow the rules for the
            class, gym, event, or format you are using.
          </p>
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              Can I use it outside workouts?
            </strong>{" "}
            Yes. Debate rounds, rehearsal turns, practice rounds, and group
            rotations can use the same round/rest structure.
          </p>
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              What are warning cues for?
            </strong>{" "}
            Warning cues mark the end of a round or rest period approaching
            without changing the duration you selected.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
