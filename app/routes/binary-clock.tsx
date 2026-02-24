// app/routes/binary-clock.tsx
import type { Route } from "./+types/binary-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Disclaimer from "~/clients/components/binary-clock/Disclaimer";
import FAQ from "~/clients/components/binary-clock/FAQ";
import HowItWorks from "~/clients/components/binary-clock/HowItWorks";
import KeyboardShortcuts from "~/clients/components/binary-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/binary-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Binary Clock (View Current Time in Binary)";
  const description =
    "Free binary clock that shows the current time in binary. Switch between BCD and pure binary, toggle seconds and 12 or 24-hour time, and go fullscreen.";

  const url = "https://www.ilovetimers.com/binary-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "binary clock",
        "binary clock online",
        "time in binary",
        "binary time clock",
        "bcd clock",
        "binary clock fullscreen",
      ].join(", "),
    },
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

function bitsOf(n: number, width: number) {
  const out: number[] = [];
  for (let i = width - 1; i >= 0; i--) out.push((n >> i) & 1);
  return out;
}

function bcdBitsOfDigit(digit: number) {
  return bitsOf(digit, 4);
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

/**
 * Accurate clock updates aligned to the next second boundary.
 * Always updates at 1s boundaries (even if seconds are hidden) so minutes change cleanly.
 */
function useNow() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let t: number | null = null;

    const schedule = () => {
      setNow(new Date());
      const msUntilNext = 1000 - (Date.now() % 1000);
      t = window.setTimeout(schedule, msUntilNext);
    };

    const msUntilNext = 1000 - (Date.now() % 1000);
    t = window.setTimeout(schedule, msUntilNext);

    return () => {
      if (t) window.clearTimeout(t);
    };
  }, []);

  return now;
}

/* =========================================================
   UI PRIMITIVES
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
        : `cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const Chip = ({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? "bg-slate-900 text-white hover:bg-slate-800"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  left,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  left?: React.ReactNode;
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
          {left}
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
   BINARY CLOCK CARD
========================================================= */
type BinaryMode = "bcd" | "pure";

