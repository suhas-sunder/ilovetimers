// app/clients/components/pace-timer/HowItWorks.tsx
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
   HOW IT WORKS (Pace Timer)
   Goal: user-intent first, SEO-friendly, unique, practical
   Target: 800 to 1200 words of real help + examples
========================================================= */
export default function HowItWorks({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const pageUrl = `${baseUrl}/pace-timer`;

  // Helpful, non-spam schema for the section itself (unique to this tool)
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use a pace timer for running and rowing",
    description:
      "Use Pace Timer to train at a steady pace. Set running pace (min/km or min/mi) or rowing split (/500m), or enter a finish time to calculate the pace. Includes interval beeps, fullscreen display, and keyboard shortcuts.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick Running or Rowing and set distance",
        text: "Choose Running (km or mi) or Rowing (meters), then enter your total distance for the session.",
      },
      {
        "@type": "HowToStep",
        name: "Enter target pace or finish time",
        text: "Use Target pace when you already know the pace you want. Use Finish time to enter a goal time and have the tool compute the needed pace for your distance.",
      },
      {
        "@type": "HowToStep",
        name: "Start the countdown and follow the pacing cues",
        text: "Press Start or Space. The display shows remaining time and a live “should be at” distance estimate based on your target pace.",
      },
      {
        "@type": "HowToStep",
        name: "Enable interval beeps if desired",
        text: "Turn Sound on, then set Beep every to get cues every X km/mi (running) or every X × 500m (rowing). Adjust Volume and use Test beep to verify audio.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for a big display",
        text: "Click Fullscreen or press F after focusing the card. Fullscreen shows large digits and a subtitle with target pace and total distance.",
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
            Pace Timer is a practical pacing tool for steady efforts. You set a
            distance and a target pace (or a finish time), then follow a clear
            countdown that stays readable on any device. Optional interval beeps
            help you check your splits without constantly looking at the screen.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="leading-relaxed">
              This page is built for one common problem: you know the effort you
              want (a pace or split), but it is annoying to keep doing the math
              during a run or a rowing piece. Pace Timer turns your inputs into
              a single target countdown and shows two helpful references on the
              display: your finish time target and a live “should be at”
              distance estimate based on elapsed time.
            </p>
            <p className="mt-3 leading-relaxed">
              You can use it in two ways. If you already know the pace you want
              to hold, enter Target pace. If you have a goal finish time, switch
              to Finish time and let the tool compute the pace you need for the
              selected distance. Both approaches produce the same end result: a
              countdown to your target finish with clear units (min/km, min/mi,
              or /500m) and optional beep reminders.
            </p>
            <p className="mt-3 leading-relaxed">
              Running mode supports km or miles. Rowing mode uses meters and a
              standard split per 500m. Fullscreen mode is available when you
              want large digits and minimal distractions, such as a treadmill, a
              rowing machine display shelf, or a shared screen during training.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                1) Choose mode
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Pick{" "}
                <span className="font-semibold text-slate-900">Running</span>{" "}
                for min/km or min/mi, or{" "}
                <span className="font-semibold text-slate-900">Rowing</span> for
                /500m split.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                2) Set distance
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Running uses km or mi. Rowing uses meters. The finish time is
                calculated from distance and pace (or directly from finish
                time).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                3) Pace or finish time
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Enter a target pace like{" "}
                <span className="font-semibold text-slate-900">5:00</span> /km
                or <span className="font-semibold text-slate-900">2:10</span>{" "}
                /500m, or enter a finish time like{" "}
                <span className="font-semibold text-slate-900">52:00</span>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                4) Beeps + fullscreen
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Turn Sound on for interval cues, then use Fullscreen for a big,
                glanceable display.
              </p>
            </div>
          </div>
        </div>

        {/* Examples with real numbers users see */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-sky-700">
            Examples with real numbers
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These scenarios are written to match what you will actually type and
            what the timer will show. Copy them directly to confirm your setup.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Running: pace-based */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario A: 5K steady run at 5:00 per km
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You want a clean 5K at a steady pace with a split reminder every
                kilometer.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Inputs
                  </div>
                  <div className="mt-1 text-slate-700">
                    Mode:{" "}
                    <span className="font-semibold text-slate-900">
                      Running
                    </span>{" "}
                    (km). Distance:{" "}
                    <span className="font-semibold text-slate-900">5</span>.
                    Target pace:{" "}
                    <span className="font-semibold text-slate-900">5:00</span>{" "}
                    /km.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you will see
                  </div>
                  <div className="mt-1 text-slate-700">
                    Finish shows{" "}
                    <span className="font-semibold text-slate-900">25:00</span>.
                    If you start and run for 12 minutes 30 seconds, the “should
                    be at” line will read about{" "}
                    <span className="font-semibold text-slate-900">2.50km</span>
                    .
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Beeps
                  </div>
                  <div className="mt-1 text-slate-700">
                    Turn Sound on. Set Beep every{" "}
                    <span className="font-semibold text-slate-900">1</span> km
                    to get a cue at 1K, 2K, 3K, and 4K.
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                If you want structured work and rest intervals instead of a
                steady pace countdown,{" "}
                <Link
                  to="/hiit-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  HIIT Timer
                </Link>{" "}
                is the better match.
              </div>
            </div>

            {/* Rowing: split-based */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario B: 2000m rowing piece at 2:10 per 500m
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You want a 2K with a consistent split and a reminder every 500m.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Inputs
                  </div>
                  <div className="mt-1 text-slate-700">
                    Mode:{" "}
                    <span className="font-semibold text-slate-900">Rowing</span>
                    . Distance:{" "}
                    <span className="font-semibold text-slate-900">2000</span>m.
                    Target pace:{" "}
                    <span className="font-semibold text-slate-900">2:10</span>{" "}
                    /500m.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you will see
                  </div>
                  <div className="mt-1 text-slate-700">
                    Finish shows{" "}
                    <span className="font-semibold text-slate-900">8:40</span>.
                    At 4:20 elapsed, “should be at” will be about{" "}
                    <span className="font-semibold text-slate-900">1000m</span>.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Beeps
                  </div>
                  <div className="mt-1 text-slate-700">
                    Set Beep every{" "}
                    <span className="font-semibold text-slate-900">1</span> to
                    cue each 500m. Set it to{" "}
                    <span className="font-semibold text-slate-900">2</span> to
                    cue every 1000m instead.
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                For repeating on/off intervals (not steady split), try{" "}
                <Link
                  to="/tabata-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Tabata Timer
                </Link>{" "}
                or{" "}
                <Link
                  to="/round-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Round Timer
                </Link>
                .
              </div>
            </div>

            {/* Finish time to pace: running */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario C: 10K goal time of 52:00 (pace calculated for you)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You care about the finish time more than the pace. You want the
                tool to compute the required pace and then guide the effort.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Inputs
                  </div>
                  <div className="mt-1 text-slate-700">
                    Mode:{" "}
                    <span className="font-semibold text-slate-900">
                      Running
                    </span>{" "}
                    (km). Distance:{" "}
                    <span className="font-semibold text-slate-900">10</span>.
                    Switch Input to{" "}
                    <span className="font-semibold text-slate-900">
                      Finish time
                    </span>
                    . Enter{" "}
                    <span className="font-semibold text-slate-900">52:00</span>.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you will see
                  </div>
                  <div className="mt-1 text-slate-700">
                    Target pace becomes about{" "}
                    <span className="font-semibold text-slate-900">5:12</span>{" "}
                    /km (52 minutes divided by 10 km). With Sound on and Beep
                    every 1 km, you get a cue each kilometer to check whether
                    you are still on target.
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                If you want a simple countdown with no pace math, use{" "}
                <Link
                  to="/countdown-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Countdown Timer
                </Link>
                .
              </div>
            </div>

            {/* Miles: finish time to pace */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario D: 3.1 miles in 27:00 (mile pace computed)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You are working in miles and want a simple target for a short
                time trial style effort.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Inputs
                  </div>
                  <div className="mt-1 text-slate-700">
                    Mode:{" "}
                    <span className="font-semibold text-slate-900">
                      Running
                    </span>{" "}
                    (mi). Distance:{" "}
                    <span className="font-semibold text-slate-900">3.1</span>.
                    Input:{" "}
                    <span className="font-semibold text-slate-900">
                      Finish time
                    </span>{" "}
                    set to{" "}
                    <span className="font-semibold text-slate-900">27:00</span>.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you will see
                  </div>
                  <div className="mt-1 text-slate-700">
                    Target pace becomes about{" "}
                    <span className="font-semibold text-slate-900">8:42</span>{" "}
                    /mi (27 minutes divided by 3.1 miles). If you set Beep every{" "}
                    <span className="font-semibold text-slate-900">0.5</span>,
                    you will get reminders every half mile.
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Want the biggest digits possible? Use{" "}
                <Link
                  to="/fullscreen-timer"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Fullscreen Timer
                </Link>{" "}
                when you only need a big clock.
              </div>
            </div>
          </div>
        </div>

        {/* Practical clarifications */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-700">
            Details that prevent common mistakes
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Pick the right unit first
              </div>
              <p className="mt-2 leading-relaxed">
                Running pace is tied to km or miles. If you switch km to mi, the
                meaning of “5:00” changes. Set your unit first, then enter the
                pace you intend to train. For rowing, pace is always per 500m.
              </p>
              <p className="mt-2 leading-relaxed">
                If the Finish number looks wrong, double-check distance and unit
                before changing the pace.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Beep every is distance-based
              </div>
              <p className="mt-2 leading-relaxed">
                Beep every is not time-based. It cues by distance progress. For
                running, it is in km or miles. For rowing, it is in 500m
                multiples. If you want more frequent checks, use 0.5 (half a km
                or half a mile), or 0.25 for quarter units.
              </p>
              <p className="mt-2 leading-relaxed">
                If you prefer zero audio, turn Sound off and rely on the
                display.
              </p>
            </div>
          </div>
        </div>

        {/* Technical content stays expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (timing accuracy, audio, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional troubleshooting and behavior details
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Countdown timing behavior
              </div>
              <p className="mt-1 leading-relaxed">
                The timer runs from a real end time while active. This usually
                keeps it accurate across normal tab switches and brief pauses in
                rendering. If your device enters an aggressive power-saving
                mode, the animation may look less smooth, but remaining time is
                still computed from the end time.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Audio may require interaction
              </div>
              <p className="mt-1 leading-relaxed">
                Some browsers block audio until you interact with the page. If
                Test beep does nothing, click Start once with Sound enabled,
                confirm the tab is not muted, and verify device volume.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Some devices require
                a direct click to enter fullscreen, and Esc exits fullscreen on
                desktop. Fullscreen is designed for readability and minimal UI.
                If you want a pure big-clock page without pace features, use the
                dedicated fullscreen timer.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                “Should be at” is guidance
              </div>
              <p className="mt-1 leading-relaxed">
                The “should be at” value is calculated from elapsed time and
                your target pace. It is intended as an on-screen pacing
                reference, not a replacement for GPS, erg metrics, or official
                split data. If you pause, the estimate pauses with you because
                elapsed time pauses.
              </p>
            </div>
          </div>
        </details>

        {/* Footer helper links, on-intent */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">
            Need a different tool?
          </span>{" "}
          For structured intervals use{" "}
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
          . For a pure big clock use{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . For multiple stations at once use{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
