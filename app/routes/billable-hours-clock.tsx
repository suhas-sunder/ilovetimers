// app/routes/billable-hours-clock.tsx
import type { Route } from "./+types/billable-hours-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Disclaimer from "~/clients/components/billable-hours-clock/Disclaimer";
import FAQ from "~/clients/components/billable-hours-clock/FAQ";
import HowItWorks from "~/clients/components/billable-hours-clock/HowItWorks";
import KeyboardShortcuts from "~/clients/components/billable-hours-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/billable-hours-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Billable Hours Clock (Live Timer + Rounding, Total Pay)";
  const description =
    "Free billable hours clock for freelancers and lawyers. Track time live, apply rounding increments, and calculate total pay with start/stop controls and breaks.";

  const url = "https://www.ilovetimers.com/billable-hours-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "billable hours clock",
        "billable timer",
        "billable hours calculator",
        "hourly rate calculator",
        "lawyer billable hours",
        "freelance billing timer",
        "billing increment timer",
        "round billable time",
      ].join(", "),
    },
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
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toFixed(2)}`;
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
   CURRENCIES
========================================================= */
const CURRENCIES: { code: string; name: string }[] = [
  { code: "USD", name: "US Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "KRW", name: "South Korean Won" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "ZAR", name: "South African Rand" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "ILS", name: "Israeli New Shekel" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "RON", name: "Romanian Leu" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "PEN", name: "Peruvian Sol" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "UYU", name: "Uruguayan Peso" },
];

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
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60",
      "timer-tool-card h-full rounded-2xl bg-white p-4 sm:p-6",
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
        ? `cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer timer-control-shadow rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const Chip = ({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? "bg-sky-700 text-white hover:bg-sky-600"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
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

  _runningSince?: number | null;
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
  if (mode === "6") return "6 min (0.1 hr)";
  if (mode === "10") return "10 min";
  return "15 min (0.25 hr)";
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
  lines.push(`Rate: ${fmtMoney(t.hourlyRate, t.currency)} per hour`);
  lines.push(`Total: ${fmtMoney(total, t.currency)}`);
  return lines.join("\n");
}

function buildCopyAllText(timers: BillableTimer[]) {
  const lines: string[] = [];
  lines.push("Billable Timers");
  lines.push("");
  for (const t of timers) {
    const { roundedMs, hours, total } = computeTimerDerived(t);
    lines.push(`${t.name} | elapsed ${msToHMS(t.elapsedMs)}`);
    lines.push(
      `Billable: ${msToHMS(roundedMs)} (${roundLabel(t.roundMode)}) | ${hours.toFixed(
        2,
      )} hours | ${fmtMoney(total, t.currency)}`,
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
   BILLABLE HOURS CLOCK
========================================================= */
function BillableHoursClockCard() {
  const initialTimers = useMemo(
    () => fixTimerNameCollisions([newDefaultTimer("Timer 1")]),
    [],
  );

  const [timers, setTimers] = useState<BillableTimer[]>(() => initialTimers);
  const [activeId, setActiveId] = useState<string | null>(
    () => initialTimers[0]?.id ?? null,
  );

  const fsRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);

  const [toast, setToast] = useState<string | null>(null);

  const [printMode, setPrintMode] = useState<"none" | "active" | "all">("none");
  const printRequestedRef = useRef(false);

  const activeTimer = useMemo(
    () => timers.find((t) => t.id === activeId) ?? null,
    [timers, activeId],
  );

  const activeDerived = useMemo(
    () => (activeTimer ? computeTimerDerived(activeTimer) : null),
    [activeTimer],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1100);
  };

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
    ) {
      return;
    }

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
          if (cur !== id) {
            return cur && safeNext.some((t) => t.id === cur)
              ? cur
              : (safeNext[0]?.id ?? null);
          }
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

        if (patch.name !== undefined) next.name = String(patch.name);
        if (patch.note !== undefined) next.note = String(patch.note);
        if (patch.currency !== undefined)
          next.currency = String(patch.currency);
        if (patch.roundMode !== undefined) next.roundMode = patch.roundMode;

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
        if (t.status === "running") {
          return { ...t, status: "paused", _runningSince: null };
        }
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
    showToast(ok ? "Copied" : "Copy failed");
  };

  const onCopyAll = async () => {
    const ok = await copyToClipboard(buildCopyAllText(timers));
    showToast(ok ? "Copied all" : "Copy failed");
  };

  const requestPrint = (mode: "active" | "all") => {
    printRequestedRef.current = true;
    setPrintMode(mode);
  };

  useEffect(() => {
    if (!printRequestedRef.current) return;
    if (printMode === "none") return;

    const id = window.setTimeout(() => {
      try {
        window.print();
      } finally {
        // handled by afterprint
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [printMode]);

  useEffect(() => {
    const onAfterPrint = () => {
      printRequestedRef.current = false;
      setPrintMode("none");
    };
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      if (activeTimer) onStartPause(activeTimer.id);
    } else if (k === "r") {
      e.preventDefault();
      if (activeTimer) onReset(activeTimer.id);
    } else if (k === "f") {
      e.preventDefault();
      if (fsRef.current) void toggleFullscreen(fsRef.current);
    } else if (k === "c") {
      e.preventDefault();
      if (activeTimer) void onCopy(activeTimer.id);
    } else if (k === "a") {
      e.preventDefault();
      addTimer();
    } else if (k === "p") {
      e.preventDefault();
      if (activeTimer) requestPrint("active");
    }
  };

  const activeCurrencyName = useMemo(() => {
    if (!activeTimer) return "";
    return (
      CURRENCIES.find((c) => c.code === activeTimer.currency)?.name ??
      activeTimer.currency
    );
  }, [activeTimer]);

  const statusChip = useMemo(() => {
    if (!activeTimer)
      return { label: "No active timer", cls: "bg-slate-100 text-slate-800" };
    if (activeTimer.status === "running")
      return { label: "Running", cls: "bg-emerald-100 text-emerald-900" };
    if (activeTimer.status === "paused")
      return { label: "Paused", cls: "bg-slate-100 text-slate-800" };
    return { label: "Ready", cls: "bg-sky-100 text-sky-900" };
  }, [activeTimer]);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background:#fff !important; }
              .no-print { display:none !important; }
              .print-only { display:block !important; }
              .print-only * { color:#0f172a !important; }
              @page { margin: 14mm; }
            }
            .print-only { display:none; }
          `,
        }}
      />

      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
            Live timer
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-950">
            Billable Hours Clock
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-700">
            Multiple timers, rounding, totals, copy, fullscreen, and local save.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${statusChip.cls}`}
          >
            {statusChip.label}
          </span>
          <Btn onClick={() => addTimer()} title="Add timer (A)">
            Add timer
          </Btn>
          <Btn kind="ghost" onClick={() => void onCopyAll()} title="Copy all">
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
            onClick={() =>
              fsRef.current && void toggleFullscreen(fsRef.current)
            }
            title="Fullscreen (F)"
          >
            Fullscreen
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => activeTimer && requestPrint("active")}
            disabled={!activeTimer}
            title="Print active (P)"
          >
            Print
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => requestPrint("all")}
            disabled={timers.length === 0}
            title="Print all timers"
          >
            Print all
          </Btn>
        </div>
      </div>

      <div className="no-print mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Active timer
              </div>
              <div className="mt-1 truncate text-xl font-extrabold text-slate-950">
                {activeTimer ? activeTimer.name : "No timer"}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-700">
                Shortcuts: Space start/pause · R reset · C copy · P print · A
                add · F fullscreen
              </div>
            </div>

            {activeTimer ? (
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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
                <Btn
                  kind="ghost"
                  onClick={() => requestPrint("active")}
                  title="Print active (P)"
                >
                  Print
                </Btn>
              </div>
            ) : null}
          </div>

          {activeTimer && activeDerived ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Live time
                </div>
                <div className="mt-2 font-mono text-4xl font-extrabold tracking-wider text-slate-950">
                  {msToHMS(activeTimer.elapsedMs)}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  Actual elapsed
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Billable time
                </div>
                <div className="mt-2 font-mono text-4xl font-extrabold tracking-wider text-slate-950">
                  {msToHMS(activeDerived.roundedMs)}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  Rounding:{" "}
                  <span className="text-sky-700">
                    {roundLabel(activeTimer.roundMode)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Total
                </div>
                <div className="mt-2 text-4xl font-extrabold text-emerald-900">
                  {fmtMoney(activeDerived.total, activeTimer.currency)}
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-800">
                  {activeDerived.hours.toFixed(2)} billable hours
                </div>
              </div>

              <div className="lg:col-span-3 rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Hourly rate
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <input
                        type="number"
                        value={activeTimer.hourlyRate}
                        min={0}
                        step={0.01}
                        onChange={(e) =>
                          updateTimer(activeTimer.id, {
                            hourlyRate: clamp(
                              Number(e.target.value || 0),
                              0,
                              1_000_000,
                            ),
                          })
                        }
                        className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                      />
                      <select
                        value={activeTimer.currency}
                        onChange={(e) =>
                          updateTimer(activeTimer.id, {
                            currency: e.target.value,
                          })
                        }
                        className="cursor-pointer w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                        aria-label="Currency"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-600">
                      Currency: {activeCurrencyName}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Rounding
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
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
                        6 min
                      </Chip>
                      <Chip
                        active={activeTimer.roundMode === "10"}
                        onClick={() =>
                          updateTimer(activeTimer.id, { roundMode: "10" })
                        }
                      >
                        10 min
                      </Chip>
                      <Chip
                        active={activeTimer.roundMode === "15"}
                        onClick={() =>
                          updateTimer(activeTimer.id, { roundMode: "15" })
                        }
                      >
                        15 min
                      </Chip>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-600">
                      Always rounds up to the next increment.
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Note
                    </div>
                    <input
                      value={activeTimer.note}
                      onChange={(e) =>
                        updateTimer(activeTimer.id, { note: e.target.value })
                      }
                      placeholder="Optional: client, matter, task"
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip
                        onClick={() =>
                          updateTimer(activeTimer.id, { note: "" })
                        }
                      >
                        Clear
                      </Chip>
                      <Chip
                        onClick={() =>
                          updateTimer(activeTimer.id, {
                            elapsedMs: Math.max(
                              0,
                              activeTimer.elapsedMs - 5 * 60_000,
                            ),
                          })
                        }
                        disabled={activeTimer.elapsedMs < 5 * 60_000}
                      >
                        -5m
                      </Chip>
                      <Chip
                        onClick={() =>
                          updateTimer(activeTimer.id, {
                            elapsedMs: activeTimer.elapsedMs + 5 * 60_000,
                          })
                        }
                      >
                        +5m
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              {toast ? (
                <div className="lg:col-span-3 text-center">
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-900">
                    {toast}
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              No active timer. Add a timer to start.
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
          <div className="text-sm font-extrabold text-slate-900">Totals</div>
          <div className="mt-1 text-xs text-slate-600">
            Based on rounded billable time for each timer
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Total billable hours
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-slate-950">
              {totalsAll.totalHours.toFixed(2)}
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Totals by currency
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {amountsByCurrency.length === 0 ? (
                <div className="text-sm font-semibold text-slate-700">
                  No totals yet.
                </div>
              ) : (
                amountsByCurrency.map(([cur, amt]) => (
                  <div
                    key={cur}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    {cur}: {fmtMoney(amt, cur)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700">
            Tip: Click the card once so shortcuts work. Timers are saved in your
            browser.
          </div>
        </div>
      </div>

      <div
        ref={fsRef}
        data-fs-container
        className="timer-display-surface no-print mt-6 overflow-hidden text-slate-900"
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
                background:#ffffff;
                color:#0f172a;
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
                opacity:.92;
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

        <div
          data-shell="normal"
          className="h-full w-full flex-col gap-3 p-4 sm:p-5"
          style={{ minHeight: 260 }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Fullscreen display
              </div>
              <div className="mt-1 truncate text-base font-extrabold text-slate-950">
                {activeTimer ? activeTimer.name : "No active timer"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Btn
                kind="ghost"
                onClick={() =>
                  fsRef.current && void toggleFullscreen(fsRef.current)
                }
                title="Fullscreen (F)"
              >
                Enter fullscreen
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => activeTimer && requestPrint("active")}
                disabled={!activeTimer}
                title="Print active (P)"
              >
                Print active
              </Btn>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Live
              </div>
              <div className="mt-2 font-mono text-2xl font-extrabold text-slate-950">
                {activeTimer ? msToHMS(activeTimer.elapsedMs) : "0:00:00"}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Billable
              </div>
              <div className="mt-2 font-mono text-2xl font-extrabold text-slate-950">
                {activeTimer && activeDerived
                  ? msToHMS(activeDerived.roundedMs)
                  : "0:00:00"}
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-600">
                {activeTimer ? roundLabel(activeTimer.roundMode) : ""}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Total
              </div>
              <div className="mt-2 text-2xl font-extrabold text-emerald-900">
                {activeTimer && activeDerived
                  ? fmtMoney(activeDerived.total, activeTimer.currency)
                  : fmtMoney(0, "USD")}
              </div>
              <div className="mt-2 text-xs font-semibold text-emerald-800">
                {activeTimer && activeDerived
                  ? `${activeDerived.hours.toFixed(2)} hrs`
                  : ""}
              </div>
            </div>
          </div>
        </div>

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
                ? `${fmtMoney(activeDerived.total, activeTimer.currency)} | ${activeDerived.hours.toFixed(
                    2,
                  )} hrs | ${roundLabel(activeTimer.roundMode)}`
                : "Add a timer"}
            </div>
            <div className="fs-help">
              Space start/pause · R reset · C copy · F fullscreen
            </div>
          </div>
        </div>
      </div>

      <div className="no-print mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-extrabold text-slate-950">Your timers</h3>
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
                className={[
                  "w-full rounded-2xl border p-4 transition",
                  isActive
                    ? "border-sky-200 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className="cursor-pointer text-left min-w-0"
                    title="Set active timer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-extrabold text-slate-950">
                        {idx + 1}. {t.name}
                      </div>
                      {t.status === "running" ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-900">
                          Running
                        </span>
                      ) : t.status === "paused" ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-800">
                          Paused
                        </span>
                      ) : (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-extrabold text-sky-900">
                          Ready
                        </span>
                      )}
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-700">
                        {roundLabel(t.roundMode)}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-600 truncate">
                      {t.note.trim() ? t.note.trim() : "No note"}
                    </div>
                  </button>

                  <div className="grid w-full gap-2 lg:w-auto lg:grid-cols-3 lg:items-center">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        Billable
                      </div>
                      <div className="mt-1 font-mono text-lg font-extrabold text-slate-950">
                        {msToHMS(d.roundedMs)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        Hours
                      </div>
                      <div className="mt-1 font-mono text-lg font-extrabold text-slate-950">
                        {d.hours.toFixed(2)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                        Total
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-emerald-900">
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

                  <Btn
                    kind="ghost"
                    onClick={() => {
                      setActiveId(t.id);
                      requestPrint("active");
                    }}
                    className="px-3 py-2"
                  >
                    Print
                  </Btn>
                </div>

                {isActive ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        Name
                      </div>
                      <input
                        value={t.name}
                        onChange={(e) => renameTimerSafe(t.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        Rate
                      </div>
                      <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <input
                          type="number"
                          value={t.hourlyRate}
                          min={0}
                          step={0.01}
                          onChange={(e) =>
                            updateTimer(t.id, {
                              hourlyRate: clamp(
                                Number(e.target.value || 0),
                                0,
                                1_000_000,
                              ),
                            })
                          }
                          className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                        />
                        <select
                          value={t.currency}
                          onChange={(e) =>
                            updateTimer(t.id, { currency: e.target.value })
                          }
                          className="cursor-pointer w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                          aria-label="Currency"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} - {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        Note
                      </div>
                      <input
                        value={t.note}
                        onChange={(e) =>
                          updateTimer(t.id, { note: e.target.value })
                        }
                        placeholder="Optional: client, matter, task"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
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
                          6 min
                        </Chip>
                        <Chip
                          active={t.roundMode === "10"}
                          onClick={() => updateTimer(t.id, { roundMode: "10" })}
                        >
                          10 min
                        </Chip>
                        <Chip
                          active={t.roundMode === "15"}
                          onClick={() => updateTimer(t.id, { roundMode: "15" })}
                        >
                          15 min
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
      </div>

      <div className="print-only">
        {printMode === "active" ? (
          <div>
            <div className="text-xl font-extrabold">Billable Hours Clock</div>
            <div className="mt-1 text-sm font-semibold">
              Active timer summary
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Timer
              </div>
              <div className="mt-1 text-2xl font-extrabold">
                {activeTimer ? activeTimer.name : "No active timer"}
              </div>
              {activeTimer && activeDerived ? (
                <div className="mt-2 text-sm font-semibold text-slate-700">
                  {roundLabel(activeTimer.roundMode)} · Rate{" "}
                  {fmtMoney(activeTimer.hourlyRate, activeTimer.currency)} / hr
                  · Currency {activeTimer.currency}
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Live time
                </div>
                <div className="mt-1 font-mono text-lg font-extrabold">
                  {activeTimer ? msToHMS(activeTimer.elapsedMs) : "0:00:00"}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Billable time
                </div>
                <div className="mt-1 font-mono text-lg font-extrabold">
                  {activeTimer && activeDerived
                    ? msToHMS(activeDerived.roundedMs)
                    : "0:00:00"}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Total
                </div>
                <div className="mt-1 text-lg font-extrabold">
                  {activeTimer && activeDerived
                    ? fmtMoney(activeDerived.total, activeTimer.currency)
                    : fmtMoney(0, "USD")}
                </div>
              </div>
            </div>

            {activeTimer && activeDerived ? (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Details
                </div>
                <div className="mt-2 grid gap-2 text-sm font-semibold text-slate-800 sm:grid-cols-2">
                  <div>Status: {activeTimer.status}</div>
                  <div>Rounding: {roundLabel(activeTimer.roundMode)}</div>
                  <div>Billable hours: {activeDerived.hours.toFixed(2)}</div>
                  <div>
                    Rate:{" "}
                    {fmtMoney(activeTimer.hourlyRate, activeTimer.currency)} /
                    hr
                  </div>
                  <div>Currency: {activeCurrencyName}</div>
                  <div>Note: {activeTimer.note.trim() || "-"}</div>
                </div>
              </div>
            ) : null}
          </div>
        ) : printMode === "all" ? (
          <div>
            <div className="text-xl font-extrabold">Billable Hours Clock</div>
            <div className="mt-1 text-sm font-semibold">All timers summary</div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Total billable hours
              </div>
              <div className="mt-1 font-mono text-2xl font-extrabold">
                {totalsAll.totalHours.toFixed(2)}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-700">
                Totals by currency:
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {amountsByCurrency.length === 0 ? (
                  <div className="text-sm font-semibold text-slate-700">
                    No totals yet.
                  </div>
                ) : (
                  amountsByCurrency.map(([cur, amt]) => (
                    <div
                      key={cur}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
                    >
                      {cur}: {fmtMoney(amt, cur)}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Timers
              </div>
              <div className="mt-3 space-y-3">
                {timers.map((t) => {
                  const d = computeTimerDerived(t);
                  return (
                    <div
                      key={t.id}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="text-base font-extrabold">{t.name}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-700">
                        Status {t.status} · {roundLabel(t.roundMode)} · Rate{" "}
                        {fmtMoney(t.hourlyRate, t.currency)} / hr
                      </div>
                      <div className="mt-2 grid gap-2 text-sm font-semibold text-slate-800 sm:grid-cols-3">
                        <div>Live: {msToHMS(t.elapsedMs)}</div>
                        <div>Billable: {msToHMS(d.roundedMs)}</div>
                        <div>Total: {fmtMoney(d.total, t.currency)}</div>
                      </div>
                      {t.note.trim() ? (
                        <div className="mt-2 text-sm font-semibold text-slate-700">
                          Note: {t.note.trim()}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BillableHoursClockPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/billable-hours-clock";

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
            item: "https://www.ilovetimers.com/",
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
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Billable Hours Clock (Live Timer)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Run live billable timers, round up to common increments, and track
            totals across currencies. Includes copy, fullscreen, and print.
          </p>
        </div>
      </section>

      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <BillableHoursClockCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Billable Hours Clock</span>
        </p>
      </section>
      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}
