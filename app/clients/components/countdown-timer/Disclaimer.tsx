export default function Disclaimer() {
  const preview =
    "Track elapsed time with start/pause • Record laps (splits) • Reset anytime • Fullscreen big digits • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Count up timer tools at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Start, pause, resume.</strong>{" "}
              Use this when you need elapsed time (not a countdown). Pause for
              interruptions and resume without losing your place.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Laps with splits.</strong>{" "}
              Record checkpoints while running. Each lap includes{" "}
              <span className="font-semibold text-slate-900">Total</span>{" "}
              elapsed time and{" "}
              <span className="font-semibold text-slate-900">Split</span> time
              since the prior lap.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen big digits.</strong>{" "}
              The time auto-sizes to stay readable across screens. Fullscreen is
              built for distance viewing (wall display, phone-on-stand, shared
              screen).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fast control.</strong> Use
              buttons or shortcuts. In fullscreen you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the time
              </span>{" "}
              to start or pause.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Reset anytime.</strong> Clear
              elapsed time and laps in one click when you’re done or restarting
              a session.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Works for “time since”.
              </strong>{" "}
              Use it as a “time since” tracker (start when something happens,
              then glance at elapsed time later).
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Meetings</strong>: start at
                  the official beginning, then hit{" "}
                  <strong className="text-slate-900">Lap</strong> at agenda
                  changes to capture timestamps.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Focused work</strong>: keep
                  it running while you’re actively working, pause for
                  interruptions, and use laps for milestones.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Training / workouts
                  </strong>
                  : record laps for sets, rounds, or intervals so you can review
                  splits afterward.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Labs / experiments</strong>
                  : use laps for checkpoints (mixing, heating, incubation
                  starts) while keeping a clean fullscreen readout.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a classic stopwatch layout?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing meetings specifically?{" "}
                  <a
                    href="/meeting-count-up-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Count Up Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a countdown instead of elapsed time?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want structured intervals?{" "}
                  <a
                    href="/hiit-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </a>
                  ,{" "}
                  <a
                    href="/tabata-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </a>
                  , or{" "}
                  <a
                    href="/round-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Round Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need several timers at once?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Technical details</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-slate-900">L</span> lap
                    · <span className="font-semibold text-slate-900">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Tip: click/tap the timer card once so it’s focused, then
                    shortcuts work immediately.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the timer
                    card. Some browsers require a user gesture (click/tap) to
                    enter fullscreen.
                  </p>
                  <p className="mt-2">
                    In fullscreen, tapping/clicking the time readout toggles
                    start/pause for quick control.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Lap calculations
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">Total</span>{" "}
                    is elapsed time since start.{" "}
                    <span className="font-semibold text-slate-900">Split</span>{" "}
                    is time since the previous lap (or since start for Lap 1).
                    Laps show most recent first.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Display rounding
                  </div>
                  <p className="mt-2">
                    The display is shown in whole seconds (rounded up) for a
                    steady readout, while internal timing continues in
                    milliseconds for smooth updates.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Practical tip.</strong> For a
            shared screen (meeting/classroom), go fullscreen and use{" "}
            <span className="font-semibold text-slate-900">Lap</span> to mark
            transitions. For personal tracking, keep it windowed and record laps
            for milestones you want to review.
          </div>
        </details>
      </div>
    </section>
  );
}
