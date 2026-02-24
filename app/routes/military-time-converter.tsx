// app/routes/military-time-converter.tsx
import type { Route } from "./+types/military-time-converter";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Military Time Converter (24-Hour to AM/PM, Instant)";
  const description =
    "Convert military time to standard AM/PM in seconds. Paste 1730, 0730, or 0000 and get the exact time instantly. Simple, fast, and accurate.";

  const url = "https://www.ilovetimers.com/military-time-converter";

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
  return json({ ok: true });
}

/* =========================================================
   UTILS
========================================================= */
const pad2 = (n: number) => n.toString().padStart(2, "0");

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

function cleanDigits(s: string) {
  return (s || "").replace(/[^\d]/g, "");
}

function formatStandard(h24: number, m: number) {
  const isPM = h24 >= 12;
  const h12raw = h24 % 12;
  const h12 = h12raw === 0 ? 12 : h12raw;
  const suffix = isPM ? "PM" : "AM";
  return `${h12}:${pad2(m)} ${suffix}`;
}

function formatMilitary(h24: number, m: number) {
  return `${pad2(h24)}${pad2(m)}`;
}

type ParseResult = {
  valid: boolean;
  h24: number;
  m: number;
  normalized: string;
  standard: string;
  error?: string;
  note?: string;
};

function parseMilitary(input: string): ParseResult {
  const raw = (input || "").trim();
  if (!raw) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "Enter a military time like 1730 or 17:30.",
    };
  }

  const hasColon = raw.includes(":");
  let h = 0;
  let m = 0;

  if (hasColon) {
    const parts = raw.split(":");
    if (parts.length !== 2) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        standard: "",
        error: "Use a valid format like 17:30 or 5:30.",
      };
    }

    const hh = cleanDigits(parts[0]);
    const mm = cleanDigits(parts[1]);

    if (!hh || !mm) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        standard: "",
        error: "Use a valid format like 17:30.",
      };
    }

    h = Number(hh);
    m = Number(mm);
  } else {
    const d = cleanDigits(raw);
    if (!d) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        standard: "",
        error: "Enter digits like 1730, 0730, or 0000.",
      };
    }

    if (d.length === 1 || d.length === 2) {
      h = Number(d);
      m = 0;
    } else if (d.length === 3) {
      h = Number(d.slice(0, 1));
      m = Number(d.slice(1));
    } else {
      h = Number(d.slice(0, d.length - 2));
      m = Number(d.slice(d.length - 2));
    }
  }

  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "That time does not look valid.",
    };
  }

  if (h === 24 && m === 0) {
    const normalized = "2400";
    return {
      valid: true,
      h24: 0,
      m: 0,
      normalized,
      standard: "12:00 AM",
      note: "2400 is commonly used to mean midnight. This converter treats 2400 as 00:00.",
    };
  }

  if (h < 0 || h > 23) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "Hour must be 0 to 23 (or 2400 for midnight).",
    };
  }

  if (m < 0 || m > 59) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "Minutes must be 00 to 59.",
    };
  }

  const normalized = formatMilitary(h, m);
  const standard = formatStandard(h, m);

  return { valid: true, h24: h, m, normalized, standard };
}

type ParseStandardResult = {
  valid: boolean;
  h24: number;
  m: number;
  normalized: string;
  military: string;
  error?: string;
};

