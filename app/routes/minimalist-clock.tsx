// app/routes/minimalist-clock.tsx
import type { Route } from "./+types/minimalist-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Minimalist Clock | Aesthetic Clock Online (Fullscreen, Zen)";
  const description =
    "Free minimalist clock and aesthetic clock online. Clean big digits, fullscreen screensaver mode, optional seconds and date, 12/24-hour toggle, copy, and Zen mode that hides UI.";
  const url = "https://ilovetimers.com/minimalist-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "minimalist clock",
        "aesthetic clock online",
        "digital clock online",
        "fullscreen clock",
        "clock screensaver",
        "minimal clock",
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

function splitDigits(d: Date, opts: { use24: boolean; showSeconds: boolean }) {
  const hh24 = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();

  let hh = hh24;
  let ampm = "";
  if (!opts.use24) {
    const t = to12h(hh24);
    hh = t.h;
    ampm = t.ampm;
  }

  const H = pad2(hh);
  const M = pad2(mm);
  const S = pad2(ss);

  const digits = opts.showSeconds
    ? [H[0], H[1], M[0], M[1], S[0], S[1]]
    : [H[0], H[1], M[0], M[1]];

  return { digits, ampm };
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
   MINIMAL DIGIT (monospace, no flip, ultra stable)
========================================================= */
type MinimalSize = "md" | "xl";

function MinimalDigit({
  value,
  size,
  dark,
  id,
}: {
  value: string;
  size: MinimalSize;
  dark: boolean;
  id: string;
}) {
  const dims =
    size === "xl"
      ? { w: 150, h: 190, font: "clamp(96px, 10vw, 160px)", radius: 24 }
      : { w: 108, h: 140, font: "clamp(62px, 6.8vw, 110px)", radius: 20 };

  const palette = dark
    ? {
        frame: "rgba(255,255,255,.14)",
        bg: "rgba(255,255,255,.06)",
        text: "rgba(255,255,255,.92)",
        shadow: "rgba(0,0,0,.55)",
      }
    : {
        frame: "rgba(180,83,9,.22)",
        bg: "rgba(255,255,255,.92)",
        text: "rgba(69,26,3,.92)",
        shadow: "rgba(69,26,3,.14)",
      };

  return (
    <div
      className="relative select-none"
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.radius,
        border: `1px solid ${palette.frame}`,
        background: palette.bg,
        boxShadow: `0 16px 44px ${palette.shadow}`,
      }}
      aria-label={`digit ${value}`}
      data-min-id={id}
    >
      <div
        className="absolute inset-0"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: dims.font,
          fontWeight: 900,
          letterSpacing: ".08em",
          color: palette.text,
          lineHeight: 1,
          userSelect: "none",
          WebkitUserSelect: "none",
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum" 1, "lnum" 1',
          paddingTop: size === "xl" ? 6 : 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MinimalColon({ size, dark }: { size: MinimalSize; dark: boolean }) {
  const dot = size === "xl" ? 12 : 9;
  const gap = size === "xl" ? 34 : 22;
  const color = dark ? "rgba(255,255,255,.70)" : "rgba(120,53,15,.55)";
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ gap }}
      aria-hidden
    >
      <div
        style={{
          width: dot,
          height: dot,
          borderRadius: 999,
          background: color,
        }}
      />
      <div
        style={{
          width: dot,
          height: dot,
          borderRadius: 999,
          background: color,
        }}
      />
    </div>
  );
}

