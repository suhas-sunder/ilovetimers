import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Live Fibonacci time • Time zones • Explore mode • Fullscreen • Copy output • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="space-y-4">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Fibonacci Clock at a glance
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
              Use this page to read the current time as a Fibonacci clock,
              switch time zones, and copy a clean breakdown of the tiles.
            </strong>{" "}
            It shows the same moment two ways: normal digital time (HH:MM:SS)
            and Fibonacci time (HH:MM, minutes in 5s). Explore mode lets you set
            any time manually.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Live time, any zone.</strong>{" "}
              Pick a time zone (or use your device zone) and the clock updates
              every second. Useful for a quick, visual world-time check.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Explore any time.</strong>{" "}
              Switch to Explore mode and type an hour (0–23) and minute (0–59).
              The board updates instantly so you can see how a time maps to the
              Fibonacci tiles.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Readable board.</strong> The 1,
              1, 2, 3, 5 squares show whether each tile counts for hours,
              minutes, both, or neither. The legend stays visible so you do not
              have to memorize colors.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen mode.</strong> Go
              fullscreen for a clean, high-contrast display. The Fibonacci time
              auto-fits the available space so it stays readable on big screens.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Copy output.</strong> Copy
              includes the Fibonacci time, the exact digital time for the
              selected zone, rounding notes, and the tile sums used for hours
              and minutes.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong> F
              toggles fullscreen, C copies, L switches to Live, and E switches
              to Explore. Click the card once if shortcuts do not respond.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Pick a zone</strong>: use
                Local (device) or choose a city/region time zone.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Read the board</strong>:
                Fibonacci time is HH:MM with minutes in 5s, and the tiles show
                the decomposition.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">
                  3) Copy or go fullscreen
                </strong>
                : press C to copy a breakdown, or F for a clean display.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Common uses
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Quick world time</strong>:
                  pick a zone and keep Live on to glance at time visually.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Manual mapping</strong>:
                  switch to Explore and type a time to see the tile breakdown.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Display mode</strong>:
                  fullscreen on a second screen as a clean, ambient clock.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Share a moment</strong>:
                  copy the output to send the Fibonacci breakdown to someone.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Want a standard zone-based clock list?{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a clean UTC reference?{" "}
                  <Link
                    to="/utc-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    UTC Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Converting between zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Prefer a classic display?{" "}
                  <Link
                    to="/digital-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/analog-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Analog Clock
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want another coded clock style?{" "}
                  <Link
                    to="/binary-clock"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Binary Clock
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
                <span>How it behaves (rounding, shortcuts, and notes)</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fibonacci time format
                  </div>
                  <p className="mt-2">
                    The board uses{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      hours (1–12)
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      minutes rounded to the nearest 5
                    </span>
                    . Minutes are represented as a 0–11 value across tiles, then
                    multiplied by 5.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Rounding and carry
                  </div>
                  <p className="mt-2">
                    If minutes round up to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">:60</span>,
                    the clock carries the hour +1 and shows minutes as{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">:00</span>.
                    The rounding message on the page tells you what happened.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Tile meanings
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Red</span>{" "}
                    counts for hours,{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">green</span>{" "}
                    counts for minutes (×5),{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">blue</span>{" "}
                    counts for both, and{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">white</span>{" "}
                    counts for neither.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> copy
                    · <span className="font-semibold text-[var(--ilt-text-primary)]">L</span>{" "}
                    live ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">E</span>{" "}
                    explore ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts do not work, click/tap the clock card once so
                    it has focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Time zone notes
                  </div>
                  <p className="mt-2">
                    Live mode reads the selected IANA time zone (for example{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      America/New_York
                    </span>
                    ). Local uses your device zone. If a zone cannot be resolved
                    in the browser, the clock falls back to your local time.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you are sharing
            a Fibonacci time with someone in another region, select their time
            zone first, then hit Copy so the message includes both the zone and
            the exact digital time.
          </div>
        </details>
      </div>
    </section>
  );
}
