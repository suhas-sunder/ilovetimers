import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (LAB TIMER)
========================================================= */
export default function KeyboardShortcuts() {
  // Lab Timer supports:
  // Space (stopwatch start/pause), L (lap), C (countdown start/pause),
  // T (toggle repeat), R (reset both), F (toggle fullscreen countdown), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Stopwatch start / pause" },
    { key: "L", action: "Record lap (stopwatch)" },
    { key: "C", action: "Countdown start / pause" },
    { key: "T", action: "Toggle Repeat step (countdown)" },
    { key: "R", action: "Reset stopwatch + countdown" },
    { key: "F", action: "Toggle fullscreen (countdown box)" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the Lab Timer card once, then use the shortcuts below. Shortcuts
          won’t trigger while you’re typing in an input, select, textarea, or
          editable field.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ilt-border-subtle)] text-left">
                <th className="py-2 pr-4 font-semibold text-[var(--ilt-text-primary)]">Key</th>
                <th className="py-2 font-semibold text-[var(--ilt-text-primary)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-[var(--ilt-border-subtle)]">
                  <td className="py-2 pr-4">
                    <kbd className="ilt-keycap px-2 py-1 font-mono text-xs text-[var(--ilt-text-primary)]">
                      {r.key}
                    </kbd>
                  </td>
                  <td className="py-2 text-[var(--ilt-text-secondary)]">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          Tip: if shortcuts do nothing, the card probably isn’t focused. Click
          once on the Lab Timer card, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (sound, fullscreen, timing, local-only)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              No sign-in required. The stopwatch, laps, countdown, fullscreen,
              and sound controls run in your browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Timing is based on your device performance clock
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The timers use your device performance clock to stay stable even
              if the page is busy. If your device is under heavy load, visuals
              may update less smoothly, but start/stop points still target the
              intended durations.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Sound may require a tap/click first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Some browsers block audio until you interact with the page. If
              cues are silent, press Start once, then keep Sound enabled.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is for the step countdown
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen maximizes readability for the step timer and keeps
              controls minimal. Exit with{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> or the
              Exit button.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Changing the step time resets the countdown
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Updating the Custom step (seconds) or picking a Common step time
              resets the countdown so your next run matches the new value.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not require an account and does not ask you to
              upload experiment notes or personal data to use the timers.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (laps, repeat, beeps, fullscreen, focus)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about how the Lab Timer behaves
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Stopwatch laps</div>
              <p className="mt-1 leading-relaxed">
                Lap records a split (time since the previous lap) and the total
                elapsed time at the moment you pressed it. Laps are listed
                newest-first, and the shortest split is labeled as the best lap.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Max laps</div>
              <p className="mt-1 leading-relaxed">
                Max laps limits how many lap entries are stored and displayed.
                When the cap is reached, additional laps are ignored until you
                reset.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Repeat step behavior
              </div>
              <p className="mt-1 leading-relaxed">
                With Repeat on, the countdown plays the completion cue (if Sound
                is enabled) then immediately reloads the current step duration
                and starts the next cycle.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Final beeps behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Final beeps trigger once per second during the last 5 seconds
                before the countdown reaches zero. They only run when Sound is
                enabled.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen scope
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen applies to the step countdown box. In fullscreen, the
                top bar provides Start/Pause, Reset, and Repeat On/Off, and the
                timer area is clickable to start/pause.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Focus + keyboard handling
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are captured on the Lab Timer card. If shortcuts do
                not fire, click the card once to focus it. While you’re typing
                in an input, shortcuts are ignored to prevent accidental starts
                and resets.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Need a dedicated
          stopwatch view?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/stopwatch"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Stopwatch
            </Link>
          </span>
          . Want a simple countdown?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/countdown-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Countdown Timer
            </Link>
          </span>
          . Need parallel timers?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/multiple-timers"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Multiple Timers
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
