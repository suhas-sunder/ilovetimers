import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (WORLD CLOCK)
========================================================= */
export default function KeyboardShortcuts() {
  // World Clock supports:
  // F (fullscreen), T (24-hour toggle), S (seconds toggle), C (copy), R (reset), X (clear), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "T", action: "Toggle 24-hour time" },
    { key: "S", action: "Toggle seconds" },
    { key: "C", action: "Copy selected city times" },
    { key: "R", action: "Reset to default cities" },
    { key: "X", action: "Clear all selected cities" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the World Clock card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in the Search field.
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
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-[var(--ilt-border-subtle)]"
                >
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
          inside the tool area once (not inside an input), then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (world clock + formatting + fullscreen)
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
              City selection, formatting (24-hour and seconds), and fullscreen
              run on your device. No account is needed.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Live updates with clean boundaries
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              With seconds shown, the display updates on the next second. With
              seconds hidden, it updates on the next minute.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Clear add/remove behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Click a Popular chip to toggle a city on or off. You can also
              remove a city from its card. Reset restores the default set; Clear
              removes everything.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy stays simple
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Copy outputs plain text: one line per selected city with its
              current time and time zone. It’s designed to paste cleanly into
              messages and notes.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not ask you to upload files or personal data to use
              the world clock.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is a browser feature
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen uses your browser’s permission. Press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to exit
              at any time.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (formatting, updating, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about time formatting, update cadence, and how
                copy output is produced
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
                Times are formatted using standard IANA time zones (for example
                America/Toronto). The display respects your chosen 12/24-hour
                and seconds settings.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Update cadence</div>
              <p className="mt-1 leading-relaxed">
                When seconds are on, updates are aligned to the next second
                boundary. When seconds are off, updates align to the next minute
                boundary for a steadier display.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy output</div>
              <p className="mt-1 leading-relaxed">
                Copy produces one line per selected city in the format{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  City: time (timeZone)
                </span>
                . If you need to convert a specific scheduled time between time
                zones (not just “now”), use the Time Zone Converter.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a click gesture to enter fullscreen; Esc always exits.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Need conversions
          between time zones?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-zone-converter"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Zone Converter
            </Link>
          </span>
          . Want a UTC reference?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/utc-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              UTC Clock
            </Link>
          </span>
          . Want a single big clock display?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/digital-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Digital Clock
            </Link>
          </span>
          . Need only your local time?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/current-local-time"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Current Local Time
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
