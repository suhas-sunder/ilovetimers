export default function Disclaimer() {
  const preview =
    "Quick presets • Custom minutes • Fullscreen countdown • Optional sound + final beeps • Loop mode • Keyboard shortcuts";

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
              <strong className="text-slate-900">Start a break fast.</strong>{" "}
              Pick a preset (1–20 min) or type your own minutes. Press{" "}
              <span className="font-semibold text-slate-900">Space</span> to
              start/pause.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Big, readable display.</strong>{" "}
              Use fullscreen for a clean, high-contrast countdown you can see
              from across the room.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional sound cues.</strong>{" "}
              Enable Sound for an end chime. Turn on Final beeps for the last
              five seconds (helpful when you’re away from the screen).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Loop breaks if needed.</strong>{" "}
              Loop auto-restarts the same break length, useful for repeated
              “micro-break” cycles or quick stretch intervals.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Pause without losing time.
              </strong>{" "}
              Pause mid-break and resume later. Reset clears the current break
              and puts you back to your selected minutes.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Space start/pause ·{" "}
              <span className="font-semibold text-slate-900">R</span> reset ·{" "}
              <span className="font-semibold text-slate-900">F</span> fullscreen
              · <span className="font-semibold text-slate-900">S</span> sound ·{" "}
              <span className="font-semibold text-slate-900">L</span> loop
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common break picks
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">1–3 minutes</strong> quick
                  reset, water, stand up, eyes off screen.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">5 minutes</strong> short
                  break between work blocks.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">10–15 minutes</strong>{" "}
                  longer break after multiple blocks.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">20 minutes</strong>{" "}
                  reset/meal prep/walk break.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Running work blocks + breaks?{" "}
                  <a
                    href="/pomodoro-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pomodoro Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Studying with structured sessions?{" "}
                  <a
                    href="/study-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Study Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a quiet countdown (no sound)?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a general purpose timer?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>{" "}
                  or{" "}
                  <a
                    href="/online-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Online Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need multiple breaks running at once?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
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
                    Countdown accuracy
                  </div>
                  <p className="mt-2">
                    The timer targets an end timestamp and updates the display
                    with{" "}
                    <span className="font-semibold text-slate-900">rAF</span> so
                    it stays smooth while remaining time is computed from the
                    current high-resolution clock.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Final beeps
                  </div>
                  <p className="mt-2">
                    If enabled, a short beep plays once per second during the
                    last 5 seconds, then a two-tone chime plays at 0. If Sound
                    is off, it stays silent.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen uses the browser Fullscreen API on the card
                    container.{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exits.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard focus
                  </div>
                  <p className="mt-2">
                    Keyboard shortcuts work when the card is focused. If keys
                    don’t respond, click the card once, then use Space/R/F/S/L.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For a clean break
            routine, pick a preset and go fullscreen. If you want repeated
            micro-breaks, turn on Loop and keep Sound on so you don’t miss the
            end.
          </div>
        </details>
      </div>
    </section>
  );
}
