// app/routes/bpm-tapper.tsx
import type { Route } from "./+types/bpm-tapper";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Tap BPM | Instant BPM Counter and Tempo Tapper";
  const description =
    "Tap to find BPM instantly. Simple tempo tapper and BPM counter that measures beats per minute as you tap. Auto-resets after pauses, supports fullscreen, and lets you copy the BPM.";
  const url = "https://ilovetimers.com/bpm-tapper";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "tap bpm",
        "bpm counter",
        "tap tempo",
        "tempo tapper",
        "tempo finder",
        "beats per minute",
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

function median(nums: number[]) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function fmtBpm(bpm: number | null) {
  return bpm == null ? "--" : String(bpm);
}

/* =========================================================
   UI PRIMITIVES
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   STAR WAVE (largest in center, grows to sides, resets at edges)
========================================================= */
function StarWave({
  tick,
  maxStars = 23,
  colorClass = "text-amber-500",
}: {
  tick: number;
  maxStars?: number;
  colorClass?: string;
}) {
  const count = ((tick % maxStars) + 1) | 0;
  const center = Math.floor((count - 1) / 2);

  return (
    <div className="mt-3 flex items-center justify-center gap-1" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const dist = Math.abs(i - center);
        const scale = Math.max(0.34, 1 - dist * 0.12);
        const opacity = Math.max(0.22, 1 - dist * 0.11);
        return (
          <span
            key={i}
            className={`inline-block ${colorClass}`}
            style={{
              transform: `scale(${scale})`,
              opacity,
              lineHeight: 1,
              userSelect: "none",
              WebkitUserSelect: "none",
              fontSize: 22,
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

/* =========================================================
   BPM TAPPER
========================================================= */
function BpmTapperCard() {
  const fsRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<number | null>(null);

  const [taps, setTaps] = useState<number[]>([]);
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const MAX_TAPS = 20;
  const SESSION_IDLE_MS = 6000;

  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const endSession = useCallback(() => {
    setTaps([]);
    setActive(false);
    setTick(0);
    setCopied(false);
    clearIdle();
  }, [clearIdle]);

  const armIdle = useCallback(() => {
    clearIdle();
    idleTimerRef.current = window.setTimeout(() => {
      endSession();
    }, SESSION_IDLE_MS);
  }, [clearIdle, endSession]);

  const registerTap = useCallback(() => {
    const now = performance.now();

    setTaps((prev) => {
      const base = active ? prev : [];
      return [...base, now].slice(-MAX_TAPS);
    });

    setTick((t) => t + 1);
    setActive(true);
    armIdle();
  }, [active, armIdle]);

  const intervals = useMemo(() => {
    if (taps.length < 2) return [];
    const out: number[] = [];
    for (let i = 1; i < taps.length; i++) {
      const d = taps[i] - taps[i - 1];
      if (d >= 120 && d <= 2000) out.push(d);
    }
    return out;
  }, [taps]);

  const bpm = useMemo(() => {
    if (intervals.length < 2) return null;
    const ms = median(intervals);
    if (!ms) return null;
    const val = 60000 / ms;
    if (!Number.isFinite(val)) return null;
    return clamp(Math.round(val), 1, 999);
  }, [intervals]);

  const stability = useMemo(() => {
    if (intervals.length < 3) return null;
    const a = intervals.reduce((s, x) => s + x, 0) / intervals.length;
    const v =
      intervals.reduce((acc, x) => acc + (x - a) * (x - a), 0) /
      (intervals.length - 1);
    const sd = Math.sqrt(v);
    if (sd < 18) return "Very steady";
    if (sd < 35) return "Steady";
    if (sd < 60) return "A bit wobbly";
    return "Wobbly";
  }, [intervals]);

  const copy = useCallback(async () => {
    if (!bpm) return;
    try {
      await navigator.clipboard.writeText(
        `Tap BPM\nTempo: ${bpm} BPM\nTaps: ${taps.length}\nIntervals used: ${intervals.length}\nStability: ${stability ?? "n/a"}\nhttps://ilovetimers.com/bpm-tapper`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [bpm, taps.length, intervals.length, stability]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    onFs();
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearIdle();
    };
  }, [clearIdle]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    const k = e.key.toLowerCase();

    // IMPORTANT: no Space/Enter tapping (tap-only tool)
    if (k === "r") {
      endSession();
      return;
    }
    if (k === "c") {
      void copy();
      return;
    }
    if (k === "f" && fsRef.current) {
      toggleFullscreen(fsRef.current);
      return;
    }
  };

  const onStagePointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement | null;
    const isControl = !!t?.closest(
      "button, a, input, textarea, select, details, summary, label",
    );
    if (isControl) return;

    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    registerTap();
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Tap BPM</h2>
          <p className="mt-1 text-base text-slate-700">
            Tap anywhere to find tempo. Auto-resets after 6s idle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Btn kind="ghost" onClick={copy} disabled={!bpm}>
            {copied ? "Copied" : "Copy"}
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => fsRef.current && toggleFullscreen(fsRef.current)}
          >
            Fullscreen
          </Btn>
          <Btn kind="ghost" onClick={endSession}>
            Reset
          </Btn>
        </div>
      </div>

      <div
        ref={fsRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
          minHeight: 360,
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container]{
                user-select:none;
                -webkit-user-select:none;
                -ms-user-select:none;
                touch-action:manipulation;
              }
              [data-fs-container] *{
                -webkit-tap-highlight-color: transparent;
              }

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0 !important;
                border-radius:0 !important;
                background:#0b0b0c;
                color:#ffffff;
                display:flex;
                align-items:center;
                justify-content:center;
              }

              [data-fs-container]:fullscreen .panelWrap{
                width:100%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:6vh 4vw;
              }

              [data-fs-container]:fullscreen .panel{
                width:min(1100px, 96vw);
                border:1px solid rgba(255,255,255,.14);
                border-radius:28px;
                background:
                  radial-gradient(1200px 700px at 50% 10%, rgba(255,255,255,.08), transparent 60%),
                  linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
                box-shadow: 0 30px 90px rgba(0,0,0,.55);
                padding: clamp(18px, 4vw, 36px);
              }

              [data-fs-container]:fullscreen .kicker{ color: rgba(255,255,255,.78) !important; }
              [data-fs-container]:fullscreen .bpm{ color: rgba(255,255,255,.96) !important; }
              [data-fs-container]:fullscreen .sub{ color: rgba(255,255,255,.82) !important; }
              [data-fs-container]:fullscreen .meta{ color: rgba(255,255,255,.72) !important; }
              [data-fs-container]:fullscreen .btnGhost{
                border-color: rgba(255,255,255,.16) !important;
                background: rgba(255,255,255,.08) !important;
                color: rgba(255,255,255,.92) !important;
              }
              [data-fs-container]:fullscreen .btnGhost:hover{
                background: rgba(255,255,255,.12) !important;
              }
              [data-fs-container]:fullscreen .stars{ color: rgba(255,255,255,.92) !important; }
            `,
          }}
        />

        <div
          className="w-full h-full"
          onPointerDownCapture={onStagePointerDownCapture}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="panelWrap mx-auto flex h-full w-full items-center justify-center p-6">
            <div className="panel w-full max-w-[980px] rounded-2xl border border-amber-200 bg-white p-6 shadow-sm text-center">
              <div className="kicker text-xs font-extrabold uppercase tracking-widest text-amber-800">
                {active ? "Keep tapping" : "Tap anywhere to start"}
              </div>

              <div className="bpm mt-4 font-mono text-7xl font-extrabold tracking-widest text-amber-950 sm:text-8xl">
                {fmtBpm(bpm)}
              </div>

              <div className="sub mt-2 text-sm font-semibold text-slate-600">
                {bpm ? "BPM" : "Waiting for taps"}
              </div>

              <div className="stars">
                {active ? <StarWave tick={tick} maxStars={23} /> : null}
              </div>

              <div className="meta mt-4 text-xs font-semibold text-slate-500">
                Taps: {taps.length}
                {" · "}Intervals used: {intervals.length}
                {stability ? ` · ${stability}` : ""}
                {" · "}Auto-reset after 6s idle
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="btnGhost cursor-pointer rounded-lg border border-amber-200 bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void copy()}
                  disabled={!bpm}
                >
                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  className="btnGhost cursor-pointer rounded-lg border border-amber-200 bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400"
                  onClick={endSession}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="btnGhost cursor-pointer rounded-lg border border-amber-200 bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400"
                  onClick={() =>
                    fsRef.current && toggleFullscreen(fsRef.current)
                  }
                >
                  {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                </button>
              </div>

              <div className="meta mt-4 text-xs font-semibold text-slate-600">
                Shortcuts: F fullscreen · R reset · C copy
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BpmTapperPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/bpm-tapper";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tap BPM",
        url,
        description:
          "Tap BPM counter and tempo tapper. Tap anywhere to estimate BPM. Auto-resets after inactivity and supports fullscreen.",
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
          { "@type": "ListItem", position: 2, name: "Tap BPM", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I use the tap BPM counter?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Tap anywhere on the tool in time with the beat. After a few taps, the BPM reading stabilizes.",
            },
          },
          {
            "@type": "Question",
            name: "Why does the session reset after I stop tapping?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "If you stop for about 6 seconds, the session ends so your next tap starts a fresh measurement.",
            },
          },
          {
            "@type": "Question",
            name: "How many taps do I need for accuracy?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Aim for 6 to 10 steady taps for a stable BPM. More taps can help if your timing varies.",
            },
          },
          {
            "@type": "Question",
            name: "Does fullscreen change anything?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Fullscreen is a high-contrast black, white, and grey view for easy reading on a second monitor or projector.",
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
            / <span className="text-amber-950">Tap BPM</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Tap BPM Counter
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A free <strong>tap bpm</strong> tool, <strong>bpm counter</strong>,
            and <strong>tempo tapper</strong>. Tap anywhere to find tempo.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <BpmTapperCard />

        {/* SEO Section */}
        <section className="mx-auto max-w-7xl px-0 pb-4">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-amber-950">
              Tap BPM, BPM counter, and tempo tapper
            </h2>

            <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
              <p>
                This <strong>tap bpm</strong> tool is a simple way to estimate
                tempo when you do not have a metronome or DAW nearby. It works
                as a <strong>bpm counter</strong> and{" "}
                <strong>tempo tapper</strong>: tap in time with a beat and the
                page calculates an estimated BPM from the timing between taps.
              </p>

              <p>
                For a stable result, tap steadily for at least 6 to 10 taps. The
                calculation uses recent intervals to reduce random variation. If
                you pause for a few seconds, the session ends and the next tap
                starts fresh from zero so you do not mix tempos.
              </p>

              <p>
                Fullscreen uses a high-contrast black and white style for easy
                reading on stage, on a second monitor, or on a projector.
              </p>

              <p>
                More tools:{" "}
                <Link to="/metronome" className="font-semibold hover:underline">
                  Online Metronome
                </Link>{" "}
                ·{" "}
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
        <section id="faq" className="mx-auto max-w-7xl px-0 pb-2">
          <h2 className="text-2xl font-bold">Tap BPM FAQ</h2>
          <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
            <details>
              <summary className="cursor-pointer px-5 py-4 font-medium">
                How do I use the tap BPM counter?
              </summary>
              <div className="px-5 pb-4 text-amber-800">
                Tap anywhere on the tool in time with the beat. After a few
                taps, the BPM reading stabilizes.
              </div>
            </details>

            <details>
              <summary className="cursor-pointer px-5 py-4 font-medium">
                What does “Taps” mean?
              </summary>
              <div className="px-5 pb-4 text-amber-800">
                Taps is the number of times you tapped in the current session.
                Intervals used is the number of tap-to-tap gaps used to
                calculate BPM.
              </div>
            </details>

            <details>
              <summary className="cursor-pointer px-5 py-4 font-medium">
                Why does it reset after inactivity?
              </summary>
              <div className="px-5 pb-4 text-amber-800">
                If you stop for about 6 seconds, the session ends so your next
                tap starts a new measurement from zero.
              </div>
            </details>

            <details>
              <summary className="cursor-pointer px-5 py-4 font-medium">
                How many taps do I need for accuracy?
              </summary>
              <div className="px-5 pb-4 text-amber-800">
                Aim for 6 to 10 steady taps for a stable BPM. More taps helps if
                your timing varies.
              </div>
            </details>
          </div>
        </section>
      </section>
    </main>
  );
}
