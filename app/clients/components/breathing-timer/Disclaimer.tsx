export default function Disclaimer() {
  const preview =
    "Box breathing + 4-7-8 presets • Custom inhale/hold/exhale • Big countdown • Optional sound cues • Fullscreen mode • Keyboard shortcuts";

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
                Start a guided cycle fast.
              </strong>{" "}
              Pick a preset (Box 4-4-4-4, 4-7-8, Calm 4-2-6) or choose{" "}
              <strong className="text-[var(--ilt-text-primary)]">Custom</strong> and set your
              inhale / hold / exhale seconds. Press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
              start/pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Clear pacing you can follow.
              </strong>{" "}
              The timer shows the current phase (Inhale / Hold / Exhale) with a
              big countdown so you can stay in rhythm without watching a tiny
              clock.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Optional sound cues.</strong>{" "}
              Turn on Sound for gentle phase-change beeps (different tones for
              inhale, exhale, and holds). If Sound is off, it stays silent.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen for zero clutter.
              </strong>{" "}
              Go fullscreen to get a clean, high-contrast breathing display. In
              fullscreen, you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the timer
              </span>{" "}
              to start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Cycles that stop, or keep going.
              </strong>{" "}
              Use <span className="font-semibold text-[var(--ilt-text-primary)]">Cycles</span>{" "}
              to run a fixed number (example: 4-7-8 runs 4 cycles), or set{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">0</span> for
              continuous breathing until you pause.
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
                  <strong className="text-[var(--ilt-text-primary)]">Box breathing</strong>{" "}
                  (4-4-4-4) for a steady paced cycle you can repeat
                  continuously.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">4-7-8</strong> when you
                  want a fixed routine. It runs{" "}
                  <strong className="text-[var(--ilt-text-primary)]">4 cycles</strong> by
                  default, then stops at{" "}
                  <strong className="text-[var(--ilt-text-primary)]">Done</strong>.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Custom timing</strong> if
                  you want different inhale/exhale lengths (and you can set
                  either hold to <strong className="text-[var(--ilt-text-primary)]">0</strong>{" "}
                  to skip it).
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Fullscreen + Sound</strong>{" "}
                  if you’re following along from a distance or with eyes closed.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want a simple meditation countdown?{" "}
                  <a
                    href="/meditation-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meditation Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a quiet session (no audio cues)?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Pair breathing with a short stretch block?{" "}
                  <a
                    href="/stretch-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stretch Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a general purpose countdown?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Online Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer counting up for open-ended sessions?{" "}
                  <a
                    href="/count-up-timer"
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
                    Phase timing
                  </div>
                  <p className="mt-2">
                    The timer targets a phase end timestamp and updates the
                    remaining time using{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      requestAnimationFrame
                    </span>{" "}
                    for smooth updates while calculating time left from a
                    high-resolution clock.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Cycle counting
                  </div>
                  <p className="mt-2">
                    A cycle is counted when the pattern wraps back to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Inhale</span>
                    . If Cycles is set to 0, it runs continuously until you
                    pause.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound cues
                  </div>
                  <p className="mt-2">
                    Sound cues use the Web Audio API to play short tones at each
                    phase change. Browsers may require a user interaction (click
                    or keypress) before audio can play.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the timer
                    card.
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      {" "}
                      Esc
                    </span>{" "}
                    exits fullscreen.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you want the
            cleanest guided experience, go fullscreen and keep Cycles at 0 for a
            continuous rhythm. If you want a fixed routine, pick 4-7-8 and let
            it run to <span className="font-semibold text-[var(--ilt-text-primary)]">Done</span>
            .
          </div>
        </details>
      </div>
    </section>
  );
}
