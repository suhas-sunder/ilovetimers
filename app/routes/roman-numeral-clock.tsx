// app/routes/roman-numeral-clock.tsx
import type { Route } from "./+types/roman-numeral-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Roman Numeral Clock (Live Time)";
  const description =
    "See the current time written in Roman numerals. A clean, fullscreen Roman numeral clock with a clear, classic look.";

  const url = "https://ilovetimers.com/roman-numeral-clock";

  return [
    { title },
    { name: "description", content: description },
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function to12h(h24: number) {
  const h = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return { h, ampm };
}

function formatDateLine(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return d.toDateString();
  }
}

function romanNumeral(n: number) {
  // Supports 0..3999
  if (!Number.isFinite(n) || n <= 0) return "0";
  const map: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let x = Math.floor(n);
  let out = "";
  for (const [v, sym] of map) {
    while (x >= v) {
      out += sym;
      x -= v;
    }
  }
  return out;
}

function formatTimeString(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean },
) {
  const hh24 = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();

  if (opts.use24) {
    return opts.showSeconds
      ? `${pad2(hh24)}:${pad2(mm)}:${pad2(ss)}`
      : `${pad2(hh24)}:${pad2(mm)}`;
  }

  const { h, ampm } = to12h(hh24);
  return opts.showSeconds
    ? `${pad2(h)}:${pad2(mm)}:${pad2(ss)} ${ampm}`
    : `${pad2(h)}:${pad2(mm)} ${ampm}`;
}

function formatRomanTime(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean; useTraditionalIIII: boolean },
) {
  const hh24 = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();

  if (opts.use24) {
    const hRoman = hh24 === 0 ? "0" : romanNumeral(hh24);
    const mRoman = mm === 0 ? "0" : romanNumeral(mm);
    const sRoman = ss === 0 ? "0" : romanNumeral(ss);
    return opts.showSeconds
      ? `${hRoman} : ${mRoman} : ${sRoman}`
      : `${hRoman} : ${mRoman}`;
  }

  const { h, ampm } = to12h(hh24);
  let hRoman = romanNumeral(h);
  if (opts.useTraditionalIIII && h === 4) hRoman = "IIII";

  const mRoman = mm === 0 ? "0" : romanNumeral(mm);
  const sRoman = ss === 0 ? "0" : romanNumeral(ss);

  return opts.showSeconds
    ? `${hRoman} : ${mRoman} : ${sRoman} ${ampm}`
    : `${hRoman} : ${mRoman} ${ampm}`;
}

/* =========================================================
   FIT-TO-WIDTH (no overflow, no wrap, no layout shift)
========================================================= */
function useFitScale(text: string) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Use clientWidth for available width inside container
    const avail = Math.max(0, outer.clientWidth);
    const needed = Math.max(1, inner.scrollWidth);

    // tiny padding safety
    const padding = 8;
    const target = Math.max(1, avail - padding);

    const next = Math.min(1, target / needed);

    // Avoid jitter from tiny diffs
    const rounded = Math.round(next * 1000) / 1000;
    setScale((prev) => (Math.abs(prev - rounded) > 0.01 ? rounded : prev));
  }, []);

  useEffect(() => {
    // Measure after paint so fonts/styles are applied
    const id = window.requestAnimationFrame(measure);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && outerRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(outerRef.current);
    } else {
      // fallback
      const onResize = () => measure();
      window.addEventListener("resize", onResize);
      return () => {
        window.cancelAnimationFrame(id);
        window.removeEventListener("resize", onResize);
      };
    }

    return () => {
      window.cancelAnimationFrame(id);
      ro?.disconnect();
    };
  }, [measure, text]);

  return { outerRef, innerRef, scale };
}

