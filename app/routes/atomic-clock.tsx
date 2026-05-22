// app/routes/atomic-clock.tsx
import type { Route } from "./+types/atomic-clock";
import { json } from "@remix-run/node";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
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
import Disclaimer from "~/clients/components/atomic-clock/Disclaimer";
import FAQ from "~/clients/components/atomic-clock/FAQ";
import HowItWorks from "~/clients/components/atomic-clock/HowItWorks";
import KeyboardShortcuts from "~/clients/components/atomic-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/atomic-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Online Atomic Clock (Device Time With Milliseconds, Fullscreen)";
  const description =
    "View the current time with milliseconds in a clean fullscreen atomic-style display. Big readable layout with optional keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/atomic-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "atomic clock",
        "atomic clock online",
        "device time with milliseconds",
        "device clock",
        "time with milliseconds",
        "fullscreen clock",
        "atomic style clock",
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
const pad2 = (n: number) => n.toString().padStart(2, "0");
const pad3 = (n: number) => n.toString().padStart(3, "0");

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

function fmtHMSMs(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ms = d.getMilliseconds();
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}`;
}

function fmtHMS(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/* =========================================================
   ATOMIC CLOCK CARD
========================================================= */
function AtomicClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [showMs, setShowMs] = useState(true);
  const [live, setLive] = useState(true);

  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const stopTicks = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // Improve UX: focus the card once so shortcuts work immediately (without extra UI text)
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!cardRef.current) return;
      const ae = document.activeElement as HTMLElement | null;
      const okToSteal =
        !ae || ae === document.body || ae === document.documentElement;
      if (okToSteal) cardRef.current.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    stopTicks();

    if (!live) return;

    if (showMs) {
      const tick = () => {
        setNow(new Date());
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => stopTicks();
    }

    // No milliseconds: update on second boundary for stability
    const update = () => setNow(new Date());
    update();

    const msToNextSecond = 1000 - new Date().getMilliseconds();
    const t = window.setTimeout(() => {
      update();
      intervalRef.current = window.setInterval(
        update,
        1000,
      ) as unknown as number;
    }, msToNextSecond);

    return () => {
      window.clearTimeout(t);
      stopTicks();
    };
  }, [live, showMs]);

  useEffect(() => {
    return () => stopTicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const display = useMemo(() => {
    return showMs ? fmtHMSMs(now) : fmtHMS(now);
  }, [now, showMs]);

  const statusLabel = live ? "Live" : "Frozen";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [display, statusLabel, isFs, live, showMs],
    minPx: isFs ? 52 : 24,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      setLive((v) => !v);
    } else if (k === "m") {
      setShowMs((v) => !v);
    } else if (k === "f") {
      void fullscreen.toggle();
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
        title="Atomic Clock"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
                className="accent-amber-500"
              />
              Live
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={showMs}
                onChange={(e) => setShowMs(e.target.checked)}
                className="accent-amber-500"
              />
              Milliseconds
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={live ? "solid" : "ghost"}
              onClick={() => setLive((v) => !v)}
              className="py-1 text-sm"
            >
              {live ? "Freeze" : "Resume"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center font-mono font-extrabold",
            "border-slate-200 bg-slate-50 text-slate-950",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) setLive((v) => !v);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to freeze or resume" : undefined}
        >
          <span
            ref={timeTextRef}
            data-primary-display-value
            className={[
              "timer-clock-value inline-block text-center",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {display}
          </span>

          {!isFs && (
            <div className="timer-clock-label mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {statusLabel}
            </div>
          )}
        </div>

        {!isFs && (
          <>
            <SettingGroup title="Clock settings">
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
                <Toggle
                  label="Live"
                  checked={live}
                  onCheckedChange={setLive}
                />
                <Toggle
                  label="Milliseconds"
                  checked={showMs}
                  onCheckedChange={setShowMs}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn onClick={() => setLive((v) => !v)}>
                {live ? "Freeze" : "Resume"}
              </Btn>
              <Btn kind="ghost" onClick={() => setShowMs((v) => !v)}>
                {showMs ? "Hide ms" : "Show ms"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
                className="py-2"
                title="Fullscreen (F)"
              >
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: Space freeze/resume, M toggle ms, F fullscreen
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                  className="accent-amber-500"
                />
                Live
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={showMs}
                  onChange={(e) => setShowMs(e.target.checked)}
                  className="accent-amber-500"
                />
                Milliseconds
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn
                  kind={live ? "solid" : "ghost"}
                  onClick={() => setLive((v) => !v)}
                >
                  {live ? "Freeze" : "Resume"}
                </Btn>
                <Btn kind="ghost" onClick={() => setShowMs((v) => !v)}>
                  {showMs ? "Hide ms" : "Show ms"}
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to freeze/resume · Space freeze/resume · M ms · F
                fullscreen
              </div>
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
export default function AtomicClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/atomic-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Atomic Clock",
        url,
        description:
          "Atomic clock style live time display with optional milliseconds and fullscreen mode.",
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
          { "@type": "ListItem", position: 2, name: "Atomic Clock", item: url },
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
        display={<AtomicClockCard initialNowISO={nowISO} />}
        title="Online Atomic Clock (Milliseconds + Fullscreen)"
        description="An atomic-style device-clock display with optional milliseconds, live or frozen state, and fullscreen controls."
      />

      <SeoBand>
        <HowItWorks />
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>

    </PageShell>
  );
}
