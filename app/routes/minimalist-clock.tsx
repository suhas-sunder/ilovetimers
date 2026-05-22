// app/routes/minimalist-clock.tsx
import type { Route } from "./+types/minimalist-clock";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import {
  Button as Btn,
  ContentSection,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetChip as Chip,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
  Field,
  Select,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/minimalist-clock/HowItWorks";
import Disclaimer from "~/clients/components/minimalist-clock/Disclaimer";
import FAQ from "~/clients/components/minimalist-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/minimalist-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/minimalist-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Minimalist Online Clock (Big Fullscreen Display)";
  const description =
    "A clean, distraction-free online clock with big digits. Use it fullscreen as a desk clock, wall display, or screensaver-style clock with a minimalist look.";

  const url = "https://www.ilovetimers.com/minimalist-clock";

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
      content: "https://www.ilovetimers.com/og-image.png",
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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* =========================================================
   MINIMALIST CLOCK CARD (big readable time, fits container)
========================================================= */
function MinimalistClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));
  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [zen, setZen] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const idleRef = useRef<number | null>(null);
  const [uiHidden, setUiHidden] = useState(false);

  const timeText = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );
  const dateText = useMemo(() => formatDateLine(now), [now]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `Minimalist Clock\n${timeText} (${tz})\n${showDate ? dateText + "\n" : ""}ISO: ${iso}`;
  }, [now, timeText, tz, dateText, showDate]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, showSeconds, use24],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 64 : 76,
  });

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

  // Accurate-ish ticking: snap to next second or next 15s bucket.
  useEffect(() => {
    let t: number | null = null;

    const schedule = () => {
      const d = new Date();
      setNow(d);

      const ms = d.getMilliseconds();
      const s = d.getSeconds();

      let delay = 1000 - ms;
      if (!showSeconds) {
        // update every 15 seconds, aligned
        const next = (Math.floor(s / 15) + 1) * 15;
        const secToNext = (next >= 60 ? 60 : next) - s;
        delay = secToNext * 1000 - ms;
        if (delay < 250) delay += 15000; // guard
      }

      t = window.setTimeout(schedule, delay);
    };

    schedule();
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [showSeconds]);

  const doCopy = useCallback(async () => {
    const ok = await copyToClipboard(copyText);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }, [copyText]);

  const softHidden = zen && uiHidden;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f") {
      void fullscreen.toggle();
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
      void doCopy();
    } else if (k === "escape" && isFs) {
      fullscreen.exit();
    }
  };

  const metaLine = `Local time · ${tz} · ${use24 ? "24-hour" : "12-hour"} · ${
    showSeconds ? "seconds on" : "seconds off"
  }`;

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
        <input
          type="checkbox"
          checked={showSeconds}
          onChange={(e) => setShowSeconds(e.target.checked)}
        />
        Seconds
      </label>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
        <input
          type="checkbox"
          checked={use24}
          onChange={(e) => setUse24(e.target.checked)}
        />
        24-hour
      </label>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
        <input
          type="checkbox"
          checked={showDate}
          onChange={(e) => setShowDate(e.target.checked)}
        />
        Date
      </label>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
        <input
          type="checkbox"
          checked={zen}
          onChange={(e) => setZen(e.target.checked)}
        />
        Zen
      </label>

      <Btn kind="ghost" onClick={() => void doCopy()} className="py-2">
        {copied ? "Copied" : "Copy"}
      </Btn>

      {!isFs ? (
        <Btn
          kind="ghost"
          onClick={() => void fullscreen.toggle()}
          className="py-2"
        >
          Fullscreen
        </Btn>
      ) : null}
    </div>
  );

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Minimalist Clock"
        onExit={() => void fullscreen.exit()}
        right={controls}
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "ilt-display-stage timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
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
          onMouseMove={() => bumpIdle()}
          onTouchStart={() => bumpIdle()}
          onClick={() => {
            if (isFs) bumpIdle();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Move/tap to show controls if Zen is on" : undefined}
        >
          <div
            className={[
              "timer-clock-label text-xs font-extrabold uppercase tracking-widest",
              "text-slate-700",
              "transition-opacity duration-200",
              softHidden ? "opacity-0" : "opacity-100",
            ].join(" ")}
          >
            {metaLine}
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
              fontVariantNumeric: "tabular-nums",
              fontFeatureSettings: '"tnum" 1, "lnum" 1',
            }}
          >
            {timeText}
          </span>

          {showDate ? (
            <div
            className={[
              "timer-clock-context mt-3 text-center text-sm font-semibold",
                "text-slate-700",
              "transition-opacity duration-200",
              softHidden ? "opacity-0" : "opacity-100",
            ].join(" ")}
            >
              {dateText}
            </div>
          ) : null}

          <div
            className={[
              "timer-clock-context mt-4 text-center text-xs font-semibold",
              "text-slate-600",
              "transition-opacity duration-200",
              softHidden ? "opacity-0" : "opacity-100",
            ].join(" ")}
          >
            {isFs
              ? "Esc exits fullscreen"
              : "Tip: click the card so shortcuts work"}
          </div>
        </div>

        {!isFs ? (
          <>
            <SettingGroup
              title="Clock settings"
              description="Minimal display options stay secondary to the clock face."
            >
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-4">
                <Toggle
                  checked={showSeconds}
                  label="Seconds"
                  onCheckedChange={setShowSeconds}
                />
                <Toggle
                  checked={use24}
                  label="24-hour"
                  onCheckedChange={setUse24}
                />
                <Toggle
                  checked={showDate}
                  label="Date"
                  onCheckedChange={setShowDate}
                />
                <Toggle checked={zen} label="Zen" onCheckedChange={setZen} />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="ghost" onClick={() => void doCopy()} className="py-2">
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
              Shortcuts: F fullscreen, S seconds, T 12/24, D date, Z zen, C copy
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Shortcuts: F fullscreen · S seconds · T 12/24 · D date · Z zen · C
              copy
            </div>
            <div
              className={[
                "text-xs font-semibold text-slate-700 transition-opacity duration-200",
                softHidden ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              {metaLine}
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
export default function MinimalistClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/minimalist-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Minimalist Clock",
        url,
        description:
          "Minimalist online clock with big readable digits, fullscreen display, Zen UI hiding, and options for seconds, date, and 12/24-hour time.",
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
            name: "Minimalist Clock",
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
        display={<MinimalistClockCard initialNowISO={nowISO} />}
        title="Minimalist Clock"
        description="A clean, distraction-free local clock with large digits, optional date, Zen controls, copy, and fullscreen."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Need a clock page centered on immediate room or second-monitor
            display? The{" "}
            <a className="ilt-content-link" href="/full-screen-clock">
              full screen clock
            </a>{" "}
            keeps the large live time display first and makes fullscreen the
            primary action below the clock.
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
