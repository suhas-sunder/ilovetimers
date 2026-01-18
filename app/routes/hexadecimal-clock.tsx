// app/routes/hexadecimal-clock.tsx
import type { Route } from "./+types/hexadecimal-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Hexadecimal Clock | Time in Hex (Fullscreen + Copy)";
  const description =
    "Free hexadecimal clock that shows the current time in hex. Includes HH:MM:SS and milliseconds, optional seconds, 12/24-hour toggle, copy-friendly output, and fullscreen display.";
  const url = "https://ilovetimers.com/hexadecimal-clock";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "hex clock",
        "hexadecimal clock",
        "time in hex",
        "hex time",
        "clock in hexadecimal",
        "hex clock fullscreen",
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

const pad2 = (n: number) => String(n).padStart(2, "0");
const pad3 = (n: number) => String(n).padStart(3, "0");

function to12h(h24: number) {
  const h = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return { h, ampm };
}

function toHex(n: number, width: number) {
  // Uppercase to look clean in UI.
  return n.toString(16).toUpperCase().padStart(width, "0");
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
   HEX CLOCK CARD
========================================================= */
type HexMode = "hms" | "rgb";

function HexClockCard() {
  // Update faster when showing ms.
  const [showSeconds, setShowSeconds] = useState(true);
  const [showMs, setShowMs] = useState(false);
  const [use24, setUse24] = useState(true);
  const [mode, setMode] = useState<HexMode>("hms");

  const [now, setNow] = useState<Date>(() => new Date());
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = showMs ? 50 : showSeconds ? 1000 : 15000;
    const t = window.setInterval(() => setNow(new Date()), interval);
    return () => window.clearInterval(t);
  }, [showSeconds, showMs]);

  const decTime = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );
  const dateText = useMemo(() => formatDateLine(now), [now]);

  const hex = useMemo(() => {
    const h24 = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    let hDisp = h24;
    let suffix = "";
    if (!use24) {
      const t = to12h(h24);
      hDisp = t.h;
      suffix = ` ${t.ampm}`;
    }

    // HMS hex is not "base-16 time", it's just "normal time rendered as hex values".
    // That's the search intent: "hexadecimal clock" and "time in hex".
    const hh = toHex(hDisp, 2);
    const mm = toHex(m, 2);
    const ss = toHex(s, 2);
    const mms = toHex(ms, 3); // 0..3E7

    if (mode === "rgb") {
      // "Hex clock" also often means #RRGGBB where RR=hours, GG=minutes, BB=seconds.
      // That's a popular novelty format.
      const rr = toHex(h24, 2); // keep 24h for color stability
      const gg = toHex(m, 2);
      const bb = toHex(s, 2);
      return {
        main: showSeconds ? `#${rr}${gg}${bb}` : `#${rr}${gg}00`,
        sub: showSeconds
          ? `RR=${rr} (hours) · GG=${gg} (minutes) · BB=${bb} (seconds)`
          : `RR=${rr} · GG=${gg} · BB=00`,
        color: `#${rr}${gg}${bb}`,
        raw: showSeconds ? `#${rr}${gg}${bb}` : `#${rr}${gg}00`,
        suffix: "",
      };
    }

    const main = showSeconds
      ? `${hh}:${mm}:${ss}${suffix}`
      : `${hh}:${mm}${suffix}`;
    const sub = showMs
      ? `ms: ${mms} (hex) · ${pad3(ms)} (dec)`
      : `Hours=${hh} · Minutes=${mm}${showSeconds ? ` · Seconds=${ss}` : ""}`;
    return {
      main,
      sub,
      color: null as string | null,
      raw: showMs ? `${main} · ms:${mms}` : main,
      suffix,
    };
  }, [now, use24, showSeconds, showMs, mode]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return [
      `Hex: ${hex.raw}`,
      `Dec: ${decTime} (${tz})`,
      `Date: ${dateText}`,
      `ISO: ${iso}`,
    ].join("\n");
  }, [hex, decTime, tz, dateText, now]);

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
    } else if (k === "m") {
      setShowMs((v) => !v);
    } else if (k === "x") {
      setMode((m) => (m === "hms" ? "rgb" : "hms"));
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    }
  };

  const showColorPanel = mode === "rgb";
  const color = showColorPanel ? (hex.color ?? "#000000") : null;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Hexadecimal Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Shows the current time in hex. Use HH:MM:SS in hex, or the classic
            “hex color clock” format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as HexMode)}
              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-amber-950"
            >
              <option value="hms">Hex HH:MM:SS</option>
              <option value="rgb">Hex color (#RRGGBB)</option>
            </select>
            Mode
          </label>

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
              checked={showMs}
              onChange={(e) => setShowMs(e.target.checked)}
              disabled={!showSeconds || mode !== "hms"}
            />
            ms
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={use24}
              onChange={(e) => setUse24(e.target.checked)}
            />
            24-hour
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
        style={{ minHeight: 360 }}
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

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(84px, 15vw, 220px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
                white-space:nowrap;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
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
          style={{ minHeight: 360 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 text-center">
              Local time · {tz} ·{" "}
              {mode === "hms" ? "Hex HH:MM:SS" : "Hex color clock"}
            </div>

            <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl text-center whitespace-nowrap">
              {hex.main}
            </div>

            <div className="text-sm font-semibold text-amber-900 text-center">
              {hex.sub}
            </div>

            {showColorPanel ? (
              <div className="w-full max-w-[720px]">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-stretch">
                  <div className="rounded-2xl border border-amber-200 bg-white p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                      Color preview
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="h-14 w-14 rounded-2xl border"
                        style={{
                          background: color ?? "#000",
                          borderColor: "rgba(180,83,9,.25)",
                        }}
                        aria-label="Current hex color"
                        title={color ?? "#000"}
                      />
                      <div className="min-w-0">
                        <div className="font-mono text-xl font-black text-amber-950">
                          {hex.main}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-amber-800">
                          This is the “hex color clock” format where RR=hours,
                          GG=minutes, BB=seconds.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                      Decimal time
                    </div>
                    <div className="mt-2 font-mono text-lg font-extrabold text-amber-950 whitespace-nowrap">
                      {decTime}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-amber-800">
                      {dateText}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-white p-4 text-xs text-amber-900 w-full max-w-[720px]">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  How to read this
                </div>
                <div className="mt-2 leading-relaxed">
                  Each part of the normal time is converted to hex. For example,
                  minutes 15 becomes{" "}
                  <span className="font-mono font-bold">0F</span>. This is not
                  “base-16 timekeeping”, it’s normal time shown in hexadecimal.
                </div>
              </div>
            )}

            <div className="text-sm font-semibold text-amber-900 text-center">
              {dateText}
            </div>

            <div className="text-xs font-semibold text-amber-800 text-center">
              Shortcuts: F fullscreen · C copy · S seconds · M ms · X mode · 1
              (12h) · 2 (24h)
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Hexadecimal Clock</div>
            <div className="fs-time">{hex.main}</div>
            <div className="fs-sub">
              {tz} · {mode === "hms" ? "Hex HH:MM:SS" : "Hex color clock"}
            </div>

            {showColorPanel ? (
              <div className="flex items-center gap-4" style={{ marginTop: 6 }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 18,
                    background: color ?? "#000",
                    border: "1px solid rgba(255,255,255,.22)",
                  }}
                  aria-label="Current hex color"
                  title={color ?? "#000"}
                />
                <div style={{ textAlign: "left", maxWidth: 760 }}>
                  <div
                    style={{
                      font: "800 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
                      opacity: 0.95,
                    }}
                  >
                    {hex.sub}
                  </div>
                  <div
                    style={{
                      font: "700 13px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
                      opacity: 0.85,
                      marginTop: 6,
                    }}
                  >
                    Decimal: {decTime}
                  </div>
                </div>
              </div>
            ) : (
              <div className="fs-sub">{hex.sub}</div>
            )}

            <div className="fs-help">
              F fullscreen · C copy · S seconds · M ms · X mode · 1 (12h) · 2
              (24h)
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: F fullscreen · C copy · S seconds · M ms · X mode · 1 (12h)
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
export default function HexadecimalClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/hexadecimal-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Hexadecimal Clock",
        url,
        description:
          "Hexadecimal clock showing current local time in hex with optional seconds, milliseconds, 12/24-hour toggle, copy, and fullscreen. Includes hex color clock mode (#RRGGBB).",
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
            name: "Hexadecimal Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a hexadecimal clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A hexadecimal clock typically shows normal time values (hours, minutes, seconds) converted into base-16 (hex). Some “hex clocks” also refer to the hex color clock format where the time maps to a color like #RRGGBB.",
            },
          },
          {
            "@type": "Question",
            name: "Is this base-16 timekeeping?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. This page shows standard time values represented in hexadecimal. It does not change how time is divided or measured.",
            },
          },
          {
            "@type": "Question",
            name: "What is a hex color clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A hex color clock displays a color code like #RRGGBB where RR corresponds to hours, GG to minutes, and BB to seconds (in hex).",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the card is focused to show a clean dark fullscreen display.",
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
            / <span className="text-amber-950">Hexadecimal Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Hexadecimal Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>hexadecimal clock</strong> that shows the current time in
            hex. Includes hex HH:MM:SS and a hex color clock mode.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <HexClockCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Hex HH:MM:SS</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Shows standard time values converted into hexadecimal. It’s a fun
              way to practice base-16.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Hex color clock
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Displays a color like <strong>#RRGGBB</strong> where RR=hours,
              GG=minutes, BB=seconds (in hex).
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
                <strong>S</strong> = Seconds toggle
              </li>
              <li>
                <strong>M</strong> = Milliseconds toggle (HH:MM:SS mode)
              </li>
              <li>
                <strong>X</strong> = Mode toggle
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
            Free hexadecimal clock (time in hex)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>hexadecimal clock</strong> shows your current local
              time in base-16. If you searched for <strong>time in hex</strong>,{" "}
              <strong>hex clock</strong>, or <strong>hexadecimal clock</strong>,
              you can read the time as hex values and copy both the hex and
              decimal versions.
            </p>

            <p>
              Want a different novelty clock? Try{" "}
              <Link
                to="/binary-clock"
                className="font-semibold hover:underline"
              >
                Binary Clock
              </Link>{" "}
              or{" "}
              <Link
                to="/morse-code-clock"
                className="font-semibold hover:underline"
              >
                Morse Code Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Hexadecimal Clock FAQ</h2>
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
              Is hex time the same as hexadecimal timekeeping?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Usually no. Most “hex clocks” show standard time values converted
              into hex, rather than changing how time is measured.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is the hex color clock mode?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It displays a color code like <strong>#RRGGBB</strong> where RR
              corresponds to hours, GG to minutes, and BB to seconds (all in
              hex).
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
