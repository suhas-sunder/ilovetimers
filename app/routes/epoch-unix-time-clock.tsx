// app/routes/epoch-unix-time-clock.tsx
import type { Route } from "./+types/epoch-unix-time-clock";
import { json } from "@remix-run/node";
import {
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
import HowItWorks from "~/clients/components/epoch-unix-time-clock/HowItWorks";
import FAQ from "~/clients/components/epoch-unix-time-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/epoch-unix-time-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/epoch-unix-time-clock/PopularUseCases";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

const REVIEW_DATE = { iso: "2026-07-15", label: "July 15, 2026" } as const;

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Unix Timestamp Clock | Current Epoch Time";
  const description =
    "View the current Unix timestamp in seconds and milliseconds with the matching UTC date and time.";

  const url = "https://www.ilovetimers.com/epoch-unix-time-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "unix time clock",
        "epoch time clock",
        "unix timestamp",
        "current unix time",
        "epoch timestamp",
        "unix time seconds",
        "unix time milliseconds",
        "epoch converter",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { tagName: "link", rel: "canonical", href: url },

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

function safeInt(n: number) {
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function formatDateTimeLocal(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function formatDateTimeUTC(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
    hour12: false,
  }).format(d);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* =========================================================
   EPOCH / UNIX TIME CLOCK CARD
========================================================= */
function EpochUnixTimeClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [mode, setMode] = useState<"live" | "freeze">("live");
  const [copied, setCopied] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const secondsBoxRef = useRef<HTMLDivElement>(null);
  const secondsTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (mode !== "live") return;
    const t = window.setInterval(() => setNow(new Date()), 50);
    return () => window.clearInterval(t);
  }, [mode]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const ms = now.getTime();
  const unixSeconds = useMemo(() => safeInt(ms / 1000), [ms]);
  const unixMillis = useMemo(() => safeInt(ms), [ms]);

  const localStr = useMemo(() => formatDateTimeLocal(now), [now]);
  const utcStr = useMemo(() => formatDateTimeUTC(now), [now]);

  const secondsFitPx = useFitText({
    containerRef: secondsBoxRef,
    textRef: secondsTextRef,
    deps: [unixSeconds, isFs, mode],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 72 : 64,
    fitAxis: "box",
  });

  const statusLabel = mode === "live" ? "Live" : "Frozen";

  const doCopy = async (label: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) setCopied(label);
  };

  function snapNow() {
    setNow(new Date());
  }

  function toggleLiveFreeze() {
    setMode((m) => (m === "live" ? "freeze" : "live"));
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      toggleLiveFreeze();
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      fullscreen.exit();
    } else if (k === "c") {
      void doCopy("Copied seconds", String(unixSeconds));
    } else if (k === "m") {
      void doCopy("Copied milliseconds", String(unixMillis));
    } else if (k === "n") {
      snapNow();
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
        title="Unix Time Clock (seconds)"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={toggleLiveFreeze}
              className="py-1 text-sm"
            >
              {mode === "live" ? "Freeze" : "Live"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => void doCopy("Copied seconds", String(unixSeconds))}
              className="py-1 text-sm"
            >
              Copy s
            </Btn>
            <Btn
              kind="ghost"
              onClick={() =>
                void doCopy("Copied milliseconds", String(unixMillis))
              }
              className="py-1 text-sm"
            >
              Copy ms
            </Btn>
            <Btn
              kind="ghost"
              onClick={snapNow}
              className="py-1 text-sm"
              disabled={mode === "live"}
            >
              Snap
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        <div
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="off"
          onClick={() => {
            if (isFs) toggleLiveFreeze();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to toggle Live or Freeze" : undefined}
        >
          {copied && (
            <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
              {copied}
            </div>
          )}

          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Unix Time (seconds) · {statusLabel}
          </div>

          <div
            ref={secondsBoxRef}
            className="timer-clock-value-wrap mt-3 flex w-full max-w-6xl items-center justify-center"
            style={{ height: isFs ? "44vh" : "clamp(150px, 13vw, 180px)" }}
          >
            <span
              ref={secondsTextRef}
              data-primary-display-value
              className="timer-clock-value inline-block text-center font-mono font-extrabold tracking-widest text-slate-950"
              style={{
                fontSize: secondsFitPx,
                lineHeight: "1",
                transform: "translateZ(0)",
                whiteSpace: "nowrap",
              }}
            >
              {unixSeconds}
            </span>
          </div>

          <div className="timer-clock-detail-grid timer-clock-support mt-4 grid w-full max-w-5xl gap-3 sm:grid-cols-3">
            <div className="timer-clock-panel rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Milliseconds
              </div>
              <div className="mt-2 break-all font-mono text-xl font-extrabold tracking-wide text-slate-900 sm:text-2xl">
                {unixMillis}
              </div>
            </div>

            <div className="timer-clock-panel rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Local time
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800">
                {localStr}
              </div>
            </div>

            <div className="timer-clock-panel rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                UTC time
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800">
                {utcStr}
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="hidden">
              Shortcuts: Space live or freeze · C copy seconds · M copy
              milliseconds · N snap now · F fullscreen
            </div>
          )}
        </div>

        {!isFs && (
          <>
            <SettingGroup title="Timestamp settings">
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
                <Toggle
                  label="Live timestamp"
                  checked={mode === "live"}
                  onCheckedChange={(checked) =>
                    setMode(checked ? "live" : "freeze")
                  }
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="solid" onClick={toggleLiveFreeze}>
                {mode === "live" ? "Freeze" : "Live"}
              </Btn>
              <Btn kind="ghost" onClick={snapNow} disabled={mode === "live"}>
                Snap now
              </Btn>
              <Btn
                kind="ghost"
                onClick={() =>
                  void doCopy("Copied seconds", String(unixSeconds))
                }
              >
                Copy seconds
              </Btn>
              <Btn
                kind="ghost"
                onClick={() =>
                  void doCopy("Copied milliseconds", String(unixMillis))
                }
              >
                Copy milliseconds
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
              Shortcuts: Space live/freeze, C copy seconds, M copy
              milliseconds, N snap now, F fullscreen
            </ShortcutHint>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap to live or freeze · Space live or freeze · C copy seconds · M
              copy milliseconds · N snap now · F fullscreen
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
export default function EpochUnixTimeClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/epoch-unix-time-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Unix Time Clock",
        url,
        dateModified: REVIEW_DATE.iso,
        description:
          "Show the device-derived current Unix timestamp in seconds and milliseconds with matching local and UTC date-time displays.",
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
            name: "Unix Time Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Unix Time Clock",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        url,
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
        display={<EpochUnixTimeClockCard initialNowISO={nowISO} />}
        title="Unix Time Clock (Epoch Timestamp)"
        description="Show the device-derived current Unix timestamp in seconds and milliseconds with matching UTC and local time, copy, freeze, and fullscreen controls."
      />
      <span className="sr-only">Build: {nowISO}</span>

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Need to convert a pasted epoch value into a readable date? Use the{" "}
            <a className="ilt-content-link" href="/unix-timestamp-converter">
              Unix timestamp converter
            </a>{" "}
            for seconds, milliseconds, UTC, local time, and ISO output.
          </p>
        </ContentSection>
        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            Current Unix and epoch values are generated from the device's
            current system time. If the device clock is incorrect, the current
            values shown here will inherit that offset.
          </p>
          <p>
            Seconds and milliseconds represent different units and should not
            be used interchangeably. The main display is labeled in seconds,
            while the supporting value is labeled in milliseconds.
          </p>
        </ToolTrustNote>
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
      </SeoBand>

    </PageShell>
  );
}
