// app/routes/fullscreen-timer.tsx
import type { Route } from "./+types/fullscreen-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  SeoBand,
  SecondaryActionRow,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolHero,
  ToolFrame as Card,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/fullscreen-timer/HowItWorks";
import Disclaimer from "~/clients/components/fullscreen-timer/Disclaimer";
import FAQ from "~/clients/components/fullscreen-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/fullscreen-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/fullscreen-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Fullscreen Timer (Big Countdown for Classrooms & Projectors)";
  const description =
    "Free fullscreen timer with huge digits for projectors and smartboards. Start with presets or set a custom countdown, use keyboard shortcuts, enable optional sound, and loop mode.";

  const url = "https://www.ilovetimers.com/fullscreen-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "fullscreen timer",
        "timer for projector",
        "projector timer",
        "smartboard timer",
        "classroom fullscreen timer",
        "big timer",
        "large countdown timer",
        "online fullscreen countdown timer",
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
   TOOL
========================================================= */
type Status = "idle" | "running" | "paused" | "done";

function parseInputToMs(str: string) {
  const raw = str.trim();
  if (!raw) return 0;

  const parts = raw.split(":").map((p) => p.trim());
  const nums = parts.map((p) => (p === "" ? NaN : Number(p)));

  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return 0;

  let totalSeconds = 0;

  if (nums.length === 1) {
    totalSeconds = nums[0];
  } else if (nums.length === 2) {
    totalSeconds = nums[0] * 60 + nums[1];
  } else {
    const h = nums[0];
    const m = nums[1];
    const s = nums[2];
    totalSeconds = h * 3600 + m * 60 + s;
  }

  const ms = totalSeconds * 1000;
  return clamp(ms, 0, 24 * 3600 * 1000);
}

