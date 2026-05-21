import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Live phase + illumination + moon age • Big countdown to the next major phase • Fullscreen • Sound + optional final beeps • Manual date/time lookup";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="space-y-4">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Moon phase clock at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              A clean live view of today’s moon phase with a big countdown to
              the next major phase.
            </strong>{" "}
            See the current phase label, illumination estimate, and moon age at
            a glance. Use fullscreen for a wall display, and switch to Manual if
            you want to check a specific date and time.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Live countdown.</strong> A big,
              readable timer to the next major phase (New Moon, First Quarter,
              Full Moon, Last Quarter).
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Phase details.</strong> Current
              phase name, illumination percentage, and moon age in days.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> One
              click for a clean, room-readable display with a top control bar
              and bottom status line.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound alerts.</strong> Toggle
              sound on/off. Optionally enable final beeps near the event when
              you want a heads-up.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Manual lookup.</strong> Pick a
              date, hour, and minute to see the phase details for that moment.
              Editing switches you to Manual automatically.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Phase position bar.</strong>{" "}
              Quick visual of where you are in the current lunar cycle.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Live view</strong>: keep
                Live on to track today’s phase and the next major phase time.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Fullscreen</strong>: click
                Fullscreen or press{" "}
                <strong className="text-[var(--ilt-text-primary)]">F</strong> for a big display.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Manual check</strong>:
                change the date/time to check another moment, then use{" "}
                <strong className="text-[var(--ilt-text-primary)]">Now</strong> to return to
                Live.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Planning</strong>: see when
                  the next New Moon or Full Moon happens in your local time.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Quick checks</strong>:
                  phase, illumination, and age without digging through menus.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">A display mode</strong>:
                  fullscreen countdown you can read across the room.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Reference lookups</strong>:
                  check the phase for a specific date and time in Manual.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want sunrise and sunset times too?{" "}
                  <Link
                    to="/sunrise-sunset-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Sunrise Sunset Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want more “sky” context in one view?{" "}
                  <Link
                    to="/astronomical-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Astronomical Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need local time for a different place?{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Converting meeting times across zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>How it works, shortcuts, and notes</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the clock card once so shortcuts are captured.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Model notes
                  </div>
                  <p className="mt-2">
                    Phase, illumination, and major-phase times are computed from
                    a lightweight lunar-cycle estimate for a smooth clock
                    experience.
                  </p>
                  <p className="mt-2">
                    Manual mode uses the date and time you enter in your local
                    time zone, then computes the estimated cycle position for
                    that moment.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound behavior
                  </div>
                  <p className="mt-2">
                    Sound only runs in Live mode. If Final beeps are enabled,
                    the page plays short beeps near the end of the countdown.
                    Use the Now button after turning sound on to unlock audio on
                    browsers that require interaction.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For a clean
            display, go fullscreen and keep Live on. If you only want to look
            something up, switch to Manual and set the exact date and time.
          </div>
        </details>
      </div>
    </section>
  );
}
