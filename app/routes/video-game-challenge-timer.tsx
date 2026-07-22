// app/routes/video-game-challenge-timer.tsx
import type { Route } from "./+types/video-game-challenge-timer";
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
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  SeoBand,
  Select,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  Toggle,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Game Challenge Timer (Sudden Death, Fullscreen)";
  const description =
    "Run casual game challenges with sudden death, one-minute, and multi-round timers. Big fullscreen countdown for party games, streams, and practice rounds.";

  const url = "https://www.ilovetimers.com/video-game-challenge-timer";

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
   VIDEO GAME CHALLENGE TIMER CARD
========================================================= */
type Mode = "sudden_death" | "one_minute" | "custom_rounds";

type ChallengePreset = {
  key: string;
  label: string;
  mode: Mode;
  minutes: number;
  seconds: number;
  rounds?: number;
  restSec?: number;
  note: string;
};

const PRESETS: ChallengePreset[] = [
  {
    key: "one_minute",
    label: "One minute",
    mode: "one_minute",
    minutes: 1,
    seconds: 0,
    note: "Classic one-minute challenge.",
  },
  {
    key: "sudden_death_30",
    label: "Sudden death (30s)",
    mode: "sudden_death",
    minutes: 0,
    seconds: 30,
    note: "Short sudden death round.",
  },
  {
    key: "sudden_death_60",
    label: "Sudden death (60s)",
    mode: "sudden_death",
    minutes: 1,
    seconds: 0,
    note: "Sudden death with 60 seconds.",
  },
  {
    key: "best_of_5_60",
    label: "Best of 5 (60s)",
    mode: "custom_rounds",
    minutes: 1,
    seconds: 0,
    rounds: 5,
    restSec: 10,
    note: "5 rounds, 10s rest between rounds.",
  },
  {
    key: "best_of_10_45",
    label: "Best of 10 (45s)",
    mode: "custom_rounds",
    minutes: 0,
    seconds: 45,
    rounds: 10,
    restSec: 10,
    note: "10 rounds, 10s rest between rounds.",
  },
];

