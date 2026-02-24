export default function KeyboardShortcuts() {
  // Digital Clock supports: F (fullscreen), C (copy), S (toggle seconds), 1/2 (12/24-hour), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy the current time" },
    { key: "S", action: "Toggle seconds on/off" },
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
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the clock card once, then use the keyboard to control it.
          Shortcuts won’t trigger while you’re typing in an input, select,
          textarea, or editable field.
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
          Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TRUST + HONESTY (time source, fullscreen behavior, privacy)
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
              No sign-in required. The clock runs in your browser and displays
              your device’s local time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Uses your device time + timezone
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The time and timezone come from your device/browser settings. If
              your device clock or timezone is set incorrectly, the display will
              be incorrect too.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy includes an unambiguous timestamp
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy includes the displayed time, detected timezone, date, and an
              ISO timestamp so you can paste a clear reference into notes, chat,
              or logs.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen makes the clock large for distance viewing. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. In fullscreen, clicking/tapping the time copies it.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No GPS, no account
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not request your precise location and does not
              require sign-in. It does not need access to your contacts or
              calendar.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Keyboard focus rules
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Shortcuts only trigger when the clock card has focus, and they are
              ignored while you’re typing in an input field.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (update timing + timezone source + fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                How the clock schedules updates, how timezone is detected, and
                browser permission notes
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Update timing</div>
              <p className="mt-1 leading-relaxed">
                When seconds are enabled, the clock schedules updates on the next
                second boundary to reduce drift. When seconds are hidden, it
                updates close to the start of each minute.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timezone source</div>
              <p className="mt-1 leading-relaxed">
                The timezone label is read from{" "}
                <span className="font-semibold text-slate-900">
                  Intl.DateTimeFormat().resolvedOptions().timeZone
                </span>{" "}
                when available. If the browser can’t provide it, the label falls
                back to “Local.”
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Copy format</div>
              <p className="mt-1 leading-relaxed">
                Copy uses the currently displayed time format (12/24-hour and
                seconds on/off), and also includes an ISO timestamp for a
                machine-readable reference.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on{" "}
                <span className="font-semibold text-slate-900">
                  fullscreenchange
                </span>
                . Most browsers require a user gesture (click/tap) to enter
                fullscreen.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> This clock is only
          as accurate as your device’s time and timezone settings. For a
          standardized reference, use{" "}
          <a
            href="/utc-clock"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </a>{" "}
          or{" "}
          <a
            href="/atomic-clock"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Atomic Clock
          </a>
          .
        </div>
      </div>
    </section>
  );
}