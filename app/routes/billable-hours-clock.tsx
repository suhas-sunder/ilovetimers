// app/routes/billable-hours-clock.tsx
import type { Route } from "./+types/billable-hours-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import RelatedSites from "~/clients/components/navigation/RelatedSites";
import TimerMenuLinks from "~/clients/components/navigation/TimerMenuLinks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Billable Hours Clock | Multiple Billable Timers (Hourly Rate, Rounding, Fullscreen)";
  const description =
    "Free billable hours clock with multiple timers. Track billable time with hourly rate, rounding (none, 6-min, 10-min, 15-min), running totals, copy summaries, fullscreen display, and local storage.";
  const url = "https://ilovetimers.com/billable-hours-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "billable hours clock",
        "billable hours timer",
        "billable time tracker",
        "billable hours calculator",
        "billable hours counter",
        "consulting timer",
        "lawyer billable hours",
        "time tracking clock",
        "multiple billable timers",
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

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function msToHMS(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${pad2(m)}:${pad2(sec)}`;
}

function fmtMoney(amount: number, currency: string) {
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return safe.toFixed(2);
  }
}

function roundUpMs(ms: number, incrementMinutes: number) {
  if (incrementMinutes <= 0) return ms;
  const inc = incrementMinutes * 60_000;
  return Math.ceil(ms / inc) * inc;
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

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
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
  title,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const Chip = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
    }`}
  >
    {children}
  </button>
);

/* =========================================================
   TYPES + HELPERS
========================================================= */
type RoundMode = "none" | "6" | "10" | "15";

type BillableTimer = {
  id: string;
  name: string;
  note: string;
  hourlyRate: number;
  currency: string;
  roundMode: RoundMode;

  status: "idle" | "running" | "paused";
  elapsedMs: number;

  _runningSince?: number | null; // runtime-only
};

type PersistedStateV1 = {
  v: 1;
  activeTimerId: string | null;
  timers: Array<{
    id: string;
    name: string;
    note: string;
    hourlyRate: number;
    currency: string;
    roundMode: RoundMode;
    status: "idle" | "paused" | "running";
    elapsedMs: number;
    startedAtEpochMs: number | null;
  }>;
};

const LS_KEY = "ilovetimers:billable-hours-clock:v1";

function roundLabel(mode: RoundMode) {
  if (mode === "none") return "No rounding";
  if (mode === "6") return "6-min (0.1 hr)";
  if (mode === "10") return "10-min";
  return "15-min (0.25 hr)";
}

function roundIncMinutes(mode: RoundMode) {
  if (mode === "none") return 0;
  if (mode === "6") return 6;
  if (mode === "10") return 10;
  return 15;
}

function computeTimerDerived(t: BillableTimer) {
  const inc = roundIncMinutes(t.roundMode);
  const roundedMs = roundUpMs(t.elapsedMs, inc);
  const hours = roundedMs / 3_600_000;
  const total = hours * t.hourlyRate;
  return { roundedMs, hours, total };
}

function buildCopyText(t: BillableTimer) {
  const { roundedMs, hours, total } = computeTimerDerived(t);
  const lines: string[] = [];
  lines.push("Billable Timer");
  lines.push(`Name: ${t.name}`);
  if (t.note.trim()) lines.push(`Note: ${t.note.trim()}`);
  lines.push(`Elapsed: ${msToHMS(t.elapsedMs)}`);
  lines.push(`Billable: ${msToHMS(roundedMs)} (${roundLabel(t.roundMode)})`);
  lines.push(`Hours: ${hours.toFixed(2)}`);
  lines.push(`Rate: ${fmtMoney(t.hourlyRate, t.currency)} / hr`);
  lines.push(`Total: ${fmtMoney(total, t.currency)}`);
  return lines.join("\n");
}

