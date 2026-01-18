// app/routes/time-blocking-clock.tsx
import type { Route } from "./+types/time-blocking-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Time-Blocking Clock | Live Clock + Simple Day Blocks (Fullscreen)";
  const description =
    "Free time-blocking clock: a live clock with an editable schedule. Add time blocks, set start and end, highlight the current block, copy your plan, and use fullscreen.";
  const url = "https://ilovetimers.com/time-blocking-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "time blocking clock",
        "time blocking planner",
        "time block schedule",
        "daily schedule blocks",
        "time blocking template",
        "time blocks",
        "focus schedule",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `https://ilovetimers.com/og-image.jpg` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" },
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

/* =========================================================
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
}) => (
  <div
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   CARD
========================================================= */
const LS_KEY = "ilovetimers:time-blocking-clock:v1";

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

  const fsRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(t);
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
      const parsed = JSON.parse(raw) as { blocks?: Block[] } | null;
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
      window.localStorage.setItem(LS_KEY, JSON.stringify({ blocks }));
    } catch {
      // ignore
    }
  }, [blocks]);

  const nowMin = useMemo(() => minutesSinceMidnight(now), [now]);

  const activeId = useMemo(() => {
    const sorted = sortBlocks(blocks);
    const hit = sorted.find((b) => nowMin >= b.startMin && nowMin < b.endMin);
    return hit?.id ?? null;
  }, [blocks, nowMin]);

  const timeStr = useMemo(() => {
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }, [now]);

  const dateStr = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(now);
  }, [now]);

  const activeTitle = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((b) => b.id === activeId)?.title ?? "Block";
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
    const start = clamp(
      Math.floor(now.getHours() * 60 + now.getMinutes()),
      0,
      1439,
    );
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key.toLowerCase() === "f" && fsRef.current) {
      toggleFullscreen(fsRef.current);
    } else if (e.key.toLowerCase() === "c") {
      void onCopy();
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Time-Blocking Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Live clock plus editable time blocks. Add, edit, copy, and
            fullscreen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
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
            onClick={() => fsRef.current && toggleFullscreen(fsRef.current)}
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      <div
        ref={fsRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 260 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen [data-shell="normal"]{display:none;}
              [data-fs-container]:fullscreen [data-shell="fullscreen"]{
                display:flex;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                padding:4vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1400px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:16px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 900 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.14em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(96px, 16vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.08em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 clamp(14px, 2.2vw, 24px)/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.88;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.78;
                text-align:center;
              }
            `,
          }}
        />

        <div
          data-shell="normal"
          className="h-full w-full flex-col items-center justify-center p-6"
          style={{ minHeight: 260 }}
        >
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Current time
          </div>

          <div className="mt-3 font-mono text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-widest">
            {timeStr}
          </div>

          <div className="mt-2 text-sm font-semibold text-amber-900">
            {dateStr}
          </div>

          {activeTitle ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-950">
              Active block:{" "}
              <span className="font-extrabold">{activeTitle}</span>
            </div>
          ) : (
            <div className="mt-4 text-sm font-semibold text-slate-700">
              No active block.
            </div>
          )}

          <div className="mt-5 rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs font-semibold text-amber-950 text-center">
            Shortcuts: F fullscreen · C copy
          </div>

          {copied && (
            <div className="mt-2 text-xs font-bold text-amber-900">
              {copied}
            </div>
          )}
        </div>

        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Time-Blocking Clock</div>
            <div className="fs-time">{timeStr}</div>
            <div className="fs-sub">
              {activeTitle ? `Active: ${activeTitle}` : "No active block"}
            </div>
            <div className="fs-help">F fullscreen · C copy</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-amber-950">Today’s blocks</h3>
          <div className="text-xs font-semibold text-slate-600">
            Auto-sorted by start time
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {blocks.length === 0 ? (
            <div className="text-sm text-slate-600">
              No blocks yet. Click <strong>Add block</strong>.
            </div>
          ) : (
            sortBlocks(blocks).map((b) => {
              const active = b.id === activeId;
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-4 ${
                    active
                      ? "border-amber-500 bg-amber-50"
                      : "border-amber-200 bg-white"
                  }`}
                >
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                          Title
                        </div>
                        <input
                          value={b.title}
                          onChange={(e) =>
                            updateBlock(b.id, { title: e.target.value })
                          }
                          className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                          Start
                        </div>
                        <input
                          value={minutesToHHMM(b.startMin)}
                          onChange={(e) => {
                            const v = parseHHMM(e.target.value);
                            if (v == null) return;
                            updateBlock(b.id, { startMin: v });
                          }}
                          className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                          End
                        </div>
                        <input
                          value={minutesToHHMM(b.endMin)}
                          onChange={(e) => {
                            const v = parseHHMM(e.target.value);
                            if (v == null) return;
                            updateBlock(b.id, { endMin: v });
                          }}
                          className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                          Notes
                        </div>
                        <input
                          value={b.notes}
                          onChange={(e) =>
                            updateBlock(b.id, { notes: e.target.value })
                          }
                          placeholder="Optional"
                          className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Btn kind="ghost" onClick={() => removeBlock(b.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    {minutesToHHMM(b.startMin)}-{minutesToHHMM(b.endMin)}
                  </div>
                </div>
              );
            })
          )}
        </div>
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
  const url = "https://ilovetimers.com/time-blocking-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Time-Blocking Clock",
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
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Time-Blocking Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is time blocking?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Time blocking is planning your day by assigning tasks to specific time ranges (blocks) so you focus on one thing at a time.",
            },
          },
          {
            "@type": "Question",
            name: "Can I copy my plan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Click Copy or press C while the card is focused to copy your blocks as plain text.",
            },
          },
          {
            "@type": "Question",
            name: "Does it save my blocks?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Your blocks are saved in your browser on this device.",
            },
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Time-Blocking Clock",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Time-Blocking Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Time-Blocking Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live clock plus editable blocks for planning your day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <TimeBlockingClockCard />
      </section>


      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="text-xs text-slate-600">Build: {nowISO}</div>
      </section>
      <TimeBlockingFaqSection />
    </main>
  );
}
/* =========================================================
   FAQ (VISIBLE) + JSON-LD
========================================================= */

const TIME_BLOCKING_FAQ = [
  {
    q: "What is time blocking?",
    a: "Time blocking is planning your day by assigning tasks to specific time ranges (blocks) so you focus on one thing at a time.",
  },
  {
    q: "Can I copy my plan?",
    a: "Yes. Click Copy or press C while the main card is focused to copy your blocks as plain text.",
  },
  {
    q: "Does it save my blocks?",
    a: "Yes. Your blocks are saved in your browser on this device (local storage). Clearing site data or using another device won’t carry them over.",
  },
  {
    q: "How does the active block highlight work?",
    a: "The page checks the current time and highlights the block whose start and end time contains ‘now’. If no block matches, it shows ‘No active block.’",
  },
  {
    q: "What are the keyboard shortcuts?",
    a: "F toggles fullscreen and C copies your plan while the main card is focused.",
  },
] as const;

function TimeBlockingFaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TIME_BLOCKING_FAQ.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="text-2xl font-bold text-amber-950">Time-Blocking FAQ</h2>

      <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
        {TIME_BLOCKING_FAQ.map((it, i) => (
          <details key={i}>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              {it.q}
            </summary>
            <div className="px-5 pb-4 text-amber-800 leading-relaxed">
              {it.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