function parseStandard(input: string): ParseStandardResult {
  const raw = (input || "").trim();
  if (!raw) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Enter a time like 5:30 PM or 12 AM.",
    };
  }

  const s = raw.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

  const hasAM = /\bam\b/.test(s);
  const hasPM = /\bpm\b/.test(s);

  if (!hasAM && !hasPM) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Include AM or PM (example: 5:30 PM).",
    };
  }

  const suffix = hasPM ? "PM" : "AM";
  const timePart = s.replace(/\bam\b|\bpm\b/g, "").trim();

  let h = 0;
  let m = 0;

  if (!timePart) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Enter a time like 5:30 PM or 5 PM.",
    };
  }

  if (timePart.includes(":")) {
    const [hhRaw, mmRaw] = timePart.split(":");
    const hh = cleanDigits(hhRaw);
    const mm = cleanDigits(mmRaw);
    if (!hh || !mm) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        military: "",
        error: "Use a valid format like 5:30 PM.",
      };
    }
    h = Number(hh);
    m = Number(mm);
  } else {
    const d = cleanDigits(timePart);
    if (!d) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        military: "",
        error: "Use a format like 5 PM or 5:30 PM.",
      };
    }
    h = Number(d);
    m = 0;
  }

  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "That time does not look valid.",
    };
  }

  if (h < 1 || h > 12) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Hour must be 1 to 12 for standard time.",
    };
  }

  if (m < 0 || m > 59) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Minutes must be 00 to 59.",
    };
  }

  let h24 = h % 12;
  if (suffix === "PM") h24 += 12;

  const normalized = `${h}:${pad2(m)} ${suffix}`;
  const military = formatMilitary(h24, m);

  return { valid: true, h24, m, normalized, military };
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

