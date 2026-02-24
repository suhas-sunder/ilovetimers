export default function Disclaimer() {
  const preview =
    "Binary stopwatch + countdown • Practice mode • Bit weights • Presets • Dim + fullscreen • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                How this page helps
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
              <strong className="text-slate-900">
                Run a binary stopwatch (count up).
              </strong>{" "}
              Start/pause with one key, reset instantly, and read hours,
              minutes, and seconds as clean binary columns.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Run a binary countdown timer (count down).
              </strong>{" "}
              Pick a preset, set a custom duration, and get an optional soft
              alarm when it hits zero.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Practice mode.</strong> Hide
              the decimal time, read the bits first, then reveal the answer when
              you’re ready.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Bit weights legend.</strong>{" "}
              Toggle weights to see the value of each row. Add the lit weights
              to decode the hour/minute/second quickly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen for a clean, readable display.
              </strong>{" "}
              Go fullscreen for desk, wall, or stream use. Tap/click the display
              in fullscreen to start or pause, and{" "}
              <span className="font-semibold text-slate-900">Esc</span> exits.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Dim mode.</strong> Reduce glare
              without losing contrast on the bits, especially useful in
              fullscreen or low-light rooms.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Best-fit uses
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Binary reading reps
                  </strong>{" "}
                  Turn on Practice + Weights, hide time, decode the bits, then
                  reveal to check yourself.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Workout or task blocks
                  </strong>{" "}
                  Use Timer presets for quick intervals, then go fullscreen so
                  the bits are readable at a distance.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Meeting / lab timing
                  </strong>{" "}
                  Use Stopwatch mode to track elapsed time without switching
                  context or opening another app.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer standard formats?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </a>{" "}
                  and{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a binary clock instead (current time)?{" "}
                  <a
                    href="/binary-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Binary Clock
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a clean big-screen timer?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need multiple countdowns at once?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300  hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

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
                    Bit widths
                  </div>
                  <p className="mt-2">
                    Minutes and seconds use{" "}
                    <span className="font-semibold text-slate-900">6 bits</span>{" "}
                    (0–59). Hours use{" "}
                    <span className="font-semibold text-slate-900">7 bits</span>{" "}
                    so the display stays valid up to{" "}
                    <span className="font-semibold text-slate-900">
                      99 hours
                    </span>
                    .
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Stopwatch timing
                  </div>
                  <p className="mt-2">
                    Uses high-resolution{" "}
                    <span className="font-semibold text-slate-900">
                      performance.now()
                    </span>{" "}
                    for smooth counting while running. Display is shown at whole
                    seconds for readability.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Countdown behavior
                  </div>
                  <p className="mt-2">
                    When running, the timer counts down to zero and stops. On
                    completion, it can play either a single beep or a short soft
                    sequence (if Sound is enabled).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the card.
                    Press{" "}
                    <span className="font-semibold text-slate-900">Esc</span> to
                    exit or use the Exit button in the top bar.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    Click the card once, then use:{" "}
                    <span className="font-semibold text-slate-900">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">D</span> dim
                    · <span className="font-semibold text-slate-900">M</span>{" "}
                    mode ·{" "}
                    <span className="font-semibold text-slate-900">W</span>{" "}
                    weights ·{" "}
                    <span className="font-semibold text-slate-900">P</span>{" "}
                    practice ·{" "}
                    <span className="font-semibold text-slate-900">E</span>{" "}
                    reveal ·{" "}
                    <span className="font-semibold text-slate-900">S</span>{" "}
                    sound.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture (click/tap) before
                    audio can play. If you want a silent end, turn Sound off.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Heads up.</strong> The display is
            optimized for readability, so the shown time is rounded to whole
            seconds (no milliseconds).
          </div>
        </details>
      </div>
    </section>
  );
}
