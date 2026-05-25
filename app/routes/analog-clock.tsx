// app/routes/analog-clock.tsx
import type { Route } from "./+types/analog-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Button,
  ContentSection,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import Disclaimer from "~/clients/components/analog-clock/Disclaimer";
import FAQ from "~/clients/components/analog-clock/FAQ";
import HowItWorks from "~/clients/components/analog-clock/HowItWorks";
import KeyboardShortcuts from "~/clients/components/analog-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/analog-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Analog Clock (Fullscreen Clock Face + Seconds Hand)";
  const description =
    "Free online analog clock with a clean, readable face. Go fullscreen, toggle the seconds hand, and display a smooth wall clock for classrooms or offices.";

  const url = "https://www.ilovetimers.com/analog-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "analog clock",
        "analog clock online",
        "fullscreen analog clock",
        "clock face online",
        "analog wall clock",
        "clock with seconds hand",
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
   ANALOG CLOCK CARD
========================================================= */
function AnalogClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));
  const [showSecondsHand, setShowSecondsHand] = useState(true);
  const [smoothSeconds, setSmoothSeconds] = useState(true);

  const tz = useMemo(() => safeTimeZone(), []);
  const cardRef = useRef<HTMLDivElement>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

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

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "s") {
      setShowSecondsHand((v) => !v);
    } else if (k === "m") {
      setSmoothSeconds((v) => !v);
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  return (
    <ToolFrame
      frameRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Analog Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSecondsHand((v) => !v)}
            >
              {showSecondsHand ? "Hide seconds" : "Show seconds"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSmoothSeconds((v) => !v)}
              disabled={!showSecondsHand}
            >
              {smoothSeconds ? "Smooth" : "Tick"}
            </Button>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-specialty-clock-stack flex h-full flex-col"}>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="timer-display-surface mt-4 overflow-hidden text-slate-950"
        style={{ minHeight: 420 }}
        aria-live="off"
      >
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
                background:#ffffff;
                color:#0f172a;
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
          className="h-full w-full items-start justify-center p-6"
          style={{ minHeight: 420 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="w-full max-w-[680px]">
              <ClockFaceSvg
                hourDeg={hourDeg}
                minDeg={minDeg}
                secDeg={secDeg}
                showSecondsHand={showSecondsHand}
                dark={false}
              />
            </div>

            <div className="text-center text-xs font-bold uppercase tracking-wide text-slate-600">
              Local analog clock - {tz}
            </div>

          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <button
            type="button"
            className="fs-exit"
            onClick={() => void fullscreen.exit()}
          >
            Exit (Esc)
          </button>
          <div className="fs-inner">
            <div className="fs-label">Analog Clock</div>

            <div className="w-full" style={{ maxWidth: 900 }}>
              <ClockFaceSvg
                hourDeg={hourDeg}
                minDeg={minDeg}
                secDeg={secDeg}
                showSecondsHand={showSecondsHand}
                dark={false}
              />
            </div>

            <div className="fs-help">
              F fullscreen · S seconds hand · M smooth
            </div>
          </div>
        </div>
      </div>

      {!isFs ? (
        <>
          <SettingGroup title="Clock settings">
            <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
              <Toggle
                label="Seconds hand"
                checked={showSecondsHand}
                onCheckedChange={setShowSecondsHand}
              />
              <Toggle
                label="Smooth"
                checked={smoothSeconds}
                onCheckedChange={setSmoothSeconds}
                disabled={!showSecondsHand}
              />
            </SettingRow>
          </SettingGroup>

          <SecondaryActionRow>
            <Button variant="secondary" onClick={() => void fullscreen.toggle()}>
              Fullscreen
            </Button>
          </SecondaryActionRow>

          <ShortcutHint>
            Shortcuts: F fullscreen, S seconds hand, M smooth
          </ShortcutHint>
        </>
      ) : null}

      {/* Footer hint */}
      <div className="hidden">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900">
          Shortcuts: F fullscreen · S seconds hand · M smooth
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>
      <FullscreenBottomBar show={isFs}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-600 sm:text-sm">
            F fullscreen - S seconds hand - M smooth - Esc exit
          </div>
          <div className="text-xs font-semibold text-slate-700">{tz}</div>
        </div>
      </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

/* =========================================================
   CLOCK SVG
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
  const stableCoord = (value: number) => Number(value.toFixed(4));
  const stableDeg = (value: number) => value.toFixed(3);

  const faceFill = dark ? "#0b0b0c" : "#f8fafc"; // slate-50-ish
  const ringStroke = dark ? "rgba(255,255,255,.22)" : "rgba(15,23,42,.18)"; // slate-900 alpha
  const innerStroke = dark ? "rgba(255,255,255,.10)" : "rgba(15,23,42,.10)";

  const tickMajor = dark ? "rgba(255,255,255,.78)" : "rgba(30,41,59,.70)";
  const tickMinor = dark ? "rgba(255,255,255,.32)" : "rgba(30,41,59,.30)";

  const handHour = dark ? "rgba(255,255,255,.92)" : "rgba(15,23,42,.92)";
  const handMin = dark ? "rgba(255,255,255,.88)" : "rgba(15,23,42,.86)";
  const handSec = dark ? "rgba(255,255,255,.70)" : "rgba(159,18,57,.88)";

  const centerFill = dark ? "rgba(255,255,255,.92)" : "rgba(15,23,42,.92)";

  // ring geometry
  const outerR = 48;
  const innerR = 45;

  // hand geometry
  const hourLen = 22;
  const minLen = 32;
  const secLen = 36;

  const hourW = 4.8;
  const minW = 3.8;
  const secW = 2.0;

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
      const ang = (i * 6 * Math.PI) / 180;
      const a = ang - Math.PI / 2;

      const rOuter = 44.2;
      const rInner = isMajor ? 38.0 : 40.2;

      const x1 = stableCoord(cx + Math.cos(a) * rInner);
      const y1 = stableCoord(cy + Math.sin(a) * rInner);
      const x2 = stableCoord(cx + Math.cos(a) * rOuter);
      const y2 = stableCoord(cy + Math.sin(a) * rOuter);

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
        x: stableCoord(cx + Math.cos(a) * r),
        y: stableCoord(cy + Math.sin(a) * r + 1.2),
      };
    });
  }, []);

  const numeralFill = dark ? "rgba(255,255,255,.78)" : "rgba(30,41,59,.70)";

  return (
    <div className="aspect-square w-full">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        role="img"
        aria-label="Analog clock"
      >
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill={faceFill}
          stroke={ringStroke}
          strokeWidth="1.8"
        />
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="transparent"
          stroke={innerStroke}
          strokeWidth="1.2"
        />

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

        <g style={{ filter: handShadow }}>
          <g transform={`rotate(${stableDeg(hourDeg)} ${cx} ${cy})`}>
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

          <g transform={`rotate(${stableDeg(minDeg)} ${cx} ${cy})`}>
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

          {showSecondsHand ? (
            <g transform={`rotate(${stableDeg(secDeg)} ${cx} ${cy})`}>
              <line
                x1={cx}
                y1={cy + secTail}
                x2={cx}
                y2={cy - secLen}
                stroke={handSec}
                strokeWidth={secW}
                strokeLinecap="round"
              />
              <circle
                cx={cx}
                cy={cy + 12}
                r="1.6"
                fill={handSec}
                opacity={dark ? 0.7 : 0.9}
              />
            </g>
          ) : null}
        </g>

        <circle cx={cx} cy={cy} r="2.4" fill={centerFill} />
        <circle
          cx={cx}
          cy={cy}
          r="0.9"
          fill={dark ? "rgba(0,0,0,.65)" : "rgba(255,255,255,.65)"}
        />
      </svg>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function AnalogClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/analog-clock";

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
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.ilovetimers.com/",
          },
          { "@type": "ListItem", position: 2, name: "Analog Clock", item: url },
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
        display={<AnalogClockCard initialNowISO={nowISO} />}
        title="Analog Clock (Fullscreen + Seconds Hand)"
        description="A clean live analog clock face with optional seconds hand, smooth motion, and fullscreen viewing."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Want a route focused on continuous second-hand motion? The{" "}
            <a className="ilt-content-link" href="/smooth-second-hand-clock">
              smooth second hand clock
            </a>{" "}
            defaults to a sweeping second hand and also lets you switch back to
            ticking mode. Need a direct page where the second hand is the main
            promise? Open the{" "}
            <a className="ilt-content-link" href="/analog-clock-with-second-hand">
              analog clock with second hand
            </a>
            . For a room-display version, use the{" "}
            <a className="ilt-content-link" href="/full-screen-analog-clock">
              full screen analog clock
            </a>
            .
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
