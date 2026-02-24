// app/routes/time-blocking-clock.tsx
import type { Route } from "./+types/time-blocking-clock";
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
  const title = "Time Blocking Clock (Daily Schedule, Fullscreen)";
  const description =
    "Plan your day with a live time-blocking clock. Create simple time blocks, see the current block at a glance, and stay on schedule with a clear fullscreen view.";

  const url = "https://www.ilovetimers.com/time-blocking-clock";

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

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

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

function minutesSinceMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

function minutesToHHMM(total: number) {
  const t = clamp(Math.floor(total), 0, 1440);
  if (t === 1440) return "24:00";
  const hh = Math.floor(t / 60);
  const mm = t % 60;
  return `${pad2(hh)}:${pad2(mm)}`;
}

function parseHHMM(v: string) {
  const s = v.trim();
  if (s === "24:00") return 1440;
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

type Block = {
  id: string;
  title: string;
  startMin: number; // 0..1439
  endMin: number; // 1..1440
  notes: string;
};

function normalizeBlock(b: Block): Block {
  const startMin = clamp(Math.floor(b.startMin), 0, 1439);
  const endMinRaw = clamp(Math.floor(b.endMin), 1, 1440);
  const endMin = Math.max(endMinRaw, startMin + 1);
  return { ...b, startMin, endMin };
}

function sortBlocks(blocks: Block[]) {
  return [...blocks].sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return a.endMin - b.endMin;
  });
}

