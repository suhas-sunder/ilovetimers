export default function Disclaimer() {
  const preview =
    "Binary stopwatch + countdown • Practice mode • Bit weights • Presets • Dim + fullscreen • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                How this page helps
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Run a binary stopwatch (count up).
              </strong>{" "}
              Start/pause with one key, reset instantly, and read hours,
              minutes, and seconds as clean binary columns.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Run a binary countdown timer (count down).
              </strong>{" "}
              Pick a preset, set a custom duration, and get an optional soft
              alarm when it hits zero.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Practice mode.</strong> Hide
              the decimal time, read the bits first, then reveal the answer when
              you’re ready.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Bit weights legend.</strong>{" "}
              Toggle weights to see the value of each row. Add the lit weights
              to decode the hour/minute/second quickly.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen for a clean, readable display.
              </strong>{" "}
              Go fullscreen for desk, wall, or stream use. Tap/click the display
              in fullscreen to start or pause, and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> exits.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Dim mode.</strong> Reduce glare
              without losing contrast on the bits, especially useful in
              fullscreen or low-light rooms.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Best-fit uses
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Binary reading reps
                  </strong>{" "}
                  Turn on Practice + Weights, hide time, decode the bits, then
                  reveal to check yourself.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Workout or task blocks
                  </strong>{" "}
                  Use Timer presets for quick intervals, then go fullscreen so
                  the bits are readable at a distance.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Meeting / lab timing
                  </strong>{" "}
                  Use Stopwatch mode to track elapsed time without switching
                  context or opening another app.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Prefer standard formats?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </a>{" "}
                  and{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a binary clock instead (current time)?{" "}
                  <a
                    href="/binary-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Binary Clock
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a clean big-screen timer?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need multiple countdowns at once?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300  hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Technical details</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Bit widths
                  </div>
                  <p className="mt-2">
                    Minutes and seconds use{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">6 bits</span>{" "}
                    (0–59). Hours use{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">7 bits</span>{" "}
                    so the display stays valid up to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      99 hours
                    </span>
                    .
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Stopwatch timing
                  </div>
                  <p className="mt-2">
                    Uses high-resolution{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      performance.now()
                    </span>{" "}
                    for smooth counting while running. Display is shown at whole
                    seconds for readability.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Countdown behavior
                  </div>
                  <p className="mt-2">
                    When running, the timer counts down to zero and stops. On
                    completion, it can play either a single beep or a short soft
                    sequence (if Sound is enabled).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the card.
                    Press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to
                    exit or use the Exit button in the top bar.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    Click the card once, then use:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">D</span> dim
                    · <span className="font-semibold text-[var(--ilt-text-primary)]">M</span>{" "}
                    mode ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">W</span>{" "}
                    weights ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">P</span>{" "}
                    practice ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">E</span>{" "}
                    reveal ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
                    sound.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
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

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Heads up.</strong> The display is
            optimized for readability, so the shown time is rounded to whole
            seconds (no milliseconds).
          </div>
        </details>
      </div>
    </section>
  );
}
