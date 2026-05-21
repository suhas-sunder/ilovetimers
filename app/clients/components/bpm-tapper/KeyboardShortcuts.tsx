export default function KeyboardShortcuts() {
  // BPM Tapper supports: Space/Enter (tap, optional), R (reset), F (fullscreen),
  // C (copy), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Tap a beat (if enabled)" },
    { key: "Enter", action: "Tap a beat (if enabled)" },
    { key: "R", action: "Reset session" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy current result" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Click the tap area once, then use the keyboard to control the BPM
          tapper. Shortcuts won’t trigger when your cursor is inside an input.
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
          Tip: if shortcuts do nothing, the card probably isn’t focused. Click
          the tap area, then try again. If Space/Enter doesn’t tap, enable
          “Space/Enter to tap” in settings.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (timing, rounding, fullscreen, privacy)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
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
              The tapper runs on your device and doesn’t require sign-in.
              Nothing is sent anywhere just to calculate BPM.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              BPM stabilizes with more consistent taps
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              BPM is based on your recent tap-to-tap intervals. If one tap is
              early/late, the number can wobble. For a steadier reading, tap
              several beats in a row and lock only once it settles.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Auto-reset and hold are intentional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Auto-reset ends the session after a pause so the next phrase
              starts clean. Hold keeps the last result visible briefly so you
              can read, copy, or lock it.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy includes useful context
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Copy includes BPM plus supporting details like ms/beat, taps, and
              intervals used, so you can paste a complete note into chat, docs,
              or a DAW comment.
            </p>
          </div>

          <div className="ilt-surface-muted p-4 md:col-span-2">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is display-only
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen changes layout for easier viewing. It doesn’t change
              the BPM math. Exit with Esc or the Exit control.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (taps + BPM math)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Interval filtering, median BPM, stability, and persistence
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Interval filtering
              </div>
              <p className="mt-1 leading-relaxed">
                Very fast or very slow gaps between taps are ignored to reduce
                accidental double-taps or long pauses affecting the BPM
                estimate.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Median-based BPM
              </div>
              <p className="mt-1 leading-relaxed">
                BPM is computed from the{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">median</span> of
                valid tap intervals, then converted to beats per minute. Median
                is more resistant to one off-beat tap than a simple average.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Stability indicator
              </div>
              <p className="mt-1 leading-relaxed">
                Stability is estimated from how much your valid intervals vary.
                A lower spread reads as steadier; a higher spread reads as
                wobbly.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the tapper card.
                Exit with Esc or the Exit control.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Local persistence
              </div>
              <p className="mt-1 leading-relaxed">
                Settings (reset time, hold time, Space/Enter preference) and
                recent results may be stored in localStorage so they persist
                between visits.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Note.</strong> This tool is
          designed for quick tempo estimation. Results are best when you tap
          steadily for several beats.
        </div>
      </div>
    </section>
  );
}
