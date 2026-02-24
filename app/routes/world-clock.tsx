// app/routes/world-clock.tsx
import type { Route } from "./+types/world-clock";
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "World Clock (Current Time in Cities, Live)";
  const description =
    "See the current time in cities around the world. Clean live world clock showing local times at a glance in a big, readable display.";

  const url = "https://www.ilovetimers.com/world-clock";

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

function safeZoneLabel(zone: string) {
  const last = zone.split("/").pop() ?? zone;
  return last.replace(/_/g, " ");
}

// Cache Intl formatters so times render snappy (especially with many cities).
type FmtKey = string;
const fmtCache = new Map<FmtKey, Intl.DateTimeFormat>();
function getTimeFormatter(params: {
  timeZone?: string;
  use24h: boolean;
  showSeconds: boolean;
}) {
  const { timeZone, use24h, showSeconds } = params;
  const key = `${timeZone ?? "local"}|${use24h ? "24" : "12"}|${
    showSeconds ? "sec" : "nosec"
  }`;

  const cached = fmtCache.get(key);
  if (cached) return cached;

  const fmt = new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: !use24h,
  });

  fmtCache.set(key, fmt);
  return fmt;
}

/* =========================================================
   DATA
========================================================= */
type City = {
  id: string;
  name: string;
  timeZone: string;
  note?: string;
};

const POPULAR: City[] = [
  { id: "toronto", name: "Toronto", timeZone: "America/Toronto" },
  { id: "newyork", name: "New York", timeZone: "America/New_York" },
  { id: "losangeles", name: "Los Angeles", timeZone: "America/Los_Angeles" },
  { id: "london", name: "London", timeZone: "Europe/London" },
  { id: "paris", name: "Paris", timeZone: "Europe/Paris" },
  { id: "berlin", name: "Berlin", timeZone: "Europe/Berlin" },
  { id: "dubai", name: "Dubai", timeZone: "Asia/Dubai" },
  { id: "mumbai", name: "Mumbai", timeZone: "Asia/Kolkata", note: "India" },
  { id: "singapore", name: "Singapore", timeZone: "Asia/Singapore" },
  { id: "tokyo", name: "Tokyo", timeZone: "Asia/Tokyo" },
  { id: "sydney", name: "Sydney", timeZone: "Australia/Sydney" },
  { id: "auckland", name: "Auckland", timeZone: "Pacific/Auckland" },
];

