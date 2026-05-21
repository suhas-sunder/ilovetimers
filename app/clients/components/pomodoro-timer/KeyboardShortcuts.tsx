import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (POMODORO TIMER)
========================================================= */
export default function KeyboardShortcuts() {
  // Pomodoro Timer supports:
  // Space (start/pause), N (next), R (reset), F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / pause" },
    { key: "N", action: "Next phase" },
    { key: "R", action: "Reset routine (back to the start)" },
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
          Click the Pomodoro timer card once, then use the shortcuts below.
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
   BEHAVIOR + PRIVACY (pomodoro timer + phases + audio + fullscreen)
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
              The timer, phase switching, and sounds run on your device. No
              account is needed.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Clear start / pause behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Pause preserves remaining time. Changing Work/Break/Cycles resets
              the routine to the start so the countdown matches your new
              settings.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Auto-advance is optional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              With Auto on, phases advance automatically when they finish. With
              Auto off, the timer stops at 0 and waits for you to press Next.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Sound is optional
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Enable Sound for phase-change alerts. If you want a tighter cue at
              the end of a phase, enable final 3-2-1 beeps (Sound must be on).
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No uploads required
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not ask you to upload files or personal data to use
              the Pomodoro timer.
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
                Technical notes (timing, sound, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about timing across tab switches, audio
                requirements, and phase behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Timer behavior across tab switches
              </div>
              <p className="mt-1 leading-relaxed">
                While running, the timer uses a target end time and recalculates
                remaining time from the device clock during normal tab switches
                and brief pauses in rendering.
              </p>
              <p className="mt-2 leading-relaxed">
                Power-saving modes can reduce animation smoothness and delay
                audio cues, but the visible countdown is recomputed from the
                target end time when the page updates.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio requirements
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may require a user interaction before audio can play.
                If you don’t hear sound, click Start once (with Sound on),
                verify your device volume, and make sure the tab is not muted.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Phase behavior</div>
              <p className="mt-1 leading-relaxed">
                The routine flows Work → Short break until the final cycle.
                After the last work session, it either starts a Long break (if
                enabled) or marks the routine Complete.
              </p>
              <p className="mt-2 leading-relaxed">
                Next skips immediately to the next phase. Reset returns you to
                the start of the routine (Work, cycle 1) and stops the timer.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some browsers
                require a click gesture to enter fullscreen; Esc always exits.
                In fullscreen, tapping/clicking the time display toggles
                start/pause.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Want a
          study-oriented flow?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/study-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Study Timer
            </Link>
          </span>
          . Prefer a single uninterrupted block?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/focus-session-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Focus Session Timer
            </Link>
          </span>
          . Need simple countdown only?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/countdown-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Countdown Timer
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
          . Prefer no audio?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/silent-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Silent Timer
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