/* =========================================================
   MINIMALIST CLOCK CARD
========================================================= */
function MinimalistClockCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [zen, setZen] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  const idleRef = useRef<number | null>(null);
  const [uiHidden, setUiHidden] = useState(false);

  useEffect(() => {
    const ms = showSeconds ? 1000 : 15000;
    const t = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(t);
  }, [showSeconds]);

  const { digits, ampm } = useMemo(
    () => splitDigits(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const timeText = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const dateText = useMemo(() => formatDateLine(now), [now]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `Minimalist Clock\n${timeText} (${tz})\n${showDate ? dateText + "\n" : ""}ISO: ${iso}`;
  }, [now, timeText, tz, dateText, showDate]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const bumpIdle = useCallback(() => {
    if (!zen) return;
    if (idleRef.current) window.clearTimeout(idleRef.current);
    setUiHidden(false);
    idleRef.current = window.setTimeout(() => setUiHidden(true), 2200);
  }, [zen]);

  useEffect(() => {
    setUiHidden(false);

    const onMove = () => bumpIdle();
    const onKey = () => bumpIdle();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
      window.removeEventListener("keydown", onKey);
      if (idleRef.current) window.clearTimeout(idleRef.current);
    };
  }, [bumpIdle]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "t") {
      setUse24((v) => !v);
    } else if (k === "d") {
      setShowDate((v) => !v);
    } else if (k === "z") {
      setZen((v) => !v);
      setUiHidden(false);
    } else if (k === "c") {
      void copy();
    }
  };

  const metaLine = `Local time · ${tz} · ${use24 ? "24-hour" : "12-hour"} · ${
    showSeconds ? "seconds on" : "seconds off"
  }`;

  const softHidden = zen && uiHidden;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Minimalist Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A clean <strong>minimalist clock</strong> with big stable digits.
            Fullscreen works great as an <strong>aesthetic clock online</strong>{" "}
            display.
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
              checked={showDate}
              onChange={(e) => setShowDate(e.target.checked)}
            />
            Date
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={zen}
              onChange={(e) => setZen(e.target.checked)}
            />
            Zen
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
        style={{ minHeight: 440 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              [data-fs-container] .fadeSoft{
                transition: opacity 220ms ease;
              }

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
                padding:6vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1700px, 96vw);
                height:100%;
                display:grid;
                align-content:center;
                justify-items:center;
                gap:22px;
              }

              [data-fs-container]:fullscreen .fs-row{
                display:flex;
                align-items:center;
                justify-content:center;
                gap:22px;
                width:100%;
              }

              [data-fs-container]:fullscreen .fs-top{
                font: 800 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.16em;
                text-transform:uppercase;
                opacity:.86;
                text-align:center;
                color: rgba(255,255,255,.90);
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 20px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.14em;
                opacity:.92;
                text-align:center;
                white-space:nowrap;
                color: rgba(255,255,255,.92);
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 700 13px/1.25 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.78;
                text-align:center;
                color: rgba(255,255,255,.82);
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 440 }}
        >
          <div className="w-full max-w-[980px]">
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
              <div
                className={`text-center fadeSoft ${softHidden ? "opacity-0" : "opacity-100"}`}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-amber-800">
                  {metaLine}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
                <MinimalDigit
                  value={digits[0]}
                  dark={false}
                  size="md"
                  id="h1"
                />
                <MinimalDigit
                  value={digits[1]}
                  dark={false}
                  size="md"
                  id="h2"
                />
                <MinimalColon dark={false} size="md" />
                <MinimalDigit
                  value={digits[2]}
                  dark={false}
                  size="md"
                  id="m1"
                />
                <MinimalDigit
                  value={digits[3]}
                  dark={false}
                  size="md"
                  id="m2"
                />
                {showSeconds ? (
                  <>
                    <MinimalColon dark={false} size="md" />
                    <MinimalDigit
                      value={digits[4]}
                      dark={false}
                      size="md"
                      id="s1"
                    />
                    <MinimalDigit
                      value={digits[5]}
                      dark={false}
                      size="md"
                      id="s2"
                    />
                  </>
                ) : null}
                {!use24 ? (
                  <div
                    className="ml-2 text-amber-950"
                    style={{
                      fontWeight: 900,
                      letterSpacing: ".18em",
                      fontSize: 22,
                    }}
                  >
                    {ampm}
                  </div>
                ) : null}
              </div>

              <div
                className={`mt-6 text-center fadeSoft ${softHidden ? "opacity-0" : "opacity-100"}`}
              >
                <div className="font-mono text-lg font-bold tracking-widest text-amber-900">
                  {timeText}
                </div>
                {showDate ? (
                  <div className="mt-2 text-sm font-semibold text-amber-800">
                    {dateText}
                  </div>
                ) : null}
              </div>

              <div
                className={`mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 fadeSoft ${
                  softHidden ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Screensaver tips
                </div>
                <ul className="mt-2 space-y-1">
                  <li>
                    Press <strong>F</strong> for fullscreen.
                  </li>
                  <li>
                    Turn on <strong>Zen</strong> to hide labels after a moment.
                  </li>
                  <li>
                    If your device sleeps, raise your screen timeout in system
                    settings.
                  </li>
                </ul>
              </div>

              <div
                className={`mt-5 text-center text-xs font-semibold text-amber-800 fadeSoft ${softHidden ? "opacity-0" : "opacity-100"}`}
              >
                Shortcuts: F fullscreen · S seconds · T 12/24 · D date · Z zen ·
                C copy
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div
              className={`fs-top fadeSoft ${softHidden ? "opacity-0" : "opacity-100"}`}
            >
              Minimalist Clock
            </div>

            <div className="fs-row">
              <MinimalDigit value={digits[0]} dark size="xl" id="fh1" />
              <MinimalDigit value={digits[1]} dark size="xl" id="fh2" />
              <MinimalColon dark size="xl" />
              <MinimalDigit value={digits[2]} dark size="xl" id="fm1" />
              <MinimalDigit value={digits[3]} dark size="xl" id="fm2" />
              {showSeconds ? (
                <>
                  <MinimalColon dark size="xl" />
                  <MinimalDigit value={digits[4]} dark size="xl" id="fs1" />
                  <MinimalDigit value={digits[5]} dark size="xl" id="fs2" />
                </>
              ) : null}
              {!use24 ? (
                <div
                  className="ml-3 text-white/90"
                  style={{
                    fontWeight: 900,
                    letterSpacing: ".18em",
                    fontSize: 28,
                  }}
                >
                  {ampm}
                </div>
              ) : null}
            </div>

            <div
              className={`fs-time fadeSoft ${softHidden ? "opacity-0" : "opacity-100"}`}
            >
              {timeText}
            </div>

            <div
              className={`fs-sub fadeSoft ${softHidden ? "opacity-0" : "opacity-100"}`}
            >
              {tz} · {use24 ? "24-hour" : "12-hour"} ·{" "}
              {showSeconds ? "seconds on" : "seconds off"}
              {showDate ? ` · ${dateText}` : ""}
            </div>

            <div
              className={`fs-sub fadeSoft ${softHidden ? "opacity-0" : "opacity-100"}`}
            >
              F fullscreen · S seconds · T 12/24 · D date · Z zen · C copy
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: F fullscreen · S seconds · T 12/24 · D date · Z zen · C
          copy
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
export default function MinimalistClockPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/minimalist-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Minimalist Clock",
        url,
        description:
          "Minimalist clock and aesthetic clock online with big stable digits, fullscreen screensaver mode, Zen UI hiding, and options for seconds, date, and 12/24-hour time.",
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
            name: "Minimalist Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a minimalist clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A minimalist clock focuses on a clean, simple time display. This page shows large stable digits with optional seconds and date, plus a Zen mode that fades extra UI.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use this as an aesthetic clock online or screensaver?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen (or press F), then enable Zen so the extra UI fades away after a moment. Leave it open on a monitor, tablet, or TV. If your device sleeps, increase screen timeout in system settings.",
            },
          },
          {
            "@type": "Question",
            name: "How do I switch between 12-hour and 24-hour time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Toggle 24-hour in the controls or press T while the card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "Can I hide seconds and the date?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toggle Seconds and Date in the controls. Keyboard shortcuts are S for seconds and D for date.",
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
            / <span className="text-amber-950">Minimalist Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Minimalist Clock Online
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A free <strong>minimalist clock</strong> with big clean digits. Use
            fullscreen for an <strong>aesthetic clock online</strong>{" "}
            screensaver-style display.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <MinimalistClockCard />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Screensaver setup
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              For the cleanest look: click <strong>Fullscreen</strong> (or press{" "}
              <strong>F</strong>) and enable <strong>Zen</strong>. Zen fades the
              extra UI text after a short idle period, so you only see the time.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Customize the clock
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Toggle <strong>Seconds</strong> for a steady rhythm, switch{" "}
              <strong>12/24-hour</strong> time, and show or hide the{" "}
              <strong>Date</strong>. The layout stays stable so it works well on
              a second monitor.
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
                <strong>S</strong> = Seconds
              </li>
              <li>
                <strong>T</strong> = 12/24-hour
              </li>
              <li>
                <strong>D</strong> = Date
              </li>
              <li>
                <strong>Z</strong> = Zen
              </li>
              <li>
                <strong>C</strong> = Copy
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Minimalist clock and aesthetic clock online
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This is a free <strong>minimalist clock</strong> and{" "}
              <strong>aesthetic clock online</strong> with large, readable
              digits. It is designed for desk setups, wall displays, and
              screensaver-style clock use.
            </p>

            <p>
              For a clean aesthetic: press <strong>F</strong> to enter
              fullscreen, then enable <strong>Zen</strong>. After a short idle
              period, Zen fades away the extra text so you only see the time.
              Move your mouse or tap the screen to bring the UI back.
            </p>

            <p>
              Want fewer updates? Turn off <strong>Seconds</strong> to show only
              hours and minutes. Prefer a calendar feel? Toggle{" "}
              <strong>Date</strong> on. You can also switch between{" "}
              <strong>12-hour</strong> and <strong>24-hour</strong> time. Use{" "}
              <strong>Copy</strong> to copy the current time and time zone.
            </p>

            <p>
              More clocks:{" "}
              <Link
                to="/digital-clock"
                className="font-semibold hover:underline"
              >
                Digital Clock
              </Link>{" "}
              ·{" "}
              <Link
                to="/retro-flip-clock"
                className="font-semibold hover:underline"
              >
                Retro Flip Clock
              </Link>{" "}
              ·{" "}
              <Link
                to="/roman-numeral-clock"
                className="font-semibold hover:underline"
              >
                Roman Numeral Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Minimalist Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use this as a fullscreen minimalist clock?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the card is focused. Enable <strong>Zen</strong> to hide
              extra text after a moment.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this an aesthetic clock online?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. The design is intentionally minimal so the time stays the
              focus. Fullscreen plus Zen gives a clean screensaver look.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I hide seconds or the date?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Use the toggles, or press <strong>S</strong> for seconds and{" "}
              <strong>D</strong> for date.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why does my screen still turn off?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Your device power settings control screen timeout. If you want it
              always on, raise screen timeout in your system settings.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