function FullscreenCountdownCard() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);

  const [sound, setSound] = useState(true);
  const [loop, setLoop] = useState(false);

  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [status, setStatus] = useState<Status>("idle");

  const [inputStr, setInputStr] = useState(msToClock(durationMs));

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(durationMs);

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    setInputStr(msToClock(durationMs));
  }, [durationMs]);

  const shownTime = msToClock(remainingMs);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, status, presets.length],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 72 : 96,
  });

  const urgent =
    status === "running" && remainingMs > 0 && remainingMs <= 10_000;

  const phaseLabel =
    status === "running"
      ? "Running"
      : status === "paused"
        ? "Paused"
        : status === "done"
          ? "Done"
          : "Ready";

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const finish = useCallback(() => {
    if (sound) beep();
    if (loop) {
      const next = durationMs;
      remainingRef.current = next;
      setRemainingMs(next);
      endTimeRef.current = performance.now() + next;
      setStatus("running");
      return;
    }
    setRemainingMs(0);
    remainingRef.current = 0;
    setStatus("done");
    endTimeRef.current = null;
    stopRaf();
  }, [beep, durationMs, loop, sound]);

  const tick = useCallback(() => {
    const now = performance.now();
    const end = endTimeRef.current ?? now;
    const rem = Math.max(0, end - now);

    remainingRef.current = rem;
    setRemainingMs(rem);

    if (rem <= 0) {
      finish();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [finish]);

  useEffect(() => {
    if (status !== "running") {
      stopRaf();
      endTimeRef.current = null;
      return;
    }

    if (!endTimeRef.current) {
      endTimeRef.current = performance.now() + remainingRef.current;
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [status, tick]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function safeReset(to?: number) {
    const ms = to ?? durationMs;
    setDurationMs(ms);
    setRemainingMs(ms);
    remainingRef.current = ms;
    setStatus("idle");
    endTimeRef.current = null;
    stopRaf();
  }

  function onSet() {
    const ms = parseInputToMs(inputStr);
    safeReset(ms);
  }

  const onPreset = (m: number) => safeReset(m * 60 * 1000);

  const onStartPause = () => {
    if (status === "running") {
      // pause, keep remainingRef in sync
      setStatus("paused");
      endTimeRef.current = null;
      stopRaf();
      return;
    }

    if (status === "done") {
      remainingRef.current = durationMs;
      setRemainingMs(durationMs);
      endTimeRef.current = performance.now() + durationMs;
      setStatus("running");
      return;
    }

    if (remainingRef.current <= 0) {
      remainingRef.current = durationMs;
      setRemainingMs(durationMs);
    }

    endTimeRef.current = performance.now() + remainingRef.current;
    setStatus("running");
  };

  const onReset = () => safeReset();

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (k === "r") {
      onReset();
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (e.key === "Escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const requestFs = async () => {
    if (cardRef.current) {
      await void fullscreen.toggle();
      window.setTimeout(() => cardRef.current?.focus({ preventScroll: true }), 50);
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
        title="Fullscreen Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={onStartPause} className="py-1 text-sm">
              {status === "running"
                ? "Pause"
                : status === "done"
                  ? "Restart"
                  : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={onReset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "order-1 timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            urgent ? "bg-amber-50" : "border-slate-200",
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
            if (isFs) onStartPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {phaseLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              urgent ? "text-slate-950" : "text-slate-950",
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

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <div className="flex flex-col gap-3">
              <ControlGroup>
                <Btn onClick={onStartPause}>
                  {status === "running"
                    ? "Pause"
                    : status === "done"
                      ? "Restart"
                      : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={onReset}>
                  Reset
                </Btn>
              </ControlGroup>

              <ShortcutHint>
                Shortcuts: Space start/pause / R reset / F fullscreen / Esc exit
              </ShortcutHint>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <PresetGroup
                title="Fullscreen timer presets"
                description="Pick a room-display duration or set a custom countdown below."
              >
                {presets.map((m) => (
                  <Chip
                    key={m}
                    active={
                      durationMs === m * 60 * 1000 && status !== "running"
                    }
                    onClick={() => onPreset(m)}
                    disabled={status === "running"}
                  >
                    {m}m
                  </Chip>
                ))}
              </PresetGroup>

              <SettingGroup
                title="Timer settings"
                description="Set a custom duration, then choose optional sound and loop behavior."
              >
                <SettingRow className="lg:grid-cols-[minmax(0,1fr)_minmax(16rem,auto)]">
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Field
                      label="Custom time"
                      inputMode="numeric"
                      value={inputStr}
                      onChange={(e) => {
                        if (status === "running") setStatus("paused");
                        setInputStr(e.target.value);
                      }}
                      onBlur={onSet}
                      placeholder="mm:ss or ss"
                    />
                    <Btn kind="ghost" onClick={onSet}>
                      Set
                    </Btn>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    <Toggle
                      label="Sound"
                      checked={sound}
                      onCheckedChange={setSound}
                    />
                    <Toggle
                      label="Loop"
                      checked={loop}
                      onCheckedChange={setLoop}
                    />
                  </div>
                </SettingRow>
              </SettingGroup>
            </div>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={requestFs} className="py-2">
                Fullscreen
              </Btn>
            </SecondaryActionRow>
          </div>
        )}

        {/* Fullscreen bottom bar */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / R reset / F
              fullscreen / Esc exit
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
export default function FullscreenTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/fullscreen-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Fullscreen Timer",
        url,
        description:
          "Free fullscreen timer with huge digits for projectors, smartboards, and classrooms. Presets, custom countdown, sound, loop, fullscreen, and keyboard shortcuts.",
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
            name: "Fullscreen Timer",
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
        display={<FullscreenCountdownCard />}
        title="Fullscreen Timer"
        description="Use a big countdown built for classrooms, projectors, smartboards, meetings, and shared screens."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Need a fullscreen clock instead of a countdown? Use the{" "}
            <a className="ilt-content-link" href="/smooth-second-hand-clock">
              smooth second hand clock
            </a>{" "}
            for an analog face, or the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>{" "}
            for a large digital display with milliseconds.
          </p>
        </ContentSection>
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}