function BinaryClockCard() {
  const now = useNow();

  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [mode, setMode] = useState<BinaryMode>("bcd");
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const timeText = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );
  const dateText = useMemo(() => formatDateLine(now), [now]);

  const binaryText = useMemo(() => {
    const h24 = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    let hDisp = h24;
    let suffix = "";
    if (!use24) {
      const { h, ampm } = to12h(h24);
      hDisp = h;
      suffix = ` ${ampm}`;
    }

    if (mode === "pure") {
      const hb = bitsOf(hDisp, use24 ? 5 : 4).join("");
      const mb = bitsOf(m, 6).join("");
      const sb = bitsOf(s, 6).join("");
      return showSeconds
        ? `H:${hb} M:${mb} S:${sb}${suffix}`
        : `H:${hb} M:${mb}${suffix}`;
    }

    const hh = pad2(hDisp);
    const mm = pad2(m);
    const ss = pad2(s);

    const parts = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    const digitsOnly = parts.replace(/[^0-9]/g, "");
    const groups: string[] = [];
    for (const ch of digitsOnly)
      groups.push(bcdBitsOfDigit(Number(ch)).join(""));
    return showSeconds
      ? `${parts}${suffix} -> ${groups.join(" ")}`
      : `${parts}${suffix} -> ${groups.slice(0, 4).join(" ")}`;
  }, [now, use24, showSeconds, mode]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `${timeText} (${tz})\n${dateText}\n${binaryText}\nISO: ${iso}`;
  }, [timeText, tz, dateText, binaryText, now]);

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

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "b") {
      setMode((m) => (m === "bcd" ? "pure" : "bcd"));
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    } else if (e.key === "Escape" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const displayTone = isFs
    ? "border-slate-200 bg-slate-950 text-white"
    : "border-slate-200 bg-slate-50 text-slate-950";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Binary Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
                className="accent-amber-500"
              />
              Seconds
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={use24}
                onChange={(e) => setUse24(e.target.checked)}
                className="accent-amber-500"
              />
              24-hour
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <span className="text-slate-600">Mode</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as BinaryMode)}
                className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <option value="bcd">BCD</option>
                <option value="pure">Pure</option>
              </select>
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
            <Btn
              kind="solid"
              onClick={() =>
                cardRef.current && toggleFullscreen(cardRef.current)
              }
              className="py-1 text-sm"
            >
              Fullscreen
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full w-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center ml-auto gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                  className="accent-amber-500"
                />
                Seconds
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={use24}
                  onChange={(e) => setUse24(e.target.checked)}
                  className="accent-amber-500"
                />
                24-hour
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <span className="text-slate-700">Mode</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as BinaryMode)}
                  className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                >
                  <option value="bcd">BCD (digits)</option>
                  <option value="pure">Pure binary</option>
                </select>
              </label>

              <Btn kind="ghost" onClick={copy} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        <div
          className={[
            "mt-4 flex flex-col items-center justify-center rounded-2xl border p-3 sm:p-6",
            displayTone,
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 420,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs && cardRef.current) toggleFullscreen(cardRef.current);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to exit fullscreen" : undefined}
        >
          <div
            className={
              isFs
                ? "text-xs font-extrabold uppercase tracking-widest text-white/80"
                : "text-xs font-extrabold uppercase tracking-widest text-slate-700"
            }
          >
            Local time · {tz} · {mode === "bcd" ? "BCD digits" : "Pure binary"}
          </div>

          <div
            className={[
              "mt-3 font-mono font-extrabold tracking-widest text-center whitespace-nowrap",
              isFs
                ? "text-[clamp(44px,7vw,96px)] text-white"
                : "text-5xl sm:text-6xl text-slate-950",
            ].join(" ")}
          >
            {timeText}
          </div>

          <div className={isFs ? "mt-6 w-full" : "mt-5 w-full max-w-3xl"}>
            <BinaryGrid
              now={now}
              use24={use24}
              showSeconds={showSeconds}
              mode={mode}
              dark={isFs}
            />
          </div>

          <div
            className={
              isFs
                ? "mt-5 text-sm font-semibold text-white/85 text-center"
                : "mt-4 text-sm font-semibold text-slate-700 text-center"
            }
          >
            {dateText}
          </div>

          {!isFs && (
            <div className="mt-4 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Copy preview
              </div>
              <div className="mt-2 font-mono text-xs whitespace-pre-wrap text-slate-800">
                {binaryText}
              </div>
            </div>
          )}

          <div
            className={
              isFs
                ? "mt-6 text-xs font-semibold text-white/80 text-center"
                : "mt-4 text-xs font-semibold text-slate-600 text-center"
            }
          >
            Shortcuts: F fullscreen · C copy · S seconds · B mode · 1 (12h) · 2
            (24h) · Esc exit
          </div>
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip active={mode === "bcd"} onClick={() => setMode("bcd")}>
                BCD
              </Chip>
              <Chip active={mode === "pure"} onClick={() => setMode("pure")}>
                Pure
              </Chip>
              <Chip active={use24} onClick={() => setUse24(true)}>
                24h
              </Chip>
              <Chip active={!use24} onClick={() => setUse24(false)}>
                12h
              </Chip>
              <Chip active={showSeconds} onClick={() => setShowSeconds(true)}>
                Seconds on
              </Chip>
              <Chip active={!showSeconds} onClick={() => setShowSeconds(false)}>
                Seconds off
              </Chip>
            </div>

            <div className="flex items-center gap-2">
              <Btn kind="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn
                kind="solid"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
              >
                Exit
              </Btn>
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   BINARY GRID
========================================================= */
function BinaryGrid({
  now,
  use24,
  showSeconds,
  mode,
  dark,
}: {
  now: Date;
  use24: boolean;
  showSeconds: boolean;
  mode: BinaryMode;
  dark: boolean;
}) {
  const h24 = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  let hDisp = h24;
  if (!use24) hDisp = to12h(h24).h;

  const palette = useMemo(() => {
    return {
      bg: dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.75)",
      border: dark ? "rgba(255,255,255,.14)" : "rgba(15,23,42,.18)",
      on: dark ? "rgba(255,255,255,.92)" : "rgba(2,6,23,.92)",
      off: dark ? "rgba(255,255,255,.16)" : "rgba(15,23,42,.10)",
      text: dark ? "rgba(255,255,255,.86)" : "rgba(30,41,59,.88)",
      label: dark ? "rgba(255,255,255,.78)" : "rgba(51,65,85,.75)",
      sep: dark ? "rgba(255,255,255,.35)" : "rgba(51,65,85,.25)",
    };
  }, [dark]);

  if (mode === "pure") {
    const hourBits = bitsOf(hDisp, use24 ? 5 : 4);
    const minBits = bitsOf(m, 6);
    const secBits = bitsOf(s, 6);

    const cols = showSeconds
      ? [
          { key: "H", label: "Hours", bits: hourBits },
          { key: "M", label: "Minutes", bits: minBits },
          { key: "S", label: "Seconds", bits: secBits },
        ]
      : [
          { key: "H", label: "Hours", bits: hourBits },
          { key: "M", label: "Minutes", bits: minBits },
        ];

    const maxH = Math.max(...cols.map((c) => c.bits.length));

    return (
      <div
        className="rounded-2xl border p-4"
        style={{
          background: palette.bg,
          borderColor: palette.border,
        }}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`,
          }}
        >
          {cols.map((c) => {
            const padded = Array.from({ length: maxH - c.bits.length })
              .map(() => 0)
              .concat(c.bits);
            return (
              <div key={c.key} className="flex flex-col items-center gap-3">
                <div
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: palette.label }}
                >
                  {c.label}
                </div>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateRows: `repeat(${maxH}, 1fr)` }}
                >
                  {padded.map((b, i) => (
                    <Bit key={i} on={b === 1} palette={palette} dark={dark} />
                  ))}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: palette.text }}
                >
                  {c.bits.join("")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // BCD mode (no hooks below this point)
  const hh = pad2(hDisp);
  const mm = pad2(m);
  const ss = pad2(s);

  const parts = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  const digits = parts
    .split("")
    .filter((ch) => ch !== ":")
    .map((ch) => Number(ch));

  const groupLabels = showSeconds ? ["HH", "MM", "SS"] : ["HH", "MM"];

  const digitGroups: Array<{ label: string; digits: number[] }> = (() => {
    if (showSeconds) {
      return [
        { label: "Hours", digits: [digits[0], digits[1]] },
        { label: "Minutes", digits: [digits[2], digits[3]] },
        { label: "Seconds", digits: [digits[4], digits[5]] },
      ];
    }
    return [
      { label: "Hours", digits: [digits[0], digits[1]] },
      { label: "Minutes", digits: [digits[2], digits[3]] },
    ];
  })();

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: palette.bg,
        borderColor: palette.border,
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {groupLabels.map((g) => (
            <span
              key={g}
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{
                background: dark
                  ? "rgba(255,255,255,.08)"
                  : "rgba(15,23,42,.08)",
                color: palette.label,
              }}
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-stretch justify-center gap-4">
          {digitGroups.map((grp, gi) => (
            <div key={grp.label} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: palette.label }}
                >
                  {grp.label}
                </div>

                <div className="flex items-end gap-3">
                  {grp.digits.map((d, di) => {
                    const bits = bcdBitsOfDigit(d);
                    return (
                      <div
                        key={`${gi}-${di}`}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="grid gap-2"
                          style={{ gridTemplateRows: "repeat(4, 1fr)" }}
                        >
                          {bits.map((b, bi) => (
                            <Bit
                              key={bi}
                              on={b === 1}
                              palette={palette}
                              dark={dark}
                            />
                          ))}
                        </div>
                        <div
                          className="font-mono text-sm font-extrabold"
                          style={{ color: palette.text }}
                        >
                          {d}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="text-[11px] font-semibold"
                  style={{ color: palette.text }}
                >
                  {grp.digits.map((d) => bcdBitsOfDigit(d).join("")).join(" ")}
                </div>
              </div>

              {gi < digitGroups.length - 1 ? (
                <div className="flex items-center justify-center px-1">
                  <div className="flex flex-col items-center gap-2" aria-hidden>
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: palette.sep }}
                    />
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: palette.sep }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div
          className="text-center text-xs font-semibold"
          style={{ color: palette.text }}
        >
          BCD shows each decimal digit as 4 binary bits.
        </div>
      </div>
    </div>
  );
}

function Bit({
  on,
  palette,
  dark,
}: {
  on: boolean;
  palette: { on: string; off: string; border: string };
  dark: boolean;
}) {
  return (
    <div
      className="grid place-items-center rounded-xl border"
      style={{
        width: 22,
        height: 22,
        background: on ? palette.on : palette.off,
        borderColor: palette.border,
      }}
      aria-label={on ? "1" : "0"}
      title={on ? "1" : "0"}
    >
      <span
        className="font-mono text-xs font-black"
        style={{
          color: on
            ? dark
              ? "rgba(0,0,0,.92)"
              : "rgba(255,255,255,.92)"
            : dark
              ? "rgba(255,255,255,.55)"
              : "rgba(2,6,23,.55)",
          userSelect: "none",
        }}
      >
        {on ? "1" : "0"}
      </span>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BinaryClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/binary-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Binary Clock",
        url,
        description:
          "Binary clock showing current local time in binary with BCD and pure binary modes, optional seconds, 12/24-hour toggle, copy, and fullscreen.",
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
          { "@type": "ListItem", position: 2, name: "Binary Clock", item: url },
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Binary Clock (Time in Binary)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            View your current local time in binary. Switch BCD vs pure binary,
            toggle seconds and 12/24-hour time, copy, and go fullscreen.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <BinaryClockCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Binary Clock</span>
        </p>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}
