import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import { useEffect, useMemo, useRef, useState } from "react";
import RelatedSites from "./clients/components/navigation/RelatedSites";
import { PHProvider } from "./provider";
import Footer from "./clients/components/navigation/Footer";

import logoPng from "./clients/assets/images/ilovetimers-icon.png";

/* ---------- Trailing slash helpers (one place, app-level) ---------- */
function needsStrip(pathname: string) {
  if (pathname === "/") return false;
  if (!/\/+$/.test(pathname)) return false;
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(last);
  return !looksLikeFile;
}
function strip(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

/* ---------- Loader does the canonical 301 ---------- */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  if (needsStrip(url.pathname)) {
    url.pathname = strip(url.pathname);
    return redirect(url.pathname + url.search, { status: 301 });
  }
  return null;
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "canonical", href: "https://ilovetimers.com" },
];

type TimerDirectoryItem = {
  title: string;
  href: string;
  category: string;
  description: string;
  keywords?: string;
};

const PRIMARY_TIMER_HREFS = new Set([
  "/countdown-timer",
  "/stopwatch",
  "/pomodoro-timer",
  "/hiit-timer",
  "/sleep-timer",
  "/egg-timer",
  "/pizza-timer",
]);

const TIMER_DIRECTORY: TimerDirectoryItem[] = [
  {
    title: "Online Timer",
    href: "/online-timer",
    category: "Core",
    description: "A simple browser countdown with presets and fullscreen.",
    keywords: "countdown simple fullscreen",
  },
  {
    title: "Count Up Timer",
    href: "/count-up-timer",
    category: "Core",
    description: "Track elapsed time from zero for open-ended tasks.",
  },
  {
    title: "Fullscreen Timer",
    href: "/fullscreen-timer",
    category: "Core",
    description: "A large display for rooms, TVs, projectors, and classes.",
  },
  {
    title: "Silent Timer",
    href: "/silent-timer",
    category: "Core",
    description: "A quiet visual countdown with no disruptive alarm.",
  },
  {
    title: "Presentation Timer",
    href: "/presentation-timer",
    category: "Core",
    description: "Keep talks, pitches, and speeches on schedule.",
  },
  {
    title: "Meeting Timer",
    href: "/meeting-timer",
    category: "Work",
    description: "Run timed agenda blocks for focused meetings.",
  },
  {
    title: "Meeting Count Up Timer",
    href: "/meeting-count-up-timer",
    category: "Work",
    description: "Show how long a call, meeting, or discussion has run.",
  },
  {
    title: "Classroom Timer",
    href: "/classroom-timer",
    category: "Work",
    description: "Readable timing for classroom activities and transitions.",
  },
  {
    title: "Exam Timer",
    href: "/exam-timer",
    category: "Work",
    description: "A clear test timer for practice, classrooms, and exams.",
  },
  {
    title: "Study Timer",
    href: "/study-timer",
    category: "Focus",
    description: "Structured timing for homework, reading, and study blocks.",
  },
  {
    title: "Focus Session Timer",
    href: "/focus-session-timer",
    category: "Focus",
    description: "A single clean deep-work countdown.",
  },
  {
    title: "Productivity Timer",
    href: "/productivity-timer",
    category: "Focus",
    description: "Time writing, admin, planning, and focused work sessions.",
  },
  {
    title: "Break Timer",
    href: "/break-timer",
    category: "Focus",
    description: "Keep breaks intentional between work or study sessions.",
  },
  {
    title: "Time Blocking Clock",
    href: "/time-blocking-clock",
    category: "Focus",
    description: "See the current block and keep a day plan visible.",
  },
  {
    title: "Multiple Timers",
    href: "/multiple-timers",
    category: "Core",
    description: "Run two or more timers side by side.",
  },
  {
    title: "Visual Timer",
    href: "/visual-timer",
    category: "Core",
    description: "A visual countdown for easier time awareness.",
  },
  {
    title: "Alarm Timer",
    href: "/alarm-timer",
    category: "Core",
    description: "A countdown with a stronger alarm-style finish.",
  },
  {
    title: "Workout Timer",
    href: "/workout-timer",
    category: "Fitness",
    description: "Time workouts, circuits, sets, and training blocks.",
  },
  {
    title: "Tabata Timer",
    href: "/tabata-timer",
    category: "Fitness",
    description: "Classic repeated work and rest intervals.",
  },
  {
    title: "EMOM Timer",
    href: "/emom-timer",
    category: "Fitness",
    description: "Every-minute-on-the-minute training intervals.",
  },
  {
    title: "AMRAP Timer",
    href: "/amrap-timer",
    category: "Fitness",
    description: "A fixed training block for as many rounds as possible.",
  },
  {
    title: "Round Timer",
    href: "/round-timer",
    category: "Fitness",
    description: "Round timing for boxing, martial arts, and circuits.",
  },
  {
    title: "Pace Timer",
    href: "/pace-timer",
    category: "Fitness",
    description: "Repeated timing for pacing, reps, drills, and rhythm.",
  },
  {
    title: "Rest Timer",
    href: "/rest-timer",
    category: "Fitness",
    description: "Track rest between sets, rounds, or practice attempts.",
  },
  {
    title: "Stretch Timer",
    href: "/stretch-timer",
    category: "Wellness",
    description: "Time mobility work, flexibility holds, and stretch routines.",
  },
  {
    title: "Breathing Timer",
    href: "/breathing-timer",
    category: "Wellness",
    description: "Guided inhale, hold, exhale, and rest intervals.",
  },
  {
    title: "Meditation Timer",
    href: "/meditation-timer",
    category: "Wellness",
    description: "A calm timer for mindfulness and quiet sessions.",
  },
  {
    title: "Water Reminder Timer",
    href: "/drink-water-reminder-timer",
    category: "Wellness",
    description: "Simple hydration reminders that run in the browser.",
  },
  {
    title: "Cooking Timer",
    href: "/cooking-timer",
    category: "Cooking",
    description: "Time cooking steps, prep, simmering, baking, and resting.",
  },
  {
    title: "Tea Timer",
    href: "/tea-timer",
    category: "Cooking",
    description: "Steeping presets for black, green, herbal, and specialty tea.",
  },
  {
    title: "Current Local Time",
    href: "/current-local-time",
    category: "Clocks",
    description: "A clean live clock for the current local time.",
  },
  {
    title: "World Clock",
    href: "/world-clock",
    category: "Clocks",
    description: "Compare current times across cities and time zones.",
  },
  {
    title: "Time Zone Converter",
    href: "/time-zone-converter",
    category: "Clocks",
    description: "Convert a time between locations and time zones.",
  },
  {
    title: "UTC Clock",
    href: "/utc-clock",
    category: "Clocks",
    description: "Display current Coordinated Universal Time.",
  },
  {
    title: "Atomic Clock",
    href: "/atomic-clock",
    category: "Clocks",
    description: "A precise-looking live clock with optional milliseconds.",
  },
  {
    title: "Retro Flip Clock",
    href: "/retro-flip-clock",
    category: "Clocks",
    description: "A classic flip-style desk clock display.",
  },
  {
    title: "Minimalist Clock",
    href: "/minimalist-clock",
    category: "Clocks",
    description: "A stripped-down, distraction-free clock.",
  },
  {
    title: "Digital Clock",
    href: "/digital-clock",
    category: "Clocks",
    description: "A clean digital clock with fullscreen support.",
  },
  {
    title: "Analog Clock",
    href: "/analog-clock",
    category: "Clocks",
    description: "A classic analog clock face in the browser.",
  },
  {
    title: "Binary Clock",
    href: "/binary-clock",
    category: "Clocks",
    description: "Read the current time as binary fields.",
  },
  {
    title: "Binary Stopwatch",
    href: "/binary-stopwatch",
    category: "Clocks",
    description: "A stopwatch and timer that display time in binary.",
  },
  {
    title: "Hexadecimal Clock",
    href: "/hexadecimal-clock",
    category: "Clocks",
    description: "A clock for hexadecimal time displays.",
  },
  {
    title: "Fibonacci Clock",
    href: "/fibonacci-clock",
    category: "Clocks",
    description: "A visual clock based on Fibonacci blocks.",
  },
  {
    title: "Roman Numeral Clock",
    href: "/roman-numeral-clock",
    category: "Clocks",
    description: "A clock that renders time with Roman numerals.",
  },
  {
    title: "Morse Code Clock",
    href: "/morse-code-clock",
    category: "Clocks",
    description: "Display the current time as Morse code.",
  },
  {
    title: "Sunrise Sunset Clock",
    href: "/sunrise-sunset-clock",
    category: "Clocks",
    description: "Track sunrise, sunset, and daylight timing.",
  },
  {
    title: "Golden Hour Clock",
    href: "/golden-hour-clock",
    category: "Clocks",
    description: "Track golden hour windows for light and photography.",
  },
  {
    title: "Moon Phase Clock",
    href: "/moon-phase-clock",
    category: "Clocks",
    description: "See the current moon phase and lunar timing.",
  },
  {
    title: "Astronomical Clock",
    href: "/astronomical-clock",
    category: "Clocks",
    description: "Solar, lunar, and location-aware sky timing.",
  },
  {
    title: "Epoch Unix Time Clock",
    href: "/epoch-unix-time-clock",
    category: "Clocks",
    description: "Display Unix epoch time as a live counter.",
  },
  {
    title: "Swatch Internet Time Clock",
    href: "/swatch-internet-time-clock",
    category: "Clocks",
    description: "Show Swatch Internet Time in beats.",
  },
  {
    title: "Event Countdown",
    href: "/event-countdown",
    category: "Events",
    description: "Countdown to a specific date and time.",
  },
  {
    title: "Reaction Time Test",
    href: "/reaction-time-test",
    category: "Tracking",
    description: "Measure how quickly you react to a visual prompt.",
  },
  {
    title: "Metronome",
    href: "/metronome",
    category: "Tracking",
    description: "Set a steady tempo for practice and rhythm work.",
  },
  {
    title: "BPM Tapper",
    href: "/bpm-tapper",
    category: "Tracking",
    description: "Tap to estimate beats per minute.",
  },
  {
    title: "Lab Timer",
    href: "/lab-timer",
    category: "Tracking",
    description: "Combined countdown and stopwatch tools for lab work.",
  },
  {
    title: "Billable Hours Clock",
    href: "/billable-hours-clock",
    category: "Calculators",
    description: "Track billable time and estimate earned value.",
  },
  {
    title: "Billable Hours Calculator",
    href: "/billable-hours-calculator",
    category: "Calculators",
    description: "Convert time and rates into billable totals.",
  },
  {
    title: "Work Hours Calculator",
    href: "/work-hours-calculator",
    category: "Calculators",
    description: "Calculate work duration, breaks, and paid time.",
  },
  {
    title: "Time Calculator",
    href: "/time-calculator",
    category: "Calculators",
    description: "Add, subtract, and convert time values.",
  },
  {
    title: "Milliseconds Converter",
    href: "/milliseconds-converter",
    category: "Calculators",
    description: "Convert milliseconds into readable time units.",
  },
  {
    title: "Military Time Converter",
    href: "/military-time-converter",
    category: "Calculators",
    description: "Convert between 12-hour and 24-hour time.",
  },
  {
    title: "Debt Clock",
    href: "/debt-clock",
    category: "Calculators",
    description: "A live-style counter for estimated debt totals.",
  },
  {
    title: "Debt Repayment Timer",
    href: "/debt-repayment-timer",
    category: "Calculators",
    description: "Estimate debt payoff progress over time.",
  },
  {
    title: "Speedcubing Timer",
    href: "/speedcubing-timer",
    category: "Games",
    description: "A cube-solving stopwatch with solve tracking.",
  },
  {
    title: "Speedrun Timer",
    href: "/speedrun-timer",
    category: "Games",
    description: "Track runs, splits, and personal timing.",
  },
  {
    title: "Game Challenge Timer",
    href: "/video-game-challenge-timer",
    category: "Games",
    description: "Time gaming challenges, attempts, and rounds.",
  },
  {
    title: "Chaos Timer",
    href: "/chaos-timer",
    category: "Games",
    description: "Randomized timing for playful or unpredictable sessions.",
  },
];

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesSearchField(value: string, query: string) {
  const normalizedValue = normalizeSearchText(value);
  if (!normalizedValue || !query) return false;

  if (query.includes(" ")) {
    return normalizedValue.includes(query);
  }

  return normalizedValue
    .split(" ")
    .some(
      (token) =>
        token === query ||
        token.startsWith(query) ||
        (query.length >= 4 && token.includes(query)),
    );
}

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function TimerDirectoryMenu({
  query,
  setQuery,
  onNavigate,
  searchId,
  variant = "desktop",
  className = "",
}: {
  query: string;
  setQuery: (value: string) => void;
  onNavigate: () => void;
  searchId: string;
  variant?: "desktop" | "mobile";
  className?: string;
}) {
  const normalizedQuery = normalizeSearchText(query);

  const filteredItems = useMemo(() => {
    const source = normalizedQuery
      ? TIMER_DIRECTORY
      : TIMER_DIRECTORY.filter((item) => !PRIMARY_TIMER_HREFS.has(item.href));

    if (!normalizedQuery) return source;

    const strongMatches = source.filter((item) =>
      [
        item.title,
        item.category,
        item.keywords ?? "",
      ]
        .some((field) => matchesSearchField(field, normalizedQuery)),
    );

    if (strongMatches.length > 0) return strongMatches;

    return source.filter((item) =>
      matchesSearchField(item.description, normalizedQuery),
    );
  }, [normalizedQuery]);

  const categories = useMemo(
    () => Array.from(new Set(filteredItems.map((item) => item.category))),
    [filteredItems],
  );

  const resultsClass =
    variant === "mobile"
      ? "mt-4 pr-1"
      : "mt-4 max-h-[min(74vh,42rem)] overflow-y-auto pr-1";

  const categoryGridClass =
    variant === "mobile"
      ? "space-y-5"
      : "grid gap-5 lg:grid-cols-2 xl:grid-cols-3";

  return (
    <div
      className={[
        "bg-[var(--ilt-bg-page)] text-[var(--ilt-text-primary)]",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor={searchId}
          className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500"
        >
          Find a timer
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clocks, workouts, cooking, focus..."
          className="ilt-focus-ring w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-[var(--ilt-text-primary)] transition placeholder:text-[var(--ilt-text-muted)] focus:bg-slate-100"
        />
      </div>

      <div className={resultsClass}>
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
            No timers matched that search.
          </div>
        ) : (
          <div className={categoryGridClass}>
            {categories.map((category) => {
              const items = filteredItems.filter(
                (item) => item.category === category,
              );

              return (
                <section key={category} className="min-w-0">
                  <h3 className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {category}
                  </h3>
                  <div className="mt-2 grid gap-1">
                    {items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className="ilt-focus-ring group rounded-2xl px-3 py-3 transition-colors hover:bg-slate-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-slate-950">
                            {item.title}
                          </div>
                          <div
                            aria-hidden="true"
                            className="text-sm font-bold text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-950"
                          >
                            &gt;
                          </div>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {item.description}
                        </p>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const directoryRef = useRef<HTMLDivElement>(null);
  const directoryBtnRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(open);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setDirectoryOpen(false);
        (open ? btnRef.current : directoryBtnRef.current)?.focus();
      }
    }
    if (open || directoryOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [directoryOpen, open]);

  useEffect(() => {
    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (
        open &&
        !panelRef.current?.contains(t) &&
        !btnRef.current?.contains(t)
      ) {
        setOpen(false);
      }
      if (
        directoryOpen &&
        !directoryRef.current?.contains(t) &&
        !directoryBtnRef.current?.contains(t)
      ) {
        setDirectoryOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown as any);
    };
  }, [directoryOpen, open]);

  function close() {
    setOpen(false);
    setDirectoryOpen(false);
  }

  const desktopLink =
    "ilt-focus-ring cursor-pointer rounded-full px-3 py-2 text-[var(--ilt-text-primary)] transition-colors hover:bg-slate-100 hover:text-black";

  const mobileLink =
    "ilt-focus-ring cursor-pointer rounded-2xl px-4 py-3 text-base font-semibold text-[var(--ilt-text-primary)] transition-colors hover:bg-slate-100";

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--ilt-bg-page)] text-[var(--ilt-text-primary)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a
            href="/"
            className="ilt-focus-ring group flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--ilt-text-primary)] transition-opacity hover:opacity-75"
            aria-label="iLoveTimers home"
          >
            <img
              src={logoPng}
              alt="iLoveTimers"
              className="h-9 w-9 rounded-md"
              loading="eager"
            />
            <span className="tracking-tight">
              iLoveTimers
              <span className="ml-0.5 text-[var(--ilt-text-primary)]">
                .com
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 text-sm font-semibold sm:flex">
            <a href="/countdown-timer" className={desktopLink}>
              Countdown
            </a>
            <a href="/stopwatch" className={desktopLink}>
              Stopwatch
            </a>
            <a href="/pomodoro-timer" className={desktopLink}>
              Pomodoro
            </a>
            <a href="/hiit-timer" className={desktopLink}>
              HIIT
            </a>

            {/* High-intent / commonly searched */}
            <a href="/sleep-timer" className={desktopLink}>
              Sleep
            </a>
            <a href="/egg-timer" className={desktopLink}>
              Egg
            </a>
            <a href="/pizza-timer" className={desktopLink}>
              Pizza
            </a>

            <div className="relative">
              <button
                ref={directoryBtnRef}
                type="button"
                onClick={() => {
                  setDirectoryOpen((value) => !value);
                  setOpen(false);
                }}
                aria-expanded={directoryOpen}
                aria-controls="timer-directory-menu"
                aria-haspopup="dialog"
                className={`${desktopLink} flex items-center gap-1`}
              >
                More
                <span
                  aria-hidden="true"
                  className={`text-xs transition-transform ${
                    directoryOpen ? "rotate-180" : ""
                  }`}
                >
                  v
                </span>
              </button>

              {directoryOpen ? (
                <div
                  id="timer-directory-menu"
                  ref={directoryRef}
                  className="fixed left-1/2 top-[64px] z-50 max-h-[calc(100svh-5rem)] w-[min(calc(100vw-2rem),92rem)] -translate-x-1/2 overflow-hidden rounded-[1.25rem] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                >
                  <TimerDirectoryMenu
                    query={directoryQuery}
                    setQuery={setDirectoryQuery}
                    onNavigate={close}
                    searchId="desktop-timer-directory-search"
                    variant="desktop"
                  />
                </div>
              ) : null}
            </div>
          </nav>

          {/* Mobile burger */}
          <div className="sm:hidden">
            <button
              ref={btnRef}
              type="button"
              onClick={() => {
                setOpen((v) => !v);
                setDirectoryOpen(false);
              }}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="Open menu"
              className="ilt-focus-ring cursor-pointer rounded-full bg-white px-3 py-2 text-[var(--ilt-text-primary)] transition-colors hover:bg-slate-100"
            >
              <span className="relative block h-4 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 bg-slate-950 transition ${
                    open ? "translate-y-2 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 h-0.5 w-5 bg-slate-950 transition ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-4 h-0.5 w-5 bg-slate-950 transition ${
                    open ? "-translate-y-2 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[var(--ilt-bg-page)] text-[var(--ilt-text-primary)] sm:hidden">
          <div
            id="mobile-nav"
            ref={panelRef}
            className="mx-auto flex min-h-svh max-w-4xl flex-col px-4 py-3"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between gap-3">
              <a
                href="/"
                onClick={close}
                className="ilt-focus-ring flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--ilt-text-primary)] transition-opacity hover:opacity-75"
                aria-label="iLoveTimers home"
              >
                <img
                  src={logoPng}
                  alt="iLoveTimers"
                  className="h-9 w-9 rounded-md"
                  loading="eager"
                />
                <span className="tracking-tight">
                  iLoveTimers
                  <span className="ml-0.5 text-[var(--ilt-text-primary)]">
                    .com
                  </span>
                </span>
              </a>
              <button
                type="button"
                onClick={close}
                className="ilt-focus-ring cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] transition-colors hover:bg-slate-100"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              <TimerDirectoryMenu
                query={directoryQuery}
                setQuery={setDirectoryQuery}
                onNavigate={close}
                searchId="mobile-timer-directory-search"
                variant="mobile"
              />
            </div>

            {directoryQuery.trim() ? null : (
              <div className="mt-6">
                <div className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Primary timers
                </div>
                <div className="mt-2 grid gap-1">
                  <a
                    href="/countdown-timer"
                    onClick={close}
                    className={mobileLink}
                  >
                    Countdown Timer
                  </a>
                  <a href="/stopwatch" onClick={close} className={mobileLink}>
                    Stopwatch
                  </a>
                  <a
                    href="/pomodoro-timer"
                    onClick={close}
                    className={mobileLink}
                  >
                    Pomodoro Timer
                  </a>
                  <a href="/hiit-timer" onClick={close} className={mobileLink}>
                    HIIT Timer
                  </a>
                  <a
                    href="/sleep-timer"
                    onClick={close}
                    className={mobileLink}
                  >
                    Sleep Timer
                  </a>
                  <a href="/egg-timer" onClick={close} className={mobileLink}>
                    Egg Timer
                  </a>
                  <a href="/pizza-timer" onClick={close} className={mobileLink}>
                    Pizza Timer
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[var(--ilt-bg-page)] text-[var(--ilt-text-primary)] antialiased">
        <PHProvider>
          <SiteHeader />
          {children}

          <RelatedSites />
          <ScrollRestoration />
          <Scripts />
          <Footer />
        </PHProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto ">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
