import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Start/pause • Reset • Fullscreen big display • Tap time to toggle (fullscreen) • Topic splits • Optional agenda cap • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Meeting Count Up Timer at a glance
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
              Use this page to track elapsed meeting time with a clean count-up
              display.
            </strong>{" "}
            Start when the meeting begins, pause if you take a break, and use
            fullscreen when you want a large clock everyone can read. If you run
            an agenda, press <strong className="text-slate-900">Topic</strong>{" "}
            to record how long each item took.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fast start, clear status.
              </strong>{" "}
              The timer shows{" "}
              <span className="font-semibold text-slate-900">Ready</span>,{" "}
              <span className="font-semibold text-slate-900">Running</span>, or{" "}
              <span className="font-semibold text-slate-900">Paused</span> so
              you always know what is happening at a glance.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen meeting view.
              </strong>{" "}
              Go fullscreen for a big, readable timer. In fullscreen, you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the time
              </span>{" "}
              to start or pause. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Topic splits for agendas.
              </strong>{" "}
              Press <strong className="text-slate-900">Topic</strong> (or{" "}
              <strong className="text-slate-900">T</strong>) while running to
              log an agenda split. You will see both:
              <div className="mt-2 grid gap-2">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="font-semibold text-slate-900">Total</span>{" "}
                  elapsed time (meeting time so far)
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="font-semibold text-slate-900">Split</span>{" "}
                  time (time since the last Topic)
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Optional agenda cap.</strong>{" "}
              If you know the number of agenda items, set{" "}
              <span className="font-semibold text-slate-900">
                # of agenda topics
              </span>{" "}
              to cap how many Topic splits you can record. Leaving it blank (∞)
              means unlimited.
              <div className="mt-2 text-xs font-semibold text-slate-600">
                The cap will not go below your already-recorded topics.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Custom button label.</strong>{" "}
              Change the Topic label to match your workflow, like{" "}
              <span className="font-semibold text-slate-900">Agenda</span>,{" "}
              <span className="font-semibold text-slate-900">Section</span>,{" "}
              <span className="font-semibold text-slate-900">Q&amp;A</span>, or{" "}
              <span className="font-semibold text-slate-900">Demo</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Use quick controls without hunting for buttons: Space to start or
              pause, T for Topic, R for reset, and F for fullscreen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Start the meeting</strong>
                : press{" "}
                <span className="font-semibold text-slate-900">Start</span> when
                the meeting begins (or Space).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Track agenda time</strong>
                : press{" "}
                <span className="font-semibold text-slate-900">Topic</span> (or
                T) each time you move to the next agenda item.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Use fullscreen</strong>:
                press{" "}
                <span className="font-semibold text-slate-900">Fullscreen</span>{" "}
                (or F) for a large display. Tap the time to start or pause while
                fullscreen.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Example meeting flows
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Daily standup</strong>:
                  Start the timer, then press Topic when you switch from updates
                  to blockers and wrap-up. You will see each segment split and
                  the total elapsed time.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Client call</strong>:
                  Rename Topic to{" "}
                  <span className="font-semibold text-slate-900">Section</span>{" "}
                  and track time spent on intro, requirements, demo, Q&amp;A,
                  and next steps.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Workshop</strong>: Set an
                  agenda cap (for example 6 items) so Topic splits stay aligned
                  with your plan while you run fullscreen for the room.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Break handling</strong>:
                  Pause when you take a break, then Start again when you resume.
                  The elapsed time stays accurate without needing mental math.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a meeting countdown instead (time remaining)?{" "}
                  <Link
                    to="/meeting-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a simpler count up without topic splits?{" "}
                  <Link
                    to="/count-up-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Count Up Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Presenting and want a clean stage-facing display?{" "}
                  <Link
                    to="/presentation-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Presentation Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a classic lap-style tool?{" "}
                  <Link
                    to="/stopwatch"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need to total time across sessions?{" "}
                  <Link
                    to="/time-calculator"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Calculator
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
                    <span className="font-semibold text-slate-900">T</span>{" "}
                    topic ·{" "}
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Topic split logic
                  </div>
                  <p className="mt-2">Each Topic records two numbers:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      <span className="font-semibold text-slate-900">
                        Total
                      </span>{" "}
                      is the meeting elapsed time at the moment you pressed
                      Topic.
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">
                        Split
                      </span>{" "}
                      is the time since the previous Topic (or since start for
                      the first Topic).
                    </li>
                  </ul>
                  <p className="mt-2">
                    Splits are shown most recent first, and fullscreen shows up
                    to the latest 6 for quick scanning.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen expands the time display to fit your screen,
                    keeps a small top bar for controls, and allows tap or click
                    on the time to start or pause.
                  </p>
                  <p className="mt-2">
                    If fullscreen is blocked, try again after an explicit click
                    on the Fullscreen button (some browsers require a user
                    gesture).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Display formatting
                  </div>
                  <p className="mt-2">
                    The timer displays{" "}
                    <span className="font-semibold text-slate-900">m:ss</span>{" "}
                    while under an hour, and switches to{" "}
                    <span className="font-semibold text-slate-900">
                      h:mm:ss
                    </span>{" "}
                    after 1 hour.
                  </p>
                  <p className="mt-2">
                    Reset clears elapsed time and all Topic splits.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you are sharing
            the timer on a screen, go fullscreen and use{" "}
            <strong className="text-slate-900">Space</strong> to start or pause
            without moving your mouse. If you run an agenda, press{" "}
            <strong className="text-slate-900">T</strong> at each transition so
            your Topic splits match the meeting flow.
          </div>
        </details>
      </div>
    </section>
  );
}
