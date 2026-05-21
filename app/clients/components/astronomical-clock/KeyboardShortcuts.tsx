export default function KeyboardShortcuts() {
  // Astronomical Clock supports: F (per onKeyDown). No other shortcuts on this page.
  const rows = [
    { key: "F", action: "Toggle fullscreen (after focusing the clock card)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
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
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Accuracy, reliability, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Sunrise and sunset depend on coordinates
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Sunrise and sunset require latitude and longitude. You can use
              browser location or type coordinates manually. If coordinates are
              not set, the clock still works, but sunrise and sunset remain
              blank.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Time zone matters for the displayed day
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The clock can display any supported time zone. Sunrise and sunset
              are shown in the selected time zone and calculated for that time
              zone’s local date, so switching time zones can change which day’s
              sunrise and sunset you see.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Daylight and twilight are approximate
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Daylight, Civil, Nautical, and Astronomical twilight labels are
              derived from the sun’s estimated altitude at your coordinates.
              Around sunrise and sunset, the label can flip quickly and small
              differences are normal.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Moon phase is a practical estimate
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The phase label and illumination are computed from a standard
              lunar cycle model. It’s accurate enough for planning and general
              awareness, but it is not a precision ephemeris.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Background tabs can throttle updates
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Browsers may reduce timer and animation frequency when a tab is in
              the background or the device is in low-power mode. The time stays
              correct, but the display may update less often until the tab is
              visible again.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen restrictions
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen must be initiated by a user gesture and can be limited
              by browser or device policies (especially on mobile). Use Esc to
              exit fullscreen.
            </p>
          </div>

          <div className="ilt-surface-muted p-4 md:col-span-2">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Privacy: location stays on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you choose “Use my location,” your browser provides coordinates
              to compute sunrise, sunset, and daylight or twilight status. The
              calculation runs in your browser. You can clear coordinates any
              time with “Clear location.”
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (how the calculations work)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Sunrise/sunset model, twilight thresholds, and moon phase method
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Sunrise and sunset approximation
              </div>
              <p className="mt-1 leading-relaxed">
                Sunrise and sunset are computed with a compact NOAA-style method
                using a standard zenith value (90.833°). Results are calculated
                for the selected time zone’s local date and displayed in that
                time zone.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Twilight thresholds
              </div>
              <p className="mt-1 leading-relaxed">
                The day and twilight label comes from estimated solar altitude:
                Daylight &gt; 0°, Civil 0° to −6°, Nautical −6° to −12°,
                Astronomical −12° to −18°, Night ≤ −18°.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Time zone handling
              </div>
              <p className="mt-1 leading-relaxed">
                The page uses the selected IANA time zone for display and
                derives time zone offsets for the current instant. Daylight
                Saving Time behavior depends on the browser’s time zone
                database.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Moon phase model
              </div>
              <p className="mt-1 leading-relaxed">
                Moon phase is computed from a synodic month length (29.530588853
                days) using a fixed reference epoch, producing a phase fraction
                that maps to the phase label and illumination.
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
