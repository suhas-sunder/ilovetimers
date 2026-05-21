import { Link } from "react-router";

export default function KeyboardShortcuts() {
  // Hexadecimal Clock supports:
  // F (toggle fullscreen), C (copy), S (toggle seconds), M (toggle ms - time mode only),
  // X (toggle mode), 1 (12h), 2 (24h), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy (hex + decimal + date + ISO)" },
    { key: "S", action: "Toggle seconds" },
    { key: "M", action: "Toggle milliseconds (Hex HH:MM:SS mode only)" },
    { key: "X", action: "Toggle mode (Hex time ↔ Hex color)" },
    { key: "1", action: "Switch to 12-hour time" },
    { key: "2", action: "Switch to 24-hour time" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the clock card once, then use the keyboard shortcuts below.
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
   BEHAVIOR + PRIVACY (time zone, accuracy, fullscreen, copy, local-only)
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
              No sign-in required. The clock display, mode toggles, fullscreen,
              and copy behavior run in your browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Time zone comes from your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The “Local time” label reflects your device time zone. If you need
              another region’s time, use a converter after you copy the ISO
              timestamp.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              ISO timestamp included for clarity
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The copy block includes an ISO timestamp in UTC so you can share a
              precise moment without ambiguity.
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
              Precision depends on settings
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If seconds are off, the display intentionally updates less often
              and milliseconds are disabled to avoid implying precision that
              isn’t shown.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Clipboard permission may apply
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Copy uses your browser’s clipboard API. If copy fails, your
              browser may be blocking clipboard access or the page may not be in
              a secure context.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (formats, refresh, copy, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about how the page behaves
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Hex time ranges
              </div>
              <p className="mt-1 leading-relaxed">
                In 24-hour mode, hours run{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">00–17</span>{" "}
                (0–23). Minutes and seconds run{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">00–3B</span>{" "}
                (0–59). All values are shown as uppercase hex with fixed widths.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                12-hour hex behavior
              </div>
              <p className="mt-1 leading-relaxed">
                In 12-hour mode, the hour is converted to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1–12</span> and
                then encoded as hex{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">(01–0C)</span>{" "}
                with an AM/PM suffix.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Refresh rate</div>
              <p className="mt-1 leading-relaxed">
                The page updates more often when milliseconds are on. With
                seconds on, it updates several times per second. With seconds
                off, it updates much less frequently to reduce CPU usage.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Hex color mode</div>
              <p className="mt-1 leading-relaxed">
                Color mode shows{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">#RRGGBB</span>{" "}
                where <span className="font-semibold text-[var(--ilt-text-primary)]">RR</span>
                =hours (24h),{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">GG</span>
                =minutes, and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">BB</span>
                =seconds. If seconds are hidden,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">BB</span> becomes{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">00</span>.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Copy payload (what gets copied)
              </div>
              <p className="mt-1 leading-relaxed">
                Copy includes the hex output, decimal time with the resolved
                time zone label, the formatted date, and an ISO timestamp (UTC).
                This is intentionally “over-complete” so pastes are useful in
                chat, tickets, and notes without extra context.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Want a different
          encoding?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/binary-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Binary Clock
            </Link>
          </span>{" "}
          or{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/morse-code-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Morse Code Clock
            </Link>
          </span>
          . Need UTC?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/utc-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              UTC Clock
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
