import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Stopwatch with laps • Reaction timing splits • Step countdown (repeatable) • Fullscreen step view • Sound + final beeps • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Lab Timer at a glance
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
              Use this page to time experiments in two ways: a precise stopwatch
              with lap splits, and a repeatable step countdown for protocols.
            </strong>{" "}
            Keep it visible on a bench display, run the step timer fullscreen,
            and control it quickly with keyboard shortcuts.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Stopwatch + lap splits.
              </strong>{" "}
              Start/pause with{" "}
              <span className="font-semibold text-slate-900">Space</span>, then
              press <span className="font-semibold text-slate-900">L</span> to
              record laps. Each lap stores a split (time since last lap) and a
              running total, useful for reaction timing or repeated trials.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Repeatable step countdown.
              </strong>{" "}
              Pick a common step time, or enter a custom duration in seconds.
              Turn on{" "}
              <span className="font-semibold text-slate-900">Repeat step</span>{" "}
              to loop the countdown automatically for multi-step protocols.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen step view.</strong>{" "}
              Use fullscreen for a clean, large countdown. While fullscreen is
              active, you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the timer
              </span>{" "}
              to start or pause, and exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Sound cues (optional).</strong>{" "}
              Enable Sound for key actions and timer completion. If you enable{" "}
              <span className="font-semibold text-slate-900">Final beeps</span>,
              the countdown will beep in the last 5 seconds before zero.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fast reset behavior.</strong>{" "}
              Press <span className="font-semibold text-slate-900">R</span> to
              reset both the stopwatch and the countdown to a clean start,
              useful between trials.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Readable on any screen.
              </strong>{" "}
              The time display auto-sizes to fit, so it stays clear on phones,
              laptops, and wall displays.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Pick a mode</strong>: use
                the stopwatch for reaction timing (laps), or the countdown for
                step-based protocols.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Set your step</strong>:
                choose a common step time or enter seconds, then decide if{" "}
                <span className="font-semibold text-slate-900">Repeat</span>{" "}
                should loop.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Run and record</strong>:{" "}
                <span className="font-semibold text-slate-900">Space</span>{" "}
                starts the stopwatch,{" "}
                <span className="font-semibold text-slate-900">L</span> records
                laps, <span className="font-semibold text-slate-900">C</span>{" "}
                starts the countdown, and{" "}
                <span className="font-semibold text-slate-900">R</span> resets.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common lab timing patterns
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Reaction trials</strong>:
                  run the stopwatch and hit{" "}
                  <span className="font-semibold text-slate-900">L</span> at
                  each event to capture split times.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Fixed step protocols
                  </strong>
                  : set a step duration (for example 30s, 60s, 90s) and turn{" "}
                  <span className="font-semibold text-slate-900">Repeat</span>{" "}
                  on to loop hands-free.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Incubation/check cycles
                  </strong>
                  : use the countdown without repeat for a one-off step, then
                  reset quickly for the next run.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Bench display</strong>: go
                  fullscreen on the countdown for a big, easy-to-read timer
                  across the room.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a simple single countdown?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a dedicated stopwatch view?{" "}
                  <Link
                    to="/stopwatch"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a focused, big-screen timer with fewer controls?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Running multiple steps in parallel?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Specifically testing reaction speed?{" "}
                  <Link
                    to="/reaction-time-test"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Reaction Time Test
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
                <span>Controls + behavior details</span>
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
                    stopwatch start/pause ·{" "}
                    <span className="font-semibold text-slate-900">L</span> lap
                    · <span className="font-semibold text-slate-900">C</span>{" "}
                    countdown start/pause ·{" "}
                    <span className="font-semibold text-slate-900">T</span>{" "}
                    toggle repeat ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen step view ·{" "}
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    reset all ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Countdown display + repeat
                  </div>
                  <p className="mt-2">
                    The countdown displays seconds in a simple clock format and
                    can loop automatically when{" "}
                    <span className="font-semibold text-slate-900">
                      Repeat step
                    </span>{" "}
                    is enabled.
                  </p>
                  <p className="mt-2">
                    When Repeat is off, the countdown stops at zero.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Stopwatch laps
                  </div>
                  <p className="mt-2">
                    Laps record a{" "}
                    <span className="font-semibold text-slate-900">split</span>{" "}
                    (time since your previous lap) and the{" "}
                    <span className="font-semibold text-slate-900">total</span>{" "}
                    time at the moment you pressed Lap.
                  </p>
                  <p className="mt-2">
                    You can cap the list using{" "}
                    <span className="font-semibold text-slate-900">
                      Max laps
                    </span>{" "}
                    to keep the panel lightweight.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture before audio will play.
                    If you do not hear cues, click{" "}
                    <span className="font-semibold text-slate-900">Start</span>{" "}
                    once, then enable Sound and try again.
                  </p>
                  <p className="mt-2">
                    Final beeps trigger once per second in the last{" "}
                    <span className="font-semibold text-slate-900">
                      5 seconds
                    </span>{" "}
                    before the countdown reaches zero.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Fast workflow.</strong> Use{" "}
            <strong className="text-slate-900">Space</strong> +{" "}
            <strong className="text-slate-900">L</strong> for reaction trials,
            then switch to the step timer with{" "}
            <strong className="text-slate-900">C</strong>. Hit{" "}
            <strong className="text-slate-900">R</strong> between runs to clear
            both timers instantly.
          </div>
        </details>
      </div>
    </section>
  );
}
