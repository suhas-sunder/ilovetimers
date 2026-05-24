// app/routes/amrap-timer.tsx
import type { Route } from "./+types/amrap-timer";
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
import Disclaimer from "~/clients/components/amrap-timer/Disclaimer";
import FAQ from "~/clients/components/amrap-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/amrap-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/amrap-timer/PopularUseCases";
import HowItWorks from "~/clients/components/amrap-timer/HowItWorks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "AMRAP Timer (CrossFit Countdown + Rep Counter, Fullscreen)";
  const description =
    "Free AMRAP timer for CrossFit. Set minutes, run a fullscreen countdown, and track reps or rounds with big tap buttons or keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/amrap-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "amrap timer",
        "crossfit amrap timer",
        "amrap countdown",
        "amrap rep counter",
        "amrap rounds timer",
        "as many reps as possible timer",
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

const BigTap = ({
  label,
  value,
  onPlus,
  onMinus,
  disabled,
}: {
  label: string;
  value: number;
  onPlus: () => void;
  onMinus: () => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-3 bg-[var(--ilt-bg-panel)] px-3 py-3 text-[var(--ilt-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
    <div className="text-xs font-extrabold uppercase tracking-widest">
      {label}
    </div>
    <div className="flex items-center justify-between gap-3 sm:min-w-64">
      <Btn
        kind="ghost"
        onClick={onMinus}
        disabled={disabled}
        className="h-12 w-12 px-0 text-xl font-extrabold"
        aria-label={`Decrease ${label}`}
      >
        -
      </Btn>

      <div className="min-w-0 text-center">
        <div className="text-4xl font-extrabold text-[var(--ilt-text-primary)]">{value}</div>
        <div className="ilt-helper-text text-xs">Tap + / -</div>
      </div>

      <Btn
        kind="solid"
        onClick={onPlus}
        disabled={disabled}
        className="h-12 w-12 px-0 text-xl font-extrabold"
        aria-label={`Increase ${label}`}
      >
        +
      </Btn>
    </div>
  </div>
);



/* =========================================================
   AMRAP TIMER CARD
========================================================= */
function AmrapTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [4, 6, 8, 10, 12, 15, 20, 25, 30], []);
  const prepPresets = useMemo(() => [0, 5, 10, 15, 20], []);

  const [minutes, setMinutes] = useState(12);
  const [prepSeconds, setPrepSeconds] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [inPrep, setInPrep] = useState(false);

  const [reps, setReps] = useState(0);
  const [rounds, setRounds] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
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

  function resetTimerOnly() {
    setRunning(false);
    setInPrep(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
  }

  function resetAll() {
    resetTimerOnly();
    setReps(0);
    setRounds(0);
  }

  useEffect(() => {
    resetTimerOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes, prepSeconds]);

  useEffect(() => {
    return () => {
      stopRaf();
    };
  }, []);

  function startNew() {
    stopRaf();
    lastBeepSecondRef.current = null;
    hasStartedRef.current = true;

    if (prepSeconds > 0) {
      setInPrep(true);
      setRemaining(prepSeconds * 1000);
      endRef.current = performance.now() + prepSeconds * 1000;
      setRunning(true);
    } else {
      setInPrep(false);
      setRemaining(minutes * 60 * 1000);
      endRef.current = performance.now() + minutes * 60 * 1000;
      setRunning(true);
    }
  }

  function resume() {
    stopRaf();
    lastBeepSecondRef.current = null;
    endRef.current = performance.now() + remaining;
    setRunning(true);
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    if (!hasStartedRef.current) {
      startNew();
      return;
    }

    if (remaining <= 0) {
      startNew();
      return;
    }

    resume();
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 90, 0.07);
        }
      }

      if (rem <= 0) {
        if (inPrep) {
          if (sound) beep(660, 160, 0.1);

          setInPrep(false);
          setRemaining(minutes * 60 * 1000);
          endRef.current = performance.now() + minutes * 60 * 1000;
          lastBeepSecondRef.current = null;

          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setRunning(false);
        endRef.current = null;
        lastBeepSecondRef.current = null;
        hasStartedRef.current = false;

        if (sound) {
          beep(660, 160, 0.1);
          window.setTimeout(() => beep(880, 160, 0.1), 220);
        }

        stopRaf();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, inPrep, minutes, sound, finalBeeps, beep]);

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const readyTime = msToClock(minutes * 60 * 1000);

  const urgent = running && !inPrep && remaining > 0 && remaining <= 10_000;

  const statusLabel = !running
    ? hasStartedRef.current
      ? "Paused"
      : "Ready"
    : inPrep
      ? "Get ready"
      : "AMRAP running";

  const displayTone = inPrep
    ? "border-slate-200 bg-slate-50 text-slate-950"
    : urgent
      ? "border-rose-200 bg-amber-50 text-rose-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, readyTime, statusLabel, isFs, running],
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
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "+") {
      setReps((x) => x + 1);
    } else if (k === "-") {
      setReps((x) => Math.max(0, x - 1));
    } else if (k === "arrowup") {
      setRounds((x) => x + 1);
    } else if (k === "arrowdown") {
      setRounds((x) => Math.max(0, x - 1));
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
        title="AMRAP Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
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
        }
        right={
          <div className="flex items-center gap-2">
            <Btn kind={"solid"} onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset all
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
            "timer-display-surface order-first mt-0 flex flex-col items-center justify-center font-mono font-extrabold",
            displayTone,
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1 cursor-pointer" : "",
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
              "inline-block text-center",
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

          <div className="mt-3 text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <div className="mt-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Score
            </div>
            <div className="mt-1 text-2xl font-extrabold text-slate-950">
              {rounds} rounds + {reps} reps
            </div>
          </div>

        </DisplayStage>

        {/* Controls and settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset all
              </Btn>
            </ControlGroup>

            <div className="grid gap-4 lg:grid-cols-2">
              <PresetGroup title="AMRAP length">
                {presetsMin.map((m) => (
                  <Chip
                    key={m}
                    active={m === minutes}
                    onClick={() => setMinutes(m)}
                    disabled={running}
                  >
                    {m}m
                  </Chip>
                ))}
              </PresetGroup>

              <PresetGroup title="Prep countdown">
                {prepPresets.map((s) => (
                  <Chip
                    key={s}
                    active={s === prepSeconds}
                    onClick={() => setPrepSeconds(s)}
                    disabled={running}
                  >
                    {s === 0 ? "None" : `${s}s`}
                  </Chip>
                ))}
              </PresetGroup>
            </div>

            <SettingGroup
              title="AMRAP settings"
              description="Custom duration and quiet audio options."
            >
              <SettingRow className="lg:grid-cols-2">
                <Field
                  label="Minutes"
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  disabled={running}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                  }
                  hint="Common AMRAPs include 8, 10, 12, 15, and 20 minutes."
                />
                <Field
                  label="Prep seconds"
                  type="number"
                  min={0}
                  max={60}
                  value={prepSeconds}
                  disabled={running}
                  onChange={(e) =>
                    setPrepSeconds(clamp(Number(e.target.value || 0), 0, 60))
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

            <SettingGroup title="Score">
              <div className="grid gap-3 lg:grid-cols-2">
                <BigTap
                  label="Reps"
                  value={reps}
                  onPlus={() => setReps((x) => x + 1)}
                  onMinus={() => setReps((x) => Math.max(0, x - 1))}
                  disabled={false}
                />
                <BigTap
                  label="Rounds"
                  value={rounds}
                  onPlus={() => setRounds((x) => x + 1)}
                  onMinus={() => setRounds((x) => Math.max(0, x - 1))}
                  disabled={false}
                />
              </div>
            </SettingGroup>

            <UtilityResultRow>
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Score
              </span>
              <span>
                {rounds} rounds + {reps} reps
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: + / - reps / Up / Down rounds / Space start/pause / R reset all / F fullscreen / S sound
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
                  active={m === minutes}
                  onClick={() => setMinutes(m)}
                  disabled={running}
                >
                  {m}m
                </Chip>
              ))}
              {prepPresets.map((s) => (
                <Chip
                  key={`prep-${s}`}
                  active={s === prepSeconds}
                  onClick={() => setPrepSeconds(s)}
                  disabled={running}
                >
                  {s === 0 ? "No prep" : `${s}s prep`}
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
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause / +/- reps / Up/Down rounds
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
export default function AmrapTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/amrap-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "AMRAP Timer",
        url,
        description:
          "AMRAP timer (As Many Rounds/Reps As Possible) with countdown, optional prep, rep/round counter, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "AMRAP Timer", item: url },
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
        display={<AmrapTimerCard />}
        title="AMRAP Timer (Countdown + Rep Counter)"
        description="Run an AMRAP countdown with optional prep while tracking rounds and reps quietly below the timer."
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
