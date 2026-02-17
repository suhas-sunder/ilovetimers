import { Link } from "react-router";
import logoPng from "~/assets/ilovetimers-icon.png"; // adjust path

export function TopNav({ goAllTimers }: { goAllTimers: () => void }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-sky-700"
          aria-label="iLoveTimers home"
        >
          <img
            src={logoPng}
            alt="iLoveTimers"
            className="h-7 w-7 rounded-md"
            loading="eager"
          />
          <span className="tracking-tight">
            iLoveTimers
            <span className="ml-0.5 text-amber-600 group-hover:text-sky-700">
              .com
            </span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden items-center gap-4 text-sm font-medium text-slate-700 sm:flex">
          <a
            href="/countdown-timer"
            className="hover:text-sky-700 hover:underline"
          >
            Countdown
          </a>
          <a href="/stopwatch" className="hover:text-sky-700 hover:underline">
            Stopwatch
          </a>
          <a
            href="/pomodoro-timer"
            className="hover:text-sky-700 hover:underline"
          >
            Pomodoro
          </a>
          <a href="/hiit-timer" className="hover:text-sky-700 hover:underline">
            HIIT
          </a>

          {/* High-intent / commonly searched */}
          <a href="/sleep-timer" className="hover:text-sky-700 hover:underline">
            Sleep
          </a>
          <a href="/egg-timer" className="hover:text-sky-700 hover:underline">
            Egg
          </a>
          <a href="/pizza-timer" className="hover:text-sky-700 hover:underline">
            Pizza
          </a>

          <a
            href="#all-timers"
            onClick={goAllTimers}
            className="hover:text-sky-700 hover:underline"
          >
            All Timers
          </a>
        </nav>
      </div>
    </header>
  );
}
