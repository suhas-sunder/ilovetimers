// app/routes/tabata-timer.tsx
import type { Route } from "./+types/tabata-timer";
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
  const title = "Tabata Timer (20/10 Intervals, Fullscreen)";
  const description =
    "Run classic Tabata workouts with a clear 20/10 interval timer. Big fullscreen intervals built for HIIT, conditioning, and fast-paced training.";

  const url = "https://www.ilovetimers.com/tabata-timer";

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
   TABATA TIMER CARD
========================================================= */
type Phase = "work" | "rest";

function TabataTimerCard() {
  const beep = useBeep();

  // Defaults: 20s work / 10s rest x 8
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [rounds, setRounds] = useState(8);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const [phase, setPhase] = useState<Phase>("work");
  const [roundIdx, setRoundIdx] = useState(1);
  const [running, setRunning] = useState(false);

  // Displayed remaining (snappy, second-aligned)
  const [displayRemainingMs, setDisplayRemainingMs] = useState(workSec * 1000);

  // Internal high-res timing
  const endRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const remainingMsRef = useRef<number>(workSec * 1000);

  const lastShownMsRef = useRef<number>(workSec * 1000);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const quickWork = useMemo(() => [10, 15, 20, 30, 40, 45], []);
  const quickRest = useMemo(() => [0, 5, 10, 15, 20, 30], []);
  const quickRounds = useMemo(() => [4, 6, 8, 10, 12, 16], []);

  const totalTimeMs = useMemo(() => {
    const w = Math.max(0, workSec) * 1000;
    const r = Math.max(0, restSec) * 1000;
    const n = Math.max(1, rounds);
    return n * w + Math.max(0, n - 1) * r;
  }, [workSec, restSec, rounds]);

  const totalText = useMemo(() => {
    const totalSec = Math.round(totalTimeMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${pad2(s)}`;
  }, [totalTimeMs]);

  const statusLabel = useMemo(() => {
    if (running) return phase === "work" ? "Work" : "Rest";
    if (displayRemainingMs <= 0) return "Done";
    return phase === "work" ? "Ready" : "Ready";
  }, [running, phase, displayRemainingMs]);

  const shownTime = useMemo(
    () => msToClock(displayRemainingMs),
    [displayRemainingMs],
  );

  const progress = useMemo(() => {
    if (totalTimeMs <= 0) return 0;

    const w = Math.max(0, workSec) * 1000;
    const r = Math.max(0, restSec) * 1000;
    const n = Math.max(1, rounds);

    const currentTotal = phase === "work" ? w : r;
    const currentRemaining = clamp(
      remainingMsRef.current,
      0,
      Math.max(1, currentTotal),
    );
    const currentDone = clamp(currentTotal - currentRemaining, 0, currentTotal);

    const completedRounds = clamp(roundIdx - 1, 0, n);

    let doneBefore = completedRounds * (w + r);
    if (phase === "rest") doneBefore += w;

    const raw = doneBefore + currentDone;
    return clamp(raw / totalTimeMs, 0, 1);
  }, [
    totalTimeMs,
    workSec,
    restSec,
    rounds,
    phase,
    roundIdx,
    displayRemainingMs,
  ]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase, roundIdx, rounds],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Keep aligned when config changes (only when not running)
  useEffect(() => {
    if (running) return;

    setPhase("work");
    setRoundIdx(1);

    const next = Math.max(0, Math.floor(workSec * 1000));
    remainingMsRef.current = next;
    endRef.current = null;

    const shown = Math.ceil(next / 1000) * 1000;
    lastShownMsRef.current = shown;
    setDisplayRemainingMs(shown);

    lastBeepSecondRef.current = null;
  }, [workSec, restSec, rounds, running]);

  // Timer loop (snappy digits, minimal re-render)
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
      const rem = Math.max(0, (endRef.current ?? now) - now);
      remainingMsRef.current = rem;

      // Update displayed digits only when the shown second changes
      const shown = Math.ceil(rem / 1000) * 1000;
      if (shown !== lastShownMsRef.current) {
        lastShownMsRef.current = shown;
        setDisplayRemainingMs(shown);
      }

      // Final countdown beeps: 3..2..1
      if (sound && finalCountdownBeeps && rem > 0 && rem <= 3_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(900, 90);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound) {
          // Work->Rest lower tone, Rest->Work higher tone
          if (phase === "work") beep(520, 240);
          else beep(760, 200);
        }

        if (phase === "work") {
          // If final work interval, finish (no mandatory rest after)
          if (roundIdx >= rounds) {
            setRunning(false);
            return;
          }

          // Go to rest
          const next = Math.max(0, Math.floor(restSec * 1000));
          setPhase("rest");
          remainingMsRef.current = next;
          endRef.current = performance.now() + next;

          const nextShown = Math.ceil(next / 1000) * 1000;
          lastShownMsRef.current = nextShown;
          setDisplayRemainingMs(nextShown);

          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // Rest -> next round work
        setRoundIdx((r) => Math.min(rounds, r + 1));
        setPhase("work");

        const next = Math.max(0, Math.floor(workSec * 1000));
        remainingMsRef.current = next;
        endRef.current = performance.now() + next;

        const nextShown = Math.ceil(next / 1000) * 1000;
        lastShownMsRef.current = nextShown;
        setDisplayRemainingMs(nextShown);

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [
    running,
    sound,
    finalCountdownBeeps,
    beep,
    phase,
    roundIdx,
    rounds,
    workSec,
    restSec,
  ]);

  function reset() {
    setRunning(false);
    setPhase("work");
    setRoundIdx(1);

    const next = Math.max(0, Math.floor(workSec * 1000));
    remainingMsRef.current = next;
    endRef.current = null;

    const shown = Math.ceil(next / 1000) * 1000;
    lastShownMsRef.current = shown;
    setDisplayRemainingMs(shown);

    lastBeepSecondRef.current = null;
    stopRaf();
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;

      if (next) {
        // Starting: ensure endRef aligns to current remaining
        endRef.current = performance.now() + remainingMsRef.current;
      } else {
        // Pausing: freeze remaining
        if (endRef.current) {
          const now = performance.now();
          remainingMsRef.current = Math.max(0, endRef.current - now);
        }
        endRef.current = null;
      }

      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function next() {
    // Skip to next phase/round, keep running state
    endRef.current = null;
    lastBeepSecondRef.current = null;

    if (phase === "work") {
      if (roundIdx >= rounds) {
        setRunning(false);
        return;
      }

      setPhase("rest");
      const nextMs = Math.max(0, Math.floor(restSec * 1000));
      remainingMsRef.current = nextMs;

      const shown = Math.ceil(nextMs / 1000) * 1000;
      lastShownMsRef.current = shown;
      setDisplayRemainingMs(shown);

      if (running) endRef.current = performance.now() + nextMs;
      return;
    }

    // Rest -> next work
    setRoundIdx((r) => Math.min(rounds, r + 1));
    setPhase("work");

    const nextMs = Math.max(0, Math.floor(workSec * 1000));
    remainingMsRef.current = nextMs;

    const shown = Math.ceil(nextMs / 1000) * 1000;
    lastShownMsRef.current = shown;
    setDisplayRemainingMs(shown);

    if (running) endRef.current = performance.now() + nextMs;
  }

  function setClassic() {
    if (running) return;
    setWorkSec(20);
    setRestSec(10);
    setRounds(8);
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
      next();
    } else if (k === "c") {
      setClassic();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const urgent =
    running && remainingMsRef.current > 0 && remainingMsRef.current <= 6_000;

  const fsRight = (
    <div className="flex items-center gap-2">
      <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
        {running ? "Pause" : "Start"}
      </Btn>
      <Btn kind="ghost" onClick={next} className="py-1 text-sm">
        Next
      </Btn>
      <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
        Reset
      </Btn>
      <Btn
        kind="ghost"
        onClick={setClassic}
        className="py-1 text-sm"
        disabled={running}
      >
        Classic
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
        title="Tabata Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={fsRight}
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "timer-display-surface relative order-first mt-0 flex flex-col items-center justify-center text-slate-950",
            urgent
              ? "border-rose-300 bg-rose-50"
              : phase === "work"
                ? "border-amber-200"
                : "border-slate-200",
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
          <span
            ref={timeTextRef}
            className={[
              "inline-block text-center font-mono font-extrabold",
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

          <div className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {phase === "work" ? "Work" : "Rest"} / Round {roundIdx}/{rounds} /
            Total {totalText} / {statusLabel}
          </div>

          {/* Progress */}
          <div className="mt-4 w-full max-w-3xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </DisplayStage>
        {/* Config (normal only) */}
        {!isFs && (
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
              <Btn kind="ghost" onClick={next}>
                Next
              </Btn>
            </ControlGroup>

            <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-3">
              <PresetGroup title="Work">
                {quickWork.map((s) => (
                  <Chip
                    key={s}
                    onClick={() => !running && setWorkSec(s)}
                    disabled={running}
                    active={s === workSec}
                  >
                    {s}s
                  </Chip>
                ))}
              </PresetGroup>

              <PresetGroup title="Rest">
                {quickRest.map((s) => (
                  <Chip
                    key={s}
                    onClick={() => !running && setRestSec(s)}
                    disabled={running}
                    active={s === restSec}
                  >
                    {s}s
                  </Chip>
                ))}
              </PresetGroup>

              <PresetGroup title="Rounds">
                {quickRounds.map((r) => (
                  <Chip
                    key={r}
                    onClick={() => !running && setRounds(r)}
                    disabled={running}
                    active={r === rounds}
                  >
                    {r}
                  </Chip>
                ))}
              </PresetGroup>
            </div>

            <SettingGroup
              title="Tabata settings"
              description="Keep the 20/10 rhythm clear, or adjust work, rest, rounds, and cues."
            >
              <SettingRow className="sm:grid-cols-3">
                <Field
                  label="Work seconds"
                  type="number"
                  min={5}
                  max={600}
                  value={workSec}
                  disabled={running}
                  onChange={(e) =>
                    setWorkSec(clamp(Number(e.target.value || 5), 5, 600))
                  }
                />
                <Field
                  label="Rest seconds"
                  hint="Classic Tabata rest is 10 seconds."
                  type="number"
                  min={0}
                  max={600}
                  value={restSec}
                  disabled={running}
                  onChange={(e) =>
                    setRestSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                />
                <Field
                  label="Rounds"
                  type="number"
                  min={1}
                  max={50}
                  value={rounds}
                  disabled={running}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 50))
                  }
                />
              </SettingRow>
              <SettingRow className="justify-items-center lg:grid-cols-[auto]">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                  <Toggle
                    label="Final beeps"
                    checked={finalCountdownBeeps}
                    onCheckedChange={setFinalCountdownBeeps}
                    disabled={!sound}
                  />
                </div>
              </SettingRow>
            </SettingGroup>

            <UtilityResultRow>
              <span className="ilt-content-label">Total</span>
              <span className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                {totalText}, no rest after last work interval.
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={setClassic} disabled={running}>
                Classic 20/10 x 8
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N next / R reset / F fullscreen / C classic
            </ShortcutHint>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / N next / R reset / F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {phase === "work" ? "Work" : "Rest"} / Round {roundIdx}/{rounds}
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
export default function TabataTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/tabata-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tabata Timer",
        url,
        description:
          "Tabata timer with classic 20 seconds work and 10 seconds rest for 8 rounds. Fullscreen intervals, optional sound, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Tabata Timer", item: url },
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
        display={<TabataTimerCard />}
        title="Tabata Timer (20/10 Intervals)"
        description="Run classic Tabata work and rest intervals with round status, final beeps, and fullscreen controls."
      />

      <SeoBand>
        <ContentSection title="How this Tabata timer works">
          <p>
            This Tabata timer keeps the common 20 seconds work, 10 seconds rest,
            8 round structure ready while still allowing custom work, rest, and
            round settings. The current work or rest phase stays first, with
            round status, optional sound cues, final beeps, and fullscreen
            controls below the display.
          </p>
          <p>
            Use the Classic control to return to the 20/10 format, or adjust the
            intervals before starting for a modified practice session. The timer
            runs the structure you choose; it does not choose exercises or make
            performance claims.
          </p>
        </ContentSection>
        <ContentSection title="Tabata, HIIT, and round timing">
          <p>
            Tabata-style timing is a specific short work/rest rhythm, while HIIT
            can describe many different interval lengths and round counts. If you
            want a broader setup with prep, cooldown, or different work/rest
            choices, the{" "}
            <a className="ilt-content-link" href="/hiit-timer">
              HIIT timer
            </a>{" "}
            may fit better. If you need longer rounds with rest between them,
            use the{" "}
            <a className="ilt-content-link" href="/round-timer">
              round timer
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Tips for using the timer">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Set interval lengths and round count before starting so the active
              display can stay focused on the current phase.
            </li>
            <li>
              Use optional beeps only when they fit the room and will not
              disturb others.
            </li>
            <li>
              Keep the screen in fullscreen mode when the timer needs to be read
              across a room or from a mat, bike, or station.
            </li>
            <li>
              Choose durations that match your own plan or guidance, especially
              if you are modifying the default 20/10 pattern.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Related interval tools">
          <p>
            For flexible work/rest intervals, use the{" "}
            <a className="ilt-content-link" href="/workout-timer">
              workout timer
            </a>
            . For every-minute starts, use the{" "}
            <a className="ilt-content-link" href="/emom-timer">
              EMOM timer
            </a>
            . For simple round and rest structure, use the{" "}
            <a className="ilt-content-link" href="/round-timer">
              round timer
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Tabata timer FAQ">
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              Is this only for 20/10 timing?
            </strong>{" "}
            No. The classic control restores 20 seconds work, 10 seconds rest,
            and 8 rounds, but you can set different work, rest, and round values
            before starting.
          </p>
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              What should I use for longer rounds?
            </strong>{" "}
            Use the round timer when the work periods are longer or when a
            boxing-style or practice-round format fits better than short 20/10
            intervals.
          </p>
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              Can it run silently?
            </strong>{" "}
            Yes. Keep sound off when visual phase changes are enough or when
            beeps would not fit the space.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
