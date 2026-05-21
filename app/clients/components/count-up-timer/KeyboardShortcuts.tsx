export default function KeyboardShortcuts() {
  // Count Up Timer supports: Space (start/pause), L (lap), R (reset),
  // F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "L", action: "Record a lap (split)" },
    { key: "R", action: "Reset to 0 and clear laps" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Click the timer card once, then use the keyboard to control the count
          up timer. Shortcuts won’t trigger when your cursor is inside an input.
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
          Tip: if shortcuts do nothing, the timer card probably isn’t focused.
          Click the timer once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (timing, fullscreen, focus)
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
              The count up timer runs on your device and doesn’t require
              sign-in. Timing happens locally in the browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Elapsed time is monotonic and high-resolution
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Elapsed time is computed from a high-resolution performance clock
              and updates the UI using requestAnimationFrame. This keeps the
              display smooth while avoiding frame-count drift.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen makes the elapsed time large and adds top and bottom
              controls. Exit with Esc or the Exit button. In fullscreen, you can
              also tap/click the time display area to start or pause.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Laps record totals and splits
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Each lap stores the total elapsed time plus a split (time since
              the previous lap). Laps are shown most recent first so your latest
              checkpoint stays at the top.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Focus affects shortcuts
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Keyboard shortcuts work when the timer card is focused. If keys
              don’t respond, click the timer card once, then use Space/L/R/F.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Background tabs can look less smooth
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Browsers sometimes throttle rendering while a tab is in the
              background. When you return, the elapsed time should continue
              correctly, but the on-screen updates may appear less smooth while
              the tab is not active.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (timing + laps + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Timing model, lap math, display rounding, and fullscreen
                handling
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Timer model</div>
              <p className="mt-1 leading-relaxed">
                While running, elapsed time is computed from a stored base value
                plus the delta from performance.now(). The UI repaints with
                requestAnimationFrame for smooth updates.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Lap math</div>
              <p className="mt-1 leading-relaxed">
                A lap stores the current total elapsed time plus a split that
                equals (current elapsed) minus (previous lap elapsed). Lap 1’s
                split is time since start.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Display rounding
              </div>
              <p className="mt-1 leading-relaxed">
                The readout is shown in whole seconds for a steady display,
                while internal timing continues in milliseconds.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen handling
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the card
                container. The UI adds top and bottom bars in fullscreen mode.
                Exit with Esc or the Exit button.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Note.</strong> This page does not
          request a wake lock. If your device sleeps or the browser heavily
          throttles background activity, the timer UI may update less smoothly
          until you return.
        </div>
      </div>
    </section>
  );
}
