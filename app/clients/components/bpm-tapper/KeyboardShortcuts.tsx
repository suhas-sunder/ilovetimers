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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click the tap area once, then use the keyboard to control the BPM
          tapper. Shortcuts won’t trigger when your cursor is inside an input.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4 font-semibold text-slate-900">Key</th>
                <th className="py-2 font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-slate-100">
                  <td className="py-2 pr-4">
                    <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-900">
                      {r.key}
                    </kbd>
                  </td>
                  <td className="py-2 text-slate-700">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The tapper runs on your device and doesn’t require sign-in.
              Nothing is sent anywhere just to calculate BPM.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              BPM stabilizes with more consistent taps
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              BPM is based on your recent tap-to-tap intervals. If one tap is
              early/late, the number can wobble. For a steadier reading, tap
              several beats in a row and lock only once it settles.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Auto-reset and hold are intentional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Auto-reset ends the session after a pause so the next phrase
              starts clean. Hold keeps the last result visible briefly so you
              can read, copy, or lock it.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy includes useful context
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy includes BPM plus supporting details like ms/beat, taps, and
              intervals used, so you can paste a complete note into chat, docs,
              or a DAW comment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-only
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen changes layout for easier viewing. It doesn’t change
              the BPM math. Exit with Esc or the Exit control.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (taps + BPM math)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Interval filtering, median BPM, stability, and persistence
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Interval filtering
              </div>
              <p className="mt-1 leading-relaxed">
                Very fast or very slow gaps between taps are ignored to reduce
                accidental double-taps or long pauses affecting the BPM
                estimate.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Median-based BPM
              </div>
              <p className="mt-1 leading-relaxed">
                BPM is computed from the{" "}
                <span className="font-semibold text-slate-900">median</span> of
                valid tap intervals, then converted to beats per minute. Median
                is more resistant to one off-beat tap than a simple average.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Stability indicator
              </div>
              <p className="mt-1 leading-relaxed">
                Stability is estimated from how much your valid intervals vary.
                A lower spread reads as steadier; a higher spread reads as
                wobbly.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the tapper card.
                Exit with Esc or the Exit control.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
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

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> This tool is
          designed for quick tempo estimation. Results are best when you tap
          steadily for several beats.
        </div>
      </div>
    </section>
  );
}
