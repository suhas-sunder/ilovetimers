// app/routes/metronome.tsx
import type { Route } from "./+types/metronome";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Metronome (Tap Tempo + Accurate BPM)";
  const description =
    "Practice with a clean, accurate online metronome. Set BPM, tap your tempo, and keep time with a clear visual and audio pulse for musicians.";

  const url = "https://www.ilovetimers.com/metronome";

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

function useIsFullscreen(targetRef: RefObject<HTMLElement | null>) {
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

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
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
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const [fontPx, setFontPx] = useState<number>(minPx);

  useEffect(() => {
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
      setFontPx(best);
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

    schedule();

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
   UI PRIMITIVES (match your updated style)
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
        : "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
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
  title,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
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
   AUDIO CLICK (distinct sounds + accurate scheduling)
========================================================= */
type ClickMode = "click" | "wood" | "beep";

function playTick(opts: {
  ctx: AudioContext;
  when: number;
  mode: ClickMode;
  accent: boolean;
  volume: number; // 0..1
}) {
  const { ctx, when, mode, accent } = opts;
  const volume = clamp(opts.volume, 0, 1);

  const peak = (accent ? 1.0 : 0.6) * volume;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), when + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
  g.connect(ctx.destination);

  if (mode === "beep") {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(accent ? 1200 : 880, when);
    o.connect(g);
    o.start(when);
    o.stop(when + 0.09);
    return;
  }

  if (mode === "wood") {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(accent ? 520 : 420, when);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1600, when);
    lp.Q.setValueAtTime(0.8, when);

    o.connect(lp).connect(g);
    o.start(when);
    o.stop(when + 0.09);
    return;
  }

  const buffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * 0.03),
    ctx.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const decay = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * decay;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(accent ? 2600 : 2200, when);
  hp.Q.setValueAtTime(0.9, when);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(accent ? 12000 : 9000, when);
  lp.Q.setValueAtTime(0.5, when);

  src.connect(hp).connect(lp).connect(g);
  src.start(when);
  src.stop(when + 0.04);
}

/* =========================================================
   METRONOME CARD
========================================================= */
const TS_OPTIONS = [
  { beats: 4, label: "4/4" },
  { beats: 3, label: "3/4" },
  { beats: 2, label: "2/4" },
  { beats: 5, label: "5/4" },
  { beats: 6, label: "6/8 (6)" },
  { beats: 7, label: "7/8 (7)" },
] as const;

type Subdivision = 1 | 2 | 3 | 4;

function subLabel(s: Subdivision) {
  if (s === 1) return "Quarter";
  if (s === 2) return "Eighth";
  if (s === 3) return "Triplet";
  return "Sixteenth";
}

type Settings = {
  bpm: number;
  beatsPerBar: number;
  subdivision: Subdivision;
  accentDownbeat: boolean;
  mode: ClickMode;
  volume: number; // 0..1
};

