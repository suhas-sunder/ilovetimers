import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Run 2+ countdowns side by side • Presets + custom minutes/seconds • Start/Pause/Reset per timer or all at once • Optional sound + final beeps • Fullscreen + keyboard shortcuts • Remembers your setup";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Multiple timers at a glance
              </h2>
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
              Run multiple countdown timers at the same time with big, readable
              digits and independent controls.
            </strong>{" "}
            Start two or more timers side by side, set each one with quick
            presets or exact minutes and seconds, and manage everything without
            juggling tabs.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Per-timer control.</strong>{" "}
              Start, pause, reset, and silence alarms for each timer
              independently.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">All-timers control.</strong>{" "}
              Start all, pause all, reset all, or stop all alarms in one click.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Presets + custom time.</strong>{" "}
              Use quick minute presets or set exact{" "}
              <strong className="text-slate-900">minutes</strong> and{" "}
              <strong className="text-slate-900">seconds</strong>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Sound options.</strong> Toggle
              sound on/off, and optionally enable final countdown beeps (last 5
              seconds).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong> Clean
              layout with top controls and a bottom status strip for distance
              viewing.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Remembers your setup.</strong>{" "}
              Your timers, labels, and sound settings are saved on this device.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Set each timer</strong>:
                pick a preset or type minutes and seconds (it resets that timer
                to the new duration).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Start</strong>: use{" "}
                <strong className="text-slate-900">Start</strong> on a timer, or{" "}
                <strong className="text-slate-900">Start all</strong> for the
                whole grid.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Finish cleanly</strong>:
                stop alarms when they ring, or hit{" "}
                <strong className="text-slate-900">X</strong> to stop all alarms
                fast.
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
                  <strong className="text-slate-900">Cooking</strong>: main +
                  side dish timers without switching apps.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Workouts</strong>:
                  intervals + rest running in parallel.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Classes & labs</strong>:
                  multiple stations or groups sharing one screen.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Study blocks</strong>:
                  different tasks with separate countdowns.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want one simple countdown?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Training formats built-in?{" "}
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
                  Need focused work blocks?{" "}
                  <Link
                    to="/pomodoro-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pomodoro Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/focus-session-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Focus Session Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer no sound at all?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>{" "}
                  or a big display?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
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
                      start/pause all
                    </li>
                    <li>
                      <strong className="text-slate-900">R</strong>: reset all
                    </li>
                    <li>
                      <strong className="text-slate-900">A</strong>: add timer
                    </li>
                    <li>
                      <strong className="text-slate-900">X</strong>: stop all
                      alarms
                    </li>
                    <li>
                      <strong className="text-slate-900">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-slate-900">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the timer card once so shortcuts are captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Timer behavior notes
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Changing presets or minutes/seconds{" "}
                      <strong className="text-slate-900">resets</strong> that
                      timer to the new duration.
                    </li>
                    <li>
                      When a timer hits{" "}
                      <strong className="text-slate-900">0</strong>, it switches
                      into an <strong className="text-slate-900">alarm</strong>{" "}
                      state. Use{" "}
                      <strong className="text-slate-900">Stop alarm</strong> (on
                      the tile) or{" "}
                      <strong className="text-slate-900">Stop alarms</strong>{" "}
                      (global) to silence it.
                    </li>
                    <li>
                      <strong className="text-slate-900">Final beeps</strong>{" "}
                      (if enabled) play during the last 5 seconds before 0.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Saved on this device
                  </div>
                  <p className="mt-2">
                    Timer labels, durations, remaining time, and sound settings
                    are saved in your browser on this device. If you clear site
                    data or use a private window, the saved setup may not
                    persist.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For a shared
            screen, go fullscreen and use presets for quick setup. For quiet
            spaces, turn Sound off, or keep Sound on and enable Final beeps for
            a clear last-seconds cue.
          </div>
        </details>
      </div>
    </section>
  );
}
