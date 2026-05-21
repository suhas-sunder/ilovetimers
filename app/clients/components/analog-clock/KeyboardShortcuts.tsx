export default function KeyboardShortcuts() {
  // Keep this page-focused. Analog Clock supports: F, S, M (per onKeyDown).
  const rows = [
    { key: "F", action: "Toggle fullscreen (after focusing the clock card)" },
    { key: "S", action: "Toggle the seconds hand" },
    { key: "M", action: "Toggle smooth seconds" },
  ];

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Click the clock card once to focus it, then use the keyboard to
          control the display. Shortcuts only work when your cursor isn’t inside
          an input.
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
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Accuracy, reliability, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Time accuracy depends on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This clock displays the time reported by your device. If your
              system clock is fast/slow or your timezone is set incorrectly, the
              clock will reflect that. For a reference time source, use the
              Atomic Clock.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Timezone is device-based
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The timezone label comes from your browser/OS settings. If it’s
              wrong, check your operating system timezone and “Set time
              automatically.” For multiple locations, use the World Clock.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Background tabs and capture can affect smoothness
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Browsers may throttle animation when a tab is in the background,
              when the device is in low-power mode, or during screen
              recording/casting. The time stays correct, but the seconds hand
              may look less smooth.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen restrictions
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen must be initiated by a user gesture and can be limited
              by browser/device policies (especially on mobile). Use Esc to exit
              fullscreen.
            </p>
          </div>

          <div className="ilt-surface-muted p-4 md:col-span-2">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Best setup for a wall display
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              For classrooms, offices, or a second monitor: go fullscreen, keep
              the tab visible, and disable Smooth if the device is struggling.
              If you need a simpler display, try Digital Clock or Minimalist
              Clock.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (for reliability)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Why smooth mode can stutter, and why time can be “off”
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Animation throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Smooth seconds typically uses frequent UI updates for fluid
                motion. Browsers may reduce animation frequency in background
                tabs, low-power states, or during screen capture, which can make
                motion look less continuous.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Device time and timezone
              </div>
              <p className="mt-1 leading-relaxed">
                This page does not “correct” your device clock. It renders what
                your system reports. If your time or timezone is wrong, fix it
                in your OS settings (automatic time + correct timezone).
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
