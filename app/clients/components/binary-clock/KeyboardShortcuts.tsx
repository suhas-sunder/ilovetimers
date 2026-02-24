export default function KeyboardShortcuts() {
  // Binary Clock supports: F (fullscreen), C (copy), S (seconds), B (mode), 1 (12h), 2 (24h), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy a snapshot of the current time + binary" },
    { key: "S", action: "Toggle seconds on/off" },
    { key: "B", action: "Switch mode (BCD ↔ pure binary)" },
    { key: "1", action: "Switch to 12-hour time" },
    { key: "2", action: "Switch to 24-hour time" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Click the clock card once, then use the keyboard to control the
          display. Shortcuts won’t trigger when your cursor is inside an input.
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
          Tip: if shortcuts do nothing, the clock card probably isn’t focused.
          Click the card, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) TRUST + HONESTY (time source, modes, copy, fullscreen, privacy)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Accuracy, behavior, and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Uses your device’s local time
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The clock displays the time from your device. If your system clock
              is incorrect, the display will be incorrect by the same amount.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Updates aligned to whole seconds
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The display schedules updates on the next whole-second boundary.
              Even with seconds hidden, it still updates on second boundaries so
              minute changes land cleanly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              BCD vs pure binary are just representations
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Switching modes doesn’t change the time. It only changes how the
              same hour/minute/second values are rendered as bits.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy captures a snapshot you control
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy writes a text snapshot to your clipboard (time, date,
              timezone label, mode output, and ISO timestamp). Nothing is sent
              anywhere by default.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">
              Privacy: runs in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The clock runs entirely in your browser and doesn’t require sign
              in. This page does not require location access.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (representation details)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                BCD vs pure, bit widths, timezone label, and fullscreen behavior
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">BCD mode</div>
              <p className="mt-1 leading-relaxed">
                BCD (Binary-Coded Decimal) shows each decimal digit (0–9) as 4
                bits. That’s why you’ll see one 4-bit group per digit in the
                displayed time.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Pure binary mode
              </div>
              <p className="mt-1 leading-relaxed">
                Pure mode converts hours, minutes, and seconds into binary
                numbers. Minutes and seconds use 6 bits (0–59). Hours use 5 bits
                in 24-hour mode (0–23) and 4 bits in 12-hour mode (1–12).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timezone label</div>
              <p className="mt-1 leading-relaxed">
                The timezone label comes from your browser’s Intl timezone (when
                available). The clock itself does not convert between time
                zones.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the clock card.
                You can exit with Esc or the Exit control in the top bar.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Limitations.</strong> This is not a
          synchronized network/atomic clock. It displays the time your device
          reports.
        </div>
      </div>
    </section>
  );
}
