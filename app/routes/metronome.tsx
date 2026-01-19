// app/routes/metronome.tsx
import type { Route } from "./+types/metronome";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Metronome | Tempo Timer (Tap Tempo + Accents)";
  const description =
    "Free online metronome and tempo timer. Set BPM, tap tempo, choose time signature, accents, and subdivisions. Accurate audio scheduling, visual pulse, fullscreen stage, and copy settings.";
  const url = "https://ilovetimers.com/metronome";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "online metronome",
        "tempo timer",
        "metronome online",
        "tap tempo",
        "bpm metronome",
        "metronome bpm",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://ilovetimers.com/og-image.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" },
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

function fmtBpm(bpm: number) {
  return `${Math.round(bpm)} BPM`;
}

/* =========================================================
   UI PRIMITIVES (match your style)
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
}) => (
  <div
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function StatPill({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800">
        {label}
      </div>
      <div className="mt-1 text-base font-extrabold text-amber-950">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs font-semibold text-amber-900/70">
          {hint}
        </div>
      ) : null}
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

  // Keep headroom. Accent is noticeably louder, not just slightly.
  const peak = (accent ? 1.0 : 0.6) * volume;

  // One master gain per tick for consistent envelope
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), when + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
  g.connect(ctx.destination);

  if (mode === "beep") {
    const o = ctx.createOscillator();
    o.type = "sine";
    // Two clearly different tones, no ambiguity
    o.frequency.setValueAtTime(accent ? 1200 : 880, when);
    o.connect(g);
    o.start(when);
    o.stop(when + 0.09);
    return;
  }

  if (mode === "wood") {
    // Short, warm "wood block" using a triangle + lowpass
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

  // mode === "click": bright, sharp click using filtered noise
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

type Subdivision = 1 | 2 | 3 | 4; // quarter/eighth/triplet/sixteenth

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
  const wrapRef = useRef<HTMLDivElement>(null);

  // Visual pulse state (driven by scheduled ticks, not by UI timers)
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

    // Reset phase so bar downbeat is correct on start
    tickIndexRef.current = 0;
    nextTimeRef.current = ctx.currentTime + 0.06;

    runningRef.current = true;
    setIsRunning(true);

    const lookAheadSec = 0.12; // schedule ahead for stability
    const intervalMs = 25; // stable scheduling without RAF throttling issues

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

        // Visual pulse: update every subdivision (so you can see subdivisions),
        // but highlight beat 1 more strongly.
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

    // unlock audio on mobile without starting metronome
    try {
      const ctx = await ensureAudio();
      if (ctx.state === "suspended") await ctx.resume();
    } catch {
      // ignore
    }
  }, [ensureAudio]);

  // Copy settings
  const copyText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Online Metronome");
    lines.push(`BPM: ${Math.round(bpm)}`);
    lines.push(`Time signature: ${beatsPerBar}/4`);
    lines.push(`Subdivision: ${subLabel(subdivision)}`);
    lines.push(`Accent downbeat: ${accentDownbeat ? "On" : "Off"}`);
    lines.push(`Sound: ${mode}`);
    lines.push(`Volume: ${Math.round(volume * 100)}%`);
    lines.push(`Time zone: ${tz}`);
    lines.push("https://ilovetimers.com/metronome");
    return lines.join("\n");
  }, [accentDownbeat, beatsPerBar, bpm, mode, subdivision, tz, volume]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && wrapRef.current) {
      void toggleFullscreen(wrapRef.current);
      return;
    }
    if (k === " " || k === "spacebar" || k === "enter") {
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
  };

  // Fullscreen gets its own stylized shell, like your Morse layout
  const stageAccent =
    pulse.accent && accentDownbeat ? "ring-emerald-400" : "ring-amber-400";
  const stageBg =
    pulse.accent && accentDownbeat ? "bg-emerald-500/15" : "bg-amber-500/20";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Metronome</h2>
          <p className="mt-1 text-base text-slate-700">
            A free <strong>online metronome</strong> and{" "}
            <strong>tempo timer</strong>. Accurate Web Audio scheduling, tap
            tempo, accents, and subdivisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            onClick={copy}
            className="py-2"
            title="Copy settings (C)"
          >
            {copied ? "Copied" : "Copy"}
          </Btn>

          <Btn
            kind="ghost"
            onClick={() => wrapRef.current && toggleFullscreen(wrapRef.current)}
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

      {/* Display */}
      <div
        ref={wrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:block;}

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen [data-shell="normal"]{display:none;}
              [data-fs-container]:fullscreen [data-shell="fullscreen"]{
                display:flex;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                padding:5vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1500px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:20px;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 900 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.18em;
                text-transform:uppercase;
                opacity:.90;
                color: rgba(255,255,255,.92);
              }

              [data-fs-container]:fullscreen .fs-bpm{
                font: 900 clamp(54px, 7.8vw, 120px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.08em;
                color: rgba(255,255,255,.96);
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 700 14px/1.35 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.84;
                color: rgba(255,255,255,.86);
                max-width: 80ch;
              }

              [data-fs-container]:fullscreen .fs-stage{
                width:min(1200px, 96vw);
                border-radius: 22px;
                border: 1px solid rgba(255,255,255,.14);
                background: rgba(255,255,255,.06);
                padding: 26px 22px;
              }

              [data-fs-container]:fullscreen .fs-pulse{
                width:min(980px, 92vw);
                height: min(32vh, 280px);
                border-radius: 22px;
                border: 1px solid rgba(255,255,255,.14);
                background: rgba(255,255,255,.04);
                display:flex;
                align-items:center;
                justify-content:center;
                position:relative;
                overflow:hidden;
              }

              [data-fs-container]:fullscreen .fs-hint{
                position:absolute;
                bottom:14px;
                left:14px;
                right:14px;
                font: 800 12px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.14em;
                text-transform:uppercase;
                opacity:.78;
                color: rgba(255,255,255,.82);
              }

              @keyframes pulsePop{
                0% { transform: scale(.78); opacity:.55; }
                100% { transform: scale(1); opacity:1; }
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div data-shell="normal" className="w-full p-6">
          <div className="w-full max-w-[980px] mx-auto">
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-3">
                <StatPill
                  label="Tempo"
                  value={fmtBpm(bpm)}
                  hint="Arrow keys change BPM"
                />
                <StatPill
                  label="Meter"
                  value={`${beatsPerBar}/4`}
                  hint={accentDownbeat ? "Beat 1 accented" : "No accent"}
                />
                <StatPill
                  label="Subdivision"
                  value={subLabel(subdivision)}
                  hint={isRunning ? "Running" : "Stopped"}
                />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {/* BPM */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                    BPM
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Btn
                      kind="ghost"
                      onClick={() => setBpm((v) => clamp(v - 1, 20, 400))}
                      className="px-3"
                    >
                      -
                    </Btn>
                    <input
                      type="range"
                      min={20}
                      max={400}
                      value={bpm}
                      onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                    <Btn
                      kind="ghost"
                      onClick={() => setBpm((v) => clamp(v + 1, 20, 400))}
                      className="px-3"
                    >
                      +
                    </Btn>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <input
                      type="number"
                      value={bpm}
                      min={20}
                      max={400}
                      onChange={(e) =>
                        setBpm(
                          clamp(parseInt(e.target.value || "120", 10), 20, 400),
                        )
                      }
                      className="w-28 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-extrabold text-amber-950"
                    />
                    <div className="text-xs font-semibold text-amber-900/70">
                      Space starts/stops
                    </div>
                  </div>
                </div>

                {/* Rhythm */}
                <div className="rounded-2xl border border-amber-200 bg-white p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                    Rhythm
                  </div>

                  <div className="mt-3 grid gap-3">
                    <label className="text-xs font-bold text-amber-900/80">
                      Time signature
                    </label>
                    <select
                      value={beatsPerBar}
                      onChange={(e) =>
                        setBeatsPerBar(parseInt(e.target.value, 10))
                      }
                      className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-950"
                    >
                      {TS_OPTIONS.map((o) => (
                        <option key={o.beats} value={o.beats}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <label className="text-xs font-bold text-amber-900/80">
                      Subdivision
                    </label>
                    <select
                      value={subdivision}
                      onChange={(e) =>
                        setSubdivision(
                          parseInt(e.target.value, 10) as Subdivision,
                        )
                      }
                      className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-950"
                    >
                      <option value={1}>Quarter (1)</option>
                      <option value={2}>Eighth (2)</option>
                      <option value={3}>Triplet (3)</option>
                      <option value={4}>Sixteenth (4)</option>
                    </select>

                    <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
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
                <div className="rounded-2xl border border-amber-200 bg-white p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                    Sound
                  </div>

                  <div className="mt-3 grid gap-3">
                    <label className="text-xs font-bold text-amber-900/80">
                      Click type
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as ClickMode)}
                      className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-950"
                    >
                      <option value="click">Click (bright)</option>
                      <option value="wood">Wood (warm)</option>
                      <option value="beep">Beep (tone)</option>
                    </select>

                    <label className="text-xs font-bold text-amber-900/80">
                      Volume
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(volume * 100)}
                        onChange={(e) =>
                          setVolume(
                            clamp(parseInt(e.target.value, 10) / 100, 0, 1),
                          )
                        }
                        className="w-full"
                      />
                      <div className="min-w-[52px] text-right text-xs font-extrabold text-amber-950">
                        {Math.round(volume * 100)}%
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900/80">
                      If your sound still feels the same, you are probably on
                      tiny speakers. Try headphones and switch between Beep and
                      Click.
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual pulse */}
              <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                      Visual pulse
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">
                      Beat <strong>{pulse.beat}</strong> of {beatsPerBar} · Sub{" "}
                      <strong>{pulse.sub}</strong> of {subdivision} ·{" "}
                      {pulse.accent && accentDownbeat ? "Accent" : "Tick"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Btn
                      kind={isRunning ? "ghost" : "solid"}
                      onClick={() => (isRunning ? stop() : void start())}
                      className="px-5 py-3"
                    >
                      {isRunning ? "Stop" : "Start"}
                    </Btn>
                    <Btn
                      kind="ghost"
                      onClick={() => setBpm((v) => clamp(v - 5, 20, 400))}
                    >
                      -5
                    </Btn>
                    <Btn
                      kind="ghost"
                      onClick={() => setBpm((v) => clamp(v + 5, 20, 400))}
                    >
                      +5
                    </Btn>
                  </div>
                </div>

                <div className="mt-5">
                  <div
                    className={`relative mx-auto flex h-32 w-full max-w-[720px] items-center justify-center rounded-2xl border border-amber-200 ${stageBg}`}
                  >
                    <div
                      key={pulse.n}
                      className={`h-16 w-16 rounded-full ring-4 ${stageAccent}`}
                      style={{ animation: "pulsePop 180ms ease-out" }}
                      aria-hidden
                    />
                    <div className="absolute bottom-3 text-xs font-extrabold uppercase tracking-widest text-amber-900/70">
                      Space start/stop · T tap tempo · F fullscreen · C copy
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <div className="text-xs font-extrabold uppercase tracking-wide text-amber-800">
                  Shortcuts
                </div>
                <ul className="mt-2 space-y-1">
                  <li>
                    <strong>Space</strong> or <strong>Enter</strong> =
                    Start/Stop
                  </li>
                  <li>
                    <strong>Arrow Up/Down</strong> = BPM ±1 (hold Shift for ±5)
                  </li>
                  <li>
                    <strong>T</strong> = Tap tempo
                  </li>
                  <li>
                    <strong>F</strong> = Fullscreen
                  </li>
                  <li>
                    <strong>C</strong> = Copy settings
                  </li>
                </ul>
              </div>

              <div className="mt-4 text-center text-xs font-semibold text-slate-600">
                Accuracy note: timing is scheduled on the Web Audio clock.
                Bluetooth speakers can add delay, but the beat interval stays
                consistent.
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Online Metronome</div>

            <div className="fs-bpm">{fmtBpm(bpm)}</div>

            <div className="fs-sub">
              {beatsPerBar}/4 · {subLabel(subdivision)} ·{" "}
              {accentDownbeat ? "Accent beat 1" : "No accent"} · Sound: {mode} ·
              Volume {Math.round(volume * 100)}%
            </div>

            <div className="fs-pulse">
              <div
                key={pulse.n}
                className={`h-20 w-20 rounded-full ring-4 ${
                  pulse.accent && accentDownbeat
                    ? "ring-emerald-400"
                    : "ring-white/70"
                }`}
                style={{ animation: "pulsePop 180ms ease-out" }}
                aria-hidden
              />
              <div className="fs-hint">
                Beat {pulse.beat}/{beatsPerBar} · Sub {pulse.sub}/{subdivision}{" "}
                · Space start/stop · T tap · F fullscreen
              </div>
            </div>

            <div className="fs-stage">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => (isRunning ? stop() : void start())}
                  className={`rounded-2xl px-7 py-4 font-extrabold tracking-widest ${
                    isRunning
                      ? "bg-white/10 text-white hover:bg-white/15"
                      : "bg-emerald-500/20 text-white hover:bg-emerald-500/25"
                  }`}
                  style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
                >
                  {isRunning ? "Stop" : "Start"}
                </button>

                <button
                  type="button"
                  onClick={() => void tapTempo()}
                  className="rounded-2xl bg-white/10 px-6 py-4 font-extrabold text-white hover:bg-white/15"
                  style={{ letterSpacing: ".14em", textTransform: "uppercase" }}
                >
                  Tap tempo
                </button>

                <button
                  type="button"
                  onClick={() => setBpm((v) => clamp(v - 5, 20, 400))}
                  className="rounded-2xl bg-white/10 px-5 py-4 font-extrabold text-white hover:bg-white/15"
                  style={{ letterSpacing: ".14em", textTransform: "uppercase" }}
                >
                  -5
                </button>

                <button
                  type="button"
                  onClick={() => setBpm((v) => clamp(v + 5, 20, 400))}
                  className="rounded-2xl bg-white/10 px-5 py-4 font-extrabold text-white hover:bg-white/15"
                  style={{ letterSpacing: ".14em", textTransform: "uppercase" }}
                >
                  +5
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMode((m) =>
                      m === "click" ? "wood" : m === "wood" ? "beep" : "click",
                    )
                  }
                  className="rounded-2xl bg-white/10 px-6 py-4 font-extrabold text-white hover:bg-white/15"
                  style={{ letterSpacing: ".14em", textTransform: "uppercase" }}
                >
                  Sound: {mode}
                </button>
              </div>

              <div className="mt-4 text-center text-xs font-semibold text-white/80">
                Space start/stop · Arrow keys BPM · T tap tempo · F fullscreen ·
                C copy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/stop · Arrow keys BPM · T tap tempo · F
          fullscreen · C copy
        </div>
        <div className="text-xs text-slate-600">Time zone: {tz}</div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MetronomePage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/metronome";

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
            item: "https://ilovetimers.com/",
          },
          { "@type": "ListItem", position: 2, name: "Metronome", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I use the online metronome?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Set your BPM, press Start, and practice with the clicks. Use Tap tempo to match a song. You can change time signature, subdivision, and downbeat accent.",
            },
          },
          {
            "@type": "Question",
            name: "Is this metronome accurate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The click timing is scheduled on the Web Audio clock, which is designed for stable timing. Bluetooth speakers can add playback delay, but the interval stays consistent.",
            },
          },
          {
            "@type": "Question",
            name: "Why does time signature feel subtle?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Time signature changes the bar length and the accented downbeat. Turn on Accent beat 1 to make the bar boundary obvious, especially in 5/4 or 7/8.",
            },
          },
          {
            "@type": "Question",
            name: "What keyboard shortcuts are supported?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space or Enter starts and stops. Arrow Up or Down changes BPM. T taps tempo, F toggles fullscreen, and C copies your current settings.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Metronome</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Online Metronome
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A free <strong>online metronome</strong> and{" "}
            <strong>tempo timer</strong> with tap tempo, accents, subdivisions,
            and fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <MetronomeCard />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Tap tempo</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Tap a steady beat a few times and the BPM updates. This is the
              fastest way to match a song without guessing.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Accents and bars
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Time signature sets how many beats are in each bar. Turn on Accent
              beat 1 to clearly hear the start of each bar.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Practice in fullscreen
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen uses a dedicated stage with a big pulse and minimal
              controls, so it works well on a second monitor.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Online metronome and tempo timer
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This free <strong>online metronome</strong> keeps a steady beat at
              your chosen BPM. It is also a simple <strong>tempo timer</strong>{" "}
              for practice, drills, and rhythm training.
            </p>

            <p>
              Use <strong>tap tempo</strong> to find BPM quickly, choose a{" "}
              <strong>time signature</strong> to match your music, and add a{" "}
              <strong>downbeat accent</strong> so bar starts are obvious.
              Subdivision adds extra clicks inside each beat.
            </p>

            <p>
              More tools:{" "}
              <Link
                to="/reaction-time-test"
                className="font-semibold hover:underline"
              >
                Reaction Time Test
              </Link>{" "}
              ·{" "}
              <Link
                to="/retro-flip-clock"
                className="font-semibold hover:underline"
              >
                Retro Flip Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Metronome FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why does the sound not play until I click?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Most browsers block audio until a user gesture. Starting,
              stopping, or tapping tempo unlocks audio.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is the beat actually accurate?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Ticks are scheduled using the Web Audio time base. Output
              devices can add delay, especially Bluetooth, but the interval
              stays steady.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is subdivision?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Subdivision controls how many clicks happen within each beat:
              eighths are 2, triplets are 3, and sixteenths are 4.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Space or Enter starts and stops. Arrow keys change BPM. T taps
              tempo, F toggles fullscreen, and C copies settings.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
