export default function Disclaimer() {
  const preview =
    "Tap to get BPM instantly • Auto-reset after pauses • Hold + lock results • ms/beat + subdivisions • Fullscreen + keyboard shortcuts • Recent results";

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
                Instant BPM from your taps.
              </strong>{" "}
              Tap/click anywhere to register beats. After a few taps, you’ll get
              a stable BPM estimate (using your most consistent intervals).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Auto-reset after pauses.
              </strong>{" "}
              If you stop tapping, the session ends after your chosen reset time
              so the next phrase starts clean (no stale taps).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Hold the last result.</strong>{" "}
              After the session ends, the BPM stays on screen for a set time so
              you can read it, copy it, or lock it.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Lock a result (no reset).
              </strong>{" "}
              Lock freezes the display so it won’t clear or change. Useful when
              you want to compare tempos or keep a number visible while you
              work.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Timing breakdown for practice.
              </strong>{" "}
              See milliseconds per beat plus quick reference for 8th and
              16th-note timing (half and quarter of ms/beat).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen for big, readable BPM.
              </strong>{" "}
              Go fullscreen for a clean stage, tap anywhere to register beats,
              and <span className="font-semibold text-slate-900">Esc</span>{" "}
              exits.
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
                    Find a song’s tempo
                  </strong>{" "}
                  Tap along for 6–10 beats, then lock the result to compare
                  against a target BPM.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Practice timing</strong>{" "}
                  Use ms/beat to sanity-check subdivisions (8ths/16ths) while
                  rehearsing.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Set a metronome tempo
                  </strong>{" "}
                  Tap the groove first, then switch to a metronome with the BPM
                  you found.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want the clicks instead of tapping?{" "}
                  <a
                    href="/metronome"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Metronome
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a big stage display for timing?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/presentation-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Measuring speed instead of tempo?{" "}
                  <a
                    href="/reaction-time-test"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Reaction Time Test
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need elapsed time while rehearsing?{" "}
                  <a
                    href="/stopwatch"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
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
                    BPM calculation
                  </div>
                  <p className="mt-2">
                    BPM is estimated from the{" "}
                    <span className="font-semibold text-slate-900">median</span>{" "}
                    of valid tap-to-tap intervals, then converted to beats per
                    minute. Median reduces the impact of one “bad” tap.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Interval filtering
                  </div>
                  <p className="mt-2">
                    Intervals outside a reasonable range are ignored (very fast
                    or very slow taps) so accidental double-taps or long pauses
                    don’t pollute the result.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Reset and hold behavior
                  </div>
                  <p className="mt-2">
                    After you stop tapping, the session ends after your reset
                    time. The last result can remain visible for the hold time,
                    then clears automatically unless it’s locked.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen and shortcuts
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the card.
                    Click the card once for keyboard focus, then use{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen,{" "}
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    reset,{" "}
                    <span className="font-semibold text-slate-900">C</span>{" "}
                    copy,{" "}
                    <span className="font-semibold text-slate-900">
                      Space/Enter
                    </span>{" "}
                    to tap (if enabled).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Privacy notes
                  </div>
                  <p className="mt-2">
                    Your reset/hold preferences and recent results can be stored
                    in{" "}
                    <span className="font-semibold text-slate-900">
                      localStorage
                    </span>{" "}
                    in your browser so they persist between visits. Nothing
                    needs an account to work.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Heads up.</strong> BPM gets more
            stable after several consistent taps. If the number feels jumpy,
            keep tapping a few beats longer or use Lock only once it settles.
          </div>
        </details>
      </div>
    </section>
  );
}