const DEFAULT_SELECTED_IDS = [
  "toronto",
  "newyork",
  "losangeles",
  "london",
  "tokyo",
];

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
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={[
      "cursor-pointer rounded-full border px-3 py-1 text-sm font-semibold",
      active
        ? "border-amber-200 bg-amber-50 text-slate-900 hover:bg-amber-100"
        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
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
   WORLD CLOCK CARD
========================================================= */
function WorldClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [use24h, setUse24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedIds, setSelectedIds] =
    useState<string[]>(DEFAULT_SELECTED_IDS);

  // Initialize from loader time to avoid hydration mismatch.
  const [now, setNow] = useState<Date>(() => new Date(initialNowISO));

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  // Tick aligned to the next boundary. If seconds are hidden, tick on minute boundary.
  useEffect(() => {
    let t: number | null = null;

    const sync = () => {
      const n = new Date();
      setNow(n);

      const ms = n.getMilliseconds();
      const msToNextSecond = 1000 - ms;

      if (showSeconds) {
        t = window.setTimeout(sync, msToNextSecond);
      } else {
        const sec = n.getSeconds();
        const msToNextMinute = (60 - sec) * 1000 - ms;
        t = window.setTimeout(sync, Math.max(50, msToNextMinute));
      }
    };

    sync();
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [showSeconds]);

  const selectedCities = useMemo(() => {
    const set = new Set(selectedIds);
    return POPULAR.filter((c) => set.has(c.id));
  }, [selectedIds]);

  const filteredPopular = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR;

    return POPULAR.filter((c) => {
      const hay = `${c.name} ${c.timeZone} ${c.note ?? ""}`.toLowerCase();
      return (
        hay.includes(q) || safeZoneLabel(c.timeZone).toLowerCase().includes(q)
      );
    });
  }, [query]);

  const rows = useMemo(() => {
    const localFmt = getTimeFormatter({ use24h, showSeconds });
    const localText = localFmt.format(now);

    const items = selectedCities.map((c) => {
      const fmt = getTimeFormatter({
        timeZone: c.timeZone,
        use24h,
        showSeconds,
      });
      return {
        ...c,
        timeText: fmt.format(now),
      };
    });

    return { localText, items };
  }, [selectedCities, now, use24h, showSeconds]);

  async function copy() {
    try {
      const payload = rows.items
        .map((r) => `${r.name}: ${r.timeText} (${r.timeZone})`)
        .join("\n");
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const toggleCity = (id: string) => {
    setSelectedIds((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const clearAll = () => setSelectedIds([]);
  const resetDefault = () => setSelectedIds(DEFAULT_SELECTED_IDS);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "t") {
      setUse24h((v) => !v);
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "c") {
      copy();
    } else if (k === "r") {
      resetDefault();
    } else if (k === "x") {
      clearAll();
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const statusLabel =
    rows.items.length > 0
      ? `${rows.items.length} selected`
      : "No cities selected";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="World Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <label className="hidden sm:inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              <input
                className="cursor-pointer"
                type="checkbox"
                checked={use24h}
                onChange={(e) => setUse24h(e.target.checked)}
              />
              24-hour
            </label>

            <label className="hidden sm:inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              <input
                className="cursor-pointer"
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
              />
              Seconds
            </label>

            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                World Clock
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Live time in multiple cities. Add, remove, copy, and go
                fullscreen.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  checked={use24h}
                  onChange={(e) => setUse24h(e.target.checked)}
                />
                24-hour
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                />
                Seconds
              </label>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>

              <Btn kind="ghost" onClick={copy} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          className={[
            "relative mt-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-950",
            isFs ? "mx-2 sm:mx-4 flex-1 overflow-hidden" : "p-4 sm:p-6",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 360,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
          }}
          aria-live="polite"
        >
          {/* Top row: search + local time */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full lg:max-w-xl">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Cities and time zones
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Shortcuts: F fullscreen · T 24-hour · S seconds · C copy · R
                reset · X clear
              </p>

              <label className="mt-4 block text-sm font-semibold text-slate-900">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type: London, Tokyo, America, Europe..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Your local time
              </div>
              <div className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-slate-900">
                {rows.localText}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-600">
                {statusLabel}
              </div>
            </div>
          </div>

          {/* Popular chips */}
          <div className="mt-5">
            <div className="text-sm font-extrabold text-slate-900">Popular</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {filteredPopular.map((c) => (
                <Chip
                  key={c.id}
                  active={selectedIds.includes(c.id)}
                  onClick={() => toggleCity(c.id)}
                  title={`${c.timeZone}${c.note ? ` (${c.note})` : ""}`}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          {/* Action row */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Btn kind="ghost" onClick={resetDefault} className="py-2">
              Reset
            </Btn>
            <Btn kind="ghost" onClick={clearAll} className="py-2">
              Clear
            </Btn>
          </div>

          {/* Grid */}
          <div
            className={[
              "mt-6 grid gap-4",
              isFs
                ? "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "md:grid-cols-2 xl:grid-cols-3",
            ].join(" ")}
          >
            {rows.items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-lg font-extrabold text-slate-900">
                  No cities selected
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Pick a few cities above to start the world clock.
                </p>
              </div>
            ) : (
              rows.items.map((r) => (
                <div
                  key={r.id}
                  className={[
                    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
                    isFs ? "backdrop-blur" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-extrabold text-slate-900">
                        {r.name}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">
                        {r.timeZone}
                        {r.note ? ` · ${r.note}` : ""}
                      </div>
                    </div>
                    <Btn
                      kind="ghost"
                      onClick={() => toggleCity(r.id)}
                      className="py-2"
                    >
                      Remove
                    </Btn>
                  </div>

                  <div
                    className={[
                      "mt-4 font-mono font-extrabold tracking-widest text-slate-900",
                      isFs ? "text-5xl sm:text-6xl" : "text-4xl",
                    ].join(" ")}
                  >
                    {r.timeText}
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    Zone label: {safeZoneLabel(r.timeZone)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              F fullscreen · T 24-hour · S seconds · C copy · R reset · X clear
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
export default function WorldClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/world-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "World Clock",
        url,
        description:
          "Live world clock showing current time across multiple cities and time zones. Add cities, search, 12/24-hour toggle, seconds toggle, copy output, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "World Clock", item: url },
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
          <WorldClockCard initialNowISO={nowISO} />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">World Clock</span>
        </p>
      </section>
    </main>
  );
}
