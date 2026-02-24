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

import { useEffect, useRef, useState } from "react";
import RelatedSites from "./clients/components/navigation/RelatedSites";
import TimerMenuLinks from "./clients/components/navigation/TimerMenuLinks";
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

  function goAllTimers(e: React.MouseEvent) {
    e.preventDefault();
    close();
    const el = document.getElementById("all-timers");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.assign("/#all-timers");
  }

  const desktopLink =
    "text-slate-200 hover:text-white hover:underline underline-offset-4";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-700 bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a
          href="/"
          className="group flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-white"
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
            <span className="ml-0.5 text-amber-300 group-hover:text-amber-200">
              .com
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
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

          <a href="#all-timers" onClick={goAllTimers} className={desktopLink}>
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
            className="rounded-lg border border-slate-600 bg-slate-900/40 px-3 py-2 text-slate-100 shadow-sm hover:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-slate-100 transition ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2 h-0.5 w-5 bg-slate-100 transition ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-4 h-0.5 w-5 bg-slate-100 transition ${
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
          <div className="fixed inset-0 z-20 bg-black/50" />
          <div
            id="mobile-nav"
            ref={panelRef}
            className="fixed left-0 right-0 top-[57px] z-30 border-b border-slate-700 bg-slate-900"
            role="dialog"
            aria-modal="true"
          >
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="grid gap-2">
                <a
                  href="/countdown-timer"
                  onClick={close}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-700"
                >
                  Countdown Timer
                </a>
                <a
                  href="/stopwatch"
                  onClick={close}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-700"
                >
                  Stopwatch
                </a>
                <a
                  href="/pomodoro-timer"
                  onClick={close}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-700"
                >
                  Pomodoro Timer
                </a>
                <a
                  href="/hiit-timer"
                  onClick={close}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-700"
                >
                  HIIT Timer
                </a>

                <div className="mt-2 rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    Popular
                  </div>
                  <div className="mt-2 grid gap-2">
                    <a
                      href="/sleep-timer"
                      onClick={close}
                      className="rounded-lg bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600"
                    >
                      Sleep Timer
                    </a>
                    <a
                      href="/egg-timer"
                      onClick={close}
                      className="rounded-lg bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600"
                    >
                      Egg Timer (Soft/Medium/Hard)
                    </a>
                    <a
                      href="/pizza-timer"
                      onClick={close}
                      className="rounded-lg bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600"
                    >
                      Pizza Timer
                    </a>
                  </div>
                </div>

                <a
                  href="#all-timers"
                  onClick={goAllTimers}
                  className="mt-2 rounded-lg bg-amber-400 px-4 py-3 text-center font-bold text-slate-900 hover:bg-amber-300"
                >
                  All Timers
                </a>
              </div>

              <div className="mt-3 text-center text-xs font-semibold text-slate-300">
                Tip: Tap a link to close the menu.
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
      <body className="bg-white text-slate-900">
        <PHProvider>
          <SiteHeader />
          {children}

          <TimerMenuLinks />
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
