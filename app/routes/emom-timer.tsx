import Stage4RouteContent from "~/clients/components/content/Stage4RouteContent";
// app/routes/emom-timer.tsx
import type { Route } from "./+types/emom-timer";
import { data as json } from "react-router";
import {
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
/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "EMOM Timer (Every Minute On the Minute, Fullscreen)";
  const description =
    "Free EMOM timer for Every Minute On the Minute workouts. Set rounds and total time, add a prep countdown, enable sound cues, and track rounds clearly in fullscreen.";

  const url = "https://www.ilovetimers.com/emom-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "emom timer",
        "every minute on the minute timer",
        "emom workout timer",
        "crossfit emom timer",
        "emom rounds timer",
        "emom online timer",
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

  return (freq = 880, duration = 120, gain = 0.1) => {
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
  };
}

/* =========================================================
   EMOM TIMER CARD
========================================================= */
type Mode = "idle" | "prep" | "emom" | "done";

function EmomTimerCard() {
  const beep = useBeep();

  const presetsRounds = useMemo(() => [6, 8, 10, 12, 15, 20, 30], []);
  const [rounds, setRounds] = useState(12);

  const prepPresets = useMemo(() => [0, 5, 10, 15, 20], []);
  const [prepSeconds, setPrepSeconds] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [mode, setMode] = useState<Mode>("idle");
  const [running, setRunning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startPerfRef = useRef<number | null>(null);
  const baseElapsedRef = useRef<number>(0); // ms accumulated before current run segment
  const modeStartBaseRef = useRef<number>(0); // base elapsed at mode start (prep start or emom start)

  const lastBeepSecondRef = useRef<number | null>(null);
  const lastMinuteMarkRef = useRef<number | null>(null);

  const elapsedLiveRef = useRef<number>(0);
  const [uiTick, setUiTick] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function computeElapsed(nowPerf: number) {
    const start = startPerfRef.current ?? nowPerf;
    const seg = running ? nowPerf - start : 0;
    return baseElapsedRef.current + seg;
  }

  function hardReset() {
    stopRaf();
    setMode("idle");
    setRunning(false);

    startPerfRef.current = null;
    baseElapsedRef.current = 0;
    modeStartBaseRef.current = 0;

    lastBeepSecondRef.current = null;
    lastMinuteMarkRef.current = null;

    elapsedLiveRef.current = 0;
    setUiTick((x) => x + 1);
  }

  function startFresh() {
    stopRaf();

    const startInPrep = prepSeconds > 0;
    setMode(startInPrep ? "prep" : "emom");
    setRunning(true);

    startPerfRef.current = performance.now();
    baseElapsedRef.current = 0;
    modeStartBaseRef.current = 0;

    lastBeepSecondRef.current = null;
    lastMinuteMarkRef.current = null;

    elapsedLiveRef.current = 0;
    setUiTick((x) => x + 1);
  }

  function pause() {
    if (!running) return;
    const now = performance.now();
    const elapsed = computeElapsed(now);
    baseElapsedRef.current = elapsed;
    startPerfRef.current = null;
    setRunning(false);
    elapsedLiveRef.current = elapsed;
    setUiTick((x) => x + 1);
  }

  function resume() {
    if (running) return;
    if (mode !== "prep" && mode !== "emom") return;
    startPerfRef.current = performance.now();
    setRunning(true);
  }

  function startPauseToggle() {
    if (mode === "idle" || mode === "done") {
      startFresh();
      return;
    }
    if (running) pause();
    else resume();
  }

  function toggleSound() {
    setSound((s) => !s);
  }

  function toggleFinalBeeps() {
    setFinalBeeps((b) => !b);
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }
    if (mode !== "prep" && mode !== "emom") {
      stopRaf();
      return;
    }

    const prepMs = clamp(prepSeconds, 0, 60) * 1000;
    const totalEmomMs = clamp(rounds, 1, 120) * 60_000;

    const tick = () => {
      const now = performance.now();
      const elapsed = computeElapsed(now);
      elapsedLiveRef.current = elapsed;

      if (mode === "prep") {
        const rem = Math.max(0, prepMs - (elapsed - modeStartBaseRef.current));

        if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
          const secLeft = Math.ceil(rem / 1000);
          if (lastBeepSecondRef.current !== secLeft) {
            lastBeepSecondRef.current = secLeft;
            beep(880, 90, 0.08);
          }
        }

        if (rem <= 0) {
          if (sound) beep(660, 160, 0.1);

          // Transition to EMOM
          setMode("emom");
          modeStartBaseRef.current = elapsed; // mark EMOM start at current elapsed
          lastBeepSecondRef.current = null;
          lastMinuteMarkRef.current = null;

          // Force UI update immediately on transition
          setUiTick((x) => x + 1);
        } else {
          // keep UI in sync without re-rendering every frame
          // (still re-renders frequently enough to look smooth)
          setUiTick((x) => x + 1);
        }

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // EMOM
      const emomElapsed = Math.max(0, elapsed - modeStartBaseRef.current);

      if (emomElapsed >= totalEmomMs) {
        setMode("done");
        setRunning(false);
        stopRaf();

        if (sound) {
          beep(660, 160, 0.1);
          window.setTimeout(() => beep(880, 160, 0.1), 220);
        }

        setUiTick((x) => x + 1);
        return;
      }

      const currentMinute = Math.floor(emomElapsed / 60_000); // 0..rounds-1
      const intoMinute = emomElapsed % 60_000;
      const remInMinute = Math.max(0, 60_000 - intoMinute);

      if (sound && lastMinuteMarkRef.current !== currentMinute) {
        lastMinuteMarkRef.current = currentMinute;
        beep(520, 140, 0.1);
      }

      if (sound && finalBeeps && remInMinute > 0 && remInMinute <= 5_000) {
        const secLeft = Math.ceil(remInMinute / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 80, 0.06);
        }
      } else {
        if (remInMinute > 5_000) lastBeepSecondRef.current = null;
      }

      setUiTick((x) => x + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, mode, rounds, prepSeconds, sound, finalBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const prepMs = clamp(prepSeconds, 0, 60) * 1000;
  const totalEmomMs = clamp(rounds, 1, 120) * 60_000;

  const effectiveElapsed = (() => {
    if (running && (mode === "prep" || mode === "emom")) {
      // derived from refs during render, based on latest uiTick
      const now = performance.now();
      return computeElapsed(now);
    }
    return elapsedLiveRef.current;
  })();

  const isActive = mode === "prep" || mode === "emom";
  const isLocked = isActive || mode === "done";

  const prepRemaining =
    mode === "prep"
      ? Math.max(0, prepMs - (effectiveElapsed - modeStartBaseRef.current))
      : prepMs;

  const emomElapsed =
    mode === "emom"
      ? Math.max(0, effectiveElapsed - modeStartBaseRef.current)
      : 0;

  const currentMinute = mode === "emom" ? Math.floor(emomElapsed / 60_000) : 0;

  const remainingInMinute =
    mode === "emom" ? Math.max(0, 60_000 - (emomElapsed % 60_000)) : 60_000;

  const shownTimeMs =
    mode === "prep" ? prepRemaining : mode === "emom" ? remainingInMinute : 0;

  const shownTime = msToClock(Math.ceil(shownTimeMs / 1000) * 1000);

  const statusLabel =
    mode === "prep"
      ? running
        ? "Get ready"
        : "Paused"
      : mode === "emom"
        ? running
          ? `Minute ${currentMinute + 1} of ${rounds}`
          : "Paused"
        : mode === "done"
          ? "Complete"
          : "Ready";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      isFs,
      running,
      mode,
      rounds,
      prepSeconds,
      sound,
      finalBeeps,
      uiTick,
    ],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPauseToggle();
    } else if (k === "r") {
      hardReset();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "s") {
      toggleSound();
    } else if (k === "b") {
      if (sound) toggleFinalBeeps();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const fsRightControls = (
    <div className="flex items-center gap-2">
      <Btn kind="solid" onClick={startPauseToggle} className="py-1 text-sm">
        {mode === "idle" || mode === "done"
          ? "Start"
          : running
            ? "Pause"
            : "Resume"}
      </Btn>

      <Btn kind="ghost" onClick={hardReset} className="py-1 text-sm">
        Reset
      </Btn>

      <Btn
        kind="ghost"
        onClick={toggleSound}
        className="py-1 text-sm"
        aria-pressed={sound}
      >
        Sound: {sound ? "On" : "Off"}
      </Btn>

      <Btn
        kind="ghost"
        onClick={toggleFinalBeeps}
        className="py-1 text-sm"
        disabled={!sound}
        aria-pressed={finalBeeps}
      >
        Final: {finalBeeps ? "On" : "Off"}
      </Btn>
    </div>
  );

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="EMOM Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={fsRightControls}
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "timer-display-surface relative order-first mt-0 flex flex-col items-center justify-center text-slate-950",
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
            if (isFs) startPauseToggle();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start, pause, or resume" : undefined}
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
            {mode === "done" ? "0:00" : shownTime}
          </span>

        </DisplayStage>

        {/* Controls, presets, and settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPauseToggle}>
                {mode === "idle" || mode === "done"
                  ? "Start"
                  : running
                    ? "Pause"
                    : "Resume"}
              </Btn>
              <Btn kind="ghost" onClick={hardReset}>
                Reset
              </Btn>
            </ControlGroup>

            <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-2">
              <PresetGroup title="Total minutes">
                {presetsRounds.map((m) => (
                  <Chip
                    key={m}
                    onClick={() => setRounds(m)}
                    disabled={isLocked}
                    active={m === rounds}
                  >
                    {m}m
                  </Chip>
                ))}
              </PresetGroup>

              <PresetGroup title="Prep countdown">
                {prepPresets.map((s) => (
                  <Chip
                    key={s}
                    onClick={() => setPrepSeconds(s)}
                    disabled={isLocked}
                    active={s === prepSeconds}
                  >
                    {s === 0 ? "None" : `${s}s`}
                  </Chip>
                ))}
              </PresetGroup>
            </div>

            <SettingGroup
              title="EMOM settings"
              description="One round starts every minute. Work, then rest until the next minute starts."
            >
              <SettingRow>
                <Field
                  label="Rounds"
                  type="number"
                  min={1}
                  max={120}
                  value={rounds}
                  disabled={isLocked}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 120))
                  }
                />
                <Field
                  label="Prep seconds"
                  type="number"
                  min={0}
                  max={60}
                  value={prepSeconds}
                  disabled={isLocked}
                  onChange={(e) =>
                    setPrepSeconds(clamp(Number(e.target.value || 0), 0, 60))
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
              Shortcuts: Space start/pause / R reset / F fullscreen / S sound / B final beeps
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / R reset / F
              fullscreen / S sound / B final beeps
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {running ? "Running" : mode === "idle" ? "Ready" : "Paused"}
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
export default function EmomTimerPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/emom-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "EMOM Timer",
        url,
        description:
          "EMOM timer (Every Minute On the Minute) with rounds, optional prep countdown, sound cues, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "EMOM Timer", item: url },
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
        display={<EmomTimerCard />}
        title="EMOM Timer (Every Minute On the Minute)"
        description="Set total minutes, optional prep, and sound cues for every-minute-on-the-minute training."
      />

      <SeoBand>
        <Stage4RouteContent routePath="/emom-timer" />
      </SeoBand>
    </PageShell>
  );
}
