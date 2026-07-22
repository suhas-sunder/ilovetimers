export default function Disclaimer() {
  const preview =
    "Random range • Single random countdown or random intervals • Interval preview • Optional sound beeps • Fullscreen mode • Keyboard shortcuts";

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
                Unpredictable countdowns.
              </strong>{" "}
              Set a minimum and maximum seconds range, then the timer rolls a
              random duration each time so you can’t memorize the pace.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Two modes.</strong> Use{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Random timer</span>{" "}
              for a single countdown, or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Random interval timer
              </span>{" "}
              to run a sequence of random intervals.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">See what’s happening.</strong>{" "}
              The display shows the current rolled duration and your progress in
              interval mode, plus a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                next interval preview
              </span>{" "}
              so you can anticipate what’s coming without knowing the full plan.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Optional beeps.</strong> Turn
              on Sound to enable beeps. You can beep at the end of each interval
              (and optionally add final 5-second beeps near the end). If Sound
              is off, the timer stays silent.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen, big and clean.
              </strong>{" "}
              Go fullscreen for a readable countdown you can see from across the
              room. In fullscreen you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the timer
              </span>{" "}
              to start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space start/pause ·{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">R</span> reset ·{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> fullscreen
              · <span className="font-semibold text-[var(--ilt-text-primary)]">S</span> sound
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Reaction drills</strong> by
                  setting a tight range (example: 8–12s) and using interval
                  mode.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Games/classroom prompts
                  </strong>{" "}
                  with a wider range (example: 20–60s) and Sound on so the end
                  is obvious without watching.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Focus bursts</strong> by
                  running intervals with final beeps on for a clear “wrap it up”
                  cue in the last few seconds.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">One-off randomness</strong>{" "}
                  by using Random timer (single) when you only need one
                  unpredictable countdown.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want structured work/rest instead of randomness?{" "}
                  <a
                    href="/hiit-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/tabata-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need multiple timers running side by side?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a big, simple countdown (no randomness)?{" "}
                  <a
                    href="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a quiet display with no audio?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Running a casual game challenge?{" "}
                  <a
                    href="/video-game-challenge-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Video Game Challenge Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want to track open-ended time instead?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Count Up Timer
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
                    Random roll + preview
                  </div>
                  <p className="mt-2">
                    Each interval duration is rolled uniformly within your
                    seconds range. In interval mode, the app also rolls the next
                    duration early so it can show a{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      next preview
                    </span>{" "}
                    while the current interval runs.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Timer timing
                  </div>
                  <p className="mt-2">
                    The timer targets an end timestamp and updates remaining
                    time using{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      requestAnimationFrame
                    </span>{" "}
                    for smooth updates while calculating time left from a
                    high-resolution clock.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Beeps use the Web Audio API. Some browsers require a user
                    interaction (click or keypress) before sound can play.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the timer
                    card.{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exits fullscreen.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For the most
            “unpredictable” feel, use interval mode with Sound on and a medium
            range (example: 10–45s). If you only need one random countdown,
            switch to Random timer (single), hit Start, and you’re done.
          </div>
        </details>
      </div>
    </section>
  );
}
