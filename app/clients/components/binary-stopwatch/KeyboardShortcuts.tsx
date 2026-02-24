export default function KeyboardShortcuts() {
  // Binary Stopwatch supports: Space (start/pause), R (reset), F (fullscreen), D (dim),
  // M (mode), W (weights), P (practice), E (reveal), S (sound)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "R", action: "Reset" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "D", action: "Toggle dim mode" },
    { key: "M", action: "Switch mode (Stopwatch ↔ Timer)" },
    { key: "W", action: "Toggle bit weights" },
    { key: "P", action: "Toggle practice mode" },
    { key: "E", action: "Reveal time (practice mode)" },
    { key: "S", action: "Toggle sound on/off" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click the timer card once, then use the keyboard to control the tool.
          Shortcuts won’t trigger when your cursor is inside an input.
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
          the card, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (timing, rounding, sound, fullscreen, privacy)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Behavior, sound, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The stopwatch/timer runs on your device and doesn’t require sign
              in. Nothing is sent anywhere just to use the tool.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Display is shown at whole seconds
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              For readability, the visible time snaps to whole seconds (no
              milliseconds). Under the hood, the timer uses a high-resolution
              clock for smooth timing while running.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Countdown stops at zero
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              In Timer mode, the countdown reaches zero, stops automatically,
              and then triggers the alarm if Sound is enabled.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound depends on browser rules
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Some browsers require a user gesture (click/tap) before audio can
              play. If you want a silent finish, toggle Sound off.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-only
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen changes the layout for easier viewing. It doesn’t
              change stopwatch/timer behavior or the binary representation. Exit
              with Esc or the Exit control.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (binary + timing)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Bit widths, weights, rounding, and fullscreen behavior
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Bit widths</div>
              <p className="mt-1 leading-relaxed">
                Minutes and seconds are shown with{" "}
                <span className="font-semibold text-slate-900">6 bits</span>{" "}
                (0–59). Hours use{" "}
                <span className="font-semibold text-slate-900">7 bits</span> so
                the display stays valid up to{" "}
                <span className="font-semibold text-slate-900">99 hours</span>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Weights</div>
              <p className="mt-1 leading-relaxed">
                When Weights is on, the rows show the bit values from top
                (largest) to bottom (1). Add the weights of lit bits to decode
                each column.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Rounding</div>
              <p className="mt-1 leading-relaxed">
                The visible clock snaps to whole seconds for readability. That’s
                why the binary bits and the displayed time flip cleanly on
                second boundaries.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the timer card.
                Exit with Esc or the Exit control.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Alarm behavior</div>
              <p className="mt-1 leading-relaxed">
                When a countdown hits zero, the tool stops and plays either a
                single beep or a short soft sequence (if Soft alarm is enabled),
                as long as Sound is enabled and the browser allows audio.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> This tool is
          designed for quick timing and practice. It does not record or export
          sessions.
        </div>
      </div>
    </section>
  );
}
