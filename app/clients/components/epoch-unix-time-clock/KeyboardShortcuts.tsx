export default function KeyboardShortcuts() {
  // Unix Time Clock supports:
  // Space (toggle live/freeze), C (copy seconds), M (copy milliseconds), N (snap now), F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Toggle Live / Frozen" },
    { key: "C", action: "Copy Unix time (seconds)" },
    { key: "M", action: "Copy Unix time (milliseconds)" },
    { key: "N", action: "Snap now (update once while staying Frozen)" },
    { key: "F", action: "Toggle fullscreen" },
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
   BEHAVIOR + PRIVACY (live/freeze, copy, fullscreen, local-only)
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
              No sign-in required. The Unix time clock runs on this page in your
              browser and reads time from your device clock.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Live and Frozen modes
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Live updates continuously. Frozen holds a single moment steady so
              the timestamp doesn’t change while you copy or compare values.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy works via your clipboard
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Copy uses your browser’s clipboard permissions. If copy fails,
              your browser may block clipboard access in some contexts (for
              example, certain embedded views or strict privacy settings).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen gives you a large seconds display with quick actions at
              the top. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span> or the
              Exit button. Clicking/tapping the main display toggles Live or
              Frozen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Background tab behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Some browsers throttle background tabs to save power. The
              displayed value may update less smoothly when the tab is in the
              background, but the timestamp still reflects your device clock.
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
                Technical notes (epoch, seconds vs ms, UTC)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Quick definitions and a few browser-related behaviors
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Unix epoch</div>
              <p className="mt-1 leading-relaxed">
                Unix time counts time from{" "}
                <span className="font-semibold text-slate-900">
                  1970-01-01 00:00:00 UTC
                </span>
                . The number shown is timezone-independent.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Seconds vs milliseconds
              </div>
              <p className="mt-1 leading-relaxed">
                Seconds is the common Unix timestamp format. Milliseconds is the
                same moment expressed in ms (seconds × 1,000), commonly used by
                JavaScript and some event systems.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">UTC vs local</div>
              <p className="mt-1 leading-relaxed">
                The epoch value does not change by timezone. Local and UTC
                strings are shown only to help you interpret the same moment in
                a human-readable way.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen and clipboard rules
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen usually requires a user gesture (click/tap).
                Clipboard access can be restricted by browser permissions or
                embed contexts, so copy may fail in some environments.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Note.</strong> The timestamp comes
          from your device clock. If your device time is incorrect, the epoch
          value will be incorrect too.
        </div>
      </div>
    </section>
  );
}
