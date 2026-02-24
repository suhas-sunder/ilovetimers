export default function Disclaimer() {
  const preview =
    "Big fullscreen countdown for smartboards & projectors • Quick presets • Custom label • Optional sound (final beeps + end chime) • Quick adjust (+/- minutes) • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                How this classroom timer helps
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
                Made for the front of the room.
              </strong>{" "}
              The time display is designed to be big and readable on
              smartboards, projectors, and classroom TVs.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick presets.</strong> Pick a
              common classroom duration (1–60 minutes) and start immediately.
              You can also enter a custom minute value when you need something
              specific.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Custom label.</strong> Add a
              short label like{" "}
              <span className="font-semibold text-slate-900">
                Transition, Quiz, Centers
              </span>{" "}
              so students know what the timer is for at a glance.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional sound cues.</strong>{" "}
              Turn on Sound for end cues. Enable{" "}
              <span className="font-semibold text-slate-900">Final beeps</span>{" "}
              for a short countdown near the end and{" "}
              <span className="font-semibold text-slate-900">End chime</span>{" "}
              for a clear “time’s up” signal.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick adjust.</strong> Add or
              subtract time while running (±1 minute, +5 minutes) without
              stopping the timer. Useful when you decide to give “one more
              minute.”
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen controls.</strong>{" "}
              Go fullscreen for maximum readability. In fullscreen, you can use
              on-screen controls and keyboard shortcuts without hunting for tiny
              buttons.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Quick ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Transitions</strong> with a
                  label like “Cleanup” and Sound on so students hear the end.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Timed work blocks</strong>{" "}
                  by choosing a preset (10m, 15m, 20m) and using +1 minute when
                  you want a small extension.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Small quizzes</strong> with
                  Final beeps on so the last seconds are obvious without
                  constant reminders.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Centers / rotations
                  </strong>{" "}
                  by setting one duration and resetting between groups.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a timer designed for slides or speaking?{" "}
                  <a
                    href="/presentation-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Running a formal assessment?{" "}
                  <a
                    href="/exam-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Exam Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a big simple countdown with fewer options?{" "}
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
                  Prefer a silent display (no audio controls)?{" "}
                  <a
                    href="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a more visual cue for younger students?{" "}
                  <a
                    href="/visual-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Visual Timer
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
                    <span className="font-semibold text-slate-900">+</span> add
                    1 minute ·{" "}
                    <span className="font-semibold text-slate-900">-</span>{" "}
                    subtract 1 minute.
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
            <strong className="text-slate-900">Tip.</strong> If you want
            students to notice the ending without constant reminders, enable{" "}
            <span className="font-semibold text-slate-900">Final beeps</span>{" "}
            and <span className="font-semibold text-slate-900">End chime</span>.
            For silent classrooms, turn Sound off and rely on the big fullscreen
            display.
          </div>
        </details>
      </div>
    </section>
  );
}
