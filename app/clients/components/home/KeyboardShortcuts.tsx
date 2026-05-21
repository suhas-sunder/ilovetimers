export default function KeyboardShortcuts() {
  const rows = [
    { key: "Space", action: "Start or pause the focused timer card" },
    { key: "R", action: "Reset the focused timer" },
    { key: "F", action: "Toggle fullscreen on the focused display" },
    { key: "L", action: "Record a lap (Stopwatch)" },
    { key: "N", action: "Next or skip phase (Pomodoro and HIIT)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Click any timer card once to focus it, then use the keyboard to
          control it.
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
          Click outside the input or press Escape, then try again.
        </div>
      </div>
    </section>
  );
}
/* =========================================================
   4) ACCURACY, BACKGROUND, OFFLINE, PRIVACY (trust + honesty)
   Schema: none required, but can add WebPageElement if you want
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Accuracy and reliability
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Background tabs and lock screens
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Browsers may throttle animations when a tab is in the background
              or a device is locked. The timers keep tracking time and update
              when the browser resumes. For presentations, fullscreen is the
              most reliable setup.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Offline after first load
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Once the page is loaded, your device can usually keep running the
              timers even with poor connectivity. Keep the tab open if you are
              relying on it during an event.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">Sound</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Audio is controlled by your browser and device settings. If you
              need a silent timer, turn off Sound or mute your device.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">Privacy</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Timers run locally in your tab. No account required. Use the tools
              without sharing personal data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
