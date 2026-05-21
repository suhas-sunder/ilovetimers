// app/routes/hiit-timer.tsx
import type { Route } from "./+types/hiit-timer";
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
import HowItWorks from "~/clients/components/hiit-timer/HowItWorks";
import Disclaimer from "~/clients/components/hiit-timer/Disclaimer";
import FAQ from "~/clients/components/hiit-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/hiit-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/hiit-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "HIIT Timer (Interval Timer for Work & Rest, Tabata)";
  const description =
    "Free HIIT and interval timer with warmup, work, rest, rounds, and cooldown. Includes Tabata presets, sound cues, skip/next controls, fullscreen mode, and keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/hiit-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "hiit timer",
        "interval timer",
        "tabata timer",
        "work rest timer",
        "workout interval timer",
        "circuit timer",
        "boxing round timer",
        "online interval timer",
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
   HIIT / INTERVAL TIMER
========================================================= */
type Step = "warmup" | "work" | "rest" | "cooldown" | "done";

function HIITCard() {
  const beep = useBeep();

  // Defaults
  const [warmSec, setWarmSec] = useState(30);
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [coolSec, setCoolSec] = useState(30);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [step, setStep] = useState<Step>("warmup");
  const [roundIdx, setRoundIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(warmSec * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const stepRef = useRef<Step>(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const roundIdxRef = useRef<number>(roundIdx);
  useEffect(() => {
    roundIdxRef.current = roundIdx;
  }, [roundIdx]);

  const warmMs = useMemo(() => warmSec * 1000, [warmSec]);
  const workMs = useMemo(() => workSec * 1000, [workSec]);
  const restMs = useMemo(() => restSec * 1000, [restSec]);
  const coolMs = useMemo(() => coolSec * 1000, [coolSec]);

  function durFor(s: Step) {
    if (s === "warmup") return warmMs;
    if (s === "work") return workMs;
    if (s === "rest") return restMs;
    if (s === "cooldown") return coolMs;
    return 0;
  }

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Reset predictably when settings change
  useEffect(() => {
    setRunning(false);
    setStep("warmup");
    setRoundIdx(0);
    setRemaining(durFor("warmup"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warmMs, workMs, restMs, coolMs, rounds]);

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

      if (
        sound &&
        finalCountdownBeeps &&
        stepRef.current === "work" &&
        rem > 0 &&
        rem <= 3_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 120);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;

        if (sound) {
          const s = stepRef.current;
          const freq = s === "work" ? 660 : 980;
          beep(freq, 180);
        }

        window.setTimeout(() => advanceStep(), 20);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, beep]);

  function startStep(next: Step) {
    const d = durFor(next);
    setStep(next);
    setRemaining(d);
    endRef.current = performance.now() + d;
    lastBeepSecondRef.current = null;
    setRunning(true);
  }

  function resetAll() {
    setRunning(false);
    setStep("warmup");
    setRoundIdx(0);
    setRemaining(durFor("warmup"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }

  function startPause() {
    const s = stepRef.current;

    if (s === "done") {
      resetAll();
      setRunning(true);
      endRef.current = performance.now() + durFor("warmup");
      return;
    }

    if (durFor(s) === 0) {
      skipNext();
      return;
    }

    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function advanceStep() {
    const s = stepRef.current;
    const r = roundIdxRef.current;

    if (s === "warmup") {
      setRoundIdx(0);
      startStep("work");
      return;
    }

    if (s === "work") {
      if (restMs > 0) {
        startStep("rest");
        return;
      }
      const next = r + 1;
      if (next < rounds) {
        setRoundIdx(next);
        startStep("work");
      } else {
        startStep("cooldown");
      }
      return;
    }

    if (s === "rest") {
      const next = r + 1;
      if (next < rounds) {
        setRoundIdx(next);
        startStep("work");
      } else {
        startStep("cooldown");
      }
      return;
    }

    if (s === "cooldown") {
      setStep("done");
      setRemaining(0);
      setRunning(false);
      endRef.current = null;
      stopRaf();
      return;
    }

    resetAll();
  }

  function skipNext() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
    advanceStep();
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
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const phaseLabel =
    step === "warmup"
      ? "Warm-up"
      : step === "work"
        ? "Work"
        : step === "rest"
          ? "Rest"
          : step === "cooldown"
            ? "Cool-down"
            : "Complete";

  const roundLabel =
    step === "work" || step === "rest"
      ? `Round ${Math.min(roundIdx + 1, rounds)}/${rounds}`
      : step === "warmup"
        ? "Get ready"
        : step === "cooldown"
          ? "Finish"
          : "Done";

  const statusLabel =
    step === "done"
      ? "Done"
      : running
        ? "Running"
        : remaining > 0
          ? "Paused"
          : "Ready";

  const timeText =
    step === "done" ? "0:00" : msToClock(Math.ceil(remaining / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, running, step, roundIdx, rounds],
    minPx: 64,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 56 : 72,
  });

  const urgent =
    running && remaining > 0 && remaining <= 10_000 && step === "work";

  const phaseChip =
    step === "work"
      ? "bg-rose-50 text-rose-900 border-rose-200"
      : step === "rest"
        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
        : step === "warmup"
          ? "bg-amber-50 text-amber-900 border-amber-200"
          : step === "cooldown"
            ? "bg-slate-50 text-slate-700 border-slate-200"
            : "bg-slate-50 text-slate-700 border-slate-200";

  function applyTabata() {
    setWarmSec(0);
    setWorkSec(20);
    setRestSec(10);
    setRounds(8);
    setCoolSec(0);
  }

  function applyIntervals() {
    setWarmSec(30);
    setWorkSec(40);
    setRestSec(20);
    setRounds(10);
    setCoolSec(30);
  }

  function applyBoxing() {
    setWarmSec(0);
    setWorkSec(180);
    setRestSec(60);
    setRounds(6);
    setCoolSec(0);
  }

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="HIIT Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : step === "done" ? "Restart" : "Start"}
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

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "relative timer-display-surface order-first mt-0 flex flex-col items-center justify-center p-3 text-slate-950 sm:p-6",
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
              "inline-block text-center font-mono font-extrabold tracking-widest",
              urgent ? "text-rose-900" : "text-slate-950",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-widest",
                  phaseChip,
                ].join(" ")}
              >
                {phaseLabel}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                {roundLabel}
              </span>
            </div>

            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
              {statusLabel}
            </div>
          </div>

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Controls
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    Tap time to start/pause · N next · R reset · F fullscreen
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                    Space = Start/Pause
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                    N = Next
                  </div>
                </div>
              </div>
            </div>
          )}
        </DisplayStage>

        {/* Controls, presets, and settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn onClick={startPause}>
                {running ? "Pause" : step === "done" ? "Restart" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
              <Btn kind="ghost" onClick={skipNext}>
                Next
              </Btn>
            </ControlGroup>

            <PresetGroup title="Quick presets">
              <Chip onClick={applyTabata}>Tabata 20/10 x 8</Chip>
              <Chip onClick={applyIntervals}>Intervals 40/20 x 10</Chip>
              <Chip onClick={applyBoxing}>Boxing 3:00/1:00 x 6</Chip>
            </PresetGroup>

            <SettingGroup
              title="Interval settings"
              description="Presets load values. Press Start when ready."
            >
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-5">
                <Field
                  label="Warm-up seconds"
                  type="number"
                  min={0}
                  max={600}
                  value={warmSec}
                  onChange={(e) =>
                    setWarmSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                  hint="0 = skip"
                />
                <Field
                  label="Work seconds"
                  type="number"
                  min={1}
                  max={600}
                  value={workSec}
                  onChange={(e) =>
                    setWorkSec(clamp(Number(e.target.value || 1), 1, 600))
                  }
                />
                <Field
                  label="Rest seconds"
                  type="number"
                  min={0}
                  max={600}
                  value={restSec}
                  onChange={(e) =>
                    setRestSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                  hint="0 = none"
                />
                <Field
                  label="Rounds"
                  type="number"
                  min={1}
                  max={50}
                  value={rounds}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 50))
                  }
                />
                <Field
                  label="Cool-down seconds"
                  type="number"
                  min={0}
                  max={600}
                  value={coolSec}
                  onChange={(e) =>
                    setCoolSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                  hint="0 = skip"
                />
              </SettingRow>
              <SettingRow className="lg:grid-cols-[auto_auto]">
                <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                <Toggle
                  label="Final 3-2-1 beeps"
                  description="Work only"
                  checked={finalCountdownBeeps}
                  onCheckedChange={setFinalCountdownBeeps}
                  disabled={!sound}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / N next / F fullscreen
            </ShortcutHint>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / N next / R reset / F
              fullscreen
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
export default function HIITTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/hiit-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "HIIT Timer",
        url,
        description:
          "Free HIIT / interval timer with warmup, work, rest, rounds, cooldown, skip/next, sound alerts, fullscreen, and keyboard shortcuts.",
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
            name: "HIIT Timer",
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
        display={<HIITCard />}
        title="HIIT Timer (Intervals)"
        description="Run warm-up, work, rest, rounds, and cool-down intervals with a dominant phase countdown."
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
