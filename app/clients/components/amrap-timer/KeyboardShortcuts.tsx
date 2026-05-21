export default function KeyboardShortcuts() {
  // Keep these shortcuts aligned with the AMRAP Timer route handlers.
  const rows = [
    { key: "Space", action: "Start or pause the AMRAP countdown" },
    { key: "R", action: "Reset the AMRAP timer, prep state, rounds, and reps" },
    { key: "F", action: "Toggle fullscreen on the AMRAP display" },
    { key: "S", action: "Toggle sound for AMRAP beeps" },
    { key: "+", action: "Increase reps" },
    { key: "-", action: "Decrease reps" },
    { key: "Arrow Up", action: "Increase rounds" },
    { key: "Arrow Down", action: "Decrease rounds" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Click the AMRAP timer once to focus it, then use the keyboard to
          control the countdown, score, sound, and fullscreen view.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ilt-border-subtle)] text-left">
                <th className="py-2 pr-4 font-semibold text-[var(--ilt-text-primary)]">
                  Key
                </th>
                <th className="py-2 font-semibold text-[var(--ilt-text-primary)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.key}
                  className="border-b border-[var(--ilt-border-subtle)]"
                >
                  <td className="py-2 pr-4">
                    <kbd className="ilt-keycap px-2 py-1 font-mono text-xs text-[var(--ilt-text-primary)]">
                      {r.key}
                    </kbd>
                  </td>
                  <td className="py-2 text-[var(--ilt-text-secondary)]">
                    {r.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          Tip: if shortcuts do nothing, your cursor is probably inside an input.
          Click outside the input (or press Escape), then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) ACCURACY, BACKGROUND, OFFLINE, PRIVACY (trust + honesty)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Accuracy, reliability, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Background tabs and lock screens
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Browsers may throttle animation updates when a tab is in the
              background or a device is locked. The timer uses a target end time
              while it is running, so it stays aligned while the page remains
              open, but the display can update less often and jump when you
              return. For workouts, keep it visible or use fullscreen.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No system alarms or notifications
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              These timers run inside your browser. If you close the tab/app or
              the browser session ends, they cannot ring like a phone alarm or
              send push notifications. If you need a guaranteed alarm, use your
              device alarm app.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Sound
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Audio is controlled by your browser and device settings. Some
              browsers block audio until you click/tap the page. If you want
              beeps, tap Start once with Sound enabled before the workout. For a
              silent run, turn off Sound.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Privacy
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Timers run locally in your tab. No account required. The tool does
              not need personal information to function.
            </p>
          </div>

          <div className="ilt-surface-muted p-4 md:col-span-2">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Best setup for reliability
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              For workouts or coaching: use fullscreen, keep the device awake,
              and confirm audio output before you start, especially if you are
              on Bluetooth or casting. If you use a TV/projector, test Start,
              Pause, and beeps once, then reset and run the session.
            </p>
          </div>
        </div>

        <details className="group mt-4 ilt-surface-muted p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (for reliability)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Why the display can jump, and why sound may be blocked
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              v
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers reduce timer and animation frequency in background
                tabs. A timer can still remain accurate by comparing now to a
                stored end time, but the UI will not repaint every frame while
                throttled, so it may jump when the tab becomes active again.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio gesture requirements
              </div>
              <p className="mt-1 leading-relaxed">
                Many browsers require a user gesture before audio playback. That
                is why you may need to click/tap the page or Start once before
                beeps will play reliably.
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
