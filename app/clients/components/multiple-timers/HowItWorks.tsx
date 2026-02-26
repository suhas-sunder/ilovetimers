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
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to run multiple timers online at the same time",
    description:
      "Use Multiple Timers to run two or more countdown timers at once, each with its own label, presets, custom minutes and seconds, fullscreen mode, and optional sound.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Add the timers you need",
        text: "Click Add timer to create as many parallel countdowns as you want, then rename each label so you can identify it at a glance.",
      },
      {
        "@type": "HowToStep",
        name: "Set durations using presets or custom time",
        text: "Use a preset (1m, 2m, 3m, 5m, 7m, 10m, 12m, 15m, 20m, 25m, 30m) or type exact Minutes and Seconds. Changing time resets that timer to the new duration and pauses it.",
      },
      {
        "@type": "HowToStep",
        name: "Start one timer or start all",
        text: "Start a single timer from its tile, or use Start all to run every timer at the same time. Use Pause all to freeze everything in place.",
      },
      {
        "@type": "HowToStep",
        name: "Handle alarms cleanly",
        text: "When a timer hits 0 it enters an alarm state. Use Stop alarm on the tile to stop and reset it, or use Stop alarms to silence all alarms immediately.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for shared displays",
        text: "Enter fullscreen for a room-readable layout with top controls and a bottom status strip. Press Esc to exit.",
      },
    ],
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">How it works</h2>
          <p className="mt-1 text-sm text-slate-600">
            Multiple Timers is an online tool for running two or more countdown
            timers at once. Each timer is independent, but you can still control
            the whole grid in one place.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                1) Add and label
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Click{" "}
                <span className="font-semibold text-slate-900">Add timer</span>{" "}
                and rename labels so the grid stays readable (for example:
                “Chicken”, “Rice”, “Rest”).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                2) Set durations
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Choose a preset or type exact Minutes and Seconds. Changing time
                resets that timer to the new duration and pauses it, so you do
                not accidentally edit a timer mid-run.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                3) Run and finish cleanly
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Start one timer or use{" "}
                <span className="font-semibold text-slate-900">Start all</span>.
                When a timer reaches 0 it enters an alarm state. Stop alarms
                fast if you need to silence everything.
              </p>
            </div>
          </div>
        </div>

        {/* Examples with real numbers users see */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-sky-700">
            Examples with real setups
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These are practical “copy this” patterns that match what the tool
            shows on screen (minutes:seconds or hours:minutes:seconds).
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Cooking */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Example A: Dinner with overlapping steps
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You are baking salmon while boiling rice and steaming broccoli.
                Set up three timers so you can glance once and know what is
                next.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Salmon</div>
                  <div className="mt-1 text-slate-700">
                    Set to{" "}
                    <span className="font-semibold text-slate-900">12:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-slate-900">12m</span>{" "}
                    preset)
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Rice</div>
                  <div className="mt-1 text-slate-700">
                    Set to{" "}
                    <span className="font-semibold text-slate-900">20:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-slate-900">20m</span>{" "}
                    preset)
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Broccoli</div>
                  <div className="mt-1 text-slate-700">
                    Set to{" "}
                    <span className="font-semibold text-slate-900">3:30</span>{" "}
                    (Minutes:{" "}
                    <span className="font-semibold text-slate-900">3</span>,
                    Seconds:{" "}
                    <span className="font-semibold text-slate-900">30</span>)
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Start all when you put the rice on. When you add broccoli later,
                start only that timer. You will see broccoli hit{" "}
                <span className="font-semibold text-slate-900">0:00</span>{" "}
                first, then salmon, then rice. If sound is on, you will hear the
                alarm at each finish. If you want a quiet kitchen, turn Sound
                off and rely on the on-screen “Alarm ringing” state.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Related:{" "}
                <Link
                  to="/cooking-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Cooking Timer
                </Link>
                ,{" "}
                <Link
                  to="/egg-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Egg Timer
                </Link>
                ,{" "}
                <Link
                  to="/tea-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Tea Timer
                </Link>
                .
              </div>
            </div>

            {/* Workout */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Example B: Workout interval plus rest, visible together
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You are doing strength sets where rest time matters, but you
                also have a longer “session cap” you do not want to exceed.
                Multiple timers lets you track both without switching modes.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">
                    Session cap
                  </div>
                  <div className="mt-1 text-slate-700">
                    Set to{" "}
                    <span className="font-semibold text-slate-900">30:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-slate-900">30m</span>{" "}
                    preset)
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">
                    Rest between sets
                  </div>
                  <div className="mt-1 text-slate-700">
                    Set to{" "}
                    <span className="font-semibold text-slate-900">1:30</span>{" "}
                    (Minutes:{" "}
                    <span className="font-semibold text-slate-900">1</span>,
                    Seconds:{" "}
                    <span className="font-semibold text-slate-900">30</span>)
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Finisher</div>
                  <div className="mt-1 text-slate-700">
                    Set to{" "}
                    <span className="font-semibold text-slate-900">7:00</span>{" "}
                    (use the{" "}
                    <span className="font-semibold text-slate-900">7m</span>{" "}
                    preset)
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Start the session cap and keep it running. After each set, start
                the rest timer. If you enable Final beeps, the rest timer can
                give you a cue in the last 5 seconds (5, 4, 3, 2, 1) before it
                reaches 0. That is useful when you are not staring at the
                screen.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Prefer structured interval formats? Try{" "}
                <Link
                  to="/hiit-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  HIIT Timer
                </Link>{" "}
                or{" "}
                <Link
                  to="/tabata-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Tabata Timer
                </Link>
                .
              </div>
            </div>

            {/* Classroom / lab */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
              <div className="text-base font-semibold text-slate-900">
                Example C: Classroom stations on one shared screen
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You have three groups rotating through stations, and each
                station needs a different countdown. Label timers clearly and
                run the grid fullscreen so the room can read it from a distance.
              </p>

              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Station 1</div>
                  <div className="mt-1 text-slate-700">
                    <span className="font-semibold text-slate-900">10:00</span>{" "}
                    (preset 10m)
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Station 2</div>
                  <div className="mt-1 text-slate-700">
                    <span className="font-semibold text-slate-900">7:00</span>{" "}
                    (preset 7m)
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Station 3</div>
                  <div className="mt-1 text-slate-700">
                    <span className="font-semibold text-slate-900">5:00</span>{" "}
                    (preset 5m)
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Click Fullscreen (or press{" "}
                <span className="font-semibold text-slate-900">F</span> after
                focusing the tool). Use{" "}
                <span className="font-semibold text-slate-900">Space</span> to
                start or pause all timers together when you give instructions.
                If an alarm rings, press{" "}
                <span className="font-semibold text-slate-900">X</span> to stop
                all alarms immediately. This is faster than hunting for
                individual buttons in a live classroom.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Related:{" "}
                <Link
                  to="/classroom-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Classroom Timer
                </Link>
                ,{" "}
                <Link
                  to="/lab-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Lab Timer
                </Link>
                ,{" "}
                <Link
                  to="/presentation-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Presentation Timer
                </Link>
                .
              </div>
            </div>
          </div>
        </div>

        {/* Behaviors that users actually trip on */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-700">
            Details that save you time
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
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

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Stop alarm vs Silence
              </div>
              <p className="mt-2 leading-relaxed">
                When a timer hits 0, it enters an alarm state.{" "}
                <span className="font-semibold text-slate-900">Stop alarm</span>{" "}
                stops the alarm and resets the timer to its full duration.
              </p>
              <p className="mt-2 leading-relaxed">
                <span className="font-semibold text-slate-900">Silence</span>{" "}
                only clears the alarm state and leaves the timer at 0. This is
                useful when you want to acknowledge the alarm without resetting
                the timer.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
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
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (timing, audio, saving)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details if you are troubleshooting or demoing the tool
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Countdown display rounding
              </div>
              <p className="mt-1 leading-relaxed">
                The display rounds to whole seconds for stable reading. You will
                typically see values like 1:30, 1:29, 1:28, rather than a
                rapidly changing millisecond display.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Audio can require interaction
              </div>
              <p className="mt-1 leading-relaxed">
                Some browsers block audio until you interact with the page. If
                you do not hear alarms, click anywhere on the page and confirm
                the tab is not muted.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
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
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">
            Need a different mode?
          </span>{" "}
          For one simple countdown use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . For a big single display use{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . For structured intervals use{" "}
          <Link
            to="/round-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Round Timer
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
