export default function KeyboardShortcuts() {
  // Debt Clock supports: Space (start/pause), R (reset), F (fullscreen), C (copy), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause the counter" },
    { key: "R", action: "Reset to starting debt" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy snapshot (current + rate + inputs)" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the debt clock card once, then use the keyboard to control the
          counter. Shortcuts won’t trigger while you’re typing in an input,
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
          Tip: if shortcuts do nothing, the debt clock card probably isn’t
          focused. Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (estimate model, fullscreen, copy, privacy)
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
              No sign-in required. The counter runs in your browser using the
              values you choose (preset or custom).
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Estimated counter, not an official feed
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The displayed total is an estimate based on a starting debt and an
              average yearly change rate. It does not automatically fetch
              official totals from a government or institution.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              “As of” is informational
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The “as of” label is for your own record keeping (source + date).
              It doesn’t change the math, but it appears in the copied snapshot
              so you can keep your pasted numbers traceable.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen makes the number large and adds top/bottom controls.
              Exit with{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> or the
              Exit button. In fullscreen, you can also tap/click the number area
              to start or pause.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy uses your clipboard
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Copy writes a formatted snapshot to your clipboard (preset name,
              “as of” label, current estimate, starting value, yearly change,
              and per-second rate). Some browsers restrict clipboard access in
              certain contexts. If copy fails, click the page once and try
              again.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No GPS, no account
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not request your precise location and does not
              require sign-in. Your inputs stay on the page unless you
              deliberately copy them.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (calculation + continuity + fullscreen/copy)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                How the estimate is computed, what happens on input changes, and
                browser permission notes
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Calculation model
              </div>
              <p className="mt-1 leading-relaxed">
                The tool converts your yearly change into a per-second rate
                using a 365.25-day year, then adds it continuously from the
                current anchor amount.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Continuity on changes
              </div>
              <p className="mt-1 leading-relaxed">
                If you change the yearly change while running, the counter keeps
                the current displayed value and applies the new rate going
                forward. If you change the starting debt while running, the
                counter snaps to that new starting amount.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Reset behavior</div>
              <p className="mt-1 leading-relaxed">
                Reset sets the displayed value back to “Starting debt” and
                restarts the elapsed-time clock used for the live estimate.
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
          <strong className="text-[var(--ilt-text-primary)]">Disclosure.</strong> This page is a
          visualization tool. If you need an official number, use your preferred
          source for the starting value and the yearly change, then plug those
          into Custom.
        </div>
      </div>
    </section>
  );
}
