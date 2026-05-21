// app/routes/tea-timer.tsx
import type { Route } from "./+types/tea-timer";
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
  ToolHero,
  ToolFrame as Card,
  Toggle,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Tea Timer (Steep Times for Green, Black & Herbal Teas)";
  const description =
    "Brew better tea with a simple tea timer. One-click steep times for green, black, oolong, white, and herbal teas with a clear countdown.";

  const url = "https://www.ilovetimers.com/tea-timer";

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

// WebAudio beep (same style as other pages)
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
   TEA TIMER CARD
========================================================= */
type TeaKey =
  | "green"
  | "black"
  | "oolong"
  | "white"
  | "herbal"
  | "chai"
  | "matcha"
  | "rooibos"
  | "pu_erh";

type TeaPreset = {
  key: TeaKey;
  label: string;
  minutes: number;
  seconds: number;
  note: string;
};

const TEA_PRESETS: TeaPreset[] = [
  {
    key: "green",
    label: "Green tea",
    minutes: 2,
    seconds: 0,
    note: "2:00 (lighter, avoid bitterness)",
  },
  {
    key: "black",
    label: "Black tea",
    minutes: 4,
    seconds: 0,
    note: "4:00 (stronger, classic mug)",
  },
  {
    key: "oolong",
    label: "Oolong",
    minutes: 3,
    seconds: 0,
    note: "3:00 (balanced)",
  },
  {
    key: "white",
    label: "White tea",
    minutes: 3,
    seconds: 0,
    note: "3:00 (gentle)",
  },
  {
    key: "herbal",
    label: "Herbal",
    minutes: 5,
    seconds: 0,
    note: "5:00 (bigger leaves, longer steep)",
  },
  {
    key: "chai",
    label: "Chai",
    minutes: 5,
    seconds: 0,
    note: "5:00 (spiced, bold)",
  },
  {
    key: "rooibos",
    label: "Rooibos",
    minutes: 5,
    seconds: 0,
    note: "5:00 (caffeine-free, forgiving)",
  },
  {
    key: "pu_erh",
    label: "Pu-erh",
    minutes: 4,
    seconds: 0,
    note: "4:00 (earthy)",
  },
  {
    key: "matcha",
    label: "Matcha",
    minutes: 0,
    seconds: 0,
    note: "No steep: whisk and sip",
  },
];

