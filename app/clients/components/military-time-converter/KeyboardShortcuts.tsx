import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MILITARY TIME CONVERTER)
========================================================= */
export default function KeyboardShortcuts() {
  // Military Time Converter supports:
  // N (fill current time), C (copy AM/PM result), M (copy military result),
  // R (clear), F (toggle fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "N", action: "Use current time (fills both inputs)" },
    { key: "C", action: "Copy AM/PM result (from military input)" },
    { key: "M", action: "Copy military result (from standard input)" },
    { key: "R", action: "Clear both inputs" },
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
          Click the converter card once, then use the shortcuts below. Shortcuts
          won’t trigger while you’re typing in an input, select, textarea, or
          editable field.
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
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-slate-100"
                >
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
          Tip: if shortcuts do nothing, the converter card probably isn’t
          focused. Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (fullscreen, parsing, local-only)
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
              No sign-in required. Conversion, validation, fullscreen, and copy
              all run in your browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No guessing on AM/PM
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Standard time must include AM or PM. If it’s missing, the standard
              side won’t convert so you don’t accidentally copy the wrong
              result.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is copy-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen maximizes the current result for quick copying. In
              fullscreen, you can tap or click the big result to copy.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Normalized output for clean pasting
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The converter shows a normalized form of your input so you can
              paste consistent formats (useful if the original input had missing
              zeros or unusual separators).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload files or personal data to convert time formats.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Copy stays on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Using Copy writes text to your clipboard so you can paste it
              elsewhere. Nothing needs to be sent to a server to do this.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (parsing, 2400, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about accepted formats and edge cases
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Military parsing rules
              </div>
              <p className="mt-1 leading-relaxed">
                Digits are interpreted as hours + minutes. Examples:{" "}
                <span className="font-semibold text-slate-900">17</span> →
                17:00, <span className="font-semibold text-slate-900">730</span>{" "}
                → 07:30,{" "}
                <span className="font-semibold text-slate-900">1730</span> →
                17:30. Colon formats like{" "}
                <span className="font-semibold text-slate-900">17:30</span> and{" "}
                <span className="font-semibold text-slate-900">5:30</span> are
                also accepted.
              </p>
              <p className="mt-2 leading-relaxed">
                Hours must be 0–23 and minutes must be 00–59.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Standard parsing rules
              </div>
              <p className="mt-1 leading-relaxed">
                Standard input requires{" "}
                <span className="font-semibold text-slate-900">AM</span> or{" "}
                <span className="font-semibold text-slate-900">PM</span>.
                Examples:{" "}
                <span className="font-semibold text-slate-900">5 PM</span>,{" "}
                <span className="font-semibold text-slate-900">5:30 PM</span>,{" "}
                <span className="font-semibold text-slate-900">12 AM</span>,{" "}
                <span className="font-semibold text-slate-900">12:05 am</span>.
                Minutes are optional and default to 00.
              </p>
              <p className="mt-2 leading-relaxed">
                Hour must be 1–12 and minutes must be 00–59.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">About 2400</div>
              <p className="mt-1 leading-relaxed">
                <span className="font-semibold text-slate-900">2400</span> is
                commonly used to mean midnight at the end of a day. This tool
                treats 2400 as{" "}
                <span className="font-semibold text-slate-900">00:00</span> and
                returns 12:00 AM with a note so the behavior is explicit.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen notes
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen targets the converter card element. Some browsers
                require the action to come directly from a click or key press,
                so use the Fullscreen button or press{" "}
                <span className="font-semibold text-slate-900">F</span> while
                the card is focused.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Copy behavior</div>
              <p className="mt-1 leading-relaxed">
                Copy uses your device clipboard. The top Copy button copies the
                “current result” (the opposite of whichever side you’re actively
                editing), and fullscreen lets you copy by tapping the big
                result.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Focus + keyboard handling
              </div>
              <p className="mt-1 leading-relaxed">
                Keyboard shortcuts are captured on the converter card. If
                shortcuts do not fire, click the card once to focus it. While
                you’re typing in an input, shortcuts are ignored to prevent
                accidental actions.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Converting across
          time zones too?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-zone-converter"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Zone Converter
            </Link>
          </span>
          . Need a quick reference clock?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/atomic-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Atomic Clock
            </Link>
          </span>
          . Doing time math (durations)?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-calculator"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Calculator
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