function VideoGameChallengeTimerTool() {
  const beep = useBeep();

  const [mode, setMode] = useState<Mode>("one_minute");

  // duration for round
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

  // multi-round
  const [rounds, setRounds] = useState(5);
  const [restSec, setRestSec] = useState(10);
  const [phase, setPhase] = useState<"round" | "rest">("round");
  const [roundIndex, setRoundIndex] = useState(1);

  // timer
  const [running, setRunning] = useState(false);

  // audio/settings
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);
  const [beepOnPhaseChange, setBeepOnPhaseChange] = useState(true);

  // preset selection (for note only)
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(
    "one_minute",
  );

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const lastBeepSecondRef = useRef<number | null>(null);
  const shownMsRef = useRef<number>(0);
  const remainingMsRef = useRef<number>((minutes * 60 + seconds) * 1000);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const roundMs = useMemo(
    () => (minutes * 60 + seconds) * 1000,
    [minutes, seconds],
  );
  const restMs = useMemo(() => restSec * 1000, [restSec]);

  // display state (quantized to seconds for snappy rendering)
  const [shownMs, setShownMs] = useState(roundMs);

  useEffect(() => {
    shownMsRef.current = shownMs;
  }, [shownMs]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function syncShown(ms: number) {
    const q = Math.ceil(Math.max(0, ms) / 1000) * 1000;
    remainingMsRef.current = Math.max(0, ms);

    if (shownMsRef.current !== q) {
      shownMsRef.current = q;
      setShownMs(q);
    }
  }

  function hardResetTo(ms: number) {
    stopRaf();
    endRef.current = null;
    lastBeepSecondRef.current = null;
    remainingMsRef.current = ms;
    shownMsRef.current = ms;
    setShownMs(ms);
  }

  function applyPreset(p: ChallengePreset) {
    setSelectedPresetKey(p.key);

    setMode(p.mode);
    setMinutes(p.minutes);
    setSeconds(p.seconds);
    setRounds(p.rounds ?? 5);
    setRestSec(p.restSec ?? 10);

    setRunning(false);
    setPhase("round");
    setRoundIndex(1);

    hardResetTo((p.minutes * 60 + p.seconds) * 1000);
  }

  useEffect(() => {
    setRunning(false);
    setPhase("round");
    setRoundIndex(1);
    hardResetTo(roundMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundMs, mode]);

  useEffect(() => {
    if (mode !== "custom_rounds") return;
    setRunning(false);
    setPhase("round");
    setRoundIndex(1);
    hardResetTo(roundMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restMs, mode, roundMs]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rawRem = Math.max(0, (endRef.current ?? now) - now);

      if (sound && finalCountdownBeeps && rawRem > 0 && rawRem <= 5_000) {
        const secLeft = Math.ceil(rawRem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      syncShown(rawRem);

      if (rawRem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound) beep(660, 220);

        if (mode !== "custom_rounds") {
          setRunning(false);
          return;
        }

        if (phase === "round") {
          if (roundIndex >= rounds) {
            setRunning(false);
            return;
          }
          setPhase("rest");
          if (sound && beepOnPhaseChange) beep(520, 160);
          hardResetTo(restMs);
          setRunning(true);
          endRef.current = performance.now() + restMs;
          rafRef.current = requestAnimationFrame(tick);
          return;
        } else {
          setPhase("round");
          setRoundIndex((r) => r + 1);
          if (sound && beepOnPhaseChange) beep(760, 160);
          hardResetTo(roundMs);
          setRunning(true);
          endRef.current = performance.now() + roundMs;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    running,
    sound,
    finalCountdownBeeps,
    beep,
    mode,
    phase,
    roundIndex,
    rounds,
    roundMs,
    restMs,
    beepOnPhaseChange,
  ]);

  function reset() {
    setRunning(false);
    setPhase("round");
    setRoundIndex(1);
    hardResetTo(roundMs);
  }

  function startPause() {
    if (!running && sound) beep(0, 1);
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;

    if (!running) {
      endRef.current = performance.now() + remainingMsRef.current;
    } else {
      endRef.current = null;
      stopRaf();
    }
  }

  const activeLabel = useMemo(() => {
    if (mode === "one_minute") return "One Minute Challenge";
    if (mode === "sudden_death") return "Sudden Death";
    return phase === "round"
      ? `Round ${roundIndex} of ${rounds}`
      : `Rest (Round ${roundIndex}/${rounds})`;
  }, [mode, phase, roundIndex, rounds]);

  const statusLabel = useMemo(() => {
    if (running) return "Running";
    const base = remainingMsRef.current <= 0 ? "Done" : "Paused";
    if (mode !== "custom_rounds") return base;
    return `${base} · ${phase === "round" ? "Round" : "Rest"} ${roundIndex}/${rounds}`;
  }, [running, mode, phase, roundIndex, rounds]);

  const shownTime = useMemo(() => msToClock(shownMs), [shownMs]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, mode, phase, roundIndex, rounds],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const presetNote = useMemo(() => {
    if (!selectedPresetKey) return "Pick a preset or set your own round time.";
    const p = PRESETS.find((x) => x.key === selectedPresetKey);
    return p?.note ?? "Pick a preset or set your own round time.";
  }, [selectedPresetKey]);

  useEffect(() => {
    const exact = PRESETS.find((p) => {
      if (p.mode !== mode) return false;
      if (p.minutes !== minutes) return false;
      if (p.seconds !== seconds) return false;
      if (p.mode === "custom_rounds") {
        return (p.rounds ?? 5) === rounds && (p.restSec ?? 10) === restSec;
      }
      return true;
    });

    setSelectedPresetKey(exact ? exact.key : null);
  }, [mode, minutes, seconds, rounds, restSec]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
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
        title="Challenge Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
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
            {activeLabel}
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

        </div>

        {!isFs && (
          <div className="timer-control-stack mt-4">
            <ControlGroup>
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Challenge presets" description={presetNote}>
              {PRESETS.map((p) => {
                const active = selectedPresetKey === p.key;
                return (
                  <Chip
                    key={p.key}
                    onClick={() => applyPreset(p)}
                    active={active}
                  >
                    {p.label}
                  </Chip>
                );
              })}
            </PresetGroup>

            <SettingGroup title="Challenge settings">
              <SettingRow>
                <Field
                  label="Minutes"
                  type="number"
                  min={0}
                  max={180}
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 0), 0, 180))
                  }
                />

                <Field
                  label="Seconds"
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) =>
                    setSeconds(clamp(Number(e.target.value || 0), 0, 59))
                  }
                />

                <Select
                  label="Mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                >
                  <option value="one_minute">One minute challenge</option>
                  <option value="sudden_death">Sudden death</option>
                  <option value="custom_rounds">Rounds (with rest)</option>
                </Select>
              </SettingRow>

              {mode === "custom_rounds" ? (
                <SettingRow>
                  <Field
                    label="Rounds"
                    type="number"
                    min={1}
                    max={200}
                    value={rounds}
                    onChange={(e) =>
                      setRounds(clamp(Number(e.target.value || 5), 1, 200))
                    }
                  />

                  <Field
                    label="Rest (seconds)"
                    type="number"
                    min={0}
                    max={600}
                    value={restSec}
                    onChange={(e) =>
                      setRestSec(clamp(Number(e.target.value || 10), 0, 600))
                    }
                  />

                  <div className="flex items-end">
                    <Toggle
                      label="Beep on round/rest"
                      checked={beepOnPhaseChange}
                      onCheckedChange={setBeepOnPhaseChange}
                      disabled={!sound}
                    />
                  </div>
                </SettingRow>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Toggle
                  label="Sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
                <Toggle
                  label="Final beeps"
                  checked={finalCountdownBeeps}
                  onCheckedChange={setFinalCountdownBeeps}
                  disabled={!sound}
                />
              </div>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              <span className="ilt-keycap">Space</span> start/pause ·{" "}
              <span className="ilt-keycap">R</span> reset ·{" "}
              <span className="ilt-keycap">F</span> fullscreen
            </ShortcutHint>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
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
export default function VideoGameChallengeTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/video-game-challenge-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Video Game Challenge Timer",
        url,
        description:
          "A sudden death timer and one minute challenge timer for games and streams with fullscreen display, optional sound, and shortcuts.",
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
            name: "Video Game Challenge Timer",
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
        display={<VideoGameChallengeTimerTool />}
        title="Video Game Challenge Timer"
        description="Run sudden death, one-minute, and multi-round challenge timers with presets, audio cues, shortcuts, and fullscreen."
      />
      <SeoBand>
        <ContentSection title="How this game challenge timer works">
          <p>
            Choose a challenge mode, set the round length when needed, then use
            the large countdown as the active game clock. Presets cover quick
            sudden-death rounds, one-minute attempts, and multi-round challenge
            formats. Controls stay in the utility area so the timer remains the
            main focus.
          </p>
          <p>
            This page is for casual game-session structure: clear starts,
            visible time remaining, optional sound cues, and fullscreen when the
            timer needs to sit beside a stream, shared screen, or party setup.
            It is not meant for betting, gambling, unsafe challenges, or formal
            tournament rule enforcement.
          </p>
        </ContentSection>
        <ContentSection title="Challenge formats and examples">
          <p>
            Use sudden death when the round ends at zero, one-minute mode when
            you want quick repeated attempts, and custom rounds when your group
            needs a specific length or reset window. Short rounds work well for
            speed attempts, while longer rounds fit practice blocks or party
            games where everyone needs enough time to take a turn.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Casual speed attempt: one player has one minute to clear a level,
              finish a route, or beat a score.
            </li>
            <li>
              Multi-round challenge: run a fixed round length, pause between
              turns, then reset for the next player or attempt.
            </li>
            <li>
              Stream or shared-room timer: go fullscreen so the countdown stays
              visible without covering the game interface.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Settings, sound cues, and limits">
          <p>
            Sound cues can mark the end of a round when players are watching the
            game screen instead of the timer. Fullscreen makes the countdown
            easier to read across a room or beside a shared display. Custom
            round settings are useful when a preset is close but not quite the
            challenge you want.
          </p>
          <p>
            Browser audio may require a click before it plays, and tab focus or
            device sleep can affect visible updates. Keep the timer visible for
            group sessions, and keep challenge rules casual, clear, and safe.
          </p>
        </ContentSection>
        <ContentSection title="Related game and timing tools">
          <p>
            For split-based game runs, use the{" "}
            <a className="ilt-content-link" href="/speedrun-timer">
              speedrun timer
            </a>
            . For a plain fixed duration, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>
            . For unpredictable timing, try the{" "}
            <a className="ilt-content-link" href="/chaos-timer">
              chaos timer
            </a>
            . For open-ended attempts, use the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Video game challenge timer FAQ">
          <h3>Is this for official competitions?</h3>
          <p>
            No. Use it for casual challenges, streams, party games, and practice
            rounds. Follow the required rules and equipment for any formal event.
          </p>
          <h3>When should I use the speedrun timer instead?</h3>
          <p>
            Use the speedrun timer when you need splits and a run history. Use
            this page when you need a countdown clock for a challenge round.
          </p>
          <h3>Can I use it without sound?</h3>
          <p>
            Yes. Keep sound off and use the visual countdown or fullscreen view
            when audio would be distracting.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
