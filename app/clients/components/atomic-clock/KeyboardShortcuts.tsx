export default function KeyboardShortcuts() {
  // Atomic Clock supports: Space (freeze/resume), M (toggle ms), F (fullscreen)
  const rows = [
    { key: "Space", action: "Freeze / resume the display" },
    { key: "M", action: "Toggle milliseconds on/off" },
    { key: "F", action: "Toggle fullscreen (after focusing the clock card)" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click the clock card once to focus it, then use the keyboard to
          control the display. Shortcuts only work when your cursor isn’t inside
          an input.
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
          Tip: if shortcuts do nothing, the clock card probably isn’t focused
          (or your cursor is inside an input). Click the clock card, then try
          again.
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Accuracy, reliability, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Accuracy depends on your device clock
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This clock reads time from your browser/device. If your system
              clock is a few seconds fast or slow, the display will be too. The
              milliseconds are as precise as your device clock and browser
              timing allow.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Smoothness can vary by browser and load
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              With milliseconds enabled, the display updates frequently for a
              smooth readout. Heavy CPU/GPU load, battery saver, or screen
              sharing can make updates appear less smooth, even though the time
              itself is still correct.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Background tabs can throttle updates
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Browsers often reduce animation and timer frequency when a tab is
              in the background or the device is in low-power mode. When you
              return, the clock is still correct, but milliseconds may “jump”
              rather than animate smoothly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen restrictions
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen must be initiated by a user gesture
              (click/tap/keypress) and can be limited by browser or device
              policies, especially on mobile. Press Esc to exit fullscreen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Privacy: no location needed
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not need location access. It shows time using your
              device clock and runs locally in your browser.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (how updates work)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Milliseconds mode, seconds-only mode, and why background tabs
                look different
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Time source</div>
              <p className="mt-1 leading-relaxed">
                The displayed value comes from your browser’s <code>Date</code>,
                which reflects the device clock. This page does not fetch
                network time or synchronize with NTP/atomic sources.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Milliseconds enabled
              </div>
              <p className="mt-1 leading-relaxed">
                With milliseconds on, the display updates using{" "}
                <code>requestAnimationFrame</code> and reads the current time
                each frame for smooth changes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Milliseconds disabled
              </div>
              <p className="mt-1 leading-relaxed">
                With milliseconds off, the clock waits for the next second
                boundary, then updates once per second for a steadier readout.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Why background tabs look different
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers often deprioritize background work. Animation frames
                and timers can run less often, so the milliseconds readout may
                appear to “jump” when the tab is not visible.
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
