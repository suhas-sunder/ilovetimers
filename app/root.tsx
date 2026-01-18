import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect, // ⟵ add this
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

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

// Drop-in replacement for your header.
// - Adds "All Timers" anchor link to #all-timers
// - Adds a few high-intent links
// - Mobile burger menu with proper a11y + outside click + ESC close + scroll lock
// - Keeps your styling vibe (amber, simple, sticky)

import { useEffect, useRef, useState } from "react";
import RelatedSites from "./clients/components/navigation/RelatedSites";
import TimerMenuLinks from "./clients/components/navigation/TimerMenuLinks";

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

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(open);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    function onDown(e: MouseEvent | TouchEvent) {
      if (!open) return;
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown as any);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  // Scroll to the links section on the same page
  function goAllTimers(e: React.MouseEvent) {
    e.preventDefault();
    close();
    const el = document.getElementById("all-timers");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.assign("/#all-timers");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-amber-400 bg-amber-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2 text-xl font-bold">
          ⏱ i💛Timers
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
          <a href="/countdown-timer" className="hover:underline">
            Countdown
          </a>
          <a href="/stopwatch" className="hover:underline">
            Stopwatch
          </a>
          <a href="/pomodoro-timer" className="hover:underline">
            Pomodoro
          </a>
          <a href="/hiit-timer" className="hover:underline">
            HIIT
          </a>

          {/* High-intent / commonly searched */}
          <a href="/sleep-timer" className="hover:underline">
            Sleep
          </a>
          <a href="/egg-timer" className="hover:underline">
            Egg
          </a>
          <a href="/pizza-timer" className="hover:underline">
            Pizza
          </a>

          <a
            href="#all-timers"
            onClick={goAllTimers}
            className="hover:underline"
          >
            All Timers
          </a>
        </nav>

        {/* Mobile burger */}
        <div className="sm:hidden">
          <button
            ref={btnRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-amber-950 shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {/* icon */}
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-amber-950 transition ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2 h-0.5 w-5 bg-amber-950 transition ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-4 h-0.5 w-5 bg-amber-950 transition ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile overlay + panel */}
      {open ? (
        <div className="sm:hidden">
          <div className="fixed inset-0 z-20 bg-black/30" />
          <div
            id="mobile-nav"
            ref={panelRef}
            className="fixed left-0 right-0 top-[57px] z-30 border-b border-amber-400 bg-amber-50"
            role="dialog"
            aria-modal="true"
          >
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="grid gap-2">
                <a
                  href="/countdown-timer"
                  onClick={close}
                  className="rounded-lg border border-amber-200 bg-white px-4 py-3 font-semibold text-amber-950 hover:bg-amber-50"
                >
                  Countdown Timer
                </a>
                <a
                  href="/stopwatch"
                  onClick={close}
                  className="rounded-lg border border-amber-200 bg-white px-4 py-3 font-semibold text-amber-950 hover:bg-amber-50"
                >
                  Stopwatch
                </a>
                <a
                  href="/pomodoro-timer"
                  onClick={close}
                  className="rounded-lg border border-amber-200 bg-white px-4 py-3 font-semibold text-amber-950 hover:bg-amber-50"
                >
                  Pomodoro Timer
                </a>
                <a
                  href="/hiit-timer"
                  onClick={close}
                  className="rounded-lg border border-amber-200 bg-white px-4 py-3 font-semibold text-amber-950 hover:bg-amber-50"
                >
                  HIIT Timer
                </a>

                <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Popular
                  </div>
                  <div className="mt-2 grid gap-2">
                    <a
                      href="/sleep-timer"
                      onClick={close}
                      className="rounded-lg bg-amber-500/30 px-4 py-3 font-semibold text-amber-950 hover:bg-amber-400"
                    >
                      Sleep Timer
                    </a>
                    <a
                      href="/egg-timer"
                      onClick={close}
                      className="rounded-lg bg-amber-500/30 px-4 py-3 font-semibold text-amber-950 hover:bg-amber-400"
                    >
                      Egg Timer (Soft/Medium/Hard)
                    </a>
                    <a
                      href="/pizza-timer"
                      onClick={close}
                      className="rounded-lg bg-amber-500/30 px-4 py-3 font-semibold text-amber-950 hover:bg-amber-400"
                    >
                      Pizza Timer
                    </a>
                  </div>
                </div>

                <a
                  href="#all-timers"
                  onClick={goAllTimers}
                  className="mt-2 rounded-lg border border-amber-300 bg-amber-700 px-4 py-3 text-center font-bold text-white hover:bg-amber-800"
                >
                  All Timers
                </a>
              </div>

              <div className="mt-3 text-center text-xs font-semibold text-amber-800">
                Tip: Swipe/scroll the page after closing the menu.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
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
      <body>
        <SiteHeader />
        {children}

        {/* Menu Links */}
        <TimerMenuLinks />
        <RelatedSites />
        <ScrollRestoration />
        <Scripts />
        <footer className="border-t border-amber-400 bg-amber-500/30/60">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            {/* Left */}
            <div>
              © 2026 <span className="font-semibold">i💛Timers</span> - free
              countdown, stopwatch, Pomodoro, HIIT, and clock tools
            </div>

            {/* Right */}
            <nav className="flex flex-wrap gap-x-4 gap-y-1 font-medium">
              <a
                href="/privacy"
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                Terms
              </a>
              <a
                href="/cookies"
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                Cookies
              </a>
            </nav>
          </div>
        </footer>
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
    <main className="pt-16 p-4 container mx-auto">
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
