export default function Disclaimer() {
  const preview =
    "Tap to get BPM instantly • Auto-reset after pauses • Hold + lock results • ms/beat + subdivisions • Fullscreen + keyboard shortcuts • Recent results";

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
                Instant BPM from your taps.
              </strong>{" "}
              Tap/click anywhere to register beats. After a few taps, you’ll get
              a stable BPM estimate (using your most consistent intervals).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Auto-reset after pauses.
              </strong>{" "}
              If you stop tapping, the session ends after your chosen reset time
              so the next phrase starts clean (no stale taps).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Hold the last result.</strong>{" "}
              After the session ends, the BPM stays on screen for a set time so
              you can read it, copy it, or lock it.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Lock a result (no reset).
              </strong>{" "}
              Lock freezes the display so it won’t clear or change. Useful when
              you want to compare tempos or keep a number visible while you
              work.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Timing breakdown for practice.
              </strong>{" "}
              See milliseconds per beat plus quick reference for 8th and
              16th-note timing (half and quarter of ms/beat).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen for big, readable BPM.
              </strong>{" "}
              Go fullscreen for a clean stage, tap anywhere to register beats,
              and <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
              exits.
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
                    Find a song’s tempo
                  </strong>{" "}
                  Tap along for 6–10 beats, then lock the result to compare
                  against a target BPM.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Practice timing</strong>{" "}
                  Use ms/beat to sanity-check subdivisions (8ths/16ths) while
                  rehearsing.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Set a metronome tempo
                  </strong>{" "}
                  Tap the groove first, then switch to a metronome with the BPM
                  you found.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want the clicks instead of tapping?{" "}
                  <a
                    href="/metronome"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Metronome
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a big stage display for timing?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/presentation-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Measuring speed instead of tempo?{" "}
                  <a
                    href="/reaction-time-test"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Reaction Time Test
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need elapsed time while rehearsing?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
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
                    BPM calculation
                  </div>
                  <p className="mt-2">
                    BPM is estimated from the{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">median</span>{" "}
                    of valid tap-to-tap intervals, then converted to beats per
                    minute. Median reduces the impact of one “bad” tap.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Interval filtering
                  </div>
                  <p className="mt-2">
                    Intervals outside a reasonable range are ignored (very fast
                    or very slow taps) so accidental double-taps or long pauses
                    don’t pollute the result.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Reset and hold behavior
                  </div>
                  <p className="mt-2">
                    After you stop tapping, the session ends after your reset
                    time. The last result can remain visible for the hold time,
                    then clears automatically unless it’s locked.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen and shortcuts
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the card.
                    Click the card once for keyboard focus, then use{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen,{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset,{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span>{" "}
                    copy,{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Space/Enter
                    </span>{" "}
                    to tap (if enabled).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Privacy notes
                  </div>
                  <p className="mt-2">
                    Your reset/hold preferences and recent results can be stored
                    in{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      localStorage
                    </span>{" "}
                    in your browser so they persist between visits. Nothing
                    needs an account to work.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Heads up.</strong> BPM gets more
            stable after several consistent taps. If the number feels jumpy,
            keep tapping a few beats longer or use Lock only once it settles.
          </div>
        </details>
      </div>
    </section>
  );
}
