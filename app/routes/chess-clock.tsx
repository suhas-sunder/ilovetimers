// app/routes/chess-clock.tsx
import type { Route } from "./+types/chess-clock";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
} from "~/clients/components/ui/foundation";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/chess-clock";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const PRESETS = [1, 3, 5, 10, 15];

export function meta({}: Route.MetaArgs) {
  const title = "Chess Clock (Two-Player Timer)";
  const description =
    "Run a casual two-player chess clock with presets, custom time, optional increment, move counts, pause, reset, switching, and fullscreen display.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "chess clock",
        "online chess clock",
        "two player timer",
        "blitz chess clock",
        "casual chess timer",
        "board game timer",
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
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function minutesToMs(minutes: number) {
  return Math.round(clamp(minutes, 0.1, 240) * 60 * 1000);
}

function formatClock(ms: number) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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

function ChessClockTool() {
  const [startMinutes, setStartMinutes] = useState(5);
  const [incrementSeconds, setIncrementSeconds] = useState(0);
  const [timesMs, setTimesMs] = useState<[number, number]>(() => [
    minutesToMs(5),
    minutesToMs(5),
  ]);
  const [activePlayer, setActivePlayer] = useState<0 | 1>(0);
  const [moveCounts, setMoveCounts] = useState<[number, number]>([0, 0]);
  const [running, setRunning] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const timeUpPlayer = timesMs[0] <= 0 ? 0 : timesMs[1] <= 0 ? 1 : null;
  const status =
    timeUpPlayer == null
      ? running
        ? `Player ${activePlayer + 1} to move`
        : "Paused"
      : `Player ${timeUpPlayer + 1} time up`;

  useEffect(() => {
    if (!running) return;
    lastTickRef.current = Date.now();
    let frame = 0;

    const tick = () => {
      const now = Date.now();
      const previous = lastTickRef.current ?? now;
      const delta = now - previous;
      lastTickRef.current = now;

      setTimesMs((current) => {
        const next: [number, number] = [...current] as [number, number];
        next[activePlayer] = Math.max(0, next[activePlayer] - delta);
        if (next[activePlayer] <= 0) {
          setRunning(false);
          lastTickRef.current = null;
        }
        return next;
      });

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [activePlayer, running]);

  function applyStartMinutes(minutes: number) {
    const next = clamp(minutes, 0.1, 240);
    setStartMinutes(next);
    setTimesMs([minutesToMs(next), minutesToMs(next)]);
    setActivePlayer(0);
    setMoveCounts([0, 0]);
    setRunning(false);
    lastTickRef.current = null;
  }

  function startPause() {
    if (timeUpPlayer != null) return;
    setRunning((value) => !value);
  }

  function reset() {
    setRunning(false);
    lastTickRef.current = null;
    setTimesMs([minutesToMs(startMinutes), minutesToMs(startMinutes)]);
    setActivePlayer(0);
    setMoveCounts([0, 0]);
  }

  function switchTurn() {
    if (timeUpPlayer != null) return;
    setTimesMs((current) => {
      const next: [number, number] = [...current] as [number, number];
      if (running && incrementSeconds > 0) {
        next[activePlayer] += Math.round(incrementSeconds * 1000);
      }
      return next;
    });
    if (running) {
      setMoveCounts((counts) => {
        const next: [number, number] = [...counts] as [number, number];
        next[activePlayer] += 1;
        return next;
      });
    }
    setActivePlayer((player) => (player === 0 ? 1 : 0));
    lastTickRef.current = Date.now();
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      startPause();
    } else if (key === "t" || event.key === "Enter") {
      switchTurn();
    } else if (key === "r") {
      reset();
    } else if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const playerButtonClass = (player: 0 | 1) =>
    [
      "ilt-focus-ring flex min-h-[11rem] cursor-pointer flex-col items-center justify-center gap-3 bg-[var(--ilt-bg-panel)] px-3 py-6 text-center transition hover:bg-[var(--ilt-bg-hover)] sm:min-h-[14rem] sm:px-6",
      activePlayer === player && timeUpPlayer == null
        ? "text-[var(--ilt-text-primary)]"
        : "text-[var(--ilt-text-secondary)] opacity-80",
    ].join(" ");

  const playerClock = (player: 0 | 1) => (
    <button
      type="button"
      className={playerButtonClass(player)}
      onClick={switchTurn}
      aria-pressed={activePlayer === player}
      aria-label={`Switch after player ${player + 1} move`}
    >
      <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
        Player {player + 1}
      </span>
      <span
        data-primary-display-value={player === activePlayer ? true : undefined}
        className="whitespace-nowrap font-mono text-6xl font-extrabold tracking-widest sm:text-7xl lg:text-8xl"
      >
        {formatClock(timesMs[player])}
      </span>
      <span className="text-sm font-semibold text-[var(--ilt-text-secondary)]">
        {activePlayer === player && timeUpPlayer == null ? "Active turn" : "Waiting"} /{" "}
        {moveCounts[player]} moves
      </span>
    </button>
  );

  return (
    <Card
      cardRef={cardRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={isFs ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFs}
        title="Chess Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={startPause} disabled={timeUpPlayer != null}>
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={switchTurn} disabled={timeUpPlayer != null}>
              Switch
            </Btn>
            <Btn kind="ghost" size="sm" onClick={reset}>
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-list-stack flex h-full flex-col"}>
        <DisplayStage
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-stretch justify-center gap-4 p-3 sm:p-5"
          style={{
            minHeight: isFs ? 0 : 380,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
        >
          <div className="text-center text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {status}
          </div>
          <div className={isFs ? "grid flex-1 gap-3 md:grid-cols-2" : "grid gap-3 md:grid-cols-2"}>
            {playerClock(0)}
            {playerClock(1)}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause} disabled={timeUpPlayer != null}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={switchTurn} disabled={timeUpPlayer != null}>
                Switch turn
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Starting time"
              description="Choose a common casual chess time control or enter a custom starting time below."
            >
              {PRESETS.map((minutes) => (
                <Chip
                  key={minutes}
                  active={startMinutes === minutes}
                  disabled={running}
                  onClick={() => applyStartMinutes(minutes)}
                >
                  {minutes}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Time control"
              description="Increment is added to the player who just moved when you switch turns while the clock is running."
            >
              <SettingRow className="sm:grid-cols-2">
                <Field
                  label="Custom starting minutes"
                  type="number"
                  min={0.1}
                  max={240}
                  step={0.5}
                  value={startMinutes}
                  disabled={running}
                  onChange={(event) => applyStartMinutes(Number(event.currentTarget.value || 0.1))}
                />
                <Field
                  label="Increment seconds per move"
                  type="number"
                  min={0}
                  max={120}
                  step={1}
                  value={incrementSeconds}
                  onChange={(event) =>
                    setIncrementSeconds(clamp(Number(event.currentTarget.value || 0), 0, 120))
                  }
                  hint="Optional Fischer-style increment for casual play."
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / T or Enter switch / R reset / F
              fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ControlGroup className="mx-0 justify-start">
              <Btn kind="solid" onClick={startPause} disabled={timeUpPlayer != null}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={switchTurn} disabled={timeUpPlayer != null}>
                Switch
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap either player clock after a move / Space start-pause / T switch / R reset / F fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function ChessClockPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Chess Clock",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based two-player chess clock for casual games and practice with presets, increment, switching, pause, reset, and fullscreen display.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Chess Clock",
            item: ROUTE_URL,
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
        display={<ChessClockTool />}
        title="Chess Clock"
        description="Run a casual two-player chess clock with large player displays, presets, custom time, optional increment, move counts, and fullscreen mode."
      />

      <SeoBand>
        <ContentSection title="How this chess clock works">
          <p>
            A chess clock gives each player their own remaining time. Start the
            clock, then switch turns after each move by tapping either player
            side or using the switch control.
          </p>
          <p>
            The active player counts down. If increment is enabled, the player
            who just moved receives that many seconds when the turn switches.
            Move counts are shown for quick casual tracking.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            Use this clock for casual chess, blitz practice, rapid games, club
            practice, study games, or board-game turn timing where two players
            need separate countdowns.
          </p>
          <p>
            Official games should follow the rules, equipment, and time
            controls required by their event. This browser clock is meant for
            casual and practice use, not tournament compliance.
          </p>
        </ContentSection>

        <ContentSection title="Settings and controls">
          <p>
            Presets cover common short game lengths. Custom starting minutes
            reset both players to the same time, and the optional increment
            field supports simple Fischer-style practice timing.
          </p>
          <p>
            Fullscreen mode keeps the two player clocks and controls visible
            without placing ad slots inside the active fullscreen target.
          </p>
        </ContentSection>

        <ContentSection title="Related timing tools">
          <p>
            For a single countdown, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>
            . For elapsed practice timing, use the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            . For round/rest timing, use the{" "}
            <a className="ilt-content-link" href="/round-timer">
              round timer
            </a>
            . For several independent task timers, use{" "}
            <a className="ilt-content-link" href="/multiple-timers">
              multiple timers
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Chess clock FAQ">
          <h3>Does this support increment?</h3>
          <p>
            Yes. Enter an increment in seconds. It is added to the player who
            just moved when you switch turns while the clock is running.
          </p>
          <h3>Can I use it for official play?</h3>
          <p>
            Use the clock rules and equipment required by your event. This page
            is designed for browser-based casual games and practice.
          </p>
          <h3>Can I use fullscreen?</h3>
          <p>
            Yes. Fullscreen is useful when the clock is on a shared laptop,
            tablet, or monitor between players.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
