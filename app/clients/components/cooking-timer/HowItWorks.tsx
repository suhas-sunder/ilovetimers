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
   - Scenario-based with concrete examples for /cooking-timer.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/cooking-timer",
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
    name: "How to use the Cooking Timer (kitchen countdown with egg and common presets)",
    description:
      "Run a clear cooking countdown with egg presets, common presets, custom minutes and seconds, fullscreen mode, optional sound and final beeps, loop mode, and keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a time",
        text: "Pick an egg preset or a common preset, or set custom minutes and seconds for an exact duration.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset",
        text: "Press Space or click Start to begin. Press Space again or click Pause to stop temporarily and resume from the exact remaining time. Use Reset to return to the ready state for the current set time.",
      },
      {
        "@type": "HowToStep",
        name: "Decide on sound cues",
        text: "Enable Sound for an end beep. Optionally enable Final beeps to hear short beeps during the last 5 seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for visibility",
        text: "Toggle fullscreen with F for big readable digits. In fullscreen, tap/click the time display area to start or pause.",
      },
      {
        "@type": "HowToStep",
        name: "Use Loop for repeated intervals",
        text: "Enable Loop (L) if you want the same duration to restart automatically when the timer hits zero.",
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
              Cooking Timer is a kitchen-first countdown built for one job: keep
              time visible and predictable while your hands are busy. You can
              start from an egg preset (Soft 6m, Jammy 7m, Medium 8m, Hard 10m,
              Very hard 12m), choose a common kitchen preset (30 seconds up to
              60 minutes), or set an exact custom duration with minutes and
              seconds. Once it’s running, the display stays clear, the controls
              stay simple, and fullscreen gives you big digits you can read from
              across the room.
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              This page is a timer tool. It does not try to teach cooking
              techniques or give food safety advice. It helps you run a clean,
              reliable countdown so you can focus on the stove, the oven, or the
              prep board. If you want a more specialized page, use the closest
              fit:{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/egg-timer")}
              >
                Egg Timer
              </a>{" "}
              for egg-only timing,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/tea-timer")}
              >
                Tea Timer
              </a>{" "}
              for steeping,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/pizza-timer")}
              >
                Pizza Timer
              </a>{" "}
              for oven-focused pizza timing,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/multiple-timers")}
              >
                Multiple Timers
              </a>{" "}
              when you need several timers running at once, or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/fullscreen-timer")}
              >
                Fullscreen Timer
              </a>{" "}
              if you want a minimal big countdown with fewer presets.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Egg presets
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Common presets
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Minutes + seconds
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Sound
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Final beeps
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Loop
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
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
              Fast start (what most people do in the kitchen)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Pick a{" "}
                <span className="font-semibold text-slate-900">preset</span>{" "}
                (example: Hard 10m) or set{" "}
                <span className="font-semibold text-slate-900">Minutes</span>{" "}
                and{" "}
                <span className="font-semibold text-slate-900">Seconds</span>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Decide
                if you want audio. Turn{" "}
                <span className="font-semibold text-slate-900">Sound</span> on
                for a finish cue. Enable{" "}
                <span className="font-semibold text-slate-900">
                  Final beeps
                </span>{" "}
                if you want a 5-second heads-up.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <Kbd>Space</Kbd> or click{" "}
                <span className="font-semibold">Start</span>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen if you want big digits. In
                fullscreen, tap/click the time display to start/pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> If you
                want the same duration to repeat automatically, toggle{" "}
                <span className="font-semibold text-slate-900">Loop</span> (or
                press <Kbd>L</Kbd>).
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What “Final beeps” changes
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                If{" "}
                <span className="font-semibold text-slate-900">
                  Final beeps
                </span>{" "}
                is on, the timer plays short beeps at roughly 0:05, 0:04, 0:03,
                0:02, and 0:01 (right before the end cue). This is useful when
                you need to move quickly at the finish, like draining pasta,
                pulling something from the oven, or stopping a pan from
                overcooking.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              What kitchen durations feel like (real numbers)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                <span className="font-semibold">30–90 seconds</span>: quick
                reminders (flip, stir, check a pan, quick microwave rests). You
                can hear the finish cue without watching the screen.
              </li>
              <li>
                <span className="font-semibold">3–7 minutes</span>: short boils,
                steaming checks, quick simmer steps. This range is where the
                last 5-second beeps are most noticeable.
              </li>
              <li>
                <span className="font-semibold">8–12 minutes</span>: common
                kitchen “set it and do something else” tasks, including egg
                presets and many short oven checks.
              </li>
              <li>
                <span className="font-semibold">20–60 minutes</span>: longer
                waits (resting, slow simmer segments, timer for “check in 30
                minutes”). Fullscreen helps visibility across the kitchen.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Practical tip:
              </span>{" "}
              If you plan to use sound, start the timer once first. Some
              browsers will not play audio until you’ve clicked or pressed a key
              on the page.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you will see while the timer runs
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            The center of the page is the countdown. It shows either the
            remaining time (when running or paused) or the ready time (when
            stopped). Above it, a short status line tells you what state you’re
            in: Ready, Paused, or Running. This matters in real kitchens because
            “Did I start it?” is a common failure mode when you’re juggling
            multiple steps. If you pause, the timer resumes from the exact
            remaining time. If the timer reaches zero, you get an end cue if
            Sound is enabled, and the timer stops unless Loop is on.
          </p>

          <p className="mt-3 text-slate-700 leading-relaxed">
            While the timer is running, this page intentionally reduces the ways
            you can mess up your setup. The Minutes and Seconds inputs are
            disabled during a run so you don’t bump values by accident. Presets
            remain available when the timer is not running. If you need to
            switch from one task to another, the fastest workflow is to Reset,
            tap a preset, and Start. If you need several different timers
            running simultaneously (for example: rice resting for 10 minutes,
            veggies steaming for 6 minutes, and a 2-minute pan check), use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>
            .
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Real cooking scenarios (with concrete settings and what you
            hear/see)
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            These examples are meant to be copyable setups. They show what you
            would click, what time you’ll see, and what cues you can expect at
            the end. The numbers here are the kinds of durations people actually
            run during everyday cooking, not generic placeholders.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Jammy eggs you can repeat"
              subtitle="Preset timing with a heads-up at the end"
              lines={[
                "Preset: Jammy 7m",
                "Sound: On",
                "Final beeps: On",
                "Loop: Off",
                "Fullscreen: On (phone stand)",
                "",
                "What you experience:",
                "- The display starts at 7:00 and counts down.",
                "- At ~0:05 you hear 5 short warning beeps.",
                "- At 0:00 you hear the end beep.",
                "",
                "Common follow-up:",
                "- If you’re doing a second batch, hit Reset, tap Jammy 7m, Start again.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Pasta drain moment (the last 10 seconds matter)"
              subtitle="Short custom time and a clear finish cue"
              lines={[
                "Minutes: 9",
                "Seconds: 30",
                "Sound: On",
                "Final beeps: On",
                "Loop: Off",
                "",
                "What you experience:",
                "- You can prep sauce or set the colander while it runs.",
                "- In the last 5 seconds you get a quick countdown cue.",
                "- The end beep tells you to move immediately (drain / stop the heat).",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Oven check reminder (repeat every 10 minutes)"
              subtitle="Loop makes repeated checks hands-free"
              lines={[
                "Preset: 10m",
                "Sound: On",
                "Final beeps: Off (optional)",
                "Loop: On",
                "Fullscreen: Optional",
                "",
                "What you experience:",
                "- Timer counts down from 10:00 to 0:00 and beeps.",
                "- It instantly restarts to 10:00 again (Loop).",
                "- Each beep is your ‘check / rotate / baste’ reminder.",
                "",
                "When to stop looping:",
                "- Toggle Loop off (L), or hit Reset when you’re done checking.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Short pan task (90-second stir/flip reminder)"
              subtitle="One-tap common preset + clear finish"
              lines={[
                "Preset: 90s (set as 1m 30s using Minutes/Seconds)",
                "Sound: On",
                "Final beeps: Off",
                "Loop: Off",
                "",
                "What you experience:",
                "- You get a single end beep that’s easy to notice.",
                "- This works well for ‘flip once’ or ‘stir once’ tasks.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Rest time between steps (quiet kitchen)"
              subtitle="Silent fullscreen timer you can glance at"
              lines={[
                "Preset: 15m",
                "Sound: Off",
                "Final beeps: (disabled when Sound is off)",
                "Fullscreen: On",
                "",
                "What you experience:",
                "- Big digits with no audio, useful when someone is sleeping or you’re on a call.",
                "- The timer hits 0:00 silently. You decide when to check the screen.",
                "",
                "If you need an audio-free page by design:",
                "- Use Silent Timer for a strictly silent interface.",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Two pots, two timings (when you outgrow one timer)"
              subtitle="When to switch to Multiple Timers"
              lines={[
                "Example situation:",
                "- Pot A: 6-minute boil",
                "- Pot B: 12-minute simmer",
                "- Plus a 2-minute pan check",
                "",
                "Best fit:",
                "- Use Multiple Timers so each task has its own countdown and end cue.",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (control it with minimal effort)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen is designed for “glance time” while you move around. It
              makes the digits large and keeps controls reachable. If you’re
              using a laptop on the counter, keyboard shortcuts can be faster
              than clicking.
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
              If shortcuts do not respond, click the timer card once so it has
              keyboard focus. Shortcuts will not fire while your cursor is in a
              text or number input.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same goal, different fit)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Cooking Timer is a flexible kitchen countdown with presets,
                fullscreen, sound, and loop. If you need a more specific fit,
                these pages are better matches.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>S</Kbd>{" "}
              <Kbd>L</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/egg-timer")}>Egg Timer</PillLink>
            <PillLink href={abs("/tea-timer")}>Tea Timer</PillLink>
            <PillLink href={abs("/pizza-timer")}>Pizza Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/online-timer")}>Online Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (timing, sound, fullscreen, focus)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Notes that matter when you rely on a browser timer while cooking
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                End-time based countdown
              </div>
              <p className="mt-1 leading-relaxed">
                The timer targets a specific end moment and computes remaining
                time from that target. This helps avoid drift when the browser’s
                redraw speed varies.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Sound restrictions in browsers
              </div>
              <p className="mt-1 leading-relaxed">
                Sound uses the Web Audio API. Some browsers require a user
                gesture before audio plays. If Sound is enabled but you hear
                nothing, click Start once or press Space once to allow audio.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the timer card.
                Exit with Esc. If fullscreen fails due to device restrictions,
                the timer still works normally in windowed mode.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Keyboard focus and inputs
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are ignored while typing in an input. If shortcuts are
                not working, click the timer card once to give it focus, then
                use Space/R/F/S/L.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Background throttling and sleep
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may throttle timers in background tabs or when a device
                sleeps. When the tab resumes, the timer typically catches up to
                the correct remaining time. For the most reliable use, keep the
                timer tab visible and prevent the device from sleeping during
                longer timers.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Timing tea or coffee?</strong>{" "}
            For steep-focused presets, use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/tea-timer")}
            >
              Tea Timer
            </a>
            .
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need parallel timers for multiple dishes?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            to run separate countdowns with independent finishes.
          </div>
        </div>
      </div>
    </section>
  );
}
