import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MORSE CODE CLOCK)
========================================================= */
export default function KeyboardShortcuts() {
  // Morse Code Clock supports:
  // F (fullscreen), T (24-hour), S (seconds), V (view), C (copy), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "T", action: "Toggle 24-hour time" },
    { key: "S", action: "Toggle seconds on/off" },
    { key: "V", action: "Switch view (blocks ↔ text)" },
    { key: "C", action: "Copy time + Morse output" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the Morse clock card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in an input field.
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
          the display once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (morse digits + live time + fullscreen + copy)
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
              Uses your device time and time zone
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The clock shows your local device time. If your system clock or
              time zone is set incorrectly, the display will reflect that.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Live updates for a stable clock feel
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The display updates continuously and stays aligned to the second
              boundary so it doesn’t “drift” visually.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Block and Text views are the same data
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Block view renders dots and dashes as shapes for readability. Text
              view shows the raw Morse strings. Both represent the same digits.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy is opt-in and writes to your clipboard
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The Copy action runs only when you press it (or hit C). It writes
              the current time and Morse output to your clipboard so you can
              paste it elsewhere.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not require an account and does not ask you to
              upload files or personal data to use the tool.
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
                Technical notes (updates, Morse digits, fullscreen, clipboard)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about update cadence, digit encoding, and
                browser APIs used
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Live update cadence
              </div>
              <p className="mt-1 leading-relaxed">
                The clock schedules updates to land on the next second boundary,
                which keeps the visual timing consistent.
              </p>
              <p className="mt-2 leading-relaxed">
                Showing seconds increases the number of displayed digits (and
                Morse groups) without changing how encoding works.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Digit encoding (0–9)
              </div>
              <p className="mt-1 leading-relaxed">
                Each digit is mapped to its standard Morse code pattern, then
                rendered as either text (dots and dashes) or blocks (circles and
                rounded bars).
              </p>
              <p className="mt-2 leading-relaxed">
                Separators between HH and MM (and SS if enabled) are visual only
                and aren’t encoded as Morse.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen + clipboard behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API and may require user
                interaction depending on browser settings. Copy uses the modern
                Clipboard API when available and falls back to a compatible copy
                method for older contexts.
              </p>
              <p className="mt-2 leading-relaxed">
                Clipboard access only happens when you press Copy (or C).
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Prefer a standard
          clock?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/digital-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Digital Clock
            </Link>
          </span>
          . Want another “coded” display?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/binary-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Binary Clock
            </Link>
          </span>
          . Need other locations?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/world-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              World Clock
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
