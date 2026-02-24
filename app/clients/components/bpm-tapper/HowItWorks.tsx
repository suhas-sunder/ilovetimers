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
   - Scenario-based with concrete examples for /bpm-tapper.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/bpm-tapper",
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
    name: "How to use Tap BPM (instant tempo tapper + BPM counter)",
    description:
      "Tap to estimate beats per minute (BPM) quickly. Adjust auto-reset and hold behavior, lock results, copy BPM with details, and use fullscreen and keyboard shortcuts for fast tempo checking.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Tap a steady beat",
        text: "Tap/click anywhere on the tap area to register beats. Keep tapping for several beats to stabilize the BPM.",
      },
      {
        "@type": "HowToStep",
        name: "Let it settle, then lock or copy",
        text: "When the BPM stops bouncing, lock to keep it visible or copy to save the BPM along with ms/beat and session details.",
      },
      {
        "@type": "HowToStep",
        name: "Tune reset and hold",
        text: "Choose how quickly the tool resets after you pause, and how long it holds the last result on screen after the session ends.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen and shortcuts",
        text: "Press F for fullscreen, R to reset, C to copy, and Esc to exit fullscreen. Optionally enable Space/Enter tapping.",
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
              Tap BPM is a fast, no-setup tempo checker. You tap the beat, the
              page estimates beats per minute, and you can lock or copy the
              result when it feels right. It’s built for real usage: checking a
              song’s tempo by feel, matching a loop, picking a metronome value,
              or sanity-checking timing in milliseconds per beat.
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              This page is not a tutorial about music theory. The goal is
              practical: get a reliable BPM from taps, avoid accidental pauses
              messing up the number, and keep the result visible long enough to
              use it. If you want audible clicks at a fixed tempo, use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/metronome")}
              >
                Metronome
              </a>
              . If you want plain timing instead of tempo, use{" "}
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
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Tap anywhere
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Auto-reset
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Hold + lock
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              ms/beat
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Copy result
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
                <span className="font-semibold text-slate-900">1)</span> Tap a
                steady beat anywhere on the tap area. Aim for at least{" "}
                <span className="font-semibold text-slate-900">6–10 taps</span>{" "}
                if you want the number to settle.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Watch
                the BPM stabilize. The page shows{" "}
                <span className="font-semibold text-slate-900">ms/beat</span>{" "}
                and quick references for 8ths and 16ths.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <Kbd>C</Kbd> to copy, or use{" "}
                <span className="font-semibold text-slate-900">Lock</span> to
                freeze the result on screen.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> If you
                pause, the tool auto-ends the session after{" "}
                <span className="font-semibold text-slate-900">Reset</span>.
                After that, it holds the last result for{" "}
                <span className="font-semibold text-slate-900">Hold</span> (or
                clears immediately if Hold is off).
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> For
                distance viewing, press <Kbd>F</Kbd> for fullscreen. Press{" "}
                <Kbd>Esc</Kbd> to exit.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What “Reset”, “Hold”, and “Lock” actually do
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Reset</span>{" "}
                controls how long you can pause before the tap session ends. If
                you stop tapping longer than Reset, the tool stops listening for
                beats and treats the current BPM as the last result.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Hold</span>{" "}
                controls how long that last result stays visible after the
                session ends. This is for normal workflow: glance, copy, lock,
                or start again.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Lock</span>{" "}
                freezes the result and disables tapping until you unlock. Use it
                when you want a stable number on screen without worrying about
                accidental clicks or auto-clear.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Choose settings based on your situation
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                If you’re tapping a track with short pauses between phrases, set{" "}
                <span className="font-semibold">Reset</span> longer (like
                10–20s) so a brief pause doesn’t end your session.
              </li>
              <li>
                If you want quick, punchy reads while testing multiple tempos,
                set <span className="font-semibold">Reset</span> shorter (like
                2–4s) so each phrase starts clean.
              </li>
              <li>
                If you often copy to notes or messages, keep{" "}
                <span className="font-semibold">Hold</span> on (like 12–20s) so
                the result stays visible.
              </li>
              <li>
                If you just want the number and you reset immediately, turn{" "}
                <span className="font-semibold">Hold</span> off.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Practical tip:
              </span>{" "}
              If you’re consistently “late” or “early” on one beat, ignore the
              first couple taps and keep going. The estimate becomes steadier
              once you are locked into the groove.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you’ll see while tapping
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            The large number is your estimated BPM. Under it, you’ll see the
            timing breakdown: milliseconds per beat (ms/beat), and quick
            references for ms/8th and ms/16th. Those are computed from the same
            BPM: ms/beat is the duration of one beat, ms/8th is half that, and
            ms/16th is one quarter. This makes the page useful even when you are
            not thinking in BPM. If you are working with timing in a DAW or
            practicing subdivisions, “how many milliseconds per beat” is often
            the number you actually apply.
          </p>

          <p className="mt-3 text-slate-700 leading-relaxed">
            The session panel shows how many taps you made, how many intervals
            were used, and a simple stability label. That label is not a score
            to chase. It’s a quick signal: if you see “Wobbly,” you probably
            want a few more steady taps before you lock or copy. If you see
            “Steady,” you can trust the estimate more.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Real scenarios with numbers you might actually get
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            These examples are deliberately specific and realistic. They show
            the kind of BPM swings you see early on, how ms/beat maps to BPM,
            and when Lock and Copy become useful.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Tapping a song that feels like ~120 BPM"
              subtitle="You tap 8 beats and the estimate stabilizes"
              lines={[
                "You tap on the beat (8 taps).",
                "Valid intervals (ms) between taps:",
                "500, 498, 503, 496, 502, 501, 499",
                "",
                "Median interval ≈ 500 ms",
                "BPM ≈ 60000 / 500 = 120",
                "ms/beat ≈ 500",
                "ms/8th ≈ 250",
                "ms/16th ≈ 125",
                "",
                "Action:",
                "Once the BPM stops bouncing, press Lock to freeze, then press C to copy.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: A slower groove around ~90 BPM"
              subtitle="You pause briefly between phrases, so Reset matters"
              lines={[
                "You tap a chorus at a relaxed tempo.",
                "Intervals (ms): 665, 670, 661, 675, 668",
                "",
                "Median interval ≈ 668 ms",
                "BPM ≈ 60000 / 668 ≈ 90",
                "ms/beat ≈ 668",
                "ms/8th ≈ 334",
                "ms/16th ≈ 167",
                "",
                "If you stop for ~5 seconds between phrases:",
                "Set Reset to 10s or 20s so the session doesn’t auto-end too early.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Early taps are messy, then it settles"
              subtitle="Why the first few beats can look jumpy"
              lines={[
                "First 4 intervals (ms) are inconsistent:",
                "430, 520, 470, 510",
                "Early BPM readings swing roughly:",
                "140 → 115 → 128 → 118",
                "",
                "You keep tapping steadily for 8 more beats:",
                "500, 498, 501, 499, 502, 500, 499, 501",
                "Now the median is ~500 ms and the BPM stabilizes near 120.",
                "",
                "Action:",
                "Ignore the first couple swings, then lock once it settles.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Estimating step cadence by tapping"
              subtitle="A practical ‘rough check’ for pace"
              lines={[
                "You tap once per step while walking.",
                "Intervals (ms): 545, 560, 552, 548, 555, 550",
                "",
                "Median interval ≈ 551 ms",
                "BPM ≈ 60000 / 551 ≈ 109",
                "Interpretation:",
                "About 109 steps per minute (if tapping each step).",
                "",
                "If you tap every other step instead:",
                "Double the BPM to estimate step cadence.",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen, copy, and “keep it usable”
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen is for readability. The BPM becomes the focal point,
              with quick controls still available. This is useful in rehearsal,
              teaching, or studio setups where you are not sitting directly at
              the keyboard. Copy gives you a paste-ready note that includes the
              BPM and supporting session details. That is handy when you are
              communicating tempo to someone else or leaving yourself a clean
              note for later.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>R</Kbd> reset
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>C</Kbd> copy
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Esc</Kbd> exit
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Space</Kbd>/<Kbd>Enter</Kbd> tap (optional)
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Copy tip:</span> If
              you are comparing tempos, lock the first result, copy it, then
              unlock and tap the second phrase. Recent results lets you copy a
              previous reading quickly without re-tapping.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same intent, different output)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Use Tap BPM to discover a tempo. Use a metronome when you want
                consistent clicks, or a timer when you want elapsed time or a
                countdown.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>F</Kbd> <Kbd>R</Kbd> <Kbd>C</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/metronome")}>Metronome</PillLink>
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/reaction-time-test")}>
              Reaction Time Test
            </PillLink>
            <PillLink href={abs("/milliseconds-converter")}>
              Milliseconds Converter
            </PillLink>
            <PillLink href={abs("/time-calculator")}>Time Calculator</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (BPM math, filtering, stability, persistence)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                How the estimate is produced and why results can wobble early on
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                BPM calculation
              </div>
              <p className="mt-1 leading-relaxed">
                The tool converts your tap-to-tap intervals into BPM using 60000
                ÷ interval(ms). It uses the median of valid intervals rather
                than a simple mean, which makes the estimate less sensitive to
                one early or late tap.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Interval filtering
              </div>
              <p className="mt-1 leading-relaxed">
                Extremely short or long gaps between taps are ignored. This
                helps prevent accidental double-taps or long pauses from
                dominating the result.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Stability label
              </div>
              <p className="mt-1 leading-relaxed">
                Stability is estimated from how much your valid intervals vary.
                Lower spread reads as steadier; higher spread reads as wobbly.
                It’s meant as a quick signal, not a grade.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Reset, hold, and lock behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Reset ends the active session after inactivity. Hold keeps the
                last result visible after the session ends. Lock freezes the
                result and pauses automatic clearing and tap registration until
                you unlock.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Local persistence
              </div>
              <p className="mt-1 leading-relaxed">
                Your preferences (reset time, hold time, and whether Space/Enter
                taps are enabled) and recent results may be stored in your
                browser’s localStorage so they persist between visits. No
                account is required to use the tool.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Want consistent clicks?</strong>{" "}
            Tap to find the BPM, then use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/metronome")}
            >
              Metronome
            </a>{" "}
            to practice with a steady pulse.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need pure timing?</strong> Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/stopwatch")}
            >
              Stopwatch
            </a>{" "}
            for elapsed time or{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/countdown-timer")}
            >
              Countdown Timer
            </a>{" "}
            for a countdown to zero.
          </div>
        </div>
      </div>
    </section>
  );
}
