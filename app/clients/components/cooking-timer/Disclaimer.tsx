export default function Disclaimer() {
  const preview =
    "Kitchen-ready countdown with egg presets + common cooking presets • Custom minutes/seconds • Optional sound (final beeps + end chime) • Loop mode for repeated intervals • Fullscreen big digits • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                How this cooking timer helps
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
              <strong className="text-[var(--ilt-text-primary)]">Fast presets.</strong> Pick an
              egg doneness preset or a common kitchen preset (30 seconds to 60
              minutes) and start immediately.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Custom time input.</strong> Set
              exact{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                minutes and seconds
              </span>{" "}
              when you need something specific. Presets stay available for quick
              switching between tasks.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Big readable display.</strong>{" "}
              The digits are designed to stay clear at a distance. Go fullscreen
              for maximum readability on a phone stand, tablet, or kitchen
              display.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Optional sound cues.</strong>{" "}
              Turn on Sound for an end cue. Enable{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>{" "}
              to get a short countdown in the last 5 seconds.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Loop mode.</strong> Turn on{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Loop</span> to
              repeat the same timer back-to-back. Helpful for repeated boils,
              batch cooking, or short stove tasks.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Quick control from the timer.
              </strong>{" "}
              Start/pause with one tap in fullscreen, reset anytime, and use
              keyboard shortcuts if you’re at a laptop.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Eggs</strong> by choosing a
                  preset, then using fullscreen so you can see the time at a
                  glance while you prep other items.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Pasta</strong> with Sound
                  on so you don’t miss the finish while you’re draining or
                  stirring.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Oven checks</strong> by
                  setting a short interval (5–10m) to remind yourself to rotate,
                  check doneness, or baste.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Batch cooking</strong> by
                  enabling Loop for repeated cycles (for example, multiple
                  batches in the same pot).
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want egg-only presets?{" "}
                  <a
                    href="/egg-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Egg Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Timing tea steeping?{" "}
                  <a
                    href="/tea-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tea Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Using the oven a lot?{" "}
                  <a
                    href="/pizza-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pizza Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a big simple countdown with fewer presets?{" "}
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
                  Need multiple timers at once (different pots/pans)?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer no audio controls at all?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
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
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
                    sound ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">L</span>{" "}
                    loop.
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

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Beeps use the Web Audio API. Some browsers require a user
                    interaction (click or keypress) before audio will play, so
                    if you plan to use sound, start the timer once to “unlock”
                    audio.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Timing approach
                  </div>
                  <p className="mt-2">
                    The countdown targets an end timestamp and updates remaining
                    time using{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      requestAnimationFrame
                    </span>{" "}
                    for smooth visual updates while computing time left from a
                    high-resolution clock.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you want a clear
            finish signal without watching the screen, turn{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> on. If
            you want a quick heads-up right before it ends, enable{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>.
            For a quiet kitchen, turn Sound off and rely on fullscreen.
          </div>
        </details>
      </div>
    </section>
  );
}