function useIsFullscreen(targetRef: RefObject<HTMLElement | null>) {
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
 * Fit a single-line string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 28,
  maxPx = 260,
  paddingAllowancePx = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const [fontPx, setFontPx] = useState<number>(minPx);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf: number | null = null;

    const compute = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;

      const rect = c.getBoundingClientRect();
      const availW = Math.max(0, rect.width - paddingAllowancePx);
      const availH = Math.max(0, rect.height - paddingAllowancePx);

      if (availW <= 0 || availH <= 0) return;

      const originalFontSize = (t as HTMLElement).style.fontSize;

      const fits = (px: number) => {
        (t as HTMLElement).style.fontSize = `${px}px`;
        const tr = t.getBoundingClientRect();
        return tr.width <= availW && tr.height <= availH;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      (t as HTMLElement).style.fontSize = originalFontSize;
      setFontPx(best);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontPx;
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

const ChipBtn = ({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
      active
        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ].join(" ")}
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

/* =========================================================
   TOOL CARD
========================================================= */
type ActiveField = "mil" | "std";

function MilitaryTimeConverterCard() {
  const [militaryInput, setMilitaryInput] = useState("1730");
  const [standardInput, setStandardInput] = useState("5:30 PM");
  const [activeField, setActiveField] = useState<ActiveField>("mil");

  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const mil = useMemo(() => parseMilitary(militaryInput), [militaryInput]);
  const std = useMemo(() => parseStandard(standardInput), [standardInput]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const displayTextRef = useRef<HTMLSpanElement>(null);

  const shownLabel =
    activeField === "mil" ? "Standard time (AM/PM)" : "Military time (24-hour)";

  const shownValue = useMemo(() => {
    if (activeField === "mil") return mil.valid ? mil.standard : "—";
    return std.valid ? std.military : "—";
  }, [activeField, mil.valid, mil.standard, std.valid, std.military]);

  // Reserve width to reduce jitter (monospace + fixed ch width for the display value)
  const shownMinCh = activeField === "mil" ? 10 : 6;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: displayTextRef,
    deps: [shownValue, shownLabel, isFs, activeField],
    minPx: 44,
    maxPx: isFs ? 380 : 220,
    paddingAllowancePx: isFs ? 72 : 80,
  });

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
  }, []);

  useEffect(() => {
    return () => clearToastTimer();
  }, [clearToastTimer]);

  const copy = useCallback(
    async (label: string, text: string) => {
      const ok = await copyToClipboard(text);
      setLastCopied(ok ? label : "Copy failed");
      clearToastTimer();
      toastTimerRef.current = window.setTimeout(() => setLastCopied(null), 900);
    },
    [clearToastTimer],
  );

  const fillNow = useCallback(() => {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    const milText = formatMilitary(h, m);
    const stdText = formatStandard(h, m);
    setMilitaryInput(milText);
    setStandardInput(stdText);
    setActiveField("mil");
  }, []);

  const clearAll = useCallback(() => {
    setMilitaryInput("");
    setStandardInput("");
    clearToastTimer();
    setLastCopied(null);
    setActiveField("mil");
  }, [clearToastTimer]);

  const quick = useMemo(
    () => ["0000", "0030", "0600", "1200", "1730", "2359", "2400"],
    [],
  );

  const setFromMilitary = useCallback((next: string) => {
    setActiveField("mil");
    setMilitaryInput(next);

    const parsed = parseMilitary(next);
    if (parsed.valid) setStandardInput(parsed.standard);
  }, []);

  const setFromStandard = useCallback((next: string) => {
    setActiveField("std");
    setStandardInput(next);

    const parsed = parseStandard(next);
    if (parsed.valid) setMilitaryInput(parsed.military);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "n") {
      e.preventDefault();
      fillNow();
      return;
    }

    if (k === "c") {
      e.preventDefault();
      if (mil.valid) copy("Standard", mil.standard);
      return;
    }

    if (k === "m") {
      e.preventDefault();
      if (std.valid) copy("Military", std.military);
      return;
    }

    if (k === "r") {
      e.preventDefault();
      clearAll();
      return;
    }

    if (k === "f" && cardRef.current) {
      e.preventDefault();
      toggleFullscreen(cardRef.current);
      return;
    }

    if (k === "escape" && isFs) {
      e.preventDefault();
      document.exitFullscreen().catch(() => {});
    }
  };

  const statusLabel =
    activeField === "mil"
      ? mil.valid
        ? "Valid military input"
        : "Invalid military input"
      : std.valid
        ? "Valid standard input"
        : "Invalid standard input";

  const isPrimaryValid = activeField === "mil" ? mil.valid : std.valid;

  const onCopyPrimary = useCallback(() => {
    if (activeField === "mil") {
      if (mil.valid) copy("Standard", mil.standard);
    } else {
      if (std.valid) copy("Military", std.military);
    }
  }, [activeField, mil.valid, mil.standard, std.valid, std.military, copy]);

  // Reserve error/note area to prevent layout shift
  const milFootnote =
    mil.valid && mil.note ? mil.note : mil.valid ? "" : mil.error || "";
  const stdFootnote = std.valid ? "" : std.error || "";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Military Time Converter"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={onCopyPrimary}
              className="py-1 text-sm"
              disabled={!isPrimaryValid}
            >
              Copy
            </Btn>
            <Btn kind="ghost" onClick={fillNow} className="py-1 text-sm">
              Now
            </Btn>
            <Btn kind="ghost" onClick={clearAll} className="py-1 text-sm">
              Clear
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Military Time Converter (24-Hour ⇄ AM/PM)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Type either format. The other side updates when your input is
                valid. Big result display, copy, quick examples, and fullscreen.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
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

        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Btn kind="ghost" onClick={fillNow}>
                Use current time
              </Btn>
              <Btn kind="ghost" onClick={clearAll}>
                Clear
              </Btn>
              <Btn
                kind="solid"
                onClick={onCopyPrimary}
                disabled={!isPrimaryValid}
              >
                Copy result
              </Btn>
            </div>

            <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: N now · C copy AM/PM · M copy military · R clear · F
              fullscreen
            </div>
          </div>
        )}

        {!isFs && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="mr-1 text-sm font-semibold text-slate-900">
              Examples:
            </div>
            {quick.map((q) => (
              <ChipBtn
                key={q}
                onClick={() => setFromMilitary(q)}
                active={cleanDigits(militaryInput) === q}
              >
                {q}
              </ChipBtn>
            ))}
          </div>
        )}

        {/* Big Display (fixed internal layout to avoid shifting) */}
        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 rounded-2xl border bg-slate-50 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 230,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) onCopyPrimary();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to copy the current result" : undefined}
        >
          <div className="flex h-full flex-col items-center justify-center">
            <div className="h-4 text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {shownLabel}
            </div>

            <span
              ref={displayTextRef}
              className={[
                "mt-3 inline-block text-center font-mono font-extrabold tabular-nums",
                isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              ].join(" ")}
              style={{
                fontSize: `${fitFontPx}px`,
                lineHeight: "1",
                transform: "translateZ(0)",
                minWidth: `${shownMinCh}ch`,
              }}
            >
              {shownValue}
            </span>

            {/* Fixed-height status row */}
            <div className="mt-4 h-4 text-xs font-semibold text-slate-700">
              {statusLabel}
            </div>
          </div>

          {isFs && (
            <div className="absolute right-3 top-3 hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              Tap result to copy
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className={isFs ? "mx-2 sm:mx-4" : ""}>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {/* Military -> Standard */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Military (24-hour)
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Try 1730, 0730, 5:30, 17:30, 0000, 2400
                  </div>
                </div>

                <Btn
                  kind="ghost"
                  onClick={() => mil.valid && copy("Standard", mil.standard)}
                  disabled={!mil.valid}
                  className="py-2"
                >
                  Copy AM/PM
                </Btn>
              </div>

              <label className="mt-3 block">
                <span className="sr-only">Military time input</span>
                <input
                  inputMode="numeric"
                  value={militaryInput}
                  onChange={(e) => setFromMilitary(e.target.value)}
                  onFocus={() => setActiveField("mil")}
                  placeholder="1730"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
              </label>

              {/* Result box with reserved content height */}
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Standard time (AM/PM)
                </div>

                <div className="mt-1 min-h-[92px]">
                  {/* Value row (reserved) */}
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {mil.valid ? mil.standard : "—"}
                  </div>

                  {/* Sub row (reserved) */}
                  <div className="mt-1 text-sm text-slate-700">
                    {mil.valid ? (
                      <>
                        Normalized military:{" "}
                        <span className="font-semibold">{mil.normalized}</span>
                      </>
                    ) : (
                      <span className="opacity-0">
                        Normalized military: 0000
                      </span>
                    )}
                  </div>

                  {/* Footnote row (reserved) */}
                  <div className="mt-1 min-h-[20px] text-sm text-slate-700">
                    {milFootnote ? (
                      milFootnote
                    ) : (
                      <span className="opacity-0">.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Standard -> Military */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Standard (AM/PM)
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Try 5:30 PM, 12 AM, 9 PM, 12:05 am
                  </div>
                </div>

                <Btn
                  kind="ghost"
                  onClick={() => std.valid && copy("Military", std.military)}
                  disabled={!std.valid}
                  className="py-2"
                >
                  Copy military
                </Btn>
              </div>

              <label className="mt-3 block">
                <span className="sr-only">Standard time input</span>
                <input
                  value={standardInput}
                  onChange={(e) => setFromStandard(e.target.value)}
                  onFocus={() => setActiveField("std")}
                  placeholder="5:30 PM"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
              </label>

              {/* Result box with reserved content height */}
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Military time (24-hour)
                </div>

                <div className="mt-1 min-h-[92px]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {std.valid ? std.military : "—"}
                  </div>

                  <div className="mt-1 text-sm text-slate-700">
                    {std.valid ? (
                      <>
                        Normalized standard:{" "}
                        <span className="font-semibold">{std.normalized}</span>
                      </>
                    ) : (
                      <span className="opacity-0">
                        Normalized standard: 12:00 PM
                      </span>
                    )}
                  </div>

                  <div className="mt-1 min-h-[20px] text-sm text-slate-700">
                    {stdFootnote ? (
                      stdFootnote
                    ) : (
                      <span className="opacity-0">.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Tip: click the card once so shortcuts work.
              </div>
              <div className="text-xs text-slate-600">
                {lastCopied ? (
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-900">
                    {lastCopied}
                  </span>
                ) : (
                  <span className="opacity-0">Copied</span>
                )}
              </div>
            </div>
          )}
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap result to copy · N now · C copy AM/PM · M copy military · R
              clear · F fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {lastCopied ? `Copied: ${lastCopied}` : statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MilitaryTimeConverterPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/military-time-converter";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Military Time Converter",
        url,
        description:
          "Convert military time (24-hour time) to standard time (AM/PM) instantly, plus reverse conversion.",
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
            name: "Military Time Converter",
            item: url,
          },
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

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <MilitaryTimeConverterCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Military Time Converter</span>
        </p>
      </section>
    </main>
  );
}
