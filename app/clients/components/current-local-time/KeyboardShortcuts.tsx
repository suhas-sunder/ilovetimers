export default function KeyboardShortcuts() {
  // Current Local Time supports: F (fullscreen), C (copy), S (seconds),
  // 1 (12-hour), 2 (24-hour), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy current time + date" },
    { key: "S", action: "Toggle seconds" },
    { key: "1", action: "Switch to 12-hour time" },
    { key: "2", action: "Switch to 24-hour time" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the clock card once, then use the keyboard to control the time
          display. Shortcuts won’t trigger while you’re typing in an input,
          select, textarea, or editable field.
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
          Click the clock once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (clock source, fullscreen, copy)
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
              No sign-in required. The clock runs on your device and reads the
              current time from your browser/device settings.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Local time comes from your device settings
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              “Local” time is based on your device’s clock and timezone. If your
              device time, timezone, or daylight-saving setting is wrong, the
              displayed local time will be wrong too.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Time zones are browser-formatted
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              City comparisons (like Toronto, New York, or London) are formatted
              using your browser’s timezone database. If your browser is very
              old, a zone label or formatting may vary.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen makes the digits large and adds top/bottom controls.
              Exit with{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> or the
              Exit button. In fullscreen, you can also tap/click the time area
              to copy.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy uses your clipboard
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Copy writes a formatted timestamp to your clipboard (time, zone
              label, date, and ISO week number). Some browsers restrict
              clipboard access in certain contexts. If copy fails, click the
              page once and try again.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No GPS, no account
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not request your precise location. It does not
              require sign-in. The display is based on your browser/device time
              and timezone settings.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (time formatting + zones + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                How time is formatted, why zones can vary, and permission notes
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Formatting engine
              </div>
              <p className="mt-1 leading-relaxed">
                The clock uses{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Intl.DateTimeFormat
                </span>{" "}
                for 12/24-hour formatting and optional seconds. Some locales
                include special direction marks; these are stripped for cleaner
                display.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Time zones</div>
              <p className="mt-1 leading-relaxed">
                City times are rendered by formatting the same{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Date</span>{" "}
                instance with a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">timeZone</span>{" "}
                option (for example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  America/Toronto
                </span>
                ). The underlying timezone database comes from your browser/OS,
                so very old devices can differ.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Copy string content
              </div>
              <p className="mt-1 leading-relaxed">
                Copy output includes: visible time, a zone label (your local
                timezone name when available, otherwise the selected city
                label), a full date line, and the ISO week number.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen + clipboard permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  fullscreenchange
                </span>
                . Clipboard access can be restricted by browser policy; it is
                most reliable after a user gesture (click/tap).
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Note.</strong> If you need a
          “correct” reference time independent of your device settings, use{" "}
          <strong className="text-[var(--ilt-text-primary)]">UTC Clock</strong> for a dedicated
          UTC display. For official time independent of your device settings,
          compare against the authoritative source required by your workflow.
          This page is designed to show what your device considers local time.
        </div>
      </div>
    </section>
  );
}
