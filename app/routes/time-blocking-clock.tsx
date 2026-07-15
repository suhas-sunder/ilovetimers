// app/routes/time-blocking-clock.tsx
import type { Route } from "./+types/time-blocking-clock";
import { json } from "@remix-run/node";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";
import {
  Button as Btn,
  ControlGroup,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SeoBand,
  Toggle,
  ToolFrame as Card,
  ToolHero,
  UtilityResultRow,
  ShortcutHint,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

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

/* =========================================================
   CARD
========================================================= */
const LS_KEY = "ilovetimers:time-blocking-clock:v2";

const DEFAULT_BLOCKS: Block[] = sortBlocks(
  [
    {
      id: "deep-work",
      title: "Deep Work",
      startMin: 9 * 60,
      endMin: 11 * 60,
      notes: "",
    },
    {
      id: "admin",
      title: "Admin",
      startMin: 11 * 60,
      endMin: 11 * 60 + 45,
      notes: "",
    },
    {
      id: "break",
      title: "Break",
      startMin: 12 * 60,
      endMin: 12 * 60 + 30,
      notes: "",
    },
  ].map(normalizeBlock),
);

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
    <div className={isActive ? "timer-list-row ilt-surface-accent p-4" : "timer-list-row p-4"}>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Title"
            value={block.title}
            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
          />

          <Field
            label="Start"
            value={startStr}
            onChange={(e) => setStartStr(e.target.value)}
            onBlur={commitStart}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                (e.currentTarget as HTMLInputElement).blur();
            }}
            inputMode="numeric"
            placeholder="09:00"
          />

          <Field
            label="End"
            value={endStr}
            onChange={(e) => setEndStr(e.target.value)}
            onBlur={commitEnd}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                (e.currentTarget as HTMLInputElement).blur();
            }}
            inputMode="numeric"
            placeholder="10:30"
          />

          <div className="sm:col-span-3">
            <Field
              label="Notes"
              value={block.notes}
              onChange={(e) => onUpdate(block.id, { notes: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Btn kind="ghost" onClick={() => onRemove(block.id)}>
            Delete
          </Btn>
        </div>
      </div>

      <div className="ilt-helper-text mt-3 font-semibold">
        {minutesToHHMM(block.startMin)}-{minutesToHHMM(block.endMin)}
      </div>
    </div>
  );
}

function TimeBlockingClockCard({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [live, setLive] = useState(true);

  const [blocks, setBlocks] = useState<Block[]>(() => DEFAULT_BLOCKS);

  const [copied, setCopied] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

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
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 64 : 76,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "c") {
      void onCopy();
    } else if (k === "a") {
      addBlock();
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
        title="Time Blocking Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Toggle
              label="Live"
              checked={live}
              onCheckedChange={setLive}
              className="py-1 text-xs"
            />

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

      <div className={isFs ? "flex h-full flex-col" : "timer-list-stack flex h-full flex-col"}>
        {!isFs && (
          <>
            <ControlGroup className="timer-list-actions">
              <Toggle label="Live" checked={live} onCheckedChange={setLive} />

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
                  void fullscreen.toggle()
                }
              >
                Fullscreen
              </Btn>
            </ControlGroup>

            <ShortcutHint className="timer-list-shortcut order-2">
              F fullscreen / C copy / A add block
            </ShortcutHint>
          </>
        )}

        {/* Display */}
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "order-1 timer-display-surface relative mt-4 flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
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
        >
          <div className="timer-list-label ilt-content-label">
            {statusLabel}
          </div>

          <span
            data-primary-display-value
            ref={timeTextRef}
            className={[
              "timer-list-value mt-2 inline-block text-center font-mono font-extrabold tracking-widest",
              isFs ? "sm:tracking-[0.18em]" : "",
            ].join(" ")}
            style={{
              fontSize: displayFitPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeStr}
          </span>

          <div className="timer-list-context mt-3 text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {dateStr}
          </div>

          {activeBlock ? (
            <div className="ilt-inline-pill mt-4 max-w-full px-4 py-2 text-sm font-semibold">
              Active block:{" "}
              <span className="font-extrabold">{activeBlock.title}</span>
            </div>
          ) : (
            <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)]">
              No active block.
            </div>
          )}

          {copied && (
            <div className="mt-3 text-xs font-bold text-[var(--ilt-text-secondary)]">
              {copied}
            </div>
          )}

        </div>

        {/* Blocks (normal only) */}
        {!isFs && (
          <div className="timer-list-panel order-2 mt-5 p-4">
            <UtilityResultRow>
              <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                Today's blocks
              </div>
              <div className="ilt-helper-text font-semibold">
                Auto-sorted by start time
              </div>
            </UtilityResultRow>

            {blocks.length === 0 ? (
              <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
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
            <div className="text-xs text-[var(--ilt-text-secondary)] sm:text-sm">
              F fullscreen | C copy | A add block
            </div>
            <div className="text-xs font-semibold text-[var(--ilt-text-secondary)]">
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
  loaderData: { nowISO },
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
        display={<TimeBlockingClockCard initialNowISO={nowISO} />}
        title="Time Blocking Clock (Daily Schedule)"
        description="See the current time, active block, progress through the day, and edit or copy a simple daily time-block schedule."
      />

      <SeoBand title="How this clock works">
        <p>
          Use this time-blocking clock to keep a simple daily schedule visible
          while you work. Add and edit blocks, track the current block against
          the live clock, copy the plan, and use fullscreen when the schedule
          needs to stay visible.
        </p>
        <h3>How it differs from Pomodoro</h3>
        <p>
          Pomodoro timers repeat a work/break rhythm. This clock follows a
          schedule you define, so the important question is which block is active
          now, when it started, and when the next boundary arrives. It can help
          organize a day, but it does not guarantee productivity outcomes.
        </p>
        <h3>Schedule editing tips</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Keep block names short so the current block remains readable in the
            main display.
          </li>
          <li>
            Use realistic start and end times so block boundaries match how the
            day is actually planned.
          </li>
          <li>
            Copy the schedule when you want a plain-text version for notes,
            messages, or a daily plan.
          </li>
        </ul>
        <h3>Related planning tools</h3>
        <p>
          For structured work and break phases, use the{" "}
          <a className="ilt-content-link" href="/productivity-timer">
            productivity timer
          </a>
          . For a classic focus cycle, try the{" "}
          <a className="ilt-content-link" href="/pomodoro-timer">
            Pomodoro timer
          </a>
          . For a single deep-work block, use the{" "}
          <a className="ilt-content-link" href="/focus-session-timer">
            focus session timer
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}
