// app/routes/epoch-unix-time-clock.tsx
import type { Route } from "./+types/epoch-unix-time-clock";
import { json } from "@remix-run/node";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/epoch-unix-time-clock/HowItWorks";
import Disclaimer from "~/clients/components/epoch-unix-time-clock/Disclaimer";
import FAQ from "~/clients/components/epoch-unix-time-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/epoch-unix-time-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/epoch-unix-time-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Unix Time Clock (Current Epoch Timestamp in Seconds & Milliseconds)";
  const description =
    "Free Unix time clock showing the current epoch timestamp in seconds and milliseconds. Copy buttons, local and UTC display, and a clean fullscreen view.";

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
    { rel: "canonical", href: url },

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

/**
 * Fit a single-line string into its container by adjusting font size.
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 28,
  maxPx = 420,
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
   EPOCH / UNIX TIME CLOCK CARD
========================================================= */
function EpochUnixTimeClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [mode, setMode] = useState<"live" | "freeze">("live");
  const [copied, setCopied] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

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
    maxPx: isFs ? 520 : 240,
    paddingAllowancePx: isFs ? 72 : 64,
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
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
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
        onExit={() => document.exitFullscreen().catch(() => {})}
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

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={mode === "live"}
                  onChange={(e) =>
                    setMode(e.target.checked ? "live" : "freeze")
                  }
                />
                Live
              </label>

              <Btn
                kind="ghost"
                onClick={snapNow}
                disabled={mode === "live"}
                className="py-2"
              >
                Snap now
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  void doCopy("Copied seconds", String(unixSeconds))
                }
                className="py-2"
              >
                Copy seconds
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  void doCopy("Copied milliseconds", String(unixMillis))
                }
                className="py-2"
              >
                Copy milliseconds
              </Btn>
            </div>

            <div className="sm:ml-auto flex items-center gap-2">
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
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
          }}
          aria-live="polite"
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

          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Unix Time (seconds) · {statusLabel}
          </div>

          <div
            ref={secondsBoxRef}
            className="mt-3 flex w-full max-w-6xl items-center justify-center"
            style={{ height: isFs ? "44vh" : "120px" }}
          >
            <span
              ref={secondsTextRef}
              className="inline-block text-center font-mono font-extrabold tracking-widest text-slate-950"
              style={{
                fontSize: `${secondsFitPx}px`,
                lineHeight: "1",
                transform: "translateZ(0)",
                whiteSpace: "nowrap",
              }}
            >
              {unixSeconds}
            </span>
          </div>

          <div className="mt-4 grid w-full max-w-5xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Milliseconds
              </div>
              <div className="mt-2 break-all font-mono text-xl font-extrabold tracking-wide text-slate-900 sm:text-2xl">
                {unixMillis}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Local time
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800">
                {localStr}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                UTC time
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800">
                {utcStr}
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700">
              Shortcuts: Space live or freeze · C copy seconds · M copy
              milliseconds · N snap now · F fullscreen
            </div>
          )}
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap to live or freeze · Space live or freeze · C copy seconds · M
              copy milliseconds · N snap now · F fullscreen
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
        description:
          "Live Unix timestamp clock showing epoch time in seconds and milliseconds, plus local and UTC date-time.",
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
        operatingSystem: "Web",
        url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
            Unix Time Clock (Epoch Timestamp)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Current epoch time in seconds and milliseconds, plus local and UTC
            time. Copy fast and go fullscreen.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <EpochUnixTimeClockCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Unix Time Clock</span>
        </p>

        <span className="sr-only">Build: {nowISO}</span>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}
