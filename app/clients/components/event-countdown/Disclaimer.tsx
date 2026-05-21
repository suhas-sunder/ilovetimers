import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Countdown to a specific date & time • Saved events • Fullscreen display • Start/pause + reset • Optional sound + final beeps • Keyboard shortcuts";

  return (
    <section className="space-y-4">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Event Countdown at a glance
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
              Use this page to count down to an exact date and time for a
              deadline, launch, appointment, or meeting, with a big fullscreen
              display.
            </strong>{" "}
            Save multiple events in your browser, switch between them instantly,
            and use optional sound alerts when the countdown hits zero.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Countdown to a date & time.
              </strong>{" "}
              Pick the exact local date and time you care about. The timer shows
              a long format (days/hours/minutes/seconds) and a short quick-read
              clock.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Fullscreen that’s readable.
              </strong>{" "}
              Great for screen sharing, a second monitor, or “across the room”
              visibility. In fullscreen, click/tap the time to start or pause.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Saved events (browser).
              </strong>{" "}
              Create multiple countdowns, duplicate an event, and delete old
              ones. Everything is stored locally in your browser.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Sound options.</strong> Enable
              a finish beep when the timer hits zero. Optionally turn on{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>{" "}
              to beep during the last 5 seconds.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Quick adjust.</strong> Nudge
              the target time by{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">±1h</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">±2h</span>, or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">±24h</span> without
              re-typing the date/time.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Keyboard shortcuts.</strong>{" "}
              Space starts/pauses, R resets, and F toggles fullscreen (Esc
              exits). Click the card once if shortcuts don’t respond.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Choose the event</strong>:{" "}
                pick a saved event (or create a new one), then set the
                date/time.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Start</strong>: press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span> (or
                Space). Use Fullscreen if you want a big display.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Reset or adjust</strong>:{" "}
                reset back to the current remaining time, or nudge the target by
                a few hours.
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
                  <strong className="text-[var(--ilt-text-primary)]">Deadlines</strong>:
                  submissions, cutoffs, or “time left” for a task.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Launches</strong>: a
                  release, livestream, or scheduled drop.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Meetings and calls</strong>
                  : keep a visible countdown before start time.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">
                    Exam or session start
                  </strong>
                  : count down to the start of a timed window.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Need a simple countdown for a duration (not a calendar date)?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a clean “big screen” timer without event saving?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Running a meeting and need time tracking up from zero?{" "}
                  <Link
                    to="/meeting-count-up-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Meeting Count Up Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need multiple timers at once for a schedule?{" "}
                  <Link
                    to="/multiple-timers"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Multiple Timers
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Just want a dedicated alarm page?{" "}
                  <Link
                    to="/alarm-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Alarm Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need to compare times across zones before you set an event?{" "}
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
                <span>Details and shortcuts</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--ilt-text-muted)]">
                    If shortcuts don’t work, click/tap the card once so it has
                    focus.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Saved events
                  </div>
                  <p className="mt-2">
                    Events are stored locally in your browser. Creating,
                    duplicating, and deleting only affects this device/browser.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Date & time is local
                  </div>
                  <p className="mt-2">
                    The date/time picker uses your device’s local timezone. If
                    you travel or change system timezone, your event’s displayed
                    target will reflect that local setting.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Some browsers require interaction before audio plays. If you
                    don’t hear beeps, try clicking Start once, then enable
                    sound.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen requires a user gesture in most browsers. In
                    fullscreen, you can click/tap the time display to start or
                    pause quickly.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> If you want the
            display to be “presentation-safe,” go fullscreen and leave the
            controls off-screen. Use Space and R for quick control.
          </div>
        </details>
      </div>
    </section>
  );
}