function TeaTimerCard() {
  const beep = useBeep();

  const [preset, setPreset] = useState<TeaKey>("green");
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);

  const initialMs = useMemo(
    () => (minutes * 60 + seconds) * 1000,
    [minutes, seconds],
  );

  const [remaining, setRemaining] = useState<number>(initialMs);
  const remainingRef = useRef<number>(initialMs);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const lastShownRef = useRef<string>("");

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const isMatcha = preset === "matcha";
  const disableStart = isMatcha || minutes * 60 + seconds <= 0;

  // Apply preset
  useEffect(() => {
    const p = TEA_PRESETS.find((x) => x.key === preset);
    if (!p) return;

    setMinutes(p.minutes);
    setSeconds(p.seconds);

    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    const ms = (p.minutes * 60 + p.seconds) * 1000;
    remainingRef.current = ms;
    setRemaining(ms);
    lastShownRef.current = msToClock(Math.ceil(ms / 1000) * 1000);
  }, [preset]);

  // When custom time changes, stop and reset to that duration
  useEffect(() => {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    remainingRef.current = initialMs;
    setRemaining(initialMs);
    lastShownRef.current = msToClock(Math.ceil(initialMs / 1000) * 1000);
  }, [initialMs]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        remainingRef.current = 0;
        setRemaining(0);
        lastShownRef.current = "0:00";
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        stopRaf();
        if (sound) beep(660, 220);
        return;
      }

      const shown = msToClock(Math.ceil(rem / 1000) * 1000);
      if (shown !== lastShownRef.current) {
        lastShownRef.current = shown;
        remainingRef.current = rem;
        setRemaining(rem);
      } else {
        remainingRef.current = rem;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    remainingRef.current = initialMs;
    setRemaining(initialMs);
    lastShownRef.current = msToClock(Math.ceil(initialMs / 1000) * 1000);
  }

  function startPause() {
    if (disableStart) return;

    if (!running && sound) beep(0, 1);

    setRunning((r) => {
      const next = !r;

      if (next) {
        endRef.current = performance.now() + remainingRef.current;
      } else {
        const now = performance.now();
        const rem = Math.max(0, (endRef.current ?? now) - now);
        remainingRef.current = rem;
        setRemaining(rem);
        endRef.current = null;
      }

      lastBeepSecondRef.current = null;
      return next;
    });
  }

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = useMemo(
    () => msToClock(Math.ceil(remaining / 1000) * 1000),
    [remaining],
  );

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, urgent, running, minutes, seconds, preset],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const presetNote = useMemo(() => {
    const p = TEA_PRESETS.find((x) => x.key === preset);
    return p?.note ?? "";
  }, [preset]);

  const statusLabel = running ? "Running" : remaining > 0 ? "Ready" : "Done";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f") {
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
        title="Tea Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
            <Toggle
              label="Final beeps"
              checked={finalCountdownBeeps}
              onCheckedChange={setFinalCountdownBeeps}
              disabled={!sound}
            />
            <Btn
              kind="solid"
              onClick={startPause}
              className="py-1 text-sm"
              disabled={disableStart}
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={reset}
              className="py-1 text-sm"
              disabled={isMatcha}
            >
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "order-1 timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            urgent
              ? "bg-amber-50"
              : "border-slate-200 bg-slate-50",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold tracking-widest",
              isFs ? "tracking-wide sm:tracking-widest" : "",
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
        {!isFs && (
          <>
            <ControlGroup>
              <Btn
                kind="solid"
                onClick={startPause}
                disabled={disableStart}
                className="min-w-[92px]"
              >
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset} disabled={isMatcha}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Tea presets">
              {TEA_PRESETS.map((p) => (
                <Chip
                  key={p.key}
                  active={p.key === preset}
                  onClick={() => setPreset(p.key)}
                >
                  {p.label}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup title="Settings">
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <Field
                  label="Minutes"
                  type="number"
                  min={0}
                  max={60}
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 0), 0, 60))
                  }
                  disabled={isMatcha}
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
                  disabled={isMatcha}
                />

                <div className="flex flex-wrap items-end gap-3">
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
              <span className="ilt-content-label">Preset note</span>
              <span className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                {isMatcha
                  ? "Matcha is usually whisked, not steeped."
                  : presetNote}
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause · R reset · F fullscreen
            </ShortcutHint>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {urgent ? "Final seconds" : statusLabel}
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
export default function TeaTimerPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/tea-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tea Timer",
        url,
        description:
          "A tea steep timer with pre-filled steep times for green tea, black tea, oolong, herbal tea, and more, plus fullscreen and optional sound.",
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
            name: "Tea Timer",
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
        display={<TeaTimerCard />}
        title="Tea Timer"
        description="Choose a tea preset or custom steep time, then keep the countdown clean, large, and easy to see."
      />

      <SeoBand>
        <ContentSection title="How this tea timer works">
          <p>
            Tea Timer keeps steep timing simple: choose a tea preset or enter
            custom minutes and seconds, then start the countdown while the cup or
            pot steeps. The display stays large and visible, with optional sound
            and fullscreen controls available below the timer.
          </p>
          <p>
            Presets cover common green, black, oolong, white, herbal, chai,
            rooibos, pu-erh, and matcha starting points. Use them as convenient
            defaults, then adjust the time when the tea label, water
            temperature, leaf amount, vessel size, or personal taste points to a
            shorter or longer steep.
          </p>
        </ContentSection>
        <ContentSection title="Tea examples and custom steep times">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Use a shorter green tea or white tea steep when bitterness is a
              concern.
            </li>
            <li>
              Use a black tea, chai, oolong, or herbal preset when you want a
              quick starting point for a common cup.
            </li>
            <li>
              Use custom timing for matcha prep, a second infusion, loose-leaf
              instructions, or a tea vendor's specific recommendation.
            </li>
            <li>
              Keep the timer visible on a second screen or in fullscreen when
              you are preparing food at the same time.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Taste and timing limits">
          <p>
            A timer helps prevent accidental over-steeping, but it cannot choose
            the right flavor for every tea. Tea amount, water temperature,
            mug or pot size, steeping method, and preference all matter, so treat
            presets as starting points rather than promises.
          </p>
          <p>
            Like other browser timers, this page depends on the device staying
            awake and the tab remaining available. If sound is enabled, browser
            audio permissions and device volume still apply.
          </p>
        </ContentSection>
        <ContentSection title="Related kitchen timers">
          <p>
            For general cooking steps, use the{" "}
            <a className="ilt-content-link" href="/cooking-timer">
              cooking timer
            </a>
            . For boiled eggs, use the{" "}
            <a className="ilt-content-link" href="/egg-timer">
              egg timer
            </a>
            . For plain custom minutes and seconds, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Tea timer FAQ">
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              Can I use this for loose-leaf tea?
            </strong>{" "}
            Yes. Pick the closest tea type or set a custom steep time based on
            the tea label, vendor note, or your usual preference.
          </p>
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              Does it choose water temperature?
            </strong>{" "}
            No. The timer only tracks steep duration. Water temperature, leaf
            amount, and steeping method are separate choices.
          </p>
          <p>
            <strong className="text-[var(--ilt-text-primary)]">
              Can I time a second infusion?
            </strong>{" "}
            Yes. Use the custom minutes and seconds fields when a later infusion
            needs a different time than the first steep.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}