function buildCopyAllText(timers: BillableTimer[]) {
  const lines: string[] = [];
  lines.push("Billable Timers");
  lines.push("");
  for (const t of timers) {
    const { roundedMs, hours, total } = computeTimerDerived(t);
    lines.push(`${t.name} — ${msToHMS(t.elapsedMs)} elapsed`);
    lines.push(
      `Billable: ${msToHMS(roundedMs)} (${roundLabel(t.roundMode)}) · ${hours.toFixed(
        2,
      )} hrs · ${fmtMoney(total, t.currency)}`,
    );
    if (t.note.trim()) lines.push(`Note: ${t.note.trim()}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

function newDefaultTimer(name = "Timer 1"): BillableTimer {
  return {
    id: uid(),
    name,
    note: "",
    hourlyRate: 150,
    currency: "USD",
    roundMode: "6",
    status: "idle",
    elapsedMs: 0,
    _runningSince: null,
  };
}

function fixTimerNameCollisions(timers: BillableTimer[]) {
  const used = new Set<string>();
  return timers.map((t, i) => {
    let name = (t.name || "").replace(/\s+/g, " ").trim() || `Timer ${i + 1}`;
    if (!used.has(name)) {
      used.add(name);
      return { ...t, name };
    }
    let k = 2;
    while (used.has(`${name} (${k})`)) k++;
    const n = `${name} (${k})`;
    used.add(n);
    return { ...t, name: n };
  });
}

/* =========================================================
   BILLABLE HOURS CLOCK (MULTI)
========================================================= */
function BillableHoursClockCard() {
  const [timers, setTimers] = useState<BillableTimer[]>(() =>
    fixTimerNameCollisions([newDefaultTimer("Timer 1")]),
  );
  const [activeId, setActiveId] = useState<string | null>(
    () => timers[0]?.id ?? null,
  );

  const fsRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);

  const [copied, setCopied] = useState<string | null>(null);

  const activeTimer = useMemo(
    () => timers.find((t) => t.id === activeId) ?? null,
    [timers, activeId],
  );

  // Hydrate once
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const saved = safeParseJSON<PersistedStateV1>(
      window.localStorage.getItem(LS_KEY),
    );
    if (
      !saved ||
      saved.v !== 1 ||
      !Array.isArray(saved.timers) ||
      saved.timers.length === 0
    )
      return;

    const now = Date.now();

    const hydratedTimers: BillableTimer[] = saved.timers.map((x, idx) => {
      const t: BillableTimer = {
        id: String(x.id ?? uid()),
        name: String(x.name ?? `Timer ${idx + 1}`),
        note: String(x.note ?? ""),
        hourlyRate: clamp(Number(x.hourlyRate ?? 0), 0, 1_000_000),
        currency: String(x.currency ?? "USD"),
        roundMode:
          x.roundMode === "none" ||
          x.roundMode === "6" ||
          x.roundMode === "10" ||
          x.roundMode === "15"
            ? x.roundMode
            : "6",
        status:
          x.status === "running" || x.status === "paused" || x.status === "idle"
            ? x.status
            : "idle",
        elapsedMs: Math.max(0, Number(x.elapsedMs ?? 0)),
        _runningSince: null,
      };

      if (t.status === "running") {
        const startedAt = Number(x.startedAtEpochMs ?? 0);
        if (Number.isFinite(startedAt) && startedAt > 0 && startedAt <= now) {
          t.elapsedMs = t.elapsedMs + (now - startedAt);
          t._runningSince = now;
        } else {
          t.status = "paused";
          t._runningSince = null;
        }
      }

      return t;
    });

    const fixed = fixTimerNameCollisions(hydratedTimers);
    setTimers(fixed);

    const active =
      saved.activeTimerId && fixed.some((t) => t.id === saved.activeTimerId)
        ? saved.activeTimerId
        : (fixed[0]?.id ?? null);
    setActiveId(active);
  }, []);

  // Persist state
  useEffect(() => {
    if (!hydratedRef.current) return;

    const now = Date.now();

    const toSave: PersistedStateV1 = {
      v: 1,
      activeTimerId: activeId,
      timers: timers.map((t) => ({
        id: t.id,
        name: t.name,
        note: t.note,
        hourlyRate: t.hourlyRate,
        currency: t.currency,
        roundMode: t.roundMode,
        status: t.status,
        elapsedMs: t.elapsedMs,
        startedAtEpochMs:
          t.status === "running" ? (t._runningSince ?? now) : null,
      })),
    };

    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [timers, activeId]);

  // RAF tick running timers
  useEffect(() => {
    const anyRunning = timers.some((t) => t.status === "running");
    if (!anyRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = () => {
      const now = Date.now();
      setTimers((prev) =>
        prev.map((t) => {
          if (t.status !== "running") return t;
          const since = t._runningSince ?? now;
          const delta = now - since;
          if (delta <= 0) return { ...t, _runningSince: now };
          return { ...t, elapsedMs: t.elapsedMs + delta, _runningSince: now };
        }),
      );
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [timers]);

  // Pause running timers when tab is hidden (prevents huge jumps on return)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "hidden") return;
      setTimers((prev) =>
        prev.map((t) =>
          t.status === "running"
            ? { ...t, status: "paused", _runningSince: null }
            : t,
        ),
      );
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Copy toast
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  // Derived totals
  const totalsAll = useMemo(() => {
    return timers.reduce(
      (acc, t) => {
        const { hours, total } = computeTimerDerived(t);
        acc.totalHours += hours;
        acc.totalAmountByCurrency[t.currency] =
          (acc.totalAmountByCurrency[t.currency] ?? 0) + total;
        return acc;
      },
      { totalHours: 0, totalAmountByCurrency: {} as Record<string, number> },
    );
  }, [timers]);

  const amountsByCurrency = useMemo(() => {
    return Object.entries(totalsAll.totalAmountByCurrency).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [totalsAll.totalAmountByCurrency]);

  /* -------------------------
     Actions
  ------------------------- */
  const addTimer = () => {
    setTimers((prev) => {
      const nextNum = prev.length + 1;
      const base = prev[0];
      const t: BillableTimer = {
        id: uid(),
        name: `Timer ${nextNum}`,
        note: "",
        hourlyRate: base?.hourlyRate ?? 150,
        currency: base?.currency ?? "USD",
        roundMode: base?.roundMode ?? "6",
        status: "idle",
        elapsedMs: 0,
        _runningSince: null,
      };
      const next = fixTimerNameCollisions([...prev, t]);
      // set new active id
      queueMicrotask(() => setActiveId(t.id));
      return next;
    });
  };

  const duplicateTimer = (id: string) => {
    setTimers((prev) => {
      const base = prev.find((t) => t.id === id);
      if (!base) return prev;
      const copy: BillableTimer = {
        ...base,
        id: uid(),
        name: `${base.name} (copy)`,
        status: "idle",
        elapsedMs: 0,
        _runningSince: null,
      };
      const next = fixTimerNameCollisions([...prev, copy]);
      queueMicrotask(() => setActiveId(copy.id));
      return next;
    });
  };

  const deleteTimer = (id: string) => {
    setTimers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      const safeNext = next.length
        ? next
        : fixTimerNameCollisions([newDefaultTimer("Timer 1")]);
      queueMicrotask(() => {
        setActiveId((cur) => {
          if (cur !== id)
            return cur && safeNext.some((t) => t.id === cur)
              ? cur
              : (safeNext[0]?.id ?? null);
          return safeNext[0]?.id ?? null;
        });
      });
      return safeNext;
    });
  };

  const updateTimer = (id: string, patch: Partial<BillableTimer>) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };

        if (patch.name !== undefined) {
          next.name = String(patch.name);
        }
        if (patch.note !== undefined) {
          next.note = String(patch.note);
        }
        if (patch.currency !== undefined) {
          next.currency = String(patch.currency);
        }
        if (patch.roundMode !== undefined) {
          next.roundMode = patch.roundMode;
        }
        if (patch.hourlyRate !== undefined) {
          next.hourlyRate = clamp(Number(patch.hourlyRate || 0), 0, 1_000_000);
        }
        if (patch.elapsedMs !== undefined) {
          next.elapsedMs = Math.max(0, Number(patch.elapsedMs));
        }
        return next;
      }),
    );
  };

  const renameTimerSafe = (id: string, name: string) => {
    setTimers((prev) =>
      fixTimerNameCollisions(
        prev.map((t) => (t.id === id ? { ...t, name } : t)),
      ),
    );
  };

  const onStartPause = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "running")
          return { ...t, status: "paused", _runningSince: null };
        return { ...t, status: "running", _runningSince: Date.now() };
      }),
    );
  };

  const onReset = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "idle", elapsedMs: 0, _runningSince: null }
          : t,
      ),
    );
  };

  const onResetAll = () => {
    setTimers((prev) =>
      prev.map((t) => ({
        ...t,
        status: "idle",
        elapsedMs: 0,
        _runningSince: null,
      })),
    );
  };

  const onCopy = async (id: string) => {
    const t = timers.find((x) => x.id === id);
    if (!t) return;
    const ok = await copyToClipboard(buildCopyText(t));
    if (ok) setCopied("Copied");
  };

  const onCopyAll = async () => {
    const ok = await copyToClipboard(buildCopyAllText(timers));
    if (ok) setCopied("Copied all");
  };

  /* -------------------------
     Keyboard shortcuts (Card)
  ------------------------- */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      if (activeTimer) onStartPause(activeTimer.id);
    } else if (e.key.toLowerCase() === "r") {
      if (activeTimer) onReset(activeTimer.id);
    } else if (e.key.toLowerCase() === "f") {
      if (fsRef.current) toggleFullscreen(fsRef.current);
    } else if (e.key.toLowerCase() === "c") {
      if (activeTimer) void onCopy(activeTimer.id);
    } else if (e.key.toLowerCase() === "a") {
      addTimer();
    }
  };

  const activeDerived = activeTimer ? computeTimerDerived(activeTimer) : null;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Billable Hours Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Multiple billable timers with rounding, totals, copy summaries,
            fullscreen, and saved sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Btn onClick={() => addTimer()} title="Add timer (A)">
            Add timer
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => void onCopyAll()}
            title="Copy all timers"
          >
            Copy all
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => onResetAll()}
            title="Reset all timers"
          >
            Reset all
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => fsRef.current && toggleFullscreen(fsRef.current)}
            title="Fullscreen (F)"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Fullscreen container (shows active timer) */}
      <div
        ref={fsRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 280 }}
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
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 900 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.14em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(96px, 14vw, 240px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.06em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 clamp(14px, 2.2vw, 24px)/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.06em;
                text-transform:uppercase;
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

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full flex-col gap-4 p-6"
          style={{ minHeight: 280 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Active timer (click a timer below to change)
              </div>
              <div className="mt-1 text-lg font-extrabold text-amber-950 truncate">
                {activeTimer ? activeTimer.name : "No timer"}
              </div>
            </div>

            {activeTimer ? (
              <div className="flex flex-wrap items-center gap-2">
                <Btn
                  onClick={() => onStartPause(activeTimer.id)}
                  title="Space start/pause"
                >
                  {activeTimer.status === "running"
                    ? "Pause"
                    : activeTimer.status === "paused"
                      ? "Resume"
                      : "Start"}
                </Btn>
                <Btn
                  kind="ghost"
                  onClick={() => onReset(activeTimer.id)}
                  title="Reset (R)"
                >
                  Reset
                </Btn>
                <Btn
                  kind="ghost"
                  onClick={() => void onCopy(activeTimer.id)}
                  title="Copy (C)"
                >
                  Copy
                </Btn>
              </div>
            ) : null}
          </div>

          {activeTimer && activeDerived ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Live time
                </div>
                <div className="mt-2 font-mono text-4xl font-extrabold tracking-wider">
                  {msToHMS(activeTimer.elapsedMs)}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  Actual elapsed (not rounded)
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Billable time
                </div>
                <div className="mt-2 font-mono text-4xl font-extrabold tracking-wider">
                  {msToHMS(activeDerived.roundedMs)}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  Rounded by:{" "}
                  <span className="text-amber-900">
                    {roundLabel(activeTimer.roundMode)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Total
                </div>
                <div className="mt-2 text-4xl font-extrabold">
                  {fmtMoney(activeDerived.total, activeTimer.currency)}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  {activeDerived.hours.toFixed(2)} billable hours
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm text-slate-700">
              No active timer. Add a timer to start.
            </div>
          )}

          {activeTimer ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-sm font-bold text-amber-950">
                  Hourly rate
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={activeTimer.hourlyRate}
                    min={0}
                    step={1}
                    onChange={(e) =>
                      updateTimer(activeTimer.id, {
                        hourlyRate: clamp(
                          Number(e.target.value || 0),
                          0,
                          1_000_000,
                        ),
                      })
                    }
                    className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <select
                    value={activeTimer.currency}
                    onChange={(e) =>
                      updateTimer(activeTimer.id, { currency: e.target.value })
                    }
                    className="rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-sm font-bold text-amber-950">Rounding</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip
                    active={activeTimer.roundMode === "none"}
                    onClick={() =>
                      updateTimer(activeTimer.id, { roundMode: "none" })
                    }
                  >
                    None
                  </Chip>
                  <Chip
                    active={activeTimer.roundMode === "6"}
                    onClick={() =>
                      updateTimer(activeTimer.id, { roundMode: "6" })
                    }
                  >
                    6-min
                  </Chip>
                  <Chip
                    active={activeTimer.roundMode === "10"}
                    onClick={() =>
                      updateTimer(activeTimer.id, { roundMode: "10" })
                    }
                  >
                    10-min
                  </Chip>
                  <Chip
                    active={activeTimer.roundMode === "15"}
                    onClick={() =>
                      updateTimer(activeTimer.id, { roundMode: "15" })
                    }
                  >
                    15-min
                  </Chip>
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  Rounds up to the next increment.
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-sm font-bold text-amber-950">
                  Matter / note
                </div>
                <input
                  value={activeTimer.note}
                  onChange={(e) =>
                    updateTimer(activeTimer.id, { note: e.target.value })
                  }
                  placeholder="Optional: client, matter, task"
                  className="mt-2 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs font-semibold text-amber-950 text-center">
            Shortcuts: Space start/pause · R reset · C copy · A add timer · F
            fullscreen
          </div>

          {copied && (
            <div className="text-center text-xs font-bold text-amber-900">
              {copied}
            </div>
          )}
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">
              {activeTimer ? activeTimer.name : "Billable Timer"}
            </div>
            <div className="fs-time">
              {activeTimer ? msToHMS(activeDerived?.roundedMs ?? 0) : "0:00:00"}
            </div>
            <div className="fs-sub">
              {activeTimer && activeDerived
                ? `${fmtMoney(activeDerived.total, activeTimer.currency)} · ${activeDerived.hours.toFixed(2)} hrs · ${roundLabel(activeTimer.roundMode)}`
                : "Add a timer"}
            </div>
            <div className="fs-help">
              Space start/pause · R reset · C copy · F fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Timers list */}
      <div className="mt-6 rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-amber-950">Your timers</h3>
          <div className="text-xs font-semibold text-slate-600">
            Saved to this browser (local storage)
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {timers.map((t, idx) => {
            const isActive = t.id === activeId;
            const d = computeTimerDerived(t);

            return (
              <div
                key={t.id}
                className={`w-full rounded-2xl border p-4 transition ${
                  isActive
                    ? "border-amber-500 bg-amber-50"
                    : "border-amber-200 bg-white hover:bg-amber-50/60"
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className="text-left min-w-0"
                    title="Set active timer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-bold text-amber-950">
                        {idx + 1}. {t.name}
                      </div>
                      {t.status === "running" ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">
                          Running
                        </span>
                      ) : t.status === "paused" ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                          Paused
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                          Ready
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-slate-600 truncate">
                      {t.note.trim() ? t.note.trim() : "No note"}
                    </div>
                  </button>

                  <div className="grid w-full gap-2 lg:w-auto lg:grid-cols-3 lg:items-center">
                    <div className="rounded-xl border border-amber-200 bg-white px-3 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                        Billable
                      </div>
                      <div className="mt-1 font-mono text-lg font-extrabold text-amber-950">
                        {msToHMS(d.roundedMs)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white px-3 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                        Hours
                      </div>
                      <div className="mt-1 font-mono text-lg font-extrabold text-amber-950">
                        {d.hours.toFixed(2)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white px-3 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                        Total
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-amber-950">
                        {fmtMoney(d.total, t.currency)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Btn
                    kind="solid"
                    onClick={() => {
                      onStartPause(t.id);
                      setActiveId(t.id);
                    }}
                    className="px-3 py-2"
                  >
                    {t.status === "running"
                      ? "Pause"
                      : t.status === "paused"
                        ? "Resume"
                        : "Start"}
                  </Btn>

                  <Btn
                    kind="ghost"
                    onClick={() => onReset(t.id)}
                    className="px-3 py-2"
                  >
                    Reset
                  </Btn>

                  <Btn
                    kind="ghost"
                    onClick={() => void onCopy(t.id)}
                    className="px-3 py-2"
                  >
                    Copy
                  </Btn>

                  <Btn
                    kind="ghost"
                    onClick={() => duplicateTimer(t.id)}
                    className="px-3 py-2"
                  >
                    Duplicate
                  </Btn>

                  <Btn
                    kind="ghost"
                    onClick={() => deleteTimer(t.id)}
                    className="px-3 py-2"
                  >
                    Delete
                  </Btn>
                </div>

                {isActive ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        Name
                      </div>
                      <input
                        value={t.name}
                        onChange={(e) => renameTimerSafe(t.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        Rate
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          value={t.hourlyRate}
                          min={0}
                          step={1}
                          onChange={(e) =>
                            updateTimer(t.id, {
                              hourlyRate: clamp(
                                Number(e.target.value || 0),
                                0,
                                1_000_000,
                              ),
                            })
                          }
                          className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <select
                          value={t.currency}
                          onChange={(e) =>
                            updateTimer(t.id, { currency: e.target.value })
                          }
                          className="rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="USD">USD</option>
                          <option value="CAD">CAD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="AUD">AUD</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        Note
                      </div>
                      <input
                        value={t.note}
                        onChange={(e) =>
                          updateTimer(t.id, { note: e.target.value })
                        }
                        placeholder="Optional: client, matter, task"
                        className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        Rounding
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Chip
                          active={t.roundMode === "none"}
                          onClick={() =>
                            updateTimer(t.id, { roundMode: "none" })
                          }
                        >
                          None
                        </Chip>
                        <Chip
                          active={t.roundMode === "6"}
                          onClick={() => updateTimer(t.id, { roundMode: "6" })}
                        >
                          6-min
                        </Chip>
                        <Chip
                          active={t.roundMode === "10"}
                          onClick={() => updateTimer(t.id, { roundMode: "10" })}
                        >
                          10-min
                        </Chip>
                        <Chip
                          active={t.roundMode === "15"}
                          onClick={() => updateTimer(t.id, { roundMode: "15" })}
                        >
                          15-min
                        </Chip>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-slate-600">
                        Rounded up: {roundLabel(t.roundMode)}.
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Totals summary */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Total billable hours
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-amber-950">
              {totalsAll.totalHours.toFixed(2)}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 lg:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Totals by currency
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {amountsByCurrency.length === 0 ? (
                <div className="text-sm text-slate-700">No totals yet.</div>
              ) : (
                amountsByCurrency.map(([cur, amt]) => (
                  <div
                    key={cur}
                    className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-950"
                  >
                    {cur}: {fmtMoney(amt, cur)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-600">
          Tip: Click the main card once so shortcuts work. This tool stores
          timers in your browser so they persist after refresh.
        </div>
      </div>

      {/* FAQ */}
      <section id="faq" className="mt-8">
        <h3 className="text-2xl font-bold text-amber-950">
          Billable Hours Clock FAQ
        </h3>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How does rounding work?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Rounding always rounds <strong>up</strong> to the next increment
              (for example, 6 minutes = 0.1 hour). Choose <strong>None</strong>{" "}
              to bill the exact elapsed time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this save my timers?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Timers are saved in your browser using local storage on this
              device.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What keyboard shortcuts are supported?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause (active timer) ·{" "}
              <strong>R</strong> reset · <strong>C</strong> copy summary ·{" "}
              <strong>A</strong> add timer · <strong>F</strong> fullscreen (when
              focused).
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I track multiple clients or matters?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Create multiple timers, rename them, and add notes (client,
              matter, task). Each timer has its own rate, currency, and
              rounding.
            </div>
          </details>
        </div>
      </section>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BillableHoursClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/billable-hours-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Billable Hours Clock",
        url,
        description:
          "Billable hours clock with multiple timers, rounding, hourly rate, totals, fullscreen display, and saved sessions (local storage).",
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
            name: "Billable Hours Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Billable Hours Clock",
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
            / <span className="text-amber-950">Billable Hours Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Billable Hours Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Multiple <strong>billable timers</strong> with rounding, totals,
            copy summaries, fullscreen, and saved sessions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <BillableHoursClockCard />

        {/* Disclaimer */}
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-amber-950">Disclaimer</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            This tool provides estimates only. Billing rules vary by client,
            firm, jurisdiction, contract, and policy. Always verify time
            entries, rounding requirements, and totals before invoicing. Nothing
            on this page is legal, tax, or financial advice.
          </p>
        </div>
      </section>

      <TimerMenuLinks />
      <RelatedSites />

      <BillableHoursFaq />
    </main>
  );
}

function BillableHoursFaq() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does rounding work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rounding always rounds up to the next increment (for example, 6 minutes = 0.1 hour). Choose None to bill the exact elapsed time.",
        },
      },
      {
        "@type": "Question",
        name: "Does this save my timers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Timers are saved in your browser using local storage on this device.",
        },
      },
      {
        "@type": "Question",
        name: "What keyboard shortcuts are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Space starts or pauses the active timer, R resets it, C copies the summary, A adds a new timer, and F toggles fullscreen while focused.",
        },
      },
      {
        "@type": "Question",
        name: "Can I track multiple clients or matters?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Create multiple timers, rename them, and add notes for each client or matter. Every timer has its own rate, currency, and rounding.",
        },
      },
    ],
  };

  return (
    <section id="faq" className="mx-auto mt-8 max-w-7xl px-4 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-amber-950">
          Billable Hours Clock FAQ
        </h2>

        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How does rounding work?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Rounding always rounds <strong>up</strong> to the next increment
              (for example, 6 minutes = 0.1 hour). Choose <strong>None</strong>{" "}
              to bill the exact elapsed time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this save my timers?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Timers are saved in your browser using local storage on this
              device.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What keyboard shortcuts are supported?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>Space</strong> start/pause (active timer) ·{" "}
              <strong>R</strong> reset · <strong>C</strong> copy summary ·{" "}
              <strong>A</strong> add timer · <strong>F</strong> fullscreen (when
              focused).
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I track multiple clients or matters?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Create multiple timers, rename them, and add notes (client,
              matter, task). Each timer has its own rate, currency, and
              rounding.
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
