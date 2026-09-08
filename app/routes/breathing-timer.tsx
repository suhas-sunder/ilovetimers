import Stage4RouteContent from "~/clients/components/content/Stage4RouteContent";
// app/routes/breathing-timer.tsx
import type { Route } from "./+types/breathing-timer";
import { data as json } from "react-router";
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
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

const REVIEW_DATE = { iso: "2026-07-14", label: "July 14, 2026" } as const;

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Breathing Timer (Box Breathing + Guided Cycles)";
  const description =
    "Free breathing timer for box breathing, 4-7-8, and custom inhale, hold, and exhale cycles. Clean guided visuals with optional sound and fullscreen mode.";

  const url = "https://www.ilovetimers.com/breathing-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "breathing timer",
        "box breathing timer",
        "breathing exercise timer",
        "4-7-8 breathing timer",
        "guided breathing timer",
        "inhale exhale timer",
        "breathing cycle timer",
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
/* WebAudio beep (gentle cue) */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 660, duration = 90, gain = 0.06) => {
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
   BREATHING TIMER CARD
========================================================= */
type PhaseKey = "inhale" | "hold1" | "exhale" | "hold2";

type Preset = {
  id: string;
  labelShort: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number; // 0 = continuous
};

const PRESETS: Preset[] = [
  {
    id: "box",
    labelShort: "Box 4-4-4-4",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 0,
  },
  {
    id: "478",
    labelShort: "4-7-8",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
  },
  {
    id: "calm",
    labelShort: "Calm 4-2-6",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 0,
  },
  {
    id: "custom",
    labelShort: "Custom",
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    cycles: 0,
  },
];

function BreathingTimerCard() {
  const beep = useBeep();

  const [presetId, setPresetId] = useState<string>("box");
  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const [inhale, setInhale] = useState(preset.inhale);
  const [hold1, setHold1] = useState(preset.hold1);
  const [exhale, setExhale] = useState(preset.exhale);
  const [hold2, setHold2] = useState(preset.hold2);
  const [cyclesTarget, setCyclesTarget] = useState(preset.cycles);

  const [sound, setSound] = useState(false);

  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [phase, setPhase] = useState<PhaseKey>("inhale");
  const [phaseMsLeft, setPhaseMsLeft] = useState(inhale * 1000);
  const [cycleCount, setCycleCount] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const phaseRef = useRef<PhaseKey>("inhale");
  const phaseMsLeftRef = useRef<number>(inhale * 1000);
  const cycleCountRef = useRef<number>(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLSpanElement>(null);

  const pattern = useMemo(() => {
    const steps: { key: PhaseKey; label: string; seconds: number }[] = [
      { key: "inhale", label: "Inhale", seconds: inhale },
      { key: "hold1", label: "Hold", seconds: hold1 },
      { key: "exhale", label: "Exhale", seconds: exhale },
      { key: "hold2", label: "Hold", seconds: hold2 },
    ];
    // Always keep inhale/exhale, and drop zero holds
    return steps.filter((s) => s.seconds > 0);
  }, [inhale, hold1, exhale, hold2]);

  function stepIndexFor(p: PhaseKey) {
    const idx = pattern.findIndex((x) => x.key === p);
    return idx >= 0 ? idx : 0;
  }

  function nextPhase(cur: PhaseKey): PhaseKey {
    const idx = stepIndexFor(cur);
    const next = pattern[(idx + 1) % pattern.length];
    return next.key;
  }

  function phaseSeconds(p: PhaseKey) {
    const found = pattern.find((x) => x.key === p);
    return found?.seconds ?? inhale;
  }

  const phaseLabel = useMemo(() => {
    return pattern.find((x) => x.key === phase)?.label ?? "Inhale";
  }, [pattern, phase]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function hardResetToReady() {
    stopRaf();
    endRef.current = null;

    setRunning(false);
    setCompleted(false);

    setPhase("inhale");
    setPhaseMsLeft(inhale * 1000);
    setCycleCount(0);

    phaseRef.current = "inhale";
    phaseMsLeftRef.current = inhale * 1000;
    cycleCountRef.current = 0;
  }

  // Apply preset values when changing away from custom.
  useEffect(() => {
    if (presetId === "custom") return;
    setInhale(preset.inhale);
    setHold1(preset.hold1);
    setExhale(preset.exhale);
    setHold2(preset.hold2);
    setCyclesTarget(preset.cycles);
  }, [presetId, preset]);

  // If the pattern changes, reset to ready state.
  useEffect(() => {
    hardResetToReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inhale, hold1, exhale, hold2, cyclesTarget]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startNew() {
    stopRaf();
    setCompleted(false);

    const firstMs = inhale * 1000;

    setPhase("inhale");
    setPhaseMsLeft(firstMs);
    setCycleCount(0);

    phaseRef.current = "inhale";
    phaseMsLeftRef.current = firstMs;
    cycleCountRef.current = 0;

    endRef.current = performance.now() + firstMs;
    setRunning(true);
  }

  function resume() {
    stopRaf();
    endRef.current = performance.now() + phaseMsLeftRef.current;
    setRunning(true);
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      stopRaf();
      return;
    }

    if (completed) {
      startNew();
      return;
    }

    // If we've never started (or we are at the initial ready state), start fresh.
    const isAtReady =
      phaseRef.current === "inhale" &&
      Math.abs(phaseMsLeftRef.current - inhale * 1000) < 20 &&
      cycleCountRef.current === 0;

    if (isAtReady) {
      startNew();
      return;
    }

    // Otherwise resume
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

      phaseMsLeftRef.current = rem;
      setPhaseMsLeft(rem);

      if (rem <= 0) {
        const cur = phaseRef.current;
        const nxt = nextPhase(cur);
        const wrapped = nxt === "inhale";

        if (sound) {
          if (nxt === "inhale") beep(740, 90, 0.06);
          else if (nxt === "exhale") beep(520, 90, 0.06);
          else beep(620, 70, 0.05);
        }

        if (wrapped) {
          const nextCycle = cycleCountRef.current + 1;
          cycleCountRef.current = nextCycle;
          setCycleCount(nextCycle);

          if (cyclesTarget > 0 && nextCycle >= cyclesTarget) {
            setRunning(false);
            setCompleted(true);
            endRef.current = null;
            stopRaf();
            return;
          }
        }

        const nextMs = phaseSeconds(nxt) * 1000;

        phaseRef.current = nxt;
        phaseMsLeftRef.current = nextMs;

        setPhase(nxt);
        setPhaseMsLeft(nextMs);

        endRef.current = performance.now() + nextMs;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, cyclesTarget, sound, beep, inhale, pattern]);

  const secondsLeft = Math.max(0, Math.ceil(phaseMsLeft / 1000));
  const bigNumber = String(secondsLeft);

  const statusLabel = completed
    ? "Done"
    : !running
      ? "Ready"
      : "Guided breathing";

  const cycleText =
    cyclesTarget > 0
      ? `Cycle ${Math.min(cycleCount + 1, cyclesTarget)} of ${cyclesTarget}`
      : `Cycle ${cycleCount + 1} (continuous)`;

  const displayTone = running
    ? "border-slate-200 bg-slate-50 text-slate-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: mainTextRef,
    deps: [bigNumber, isFs, running, phaseLabel, statusLabel, cycleText],
    minPx: 64,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 64 : 80,
    initialScale: isFs ? 1 : 0.5,
    initialMobileScale: isFs ? 1 : 1.24,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      hardResetToReady();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "s") {
      setSound((x) => !x);
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
        title="Breathing Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <Toggle label="Sound (S)" checked={sound} onCheckedChange={setSound} />
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : completed ? "Restart" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={hardResetToReady}
              className="py-1 text-sm"
            >
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
            "timer-display-surface order-first mt-0 flex flex-col items-center justify-center font-mono font-extrabold",
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
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              ref={mainTextRef}
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
              {bigNumber}
            </span>

            <div className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
              {phaseLabel}
            </div>

            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {statusLabel}
            </div>

            <div className="text-sm font-semibold text-slate-700">
              {cycleText}
            </div>
          </div>

        </DisplayStage>

        {/* Controls and settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                {running ? "Pause" : completed ? "Restart" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={hardResetToReady}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Breathing presets"
              description="Presets are locked while running."
            >
              {PRESETS.map((p) => (
                <Chip
                  key={p.id}
                  active={p.id === presetId}
                  onClick={() => setPresetId(p.id)}
                  disabled={running}
                >
                  {p.labelShort}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Breathing settings"
              description="Set holds to 0 to skip them."
            >
              <SettingRow className="lg:grid-cols-5">
                <Field
                  label="Inhale (sec)"
                  type="number"
                  min={1}
                  max={30}
                  value={inhale}
                  disabled={running}
                  onChange={(e) =>
                    setInhale(clamp(Number(e.target.value || 1), 1, 30))
                  }
                />
                <Field
                  label="Hold (sec)"
                  type="number"
                  min={0}
                  max={30}
                  value={hold1}
                  disabled={running}
                  onChange={(e) =>
                    setHold1(clamp(Number(e.target.value || 0), 0, 30))
                  }
                />
                <Field
                  label="Exhale (sec)"
                  type="number"
                  min={1}
                  max={40}
                  value={exhale}
                  disabled={running}
                  onChange={(e) =>
                    setExhale(clamp(Number(e.target.value || 1), 1, 40))
                  }
                />
                <Field
                  label="Hold (sec)"
                  type="number"
                  min={0}
                  max={30}
                  value={hold2}
                  disabled={running}
                  onChange={(e) =>
                    setHold2(clamp(Number(e.target.value || 0), 0, 30))
                  }
                />
                <Field
                  label="Cycles (0 = continuous)"
                  type="number"
                  min={0}
                  max={60}
                  value={cyclesTarget}
                  disabled={running}
                  onChange={(e) =>
                    setCyclesTarget(clamp(Number(e.target.value || 0), 0, 60))
                  }
                />
              </SettingRow>
              <Toggle
                label="Sound cues (S)"
                checked={sound}
                onCheckedChange={setSound}
              />
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / F fullscreen / S sound
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => (
                <Chip
                  key={p.id}
                  active={p.id === presetId}
                  onClick={() => setPresetId(p.id)}
                >
                  {p.labelShort}
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : completed ? "Restart" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={hardResetToReady}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap timer to start/pause / Space / R reset / S sound
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
export default function BreathingTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/breathing-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Breathing Timer",
        url,
        dateModified: `${REVIEW_DATE.iso}T00:00:00Z`,
        description:
          "Breathing timer for box breathing, 4-7-8 breathing, and custom inhale/hold/exhale cycles with fullscreen mode.",
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
            name: "Breathing Timer",
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
        display={<BreathingTimerCard />}
        title="Breathing Timer (Guided Cycles)"
        description="Follow inhale, hold, exhale, and rest phases with calm timing, presets, sound cues, and fullscreen mode."
      />

      <SeoBand>
        <Stage4RouteContent routePath="/breathing-timer" />
        <ToolTrustNote reviewDate={REVIEW_DATE} heading="Health and timing limits">
          <p>
            This is a general timing and pacing tool. It is not medical advice,
            diagnosis, treatment, or emergency guidance. Users who feel unwell
            should stop and seek appropriate help.
          </p>
          <p>
            Browser scheduling, background throttling, audio settings, and
            device performance can affect the timing or sound of phase changes.
          </p>
        </ToolTrustNote>
      </SeoBand>
    </PageShell>
  );
}
