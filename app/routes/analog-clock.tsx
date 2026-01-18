// app/routes/analog-clock.tsx
import type { Route } from "./+types/analog-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import RelatedSites from "~/clients/components/navigation/RelatedSites";
import TimerMenuLinks from "~/clients/components/navigation/TimerMenuLinks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Analog Clock | Simple Clock Face (Fullscreen, Clean, Readable)";
  const description =
    "Free analog clock with a clean clock face. Fullscreen mode, optional seconds hand, smooth motion, and a big readable design for classrooms, offices, and wall displays.";
  const url = "https://ilovetimers.com/analog-clock";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "analog clock",
        "clock face",
        "analog clock online",
        "clock with seconds hand",
        "analog clock fullscreen",
        "wall clock online",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `https://ilovetimers.com/og-image.jpg` },
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function calcAngles(d: Date, smooth: boolean) {
  const ms = d.getMilliseconds();
  const sec = d.getSeconds() + (smooth ? ms / 1000 : 0);
  const min = d.getMinutes() + sec / 60;
  const hour = (d.getHours() % 12) + min / 60;

  // Degrees from 12 o'clock
  const secDeg = sec * 6; // 360/60
  const minDeg = min * 6;
  const hourDeg = hour * 30; // 360/12

  return { hourDeg, minDeg, secDeg };
}

/* =========================================================
   UI PRIMITIVES (same style as Home/Pomodoro)
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
   ANALOG CLOCK CARD
========================================================= */
function AnalogClockCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [showSecondsHand, setShowSecondsHand] = useState(true);
  const [smoothSeconds, setSmoothSeconds] = useState(true);

  const tz = useMemo(() => safeTimeZone(), []);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth: RAF for silky second hand.
    // Non-smooth: 1s interval is fine.
    let raf = 0;
    let interval = 0;

    const tickRaf = () => {
      setNow(new Date());
      raf = requestAnimationFrame(tickRaf);
    };

    if (showSecondsHand && smoothSeconds) {
      raf = requestAnimationFrame(tickRaf);
      return () => cancelAnimationFrame(raf);
    }

    interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, [showSecondsHand, smoothSeconds]);

  const { hourDeg, minDeg, secDeg } = useMemo(
    () => calcAngles(now, showSecondsHand && smoothSeconds),
    [now, showSecondsHand, smoothSeconds],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (e.key.toLowerCase() === "s") {
      setShowSecondsHand((v) => !v);
    } else if (e.key.toLowerCase() === "m") {
      setSmoothSeconds((v) => !v);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">Analog Clock</h2>
          <p className="mt-1 text-base text-slate-700">
            Clean analog clock face with fullscreen. Toggle seconds hand and smooth motion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSecondsHand}
              onChange={(e) => setShowSecondsHand(e.target.checked)}
            />
            Seconds hand
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={smoothSeconds}
              onChange={(e) => setSmoothSeconds(e.target.checked)}
              disabled={!showSecondsHand}
            />
            Smooth
          </label>

          <Btn
            kind="ghost"
            onClick={() => displayWrapRef.current && toggleFullscreen(displayWrapRef.current)}
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 420 }}
        aria-live="off"
      >
        {/* Fullscreen CSS: keep your existing pattern */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

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
                padding:4vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1400px, 100%);
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 420 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 text-center">
              Local analog clock · {tz}
            </div>

            <div className="w-full max-w-[560px]">
              <ClockFaceSvg
                hourDeg={hourDeg}
                minDeg={minDeg}
                secDeg={secDeg}
                showSecondsHand={showSecondsHand}
                dark={false}
              />
            </div>

            <div className="text-xs font-semibold text-amber-800 text-center">
              Shortcuts: F fullscreen · S seconds hand · M smooth
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Analog Clock</div>

            <div className="w-full" style={{ maxWidth: 900 }}>
              <ClockFaceSvg
                hourDeg={hourDeg}
                minDeg={minDeg}
                secDeg={secDeg}
                showSecondsHand={showSecondsHand}
                dark
              />
            </div>

            <div className="fs-help">F fullscreen · S seconds hand · M smooth</div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: F fullscreen · S seconds hand · M smooth
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   CLOCK SVG (fixes the styling issues)
   - Perfect centering
   - Consistent ticks
   - Clean hands with correct pivots
   - Looks good in normal and fullscreen
