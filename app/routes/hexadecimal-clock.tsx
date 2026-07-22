import Stage4RouteContent from "~/clients/components/content/Stage4RouteContent";
// app/routes/hexadecimal-clock.tsx
import type { Route } from "./+types/hexadecimal-clock";
import { data as json } from "react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  Select,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolHero,
  ToolFrame as Card,
  Toggle,
} from "~/clients/components/ui/foundation";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Hexadecimal Clock (View Current Time in Hex)";
  const description =
    "Free hexadecimal clock that displays the current time in hex format. See HH:MM:SS and milliseconds, toggle 12 or 24-hour time, copy values, and go fullscreen.";

  const url = "https://www.ilovetimers.com/hexadecimal-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "hexadecimal clock",
        "hex clock",
        "time in hex",
        "hex time",
        "clock in hexadecimal",
        "hex clock fullscreen",
        "hexadecimal time",
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

const pad2 = (n: number) => String(n).padStart(2, "0");
const pad3 = (n: number) => String(n).padStart(3, "0");

function to12h(h24: number) {
  const h = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return { h, ampm };
}

function toHex(n: number, width: number) {
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
   HEX CLOCK CARD
========================================================= */
type HexMode = "hms" | "rgb";

function HexClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [showSeconds, setShowSeconds] = useState(true);
  const [showMs, setShowMs] = useState(false);
  const [use24, setUse24] = useState(true);
  const [mode, setMode] = useState<HexMode>("hms");

  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Guardrails so settings never land in an invalid state.
  useEffect(() => {
    if (!showSeconds && showMs) setShowMs(false);
  }, [showSeconds, showMs]);

  useEffect(() => {
    if (mode !== "hms" && showMs) setShowMs(false);
  }, [mode, showMs]);

  useEffect(() => {
    const interval = showMs ? 50 : showSeconds ? 250 : 15000;
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

    const hh = toHex(hDisp, 2);
    const mm = toHex(m, 2);
    const ss = toHex(s, 2);
    const mms = toHex(ms, 3);

    if (mode === "rgb") {
      const rr = toHex(h24, 2);
      const gg = toHex(m, 2);
      const bb = toHex(s, 2);

      const raw = showSeconds ? `#${rr}${gg}${bb}` : `#${rr}${gg}00`;
      const color = showSeconds ? `#${rr}${gg}${bb}` : `#${rr}${gg}00`;

      return {
        main: raw,
        sub: showSeconds
          ? `RR=${rr} (hours) · GG=${gg} (minutes) · BB=${bb} (seconds)`
          : `RR=${rr} · GG=${gg} · BB=00`,
        color,
        raw,
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
    if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "m") {
      if (mode === "hms") setShowMs((v) => !v);
    } else if (k === "x") {
      setMode((m) => (m === "hms" ? "rgb" : "hms"));
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const showColorPanel = mode === "rgb";
  const color = showColorPanel ? (hex.color ?? "#000000") : null;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [hex.main, isFs, showSeconds, showMs, use24, mode],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
    initialScale: isFs ? 1 : 0.86,
    initialMobileScale: isFs ? 1 : 0.84,
  });

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Hexadecimal Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <span className="text-slate-700">Mode</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as HexMode)}
                className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 hover:bg-slate-50"
              >
                <option value="hms">Hex HH:MM:SS</option>
                <option value="rgb">Hex color</option>
              </select>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
              />
              Seconds
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={showMs}
                onChange={(e) => setShowMs(e.target.checked)}
                disabled={!showSeconds || mode !== "hms"}
              />
              ms
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={use24}
                onChange={(e) => setUse24(e.target.checked)}
              />
              24h
            </label>

            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="off"
          onClick={() => {
            if (isFs) copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to copy" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest text-slate-700 text-center">
            Local time · {tz} · {mode === "hms" ? "Hex HH:MM:SS" : "Hex color"}
          </div>

          <span
            ref={timeTextRef}
            data-primary-display-value
            className={[
              "timer-clock-value mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              whiteSpace: "nowrap",
            }}
          >
            {hex.main}
          </span>

          <div className="timer-clock-context mt-3 text-sm font-semibold text-slate-700 text-center">
            {hex.sub}
          </div>

          {/* RGB preview (both modes; styled to never steal space from main clock) */}
          {showColorPanel && (
            <div className="timer-clock-support mt-4 w-full max-w-[760px]">
              <div className="timer-clock-panel flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <div
                  className="h-12 w-12 rounded-lg border border-slate-200"
                  style={{ background: color ?? "#000" }}
                  aria-label="Current hex color"
                  title={color ?? "#000"}
                />
                <div className="min-w-0 text-center sm:text-left">
                  <div className="font-mono text-lg font-black text-slate-900">
                    {hex.main}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">
                    RR=hours · GG=minutes · BB=seconds
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="timer-clock-context mt-3 text-xs font-semibold text-slate-600 text-center">
            {dateText} · Decimal {decTime}
          </div>
        </div>

        {!isFs && (
          <>
            <SettingGroup title="Hex clock settings">
              <SettingRow>
                <Select
                  label="Mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as HexMode)}
                >
                  <option value="hms">Hex HH:MM:SS</option>
                  <option value="rgb">Hex color</option>
                </Select>
                <Toggle
                  label="Seconds"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
                <Toggle
                  label="Milliseconds"
                  checked={showMs}
                  onCheckedChange={setShowMs}
                  disabled={!showSeconds || mode !== "hms"}
                />
                <Toggle
                  label="24-hour"
                  checked={use24}
                  onCheckedChange={setUse24}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="ghost" onClick={copy}>
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
              Shortcuts: F fullscreen, C copy, S seconds, M ms, X mode, 1
              12-hour, 2 24-hour
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap display to copy · F fullscreen · C copy · S seconds · M ms · X
              mode · 1 (12h) · 2 (24h)
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
export default function HexadecimalClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/hexadecimal-clock";

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
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Hexadecimal Clock",
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
        display={<HexClockCard initialNowISO={nowISO} />}
        title="Hexadecimal Clock"
        description="Show the current time as hexadecimal time with a normal-time comparison, copy output, and fullscreen display."
      />

      <SeoBand>

          <Stage4RouteContent routePath="/hexadecimal-clock" />
      </SeoBand>
    </PageShell>
  );
}
