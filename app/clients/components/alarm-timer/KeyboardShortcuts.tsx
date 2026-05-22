export default function KeyboardShortcuts() {
  const rows = [
    { key: "Space", action: "Start or pause the focused alarm timer" },
    { key: "R", action: "Reset the focused timer" },
    { key: "F", action: "Toggle fullscreen on the focused display" },
    { key: "S", action: "Toggle sound (Alarm Timer)" },
    { key: "X", action: "Stop the ringing alarm (Alarm Timer)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Click the alarm timer display once to focus it, then use the keyboard to
          control the countdown, sound, fullscreen, and ringing alarm.
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
          Tip: if shortcuts do nothing, your cursor is probably inside an input.
          Click the timer display or another non-input area, then try again.
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
              Browsers may throttle animations and timers when a tab is in the
              background or a device is locked. The countdown stays aligned
              while the page remains open, but the visual display may update
              less often and jump forward when you return. For presentations,
              keep it visible or use fullscreen.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No system alarms or notifications
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              These timers run inside your browser. If you close the tab/app or
              the browser suspends, they cannot ring like a phone alarm or send
              push notifications. If you need a wake-up alarm or safety-critical
              alert, use a device alarm or another system intended for that job.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">Sound</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Audio is controlled by your browser and device settings. Some
              browsers block audio until you click/tap the page. If you need a
              silent timer, turn off Sound or mute your device.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">Privacy</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Timers run locally in your tab. No account required. The tool
              does not need personal information to run.
            </p>
          </div>

          <div className="ilt-surface-muted p-4 md:col-span-2">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Best setup for reliability
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              For workouts, cooking, classrooms, or presentations: enable
              fullscreen, keep the device awake, and make sure audio is allowed
              (tap once before you start). If you are casting to a TV, confirm
              the audio output device before starting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
