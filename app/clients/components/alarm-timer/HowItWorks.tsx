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
   - Clear limitations without turning into a blog post.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/online-timer",
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
    name: "How to use an online timer (countdown, alarm, stopwatch, Pomodoro, HIIT)",
    description:
      "Run a countdown timer, alarm timer, stopwatch with laps, Pomodoro focus timer, or HIIT interval timer in your browser. Includes fullscreen display and keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick the timer that matches your situation",
        text: "Use Countdown for a clean on-screen countdown, Alarm Timer for a repeating sound at zero, Stopwatch for open-ended timing with laps, Pomodoro for work/break cycles, or HIIT for interval workouts.",
      },
      {
        "@type": "HowToStep",
        name: "Set the time or structure",
        text: "Choose a preset or enter a custom duration. For Pomodoro and HIIT, set work/rest lengths and rounds so phases run automatically.",
      },
      {
        "@type": "HowToStep",
        name: "Start and control it quickly",
        text: "Use Start/Pause and Reset, or click the card once and use keyboard shortcuts. Fullscreen is ideal for projectors, TVs, and across-the-room visibility.",
      },
      {
        "@type": "HowToStep",
        name: "Finish, stop sound, repeat",
        text: "When the timer hits zero, stop the alarm if enabled, reset back to the chosen duration, or change settings for the next round.",
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
              These tools are designed for one job: start a timer fast, keep it
              easy to read, and keep it predictable while the page stays open.
              If you are timing a meeting segment, a study block, a cooking
              step, or interval rounds, you should not need an account or a
              “setup flow.” You pick a timer, set a duration, press Start, and
              you are done.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Runs locally
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen ready
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Keyboard control
            </span>
          </div>
        </div>

        {/* What to expect */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              What “accurate in a browser” means
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The timers track elapsed time using high-resolution timestamps.
              That matters because browsers do not treat background tabs the
              same way they treat visible tabs. When a tab is hidden (or your
              device is conserving power), visual updates and JavaScript timers
              can run less frequently. Instead of drifting, these timers
              recalculate remaining time based on how much time actually passed.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              What you might notice: if you switch tabs for 45 seconds, then
              come back, the display may jump forward by about 45 seconds. That
              is expected. The timer is aligning itself to real time rather than
              trying to animate every single second while the browser is
              throttling.
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                The easiest way to keep it smooth
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Keep the timer visible when timing matters.</li>
                <li>
                  Use fullscreen for classrooms, meetings, or TV/projector use.
                </li>
                <li>
                  Tap/click once before starting if you want sound to work
                  reliably.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Important limitation (no system alarm)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              These are browser timers, not your phone’s alarm app. If you close
              the tab, the browser suspends, or audio is blocked, the timer
              cannot guarantee a notification. If you need a guaranteed alert
              (wake-up, safety, medication), use your device’s built-in alarm.
              For everything else where you are near the screen, this is a
              strong, practical solution.
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Rule of thumb:
              </span>{" "}
              if you need it to ring while you are away from the browser, do not
              rely on any website timer.
            </div>
          </div>
        </div>

        {/* Quick matching links */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Pick the right timer fast
              </div>
              <p className="mt-1 text-sm text-slate-700">
                These links go to dedicated pages (no directories, no fluff).
                Choose the one that matches your task.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> start/pause • <Kbd>R</Kbd> reset •{" "}
              <Kbd>F</Kbd> fullscreen
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/alarm-timer")}>Alarm Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/pomodoro-timer")}>Pomodoro</PillLink>
            <PillLink href={abs("/hiit-timer")}>HIIT Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
          </div>
        </div>

        {/* Scenarios */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            Scenarios with real numbers (what you will actually experience)
          </h3>
          <p className="mt-2 text-slate-700 leading-relaxed">
            These are common, practical setups with the exact durations people
            use. Each example also tells you what can go wrong so you are not
            surprised mid-session.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Cooking: 12-minute pasta, 7-minute rest, 3-minute sauce
                    simmer
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Best fit: Alarm Timer when you are nearby
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  12:00
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Set <strong>12 minutes</strong> for pasta, press Start, and keep
                the tab open on the counter. When it hits zero, the alarm can
                repeat until you stop it, which is useful if you are stirring or
                plating and need a persistent reminder. Then reset to{" "}
                <strong>7 minutes</strong> for resting, then{" "}
                <strong>3 minutes</strong> for a quick simmer.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Practical detail: some browsers block audio until you tap the
                page once. Do one quick tap before you start if sound matters.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/alarm-timer")}>Open Alarm Timer</PillLink>
                <PillLink href={abs("/cooking-timer")}>
                  Cooking Timer page
                </PillLink>
              </div>
            </div>

            {/* 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Meetings: 30 minutes split into 10 / 15 / 5
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Best fit: Meeting Timer or Countdown Timer in fullscreen
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  30 min
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                A tight agenda is easier when time is visible to everyone. Run a{" "}
                <strong>10:00</strong> countdown for updates, reset to{" "}
                <strong>15:00</strong> for discussion, then{" "}
                <strong>5:00</strong> for decisions. If one topic needs a brief
                pause, hit <Kbd>Space</Kbd>, answer the question, then resume.
                People stop asking “are we running late?” because the clock is
                right there.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                What you might notice: if you open another tab, the display may
                update less smoothly. Fullscreen and keeping it visible avoids
                that.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/meeting-timer")}>
                  Meeting Timer page
                </PillLink>
                <PillLink href={abs("/countdown-timer")}>
                  Countdown Timer
                </PillLink>
                <PillLink href={abs("/fullscreen-timer")}>
                  Fullscreen Timer
                </PillLink>
              </div>
            </div>

            {/* 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Presentations: 8-minute talk with a 2-minute Q&A buffer
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Best fit: Presentation Timer in fullscreen
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  08:00
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Set an <strong>08:00</strong> countdown and keep it fullscreen
                on a second screen. When it reaches zero, you know you have hit
                your talk limit. Then reset to <strong>02:00</strong> as a
                visible buffer for Q&A. This setup is simple, and it helps you
                end cleanly instead of “just one more slide.”
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                If you are projecting, fullscreen matters more than anything
                else. It keeps the timer readable and avoids accidental
                scrolling.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/presentation-timer")}>
                  Presentation Timer page
                </PillLink>
                <PillLink href={abs("/classroom-timer")}>
                  Classroom Timer page
                </PillLink>
              </div>
            </div>

            {/* 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Study: 25/5 Pomodoro for 2 hours (4 cycles)
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Best fit: Pomodoro Timer for automatic phase switching
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  4 cycles
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Set <strong>25 minutes work</strong> and{" "}
                <strong>5 minutes break</strong>. Over four cycles, you get{" "}
                <strong>100 minutes</strong> of focused work and{" "}
                <strong>20 minutes</strong> of breaks. If you finish a task
                early, do not sit there watching the last 90 seconds. Skip to
                break and keep momentum. The value of Pomodoro is automatic
                structure, not micromanaging seconds.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Tip: if you want quiet focus, pair Pomodoro with a silent setup.
                Turn off sound or use the Silent Timer page depending on what
                you prefer.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/pomodoro-timer")}>
                  Pomodoro Timer
                </PillLink>
                <PillLink href={abs("/study-timer")}>Study Timer page</PillLink>
                <PillLink href={abs("/silent-timer")}>
                  Silent Timer page
                </PillLink>
              </div>
            </div>

            {/* 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Workout: HIIT 3:00 warm-up, 8 × (1:00 work / 0:30 rest),
                    2:00 cool-down
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Best fit: HIIT Timer for hands-free rounds
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  17:00 total
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Configure warm-up <strong>3:00</strong>, rounds{" "}
                <strong>8</strong>, work <strong>1:00</strong>, rest{" "}
                <strong>0:30</strong>, cool-down <strong>2:00</strong>. Total
                time is <strong>17 minutes</strong> (3 + 12 + 2). You will do{" "}
                <strong>8 minutes</strong> of work and{" "}
                <strong>4 minutes</strong> of rest. The key benefit is you do
                not touch the screen between rounds.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                If you are using a phone, consider fullscreen and a stable
                surface. Accidental taps are less likely.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/hiit-timer")}>HIIT Timer</PillLink>
                <PillLink href={abs("/tabata-timer")}>
                  Tabata Timer page
                </PillLink>
                <PillLink href={abs("/workout-timer")}>
                  Workout Timer page
                </PillLink>
              </div>
            </div>

            {/* 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Timing attempts: stopwatch laps for practice splits
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Best fit: Stopwatch with laps
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  Laps
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Start the stopwatch and press Lap at each checkpoint. A
                realistic set of lap times might look like{" "}
                <strong>00:14.2</strong>, <strong>00:13.9</strong>,{" "}
                <strong>00:15.1</strong>, <strong>00:14.6</strong>. This is
                useful for drills, experiments, and repeated attempts where you
                care about consistency more than a single final time.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Shortcut note: click the card once to focus it, then use the lap
                key where supported. If the cursor is in an input field,
                shortcuts will not fire.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
                <PillLink href={abs("/speedcubing-timer")}>
                  Speedcubing Timer page
                </PillLink>
                <PillLink href={abs("/lab-timer")}>Lab Timer page</PillLink>
              </div>
            </div>
          </div>
        </div>

        {/* Reliability + privacy */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-sky-700">
            Reliability and privacy (quick, honest)
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Make sound predictable
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Tap/click the page once before you start.</li>
                <li>Check volume and mute at the device level.</li>
                <li>
                  Confirm the output device (Bluetooth earbuds, TV, speakers).
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Avoid background surprises
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Keep the timer visible when possible.</li>
                <li>
                  Fullscreen is best for classrooms, meetings, and
                  presentations.
                </li>
                <li>Do not close the tab if you still need it running.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Keyboard basics
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Click a timer card once to focus it, then use <Kbd>Space</Kbd>{" "}
                to start/pause, <Kbd>R</Kbd> to reset, and <Kbd>F</Kbd> for
                fullscreen. Tool pages may add extra keys (for example sound
                toggles or skipping phases).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Privacy
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Timers run locally in your browser tab. No account is required.
                You do not need to enter personal data to use any timer, and
                closing the tab ends the session.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              If you want an end alarm:
            </strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/alarm-timer")}
            >
              Alarm Timer
            </a>{" "}
            and make sure audio is allowed before starting.
          </div>
        </div>
      </div>
    </section>
  );
}
