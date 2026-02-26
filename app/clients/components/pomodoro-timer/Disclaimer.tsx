import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "25/5 focus cycles • Custom work/break + cycles • Long break option • Auto-advance • Sound + final 3-2-1 beeps • Fullscreen + shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Pomodoro timer
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
              Run focused work sessions with timed breaks, without thinking
              about what comes next.
            </strong>{" "}
            Start a 25/5 routine (or your own timings), let it switch phases for
            you, and use fullscreen when you want a clean, distraction-free
            display. Skip ahead when you need to, or turn off auto-advance for
            manual control.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Work, break, cycles.</strong>{" "}
              Set your <strong className="text-slate-900">Work minutes</strong>,{" "}
              <strong className="text-slate-900">Break minutes</strong>, and how
              many cycles you want to complete.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Long break (optional).</strong>{" "}
              Enable a{" "}
              <strong className="text-slate-900">
                long break after the last cycle
              </strong>{" "}
              and choose the minutes. If you disable long break, the routine
              ends cleanly after the final work session.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Auto-advance.</strong> When
              Auto is on, the timer switches phases automatically. Turn it off
              if you want to{" "}
              <strong className="text-slate-900">pause between phases</strong>{" "}
              and hit Next when you are ready.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Sound + final beeps.</strong>{" "}
              Toggle sound for phase change alerts. Optionally enable{" "}
              <strong className="text-slate-900">final 3-2-1 beeps</strong> near
              the end (only when Sound is on).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen focus.</strong> Go
              fullscreen for a large countdown. In fullscreen you can{" "}
              <strong className="text-slate-900">tap/click the time</strong> to
              start or pause.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Space start/pause · N next · R reset · F fullscreen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Set your routine</strong>:
                choose Work, Break, and Cycles. Optional: enable a Long break
                after the last cycle.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Pick behavior</strong>:
                turn on Auto to flow continuously, or off for manual phase
                control. Toggle Sound and optional final 3-2-1 beeps.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Start</strong>: press{" "}
                <strong className="text-slate-900">Start</strong> (or{" "}
                <strong className="text-slate-900">Space</strong>). Use{" "}
                <strong className="text-slate-900">Next</strong> if you want to
                skip ahead and keep momentum.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Deep work blocks</strong>:
                  a clear countdown and automatic breaks to reduce decision
                  fatigue.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Study sessions</strong>:
                  consistent work intervals plus structured recovery time.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Teams or shared spaces
                  </strong>
                  : fullscreen visibility with simple shortcuts.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Routine building</strong>:
                  repeatable cycles and an optional long break to wrap up.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a study-focused layout?{" "}
                  <Link
                    to="/study-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Study Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a single uninterrupted focus block?{" "}
                  <Link
                    to="/focus-session-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Focus Session Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a simple countdown (no phases)?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want structured breaks without Pomodoro cycles?{" "}
                  <Link
                    to="/break-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Break Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want the biggest distraction-free display?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need quiet sessions with no audio at all?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
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
                <span>How it works, shortcuts, and notes</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-slate-900">Space</strong>:
                      start/pause
                    </li>
                    <li>
                      <strong className="text-slate-900">N</strong>: next phase
                    </li>
                    <li>
                      <strong className="text-slate-900">R</strong>: reset to
                      the start of the routine
                    </li>
                    <li>
                      <strong className="text-slate-900">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-slate-900">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the card once so shortcuts are captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen controls
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Tap/click the time display to{" "}
                      <strong className="text-slate-900">start/pause</strong>.
                    </li>
                    <li>
                      Use the top bar buttons for Start/Pause, Next, and Reset.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Phase flow
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      The timer runs{" "}
                      <strong className="text-slate-900">
                        Work → Short break
                      </strong>{" "}
                      until you finish the final cycle.
                    </li>
                    <li>
                      After the final work session, it either starts a{" "}
                      <strong className="text-slate-900">Long break</strong> (if
                      enabled) or marks the routine{" "}
                      <strong className="text-slate-900">Complete</strong>.
                    </li>
                    <li>
                      With Auto off, when a phase hits 0 you will see a prompt
                      to press <strong className="text-slate-900">Next</strong>.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Audio note
                  </div>
                  <p className="mt-2">
                    Some browsers require a user interaction before audio can
                    play. If you do not hear alerts, click Start once with Sound
                    enabled.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you want fewer
            interruptions, increase Work minutes or reduce Cycles. If you want
            tighter accountability, keep cycles short and use Auto so breaks do
            not get skipped.
          </div>
        </details>
      </div>
    </section>
  );
}
