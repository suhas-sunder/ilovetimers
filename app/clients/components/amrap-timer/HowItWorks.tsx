import React from "react";

/* ---------- Small helper: JSON-LD script ---------- */
export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* =========================================================
   1) HOW IT WORKS (trust + SEO + user intent)
   Notes:
   - Uses only your real routes (no hash anchors).
   - Scenario-based with concrete numbers.
   - Written to be unique to /amrap-timer (not generic timer copy).
   - Clear limitations without turning into a blog post.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/amrap-timer",
  baseUrl = "https://www.ilovetimers.com",
}: {
  canonicalUrl?: string;
  baseUrl?: string;
}) {
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use an AMRAP timer (countdown + rounds and reps score)",
    description:
      "Use an AMRAP timer to run a time cap with optional prep countdown, then track rounds and reps with large tap buttons or keyboard shortcuts. Includes fullscreen mode for coaching and gym visibility.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose the AMRAP length and optional prep",
        text: "Pick a preset minute cap (8, 10, 12, 15, 20, etc.) and set an optional prep countdown so you can get positioned before the work starts.",
      },
      {
        "@type": "HowToStep",
        name: "Start the timer and keep it visible",
        text: "Press Start (or Space). Use fullscreen for a large display that’s easy to see across the room. Keep the tab visible for the smoothest updates.",
      },
      {
        "@type": "HowToStep",
        name: "Track rounds and reps as you go",
        text: "Use the tap controls or shortcuts (+/− reps and ↑/↓ rounds). Your score is displayed as rounds + reps.",
      },
      {
        "@type": "HowToStep",
        name: "Finish, reset, and run the next piece",
        text: "When time hits zero, reset for the next heat or adjust the cap. You can also pause/resume mid-session if you need to stop the clock.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
      {children}
    </kbd>
  );

  const PillLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {children} →
    </a>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-sky-700">How it works</h2>
            <p className="mt-2 max-w-3xl text-slate-700 leading-relaxed">
              This AMRAP timer is built for the most common “time cap + score”
              workflow: you set a single time cap (like 10 or 12 minutes), start
              a clean countdown, and track your result as{" "}
              <strong>rounds</strong> and <strong>reps</strong>. It is not
              trying to be a workout log or a training app. The goal is a fast
              setup, a big readable display (especially in fullscreen), and
              score controls you can hit quickly without fighting the UI.
            </p>
            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              If your workout is “as many rounds as possible in 12 minutes,”
              this page matches that exactly. If your workout is “work/rest
              rounds that advance automatically,” you will have a better time
              with an interval tool like the{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/hiit-timer")}
              >
                HIIT Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/tabata-timer")}
              >
                Tabata Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Optional prep
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Manual score
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Keyboard
            </span>
          </div>
        </div>

        {/* What you do here (AMRAP-specific) */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              The AMRAP flow in 20 seconds
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Choose
                your time cap (for example <strong>12 minutes</strong>), and set
                an optional prep countdown (for example{" "}
                <strong>10 seconds</strong>).
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Press{" "}
                <strong>Start</strong> (or <Kbd>Space</Kbd>). Prep runs first,
                then the AMRAP starts automatically.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Track
                your score. Tap +/− for reps and ↑/↓ for rounds, or use the big
                buttons under the timer.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> When it
                hits zero, you have a clear result like “
                <strong>6 rounds + 14 reps</strong>.”
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Why score is manual (and why that’s a good thing)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                AMRAPs vary. Some workouts count a “round” as a full circuit,
                others have partial rounds, and some are “reps only.” Automatic
                counting usually fails in the real world. Manual scoring keeps
                the timer useful whether you are doing thrusters, burpees, a
                rowing calorie target, or a mixed-movement ladder.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              What this page is (and isn’t)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                <span className="font-semibold text-slate-900">Is:</span> a
                time-cap countdown with optional prep and a simple rounds/reps
                score.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Is:</span>{" "}
                fullscreen-friendly for coaching or gym visibility.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Is not:</span> a
                workout tracker, PR journal, or program library.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Is not:</span> a
                guaranteed system alarm if you close the tab or lock your phone.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Rule:</span> if you
              need it to alert you while you are away from the screen, do not
              rely on any website timer.
            </div>
          </div>
        </div>

        {/* Quick matching links */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (only when they match the job)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                If you meant “time cap + score,” stay here. If you meant
                intervals that auto-advance, use one of these.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> start/pause • <Kbd>R</Kbd> reset all •{" "}
              <Kbd>F</Kbd> fullscreen • <Kbd>+</Kbd>/<Kbd>−</Kbd> reps •{" "}
              <Kbd>↑</Kbd>/<Kbd>↓</Kbd> rounds
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/emom-timer")}>EMOM Timer</PillLink>
            <PillLink href={abs("/round-timer")}>Round Timer</PillLink>
            <PillLink href={abs("/hiit-timer")}>HIIT Timer</PillLink>
            <PillLink href={abs("/tabata-timer")}>Tabata Timer</PillLink>
            <PillLink href={abs("/workout-timer")}>Workout Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
          </div>
        </div>

        {/* Scenarios (800–1200 words total across section) */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            Real AMRAP scenarios (with numbers you will actually see)
          </h3>
          <p className="mt-2 text-slate-700 leading-relaxed">
            The point of AMRAP timing is clarity: everyone knows the time cap,
            and your result is a simple score. Below are realistic setups with
            the kind of numbers people end up recording on a whiteboard or in a
            notes app. Use these as templates and adjust the minutes to match
            your workout.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Scenario 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    12-minute gym AMRAP with a 10-second prep
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Use case: one person or a class rotating in heats
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  12:00
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                You set <strong>12 minutes</strong> and{" "}
                <strong>10 seconds</strong> prep. When you hit Start, you get
                ten seconds to chalk up, step to the start position, or get your
                partner ready to count. After prep, the timer flips into the
                AMRAP automatically.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                A realistic outcome might be something like{" "}
                <strong>6 rounds + 14 reps</strong>. That means you completed
                six full rounds and then 14 reps into the next round before time
                expired. If you are counting for someone else, the tap controls
                matter. You can keep one hand on a clicker, or use the keyboard:
                <Kbd>↑</Kbd> when they finish a round and <Kbd>+</Kbd> for reps.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Coaching detail: put it in fullscreen on a tablet or laptop so
                athletes can glance up and see the remaining time without
                crowding around a phone.
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    10-minute “reps only” finisher
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Use case: conditioning where rounds do not matter
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  10:00
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Some AMRAPs score as total reps. For example, 10 minutes of
                shuttle runs or a single movement where you do not care about a
                “round.” Set <strong>10 minutes</strong>, keep rounds at{" "}
                <strong>0</strong>, and only tap reps.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                What you will see at the end is something clean like{" "}
                <strong>0 rounds + 132 reps</strong>. That is not a bug. It is a
                simple way to keep one display format for all workouts while
                still letting you score “reps only.”
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                If you want a quieter end, disable Final beeps. If you want a
                countdown cue, leave Final beeps on so the last five seconds are
                obvious.
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Partner AMRAP: 16 minutes, swapping every minute
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Use case: two people, same time cap, shared scoring
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  16:00
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                A common partner format is “swap every minute” but still score
                as a single total. You set the overall time cap to{" "}
                <strong>16 minutes</strong>. The timer does not force swaps; it
                just gives you the time cap. You handle the swaps on your own
                (for example, swapping on the minute using a wall clock).
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                At the end you might record something like{" "}
                <strong>8 rounds + 3 reps</strong>. The advantage of this page
                is that scoring stays in one place while the time cap stays
                obvious. If you actually want the swap to be built-in, that is
                when an interval timer makes more sense. Use{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  href={abs("/emom-timer")}
                >
                  EMOM Timer
                </a>{" "}
                for minute-by-minute structure.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/emom-timer")}>
                  Use EMOM for swaps
                </PillLink>
                <PillLink href={abs("/round-timer")}>
                  Round Timer for phases
                </PillLink>
              </div>
            </div>

            {/* Scenario 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Home setup: casting to a TV for a garage workout
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Use case: big display, hands-free visibility
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  Fullscreen
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                If you cast or mirror a laptop to a TV, the difference between a
                usable timer and an annoying one is readability. Put this page
                in fullscreen and start your time cap (say{" "}
                <strong>15 minutes</strong>). You should be able to see the
                clock from across the room. If you are also using beeps, confirm
                the audio output device before you start. It is common for sound
                to route to Bluetooth earbuds instead of the TV.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                A realistic flow is a warm-up on another timer, then the AMRAP
                cap in fullscreen. For a warm-up, you might use a{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  href={abs("/countdown-timer")}
                >
                  Countdown Timer
                </a>{" "}
                set to <strong>05:00</strong>, then switch to this AMRAP cap.
                Your end result might read <strong>7 rounds + 9 reps</strong>,
                and you can screenshot it if you want a quick record.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Reliability note: background throttling is real. Once you start,
                avoid swapping apps on a phone. A visible fullscreen tab is the
                smoothest experience.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-sky-700">
              Accuracy in a browser (what “jumping” means)
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              This timer stays aligned by targeting an end time and
              recalculating what remains. That is why it can look “jumpier” than
              a native app if you background the tab. Here is a concrete
              example: you start a <strong>12:00</strong> AMRAP and switch away
              for <strong>45 seconds</strong>. When you return, you should
              expect to see something close to <strong>11:15</strong> remaining,
              even if the on-screen display did not tick every second while you
              were away. That is not lost time; that is the timer catching up to
              real time.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              If smooth updates matter (coaching a class, pacing effort, or
              timing a swap), keep the tab visible and use fullscreen. If you
              need an “it will ring even when the phone is locked” guarantee, a
              website timer is the wrong tool.
            </p>
          </div>
        </div>

        {/* Reliability + privacy */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-sky-700">
            Reliability and privacy (quick and practical)
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Make sound predictable
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Tap/click the page once before you start.</li>
                <li>Check device volume and mute settings.</li>
                <li>Confirm the output device (Bluetooth, TV, speakers).</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Avoid background surprises
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Keep the timer visible when possible.</li>
                <li>Fullscreen is best for across-the-room visibility.</li>
                <li>Do not close the tab if you still need it running.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Keyboard basics
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Click the timer card once to focus it, then use <Kbd>Space</Kbd>{" "}
                to start/pause, <Kbd>R</Kbd> to reset all, <Kbd>F</Kbd> for
                fullscreen, <Kbd>+</Kbd>/<Kbd>−</Kbd> for reps, and <Kbd>↑</Kbd>
                /<Kbd>↓</Kbd> for rounds.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Privacy
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                The AMRAP timer runs locally in your browser tab. No account is
                required, and you do not need to enter personal information to
                use the timer or score controls.
              </p>
            </div>
          </div>

          {/* Technical / implementation notes should be expandable */}
          <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  Technical notes (why sound can be blocked, why the display can
                  jump)
                </div>
                <div className="mt-1 text-xs font-medium text-slate-600">
                  Read this if you are coaching or relying on beeps
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                ▼
              </span>
            </summary>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
                  Background throttling
                </div>
                <p className="mt-1 leading-relaxed">
                  Browsers reduce timer and animation frequency in background
                  tabs. A timer can stay accurate by comparing “now” to a stored
                  end time, but the UI will not repaint every second while
                  throttled. When you return, the display updates to the correct
                  remaining time, which can look like a jump.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
                  Audio gesture requirements
                </div>
                <p className="mt-1 leading-relaxed">
                  Many browsers require a user gesture before playing audio.
                  That is why you may need to click/tap the page (or press
                  Start) once before beeps will play reliably. This is a browser
                  policy, not a setting on the timer.
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">If you want intervals:</strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/hiit-timer")}
            >
              HIIT Timer
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/tabata-timer")}
            >
              Tabata
            </a>{" "}
            when you want work/rest phases to auto-advance.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">If you want big digits:</strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/fullscreen-timer")}
            >
              Fullscreen Timer
            </a>{" "}
            for the cleanest across-the-room view.
          </div>
        </div>
      </div>
    </section>
  );
}