========================================================= */
function ClockFaceSvg({
  hourDeg,
  minDeg,
  secDeg,
  showSecondsHand,
  dark,
}: {
  hourDeg: number;
  minDeg: number;
  secDeg: number;
  showSecondsHand: boolean;
  dark: boolean;
}) {
  // 0..100 viewBox keeps math simple.
  const cx = 50;
  const cy = 50;

  const faceFill = dark ? "#0b0b0c" : "#fff7ed";
  const ringStroke = dark ? "rgba(255,255,255,.22)" : "rgba(180,83,9,.40)";
  const innerStroke = dark ? "rgba(255,255,255,.10)" : "rgba(180,83,9,.18)";

  const tickMajor = dark ? "rgba(255,255,255,.78)" : "rgba(120,53,15,.70)";
  const tickMinor = dark ? "rgba(255,255,255,.32)" : "rgba(120,53,15,.35)";

  const handHour = dark ? "rgba(255,255,255,.92)" : "rgba(69,26,3,.92)";
  const handMin = dark ? "rgba(255,255,255,.88)" : "rgba(69,26,3,.88)";
  const handSec = dark ? "rgba(255,255,255,.70)" : "rgba(159,18,57,.88)";

  const centerFill = dark ? "rgba(255,255,255,.92)" : "rgba(69,26,3,.92)";

  // ring geometry
  const outerR = 48;
  const innerR = 45;

  // hand geometry
  // Pivots at (50,50). Hands extend up from pivot.
  const hourLen = 22;
  const minLen = 32;
  const secLen = 36;

  const hourW = 4.8;
  const minW = 3.8;
  const secW = 2.0;

  // small tail behind center for nicer look
  const hourTail = 4;
  const minTail = 5;
  const secTail = 8;

  const handShadow = dark ? "none" : "drop-shadow(0 2px 3px rgba(0,0,0,.12))";

  const ticks = useMemo(() => {
    const out: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      w: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      const isMajor = i % 5 === 0;
      const ang = (i * 6 * Math.PI) / 180; // radians, 0 at 12? This is 0 at 3 o'clock.
      // Convert so 0 is at 12 o'clock: subtract 90 degrees.
      const a = ang - Math.PI / 2;

      const rOuter = 44.2;
      const rInner = isMajor ? 38.0 : 40.2;

      const x1 = cx + Math.cos(a) * rInner;
      const y1 = cy + Math.sin(a) * rInner;
      const x2 = cx + Math.cos(a) * rOuter;
      const y2 = cy + Math.sin(a) * rOuter;

      out.push({
        x1,
        y1,
        x2,
        y2,
        stroke: isMajor ? tickMajor : tickMinor,
        w: isMajor ? 2.6 : 1.6,
      });
    }
    return out;
  }, [tickMajor, tickMinor]);

  // Optional subtle numerals for better aesthetics and usability.
  // Keep minimal: 12, 3, 6, 9 only.
  const numerals = useMemo(() => {
    const items = [
      { t: "12", deg: 0 },
      { t: "3", deg: 90 },
      { t: "6", deg: 180 },
      { t: "9", deg: 270 },
    ];

    return items.map((it) => {
      const a = ((it.deg - 90) * Math.PI) / 180;
      const r = 31.0;
      return {
        t: it.t,
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r + 1.2,
      };
    });
  }, []);

  const numeralFill = dark ? "rgba(255,255,255,.78)" : "rgba(120,53,15,.75)";

  return (
    <div className="aspect-square w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Analog clock">
        {/* Face */}
        <circle cx={cx} cy={cy} r={outerR} fill={faceFill} stroke={ringStroke} strokeWidth="1.8" />
        <circle cx={cx} cy={cy} r={innerR} fill="transparent" stroke={innerStroke} strokeWidth="1.2" />

        {/* Ticks */}
        {ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.stroke}
            strokeWidth={t.w}
            strokeLinecap="round"
          />
        ))}

        {/* Numerals (subtle) */}
        {numerals.map((n) => (
          <text
            key={n.t}
            x={n.x}
            y={n.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fill: numeralFill,
              fontWeight: 900,
              fontSize: "6px",
              letterSpacing: "0.06em",
              userSelect: "none",
            }}
          >
            {n.t}
          </text>
        ))}

        {/* Hands group: rotate around center. Use 0 deg at 12. */}
        <g style={{ filter: handShadow }}>
          {/* Hour hand */}
          <g transform={`rotate(${hourDeg} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy + hourTail}
              x2={cx}
              y2={cy - hourLen}
              stroke={handHour}
              strokeWidth={hourW}
              strokeLinecap="round"
            />
          </g>

          {/* Minute hand */}
          <g transform={`rotate(${minDeg} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy + minTail}
              x2={cx}
              y2={cy - minLen}
              stroke={handMin}
              strokeWidth={minW}
              strokeLinecap="round"
            />
          </g>

          {/* Seconds hand */}
          {showSecondsHand ? (
            <g transform={`rotate(${secDeg} ${cx} ${cy})`}>
              <line
                x1={cx}
                y1={cy + secTail}
                x2={cx}
                y2={cy - secLen}
                stroke={handSec}
                strokeWidth={secW}
                strokeLinecap="round"
              />
              {/* seconds counterweight dot */}
              <circle cx={cx} cy={cy + 12} r="1.6" fill={handSec} opacity={dark ? 0.7 : 0.9} />
            </g>
          ) : null}
        </g>

        {/* Center cap */}
        <circle cx={cx} cy={cy} r="2.4" fill={centerFill} />
        <circle cx={cx} cy={cy} r="0.9" fill={dark ? "rgba(0,0,0,.65)" : "rgba(255,255,255,.65)"} />
      </svg>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function AnalogClockPage({ loaderData: { nowISO } }: Route.ComponentProps) {
  const url = "https://ilovetimers.com/analog-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Analog Clock",
        url,
        description:
          "Clean analog clock with fullscreen mode, optional seconds hand, and smooth motion for wall displays and classrooms.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://ilovetimers.com/" },
          { "@type": "ListItem", position: 2, name: "Analog Clock", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does this analog clock show my local time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The analog clock uses your device’s local time and time zone settings.",
            },
          },
          {
            "@type": "Question",
            name: "Can I hide the seconds hand?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toggle Seconds hand off or press S while the card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "What is smooth motion?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Smooth motion makes the seconds hand sweep continuously instead of ticking once per second.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the card is focused to show the clock on a clean dark screen.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-amber-400 bg-amber-500/30/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            ⏱ i💛Timers
          </Link>
          <nav className="hidden gap-4 text-sm font-medium sm:flex">
            <Link to="/countdown-timer" className="hover:underline">
              Countdown
            </Link>
            <Link to="/stopwatch" className="hover:underline">
              Stopwatch
            </Link>
            <Link to="/pomodoro-timer" className="hover:underline">
              Pomodoro
            </Link>
            <Link to="/hiit-timer" className="hover:underline">
              HIIT
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Analog Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Analog Clock</h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>analog clock</strong> with a readable clock face, seconds hand, smooth motion, and fullscreen mode.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <AnalogClockCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Perfect for wall displays</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use fullscreen on a TV, projector, or second monitor for a clean wall-clock style display.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Seconds hand and smooth sweep</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Toggle the seconds hand, and enable smooth motion if you want a continuous sweep instead of a tick.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Keyboard shortcuts</h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>F</strong> = Fullscreen
              </li>
              <li>
                <strong>S</strong> = Seconds hand
              </li>
              <li>
                <strong>M</strong> = Smooth motion
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Menu Links */}
      <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">Free online analog clock</h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This page is a simple <strong>analog clock</strong> with a clean clock face. It uses your device’s local time,
              so it matches the time zone settings on your phone or computer.
            </p>

            <p>
              Want a digital clock instead? Try{" "}
              <Link to="/current-local-time" className="font-semibold hover:underline">
                Current Local Time
              </Link>
              . Need a reference standard? Try{" "}
              <Link to="/utc-clock" className="font-semibold hover:underline">
                UTC Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Analog Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">Does this analog clock show my local time?</summary>
            <div className="px-5 pb-4 text-amber-800">Yes. It uses your device’s local time and time zone settings.</div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">Can I hide the seconds hand?</summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle <strong>Seconds hand</strong> off (or press <strong>S</strong>).
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">What is smooth motion?</summary>
            <div className="px-5 pb-4 text-amber-800">
              Smooth motion makes the seconds hand sweep continuously instead of ticking once per second.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">How do I use fullscreen?</summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong> while the card is focused.
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-400 bg-amber-500/30/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © 2026 i💛Timers - free countdown, stopwatch, Pomodoro, HIIT, and clock tools
        </div>
      </footer>
    </main>
  );
}
