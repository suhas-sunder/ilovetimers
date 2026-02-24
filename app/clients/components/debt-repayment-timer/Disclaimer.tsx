export default function Disclaimer() {
  const preview =
    "Set a payoff date or duration • Big countdown display • Time-based progress estimate • Fullscreen mode • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Debt Repayment Timer at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">
              Use this page to run a payoff countdown and keep the finish line
              visible.
            </strong>{" "}
            Choose a payoff date (or a fixed number of days) and the timer shows
            time remaining plus a simple, time-based progress estimate.
            Fullscreen turns it into a clean, big display you can glance at
            throughout the day.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Two ways to run it.</strong>{" "}
              Pick{" "}
              <span className="font-semibold text-slate-900">Payoff date</span>{" "}
              for a specific deadline, or{" "}
              <span className="font-semibold text-slate-900">Duration</span> if
              you prefer “N days from start.”
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Big countdown.</strong> Shows
              days + clock time remaining (and switches format automatically as
              it gets closer).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Progress (time).</strong> The
              progress % is based on elapsed time between your start and end
              dates, not payments.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Simple payoff estimate.
              </strong>{" "}
              Add a starting balance and target balance and the page shows{" "}
              <span className="font-semibold text-slate-900">est. paid</span>{" "}
              and{" "}
              <span className="font-semibold text-slate-900">
                est. remaining
              </span>{" "}
              using a straight-line (time-based) estimate.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong> Big
              digits for distance viewing. In fullscreen you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the timer
              </span>{" "}
              to start or pause.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Keyboard shortcuts.</strong>{" "}
              Start/pause, reset, and fullscreen without touching the mouse.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Fast setup
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Pick a mode</strong>:{" "}
                <span className="font-semibold text-slate-900">
                  Payoff date
                </span>{" "}
                or{" "}
                <span className="font-semibold text-slate-900">Duration</span>.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Set your numbers</strong>:
                currency, starting balance, and target balance (optional but
                recommended).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  3) Start the countdown
                </strong>{" "}
                and use <span className="font-semibold text-slate-900">F</span>{" "}
                for fullscreen.{" "}
                <span className="font-semibold text-slate-900">Space</span>{" "}
                start/pause ·{" "}
                <span className="font-semibold text-slate-900">R</span> reset.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                When this timer is useful
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Daily focus</strong>: keep
                  the payoff date visible, especially in fullscreen on a second
                  monitor.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Short sprints</strong>: set
                  a 30/60/90-day duration and treat it like a focused payoff
                  window.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Milestone tracking</strong>
                  : adjust the target balance to reflect a checkpoint (not just
                  $0).
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">
                    Simple progress signal
                  </strong>
                  : use the time-based estimate as a quick “are we on pace?”
                  reference, not a precise payoff model.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a general countdown for anything?{" "}
                  <a
                    href="/countdown-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a clean big display for a room?{" "}
                  <a
                    href="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Timing a planning session or review call?{" "}
                  <a
                    href="/meeting-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Timer
                  </a>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a running timer instead?{" "}
                  <a
                    href="/count-up-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Count Up Timer
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Technical notes</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    If shortcuts don’t work, click/tap the card once so it has
                    focus.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    How the estimate works
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">
                      Progress
                    </span>{" "}
                    is time elapsed from your start date to end date.
                    <span className="font-semibold text-slate-900">
                      {" "}
                      Est. paid/remaining
                    </span>{" "}
                    applies that same time progress to the difference between
                    starting balance and target balance (a straight-line,
                    time-based estimate).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Date handling
                  </div>
                  <p className="mt-2">
                    Dates are interpreted as local midnight for the selected
                    day. If the end date is not after the start date, the timer
                    is blocked until you fix the dates.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture to enter fullscreen. In
                    fullscreen, tapping/clicking the timer toggles start/pause.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Disclosure.</strong> This tool
            provides a time-based countdown and a simple linear estimate for
            “paid/remaining” based on your dates and balances. It does not
            account for interest, fees, payment schedules, or lender
            calculations.
          </div>
        </details>
      </div>
    </section>
  );
}