function formatClock(now: Date) {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(
    now.getSeconds(),
  )}`;
}

function formatDate(now: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(now);
}

/**
 * Fit a single-line clock string into its container by adjusting font size.
 * - ResizeObserver + rAF
 * - Binary search for max font-size that fits width + height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
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
   CARD
========================================================= */
const LS_KEY = "ilovetimers:time-blocking-clock:v2";

function BlockRow({
  block,
  isActive,
  onUpdate,
  onRemove,
}: {
  block: Block;
  isActive: boolean;
  onUpdate: (id: string, patch: Partial<Block>) => void;
  onRemove: (id: string) => void;
}) {
  const [startStr, setStartStr] = useState(() => minutesToHHMM(block.startMin));
  const [endStr, setEndStr] = useState(() => minutesToHHMM(block.endMin));

  useEffect(() => {
    setStartStr(minutesToHHMM(block.startMin));
  }, [block.startMin]);

  useEffect(() => {
    setEndStr(minutesToHHMM(block.endMin));
  }, [block.endMin]);

  const commitStart = () => {
    const v = parseHHMM(startStr);
    if (v == null) {
      setStartStr(minutesToHHMM(block.startMin));
      return;
    }
    onUpdate(block.id, { startMin: v });
  };

  const commitEnd = () => {
    const v = parseHHMM(endStr);
    if (v == null) {
      setEndStr(minutesToHHMM(block.endMin));
      return;
    }
    onUpdate(block.id, { endMin: v });
  };

  return (
    <div
      className={[
        "rounded-2xl border p-4",
        isActive ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Title
            </div>
            <input
              value={block.title}
              onChange={(e) => onUpdate(block.id, { title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Start
            </div>
            <input
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              onBlur={commitStart}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  (e.currentTarget as HTMLInputElement).blur();
              }}
              inputMode="numeric"
              placeholder="09:00"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              End
            </div>
            <input
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              onBlur={commitEnd}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  (e.currentTarget as HTMLInputElement).blur();
              }}
              inputMode="numeric"
              placeholder="10:30"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
          </div>

          <div className="sm:col-span-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Notes
            </div>
            <input
              value={block.notes}
              onChange={(e) => onUpdate(block.id, { notes: e.target.value })}
              placeholder="Optional"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Btn kind="ghost" onClick={() => onRemove(block.id)}>
            Delete
          </Btn>
        </div>
      </div>

      <div className="mt-3 text-xs font-semibold text-slate-600">
        {minutesToHHMM(block.startMin)}-{minutesToHHMM(block.endMin)}
      </div>
    </div>
  );
}

function TimeBlockingClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [live, setLive] = useState(true);

  const [blocks, setBlocks] = useState<Block[]>(() =>
    sortBlocks(
      [
        {
          id: uid(),
          title: "Deep Work",
          startMin: 9 * 60,
          endMin: 11 * 60,
          notes: "",
        },
        {
          id: uid(),
          title: "Admin",
          startMin: 11 * 60,
          endMin: 11 * 60 + 45,
          notes: "",
        },
        {
          id: uid(),
          title: "Break",
          startMin: 12 * 60,
          endMin: 12 * 60 + 30,
          notes: "",
        },
      ].map(normalizeBlock),
    ),
  );

  const [copied, setCopied] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Snappy clock updates: align to next tick, then update on a short interval.
  useEffect(() => {
    if (!live) return;

    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const start = () => {
      setNow(new Date());

      const msToNext = 1000 - (Date.now() % 1000);
      timeoutId = window.setTimeout(() => {
        setNow(new Date());
        intervalId = window.setInterval(() => setNow(new Date()), 250);
      }, msToNext);
    };

    start();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [live]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        blocks?: Block[];
        live?: boolean;
      } | null;
      if (typeof parsed?.live === "boolean") setLive(parsed.live);

      if (!parsed?.blocks || !Array.isArray(parsed.blocks)) return;
      const cleaned = parsed.blocks
        .filter(Boolean)
        .map((b) => ({
          id: String((b as any).id ?? uid()),
          title: String((b as any).title ?? "Block"),
          startMin: Number((b as any).startMin ?? 0),
          endMin: Number((b as any).endMin ?? 1),
          notes: String((b as any).notes ?? ""),
        }))
        .map(normalizeBlock);
      setBlocks(sortBlocks(cleaned));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify({ blocks, live }));
    } catch {
      // ignore
    }
  }, [blocks, live]);

  const nowMin = useMemo(() => minutesSinceMidnight(now), [now]);

  const activeId = useMemo(() => {
    const sorted = sortBlocks(blocks);
    const hit = sorted.find((b) => nowMin >= b.startMin && nowMin < b.endMin);
    return hit?.id ?? null;
  }, [blocks, nowMin]);

  const timeStr = useMemo(() => formatClock(now), [now]);
  const dateStr = useMemo(() => formatDate(now), [now]);

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((b) => b.id === activeId) ?? null;
  }, [blocks, activeId]);

  const buildCopyText = useMemo(() => {
    const sorted = sortBlocks(blocks);
    const lines: string[] = [];
    lines.push(`Time Blocks (${dateStr})`);
    lines.push("");
    for (const b of sorted) {
      const line =
        `${minutesToHHMM(b.startMin)}-${minutesToHHMM(b.endMin)}  ${b.title}` +
        (b.notes.trim() ? ` - ${b.notes.trim()}` : "");
      lines.push(line);
    }
    return lines.join("\n");
  }, [blocks, dateStr]);

  const addBlock = () => {
    const start = clamp(now.getHours() * 60 + now.getMinutes(), 0, 1439);
    const b: Block = normalizeBlock({
      id: uid(),
      title: "New Block",
      startMin: start,
      endMin: clamp(start + 30, 1, 1440),
      notes: "",
    });
    setBlocks((prev) => sortBlocks([...prev, b]));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) =>
      sortBlocks(
        prev.map((b) => (b.id === id ? normalizeBlock({ ...b, ...patch }) : b)),
      ),
    );
  };

  const clearBlocks = () => setBlocks([]);

  const onCopy = async () => {
    const ok = await copyToClipboard(buildCopyText);
    if (ok) setCopied("Copied");
  };

  const statusLabel = live ? "Live" : "Paused";

  const displayFitPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeStr, isFs, live, blocks.length, activeId],
    minPx: 56,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 64 : 76,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "c") {
      void onCopy();
    } else if (k === "a") {
      addBlock();
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
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
        title="Time Blocking Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />
              Live
            </label>

            <Btn kind="ghost" onClick={addBlock} className="py-1 text-sm">
              Add
            </Btn>

            <Btn kind="ghost" onClick={onCopy} className="py-1 text-sm">
              Copy
            </Btn>

            <Btn kind="ghost" onClick={clearBlocks} className="py-1 text-sm">
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
                Time Blocking Clock
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Live clock plus editable time blocks. Add, edit, copy, and use a
                big fullscreen view.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                />
                Live
              </label>

              <Btn kind="ghost" onClick={addBlock}>
                Add block
              </Btn>

              <Btn kind="ghost" onClick={onCopy}>
                Copy
              </Btn>

              <Btn kind="ghost" onClick={clearBlocks}>
                Clear
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 300,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
          }}
          aria-live="polite"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold tracking-widest",
              isFs ? "sm:tracking-[0.18em]" : "",
            ].join(" ")}
            style={{
              fontSize: `${displayFitPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeStr}
          </span>

          <div className="mt-3 text-sm font-semibold text-slate-600">
            {dateStr}
          </div>

          {activeBlock ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900">
              Active block:{" "}
              <span className="font-extrabold">{activeBlock.title}</span>
            </div>
          ) : (
            <div className="mt-4 text-sm font-semibold text-slate-600">
              No active block.
            </div>
          )}

          {copied && (
            <div className="mt-3 text-xs font-bold text-slate-700">
              {copied}
            </div>
          )}

          {/* Fullscreen hint chips */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Shortcuts
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    F fullscreen · C copy · A add block
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  {activeBlock ? "Active" : "No active"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blocks (normal only) */}
        {!isFs && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">
                Today’s blocks
              </div>
              <div className="text-xs font-semibold text-slate-600">
                Auto-sorted by start time
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="mt-3 text-sm text-slate-700">
                No blocks yet. Click <strong>Add block</strong>.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {sortBlocks(blocks).map((b) => (
                  <BlockRow
                    key={b.id}
                    block={b}
                    isActive={b.id === activeId}
                    onUpdate={updateBlock}
                    onRemove={removeBlock}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen bottom bar */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              F fullscreen · C copy · A add block
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {activeBlock ? `Active: ${activeBlock.title}` : "No active block"}
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
export default function TimeBlockingClockPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/time-blocking-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Time Blocking Clock",
        url,
        description:
          "Time-blocking clock with a live clock and editable daily blocks. Copy your plan and use fullscreen.",
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
            name: "Time Blocking Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Time Blocking Clock",
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

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <TimeBlockingClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Time Blocking Clock</span>
        </p>
      </section>
    </main>
  );
}
