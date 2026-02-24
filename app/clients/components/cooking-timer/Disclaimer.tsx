export default function Disclaimer() {
  const preview =
    "Kitchen-ready countdown with egg presets + common cooking presets • Custom minutes/seconds • Optional sound (final beeps + end chime) • Loop mode for repeated intervals • Fullscreen big digits • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                How this cooking timer helps
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
              <strong className="text-slate-900">Fast presets.</strong> Pick an
              egg doneness preset or a common kitchen preset (30 seconds to 60
              minutes) and start immediately.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Custom time input.</strong> Set
              exact{" "}
              <span className="font-semibold text-slate-900">
                minutes and seconds
              </span>{" "}
              when you need something specific. Presets stay available for quick
              switching between tasks.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Big readable display.</strong>{" "}
              The digits are designed to stay clear at a distance. Go fullscreen
              for maximum readability on a phone stand, tablet, or kitchen
              display.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional sound cues.</strong>{" "}
              Turn on Sound for an end cue. Enable{" "}
              <span className="font-semibold text-slate-900">Final beeps</span>{" "}
              to get a short countdown in the last 5 seconds.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Loop mode.</strong> Turn on{" "}
              <span className="font-semibold text-slate-900">Loop</span> to
              repeat the same timer back-to-back. Helpful for repeated boils,
              batch cooking, or short stove tasks.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Quick control from the timer.
              </strong>{" "}
              Start/pause with one tap in fullscreen, reset anytime, and use
              keyboard shortcuts if you’re at a laptop.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Eggs</strong> by choosing a
                  preset, then using fullscreen so you can see the time at a
                  glance while you prep other items.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Pasta</strong> with Sound
                  on so you don’t miss the finish while you’re draining or
                  stirring.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Oven checks</strong> by
                  setting a short interval (5–10m) to remind yourself to rotate,
                  check doneness, or baste.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Batch cooking</strong> by
                  enabling Loop for repeated cycles (for example, multiple
                  batches in the same pot).
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want egg-only presets?{" "}
                  <a
                    href="/egg-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Egg Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing tea steeping?{" "}
                  <a
                    href="/tea-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tea Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Using the oven a lot?{" "}
                  <a
                    href="/pizza-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pizza Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a big simple countdown with fewer presets?{" "}
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
                  Need multiple timers at once (different pots/pans)?{" "}
                  <a
                    href="/multiple-timers"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer no audio controls at all?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
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
                    sound ·{" "}
                    <span className="font-semibold text-slate-900">L</span>{" "}
                    loop.
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

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Beeps use the Web Audio API. Some browsers require a user
                    interaction (click or keypress) before audio will play, so
                    if you plan to use sound, start the timer once to “unlock”
                    audio.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Timing approach
                  </div>
                  <p className="mt-2">
                    The countdown targets an end timestamp and updates remaining
                    time using{" "}
                    <span className="font-semibold text-slate-900">
                      requestAnimationFrame
                    </span>{" "}
                    for smooth visual updates while computing time left from a
                    high-resolution clock.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you want a clear
            finish signal without watching the screen, turn{" "}
            <span className="font-semibold text-slate-900">Sound</span> on. If
            you want a quick heads-up right before it ends, enable{" "}
            <span className="font-semibold text-slate-900">Final beeps</span>.
            For a quiet kitchen, turn Sound off and rely on fullscreen.
          </div>
        </details>
      </div>
    </section>
  );
}