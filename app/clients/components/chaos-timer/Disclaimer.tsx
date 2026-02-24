export default function Disclaimer() {
  const preview =
    "Random range • Single random countdown or random intervals • Interval preview • Optional sound beeps • Fullscreen mode • Keyboard shortcuts";

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
                Unpredictable countdowns.
              </strong>{" "}
              Set a minimum and maximum seconds range, then the timer rolls a
              random duration each time so you can’t memorize the pace.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Two modes.</strong> Use{" "}
              <span className="font-semibold text-slate-900">Random timer</span>{" "}
              for a single countdown, or{" "}
              <span className="font-semibold text-slate-900">
                Random interval timer
              </span>{" "}
              to run a sequence of random intervals.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">See what’s happening.</strong>{" "}
              The display shows the current rolled duration and your progress in
              interval mode, plus a{" "}
              <span className="font-semibold text-slate-900">
                next interval preview
              </span>{" "}
              so you can anticipate what’s coming without knowing the full plan.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional beeps.</strong> Turn
              on Sound to enable beeps. You can beep at the end of each interval
              (and optionally add final 5-second beeps near the end). If Sound
              is off, the timer stays silent.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen, big and clean.
              </strong>{" "}
              Go fullscreen for a readable countdown you can see from across the
              room. In fullscreen you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the timer
              </span>{" "}
              to start or pause.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Space start/pause ·{" "}
              <span className="font-semibold text-slate-900">R</span> reset ·{" "}
              <span className="font-semibold text-slate-900">F</span> fullscreen
              · <span className="font-semibold text-slate-900">S</span> sound
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Reaction drills</strong> by
                  setting a tight range (example: 8–12s) and using interval
                  mode.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Games/classroom prompts
                  </strong>{" "}
                  with a wider range (example: 20–60s) and Sound on so the end
                  is obvious without watching.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Focus bursts</strong> by
                  running intervals with final beeps on for a clear “wrap it up”
                  cue in the last few seconds.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">One-off randomness</strong>{" "}
                  by using Random timer (single) when you only need one
                  unpredictable countdown.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want structured work/rest instead of randomness?{" "}
                  <a
                    href="/hiit-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/tabata-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need multiple timers running side by side?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a big, simple countdown (no randomness)?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a quiet display with no audio?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want to track open-ended time instead?{" "}
                  <a
                    href="/count-up-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Count Up Timer
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
                    Random roll + preview
                  </div>
                  <p className="mt-2">
                    Each interval duration is rolled uniformly within your
                    seconds range. In interval mode, the app also rolls the next
                    duration early so it can show a{" "}
                    <span className="font-semibold text-slate-900">
                      next preview
                    </span>{" "}
                    while the current interval runs.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Timer accuracy
                  </div>
                  <p className="mt-2">
                    The timer targets an end timestamp and updates remaining
                    time using{" "}
                    <span className="font-semibold text-slate-900">
                      requestAnimationFrame
                    </span>{" "}
                    for smooth updates while calculating time left from a
                    high-resolution clock.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Beeps use the Web Audio API. Some browsers require a user
                    interaction (click or keypress) before sound can play.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the timer
                    card.{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exits fullscreen.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For the most
            “unpredictable” feel, use interval mode with Sound on and a medium
            range (example: 10–45s). If you only need one random countdown,
            switch to Random timer (single), hit Start, and you’re done.
          </div>
        </details>
      </div>
    </section>
  );
}
