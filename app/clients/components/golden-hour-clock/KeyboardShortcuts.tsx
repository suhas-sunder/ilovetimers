import { Link } from "react-router";

export default function KeyboardShortcuts() {
  // Golden Hour Clock supports:
  // F (toggle fullscreen), G (request GPS), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen" },
    { key: "G", action: "Use GPS (request location)" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
          Click the clock card once, then use the keyboard shortcuts below.
          Shortcuts won’t trigger while you’re typing in an input, select,
          textarea, or editable field.
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
                <tr key={r.key} className="border-b border-[var(--ilt-border-subtle)]">
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
          Tip: if shortcuts do nothing, the clock card probably isn’t focused.
          Click the card once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (location, time zone, accuracy, audio, local-only)
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
              Runs locally in your browser
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              No sign-in required. The clock, countdown, and fullscreen behavior
              run in your browser.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Location is permission-based
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you use GPS, your browser will ask for location permission. If
              you prefer, you can enter latitude and longitude manually instead.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Times shown in your device time zone
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Sunrise, sunset, and golden hour times are displayed in your
              device’s current time zone. For planning in another time zone, use
              a converter after you get the times.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen is display-first
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen maximizes readability and keeps controls minimal. Exit
              with <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> or
              the Exit button.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Sound behavior
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Sound uses WebAudio. Some browsers block audio until you interact
              with the page. If you don’t hear beeps, click/tap once and make
              sure the tab and device aren’t muted.
            </p>
          </div>

          <div className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Edge cases (high latitudes)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Near the poles, some dates have no sunrise or no sunset. If that
              happens, the page shows a note and golden hour windows may be
              unavailable for that date and location.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (methods, countdown, GPS, audio)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details about how the page behaves
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Golden hour definitions
              </div>
              <p className="mt-1 leading-relaxed">
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Classic (60 minutes)
                </span>{" "}
                uses a fixed window after sunrise and before sunset.{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Solar-angle (0° to 6°)
                </span>{" "}
                uses the sun’s height above the horizon, which can produce
                longer or shorter windows depending on latitude and season.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                When solar-angle falls back
              </div>
              <p className="mt-1 leading-relaxed">
                If the solar-angle window is invalid or unusual for the selected
                latitude/date, the page falls back to a safe 60-minute estimate
                and shows a note so you know what happened.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Countdown behavior
              </div>
              <p className="mt-1 leading-relaxed">
                The countdown updates frequently and targets the next upcoming
                transition (golden hour start/end, sunrise, or sunset). When an
                event passes, it automatically switches to the next one.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                GPS and browser limits
              </div>
              <p className="mt-1 leading-relaxed">
                GPS requires permission and may be approximate depending on your
                device, signal, and settings. If GPS fails, enter coordinates
                manually.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Audio notes</div>
              <p className="mt-1 leading-relaxed">
                Many browsers require a user gesture before audio plays. If
                sound is enabled but you hear nothing, click/tap once and try
                again. With Final beeps enabled, the page plays short beeps
                during the last 5 seconds before a golden hour boundary (start
                or end).
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 ilt-surface-muted px-3 py-2 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Related.</strong> Need just sunrise
          and sunset?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/sunrise-sunset-clock"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Sunrise &amp; Sunset Clock
            </Link>
          </span>
          . Coordinating times for another region?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/time-zone-converter"
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
            >
              Time Zone Converter
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}
