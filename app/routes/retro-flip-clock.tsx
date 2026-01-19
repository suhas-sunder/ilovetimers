// app/routes/retro-flip-clock.tsx
import type { Route } from "./+types/retro-flip-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Retro Flip Clock | Flip Clock + Retro Flip Clock Online (Fullscreen)";
  const description =
    "Free flip clock and retro flip clock online. Big retro flip digits, fullscreen screensaver mode, optional seconds and date, 12/24-hour toggle, copy, and Zen mode that hides UI.";
  const url = "https://ilovetimers.com/retro-flip-clock";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "flip clock",
        "retro flip clock online",
        "flip clock online",
        "fullscreen flip clock",
        "flip clock screensaver",
        "aesthetic flip clock",
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
   FLIP DIGIT (true 50/50 split + real flip)
========================================================= */
type FlipSize = "md" | "xl";

function FlipDigit({
  value,
  dark,
  size,
  id,
}: {
  value: string;
  dark: boolean;
  size: FlipSize;
  id: string;
}) {
  const prevRef = useRef(value);
  const [from, setFrom] = useState(value);
  const [to, setTo] = useState(value);
  const [animKey, setAnimKey] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== value) {
      setFrom(prev);
      setTo(value);
      setIsFlipping(true);
      setAnimKey((k) => k + 1);
      prevRef.current = value;

      const t = window.setTimeout(() => setIsFlipping(false), 560);
      return () => window.clearTimeout(t);
    }
  }, [value]);

  const dims =
    size === "xl"
      ? {
          w: 160,
          h: 210,
          font: "clamp(92px, 9.5vw, 150px)",
          radius: 22,
          seam: 2,
        }
      : {
          w: 112,
          h: 146,
          font: "clamp(56px, 6.2vw, 96px)",
          radius: 18,
          seam: 2,
        };

  const palette = dark
    ? {
        frame: "rgba(255,255,255,.10)",
        top: "rgba(255,255,255,.08)",
        bot: "rgba(255,255,255,.06)",
        seam: "rgba(255,255,255,.18)",
        text: "rgba(255,255,255,.95)",
        shadow: "rgba(0,0,0,.55)",
      }
    : {
        frame: "rgba(180,83,9,.28)",
        top: "rgba(255,247,237,1)",
        bot: "rgba(255,255,255,1)",
        seam: "rgba(180,83,9,.18)",
        text: "rgba(69,26,3,.92)",
        shadow: "rgba(69,26,3,.18)",
      };

  const fontFamily = 'ui-serif, Georgia, "Times New Roman", Times, serif';

  // Full-height centered text layer (so splitting is always correct).
  const FullText = ({
    children,
    color,
  }: {
    children: React.ReactNode;
    color: string;
  }) => (
    <div
      className="absolute inset-0"
      style={{
        fontFamily,
        fontWeight: 900,
        fontSize: dims.font,
        letterSpacing: ".05em",
        color,
        lineHeight: 1,
        userSelect: "none",
        WebkitUserSelect: "none",
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum" 1, "lnum" 1',

        // IMPORTANT: baseline anchoring (prevents digit-to-digit bounce)
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",

        // tune baseline position once per size
        paddingTop:
          size === "xl"
            ? dark
              ? 50 // fullscreen (dark + xl): pull up a bit
              : 56
            : dark
              ? 38
              : 40,
      }}
    >
      <span style={{ display: "inline-block" }}>{children}</span>
    </div>
  );

  // For flip overlays: we need a full-height text anchored to the full card,
  // but clipped by the half container. Anchoring differs for top vs bottom.
  const OverlayFullText = ({
    children,
    anchor,
  }: {
    children: React.ReactNode;
    anchor: "top" | "bottom";
  }) => (
    <div
      className="absolute left-0 right-0"
      style={{
        height: dims.h,
        ...(anchor === "top" ? { top: 0 } : { bottom: 0 }),
      }}
    >
      <FullText color={palette.text}>{children}</FullText>
    </div>
  );

  return (
    <div
      className="relative select-none"
      style={{ width: dims.w, height: dims.h, perspective: "1200px" }}
      aria-label={`digit ${value}`}
      data-flip-id={id}
    >
      {/* Frame */}
      <div
        className="absolute inset-0 border"
        style={{
          borderColor: palette.frame,
          borderRadius: dims.radius,
          background: dark ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.80)",
          boxShadow: `0 18px 50px ${palette.shadow}`,
        }}
      />

      {/* STATIC HALVES: full-height centered text + clip-path */}
      {/* Top half */}
      <div
        className="absolute inset-0"
        style={{
          background: palette.top,
          clipPath: "inset(0 0 50% 0)",
          borderTopLeftRadius: dims.radius,
          borderTopRightRadius: dims.radius,
        }}
      >
        <FullText color={palette.text}>{to}</FullText>
      </div>

      {/* Bottom half */}
      <div
        className="absolute inset-0"
        style={{
          background: palette.bot,
          clipPath: "inset(50% 0 0 0)",
          borderBottomLeftRadius: dims.radius,
          borderBottomRightRadius: dims.radius,
        }}
      >
        <FullText color={palette.text}>{to}</FullText>
      </div>

      {/* Seam line */}
      <div
        className="absolute left-3 right-3 top-1/2 -translate-y-1/2 rounded-full"
        style={{ height: dims.seam, background: palette.seam }}
        aria-hidden
      />

      {/* Animated overlays */}
      {isFlipping ? (
        <div key={animKey} className="absolute inset-0" aria-hidden>
          {/* Top overlay flips down showing FROM */}
          <div
            className="absolute left-0 right-0 top-0 overflow-hidden"
            style={{
              zIndex: 4,
              height: "50%",
              borderTopLeftRadius: dims.radius,
              borderTopRightRadius: dims.radius,
              transformStyle: "preserve-3d",
              transformOrigin: "bottom",
              transform: "rotateX(0deg)",
              animation: "flipTop 260ms cubic-bezier(.2,.85,.2,1) forwards",
              background: palette.top,
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            <OverlayFullText anchor="top">{from}</OverlayFullText>
          </div>

          {/* Bottom overlay flips up showing TO */}
          <div
            className="absolute left-0 right-0 bottom-0 overflow-hidden"
            style={{
              zIndex: 3,
              height: "50%",
              borderBottomLeftRadius: dims.radius,
              borderBottomRightRadius: dims.radius,
              transformStyle: "preserve-3d",
              transformOrigin: "top",
              transform: "rotateX(90deg)",
              animation: "flipBottom 260ms cubic-bezier(.2,.85,.2,1) forwards",
              animationDelay: "260ms",
              background: palette.bot,
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            <OverlayFullText anchor="bottom">{to}</OverlayFullText>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FlipColon({ dark, size }: { dark: boolean; size: FlipSize }) {
  const dot = size === "xl" ? 12 : 9;
  const gap = size === "xl" ? 30 : 20;
  const color = dark ? "rgba(255,255,255,.80)" : "rgba(120,53,15,.65)";
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
   RETRO FLIP CLOCK CARD
========================================================= */
function RetroFlipClockCard() {
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
    return `Retro Flip Clock\n${timeText} (${tz})\n${showDate ? dateText + "\n" : ""}ISO: ${iso}`;
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
    // Don’t fade anything on initial load. Wait for first interaction.
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
            Retro Flip Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A clean <strong>flip clock</strong> with a classic retro flip
            animation. Fullscreen works well as an aesthetic screensaver.
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
        style={{ minHeight: 460 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes flipTop {
                0%   { transform: rotateX(0deg);   filter: brightness(1); }
                100% { transform: rotateX(-90deg); filter: brightness(.92); }
              }
              @keyframes flipBottom {
                0%   { transform: rotateX(90deg);  filter: brightness(.92); }
                100% { transform: rotateX(0deg);   filter: brightness(1); }
              }

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
                padding:5vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1600px, 96vw);
                height:100%;
                display:grid;
                align-content:center;
                justify-items:center;
                gap:20px;
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
                letter-spacing:.14em;
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
          style={{ minHeight: 460 }}
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
                <FlipDigit value={digits[0]} dark={false} size="md" id="h1" />
                <FlipDigit value={digits[1]} dark={false} size="md" id="h2" />
                <FlipColon dark={false} size="md" />
                <FlipDigit value={digits[2]} dark={false} size="md" id="m1" />
                <FlipDigit value={digits[3]} dark={false} size="md" id="m2" />
                {showSeconds ? (
                  <>
                    <FlipColon dark={false} size="md" />
                    <FlipDigit
                      value={digits[4]}
                      dark={false}
                      size="md"
                      id="s1"
                    />
                    <FlipDigit
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
              Retro Flip Clock
            </div>

            <div className="fs-row">
              <FlipDigit value={digits[0]} dark size="xl" id="fh1" />
              <FlipDigit value={digits[1]} dark size="xl" id="fh2" />
              <FlipColon dark size="xl" />
              <FlipDigit value={digits[2]} dark size="xl" id="fm1" />
              <FlipDigit value={digits[3]} dark size="xl" id="fm2" />
              {showSeconds ? (
                <>
                  <FlipColon dark size="xl" />
                  <FlipDigit value={digits[4]} dark size="xl" id="fs1" />
                  <FlipDigit value={digits[5]} dark size="xl" id="fs2" />
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
export default function RetroFlipClockPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/retro-flip-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Retro Flip Clock",
        url,
        description:
          "Flip clock and retro flip clock online with a real flipping digit animation, fullscreen screensaver mode, Zen UI hiding, and options for seconds, date, and 12/24-hour time.",
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
            name: "Retro Flip Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a flip clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A flip clock is a classic clock display where each digit sits on a split card that flips to the next value. This page recreates that retro flip effect in your browser.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use this as a screensaver?",
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
            / <span className="text-amber-950">Retro Flip Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Retro Flip Clock Online
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A free <strong>flip clock</strong> with real flipping digits. Use
            fullscreen for an aesthetic screensaver-style display.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <RetroFlipClockCard />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Screensaver setup
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              For the cleanest look: click <strong>Fullscreen</strong> (or press{" "}
              <strong>F</strong>) and enable <strong>Zen</strong>. Zen fades the
              extra UI text after a short idle period, so you only see the flip
              digits.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Customize the clock
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Toggle <strong>Seconds</strong> for a steady flip rhythm, switch{" "}
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
            Flip clock and retro flip clock online
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This is a free <strong>flip clock</strong> and{" "}
              <strong>retro flip clock online</strong> with large, readable
              digits and an authentic flip animation. It is designed for desk
              setups, wall displays, and screensaver-style aesthetic clock use.
            </p>

            <p>
              For a screensaver look: press <strong>F</strong> to enter
              fullscreen, then enable <strong>Zen</strong>. After a short idle
              period, Zen fades away the extra text so you only see the flipping
              digits. Move your mouse or tap the screen to bring the UI back.
            </p>

            <p>
              Want fewer flips? Turn off <strong>Seconds</strong> to show only
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
        <h2 className="text-2xl font-bold">Retro Flip Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use this as a fullscreen flip clock?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the card is focused. Enable <strong>Zen</strong> to hide
              extra text after a moment.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Do the digits actually flip?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Each digit uses a split-card flip animation: the top half
              flips down and the bottom half flips up to reveal the next number.
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
