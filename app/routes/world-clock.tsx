import Stage4RouteContent from "~/clients/components/content/Stage4RouteContent";
// app/routes/world-clock.tsx
import type { Route } from "./+types/world-clock";
import { data as json } from "react-router";
import {
  useEffect,
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
/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "World Clock Online | Current Time in Multiple Cities";
  const description =
    "Compare current times across selected cities and IANA time zones with search, seconds, 12- or 24-hour format, copy, and fullscreen.";

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

function safeZoneLabel(zone: string) {
  const last = zone.split("/").pop() ?? zone;
  return last.replace(/_/g, " ");
}

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
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

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

    if (k === "f") {
      void fullscreen.toggle();
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
      fullscreen.exit();
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
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <label className="hidden sm:inline-flex cursor-pointer items-center gap-2 ilt-inline-pill px-3 py-1 text-sm font-semibold text-[var(--ilt-text-primary)]">
              <input
                className="cursor-pointer"
                type="checkbox"
                checked={use24h}
                onChange={(e) => setUse24h(e.target.checked)}
              />
              24-hour
            </label>

            <label className="hidden sm:inline-flex cursor-pointer items-center gap-2 ilt-inline-pill px-3 py-1 text-sm font-semibold text-[var(--ilt-text-primary)]">
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

      <div className={isFs ? "flex h-full flex-col" : "timer-list-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          className={[
            "timer-display-surface relative mt-4 flex flex-col text-[var(--ilt-text-primary)]",
            isFs ? "mx-2 sm:mx-4 flex-1 overflow-hidden" : "p-4 sm:p-6",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 360,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
          }}
          aria-live="off"
        >
          {/* Grid */}
          <div
            className={[
              "timer-list-grid order-1 grid gap-4",
              isFs
                ? "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "md:grid-cols-2 xl:grid-cols-3",
            ].join(" ")}
          >
            <div className="timer-list-row p-5">
              <div className="font-mono text-4xl font-extrabold tracking-widest text-[var(--ilt-text-primary)]">
                {rows.localText}
              </div>
              <div className="mt-3 text-lg font-extrabold text-[var(--ilt-text-primary)]">
                Your local time
              </div>
              <div className="mt-1 ilt-helper-text font-semibold">
                {statusLabel}
              </div>
            </div>

            {rows.items.length === 0 ? (
              <div className="timer-list-empty p-5">
                <div className="text-lg font-extrabold text-[var(--ilt-text-primary)]">
                  No cities selected
                </div>
                <p className="mt-2 text-sm text-[var(--ilt-text-secondary)]">
                  Pick a few cities above to start the world clock.
                </p>
              </div>
            ) : (
              rows.items.map((r) => (
                <div
                  key={r.id}
                  className={[
                    "timer-list-row p-5",
                    isFs ? "backdrop-blur" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "font-mono font-extrabold tracking-widest text-[var(--ilt-text-primary)]",
                      isFs ? "text-5xl sm:text-6xl" : "text-4xl",
                    ].join(" ")}
                  >
                    {r.timeText}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mt-3 text-lg font-extrabold text-[var(--ilt-text-primary)]">
                        {r.name}
                      </div>
                      <div className="mt-1 ilt-helper-text font-semibold">
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

                </div>
              ))
            )}
          </div>
        </div>

        {!isFs && (
          <>
            <SettingGroup
              title="Cities and time zones"
              description="Search, add, or remove cities. Selected city rows update live above."
            >
              <SettingRow>
                <Field
                  label="Search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type: London, Tokyo, America, Europe..."
                />
              </SettingRow>
              <div className="flex flex-wrap items-center justify-center gap-2">
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
            </SettingGroup>

            <SettingGroup title="World clock settings">
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
                <Toggle
                  label="24-hour time"
                  checked={use24h}
                  onCheckedChange={setUse24h}
                />
                <Toggle
                  label="Show seconds"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-list-actions">
              <Btn kind="ghost" onClick={resetDefault} className="py-2">
                Reset
              </Btn>
              <Btn kind="ghost" onClick={clearAll} className="py-2">
                Clear
              </Btn>
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

            <ShortcutHint className="timer-list-shortcut">
              Shortcuts: F fullscreen, T 24-hour, S seconds, C copy, R reset,
              X clear
            </ShortcutHint>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              F fullscreen / T 24-hour / S seconds / C copy / R reset / X clear
            </div>
            <div className="ilt-helper-text font-semibold">
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
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<WorldClockCard initialNowISO={nowISO} />}
        title="World Clock"
        description="Track current time across selected cities with search, 12/24-hour mode, seconds, copy, reset, clear, and fullscreen."
      />

      <SeoBand>
        <Stage4RouteContent routePath="/world-clock" />
        <ContentSection>
          <p>
            If current times are not enough and you need to choose a future
            meeting slot, use the{" "}
            <a className="ilt-content-link" href="/time-zone-meeting-planner">
              time zone meeting planner
            </a>{" "}
            to compare dates, duration, and local work-hour windows.
          </p>
          <p>
            Need seconds or milliseconds visible on every selected city row?
            Try the{" "}
            <a className="ilt-content-link" href="/world-clock">
              world clock with seconds
            </a>{" "}
            or the{" "}
            <a className="ilt-content-link" href="/world-clock-with-milliseconds">
              world clock with milliseconds
            </a>
            .
          </p>
        </ContentSection>
      </SeoBand>

    </PageShell>
  );
}
