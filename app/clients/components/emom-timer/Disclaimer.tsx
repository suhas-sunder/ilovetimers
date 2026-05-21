export default function Disclaimer() {
  const preview =
    "Rounds (minutes) • Optional prep countdown • Sound cues • Optional final beeps • Fullscreen mode • Tap-to-start in fullscreen • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                EMOM Timer at a glance
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
              Use this page to run a clean, gym-readable EMOM timer where a new
              round starts every minute.
            </strong>{" "}
            Set total rounds (minutes), optionally add a prep countdown, then
            press Start. Each minute ticks down to the next minute mark, with
            optional sound cues and optional final beeps in the last seconds.
            Fullscreen is built for at-a-glance timing. In fullscreen, you can
            tap/click the time to start, pause, or resume.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Rounds (minutes).</strong>{" "}
              Choose how many minutes the EMOM runs. Each minute is one round.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Prep countdown.</strong>{" "}
              Optional 0–60s lead-in so you can set up before the first minute
              starts.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound cues.</strong> Optional
              audible cue at each new minute. Turn it off for a silent gym or
              shared space.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Final beeps.</strong> Optional
              short beeps in the last 5 seconds of each minute (and during the
              last seconds of prep).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Big,
              clean display. In fullscreen,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                tap/click the time
              </span>{" "}
              to start/pause/resume.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space start/pause · R reset · F fullscreen · S sound · B final
              beeps.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Fast setup
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set rounds</strong>: pick
                a preset (like 10, 12, 15, 20) or type any number of rounds.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  2) Add prep (optional)
                </strong>
                : choose 0–60 seconds if you want a lead-in.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Press Start</strong>: work
                inside the minute, then recover until the next minute starts.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Helpful ways to use it
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Group EMOMs</strong>: go
                  fullscreen so everyone can see the same minute countdown.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">No-math pacing</strong>:
                  use the minute beeps as your “start next round” signal.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Quiet environment</strong>:
                  turn sound off and rely on the big visual countdown.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Repeat the same setup
                  </strong>
                  : hit Reset to stop and return to the current rounds/prep
                  settings quickly.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Prefer AMRAP style (as many rounds as possible)?{" "}
                  <a
                    href="/amrap-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    AMRAP Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need work/rest intervals instead of minute marks?{" "}
                  <a
                    href="/hiit-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Doing classic 20s/10s blocks?{" "}
                  <a
                    href="/tabata-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a generic rounds-based timer?{" "}
                  <a
                    href="/round-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Round Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a broader workout timer setup?{" "}
                  <a
                    href="/workout-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Workout Timer
                  </a>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Just need a simple one-off countdown?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Details and shortcuts</span>
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
                    sound toggle ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">B</span>{" "}
                    final beeps toggle ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts don’t work, click/tap the card once so it has
                    focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    What “Reset” does
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Reset</span>{" "}
                    stops the timer and returns to a ready state while keeping
                    your current rounds and prep settings.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Sound uses a short WebAudio beep. Some browsers only allow
                    audio after you interact with the page (click/tap/press a
                    key).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Timing notes
                  </div>
                  <p className="mt-2">
                    The timer runs as long as this page is open. Background tabs
                    may update less often depending on browser power-saving, so
                    the display can look jumpy while in the background.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen. In
                    fullscreen, clicking/tapping the timer display toggles
                    start/pause/resume.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Note.</strong> EMOMs start a new
            round every minute. Use the final beeps if you want a heads-up
            before the minute flips.
          </div>
        </details>
      </div>
    </section>
  );
}
