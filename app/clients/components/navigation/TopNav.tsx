import { Link } from "react-router";
import logoPng from "../../assets/images/ilovetimers-icon.png";

export function TopNav() {
  const linkClass =
    "rounded-full px-3 py-2 text-slate-950 transition-colors hover:bg-slate-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/20";

  return (
    <header className="sticky top-0 z-50 bg-white text-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="group flex items-center gap-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/20"
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
            <span className="ml-0.5 text-slate-950">.com</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold sm:flex">
          <a href="/countdown-timer" className={linkClass}>
            Countdown
          </a>
          <a href="/stopwatch" className={linkClass}>
            Stopwatch
          </a>
          <a href="/pomodoro-timer" className={linkClass}>
            Pomodoro
          </a>
          <a href="/hiit-timer" className={linkClass}>
            HIIT
          </a>
          <a href="/sleep-timer" className={linkClass}>
            Sleep
          </a>
          <a href="/egg-timer" className={linkClass}>
            Egg
          </a>
          <a href="/pizza-timer" className={linkClass}>
            Pizza
          </a>
        </nav>
      </div>
    </header>
  );
}