function MetronomeCard() {
  const [bpm, setBpm] = useState(120);
  const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
  const [subdivision, setSubdivision] = useState<Subdivision>(1);
  const [accentDownbeat, setAccentDownbeat] = useState(true);
  const [mode, setMode] = useState<ClickMode>("click");
  const [volume, setVolume] = useState(0.7);

  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  // Display fitting
  const displayBoxRef = useRef<HTMLDivElement>(null);
  const bpmTextRef = useRef<HTMLSpanElement>(null);

  // Visual pulse state (driven by scheduled ticks)
  const [pulse, setPulse] = useState<{
    n: number;
    beat: number; // 1..beatsPerBar
    sub: number; // 1..subdivision
    accent: boolean;
  }>({ n: 0, beat: 1, sub: 1, accent: true });

  // Audio + scheduler refs
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextTimeRef = useRef<number>(0);
  const tickIndexRef = useRef<number>(0); // counts subdivisions
  const runningRef = useRef(false);

  // Tap tempo
  const tapRef = useRef<number[]>([]);
  const lastTapRef = useRef<number>(0);

  // Always read current settings via a ref so changes apply instantly.
  const settingsRef = useRef<Settings>({
    bpm,
    beatsPerBar,
    subdivision,
    accentDownbeat,
    mode,
    volume,
  });

  useEffect(() => {
    settingsRef.current = {
      bpm,
      beatsPerBar,
      subdivision,
      accentDownbeat,
      mode,
      volume,
    };
  }, [bpm, beatsPerBar, subdivision, accentDownbeat, mode, volume]);

  const ensureAudio = useCallback(async () => {
    if (audioRef.current) return audioRef.current;
    const Ctx = (window.AudioContext ||
      (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctx();
    audioRef.current = ctx;
    return ctx;
  }, []);

  const stopScheduler = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    stopScheduler();
  }, [stopScheduler]);

  const start = useCallback(async () => {
    if (isRunning) return;

    const ctx = await ensureAudio();
    try {
      if (ctx.state === "suspended") await ctx.resume();
    } catch {
      // ignore
    }

    tickIndexRef.current = 0;
    nextTimeRef.current = ctx.currentTime + 0.06;
    runningRef.current = true;
    setIsRunning(true);

    const lookAheadSec = 0.12;
    const intervalMs = 25;

    timerRef.current = window.setInterval(() => {
      if (!runningRef.current) return;
      if (!audioRef.current) return;

      const s = settingsRef.current;

      const bpmSafe = clamp(s.bpm, 20, 400);
      const beatsSafe = Math.max(1, Math.round(s.beatsPerBar));
      const subSafe = clamp(s.subdivision, 1, 4) as Subdivision;

      const secPerBeat = 60 / bpmSafe;
      const secPerSub = secPerBeat / subSafe;

      const now = audioRef.current.currentTime;

      while (nextTimeRef.current < now + lookAheadSec) {
        const tick = tickIndexRef.current;

        const subIndex = tick % subSafe; // 0..sub-1
        const beatIndex = Math.floor(tick / subSafe) % beatsSafe; // 0..beats-1

        const isSubDownbeat = subIndex === 0;
        const isBarDownbeat = isSubDownbeat && beatIndex === 0;
        const accent = Boolean(s.accentDownbeat && isBarDownbeat);

        playTick({
          ctx: audioRef.current,
          when: nextTimeRef.current,
          mode: s.mode,
          accent,
          volume: s.volume,
        });

        setPulse((p) => ({
          n: p.n + 1,
          beat: beatIndex + 1,
          sub: subIndex + 1,
          accent,
        }));

        tickIndexRef.current += 1;
        nextTimeRef.current += secPerSub;
      }
    }, intervalMs);
  }, [ensureAudio, isRunning]);

  // Clean up
  useEffect(() => {
    return () => {
      stopScheduler();
      try {
        audioRef.current?.close?.();
      } catch {
        // ignore
      }
      audioRef.current = null;
    };
  }, [stopScheduler]);

  // Tap tempo (updates BPM based on last few taps)
  const tapTempo = useCallback(async () => {
    const now = performance.now();
    const last = lastTapRef.current;
    lastTapRef.current = now;

    if (last && now - last > 2000) tapRef.current = [];
    tapRef.current.push(now);
    if (tapRef.current.length > 8) tapRef.current.shift();

    if (tapRef.current.length >= 4) {
      const times = tapRef.current;
      const intervals: number[] = [];
      for (let i = 1; i < times.length; i++)
        intervals.push(times[i] - times[i - 1]);

      const cleaned = intervals.filter((ms) => ms >= 180 && ms <= 2000);
      if (cleaned.length >= 3) {
        const avg = cleaned.reduce((a, b) => a + b, 0) / cleaned.length;
        const next = clamp(60000 / avg, 20, 400);
        setBpm(Math.round(next));
      }
    }

    try {
      const ctx = await ensureAudio();
      if (ctx.state === "suspended") await ctx.resume();
    } catch {
      // ignore
    }
  }, [ensureAudio]);

  const bpmInt = clamp(Math.round(bpm), 20, 400);
  const bpmBigText = `${bpmInt}`;

  const statusLabel = isRunning ? "Running" : "Stopped";

  // Copy settings
  const copyText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Online Metronome");
    lines.push(`BPM: ${bpmInt}`);
    lines.push(`Time signature: ${beatsPerBar}/4`);
    lines.push(`Subdivision: ${subLabel(subdivision)}`);
    lines.push(`Accent downbeat: ${accentDownbeat ? "On" : "Off"}`);
    lines.push(`Sound: ${mode}`);
    lines.push(`Volume: ${Math.round(volume * 100)}%`);
    lines.push(`Time zone: ${tz}`);
    lines.push("https://www.ilovetimers.com/metronome");
    return lines.join("\n");
  }, [accentDownbeat, beatsPerBar, bpmInt, mode, subdivision, tz, volume]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: bpmTextRef,
    deps: [bpmBigText, isFs, isRunning, beatsPerBar, subdivision],
    minPx: 72,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 64 : 72,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      if (isRunning) stop();
      else void start();
      return;
    }

    if (k === "enter") {
      e.preventDefault();
      if (isRunning) stop();
      else void start();
      return;
    }

    if (k === "arrowup") {
      e.preventDefault();
      setBpm((v) => clamp(v + (e.shiftKey ? 5 : 1), 20, 400));
      return;
    }

    if (k === "arrowdown") {
      e.preventDefault();
      setBpm((v) => clamp(v - (e.shiftKey ? 5 : 1), 20, 400));
      return;
    }

    if (k === "t") {
      e.preventDefault();
      void tapTempo();
      return;
    }

    if (k === "c") {
      e.preventDefault();
      void copy();
      return;
    }

    if (k === "f" && cardRef.current) {
      void toggleFullscreen(cardRef.current);
      return;
    }

    if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const pulseRing =
    pulse.accent && accentDownbeat ? "ring-emerald-400" : "ring-amber-400";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Metronome"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={isRunning ? "ghost" : "solid"}
              onClick={() => (isRunning ? stop() : void start())}
              className="py-1 text-sm"
              title="Start/Stop (Space)"
            >
              {isRunning ? "Stop" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => void tapTempo()}
              className="py-1 text-sm"
              title="Tap tempo (T)"
            >
              Tap
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setBpm((v) => clamp(v - 5, 20, 400))}
              className="py-1 text-sm"
              title="BPM -5"
            >
              -5
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setBpm((v) => clamp(v + 5, 20, 400))}
              className="py-1 text-sm"
              title="BPM +5"
            >
              +5
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Online Metronome (Tap Tempo + Accurate BPM)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Set BPM, tap tempo, choose time signature and subdivisions, and
                practice with a clear visual and audio pulse.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Btn kind="ghost" onClick={copy} className="py-2" title="Copy (C)">
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => void tapTempo()}
                className="py-2"
                title="Tap tempo (T)"
              >
                Tap tempo
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => cardRef.current && toggleFullscreen(cardRef.current)}
                className="py-2"
                title="Fullscreen (F)"
              >
                Fullscreen
              </Btn>
              <Btn
                kind={isRunning ? "ghost" : "solid"}
                onClick={() => (isRunning ? stop() : void start())}
                className="py-2"
                title="Start/Stop (Space)"
              >
                {isRunning ? "Stop" : "Start"}
              </Btn>
            </div>
          </div>
        )}

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {/* Tempo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Tempo
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Btn
                  kind="ghost"
                  onClick={() => setBpm((v) => clamp(v - 1, 20, 400))}
                  className="px-3"
                  title="BPM -1"
                >
                  -
                </Btn>

                <input
                  type="range"
                  min={20}
                  max={400}
                  value={bpmInt}
                  onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                  className="w-full"
                  aria-label="BPM slider"
                />

                <Btn
                  kind="ghost"
                  onClick={() => setBpm((v) => clamp(v + 1, 20, 400))}
                  className="px-3"
                  title="BPM +1"
                >
                  +
                </Btn>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <input
                  type="number"
                  value={bpmInt}
                  min={20}
                  max={400}
                  onChange={(e) =>
                    setBpm(clamp(parseInt(e.target.value || "120", 10), 20, 400))
                  }
                  className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-900"
                  aria-label="BPM number"
                />

                <div className="text-xs font-semibold text-slate-600">
                  Arrow keys BPM (Shift ±5)
                </div>
              </div>
            </div>

            {/* Rhythm */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Rhythm
              </div>

              <div className="mt-3 grid gap-3">
                <label className="text-xs font-bold text-slate-700">
                  Time signature
                </label>
                <select
                  value={beatsPerBar}
                  onChange={(e) => setBeatsPerBar(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900"
                >
                  {TS_OPTIONS.map((o) => (
                    <option key={o.beats} value={o.beats}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <label className="text-xs font-bold text-slate-700">
                  Subdivision
                </label>
                <select
                  value={subdivision}
                  onChange={(e) =>
                    setSubdivision(parseInt(e.target.value, 10) as Subdivision)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900"
                >
                  <option value={1}>Quarter (1)</option>
                  <option value={2}>Eighth (2)</option>
                  <option value={3}>Triplet (3)</option>
                  <option value={4}>Sixteenth (4)</option>
                </select>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={accentDownbeat}
                    onChange={(e) => setAccentDownbeat(e.target.checked)}
                  />
                  Accent beat 1
                </label>
              </div>
            </div>

            {/* Sound */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Sound
              </div>

              <div className="mt-3 grid gap-3">
                <label className="text-xs font-bold text-slate-700">
                  Click type
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ClickMode)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900"
                >
                  <option value="click">Click (bright)</option>
                  <option value="wood">Wood (warm)</option>
                  <option value="beep">Beep (tone)</option>
                </select>

                <label className="text-xs font-bold text-slate-700">Volume</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(e) =>
                      setVolume(clamp(parseInt(e.target.value, 10) / 100, 0, 1))
                    }
                    className="w-full"
                    aria-label="Volume slider"
                  />
                  <div className="min-w-[52px] text-right text-xs font-extrabold text-slate-900">
                    {Math.round(volume * 100)}%
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                  If the sounds feel similar on tiny speakers, try headphones and
                  switch between Beep and Click.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) {
              if (isRunning) stop();
              else void start();
            }
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or stop" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <span
              ref={bpmTextRef}
              className={[
                "inline-block text-center font-mono font-extrabold",
                isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              ].join(" ")}
              style={{
                fontSize: `${fitFontPx}px`,
                lineHeight: "1",
                transform: "translateZ(0)",
              }}
            >
              {bpmBigText}
            </span>
            <span className="text-sm font-extrabold uppercase tracking-widest text-slate-600">
              BPM
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div
              key={pulse.n}
              className={`h-16 w-16 rounded-full ring-4 ${pulseRing}`}
              style={{ animation: "pulsePop 180ms ease-out" }}
              aria-hidden
            />
            <div className="text-sm font-semibold text-slate-700">
              Beat <strong>{pulse.beat}</strong> / {beatsPerBar} · Sub{" "}
              <strong>{pulse.sub}</strong> / {subdivision} ·{" "}
              {pulse.accent && accentDownbeat ? "Accent" : "Tick"}
            </div>
          </div>

          {/* Fullscreen hint overlay */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Settings
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      {beatsPerBar}/4
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      {subLabel(subdivision)}
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Sound: {mode}
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Vol {Math.round(volume * 100)}%
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Stop
                </div>
              </div>
            </div>
          )}

          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes pulsePop{
                  0% { transform: scale(.82); opacity:.55; }
                  100% { transform: scale(1); opacity:1; }
                }
              `,
            }}
          />
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap display to start/stop · Space start/stop · T tap · Arrow keys
              BPM · F fullscreen · C copy
            </div>
            <div className="text-xs font-semibold text-slate-700">
              Time zone: {tz}
            </div>
          </div>
        </FullscreenBottomBar>

        {/* Footer row (normal only) */}
        {!isFs && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space/Enter start/stop · Arrow keys BPM · T tap · F
              fullscreen · C copy
            </div>
            <div className="text-xs text-slate-600">Time zone: {tz}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MetronomePage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/metronome";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Online Metronome",
        url,
        description:
          "Online metronome and tempo timer with accurate audio scheduling, BPM control, tap tempo, time signatures, accents, subdivisions, and fullscreen.",
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
          { "@type": "ListItem", position: 2, name: "Metronome", item: url },
        ],
      },
    ],
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <MetronomeCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Metronome</span>
        </p>

        {/* Loader data is available if you need it later; keeping to avoid unused loader changes */}
        <span className="sr-only" aria-hidden>
          {nowISO}
        </span>
      </section>
    </main>
  );
}
