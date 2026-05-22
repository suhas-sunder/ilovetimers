import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MOON PHASE CLOCK)
========================================================= */
export default function KeyboardShortcuts() {
  // Moon Phase Clock supports:
  // F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen for the moon phase display" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the moon phase card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in a date or time input.
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
          the display once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (moon model + live/manual + sound)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Live and Manual modes
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Live updates continuously. If you edit the date or time fields,
              the page switches to Manual so you can check another moment. Use
              Now to return to Live.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Uses your device time zone for display
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Times shown for the next and previous major phases are formatted
              in your local time zone. If your device clock or time zone is set
              incorrectly, displayed times will reflect that.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Sound requires interaction on some browsers
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Browsers often require a click before audio can play. If you
              enable Sound, click Now once to unlock audio. Final beeps only
              runs in Live mode.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This page does not require an account and does not ask you to
              upload files or personal data to use the tool.
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

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fast estimate for a clock experience
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Phase, illumination, and major-phase times are computed from a
              lightweight lunar-cycle estimate for a smooth, always-on display.
              It is useful for everyday planning, but not intended as
              specialized ephemeris data.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (live updates, lunar model, fullscreen, sound)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about update cadence, lunar-cycle math, and
                audio behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Live update cadence
              </div>
              <p className="mt-1 leading-relaxed">
                In Live mode, the countdown refreshes frequently so the display
                feels smooth. Manual mode stays fixed at the selected date and
                time.
              </p>
              <p className="mt-2 leading-relaxed">
                The “Event soon” state highlights when the next major phase is
                approaching.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Lunar-cycle estimate
              </div>
              <p className="mt-1 leading-relaxed">
                The page estimates cycle position using a fixed synodic month
                and a reference New Moon timestamp, then derives phase label,
                illumination, and age from that position.
              </p>
              <p className="mt-2 leading-relaxed">
                Major phase times are computed by finding the next boundary from
                the current cycle fraction.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen + sound behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API and may require a
                user interaction. Sound uses WebAudio and may be blocked until a
                user gesture occurs.
              </p>
              <p className="mt-2 leading-relaxed">
                Final beeps triggers short beeps near the end of the countdown
                in Live mode. Turn off Sound to silence all audio immediately.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Want sunrise and
          sunset times?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/sunrise-sunset-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Sunrise Sunset Clock
            </Link>
          </span>
          . Want a broader sky-style display?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/astronomical-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Astronomical Clock
            </Link>
          </span>
          . Need other locations?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/world-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              World Clock
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
