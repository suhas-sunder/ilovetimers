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
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the converter card once, then use the shortcuts below. Shortcuts
          won’t trigger while you’re typing in an input, select, textarea, or
          editable field.
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
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-[var(--ilt-border-subtle)]"
                >
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
              No sign-in required. Conversion, validation, fullscreen, and copy
              all run in your browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No guessing on AM/PM
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Standard time must include AM or PM. If it’s missing, the standard
              side won’t convert so you don’t accidentally copy the wrong
              result.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is copy-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen maximizes the current result for quick copying. In
              fullscreen, you can tap or click the big result to copy.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Normalized output for clean pasting
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The converter shows a normalized form of your input so you can
              paste consistent formats (useful if the original input had missing
              zeros or unusual separators).
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not require an account and does not ask you to
              upload files or personal data to convert time formats.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy stays on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Using Copy writes text to your clipboard so you can paste it
              elsewhere. Nothing needs to be sent to a server to do this.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (parsing, 2400, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about accepted formats and edge cases
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Military parsing rules
              </div>
              <p className="mt-1 leading-relaxed">
                Digits are interpreted as hours + minutes. Examples:{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">17</span> →
                17:00, <span className="font-semibold text-[var(--ilt-text-primary)]">730</span>{" "}
                → 07:30,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1730</span> →
                17:30. Colon formats like{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">17:30</span> and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">5:30</span> are
                also accepted.
              </p>
              <p className="mt-2 leading-relaxed">
                Hours must be 0–23 and minutes must be 00–59.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Standard parsing rules
              </div>
              <p className="mt-1 leading-relaxed">
                Standard input requires{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">AM</span> or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">PM</span>.
                Examples:{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">5 PM</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">5:30 PM</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">12 AM</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">12:05 am</span>.
                Minutes are optional and default to 00.
              </p>
              <p className="mt-2 leading-relaxed">
                Hour must be 1–12 and minutes must be 00–59.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">About 2400</div>
              <p className="mt-1 leading-relaxed">
                <span className="font-semibold text-[var(--ilt-text-primary)]">2400</span> is
                commonly used to mean midnight at the end of a day. This tool
                treats 2400 as{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">00:00</span> and
                returns 12:00 AM with a note so the behavior is explicit.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen notes
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen targets the converter card element. Some browsers
                require the action to come directly from a click or key press,
                so use the Fullscreen button or press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> while
                the card is focused.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy behavior</div>
              <p className="mt-1 leading-relaxed">
                Copy uses your device clipboard. The top Copy button copies the
                “current result” (the opposite of whichever side you’re actively
                editing), and fullscreen lets you copy by tapping the big
                result.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
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

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Converting across
          time zones too?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-zone-converter"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Zone Converter
            </Link>
          </span>
          . Need a quick reference clock?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/atomic-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Atomic Clock
            </Link>
          </span>
          . Doing time math (durations)?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-calculator"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
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
