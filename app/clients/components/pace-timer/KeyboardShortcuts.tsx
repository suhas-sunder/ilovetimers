import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (PACE TIMER)
========================================================= */
export default function KeyboardShortcuts() {
  // Pace Timer supports:
  // Space (start/pause), R (reset), F (fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "R", action: "Reset to the current target" },
    { key: "F", action: "Toggle fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the pace timer card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in an input field.
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
          Tip: if shortcuts do nothing, the card probably isn’t focused. Click
          inside the tool area once (not inside an input), then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (pace timer + beeps + fullscreen)
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
              Pace calculations, interval beeps, and the countdown run on your
              device. No account is needed.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Clean start / pause behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Pause preserves remaining time. Changing mode, distance, units, or
              input type resets the countdown to match the new target.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Interval beeps are optional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              When Sound is enabled, you can beep every X distance segment (km,
              mi, or 500m multiples). Volume is adjustable and you can test the
              beep.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              End-of-timer beep (optional)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              When the countdown reaches 0, it stops. If Sound is on, it plays a
              short finish beep.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not ask you to upload files or personal data to use
              the pace timer.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is a browser feature
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen uses your browser’s permission. Press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to exit
              at any time.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (timing, beeps, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about timer behavior across tab switches, audio
                requirements, and fullscreen behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Countdown timing behavior
              </div>
              <p className="mt-1 leading-relaxed">
                The timer uses a target end time while running, then
                recalculates remaining time after normal tab switches and brief
                pauses in rendering.
              </p>
              <p className="mt-2 leading-relaxed">
                Reset returns to the current target time for your selected mode,
                distance, and pace/finish inputs.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio requirements
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may require a user interaction before audio can play.
                If you don’t hear beeps, press Start once (with Sound on) and
                verify the tab isn’t muted.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a click gesture to enter fullscreen; Esc always exits.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                “Should be at” estimate
              </div>
              <p className="mt-1 leading-relaxed">
                The “should be at” line is computed from elapsed time and your
                target pace. It’s intended as quick guidance for steady efforts
                rather than a GPS-grade distance tracker.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Want structured
          intervals?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/hiit-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              HIIT Timer
            </Link>
          </span>
          ,{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/tabata-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Tabata Timer
            </Link>
          </span>
          , or{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/round-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Round Timer
            </Link>
          </span>
          . Need a simple workout countdown?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/workout-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Workout Timer
            </Link>
          </span>
          . Want a big screen?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/fullscreen-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Fullscreen Timer
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
