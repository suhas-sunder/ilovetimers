// app/clients/components/multiple-timers/HowItWorks.tsx
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
   HOW IT WORKS (Multiple Timers)
   Goal: user-intent first, SEO-friendly, unique, practical
========================================================= */
export default function HowItWorks({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const pageUrl = `${baseUrl}/multiple-timers`;

  // Helpful, non-spam schema for the section itself (unique to this tool)

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Multiple Timers is an online tool for running two or more countdown
            timers at once. Each timer is independent, but you can still control
            the whole grid in one place.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="ilt-surface-muted p-4 text-[var(--ilt-text-secondary)]">
            <p className="leading-relaxed">
              This page is built for situations where one timer is not enough.
              Instead of resetting the same countdown over and over, you set up
              parallel timers, label them, and keep them visible side by side.
              That is the main benefit: fewer mistakes, less tab switching, and
              a clearer view of what finishes next.
            </p>
            <p className="mt-3 leading-relaxed">
              You can set each timer using quick minute presets (1, 2, 3, 5, 7,
              10, 12, 15, 20, 25, 30) or by typing exact minutes and seconds. A
              timer can be started and paused individually, or you can use the
              global controls to start, pause, and reset everything together.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                1) Add and label
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Click{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Add timer</span>{" "}
                and rename labels so the grid stays readable (for example:
                “Chicken”, “Rice”, “Rest”).
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                2) Set durations
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Choose a preset or type exact Minutes and Seconds. Changing time
                resets that timer to the new duration and pauses it, so you do
                not accidentally edit a timer mid-run.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                3) Run and finish cleanly
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Start one timer or use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start all</span>.
                When a timer reaches 0 it enters an alarm state. Stop alarms
                fast if you need to silence everything.
              </p>
            </div>
          </div>
        </div>

        {/* Examples with real numbers users see */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Examples with real setups
          </h3>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            These are practical “copy this” patterns that match what the tool
            shows on screen (minutes:seconds or hours:minutes:seconds).
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Cooking */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Example A: Dinner with overlapping steps
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are baking salmon while boiling rice and steaming broccoli.
                Set up three timers so you can glance once and know what is
                next.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">Salmon</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Set to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">12:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">12m</span>{" "}
                    preset)
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">Rice</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Set to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">20:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">20m</span>{" "}
                    preset)
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">Broccoli</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Set to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">3:30</span>{" "}
                    (Minutes:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">3</span>,
                    Seconds:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">30</span>)
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Start all when you put the rice on. When you add broccoli later,
                start only that timer. You will see broccoli hit{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>{" "}
                first, then salmon, then rice. If sound is on, you will hear the
                alarm at each finish. If you want a quiet kitchen, turn Sound
                off and rely on the on-screen “Alarm ringing” state.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Related:{" "}
                <Link
                  to="/cooking-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Cooking Timer
                </Link>
                ,{" "}
                <Link
                  to="/egg-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Egg Timer
                </Link>
                ,{" "}
                <Link
                  to="/tea-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Tea Timer
                </Link>
                .
              </div>
            </div>

            {/* Workout */}
            <div className="ilt-surface-card p-4">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Example B: Workout interval plus rest, visible together
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are doing strength sets where rest time matters, but you
                also have a longer “session cap” you do not want to exceed.
                Multiple timers lets you track both without switching modes.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">
                    Session cap
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Set to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">30:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">30m</span>{" "}
                    preset)
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">
                    Rest between sets
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Set to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1:30</span>{" "}
                    (Minutes:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">1</span>,
                    Seconds:{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">30</span>)
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">Finisher</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    Set to{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">7:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">7m</span>{" "}
                    preset)
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Start the session cap and keep it running. After each set, start
                the rest timer. If you enable Final beeps, the rest timer can
                give you a cue in the last 5 seconds (5, 4, 3, 2, 1) before it
                reaches 0. That is useful when you are not staring at the
                screen.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Prefer structured interval formats? Try{" "}
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
                </Link>
                .
              </div>
            </div>

            {/* Classroom / lab */}
            <div className="ilt-surface-card p-4 md:col-span-2">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Example C: Classroom stations on one shared screen
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You have three groups rotating through stations, and each
                station needs a different countdown. Label timers clearly and
                run the grid fullscreen so the room can read it from a distance.
              </p>

              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">Station 1</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">10:00</span>{" "}
                    (preset 10m)
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">Station 2</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">7:00</span>{" "}
                    (preset 7m)
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="font-semibold text-[var(--ilt-text-primary)]">Station 3</div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">5:00</span>{" "}
                    (preset 5m)
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Click Fullscreen (or press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> after
                focusing the tool). Use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
                start or pause all timers together when you give instructions.
                If an alarm rings, press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">X</span> to stop
                all alarms immediately. This is faster than hunting for
                individual buttons in a live classroom.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Related:{" "}
                <Link
                  to="/classroom-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Classroom Timer
                </Link>
                ,{" "}
                <Link
                  to="/lab-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Lab Timer
                </Link>
                ,{" "}
                <Link
                  to="/presentation-timer"
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Presentation Timer
                </Link>
                .
              </div>
            </div>
          </div>
        </div>

        {/* Behaviors that users actually trip on */}
        <div className="mt-6 ilt-surface-card p-4">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Details that save you time
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Editing minutes and seconds resets that timer
              </div>
              <p className="mt-2 leading-relaxed">
                When you change a preset or type a new value, the timer resets
                to the new duration and pauses. This prevents accidental changes
                while a timer is running.
              </p>
              <p className="mt-2 leading-relaxed">
                If you want to adjust a running timer, pause it first, then
                update the time.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Stop alarm vs Silence
              </div>
              <p className="mt-2 leading-relaxed">
                When a timer hits 0, it enters an alarm state.{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Stop alarm</span>{" "}
                stops the alarm and resets the timer to its full duration.
              </p>
              <p className="mt-2 leading-relaxed">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Silence</span>{" "}
                only clears the alarm state and leaves the timer at 0. This is
                useful when you want to acknowledge the alarm without resetting
                the timer.
              </p>
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Your layout can be remembered on this device
              </div>
              <p className="mt-2 leading-relaxed">
                The tool saves timer labels, durations, remaining time, and
                sound preferences in your browser on this device. This helps
                when you reuse the same setup, like a weekly class with the same
                station times.
              </p>
              <p className="mt-2 leading-relaxed">
                If you clear site data or use a private window, the saved setup
                may not persist.
              </p>
            </div>
          </div>
        </div>

        {/* Technical content stays expandable */}
        <details className="group mt-6 ilt-surface-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical notes (timing, audio, saving)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional details if you are troubleshooting or demoing the tool
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Countdown display rounding
              </div>
              <p className="mt-1 leading-relaxed">
                The display rounds to whole seconds for stable reading. You will
                typically see values like 1:30, 1:29, 1:28, rather than a
                rapidly changing millisecond display.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio can require interaction
              </div>
              <p className="mt-1 leading-relaxed">
                Some browsers block audio until you interact with the page. If
                you do not hear alarms, click anywhere on the page and confirm
                the tab is not muted.
              </p>
            </div>

            <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Local saving uses browser storage
              </div>
              <p className="mt-1 leading-relaxed">
                Saving uses browser local storage for this site only. It does
                not upload your timers to a server. Private browsing or strict
                privacy modes may block storage, which can prevent persistence
                across reloads.
              </p>
            </div>
          </div>
        </details>

        {/* Footer helper links, on-intent */}
        <div className="mt-6 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Need a different mode?
          </span>{" "}
          For one simple countdown use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . For a big single display use{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . For structured intervals use{" "}
          <Link
            to="/round-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Round Timer
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
