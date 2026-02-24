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
   - Scenario-based with concrete examples for /binary-stopwatch.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/binary-stopwatch",
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
    name: "How to use the Binary Stopwatch (practice mode, countdown, fullscreen)",
    description:
      "Use the Binary Stopwatch as a stopwatch (count up) or a countdown timer (count down). Practice reading binary time with a bit-weight legend, presets, dim mode, fullscreen controls, and an optional soft alarm at zero.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose Stopwatch or Timer mode",
        text: "Use Stopwatch to count up from zero, or Timer to count down from a preset or custom seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset quickly",
        text: "Press Space (or use the Start button) to start/pause, and press R (or Reset) to restart the current mode from its base value.",
      },
      {
        "@type": "HowToStep",
        name: "Use Practice mode to hide the answer",
        text: "Turn on Practice mode to hide the decimal time. Decode the bits first, then Reveal to verify.",
      },
      {
        "@type": "HowToStep",
        name: "Turn on Weights to decode faster",
        text: "Enable Weights to see the row values. Add the weights of lit bits to read Hours, Minutes, and Seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen and adjust visibility",
        text: "Use fullscreen for distance viewing and Dim mode for reduced glare. In fullscreen you can tap/click the display to start/pause.",
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
              This Binary Stopwatch is built for two very practical jobs: timing
              something while reading pure binary, and practicing binary
              decoding without needing a separate worksheet or app. You can run
              it as a stopwatch (count up) or as a countdown timer (count down).
              Either way, the page keeps the display clean, the bits consistent,
              and the controls fast.
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              The tool is intentionally not “binary education content.” It
              exists to help you time real things while using a binary display,
              plus a practice flow that hides the decimal time until you decide
              to reveal it. If you want a standard timer UI, you will probably
              be happier with{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/stopwatch")}
              >
                Stopwatch
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/countdown-timer")}
              >
                Countdown Timer
              </a>
              .
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              If your intent is “show me the current time in binary,” that is a
              different tool. Use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/binary-clock")}
              >
                Binary Clock
              </a>{" "}
              for “now.” This page is about elapsed time and countdowns.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Stopwatch + timer
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Practice mode
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Weights legend
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Dim + fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Optional alarm
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fast start in under 10 seconds
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Choose
                a mode: <strong>Stopwatch</strong> (count up) or{" "}
                <strong>Timer</strong> (count down). Press <Kbd>M</Kbd> to
                switch.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Press{" "}
                <Kbd>Space</Kbd> to start/pause. Press <Kbd>R</Kbd> to reset.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> If you
                are practicing, toggle <strong>Practice</strong> with{" "}
                <Kbd>P</Kbd>, then Reveal with <Kbd>E</Kbd>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Toggle{" "}
                <strong>Weights</strong> with <Kbd>W</Kbd> if you want a
                row-by-row legend.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen and <Kbd>D</Kbd> for dim mode when
                viewing at a distance.
              </li>
              <li>
                <span className="font-semibold text-slate-900">6)</span> In
                Timer mode, choose a preset or enter custom seconds before
                starting.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What the binary grid represents
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                The grid is always pure binary fields, not digit groups. You get
                three columns: Hours, Minutes, Seconds. The top row is the
                largest bit weight. Add the weights of the lit bits to read the
                number for that column.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                The visible decimal time is shown at whole seconds for clarity,
                so the bits and the digits flip cleanly. This page is built to
                be readable first, not a millisecond display.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Mode choice (based on intent)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                Use <span className="font-semibold">Stopwatch</span> when you
                want elapsed time from zero.
              </li>
              <li>
                Use <span className="font-semibold">Timer</span> when you need a
                countdown to zero with an optional alarm.
              </li>
              <li>
                Use <span className="font-semibold">Practice</span> when you
                want to hide the decimal time and self-check.
              </li>
              <li>
                Use <span className="font-semibold">Weights</span> when you want
                decoding to be faster and less error-prone.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Practical tip:
              </span>{" "}
              If you will be reading the display from across a room, use{" "}
              <span className="font-semibold text-slate-900">Fullscreen</span>{" "}
              and keep Weights on. It reduces mistakes when you are decoding
              quickly.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            Reading the bits without guessing
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            Each column is a normal number written in binary. Minutes and
            seconds are always 0–59, so they use 6 bits with weights 32, 16, 8,
            4, 2, 1. Hours can grow much larger during long sessions, so hours
            use 7 bits with weights 64, 32, 16, 8, 4, 2, 1. If Weights is on,
            you see these row values under the grid. If Weights is off, the grid
            stays minimal and you can still decode using the same weights.
          </p>

          <p className="mt-3 text-slate-700 leading-relaxed">
            A good rule in practice mode is: read top to bottom, add only the
            lit rows, then compare to the revealed time. You do not need mental
            conversion tricks. The weights are designed so the sum maps directly
            to the value you expect, like 7 minutes or 42 seconds.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Real scenarios with numbers you will actually see
          </h3>
          <p className="mt-2 text-slate-700 leading-relaxed">
            The examples below are intentionally concrete. They match typical
            usage on this page: a countdown you might set, a stopwatch duration
            you might hit, and a practice run where you decode and confirm.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Timer preset for intervals (7:30 countdown)"
              subtitle="You pick a duration, start it, and read the bits at a glance"
              lines={[
                "Mode: Timer",
                "Preset/Custom: 7 minutes 30 seconds",
                "",
                "Displayed time (decimal): 7:30",
                "",
                "Pure binary fields:",
                "Hours   0 (7 bits):   0000000",
                "Minutes 7 (6 bits):   000111   (4 + 2 + 1)",
                "Seconds 30 (6 bits):  011110   (16 + 8 + 4 + 2)",
                "",
                "Quick decode with weights:",
                "Minutes lit rows: 4, 2, 1 => 7",
                "Seconds lit rows: 16, 8, 4, 2 => 30",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Stopwatch for a lab task (12:45 elapsed)"
              subtitle="You time a process and check the binary against the decimal line"
              lines={[
                "Mode: Stopwatch",
                "Elapsed (decimal): 12:45",
                "",
                "Pure binary fields:",
                "Hours   0 (7 bits):   0000000",
                "Minutes 12 (6 bits):  001100   (8 + 4)",
                "Seconds 45 (6 bits):  101101   (32 + 8 + 4 + 1)",
                "",
                "Quick decode:",
                "Minutes: 8 + 4 = 12",
                "Seconds: 32 + 8 + 4 + 1 = 45",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Practice mode rep (hide time, decode, reveal)"
              subtitle="You want a fast self-check loop"
              lines={[
                "Settings: Practice ON, Weights ON",
                "Action: Hide time, then read the bits",
                "",
                "You decode:",
                "Hours column sums to 0",
                "Minutes column sums to 5  (4 + 1)",
                "Seconds column sums to 42 (32 + 8 + 2)",
                "",
                "Your guess: 0:05:42",
                "Press Reveal, confirm the decimal line matches.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Long session timing (2:03:09 elapsed)"
              subtitle="Hours stay valid for long runs because hours use 7 bits"
              lines={[
                "Mode: Stopwatch",
                "Elapsed (decimal): 2:03:09",
                "",
                "Pure binary fields:",
                "Hours   2 (7 bits):   0000010",
                "Minutes 3 (6 bits):   000011   (2 + 1)",
                "Seconds 9 (6 bits):   001001   (8 + 1)",
                "",
                "Why 7-bit hours matters:",
                "You can go well past 23 hours and still have a correct hour field.",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen, dim mode, and what changes in big-display mode
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen is optimized for distance viewing. Controls remain
              accessible, but the display prioritizes the time line and the
              grid. In fullscreen you can tap/click the main display to start or
              pause, which is useful when you are standing away from the
              keyboard. Dim mode reduces glare without making the bits muddy.
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
                <Kbd>D</Kbd> dim
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>M</Kbd> mode
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>W</Kbd> weights
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>P</Kbd> practice
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>E</Kbd> reveal
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>S</Kbd> sound
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Sound note:</span>{" "}
              Some browsers block audio until you interact with the page. If you
              need a guaranteed silent finish, turn Sound off before starting
              the countdown.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same intent, different display)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                If you want the same timing tasks with a standard interface, or
                a different “encoded” clock style, use these routes.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>D</Kbd>{" "}
              <Kbd>M</Kbd> <Kbd>W</Kbd> <Kbd>P</Kbd> <Kbd>E</Kbd> <Kbd>S</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/count-up-timer")}>Count Up Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
            <PillLink href={abs("/binary-clock")}>Binary Clock</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (bit widths, rounding, sound, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                What the grid represents, how values are shown, and browser
                behavior notes
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Bit widths</div>
              <p className="mt-1 leading-relaxed">
                Minutes and seconds use 6 bits (0–59). Hours use 7 bits so the
                hour column stays valid up to 99 hours.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Display rounding
              </div>
              <p className="mt-1 leading-relaxed">
                The visible decimal time is shown at whole seconds for
                readability. The bits and the decimal line flip cleanly on
                second boundaries.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Timer end</div>
              <p className="mt-1 leading-relaxed">
                Timer mode counts down to zero, stops automatically, and
                triggers the alarm when Sound is enabled. Soft alarm plays a
                short sequence.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Sound behavior</div>
              <p className="mt-1 leading-relaxed">
                Audio is generated in-browser. Some browsers require a user
                gesture before allowing sound. If audio is blocked, the timer
                still completes normally.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the tool card.
                Exit is available via Esc or the Exit control. If fullscreen is
                unavailable due to browser policy, the page continues to work
                normally.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need multiple countdowns?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            when you need several independent timers running at once.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Want a standard UI?</strong> Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/countdown-timer")}
            >
              Countdown Timer
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/stopwatch")}
            >
              Stopwatch
            </a>{" "}
            for plain timing without binary decoding.
          </div>
        </div>
      </div>
    </section>
  );
}
