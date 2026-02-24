export default function Disclaimer() {
  const preview =
    "Soft, jammy, medium, hard presets • Custom time • Optional sound • Final countdown beeps • Fullscreen mode • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Egg Timer at a glance
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
              Use this page to run a clear, no-fuss egg countdown with one-tap
              presets (soft, jammy, medium, hard) or a custom time.
            </strong>{" "}
            Press Start, keep the display big and readable, and optionally turn
            on sound plus final countdown beeps. Fullscreen is designed for
            hands-free cooking, and in fullscreen you can tap/click the timer to
            start or pause.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Egg presets.</strong> Jump to a
              common doneness quickly (soft, jammy, medium, hard, very hard).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Custom time.</strong> Set any
              minutes and seconds when you want something specific.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional sound.</strong> Get a
              clear finish signal, or keep it silent.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Final countdown beeps.</strong>{" "}
              Optional short beeps in the last few seconds so you can react
              without staring at the screen.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong> Big,
              clean display for the kitchen. In fullscreen, you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the time
              </span>{" "}
              to start or pause.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Space start/pause, R reset, F fullscreen, S sound toggle.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Fast setup
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Pick a time</strong>: tap
                a preset (Soft, Jammy, Medium, Hard) or set minutes and seconds.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Press Start</strong>: the
                countdown runs with a big, readable display.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  3) Use the mode you need
                </strong>
                : turn on sound/final beeps, or go fullscreen for a cleaner
                kitchen view.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Helpful ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Hands-busy cooking</strong>
                  : go fullscreen so the remaining time is easy to see from
                  across the room.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Quiet kitchen</strong>:
                  keep sound off and just glance at the timer.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Don’t miss the end</strong>
                  : enable final countdown beeps so you get a heads-up before it
                  finishes.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Repeat batches</strong>:
                  hit Reset to rerun the same time without re-entering anything.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a general kitchen countdown?{" "}
                  <a
                    href="/cooking-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Cooking Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing tea instead?{" "}
                  <a
                    href="/tea-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tea Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a clean timer with no audio?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a simple one-off countdown tool?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a big wall-style display?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Details and shortcuts</span>
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
                    start/pause ·{" "}
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">S</span>{" "}
                    sound toggle ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    If shortcuts don’t work, click/tap the card once so it has
                    focus.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    What “Reset” does
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">Reset</span>{" "}
                    stops the timer and returns the countdown to the currently
                    selected time (preset or custom).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Sound uses a short WebAudio beep. Some browsers only allow
                    audio after you interact with the page (click/tap/press a
                    key).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Timing notes
                  </div>
                  <p className="mt-2">
                    The timer runs as long as this page is open. Background tabs
                    may update less often depending on browser power-saving, so
                    the display can drift slightly while in the background.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen. In
                    fullscreen, clicking/tapping the timer display toggles
                    start/pause.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Note.</strong> Presets are meant
            to be quick starting points. Use custom minutes and seconds if you
            want a specific duration.
          </div>
        </details>
      </div>
    </section>
  );
}
