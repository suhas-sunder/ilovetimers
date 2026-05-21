import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Meditation presets • Breathing presets • Custom minutes + seconds • Fullscreen tap-to-start • Optional sound • End chime • Final beeps • Loop • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Meditation Timer at a glance
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
              Use this page for a calm, distraction-free countdown for
              meditation, breathing exercises, or yoga.
            </strong>{" "}
            Pick a preset or set a custom time, then start. Go fullscreen for a
            large, readable display, and optionally enable a gentle end chime,
            final beeps, or looping sessions.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick presets.</strong> Choose
              common meditation lengths (5, 10, 15, 20, 30 minutes and more) or
              short sessions for quick resets.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Breathing options.</strong> Use
              breathing presets (including box breathing practice) when you want
              a structured, timed breathing block without distractions.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Custom time control.</strong>{" "}
              Set minutes and add extra seconds for precise session lengths
              (useful for breathwork, yoga holds, or short mindfulness breaks).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Optional sound.</strong> Keep
              it silent by default, or enable Sound for a gentle{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">end chime</span>{" "}
              and optional{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                final 5-second beeps
              </span>{" "}
              near the end.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Loop sessions.</strong> Turn on{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Loop</span> to
              restart automatically when the countdown finishes (useful for
              repeating short breathing blocks).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen meditation view.
              </strong>{" "}
              Go fullscreen for a clean, big timer. In fullscreen, you can{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the time
              </span>{" "}
              to start or pause. Exit with{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set your time</strong>:
                pick a meditation preset, a breathing preset, or set custom
                minutes and seconds.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Choose options</strong>:
                keep it silent, or enable Sound, End chime, Final beeps, and
                Loop (optional).
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Run fullscreen</strong>:
                press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span>,
                then use Fullscreen for a large display. Tap the time to
                start/pause while fullscreen.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Common sessions
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Quick reset</strong>: 1 to
                  3 minutes to settle and refocus.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Daily sit</strong>: 10 to
                  20 minutes, silent or with an end chime.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Breathwork block</strong>:
                  3 to 10 minutes (box breathing or calm breathing presets).
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Yoga holds</strong>: 30 to
                  90 seconds per hold, using custom seconds for precision.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want guided breathing intervals?{" "}
                  <Link
                    to="/breathing-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Breathing Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a no-sound timer by design?{" "}
                  <Link
                    to="/silent-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Silent Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want the biggest possible display with minimal controls?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Timing rest or recovery after yoga or stretching?{" "}
                  <Link
                    to="/rest-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Rest Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a sleep-friendly countdown?{" "}
                  <Link
                    to="/sleep-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Sleep Timer
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
                <span>Controls + behavior details</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
                    sound ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">L</span> loop
                    · <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    In fullscreen, top controls stay available and the time
                    display grows to fit your screen. You can tap/click the time
                    to start or pause.
                  </p>
                  <p className="mt-2">
                    Exit fullscreen with{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> or
                    the Exit button in the top bar.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Final beeps
                  </div>
                  <p className="mt-2">
                    Final beeps are optional and only run in the last{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      5 seconds
                    </span>{" "}
                    of the countdown.
                  </p>
                  <p className="mt-2">
                    If Sound is off, final beeps are disabled automatically.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture before audio will play.
                    If you do not hear cues, press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span>{" "}
                    once, then enable Sound and try again.
                  </p>
                  <p className="mt-2">
                    End chime plays when the timer reaches{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>{" "}
                    (if enabled).
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For a calm setup:
            go fullscreen, keep Sound off, and use{" "}
            <strong className="text-[var(--ilt-text-primary)]">Space</strong> to start/pause. If
            you want a clear finish, enable{" "}
            <strong className="text-[var(--ilt-text-primary)]">End chime</strong> without final
            beeps.
          </div>
        </details>
      </div>
    </section>
  );
}
