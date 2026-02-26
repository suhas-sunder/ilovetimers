import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Frozen pizza presets • Custom minutes/seconds • Fullscreen big display • Check reminder • Final beeps • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Pizza timer
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
              Use fast presets for frozen pizza or set your own time, then run a
              big, readable countdown.
            </strong>{" "}
            Turn on a “check” reminder before it finishes, optional final beeps
            in the last seconds, and use fullscreen when you want a
            distance-safe display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick presets.</strong> Tap a
              preset for common scenarios like{" "}
              <strong className="text-slate-900">Frozen (Oven)</strong>,{" "}
              <strong className="text-slate-900">Frozen (Air fryer)</strong>,
              reheating a slice, or skillet.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Custom time.</strong> Set your
              own minutes and seconds any time. Switching values sets Method to{" "}
              <strong className="text-slate-900">Custom</strong> without
              changing anything else.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Check reminder.</strong> Choose
              how many minutes before the end you want a reminder (for example:{" "}
              <strong className="text-slate-900">2 minutes left</strong>) so you
              can check browning and decide if it needs a little more time.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Sound + final beeps.</strong>{" "}
              Toggle sound, enable optional final beeps, and test the reminder
              sound without starting the timer.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen focus.</strong> Go
              fullscreen for a clean, large countdown. In fullscreen you can{" "}
              <strong className="text-slate-900">tap/click the time</strong> to
              start or pause.
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
                  1) Pick a preset or set time
                </strong>
                : tap a frozen pizza preset, or enter your own minutes and
                seconds.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  2) Choose reminders (optional)
                </strong>
                : set “Check with X min left” and enable final beeps if you want
                a last-second cue.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Start</strong>: press{" "}
                <strong className="text-slate-900">Start</strong> (or{" "}
                <strong className="text-slate-900">Space</strong>). Use{" "}
                <strong className="text-slate-900">Fullscreen</strong> if you
                want the biggest display.
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
                  <strong className="text-slate-900">Frozen pizza</strong>: pick
                  a preset and get a big countdown you can glance at.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Reheating slices</strong>:
                  quick short timers with a clear stop alert.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Air fryer timing</strong>:
                  set a reminder to check early so you don’t over-brown.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Big display cooking
                  </strong>
                  : fullscreen when your hands are messy or you’re across the
                  kitchen.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a general kitchen timer for anything?{" "}
                  <Link
                    to="/cooking-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Cooking Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a simple, clean countdown (no presets)?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer zero audio?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want an even bigger display?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing multiple dishes at once?{" "}
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
                    <li>
                      <strong className="text-slate-900">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the card once so shortcuts are captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen controls
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Tap/click the time display to{" "}
                      <strong className="text-slate-900">start/pause</strong>.
                    </li>
                    <li>Use the top bar buttons for Start/Pause and Reset.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Reminders
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      “Check with X min left” triggers once when the timer
                      reaches that remaining time.
                    </li>
                    <li>
                      Reminder style can be{" "}
                      <strong className="text-slate-900">Repeating</strong>{" "}
                      (about 10 seconds) or{" "}
                      <strong className="text-slate-900">Triple beep</strong>.
                    </li>
                    <li>
                      “Final beeps” plays short beeps in the last 5 seconds (if
                      Sound is on).
                    </li>
                    <li>
                      Use <strong className="text-slate-900">Stop sound</strong>{" "}
                      to end a repeating reminder early.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Audio note
                  </div>
                  <p className="mt-2">
                    Some browsers require a user interaction before audio can
                    play. If you don’t hear anything, press Start once with
                    Sound on, then try Test reminder.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you want a quick
            “check it” moment, set the check reminder to{" "}
            <strong className="text-slate-900">2 minutes</strong> for oven or{" "}
            <strong className="text-slate-900">1 minute</strong> for skillet,
            then decide whether to keep cooking or pull it early.
          </div>
        </details>
      </div>
    </section>
  );
}
