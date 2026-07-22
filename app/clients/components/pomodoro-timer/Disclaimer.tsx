import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "25/5 focus cycles • Custom work/break + cycles • Long break option • Auto-advance • Sound + final 3-2-1 beeps • Fullscreen + shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Pomodoro timer
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Run focused work sessions with timed breaks, without thinking
              about what comes next.
            </strong>{" "}
            Start a 25/5 routine (or your own timings), let it switch phases for
            you, and use fullscreen when you want a clean, minimal display.
            Skip ahead when you need to, or turn off auto-advance for
            manual control.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Work, break, cycles.</strong>{" "}
              Set your <strong className="text-[var(--ilt-text-primary)]">Work minutes</strong>,{" "}
              <strong className="text-[var(--ilt-text-primary)]">Break minutes</strong>, and how
              many cycles you want to complete.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Long break (optional).</strong>{" "}
              Enable a{" "}
              <strong className="text-[var(--ilt-text-primary)]">
                long break after the last cycle
              </strong>{" "}
              and choose the minutes. If you disable long break, the routine
              ends cleanly after the final work session.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Auto-advance.</strong> When
              Auto is on, the timer switches phases automatically. Turn it off
              if you want to{" "}
              <strong className="text-[var(--ilt-text-primary)]">pause between phases</strong>{" "}
              and hit Next when you are ready.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound + final beeps.</strong>{" "}
              Toggle sound for phase change alerts. Optionally enable{" "}
              <strong className="text-[var(--ilt-text-primary)]">final 3-2-1 beeps</strong> near
              the end (only when Sound is on).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen display.</strong> Go
              fullscreen for a large countdown. In fullscreen you can{" "}
              <strong className="text-[var(--ilt-text-primary)]">tap/click the time</strong> to
              start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space start/pause · N next · R reset · F fullscreen.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set your routine</strong>:
                choose Work, Break, and Cycles. Optional: enable a Long break
                after the last cycle.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Pick behavior</strong>:
                turn on Auto to flow continuously, or off for manual phase
                control. Toggle Sound and optional final 3-2-1 beeps.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Start</strong>: press{" "}
                <strong className="text-[var(--ilt-text-primary)]">Start</strong> (or{" "}
                <strong className="text-[var(--ilt-text-primary)]">Space</strong>). Use{" "}
                <strong className="text-[var(--ilt-text-primary)]">Next</strong> if you want to
                skip ahead and keep momentum.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Work blocks</strong>:
                  a clear countdown and automatic breaks so the next phase is
                  visible.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Study sessions</strong>:
                  consistent work intervals plus structured recovery time.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Teams or shared spaces
                  </strong>
                  : fullscreen visibility with simple shortcuts.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Routine building</strong>:
                  repeatable cycles and an optional long break to wrap up.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want a study-focused layout?{" "}
                  <Link
                    to="/study-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Study Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a single uninterrupted focus block?{" "}
                  <Link
                    to="/focus-session-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Focus Session Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a simple countdown (no phases)?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want structured breaks without Pomodoro cycles?{" "}
                  <Link
                    to="/break-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Break Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want the biggest minimal display?{" "}
                  <Link
                    to="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need quiet sessions with no audio at all?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>How it works, shortcuts, and notes</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Space</strong>:
                      start/pause
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">N</strong>: next phase
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset to
                      the start of the routine
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the card once so shortcuts are captured.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen controls
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      Tap/click the time display to{" "}
                      <strong className="text-[var(--ilt-text-primary)]">start/pause</strong>.
                    </li>
                    <li>
                      Use the top bar buttons for Start/Pause, Next, and Reset.
                    </li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Phase flow
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      The timer runs{" "}
                      <strong className="text-[var(--ilt-text-primary)]">
                        Work → Short break
                      </strong>{" "}
                      until you finish the final cycle.
                    </li>
                    <li>
                      After the final work session, it either starts a{" "}
                      <strong className="text-[var(--ilt-text-primary)]">Long break</strong> (if
                      enabled) or marks the routine{" "}
                      <strong className="text-[var(--ilt-text-primary)]">Complete</strong>.
                    </li>
                    <li>
                      With Auto off, when a phase hits 0 you will see a prompt
                      to press <strong className="text-[var(--ilt-text-primary)]">Next</strong>.
                    </li>
                  </ul>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
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

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you want fewer
            interruptions, increase Work minutes or reduce Cycles. If you want
            tighter accountability, keep cycles short and use Auto so breaks do
            not get skipped.
          </div>
        </details>
      </div>
    </section>
  );
}
