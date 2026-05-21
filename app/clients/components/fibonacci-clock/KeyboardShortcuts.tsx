export default function KeyboardShortcuts() {
  // Fibonacci Clock supports:
  // F (fullscreen), C (copy), L (live), E (explore/manual), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy the current output (time + tile breakdown)" },
    { key: "L", action: "Switch to Live mode" },
    { key: "E", action: "Switch to Explore mode" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the clock card once, then use the keyboard to control it.
          Shortcuts won’t trigger while you’re typing in an input, select,
          textarea, or editable field.
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
          Tip: if shortcuts do nothing, the clock card probably isn’t focused.
          Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (time zones, rounding, fullscreen, local-only)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              No sign-in required. Time rendering, time zone formatting, and the
              Fibonacci tile mapping happen in your browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No saved history
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page doesn’t store a history of times you viewed or “saved
              clocks.” If you refresh, it simply shows the current time again.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Time zone behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Local (device) uses your device time zone. Other options use IANA
              time zones (for example, America/New_York). If a selected zone
              can’t be resolved by your browser, the page falls back to local
              time formatting.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Rounding is intentional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fibonacci minutes are shown in 5-minute steps and round to the
              nearest 5. If rounding hits :60, the hour carries +1 and minutes
              display as :00. The Rounding line on the page explains what you’re
              seeing.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen maximizes readability and keeps controls minimal. Exit
              with <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> or
              the Exit button.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Live updates
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Live mode updates once per second. Explore mode freezes seconds at
              0 so the tile layout stays stable while you edit hour and minute.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (time zones + rounding + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Browser-related details, kept optional
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Time zone formatting
              </div>
              <p className="mt-1 leading-relaxed">
                The page uses the browser’s internationalization APIs to format
                time for the selected IANA zone. Availability can vary slightly
                in older browsers or constrained embedded views.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Minute rounding and carry
              </div>
              <p className="mt-1 leading-relaxed">
                Minutes are rounded to the nearest 5. When rounding produces 60,
                the hour used for the Fibonacci mapping is incremented by 1 and
                minutes display as 00.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Tile assignment
              </div>
              <p className="mt-1 leading-relaxed">
                The clock chooses a set of tiles for hours, a set for minutes,
                and allows overlap (blue) when it produces a valid decomposition
                for both values.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen rules
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen typically requires a user gesture (click/tap). Some
                embedded browsers or strict settings may restrict fullscreen.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Note.</strong> Fibonacci time is a
          rounded display meant for a clean tile-based representation. Use the
          digital time panel when you need the current second.
        </div>
      </div>
    </section>
  );
}
