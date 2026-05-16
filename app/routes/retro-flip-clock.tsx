// app/routes/retro-flip-clock.tsx
import type { Route } from "./+types/retro-flip-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Retro Flip Clock (Fullscreen, Classic Animated Digits)";
  const description =
    "A classic retro flip clock with big animated digits. Use it fullscreen as a desk clock or screensaver-style display with a clean, nostalgic look.";

  const url = "https://www.ilovetimers.com/retro-flip-clock";

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
   UI PRIMITIVES (match your newer style)
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

function TogglePill({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
      <input
        className="cursor-pointer"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
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
          w: "clamp(54px, 10vw, 240px)",
          h: "clamp(72px, 13vw, 310px)",
          font: "clamp(44px, 10vw, 220px)",
          radius: "clamp(10px, 1.4vw, 30px)",
          seam: 2,
        }
      : {
          w: "clamp(30px, 9vw, 205px)",
          h: "clamp(44px, 11.5vw, 270px)",
          font: "clamp(26px, 8.5vw, 190px)",
          radius: "clamp(6px, 1.2vw, 24px)",
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
        frame: "rgba(180,83,9,.22)",
        top: "rgba(255,247,237,1)",
        bot: "rgba(255,255,255,1)",
        seam: "rgba(180,83,9,.18)",
        text: "rgba(69,26,3,.92)",
        shadow: "rgba(15,23,42,.12)",
      };

  const fontFamily = 'ui-serif, Georgia, "Times New Roman", Times, serif';

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
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        paddingTop:
          size === "xl"
            ? dark
              ? "clamp(48px, 3.7vw, 70px)"
              : "clamp(18px, 4.1vw, 82px)"
            : dark
              ? "clamp(9px, 2.8vw, 56px)"
              : "clamp(10px, 3.2vw, 64px)",
      }}
    >
      <span style={{ display: "inline-block" }}>{children}</span>
    </div>
  );

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
      <div
        className="absolute inset-0 border"
        style={{
          borderColor: palette.frame,
          borderRadius: dims.radius,
          background: dark ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.80)",
          boxShadow: `0 18px 50px ${palette.shadow}`,
        }}
      />

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

      <div
        className="absolute left-3 right-3 top-1/2 -translate-y-1/2 rounded-full"
        style={{ height: dims.seam, background: palette.seam }}
        aria-hidden
      />

      {isFlipping ? (
        <div key={animKey} className="absolute inset-0" aria-hidden>
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

  const cardRef = useRef<HTMLDivElement>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(displayWrapRef);

  // Ensure keyboard shortcuts work without requiring a click/hover.
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  useEffect(() => {
    cardRef.current?.focus();
  }, [isFs]);

  // Tick on exact second boundaries when seconds are on.
  useEffect(() => {
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const start = () => {
      const update = () => setNow(new Date());

      update();

      if (!showSeconds) {
        intervalId = window.setInterval(update, 15000);
        return;
      }

      const msToNextSecond = 1000 - (Date.now() % 1000);
      timeoutId = window.setTimeout(() => {
        update();
        intervalId = window.setInterval(update, 1000);
      }, msToNextSecond);
    };

    start();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "t") {
      setUse24((v) => !v);
    } else if (k === "d") {
      setShowDate((v) => !v);
    } else if (k === "z") {
      setZen((v) => !v);
    } else if (k === "c") {
      void copy();
    }
  };

  const metaLine = `Local time · ${tz} · ${use24 ? "24-hour" : "12-hour"} · ${
    showSeconds ? "seconds on" : "seconds off"
  }`;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Retro Flip Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="ghost"
              onClick={() => setShowSeconds((v) => !v)}
              className="py-1 text-sm"
            >
              {showSeconds ? "Seconds On" : "Seconds Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setUse24((v) => !v)}
              className="py-1 text-sm"
            >
              {use24 ? "24-hour" : "12-hour"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setShowDate((v) => !v)}
              className="py-1 text-sm"
            >
              {showDate ? "Date On" : "Date Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setZen((v) => !v)}
              className="py-1 text-sm"
            >
              {zen ? "Zen On" : "Zen Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => void copy()}
              className="py-1 text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Retro Flip Clock
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Big flipping digits for a classic desk clock or fullscreen
                display.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <TogglePill
                checked={showSeconds}
                label="Seconds"
                onChange={setShowSeconds}
              />
              <TogglePill checked={use24} label="24-hour" onChange={setUse24} />
              <TogglePill
                checked={showDate}
                label="Date"
                onChange={setShowDate}
              />
              <TogglePill checked={zen} label="Zen" onChange={setZen} />

              <Btn kind="ghost" onClick={() => void copy()} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  displayWrapRef.current &&
                  toggleFullscreen(displayWrapRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        <div
          ref={displayWrapRef}
          data-fs-container
          className={[
            "timer-display-surface relative mt-4 overflow-hidden text-slate-900",
            "border-slate-200",
            isFs ? "mx-0 flex-1 rounded-none border-0" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 460,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
          }}
          aria-live="polite"
          onClick={() => cardRef.current?.focus()}
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
                  color: rgba(51,65,85,.90);
                }

                [data-fs-container]:fullscreen .fs-time{
                  font: 900 20px/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                  letter-spacing:.14em;
                  opacity:.92;
                  text-align:center;
                  white-space:nowrap;
                  color: rgba(51,65,85,.92);
                }

                [data-fs-container]:fullscreen .fs-sub{
                  font: 700 13px/1.25 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                  opacity:.78;
                  text-align:center;
                  color: rgba(51,65,85,.82);
                }
              `,
            }}
          />

          <div
            data-shell="normal"
            className="h-full w-full items-start justify-center p-3 sm:p-6"
            style={{ minHeight: "clamp(300px, 52svh, 620px)" }}
          >
            <div className="w-full max-w-[1500px]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="retro-flip-row flex flex-nowrap items-center justify-center gap-[clamp(0.15rem,1.5vw,1.5rem)]">
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

                <div className="mt-6 text-center fadeSoft opacity-100">
                  <div className="font-mono text-lg font-bold tracking-widest text-slate-800">
                    {timeText}
                  </div>
                  {showDate ? (
                    <div className="mt-2 text-sm font-semibold text-slate-600">
                      {dateText}
                    </div>
                  ) : null}
                  <div className="mt-3 text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    {metaLine}
                  </div>
                </div>

                {!zen ? (
                  <div className="mt-5 text-center text-xs font-semibold text-slate-600 fadeSoft opacity-100">
                    Tip: shortcuts work immediately (clicking anywhere refocuses
                    if needed).
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div data-shell="fullscreen">
            <div className="fs-inner">
              <div className="fs-top fadeSoft opacity-100">Retro Flip Clock</div>

              <div className="fs-row">
                <FlipDigit value={digits[0]} dark={false} size="xl" id="fh1" />
                <FlipDigit value={digits[1]} dark={false} size="xl" id="fh2" />
                <FlipColon dark={false} size="xl" />
                <FlipDigit value={digits[2]} dark={false} size="xl" id="fm1" />
                <FlipDigit value={digits[3]} dark={false} size="xl" id="fm2" />
                {showSeconds ? (
                  <>
                    <FlipColon dark={false} size="xl" />
                    <FlipDigit value={digits[4]} dark={false} size="xl" id="fs1" />
                    <FlipDigit value={digits[5]} dark={false} size="xl" id="fs2" />
                  </>
                ) : null}
                {!use24 ? (
                  <div
                    className="ml-3 text-amber-950"
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

              <div className="fs-time fadeSoft opacity-100">{timeText}</div>

              <div className="fs-sub fadeSoft opacity-100">
                {tz} · {use24 ? "24-hour" : "12-hour"} ·{" "}
                {showSeconds ? "seconds on" : "seconds off"}
                {showDate ? ` · ${dateText}` : ""}
              </div>

              {!zen ? (
                <div className="fs-sub fadeSoft opacity-100">
                  F fullscreen · S seconds · T 12/24 · D date · Z zen · C copy ·
                  Esc exit
                </div>
              ) : null}
            </div>
          </div>

          <FullscreenBottomBar show={isFs}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-600 sm:text-sm">
                Shortcuts: F fullscreen · S seconds · T 12/24 · D date · Z zen ·
                C copy · Esc exit
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {metaLine}
              </div>
            </div>
          </FullscreenBottomBar>
        </div>

        {!isFs && (
          <div className="mt-4 timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            Shortcuts: F fullscreen · S seconds · T 12/24 · D date · Z zen · C
            copy
          </div>
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function RetroFlipClockPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/retro-flip-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Retro Flip Clock",
        url,
        description:
          "Retro flip clock with real flipping digit animation, fullscreen display, Zen UI hiding, and options for seconds, date, and 12/24-hour time.",
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
            name: "Retro Flip Clock",
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

      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <RetroFlipClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Retro Flip Clock</span>
        </p>
      </section>
    </main>
  );
}
