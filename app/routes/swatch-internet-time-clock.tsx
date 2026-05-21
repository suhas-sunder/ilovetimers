// app/routes/swatch-internet-time-clock.tsx
import type { Route } from "./+types/swatch-internet-time-clock";
import { json } from "@remix-run/node";
import {
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
  ToolFrame as Card,
  Toggle,
} from "~/clients/components/ui/foundation";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Swatch Internet Time (.beat) Clock, Live";
  const description =
    "View the current Swatch Internet Time (@beat) live. A clean, timezone-free clock that shows the exact .beat time with a clear, readable display.";

  const url = "https://www.ilovetimers.com/swatch-internet-time-clock";

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





/* =========================================================
   SWATCH INTERNET TIME MATH
========================================================= */
const MS_IN_DAY = 86_400_000;
const BMT_OFFSET_MS = 60 * 60 * 1000; // UTC+1

function getBeatPartsFromMs(nowMs: number) {
  const bmtMs = nowMs + BMT_OFFSET_MS;

  const dayMs = ((bmtMs % MS_IN_DAY) + MS_IN_DAY) % MS_IN_DAY; // 0..MS_IN_DAY
  const beatFloat = (dayMs / MS_IN_DAY) * 1000; // 0..1000
  const beatClamped = Math.min(Math.max(beatFloat, 0), 999.999999);

  const beatInt = Math.floor(beatClamped); // 0..999
  const beatFrac = beatClamped - beatInt;
  const beatCenti = Math.floor(beatFrac * 100); // 0..99

  const bmtH = Math.floor(dayMs / 3_600_000);
  const bmtM = Math.floor((dayMs % 3_600_000) / 60_000);
  const bmtS = Math.floor((dayMs % 60_000) / 1000);

  return { beatInt, beatCenti, bmtH, bmtM, bmtS };
}

/* =========================================================
   CLOCK CARD
========================================================= */
function SwatchInternetTimeCard({ initialNowISO }: { initialNowISO: string }) {
  const [live, setLive] = useState(true);
  const [nowMs, setNowMs] = useState(() => new Date(initialNowISO).getTime());

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const beatTextRef = useRef<HTMLSpanElement>(null);

  // Snappy updates without interval drift:
  // rAF loop throttled to ~10fps to avoid excessive renders.
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    if (!live) {
      stopRaf();
      return;
    }

    const tick = (t: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = t;
      const dt = t - lastUpdateRef.current;

      // ~10fps, feels instant for beats while staying light.
      if (dt >= 100) {
        lastUpdateRef.current = t;
        setNowMs(Date.now());
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [live]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const parts = useMemo(() => getBeatPartsFromMs(nowMs), [nowMs]);

  const beatStr = useMemo(() => {
    return `@${pad3(parts.beatInt)}.${pad2(parts.beatCenti)}`;
  }, [parts.beatInt, parts.beatCenti]);

  const bmtTimeStr = useMemo(() => {
    return `${pad2(parts.bmtH)}:${pad2(parts.bmtM)}:${pad2(parts.bmtS)}`;
  }, [parts.bmtH, parts.bmtM, parts.bmtS]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: beatTextRef,
    deps: [beatStr, isFs, live],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 72 : 72,
  });

  const statusLabel = live ? "Live" : "Frozen";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      setLive((v) => !v);
    } else if (k === "s") {
      if (!live) setNowMs(Date.now());
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
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
        title="Swatch Internet Time"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              <input
                className="cursor-pointer"
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />
              Live
            </label>

            <Btn
              kind="ghost"
              onClick={() => setNowMs(Date.now())}
              className="py-1 text-sm"
              disabled={live}
            >
              Snap
            </Btn>

            <Btn
              kind="ghost"
              onClick={() => setLive(false)}
              className="py-1 text-sm"
            >
              Freeze
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
          aria-live="polite"
          onClick={() => {
            if (isFs) setLive((v) => !v);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to toggle live/freeze" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={beatTextRef}
            data-primary-display-value
            className={[
              "timer-clock-value mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {beatStr}
          </span>

          <div className="timer-clock-context timer-clock-panel mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
            BMT (UTC+1): <span className="font-mono">{bmtTimeStr}</span>
          </div>

          {isFs && (
            <div className="pointer-events-none absolute right-3 top-3 hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              Space = Live/Frozen · S = Snap · F = Fullscreen
            </div>
          )}
        </div>

        {!isFs && (
          <>
            <SettingGroup title="Internet time settings">
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
                <Toggle
                  className="self-start"
                  label="Live"
                  checked={live}
                  onCheckedChange={setLive}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="solid" onClick={() => setLive((v) => !v)}>
                {live ? "Freeze" : "Go live"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() => setNowMs(Date.now())}
                disabled={live}
              >
                Snap
              </Btn>

              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: Space live/freeze, S snap, F fullscreen
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap beat to toggle live/freeze · Space live/freeze · S snap · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
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
export default function SwatchInternetTimePage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/swatch-internet-time-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Swatch Internet Time (.beat) Clock",
        url,
        description:
          "Live Swatch Internet Time clock showing current @beat with sub-beat decimals, based on Biel Mean Time (UTC+1).",
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
            name: "Swatch Internet Time (.beat) Clock",
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
        display={<SwatchInternetTimeCard initialNowISO={nowISO} />}
        title="Swatch Internet Time (.beat) Clock"
        description="Track Swatch Internet Time in @beats, using the UTC/Biel-based calculation with normal time shown secondarily."
      />

      <SeoBand title="How Swatch Internet Time works">
        <p>
          The display above shows Swatch Internet Time as @beats. It uses the
          intended UTC plus one hour basis for Biel Mean Time instead of local
          time zone math, so the value is not the same thing as your local clock.
        </p>
        <p>
          A day is divided into 1000 beats, from @000 to @999. The normal clock
          comparison is included only as context; the @beats value is the primary
          result and updates live while the clock is running.
        </p>
        <h3>Why it looks different</h3>
        <p>
          Swatch Internet Time removes hours, minutes, seconds, and ordinary
          time-zone labels from the display. That makes it a novelty reference
          format rather than a replacement for local schedules or legal time.
        </p>
        <h3>Useful notes</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            @beats are calculated from the Biel/UTC+1 basis, not from the
            viewer's local time zone.
          </li>
          <li>
            The route uses the current browser/device time as its live source.
          </li>
          <li>
            The secondary normal-time comparison helps explain the current beat
            without changing the @beats calculation.
          </li>
        </ul>
        <h3>Related clock formats</h3>
        <p>
          For a standard reference time, use the{" "}
          <a className="ilt-content-link" href="/utc-clock">
            UTC clock
          </a>
          . For a regular local digital display, try the{" "}
          <a className="ilt-content-link" href="/digital-clock">
            digital clock
          </a>
          . For Unix timestamps, use the{" "}
          <a className="ilt-content-link" href="/epoch-unix-time-clock">
            epoch Unix time clock
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}
