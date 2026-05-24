// app/routes/stretch-timer.tsx
import type { Route } from "./+types/stretch-timer";
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
  PresetChip as Chip,
  SecondaryActionRow,
  Select,
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
  const title = "Stretch Timer (Mobility & Yoga Intervals, Fullscreen)";
  const description =
    "Run stretch and rest intervals with rounds, presets, optional sound, and a clear fullscreen countdown for simple routines.";

  const url = "https://www.ilovetimers.com/stretch-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "stretch timer",
        "mobility timer",
        "yoga stretch timer",
        "stretch and rest timer",
        "interval stretch timer",
        "fullscreen stretch timer",
        "stretch hold timer",
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

function secToClock(secTotal: number) {
  const s = Math.max(0, Math.floor(secTotal));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${pad2(sec)}`;
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
   STRETCH TIMER CARD
========================================================= */
type Phase = "stretch" | "rest";

type Preset = {
  id: string;
  label: string;
  stretchSec: number;
  restSec: number;
  rounds: number;
};

const PRESETS: Preset[] = [
  {
    id: "mobility",
    label: "Mobility (45s stretch / 15s rest × 10)",
    stretchSec: 45,
    restSec: 15,
    rounds: 10,
  },
  {
    id: "yoga",
    label: "Yoga Holds (60s stretch / 15s rest × 8)",
    stretchSec: 60,
    restSec: 15,
    rounds: 8,
  },
  {
    id: "deep",
    label: "Deep Stretch (90s stretch / 30s rest × 6)",
    stretchSec: 90,
    restSec: 30,
    rounds: 6,
  },
  {
    id: "custom",
    label: "Custom",
    stretchSec: 45,
    restSec: 15,
    rounds: 10,
  },
];

function StretchTimerCard() {
  const beep = useBeep();

  const [presetId, setPresetId] = useState("mobility");
  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const [stretchSec, setStretchSec] = useState(preset.stretchSec);
  const [restSec, setRestSec] = useState(preset.restSec);
  const [rounds, setRounds] = useState(preset.rounds);

  const [sound, setSound] = useState(true);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("stretch");
  const [roundIndex, setRoundIndex] = useState(1);

  // Render state: only update once per second for snappy UI (prevents heavy rerenders).
  const [secLeft, setSecLeft] = useState(stretchSec);
  const secLeftRef = useRef(secLeft);
  useEffect(() => {
    secLeftRef.current = secLeft;
  }, [secLeft]);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const msLeftRef = useRef<number>(stretchSec * 1000);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function phaseDurationMs(p: Phase) {
    return (p === "stretch" ? stretchSec : restSec) * 1000;
  }

  // Apply preset values (except custom)
  useEffect(() => {
    if (presetId === "custom") return;
    setStretchSec(preset.stretchSec);
    setRestSec(preset.restSec);
    setRounds(preset.rounds);
  }, [presetId, preset]);

  // Reset when values change
  useEffect(() => {
    setRunning(false);
    setPhase("stretch");
    setRoundIndex(1);

    const ms = stretchSec * 1000;
    msLeftRef.current = ms;
    endRef.current = null;

    const nextSec = Math.max(0, Math.ceil(ms / 1000));
    setSecLeft(nextSec);
  }, [stretchSec, restSec, rounds]);

  // Main tick (RAF, but state updates only when displayed second changes)
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + msLeftRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const end = endRef.current ?? now;
      const remMs = Math.max(0, end - now);
      msLeftRef.current = remMs;

      const nextSec = Math.max(0, Math.ceil(remMs / 1000));
      if (nextSec !== secLeftRef.current) {
        secLeftRef.current = nextSec;
        setSecLeft(nextSec);
      }

      if (remMs <= 0) {
        // transition
        if (phase === "stretch") {
          if (restSec > 0) {
            setPhase("rest");
            const ms = phaseDurationMs("rest");
            msLeftRef.current = ms;
            endRef.current = performance.now() + ms;

            const s = Math.max(0, Math.ceil(ms / 1000));
            secLeftRef.current = s;
            setSecLeft(s);

            if (sound) beep(520, 110, 0.07);
          } else {
            const nextRound = roundIndex + 1;
            if (nextRound > rounds) {
              setRunning(false);
              endRef.current = null;
              if (sound) beep(660, 220, 0.08);
              return;
            }

            setRoundIndex(nextRound);
            setPhase("stretch");

            const ms = phaseDurationMs("stretch");
            msLeftRef.current = ms;
            endRef.current = performance.now() + ms;

            const s = Math.max(0, Math.ceil(ms / 1000));
            secLeftRef.current = s;
            setSecLeft(s);

            if (sound) beep(740, 110, 0.07);
          }
        } else {
          const nextRound = roundIndex + 1;
          if (nextRound > rounds) {
            setRunning(false);
            endRef.current = null;
            if (sound) beep(660, 220, 0.08);
            return;
          }

          setRoundIndex(nextRound);
          setPhase("stretch");

          const ms = phaseDurationMs("stretch");
          msLeftRef.current = ms;
          endRef.current = performance.now() + ms;

          const s = Math.max(0, Math.ceil(ms / 1000));
          secLeftRef.current = s;
          setSecLeft(s);

          if (sound) beep(740, 110, 0.07);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, phase, roundIndex, rounds, stretchSec, restSec, sound, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      endRef.current = null; // re-anchor timer on resume
      return next;
    });
  }

  function reset() {
    setRunning(false);
    setPhase("stretch");
    setRoundIndex(1);

    const ms = stretchSec * 1000;
    msLeftRef.current = ms;
    endRef.current = null;

    const s = Math.max(0, Math.ceil(ms / 1000));
    secLeftRef.current = s;
    setSecLeft(s);
  }

  function nextPhase() {
    if (!running) return;
    msLeftRef.current = 0;
    endRef.current = performance.now();
    secLeftRef.current = 0;
    setSecLeft(0);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "n") {
      nextPhase();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const label = phase === "stretch" ? "Stretch" : "Rest";
  const statusLabel = running
    ? "Running"
    : secLeft < (phase === "stretch" ? stretchSec : restSec)
      ? "Paused"
      : "Ready";

  const shownTime = secToClock(secLeft);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase, roundIndex, rounds],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const isCustom = presetId === "custom";
  const totalRoundsText = `${roundIndex} / ${rounds}`;

  const phaseChipClass =
    phase === "stretch"
      ? "bg-amber-50 text-slate-900"
      : "bg-slate-50 text-slate-900";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Stretch Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Toggle
              checked={sound}
              onCheckedChange={(v) => setSound(v)}
              label="Sound"
            />
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={nextPhase}
              className="py-1 text-sm"
              disabled={!running}
            >
              Next
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          className={[
            "timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
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
          <div className="flex items-center gap-2">
            <div
              className={[
                "ilt-inline-pill px-3 py-1 text-xs font-extrabold uppercase tracking-widest",
                phaseChipClass,
              ].join(" ")}
            >
              {label}
            </div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Round {totalRoundsText}
            </div>
          </div>

          <div className="mt-2 text-xs font-extrabold uppercase tracking-widest text-slate-600">
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

        </DisplayStage>

        {/* Settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={nextPhase} disabled={!running}>
                Next
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <SettingGroup title="Settings">
              <SettingRow className="lg:grid-cols-3">
                <Select
                  label="Preset"
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  hint={isCustom ? "Custom preset lets you edit all values." : "Changing presets updates the interval values."}
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </Select>
                <Field
                  label="Stretch (seconds)"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={600}
                  value={stretchSec}
                  onChange={(e) =>
                    setStretchSec(clamp(Number(e.target.value || 5), 5, 600))
                  }
                />
                <Field
                  label="Rest (seconds)"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={600}
                  value={restSec}
                  onChange={(e) =>
                    setRestSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                />
                <Field
                  label="Rounds"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  value={rounds}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 100))
                  }
                />
                <div className="flex flex-wrap items-end gap-3 lg:col-span-2">
                  <Toggle checked={sound} onCheckedChange={(v) => setSound(v)} label="Sound" />
                </div>
              </SettingRow>
            </SettingGroup>

            <UtilityResultRow>
              <span className="ilt-content-label">Total time</span>
              <span className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                About {Math.round(((stretchSec + restSec) * rounds) / 60)} minutes
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
              Tap time to start/pause · Space start/pause · N next · R reset · F
              fullscreen · S sound
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {label} · Round {totalRoundsText} · {statusLabel}
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
export default function StretchTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/stretch-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Stretch Timer",
        url,
        description:
          "Stretch timer for mobility and yoga stretching with stretch/rest intervals, rounds, presets, and fullscreen.",
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
            name: "Stretch Timer",
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
        display={<StretchTimerCard />}
        title="Stretch Timer"
        description="Alternate stretch and rest intervals with the active interval timer kept large and readable."
      />

      <SeoBand>
        <ContentSection title="How this stretch timer works">
          <p>
            Stretch Timer alternates stretch intervals and rest intervals for a
            simple routine. Choose a preset or set custom stretch length, rest
            length, and rounds, then keep the current interval display large
            while optional cues, fullscreen, and keyboard shortcuts stay below
            the tool.
          </p>
          <p>
            Use Next when you want to move to the next stretch or rest interval
            early. Reset returns the routine to the beginning with the current
            settings.
          </p>
        </ContentSection>
        <ContentSection title="Examples and settings">
          <ul className="list-disc space-y-2 pl-5">
            <li>Use short stretch and rest intervals for a desk break sequence.</li>
            <li>Use longer rounds for yoga-style holds or a cooldown routine.</li>
            <li>Use rest intervals to switch position before the next stretch.</li>
            <li>
              Choose durations appropriate for your own routine and comfort
              level.
            </li>
          </ul>
          <p>
            This timer is not medical advice and does not promise flexibility,
            pain relief, or injury prevention.
          </p>
        </ContentSection>
        <ContentSection title="Related movement timers">
          <p>
            For short non-stretch pauses, use the{" "}
            <a className="ilt-content-link" href="/break-timer">
              break timer
            </a>
            . For rest intervals between sets, try the{" "}
            <a className="ilt-content-link" href="/rest-timer">
              rest timer
            </a>
            . For a quiet timed session, use the{" "}
            <a className="ilt-content-link" href="/meditation-timer">
              meditation timer
            </a>
            . For fuller exercise intervals, use the{" "}
            <a className="ilt-content-link" href="/workout-timer">
              workout timer
            </a>
            .
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
