import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Fullscreen countdown • Presets + custom minutes • Start/pause + reset • Optional sound + warnings • Final beeps • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Exam Timer at a glance
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
              Use this page to run a clean, distraction-free countdown for timed
              sections, mock exams, or practice sets.
            </strong>{" "}
            Pick a duration, go fullscreen, and control it with your keyboard.
            Optional sound warnings help you manage time without constantly
            checking the clock.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Set the duration fast.</strong>{" "}
              Choose a preset (5m to 180m) or enter custom minutes (1 to 360).
              While the timer is running, time settings are locked so you do not
              accidentally change your section length.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen that stays readable.
              </strong>{" "}
              The time auto-fits the screen for a big, high-contrast display. In
              fullscreen, click or tap the time to start or pause quickly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Warnings you can trust.
              </strong>{" "}
              Enable a single beep at{" "}
              <span className="font-semibold text-slate-900">5 minutes</span>{" "}
              and/or{" "}
              <span className="font-semibold text-slate-900">1 minute</span>{" "}
              remaining. These are meant for exam pacing, not noisy reminders.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Final beeps (optional).
              </strong>{" "}
              Turn on{" "}
              <span className="font-semibold text-slate-900">Final beeps</span>{" "}
              to beep once per second during the last 5 seconds, plus a finish
              beep at zero. Leave it off if you want a quieter room.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Simple controls.</strong>{" "}
              Start, pause, and reset are always one action away. Reset returns
              you to the full selected duration so you can rerun the same
              section cleanly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Space starts/pauses, R resets, and F toggles fullscreen (Esc
              exits). Click the card once if shortcuts do not respond.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Set the time</strong>:{" "}
                choose a preset or enter custom minutes for your section.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Start</strong>: press{" "}
                <span className="font-semibold text-slate-900">Start</span> (or
                Space). Go fullscreen if you want a clean display.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Pace</strong>: optionally
                enable warnings (5m and/or 1m). Reset to rerun the same section.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common setups
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Timed section</strong>: set
                  the exact section length (for example, 25m or 35m), enable a
                  5m warning, run fullscreen.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Practice set</strong>:
                  choose 10m to 20m for drills, keep sound off for quiet focus.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Proctored-style</strong>:
                  fullscreen on a second monitor, keyboard control only.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Break between sections
                  </strong>
                  : switch to a short preset (5m or 10m), then reset back to
                  your next section time.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Studying with a more general session timer?{" "}
                  <Link
                    to="/study-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Study Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a pure duration countdown (less exam-specific)?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a big screen timer with minimal controls?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer silent, no-sound timing?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need structured work blocks and breaks?{" "}
                  <Link
                    to="/pomodoro-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300  hover:decoration-slate-500"
                  >
                    Pomodoro Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Running a class with visible timing for everyone?{" "}
                  <Link
                    to="/classroom-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Classroom Timer
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
                <span>Details and shortcuts</span>
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
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    If shortcuts do not work, click/tap the timer card once so
                    it has focus.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Timing accuracy
                  </div>
                  <p className="mt-2">
                    This timer counts down to zero based on elapsed time while
                    the page is open. If your device sleeps, the display will
                    resume when you wake it.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Some browsers require a click/tap before audio can play. If
                    you do not hear beeps, press Start once, then toggle Sound
                    off and on.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen requires a user gesture in most browsers. In
                    fullscreen, you can click/tap the time display to start or
                    pause quickly.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Settings behavior
                  </div>
                  <p className="mt-2">
                    Sound and warning toggles can be changed while running. The
                    duration (minutes) is disabled while running to prevent
                    accidental changes mid-section.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For a clean,
            proctor-style setup, go fullscreen and keep your hands on the
            keyboard. Use Space and R only.
          </div>
        </details>
      </div>
    </section>
  );
}