function RomanFitLine({
  romanText,
  className = "",
  suffixSmall = true,
}: {
  romanText: string;
  className?: string;
  suffixSmall?: boolean;
}) {
  // Keep the exact spacing, but render AM/PM in a smaller span to reduce width spikes.
  // Only applied when suffix exists.
  const hasSuffix = romanText.endsWith(" AM") || romanText.endsWith(" PM");
  const suffix = hasSuffix ? romanText.slice(-2) : "";
  const main = hasSuffix ? romanText.slice(0, -3) : romanText;

  const { outerRef, innerRef, scale } = useFitScale(romanText);

  return (
    <div ref={outerRef} className="w-full overflow-hidden">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
        <div
          ref={innerRef}
          className={`mx-auto inline-flex items-center justify-center whitespace-nowrap ${className}`}
          aria-label={romanText}
          title={romanText}
        >
          <span className="whitespace-nowrap">{main}</span>
          {hasSuffix ? (
            <span
              className={
                suffixSmall
                  ? "ml-4 whitespace-nowrap text-[0.82em] tracking-[.10em] opacity-95"
                  : "ml-4 whitespace-nowrap"
              }
            >
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
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
   ROMAN CLOCK CARD
========================================================= */
function RomanNumeralClockCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [useIIII, setUseIIII] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ms = showSeconds ? 1000 : 15000;
    const t = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(t);
  }, [showSeconds]);

  const timeText = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const romanText = useMemo(
    () =>
      formatRomanTime(now, {
        use24,
        showSeconds,
        useTraditionalIIII: useIIII,
      }),
    [now, use24, showSeconds, useIIII],
  );

  const dateText = useMemo(() => formatDateLine(now), [now]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `Roman Numeral Clock\n${romanText}\n${timeText} (${tz})\n${dateText}\nISO: ${iso}`;
  }, [romanText, timeText, tz, dateText, now]);

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
    if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "i") {
      setUseIIII((v) => !v);
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Roman Numeral Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A <strong>roman numeral clock online</strong> that shows your local
            time using Roman numerals. Includes seconds, 12/24-hour, copy, and
            fullscreen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
            />
            Seconds
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={use24}
              onChange={(e) => setUse24(e.target.checked)}
            />
            24-hour
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={useIIII}
              onChange={(e) => setUseIIII(e.target.checked)}
              disabled={use24}
              title={use24 ? "IIII style applies to 12-hour hour display" : ""}
            />
            Use IIII
          </label>

          <Btn kind="ghost" onClick={copy} className="py-2">
            {copied ? "Copied" : "Copy"}
          </Btn>

          <Btn
            kind="ghost"
            onClick={() =>
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
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
        aria-live="polite"
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
                width:min(1200px, 92vw);
                height:100%;
                display:grid;
                align-content:center;
                justify-items:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-roman-wrap{
                width:min(1200px, 92vw);
                min-height: clamp(96px, 12vw, 160px);
                display:grid;
                place-items:center;
              }


              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.92;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-roman{
                font: 900 clamp(34px, 6vw, 86px)/1.05 ui-serif, Georgia, "Times New Roman", Times, serif;
                letter-spacing:.14em;
                text-align:center;
                color: rgba(255,255,255,.98);
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(18px, 2.5vw, 26px)/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
                white-space:nowrap;
                color: rgba(255,255,255,.9);
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
                color: rgba(255,255,255,.82);
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
                color: rgba(255,255,255,.78);
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
              Local time · {tz} · {use24 ? "24-hour" : "12-hour"} ·{" "}
              {useIIII && !use24 ? "IIII style" : "standard IV"}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-6 w-full max-w-[820px] text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Roman numerals
              </div>

              {/* FIX: stable height + auto-scale to width (no wrap, no overflow) */}
              <div
                className="mt-3 w-full"
                style={{
                  // Reserve space so scaling never changes layout height.
                  minHeight: "clamp(92px, 10vw, 132px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RomanFitLine
                  romanText={romanText}
                  className="font-black tracking-[.14em] text-4xl sm:text-5xl md:text-6xl text-amber-950"
                />
              </div>

              <div className="mt-3 font-mono text-lg font-bold tracking-widest text-amber-900 whitespace-nowrap">
                {timeText}
              </div>

              <div className="mt-2 text-sm font-semibold text-amber-800">
                {dateText}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4 text-xs text-amber-900 w-full max-w-[820px]">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Copy preview
              </div>
              <div className="mt-2 font-mono whitespace-pre-wrap">
                {romanText}
              </div>
            </div>

            <div className="text-xs font-semibold text-amber-800 text-center">
              Shortcuts: F fullscreen · C copy · S seconds · I toggle IIII · 1
              (12h) · 2 (24h)
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Roman Numeral Clock</div>

            <div className="fs-roman-wrap">
              <RomanFitLine
                romanText={romanText}
                className="fs-roman"
                suffixSmall
              />
            </div>

            <div className="fs-time">{timeText}</div>
            <div className="fs-sub">
              {tz} · {use24 ? "24-hour" : "12-hour"} ·{" "}
              {useIIII && !use24 ? "IIII style" : "standard IV"}
            </div>
            <div className="fs-help">
              F fullscreen · C copy · S seconds · I toggle IIII · 1 (12h) · 2
              (24h)
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: F fullscreen · C copy · S seconds · I toggle IIII · 1 (12h)
          · 2 (24h)
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function RomanNumeralClockPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/roman-numeral-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Roman Numeral Clock Online",
        url,
        description:
          "Roman numeral clock online showing current local time in Roman numerals with seconds toggle, 12/24-hour mode, copy, and fullscreen.",
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
          {
            "@type": "ListItem",
            position: 2,
            name: "Roman Numeral Clock Online",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a roman numeral clock online?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A roman numeral clock online is a web clock that displays the current time using Roman numerals instead of regular digits. This page converts your local time to Roman numerals automatically and updates in real time.",
            },
          },
          {
            "@type": "Question",
            name: "Why do some roman numeral clocks use IIII instead of IV?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Many traditional clock faces use IIII for 4 for symmetry and long standing clockmaking convention. Toggle Use IIII to match that classic style in 12-hour mode.",
            },
          },
          {
            "@type": "Question",
            name: "How do I read the roman numeral time quickly?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Hours are easiest in 12-hour mode because they range from I to XII. Minutes and seconds use the same Roman rules and usually fall between I and LIX. Use the normal time line under the Roman numerals while learning.",
            },
          },
          {
            "@type": "Question",
            name: "Does this show my local time and time zone?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It uses your device’s local time and time zone settings and updates automatically.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen mode?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the card is focused. Fullscreen uses a dark high contrast layout for easy viewing.",
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
            / <span className="text-amber-950">Roman Numeral Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Roman Numeral Clock Online
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A free <strong>roman numeral clock online</strong> that shows the
            current time in Roman numerals. Use it to learn Roman numerals, keep
            a classic looking display, or run a fullscreen Roman clock on any
            screen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <RomanNumeralClockCard />

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              12-hour is easiest to learn
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              In 12-hour mode, hours run from <strong>I</strong> to{" "}
              <strong>XII</strong>. Use the normal time line underneath while
              you learn the minute and second patterns.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Classic IIII option
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Many traditional roman numeral clock faces show 4 as{" "}
              <strong>IIII</strong> instead of <strong>IV</strong>. Toggle{" "}
              <strong>Use IIII</strong> to match that style in 12-hour mode.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>F</strong> = Fullscreen
              </li>
              <li>
                <strong>C</strong> = Copy
              </li>
              <li>
                <strong>S</strong> = Seconds
              </li>
              <li>
                <strong>I</strong> = Toggle IIII
              </li>
              <li>
                <strong>1</strong> = 12-hour
              </li>
              <li>
                <strong>2</strong> = 24-hour
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            How to read a roman numeral clock online
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>roman numeral clock online</strong> converts your
              current local time into Roman numerals instantly. It is built for
              learning and for display use, including a fullscreen mode that
              works well on a second monitor, tablet, or wall screen.
            </p>

            <p>
              Start with <strong>12-hour</strong> mode if you are learning.
              Hours stay between <strong>I</strong> and <strong>XII</strong>, so
              you can recognize patterns quickly. Minutes and seconds use the
              same Roman numeral rules and range from <strong>0</strong> to{" "}
              <strong>LIX</strong> (59). While learning, keep{" "}
              <strong>Seconds</strong> on and compare the Roman line to the
              regular time shown under it.
            </p>

            <p>
              If you want the classic clock face convention, enable{" "}
              <strong>Use IIII</strong> so the hour 4 displays as{" "}
              <strong>IIII</strong> instead of <strong>IV</strong>. If you
              prefer modern formatting or you want a 24-hour display, toggle{" "}
              <strong>24-hour</strong>.
            </p>

            <p>
              Use <strong>Copy</strong> to copy the Roman time plus the normal
              time, date, and your time zone. Use <strong>Fullscreen</strong>{" "}
              for a clean high contrast display.
            </p>

            <p>
              Want other clock styles? Try{" "}
              <Link
                to="/digital-clock"
                className="font-semibold hover:underline"
              >
                Digital Clock
              </Link>{" "}
              for standard digits, or{" "}
              <Link
                to="/analog-clock"
                className="font-semibold hover:underline"
              >
                Analog Clock
              </Link>{" "}
              for a traditional clock face.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Roman Numeral Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this show my local time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It uses your device’s local time and time zone settings.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why is IIII used on some roman numeral clocks?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It’s a traditional clock face convention. Many designs use IIII
              instead of IV for symmetry. You can toggle IIII style on this page
              in 12-hour mode.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I switch to 24-hour time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle 24-hour mode to display hours 0 to 23 (0 is shown as
              0, and 1 to 23 are shown as Roman numerals).
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the card is focused.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
