// app/clients/components/online-timer/HowItWorks.tsx
import * as React from "react";
import { Link } from "react-router";

/* =========================================================
   JSON-LD helper (used by FAQ + PopularUseCases)
========================================================= */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* =========================================================
   HOW IT WORKS (Online Timer)
   Goal: user-intent first, SEO-friendly, unique, practical
   Target: 800 to 1200 words of real help + examples
========================================================= */
export default function HowItWorks({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const pageUrl = `${baseUrl}/online-timer`;

  // Helpful, non-spam schema for the section itself (unique to this tool)
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use an online countdown timer with fullscreen",
    description:
      "Use Online Timer to start a countdown instantly with presets or custom time entry, optional sound, loop mode, fullscreen display, and keyboard shortcuts.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick a preset or enter a custom time",
        text: "Choose a quick preset (1m to 60m) or type a time like 45, 05:00, or 1:02:30, then press Set to load the duration.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, or reset",
        text: "Press Start to begin. Press Space to start or pause quickly. Use Reset (or R) to return to the set duration.",
      },
      {
        "@type": "HowToStep",
        name: "Choose sound and loop options",
        text: "Enable Sound to hear a beep at 0. Enable Loop if you want the same countdown to restart automatically each time it finishes.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for a big display",
        text: "Click Fullscreen (or press F after focusing the timer card). In fullscreen, click or tap the timer area to start or pause without leaving the big display.",
      },
      {
        "@type": "HowToStep",
        name: "Exit cleanly",
        text: "Press Esc to exit fullscreen. If the timer reaches 0, it shows Done. Press Restart to run it again from the same duration.",
      },
    ],
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Online Timer is a fast, no-setup countdown timer designed for one
            job: set a time, start the countdown, and keep it readable. Use it
            in a browser on any device, then switch to fullscreen when you need
            a big display.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="ilt-surface-muted p-4 text-[var(--ilt-text-secondary)]">
            <p className="leading-relaxed">
              The timer supports quick presets and precise custom entry, so you
              can go from idea to running countdown in a few seconds. You can
              keep it simple (tap a 10-minute preset), or be exact when the
              seconds matter (type 3:30 for 3 minutes 30 seconds).
            </p>
            <p className="mt-3 leading-relaxed">
              The main workflow is consistent: set a duration, press Start, and
              use Pause or Reset whenever you need control. Fullscreen adds a
              top control strip and a bottom status strip, plus a useful
              shortcut: in fullscreen you can tap or click the timer area to
              start or pause without hunting for buttons.
            </p>
            <p className="mt-3 leading-relaxed">
              Sound and Loop are optional. Turn Sound on if you need an audible
              finish cue. Turn Loop on if you want the same interval to repeat
              automatically, like a repeating 1-minute station timer or a
              repeating 30-second rest.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                1) Set the duration
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Choose a preset or type{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">ss</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">mm:ss</span>, or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">h:mm:ss</span>,
                then press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Set</span>.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                2) Start and control
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Press Start (or Space) to run. Press again to pause. Use Reset
                (or R) to return to the set duration.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                3) Sound and Loop
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Sound plays a short beep at 0. Loop restarts the same duration
                each time the timer finishes.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                4) Fullscreen
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Press Fullscreen (or F). In fullscreen, tap or click the timer
                area to start or pause quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Examples with real numbers users see */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Examples you can copy
          </h3>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            These examples use the same formats you see on screen. If a duration
            is under an hour, the display reads{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">m:ss</span>. For an
            hour or more, it reads{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">h:mm:ss</span>.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Presentation */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario A: Presentation segment timing (12 minutes)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You have a 12-minute demo and want a clear room-visible
                countdown. The key is reducing friction: set, fullscreen, start.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Setup
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Tap the{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">12m</span>{" "}
                    preset (or type{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">12:00</span>{" "}
                    and press Set).
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Run
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
                    fullscreen, then press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>{" "}
                    to start. If you need to pause mid-demo, tap the timer area
                    once.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Finish
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    At{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>,
                    the timer shows{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Done</span>.
                    With Sound on, you hear a short beep. Press Restart if you
                    want the same 12-minute segment again.
                  </div>
                </div>
              </div>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Want a talk-specific layout?{" "}
                <Link
                  to="/presentation-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Presentation Timer
                </Link>{" "}
                is a better fit when you time multiple segments back to back.
              </div>
            </div>

            {/* Classroom */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario B: Classroom transition (3 minutes 30 seconds)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You want a short transition timer that is precise enough to keep
                the pace, but simple enough to restart repeatedly.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Set
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Type{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">3:30</span>{" "}
                    and press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Set</span>.
                    The display will show{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">3:30</span>.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Run
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Press Start and keep it visible. If students ask for a brief
                    pause, press Space to pause, then Space again to resume.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Repeat
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Press Reset (or{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>) to
                    return to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">3:30</span>{" "}
                    for the next transition. This is faster than re-typing the
                    time each round.
                  </div>
                </div>
              </div>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Running a classroom daily?{" "}
                <Link
                  to="/classroom-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Classroom Timer
                </Link>{" "}
                is tuned for class routines and room-friendly use.
              </div>
            </div>

            {/* Repeating intervals */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario C: Repeating intervals with Loop (45 seconds)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are running a repeating station: 45 seconds on, rotate, then
                45 seconds again. You do not want to reset and restart manually
                each time.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Set
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Type{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">45</span> and
                    press Set. The timer loads{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">0:45</span>.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Options
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Turn{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Loop</span>{" "}
                    on. Keep{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span>{" "}
                    on if you want a clear end cue each interval.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    What you will see
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    The display runs down to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>,
                    beeps (if Sound is on), then instantly restarts at{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">0:45</span>.
                    That cycle repeats until you pause or reset.
                  </div>
                </div>
              </div>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Need structured work/rest rounds?{" "}
                <Link
                  to="/hiit-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  HIIT Timer
                </Link>{" "}
                or{" "}
                <Link
                  to="/tabata-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Tabata Timer
                </Link>{" "}
                will do that automatically.
              </div>
            </div>

            {/* Long duration */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario D: Long countdown (1 hour 15 minutes)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You need a long countdown where hours matter, like a study block
                or a timed practice session.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Set
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Type{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      1:15:00
                    </span>{" "}
                    and press Set. The timer displays{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      1:15:00
                    </span>
                    .
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Control
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Use Pause when you step away. Use Reset to return to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      1:15:00
                    </span>{" "}
                    without re-entering the time.
                  </div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Alternative
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    If you are running repeated focus cycles, a dedicated tool
                    may be easier.
                  </div>
                </div>
              </div>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Prefer guided work blocks?{" "}
                <Link
                  to="/pomodoro-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Pomodoro Timer
                </Link>{" "}
                or{" "}
                <Link
                  to="/focus-session-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Focus Session Timer
                </Link>{" "}
                may match your workflow better.
              </div>
            </div>
          </div>
        </div>

        {/* Practical clarifications */}
        <div className="mt-6 ilt-surface-card p-4">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Details that prevent mistakes
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Editing while running pauses cleanly
              </div>
              <p className="mt-2 leading-relaxed">
                If you type into the time box during a run, the timer pauses
                first. This keeps control predictable: you can adjust the next
                duration without the timer continuing to drift while you edit.
              </p>
              <p className="mt-2 leading-relaxed">
                After you press Set, start again when you are ready.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen is designed for quick control
              </div>
              <p className="mt-2 leading-relaxed">
                In fullscreen, the timer area itself acts like a control
                surface: tap or click to start and pause. This is useful when
                you are presenting, coaching, or moving around a room and do not
                want to aim for small buttons.
              </p>
              <p className="mt-2 leading-relaxed">
                Press Esc any time to exit fullscreen.
              </p>
            </div>
          </div>
        </div>

        {/* Technical content stays expandable */}
        <details className="group mt-6 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (timing accuracy, audio, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details for troubleshooting and demos
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Display rounding for readability
              </div>
              <p className="mt-1 leading-relaxed">
                The time display updates in whole seconds so it stays stable and
                readable. You will see values like 2:10, 2:09, 2:08, rather than
                a fast-changing millisecond display.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio may require interaction
              </div>
              <p className="mt-1 leading-relaxed">
                Some browsers block audio until you interact with the page. If
                you do not hear the beep, click Start once, confirm Sound is on,
                check device volume, and make sure the tab is not muted.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior varies by browser
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some devices require
                a direct click to enter fullscreen, and some hide browser UI
                differently. Esc exits fullscreen on desktop. On mobile, the
                system back gesture may also exit fullscreen depending on the
                browser.
              </p>
            </div>
          </div>
        </details>

        {/* Footer helper links, on-intent */}
        <div className="mt-6 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Need a different tool?
          </span>{" "}
          For multiple countdowns use{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          . For a dedicated big display use{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . For quiet spaces use{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
