import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (METRONOME)
========================================================= */
export default function KeyboardShortcuts() {
  // Metronome supports:
  // Space (start/stop), Enter (start/stop), T (tap tempo),
  // ArrowUp/ArrowDown (BPM ±1), Shift+ArrowUp/Down (BPM ±5),
  // F (toggle fullscreen), C (copy settings), Esc (exit fullscreen)
  const rows = [
    { key: "Space", action: "Start / stop" },
    { key: "Enter", action: "Start / stop" },
    { key: "T", action: "Tap tempo" },
    { key: "↑", action: "BPM +1" },
    { key: "↓", action: "BPM -1" },
    { key: "Shift + ↑", action: "BPM +5" },
    { key: "Shift + ↓", action: "BPM -5" },
    { key: "F", action: "Toggle fullscreen" },
    { key: "C", action: "Copy current settings" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the metronome card once, then use the shortcuts below. Shortcuts
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
          Tip: if shortcuts do nothing, the metronome card probably isn’t
          focused. Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (fullscreen, audio scheduling, local-only)
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
              No sign-in required. Tempo controls, fullscreen, and audio tick
              generation run in your browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Audio is scheduled for steady timing
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The metronome schedules upcoming ticks slightly ahead of time to
              keep timing consistent. If your device is under heavy load, the
              visual pulse may look less smooth, but the audio aims to stay
              steady.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is practice-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen maximizes readability and keeps controls minimal. In
              fullscreen, you can tap or click the main display to start or stop
              quickly.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Changes apply immediately
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Adjusting BPM, time signature, subdivision, accent, sound type, or
              volume updates what you hear right away, without needing to stop
              and restart.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not require an account and does not ask you to
              upload audio or personal data to use the metronome.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Copy is optional and stays on your device
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Using Copy writes text to your clipboard so you can paste your
              setup elsewhere. Nothing needs to be sent to a server to do this.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (audio scheduling, accents, fullscreen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about how the metronome behaves
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio scheduling
              </div>
              <p className="mt-1 leading-relaxed">
                The metronome schedules ticks slightly in advance using WebAudio
                timing. A short “look-ahead” window helps keep ticks consistent
                even when the UI thread is busy.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Beats and subdivisions
              </div>
              <p className="mt-1 leading-relaxed">
                Each beat is split into 1, 2, 3, or 4 ticks (quarter, eighth,
                triplet, sixteenth). The display shows{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Beat</span> and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sub</span> counts
                so you can follow the bar.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Accent behavior
              </div>
              <p className="mt-1 leading-relaxed">
                When{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Accent beat 1
                </span>{" "}
                is enabled, the first beat of each bar is emphasized with a
                stronger tick and pulse.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Some browsers block audio until after a user gesture. If you
                hear nothing, click Start once (or tap the display in
                fullscreen), then try again.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen notes
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen targets the metronome card element. Some browsers
                require the action to come directly from a click or key press,
                so use the Fullscreen button or press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> while
                the card is focused.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy contents</div>
              <p className="mt-1 leading-relaxed">
                Copy includes BPM, time signature, subdivision, accent setting,
                sound type, volume, your time zone, and a link to this page so
                you can share or save your exact setup.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Focus + keyboard handling
              </div>
              <p className="mt-1 leading-relaxed">
                Keyboard shortcuts are captured on the metronome card. If
                shortcuts do not fire, click the card once to focus it. While
                you’re typing in an input or using a select, shortcuts are
                ignored to prevent accidental changes.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Only need BPM
          from tapping?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/bpm-tapper"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              BPM Tapper
            </Link>
          </span>
          . Want a simple practice countdown?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/countdown-timer"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Countdown Timer
            </Link>
          </span>
          . Tracking elapsed practice time?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/stopwatch"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Stopwatch
            </Link>
          </span>
          . Need a big-screen view?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/online-timer"
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
