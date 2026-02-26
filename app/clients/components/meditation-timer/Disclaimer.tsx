import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Meditation presets • Breathing presets • Custom minutes + seconds • Fullscreen tap-to-start • Optional sound • End chime • Final beeps • Loop • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Meditation Timer at a glance
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
              Use this page for a calm, distraction-free countdown for
              meditation, breathing exercises, or yoga.
            </strong>{" "}
            Pick a preset or set a custom time, then start. Go fullscreen for a
            large, readable display, and optionally enable a gentle end chime,
            final beeps, or looping sessions.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick presets.</strong> Choose
              common meditation lengths (5, 10, 15, 20, 30 minutes and more) or
              short sessions for quick resets.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Breathing options.</strong> Use
              breathing presets (including box breathing practice) when you want
              a structured, timed breathing block without distractions.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Custom time control.</strong>{" "}
              Set minutes and add extra seconds for precise session lengths
              (useful for breathwork, yoga holds, or short mindfulness breaks).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional sound.</strong> Keep
              it silent by default, or enable Sound for a gentle{" "}
              <span className="font-semibold text-slate-900">end chime</span>{" "}
              and optional{" "}
              <span className="font-semibold text-slate-900">
                final 5-second beeps
              </span>{" "}
              near the end.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Loop sessions.</strong> Turn on{" "}
              <span className="font-semibold text-slate-900">Loop</span> to
              restart automatically when the countdown finishes (useful for
              repeating short breathing blocks).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen meditation view.
              </strong>{" "}
              Go fullscreen for a clean, big timer. In fullscreen, you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the time
              </span>{" "}
              to start or pause. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span>.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Set your time</strong>:
                pick a meditation preset, a breathing preset, or set custom
                minutes and seconds.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Choose options</strong>:
                keep it silent, or enable Sound, End chime, Final beeps, and
                Loop (optional).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Run fullscreen</strong>:
                press{" "}
                <span className="font-semibold text-slate-900">Start</span>,
                then use Fullscreen for a large display. Tap the time to
                start/pause while fullscreen.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common sessions
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Quick reset</strong>: 1 to
                  3 minutes to settle and refocus.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Daily sit</strong>: 10 to
                  20 minutes, silent or with an end chime.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Breathwork block</strong>:
                  3 to 10 minutes (box breathing or calm breathing presets).
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Yoga holds</strong>: 30 to
                  90 seconds per hold, using custom seconds for precision.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want guided breathing intervals?{" "}
                  <Link
                    to="/breathing-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Breathing Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a no-sound timer by design?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want the biggest possible display with minimal controls?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing rest or recovery after yoga or stretching?{" "}
                  <Link
                    to="/rest-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Rest Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a sleep-friendly countdown?{" "}
                  <Link
                    to="/sleep-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Sleep Timer
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Controls + behavior details</span>
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
                    <span className="font-semibold text-slate-900">L</span> loop
                    · <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    In fullscreen, top controls stay available and the time
                    display grows to fit your screen. You can tap/click the time
                    to start or pause.
                  </p>
                  <p className="mt-2">
                    Exit fullscreen with{" "}
                    <span className="font-semibold text-slate-900">Esc</span> or
                    the Exit button in the top bar.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Final beeps
                  </div>
                  <p className="mt-2">
                    Final beeps are optional and only run in the last{" "}
                    <span className="font-semibold text-slate-900">
                      5 seconds
                    </span>{" "}
                    of the countdown.
                  </p>
                  <p className="mt-2">
                    If Sound is off, final beeps are disabled automatically.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture before audio will play.
                    If you do not hear cues, press{" "}
                    <span className="font-semibold text-slate-900">Start</span>{" "}
                    once, then enable Sound and try again.
                  </p>
                  <p className="mt-2">
                    End chime plays when the timer reaches{" "}
                    <span className="font-semibold text-slate-900">0:00</span>{" "}
                    (if enabled).
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For a calm setup:
            go fullscreen, keep Sound off, and use{" "}
            <strong className="text-slate-900">Space</strong> to start/pause. If
            you want a clear finish, enable{" "}
            <strong className="text-slate-900">End chime</strong> without final
            beeps.
          </div>
        </details>
      </div>
    </section>
  );
}
