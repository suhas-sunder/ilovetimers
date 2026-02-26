import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Running + rowing modes • Pace or finish-time input • Interval beeps • Fullscreen big display • Keyboard shortcuts • “Should be at” live guidance";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">Pace timer</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">
              Set a target pace (or a finish time) and follow a clear countdown
              built for steady efforts.
            </strong>{" "}
            Switch between running and rowing, keep your split consistent with
            interval beeps, and use fullscreen when you need a big,
            distance-safe display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Running + rowing.</strong>{" "}
              Choose running (min/km or min/mi) or rowing (split per{" "}
              <strong className="text-slate-900">500m</strong>), then set your
              distance.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Two ways to set the goal.
              </strong>{" "}
              Enter a <strong className="text-slate-900">target pace</strong> or
              switch to <strong className="text-slate-900">finish time</strong>{" "}
              to have the tool compute the pace for you.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Interval beeps.</strong> Beep
              every X units to stay on track (running: per X{" "}
              <strong className="text-slate-900">km/mi</strong>, rowing: per X ×{" "}
              <strong className="text-slate-900">500m</strong>). Adjust volume
              and test the beep.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen focus.</strong> Big
              time display with a simple subtitle showing your target pace and
              total distance.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                “Should be at” guidance.
              </strong>{" "}
              While running, see where you should be at this moment based on
              your target pace and elapsed time.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Space start/pause · R reset · F fullscreen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  1) Pick mode + distance
                </strong>
                : choose Running or Rowing, then set your distance (km/mi or
                meters).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  2) Set pace or finish time
                </strong>
                : enter your target pace (like{" "}
                <strong className="text-slate-900">5:00</strong> /km or{" "}
                <strong className="text-slate-900">2:10</strong> /500m), or
                enter a finish time to calculate the pace.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  3) Start + optional beeps
                </strong>
                : press <strong className="text-slate-900">Start</strong> (or{" "}
                <strong className="text-slate-900">Space</strong>), then set
                “Beep every” if you want steady split reminders.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Steady runs</strong>: lock
                  in min/km or min/mi and follow the countdown without doing
                  math mid-workout.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Rowing pieces</strong>: set
                  a /500m split for 2k, 5k, or custom distances.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Pacing discipline</strong>:
                  interval beeps and “should be at” help you hold a consistent
                  effort.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Big display training
                  </strong>
                  : go fullscreen for a clean clock you can glance at quickly.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want structured intervals (rounds/work-rest)?{" "}
                  <Link
                    to="/hiit-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </Link>
                  ,{" "}
                  <Link
                    to="/tabata-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </Link>
                  , or{" "}
                  <Link
                    to="/round-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Round Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a simple workout countdown?{" "}
                  <Link
                    to="/workout-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Workout Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/rest-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Rest Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a pure big-screen clock?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want multiple timers at once?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>How it works, shortcuts, and notes</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-slate-900">Space</strong>:
                      start/pause
                    </li>
                    <li>
                      <strong className="text-slate-900">R</strong>: reset
                    </li>
                    <li>
                      <strong className="text-slate-900">F</strong>: fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the card once so shortcuts are captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Entry formats
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Pace examples:{" "}
                      <strong className="text-slate-900">5:00</strong> (run
                      pace) or <strong className="text-slate-900">2:10</strong>{" "}
                      (rowing split).
                    </li>
                    <li>
                      Finish time accepts{" "}
                      <strong className="text-slate-900">mm:ss</strong> or{" "}
                      <strong className="text-slate-900">hh:mm:ss</strong>.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Interval beeps
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Running: “Beep every” is in{" "}
                      <strong className="text-slate-900">km</strong> or{" "}
                      <strong className="text-slate-900">mi</strong>.
                    </li>
                    <li>
                      Rowing: “Beep every” is in multiples of{" "}
                      <strong className="text-slate-900">500m</strong> (example:
                      2 = every 1000m).
                    </li>
                    <li>If Sound is off, interval controls are disabled.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Audio note
                  </div>
                  <p className="mt-2">
                    Some browsers require a user interaction before audio can
                    play. If you don’t hear beeps, press Start once with Sound
                    on, then try Test beep.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you’re using
            fullscreen, enter your settings first, then go fullscreen and start.
            For steady pacing, set “Beep every” to{" "}
            <strong className="text-slate-900">1</strong> unit (1 km/mi or 500m)
            to get consistent reminders.
          </div>
        </details>
      </div>
    </section>
  );
}
