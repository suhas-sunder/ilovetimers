// app/routes/online-timer.tsx
import type { Route } from "./+types/online-timer";
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
import HowItWorks from "~/clients/components/online-timer/HowItWorks";
import Disclaimer from "~/clients/components/online-timer/Disclaimer";
import FAQ from "~/clients/components/online-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/online-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/online-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Timer (Free Countdown, Fullscreen)";
  const description =
    "Start a free online countdown timer instantly. Big, clear display with quick presets and fullscreen mode, perfect for classrooms, presentations, and everyday timing.";

  const url = "https://www.ilovetimers.com/online-timer";

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
   ONLINE TIMER TOOL (broad intent = safe default countdown)
========================================================= */
function OnlineTimerCard() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);

  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const remainingRef = useRef<number>(durationMs);
  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );

  const [sound, setSound] = useState(true);
  const [loop, setLoop] = useState(false);
  const [inputStr, setInputStr] = useState("05:00");

  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const stopRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => {
    setInputStr(msToClock(durationMs));
  }, [durationMs]);

  const safeReset = useCallback(
    (to?: number) => {
      const ms = clamp(to ?? durationMs, 0, 24 * 3600 * 1000);
      setDurationMs(ms);
      setRemainingMs(ms);
      remainingRef.current = ms;
      setStatus("idle");
      endTimeRef.current = null;
      stopRaf();
    },
    [durationMs, stopRaf],
  );

  const parseInputToMs = useCallback((str: string) => {
    const raw = str.trim();
    if (!raw) return 0;

    const parts = raw
      .split(":")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const nums = parts.map((p) => Number(p));
    if (nums.some((n) => !Number.isFinite(n) || n < 0)) return 0;

    let ms = 0;

    if (nums.length === 1) {
      // seconds
      ms = nums[0] * 1000;
    } else if (nums.length === 2) {
      // mm:ss
      ms = (nums[0] * 60 + nums[1]) * 1000;
    } else {
      // h:mm:ss (use last 3 parts)
      const s = nums[nums.length - 1] ?? 0;
      const m = nums[nums.length - 2] ?? 0;
      const h = nums[nums.length - 3] ?? 0;
      ms = (h * 3600 + m * 60 + s) * 1000;
    }

    return clamp(ms, 0, 24 * 3600 * 1000);
  }, []);

  const onSet = useCallback(() => {
    const ms = parseInputToMs(inputStr);
    safeReset(ms);
  }, [inputStr, parseInputToMs, safeReset]);

  const onPreset = useCallback(
    (m: number) => {
      safeReset(m * 60 * 1000);
    },
    [safeReset],
  );

  const onStartPause = useCallback(() => {
    if (status === "running") {
      const now = performance.now();
      const rem = Math.max(0, (endTimeRef.current ?? now) - now);
      endTimeRef.current = null;
      stopRaf();
      setRemainingMs(rem);
      remainingRef.current = rem;
      setStatus(rem <= 0 ? "done" : "paused");
      return;
    }

    const base =
      status === "done" ? durationMs : Math.max(0, remainingRef.current);
    const nextRemaining = base <= 0 ? durationMs : base;

    setRemainingMs(nextRemaining);
    remainingRef.current = nextRemaining;
    endTimeRef.current = performance.now() + nextRemaining;
    setStatus("running");
  }, [durationMs, status, stopRaf]);

  const onReset = useCallback(() => {
    safeReset();
  }, [safeReset]);

  useEffect(() => {
    if (status !== "running") return;

    stopRaf();

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endTimeRef.current ?? now) - now);

      setRemainingMs(rem);
      remainingRef.current = rem;

      if (rem <= 0) {
        if (sound) beep();

        if (loop) {
          const nextEnd = performance.now() + durationMs;
          endTimeRef.current = nextEnd;
          setRemainingMs(durationMs);
          remainingRef.current = durationMs;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        endTimeRef.current = null;
        stopRaf();
        setStatus("done");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopRaf();
    };
  }, [status, durationMs, loop, sound, beep, stopRaf]);

  useEffect(() => {
    return () => stopRaf();
  }, [stopRaf]);

  const urgent =
    status === "running" && remainingMs > 0 && remainingMs <= 10_000;

  const statusLabel =
    status === "running"
      ? "Running"
      : status === "paused"
        ? "Paused"
        : status === "done"
          ? "Done"
          : "Ready";

  const shownTime = msToClock(Math.ceil(remainingMs / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, status, durationMs, urgent],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (k === "r") {
      onReset();
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
        title="Online Timer"
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
        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
            <ControlGroup>
              <Btn kind="solid" onClick={onStartPause}>
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

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause · R reset · F fullscreen
            </ShortcutHint>
          </div>
        )}

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
          <span
            ref={timeTextRef}
            className={[
              "pointer-events-none inline-block text-center font-mono font-extrabold",
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

          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-700">
            Countdown · {statusLabel}
          </div>
        </DisplayStage>

        {/* Presets + input (normal only) */}
        {!isFs && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
              <PresetGroup>
                {presets.map((m) => (
                  <Chip
                    key={m}
                    active={
                      durationMs === m * 60 * 1000 && status !== "running"
                    }
                    onClick={() => onPreset(m)}
                  >
                    {m}m
                  </Chip>
                ))}
              </PresetGroup>

              <SettingGroup>
              <SettingRow className="md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Field
                    label="Custom time"
                    inputMode="numeric"
                    value={inputStr}
                    onChange={(e) => {
                      if (status === "running") {
                        // Pause cleanly when editing
                        const now = performance.now();
                        const rem = Math.max(
                          0,
                          (endTimeRef.current ?? now) - now,
                        );
                        endTimeRef.current = null;
                        stopRaf();
                        setRemainingMs(rem);
                        remainingRef.current = rem;
                        setStatus(rem <= 0 ? "done" : "paused");
                      }
                      setInputStr(e.target.value);
                    }}
                    onBlur={onSet}
                    placeholder="mm:ss or ss"
                  />
                  <Btn kind="ghost" onClick={onSet}>
                    Set
                  </Btn>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                  <Toggle label="Loop" checked={loop} onCheckedChange={setLoop} />
                </div>
              </SettingRow>
              </SettingGroup>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="flex items-center gap-2">
              <Toggle
                label="Sound"
                checked={sound}
                onCheckedChange={setSound}
                className="px-3 py-1 text-xs"
              />

              <Toggle
                label="Loop"
                checked={loop}
                onCheckedChange={setLoop}
                className="px-3 py-1 text-xs"
              />

              <div className="ilt-helper-text font-semibold">
                {statusLabel}
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
export default function OnlineTimerPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/online-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Online Timer",
        url,
        description:
          "Start a free online countdown timer instantly with presets, custom time, sound, loop, fullscreen, and keyboard shortcuts.",
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
            name: "Online Timer",
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
        display={<OnlineTimerCard />}
        title="Online Timer"
        description="Start a clear countdown with presets, custom time, sound, loop, and fullscreen mode."
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
