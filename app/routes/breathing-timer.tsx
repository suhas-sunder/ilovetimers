// app/routes/breathing-timer.tsx
import type { Route } from "./+types/breathing-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

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

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
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

function useIsFullscreen(targetRef: React.RefObject<HTMLElement | null>) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const el = targetRef.current;
      setIsFs(!!el && document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  return isFs;
}

/**
 * Fit a single-line text into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const initialFontPx = (() => {
    const sample = deps.find(
      (dep) => typeof dep === "string" || typeof dep === "number",
    );
    const charCount = Math.max(
      1,
      String(sample ?? "00:00").replace(/\s/g, "").length,
    );
    const preferredVw = Math.min(34, Math.max(8, 84 / (charCount * 0.62)));
    return `clamp(${minPx}px, ${preferredVw.toFixed(2)}vw, ${maxPx}px)`;
  })();

  const [fontPx, setFontPx] = useState<number | string>(initialFontPx);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf: number | null = null;

    const compute = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;

      const rect = c.getBoundingClientRect();
      const availW = Math.max(0, rect.width - paddingAllowancePx);
      const availH = Math.max(0, rect.height - paddingAllowancePx);

      if (availW <= 0 || availH <= 0) return;

      const originalFontSize = (t as HTMLElement).style.fontSize;

      const fits = (px: number) => {
        (t as HTMLElement).style.fontSize = `${px}px`;
        const tr = t.getBoundingClientRect();
        return tr.width <= availW && tr.height <= availH;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      (t as HTMLElement).style.fontSize = originalFontSize;
      setFontPx(`${best}px`);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    compute();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontPx;
}

/* =========================================================
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
  cardRef,
  isFullscreen,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      isFullscreen
        ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
        : "timer-tool-card h-full rounded-2xl bg-white p-4 sm:p-6",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

const Btn = ({
  kind = "solid",
  children,
  onClick,
  className = "",
  disabled,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer timer-control-shadow rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const Chip = ({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? "bg-slate-900 text-white hover:bg-slate-800"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  left,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onExit: () => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
          {left}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Btn kind="ghost" onClick={onExit} className="py-1 text-sm">
            Exit (Esc)
          </Btn>
        </div>
      </div>
    </div>
  );
}

function FullscreenBottomBar({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
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
  const isFs = useIsFullscreen(cardRef);

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
      toggleFullscreen(cardRef.current);
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
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
                className="accent-amber-500"
              />
              Sound (S)
            </label>
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

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="accent-amber-500"
                />
                Sound cues (S)
              </label>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center font-mono font-extrabold",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          {!isFs && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Btn onClick={startPause}>
                {running ? "Pause" : completed ? "Restart" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={hardResetToReady}>
                Reset
              </Btn>
            </div>
          )}

          <div className="mt-5 flex flex-col items-center gap-2 text-center">
            <div className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
              {phaseLabel}
            </div>

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

            <div className="text-sm font-semibold text-slate-700">
              {cycleText}
            </div>
          </div>

          <div className="mt-5 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Presets
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
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
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Presets are locked while running.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Shortcuts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Space start/pause · R reset · F fullscreen · S sound
              </div>
              <div className="mt-2 text-xs text-slate-600">
                In fullscreen, tap the timer to start or pause.
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-3 text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">
                Timing
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Inhale (sec)
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={inhale}
                    disabled={running}
                    onChange={(e) =>
                      setInhale(clamp(Number(e.target.value || 1), 1, 30))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900">
                  Hold (sec)
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={hold1}
                    disabled={running}
                    onChange={(e) =>
                      setHold1(clamp(Number(e.target.value || 0), 0, 30))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900">
                  Exhale (sec)
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={exhale}
                    disabled={running}
                    onChange={(e) =>
                      setExhale(clamp(Number(e.target.value || 1), 1, 40))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900">
                  Hold (sec)
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={hold2}
                    disabled={running}
                    onChange={(e) =>
                      setHold2(clamp(Number(e.target.value || 0), 0, 30))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                Set holds to 0 to skip them.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">
                Cycles
              </div>

              <label className="mt-3 block text-sm font-semibold text-slate-900">
                Cycles (0 = continuous)
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={cyclesTarget}
                  disabled={running}
                  onChange={(e) =>
                    setCyclesTarget(clamp(Number(e.target.value || 0), 0, 60))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>

              <div className="mt-3 flex items-center gap-2">
                <Btn
                  kind={running ? "solid" : "ghost"}
                  onClick={startPause}
                  className="w-full"
                >
                  {running ? "Pause" : completed ? "Restart" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={hardResetToReady} className="w-full">
                  Reset
                </Btn>
              </div>
            </div>
          </div>
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
                Tap timer to start/pause · Space · R reset · S sound
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
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Minimal header */}
      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Breathing Timer (Guided Cycles)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Pick a preset or set inhale, hold, and exhale seconds. Run guided
            cycles with a big countdown and fullscreen mode.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <BreathingTimerCard />
        </div>

        {/* Breadcrumb (intentionally bottom) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Breathing Timer</span>
        </p>
      </section>
    </main>
  );
}
