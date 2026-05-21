// app/routes/roman-numeral-clock.tsx
import type { Route } from "./+types/roman-numeral-clock";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";


import {
  Button as Btn,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolHero,
  Toggle,
  ToolFrame as Card,
} from "~/clients/components/ui/foundation";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Roman Numeral Clock (Live Time, Fullscreen)";
  const description =
    "See the current time written in Roman numerals. A clean, fullscreen Roman numeral clock with a clear, classic look.";

  const url = "https://www.ilovetimers.com/roman-numeral-clock";

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
   CLOCK CARD
========================================================= */
function RomanNumeralClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [useIIII, setUseIIII] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));

  // Snappy ticking:
  // - update immediately on mount
  // - then align to next second (or next 15s boundary when seconds are hidden)
  useEffect(() => {
    let alive = true;
    let timeoutId: number | null = null;
    let intervalId: number | null = null;

    const stepMs = showSeconds ? 1000 : 15000;

    const schedule = () => {
      if (!alive) return;
      const d = new Date();
      setNow(d);

      const t = d.getTime();
      const next = Math.ceil((t + 1) / stepMs) * stepMs; // +1 to avoid landing “now”
      const delay = Math.max(0, next - t);

      timeoutId = window.setTimeout(() => {
        if (!alive) return;
        setNow(new Date());
        intervalId = window.setInterval(() => setNow(new Date()), stepMs);
      }, delay);
    };

    schedule();

    return () => {
      alive = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
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

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const romanBoxRef = useRef<HTMLDivElement>(null);
  const romanSpanRef = useRef<HTMLSpanElement>(null);

  const timeBoxRef = useRef<HTMLDivElement>(null);
  const timeSpanRef = useRef<HTMLSpanElement>(null);

  const romanFontPx = useFitText({
    containerRef: romanBoxRef,
    textRef: romanSpanRef,
    deps: [romanText, isFs, use24, showSeconds, useIIII],
    minPx: 34,
    maxPx: isFs ? 220 : 140,
    paddingAllowancePx: isFs ? 40 : 56,
    initialScale: isFs ? 1 : 0.97,
  });

  const timeFontPx = useFitText({
    containerRef: timeBoxRef,
    textRef: timeSpanRef,
    deps: [timeText, isFs, use24, showSeconds],
    minPx: 18,
    maxPx: isFs ? 64 : 36,
    paddingAllowancePx: isFs ? 40 : 56,
  });

  const statusLine = `${tz} · ${use24 ? "24-hour" : "12-hour"} · ${
    useIIII && !use24 ? "IIII" : "IV"
  } · ${showSeconds ? "seconds" : "no seconds"}`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "i") {
      if (!use24) setUseIIII((v) => !v);
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Roman Numeral Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setShowSeconds((v) => !v)}
              className="py-1 text-sm"
            >
              Seconds: {showSeconds ? "On" : "Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setUse24((v) => !v)}
              className="py-1 text-sm"
            >
              {use24 ? "24h" : "12h"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => {
                if (!use24) setUseIIII((v) => !v);
              }}
              className="py-1 text-sm"
              disabled={use24}
            >
              IIII: {useIIII && !use24 ? "On" : "Off"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="hidden">

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Btn kind="ghost" onClick={copy} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  void fullscreen.toggle()
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="hidden">
            <div className="flex flex-wrap items-center gap-3">
              <Toggle
                label="Seconds"
                checked={showSeconds}
                onCheckedChange={setShowSeconds}
              />
              <Toggle label="24-hour" checked={use24} onCheckedChange={setUse24} />
              <Toggle
                label="Use IIII"
                checked={useIIII}
                onCheckedChange={setUseIIII}
                disabled={use24}
                title={
                  use24 ? "IIII style applies to 12-hour hour display" : ""
                }
              />
            </div>

            <div className="sm:ml-auto timer-control-shadow rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: F fullscreen · C copy · S seconds · I IIII · 1 (12h) ·
              2 (24h)
            </div>
          </div>
        )}

        {/* Display */}
        <div
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 360,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            // ensure shortcuts work immediately after any click
            cardRef.current?.focus({ preventScroll: true });
          }}
          title="Click once so keyboard shortcuts work immediately"
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLine}
          </div>

          <div
            ref={romanBoxRef}
            className="timer-clock-value-wrap mt-3 flex w-full items-center justify-center"
            style={{
              minHeight: isFs
                ? "min(30vh, 220px)"
                : "clamp(110px, 14vw, 160px)",
              padding: isFs ? "0 10px" : "0 12px",
            }}
          >
            <span
              ref={romanSpanRef}
              data-primary-display-value
              className="timer-clock-value text-center font-black tracking-[.14em] text-slate-900"
              style={{
                fontFamily:
                  'ui-serif, Georgia, "Times New Roman", Times, serif',
                fontSize: romanFontPx,
                lineHeight: "1.05",
                transform: "translateZ(0)",
              maxWidth: "100%",
              overflowWrap: "anywhere",
              whiteSpace: isFs ? "nowrap" : "normal",
              }}
              aria-label={romanText}
            >
              {romanText}
            </span>
          </div>

          <div
            ref={timeBoxRef}
            className="timer-clock-context-wrap mt-2 flex w-full items-center justify-center"
            style={{
              minHeight: isFs ? 60 : 44,
              padding: isFs ? "0 10px" : "0 12px",
            }}
          >
            <span
              ref={timeSpanRef}
              className="timer-clock-context text-center font-mono font-extrabold tracking-widest text-slate-800"
              style={{
                fontSize: timeFontPx,
                lineHeight: "1.1",
              maxWidth: "100%",
              overflowWrap: "anywhere",
              whiteSpace: isFs ? "nowrap" : "normal",
              }}
              aria-label={timeText}
            >
              {timeText}
            </span>
          </div>

          {!isFs && (
            <div className="timer-clock-context mt-2 text-sm font-semibold text-slate-600">
              {dateText}
            </div>
          )}

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Local time
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {dateText}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  C = Copy
                </div>
              </div>
            </div>
          )}
        </div>

        {!isFs && (
          <>
            <SettingGroup title="Roman clock settings">
              <SettingRow>
                <Toggle
                  label="Seconds"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
                <Toggle
                  label="24-hour"
                  checked={use24}
                  onCheckedChange={setUse24}
                />
                <Toggle
                  label="Use IIII"
                  checked={useIIII}
                  onCheckedChange={setUseIIII}
                  disabled={use24}
                  title={use24 ? "IIII style applies to 12-hour display" : ""}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="ghost" onClick={copy} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
                className="py-2"
              >
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: F fullscreen, C copy, S seconds, I IIII, 1 12-hour, 2
              24-hour
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Shortcuts: F fullscreen · C copy · S seconds · I IIII · 1 (12h) ·
              2 (24h)
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLine}
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
export default function RomanNumeralClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/roman-numeral-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Roman Numeral Clock",
        url,
        description:
          "Roman numeral clock showing current local time in Roman numerals with seconds toggle, 12/24-hour mode, copy, and fullscreen.",
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
            name: "Roman Numeral Clock",
            item: url,
          },
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
        display={<RomanNumeralClockCard initialNowISO={nowISO} />}
        title="Roman Numeral Clock"
        description="Display the current time as Roman numeral segments while keeping the normal time available for comparison."
      />

      <SeoBand title="How Roman numeral time works">
        <p>
          The clock above converts the live hour, minute, and second values into
          Roman numerals. The visual display stays dominant, with the standard
          time kept nearby as a comparison.
        </p>
        <p>
          Roman numerals are a display format rather than a separate time
          system. Midnight, noon, and current live values are represented by
          converting each numeric segment into its Roman numeral form.
        </p>
        <h3>Display limitations</h3>
        <p>
          Some Roman numeral segments are longer than their numeric equivalents,
          especially when seconds are shown. On narrow screens, the display may
          wrap or scale to keep the specialty clock readable instead of behaving
          like a compact digital clock.
        </p>
        <h3>When to use it</h3>
        <p>
          Use this as a novelty or presentation clock when the format matters
          more than fast scanning. For precise scheduling, compare the Roman
          display with the normal time shown nearby.
        </p>
        <h3>Related specialty clocks</h3>
        <p>
          For base-two time display, use the{" "}
          <a className="ilt-content-link" href="/binary-clock">
            binary clock
          </a>
          . For base-sixteen display, try the{" "}
          <a className="ilt-content-link" href="/hexadecimal-clock">
            hexadecimal clock
          </a>
          . For a visual number puzzle clock, use the{" "}
          <a className="ilt-content-link" href="/fibonacci-clock">
            Fibonacci clock
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}
