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
   - Scenario-based with concrete examples for /break-timer.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/break-timer",
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
    name: "How to use Break Timer (fullscreen countdown + quick presets)",
    description:
      "Run a simple break countdown with quick presets or custom minutes. Use fullscreen for a big display, optional sound and final beeps, loop mode for repeated breaks, and keyboard shortcuts to control the timer fast.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a break length",
        text: "Pick a preset (1–20 minutes) or enter custom minutes. The timer will reset to the selected duration.",
      },
      {
        "@type": "HowToStep",
        name: "Start and pause",
        text: "Press Space (or click Start) to begin. Press Space again to pause and resume later without losing remaining time.",
      },
      {
        "@type": "HowToStep",
        name: "Use sound cues if you want to walk away",
        text: "Enable Sound for an end chime. Enable Final beeps for a short beep once per second in the last 5 seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen for a big display",
        text: "Press F to toggle fullscreen and Esc to exit. In fullscreen, you can also tap/click the time display to start or pause.",
      },
      {
        "@type": "HowToStep",
        name: "Repeat breaks with Loop",
        text: "Enable Loop to auto-restart the same break length when it hits zero.",
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

  const ExampleBlock = ({
    title,
    subtitle,
    lines,
  }: {
    title: string;
    subtitle?: string;
    lines: string[];
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
      ) : null}
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="font-mono text-xs whitespace-pre-wrap text-slate-800">
          {lines.join("\n")}
        </div>
      </div>
    </div>
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
              Break Timer is a simple fullscreen countdown built for one job:
              help you take a real break and return on time. Pick a preset or
              type minutes, press Space to start, and let the page handle the
              rest. If you want to walk away from the screen, enable sound cues
              and the last-seconds beeps so you don’t have to keep checking the
              time.
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              This page is not a productivity lecture and it’s not trying to
              push a “system.” It’s a clean break countdown with quick controls,
              fullscreen visibility, and straightforward shortcuts. If you want
              a structured work+break routine, use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/pomodoro-timer")}
              >
                Pomodoro Timer
              </a>
              . If you want a general purpose countdown, use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/countdown-timer")}
              >
                Countdown Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/online-timer")}
              >
                Online Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Quick presets
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Custom minutes
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Sound + final beeps
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Loop mode
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Shortcuts
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fast start (what most people want)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Choose
                a break length using a preset (1–20 minutes) or type a custom
                value.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Press{" "}
                <Kbd>Space</Kbd> or click <span className="font-semibold">Start</span>{" "}
                to begin. Press <Kbd>Space</Kbd> again to pause/resume.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> If you
                want a cue at the end, enable{" "}
                <span className="font-semibold text-slate-900">Sound</span>.
                Turn on <span className="font-semibold text-slate-900">Final beeps</span>{" "}
                for the last 5 seconds.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> For
                distance viewing, press <Kbd>F</Kbd> for fullscreen. Press{" "}
                <Kbd>Esc</Kbd> to exit.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> If you
                want repeated breaks, enable{" "}
                <span className="font-semibold text-slate-900">Loop</span>{" "}
                (<Kbd>L</Kbd>).
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What “Sound”, “Final beeps”, and “Loop” actually do
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Sound</span>{" "}
                controls whether the timer plays an end chime when it reaches
                zero. If Sound is off, the timer stays silent.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Final beeps</span>{" "}
                adds a short beep once per second during the last 5 seconds. It
                is disabled when Sound is off.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Loop</span>{" "}
                restarts the same break length immediately when the countdown
                hits zero. Turn Loop off if you want the timer to stop at the
                end.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Pick a duration that matches your break type
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                <span className="font-semibold">1–3 minutes</span>: quick reset,
                water, stand up, eyes off screen.
              </li>
              <li>
                <span className="font-semibold">5 minutes</span>: a clean break
                between work blocks.
              </li>
              <li>
                <span className="font-semibold">10–15 minutes</span>: longer
                reset after multiple blocks.
              </li>
              <li>
                <span className="font-semibold">20 minutes</span>: walk/meal
                prep or a full “step away” break.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Practical tip:
              </span>{" "}
              If you want a real break (not “stare at the countdown”), enable{" "}
              <span className="font-semibold">Sound</span> and{" "}
              <span className="font-semibold">Final beeps</span>, then walk away.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you’ll see while the break runs
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            The big display is the remaining time. When you start, the timer
            counts down to zero and updates smoothly. If you pause, the display
            holds the remaining time so you can resume later without guessing
            what’s left. When it hits zero, the timer either stops (normal) or
            restarts (Loop on).
          </p>

          <p className="mt-3 text-slate-700 leading-relaxed">
            In fullscreen, the page stays focused on readability. You get quick
            controls in the top and bottom bars, and you can tap/click the time
            display to start or pause without aiming for small buttons. This is
            useful on a second monitor, across the room, or on a phone when you
            want a simple “break ends when this hits zero” view.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Real scenarios (how people actually use a break countdown)
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            These examples are practical. They show when presets are enough,
            when custom minutes helps, and when Loop + sound cues are the right
            combo.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: A quick 3-minute reset"
              subtitle="Stand up, water, eyes off screen"
              lines={[
                "Set: 3m (preset)",
                "Start: Space",
                "",
                "Recommended toggles:",
                "- Sound: On (so you can walk away)",
                "- Final beeps: On (last 5 seconds)",
                "- Loop: Off",
                "",
                "Why:",
                "You want a clean stop at zero so you immediately return to the task.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: A 10–15 minute longer break after deep work"
              subtitle="Use fullscreen so you’re not babysitting the timer"
              lines={[
                "Set: 15m (preset) or custom minutes",
                "Start: Space",
                "Fullscreen: F",
                "",
                "Recommended toggles:",
                "- Sound: On",
                "- Final beeps: Optional (helpful if you drift)",
                "- Loop: Off",
                "",
                "Why:",
                "It’s a “be back in 15” break. Fullscreen makes it glanceable.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Repeating micro-breaks with Loop"
              subtitle="Quick stretch or posture reset every 2 minutes"
              lines={[
                "Set: 2m (preset)",
                "Loop: On (L)",
                "Start: Space",
                "",
                "Recommended toggles:",
                "- Sound: On",
                "- Final beeps: On",
                "",
                "Why:",
                "Loop repeats automatically so you don’t restart the timer every cycle.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Pausing a break (you got interrupted)"
              subtitle="Pause without losing remaining time"
              lines={[
                "You start a 5m break.",
                "At 2:10 remaining, you need to pause.",
                "",
                "Action:",
                "- Press Space to pause.",
                "- Press Space again to resume when ready.",
                "",
                "If you need a full restart:",
                "- Press R (or click Reset) to return to 5:00.",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (use it like a tool, not a page)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              The quickest workflow is: pick minutes, press Space, and walk away
              if you turned on sound cues. Fullscreen is there for readability,
              not extra features. Shortcuts exist so you can operate the timer
              without hunting for controls.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Space</Kbd> start/pause
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>R</Kbd> reset
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>S</Kbd> sound
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>L</Kbd> loop
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Focus tip:</span>{" "}
              If shortcuts don’t respond, click the timer card once so it has
              keyboard focus. Shortcuts won’t fire while your cursor is in the
              minutes input.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same intent, different behavior)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Use Break Timer for one-off breaks. Use a structured routine
                timer when you want repeating work+break sessions, or multiple
                timers when you need parallel countdowns.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>S</Kbd>{" "}
              <Kbd>L</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/pomodoro-timer")}>Pomodoro Timer</PillLink>
            <PillLink href={abs("/study-timer")}>Study Timer</PillLink>
            <PillLink href={abs("/focus-session-timer")}>
              Focus Session Timer
            </PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>Fullscreen Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (countdown timing, beeps, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                How timing is computed and what can affect it in browsers
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timer model</div>
              <p className="mt-1 leading-relaxed">
                The timer sets a target end timestamp and computes remaining
                time as <span className="font-semibold text-slate-900">end - now</span>.
                The UI updates with requestAnimationFrame so the display stays
                smooth.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Sound cues</div>
              <p className="mt-1 leading-relaxed">
                Sound uses WebAudio for simple beeps. Final beeps trigger once
                per second in the last 5 seconds, then a short two-tone chime
                plays at zero.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the timer card.
                Some browsers require a user gesture (click/tap) before
                fullscreen or audio can start.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may throttle timers in background tabs or low-power
                states. When you return, the timer will typically “catch up” to
                the correct remaining time, but the on-screen updates may look
                less smooth while throttled.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Wake lock</div>
              <p className="mt-1 leading-relaxed">
                This page does not request a screen wake lock. If your device
                sleeps, the countdown may pause or be delayed depending on your
                browser and power settings.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Want a routine timer?</strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/pomodoro-timer")}
            >
              Pomodoro Timer
            </a>{" "}
            for repeating work/break cycles.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need parallel breaks?</strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            when you need more than one countdown running at once.
          </div>
        </div>
      </div>
    </section>
  );
}